"""Shared feature engineering, causal preprocessing, target transform, and
decision-rule module for PM2.5 forecasting in New Delhi.

Used by training (model.py, model_diwali.py, train_and_save.py),
live inference (forecast_live.py), and parity testing (tests/test_parity.py)
to guarantee zero train/serve skew and zero look-ahead leakage.
"""
from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd

DEFAULT_THRESHOLD = 60
THRESHOLDS = [35, 60, 90, 120, 250]

# Open-Meteo Archive and Forecast APIs return wind_speed_10m_max in km/h by default.
# 1.5 m/s * 3.6 = 5.4 km/h. Standardizing explicitly on km/h prevents unit mismatch.
WIND_SPEED_UNIT = "kmh"
CALM_WIND_THRESHOLD_KMH = 5.4
PM25_LOG_FLOOR = 1.0

# Diwali (Lakshmi Puja) dates in New Delhi (Source: Drik Panchang / Indian Astronomical Ephemeris)
DIWALI_DATES = ["2023-11-12", "2024-10-31", "2025-10-20", "2026-11-08"]
DIWALI_DATE_SOURCES = [
    {"year": "2023", "date": "2023-11-12", "source": "Drik Panchang / Indian Astronomical Ephemeris"},
    {"year": "2024", "date": "2024-10-31", "source": "Drik Panchang / Indian Astronomical Ephemeris"},
    {"year": "2025", "date": "2025-10-20", "source": "Drik Panchang / Indian Astronomical Ephemeris"},
    {"year": "2026", "date": "2026-11-08", "source": "Drik Panchang / National Calendar of India"},
]

# Production feature set (17 meteorological + autoregressive features).
# Diwali calendar features are kept separate for ablation in model_diwali.py so
# production and ablation share the exact same base feature matrix.
BASE_FEATURE_COLUMNS = [
    "pm25_today",
    "pm25_lag1",
    "pm25_lag2",
    "pm25_lag3",
    "pm25_lag6",
    "pm25_mean3",
    "pm25_mean7",
    "temp",
    "wind_speed",
    "wind_dir_sin",
    "wind_dir_cos",
    "rain",
    "season_sin",
    "season_cos",
    "humidity",
    "temp_range",
    "wind_calm",
]

DIWALI_FEATURE_COLUMNS = [
    "diwali_offset",
    "diwali_window",
]

FEATURE_COLUMNS = list(BASE_FEATURE_COLUMNS)


def prepare_causal_dataframe(
    raw_df: pd.DataFrame,
    ffill_limit: int = 3,
    max_date: Optional[pd.Timestamp] = None,
) -> Tuple[pd.DataFrame, pd.Series]:
    """Reindex daily data on a calendar grid using strictly causal forward-fill.

    Prevents two leakage/production bugs:
    1. Bidirectional linear interpolation peeking at tomorrow's PM2.5 (t+1).
    2. Forward-filling PM2.5 into future weather forecast dates during live inference.

    Returns:
      - feature_df: Calendar-indexed DataFrame with causal ffill(limit=ffill_limit)
        for feature computation.
      - raw_pm25: Uninterpolated calendar-indexed PM2.5 series for ground-truth targets.
    """
    df_sorted = raw_df.sort_index()
    if max_date is not None:
        df_sorted = df_sorted.loc[df_sorted.index <= max_date]

    daily_raw = df_sorted.asfreq("D")
    raw_pm25 = daily_raw["pm25"].copy()
    feature_df = daily_raw.ffill(limit=ffill_limit)
    return feature_df, raw_pm25


def is_diwali_window(target_date: pd.Timestamp) -> bool:
    """Return True if target_date falls within [-2, +5] days of a known Diwali date."""
    diwali_dt = pd.to_datetime(DIWALI_DATES)
    diffs = [(target_date - d).days for d in diwali_dt]
    closest_offset = min(diffs, key=abs)
    return bool(-2 <= closest_offset <= 5)


def compute_features(
    df: pd.DataFrame,
    include_diwali: bool = False,
) -> pd.DataFrame:
    """Build feature matrix from daily PM2.5 and Open-Meteo weather data.

    All calendar-ahead features (diwali_offset, diwali_window) are aligned to
    target_date = df.index + 1 day (the day being forecast), which is known in
    advance with zero leakage.
    """
    X = pd.DataFrame(index=df.index)
    X["pm25_today"] = df["pm25"]
    for k in (1, 2, 3, 6):
        X[f"pm25_lag{k}"] = df["pm25"].shift(k)
    X["pm25_mean3"] = df["pm25"].rolling(3).mean()
    X["pm25_mean7"] = df["pm25"].rolling(7).mean()

    X["temp"] = df["temperature_2m_mean"]
    X["wind_speed"] = df["wind_speed_10m_max"]
    rad = np.deg2rad(df["wind_direction_10m_dominant"])
    X["wind_dir_sin"] = np.sin(rad)
    X["wind_dir_cos"] = np.cos(rad)
    X["rain"] = df["precipitation_sum"]

    doy = df.index.dayofyear
    X["season_sin"] = np.sin(2 * np.pi * doy / 365.25)
    X["season_cos"] = np.cos(2 * np.pi * doy / 365.25)

    if "relative_humidity_2m_mean" in df.columns:
        X["humidity"] = df["relative_humidity_2m_mean"]
    else:
        X["humidity"] = np.nan

    if "temperature_2m_max" in df.columns and "temperature_2m_min" in df.columns:
        X["temp_range"] = df["temperature_2m_max"] - df["temperature_2m_min"]
    else:
        X["temp_range"] = np.nan

    if "wind_speed_10m_max" in df.columns:
        X["wind_calm"] = (df["wind_speed_10m_max"] < CALM_WIND_THRESHOLD_KMH).astype(float)
    else:
        X["wind_calm"] = np.nan

    if include_diwali:
        diwali_dt = pd.to_datetime(DIWALI_DATES)
        target_dates = df.index + pd.Timedelta(days=1)
        diffs = np.array([[(td - d).days for d in diwali_dt] for td in target_dates])
        offset = diffs[np.arange(len(diffs)), np.abs(diffs).argmin(axis=1)]
        X["diwali_offset"] = np.clip(offset, -10, 10).astype(float)
        X["diwali_window"] = ((offset >= -2) & (offset <= 5)).astype(float)
        cols = BASE_FEATURE_COLUMNS + DIWALI_FEATURE_COLUMNS
    else:
        cols = BASE_FEATURE_COLUMNS

    return X[cols]


def encode_log_ratio_target(pm25_today: np.ndarray, target_pm25: np.ndarray) -> np.ndarray:
    """Compute multiplicative log-ratio target ln(tomorrow / today)."""
    today_safe = np.maximum(np.asarray(pm25_today, dtype=float), PM25_LOG_FLOOR)
    target_safe = np.maximum(np.asarray(target_pm25, dtype=float), PM25_LOG_FLOOR)
    return np.log(target_safe / today_safe)


def decode_log_ratio_prediction(pm25_today: np.ndarray, pred_log_ratio: np.ndarray) -> np.ndarray:
    """Invert multiplicative log-ratio prediction back to PM2.5 (µg/m³)."""
    today_safe = np.maximum(np.asarray(pm25_today, dtype=float), PM25_LOG_FLOOR)
    return today_safe * np.exp(np.asarray(pred_log_ratio, dtype=float))


def compute_oof_conformal_quantiles(
    train_df: pd.DataFrame,
    feature_cols: List[str],
    model_factory,
    n_splits: int = 5,
    min_month_samples: int = 10,
) -> Dict[str, object]:
    """Compute out-of-fold expanding-window residuals for conformal intervals.

    Uses strictly out-of-fold predictions on the training split (zero test leakage)
    to derive overall and monthly 80th/90th percentile absolute residual widths.
    """
    n_rows = len(train_df)
    fold_size = max(30, n_rows // (n_splits + 1))

    oof_resids = []
    oof_months = []

    for fold in range(n_splits):
        val_start = (fold + 1) * fold_size
        val_end = min(val_start + fold_size, n_rows)
        if val_start >= n_rows or (val_end - val_start) < 10:
            break

        tr = train_df.iloc[:val_start]
        va = train_df.iloc[val_start:val_end]

        y_tr = encode_log_ratio_target(tr["pm25_today"].values, tr["target"].values)
        m = model_factory()
        m.fit(tr[feature_cols], y_tr)
        preds = decode_log_ratio_prediction(va["pm25_today"].values, m.predict(va[feature_cols]))

        resids = np.abs(va["target"].values - preds)
        target_months = (va.index + pd.Timedelta(days=1)).month
        oof_resids.extend(resids.tolist())
        oof_months.extend(target_months.tolist())

    oof_resids_arr = np.asarray(oof_resids, dtype=float)
    oof_months_arr = np.asarray(oof_months, dtype=int)

    q80_global = float(np.round(np.quantile(oof_resids_arr, 0.80), 4))
    q90_global = float(np.round(np.quantile(oof_resids_arr, 0.90), 4))

    monthly_q80: Dict[str, float] = {}
    monthly_q90: Dict[str, float] = {}
    for month in range(1, 13):
        mask = oof_months_arr == month
        if int(np.sum(mask)) >= min_month_samples:
            monthly_q80[str(month)] = float(np.round(np.quantile(oof_resids_arr[mask], 0.80), 2))
            monthly_q90[str(month)] = float(np.round(np.quantile(oof_resids_arr[mask], 0.90), 2))
        else:
            monthly_q80[str(month)] = float(np.round(q80_global, 2))
            monthly_q90[str(month)] = float(np.round(q90_global, 2))

    return {
        "q80": q80_global,
        "q90": q90_global,
        "monthly_q80": monthly_q80,
        "monthly_q90": monthly_q90,
        "oof_sample_count": int(len(oof_resids_arr)),
    }


def evaluate_alert_rules(
    pred: float,
    q80_width: float,
    threshold: float = DEFAULT_THRESHOLD,
) -> Dict[str, bool]:
    """Single canonical operational decision rules shared by offline & live code.

    Guarantees strict monotonicity: conservative >= calibrated >= point.
      - point:        pred >= threshold
      - calibrated:   pred + 0.5 * q80_width >= threshold  (Mid-Risk rule)
      - conservative: pred + q80_width >= threshold        (80% Upper Bound rule)
    """
    return {
        "point": bool(pred >= threshold),
        "calibrated": bool((pred + 0.5 * q80_width) >= threshold),
        "conservative": bool((pred + q80_width) >= threshold),
    }