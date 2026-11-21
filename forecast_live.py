"""Live Next-Day PM2.5 Forecast Generator for New Delhi.

Fetches the latest ~14 days of PM2.5 station observations from OpenAQ (v3)
and weather parameters from Open-Meteo's Forecast API (in km/h matching training),
truncates strictly to the latest completed PM2.5 observation date (preventing
future PM2.5 fabrication), builds the shared feature vector from features.py,
and predicts tomorrow's PM2.5 with adaptive monthly conformal intervals.

Usage:
  python forecast_live.py
  python forecast_live.py --offline
  python forecast_live.py --offline --as-of 2026-11-12
"""
import argparse
import datetime
import json
import os
import sys
import time
from typing import Optional
import joblib
import numpy as np
import pandas as pd
import requests

from features import (
    DEFAULT_THRESHOLD,
    FEATURE_COLUMNS,
    WIND_SPEED_UNIT,
    compute_features,
    decode_log_ratio_prediction,
    evaluate_alert_rules,
    is_diwali_window,
    prepare_causal_dataframe,
)

LAT, LON = 28.6139, 77.2090
IST = datetime.timezone(datetime.timedelta(hours=5, minutes=30))


def fetch_live_weather(lat: float = LAT, lon: float = LON, days_back: int = 14) -> pd.DataFrame:
    """Fetch recent daily weather from Open-Meteo Forecast API in IST and km/h."""
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "past_days": days_back,
        "forecast_days": 1,
        "wind_speed_unit": WIND_SPEED_UNIT,
        "daily": (
            "temperature_2m_mean,wind_speed_10m_max,wind_direction_10m_dominant,"
            "precipitation_sum,relative_humidity_2m_mean,temperature_2m_max,temperature_2m_min"
        ),
        "timezone": "Asia/Kolkata",
    }
    r = requests.get(url, params=params, timeout=30)
    r.raise_for_status()
    df_wx = pd.DataFrame(r.json()["daily"])
    df_wx["time"] = pd.to_datetime(df_wx["time"])
    return df_wx.set_index("time").sort_index()


def fetch_live_openaq_pm25(sensor_id: int, api_key: str, days_back: int = 14) -> pd.Series:
    """Fetch recent completed daily PM2.5 from OpenAQ v3 sensor endpoint."""
    now_ist = datetime.datetime.now(IST)
    from_date = (now_ist - datetime.timedelta(days=days_back + 2)).strftime("%Y-%m-%d")
    to_date = now_ist.strftime("%Y-%m-%d")

    url = f"https://api.openaq.org/v3/sensors/{sensor_id}/days"
    headers = {"X-API-Key": api_key}
    params = {"date_from": from_date, "date_to": to_date, "limit": 100}

    time.sleep(1)
    r = requests.get(url, headers=headers, params=params, timeout=30)
    r.raise_for_status()
    results = r.json().get("results", [])

    out = {}
    for it in results:
        local_s = ((it.get("period") or {}).get("datetimeFrom") or {}).get("local")
        val = it.get("value")
        if local_s and val is not None and val >= 0:
            out[pd.to_datetime(local_s[:10])] = float(val)

    return pd.Series(out, dtype=float).sort_index()


def fetch_live_openmeteo_pm25(lat: float = LAT, lon: float = LON, days_back: int = 14) -> pd.Series:
    """Keyless fallback: recent daily PM2.5 from Open-Meteo Air Quality API."""
    url = "https://air-quality-api.open-meteo.com/v1/air-quality"
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": "pm2_5",
        "past_days": days_back,
        "timezone": "Asia/Kolkata",
    }
    r = requests.get(url, params=params, timeout=30)
    r.raise_for_status()
    df_hourly = pd.DataFrame(r.json().get("hourly", {}))
    df_hourly["time"] = pd.to_datetime(df_hourly["time"])
    return df_hourly.set_index("time")["pm2_5"].resample("D").mean().dropna()


def make_unavailable_payload(
    reason: str,
    generated_at: str,
    data_source: str,
    model_trained_through: str,
    issued_on: Optional[str] = None,
) -> dict:
    """Consistent schema for all unavailable/error states."""
    return {
        "status": "unavailable",
        "reason": reason,
        "generated_at": generated_at,
        "issued_on": issued_on,
        "forecast_for": None,
        "pm25_today": None,
        "model": None,
        "q80_width": None,
        "lower": None,
        "upper": None,
        "lower_80": None,
        "upper_80": None,
        "baseline": None,
        "alert": None,
        "alert_calibrated": None,
        "alert_point_forecast": None,
        "alert_80": None,
        "threshold": DEFAULT_THRESHOLD,
        "in_diwali_window": False,
        "data_source": data_source,
        "fallback_active": False,
        "uncertainty_warning": None,
        "model_trained_through": model_trained_through,
        "model_status": "offline",
    }


def write_latest_json(filepath: str, payload: dict):
    out_dir = os.path.dirname(filepath)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)
    with open(filepath, "w") as f:
        json.dump(payload, f, indent=2)
    print(f"Wrote {filepath}: status={payload.get('status')}")


def main():
    parser = argparse.ArgumentParser(description="Live Next-Day PM2.5 Forecast")
    parser.add_argument("--offline", action="store_true", help="Use local CSV data instead of network")
    parser.add_argument("--as-of", type=str, default=None, help="Target issued_on date YYYY-MM-DD for testing")
    parser.add_argument("--output", type=str, default="latest.json", help="Output JSON path")
    args = parser.parse_args()

    model_path = "models/model.joblib"
    meta_path = "models/meta.json"
    if not os.path.exists(model_path) or not os.path.exists(meta_path):
        sys.exit("ERROR: Frozen model or meta.json not found in models/. Run python train_and_save.py first.")

    model = joblib.load(model_path)
    with open(meta_path) as f:
        meta = json.load(f)

    feature_cols = meta.get("features", FEATURE_COLUMNS)
    target_mode = meta.get("target_mode", "log_ratio")
    q80_global = float(meta["q80"])
    monthly_q80 = meta.get("monthly_q80", {})
    model_trained_through = meta.get("model_trained_through", "unknown")
    now_utc_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    station_meta = {}
    if os.path.exists("data/station.json"):
        try:
            with open("data/station.json") as f:
                station_meta = json.load(f)
        except Exception:
            pass
    sensor_id = int(station_meta.get("sensor_id", 23534))
    loc_id = station_meta.get("loc_id", 8118)
    lat = float(station_meta.get("latitude", LAT))
    lon = float(station_meta.get("longitude", LON))

    fallback_active = False
    uncertainty_warning = None
    max_obs_date = None

    if args.offline:
        csv_path = "data/delhi_daily_openaq.csv"
        if not os.path.exists(csv_path):
            write_latest_json(
                args.output,
                make_unavailable_payload(
                    f"Offline data file {csv_path} not found.",
                    now_utc_iso,
                    "Offline CSV",
                    model_trained_through,
                ),
            )
            return
        raw_df = pd.read_csv(csv_path, parse_dates=["date"]).set_index("date").sort_index()
        data_source = "Offline CSV (data/delhi_daily_openaq.csv)"
    else:
        api_key = os.environ.get("OPENAQ_API_KEY")
        pm25_series = None
        data_source = None

        if api_key:
            try:
                pm25_series = fetch_live_openaq_pm25(sensor_id, api_key, days_back=14)
                data_source = f"OpenAQ Station {loc_id} (Sensor {sensor_id}) + Open-Meteo"
            except Exception as e:
                print(f"Notice: OpenAQ fetch failed ({e}), falling back to Open-Meteo Air Quality...")

        if pm25_series is None or len(pm25_series) == 0:
            try:
                pm25_series = fetch_live_openmeteo_pm25(lat=lat, lon=lon, days_back=14)
                data_source = "Open-Meteo Air Quality (CAMS Proxy) + Weather API"
                fallback_active = True
                uncertainty_warning = (
                    "OpenAQ ground-station telemetry was unavailable; forecast generated using "
                    "Open-Meteo CAMS proxy estimates (wider sensor-vs-reanalysis uncertainty applies)."
                )
            except Exception as e:
                print(f"Notice: Open-Meteo Air Quality fetch failed ({e}).")

        if pm25_series is None or len(pm25_series) == 0:
            write_latest_json(
                args.output,
                make_unavailable_payload(
                    "All live atmospheric APIs were unreachable.",
                    now_utc_iso,
                    "Unavailable",
                    model_trained_through,
                ),
            )
            return

        # Exclude today's partial IST day; only use fully completed daily readings
        today_ist_date = pd.to_datetime(datetime.datetime.now(IST).strftime("%Y-%m-%d"))
        pm25_series = pm25_series[pm25_series.index < today_ist_date]
        if len(pm25_series) == 0:
            write_latest_json(
                args.output,
                make_unavailable_payload(
                    "No completed IST daily PM2.5 observations available yet.",
                    now_utc_iso,
                    data_source,
                    model_trained_through,
                ),
            )
            return

        try:
            df_wx = fetch_live_weather(lat=lat, lon=lon, days_back=14)
        except Exception as e:
            write_latest_json(
                args.output,
                make_unavailable_payload(
                    f"Weather fetch failed: {e}",
                    now_utc_iso,
                    data_source,
                    model_trained_through,
                ),
            )
            return

        # CRITICAL FIX: Never keep future weather rows past the latest real PM2.5 date
        max_obs_date = pm25_series.index.max()
        raw_df = df_wx.loc[df_wx.index <= max_obs_date].join(pm25_series.rename("pm25"), how="left")

    feature_df, raw_pm25 = prepare_causal_dataframe(raw_df, ffill_limit=3, max_date=max_obs_date)
    X = compute_features(feature_df, include_diwali=False)

    if args.as_of:
        target_issued = pd.to_datetime(args.as_of)
        if target_issued not in X.index:
            write_latest_json(
                args.output,
                make_unavailable_payload(
                    f"Specified as-of date {args.as_of} not present in dataset.",
                    now_utc_iso,
                    data_source,
                    model_trained_through,
                    issued_on=args.as_of,
                ),
            )
            return
        eval_idx = target_issued
    else:
        valid_mask = (~X["pm25_today"].isna()) & (~raw_pm25.isna())
        valid_indices = X.index[valid_mask]
        if len(valid_indices) == 0:
            write_latest_json(
                args.output,
                make_unavailable_payload(
                    "Insufficient consecutive days to compute required lag features.",
                    now_utc_iso,
                    data_source,
                    model_trained_through,
                ),
            )
            return
        eval_idx = valid_indices[-1]

    feat_row = X.loc[[eval_idx], feature_cols]
    pm25_today_raw = float(feat_row["pm25_today"].iloc[0])
    if np.isnan(pm25_today_raw):
        write_latest_json(
            args.output,
            make_unavailable_payload(
                "pm25_today is missing for the selected issued_on date.",
                now_utc_iso,
                data_source,
                model_trained_through,
                issued_on=str(eval_idx.date()),
            ),
        )
        return

    raw_model_out = float(model.predict(feat_row)[0])
    if target_mode == "log_ratio":
        pred = float(decode_log_ratio_prediction(np.array([pm25_today_raw]), np.array([raw_model_out]))[0])
    else:
        pred = raw_model_out

    forecast_for_date = eval_idx + pd.Timedelta(days=1)
    q80_width = float(monthly_q80.get(str(forecast_for_date.month), q80_global))

    # Compute intervals & alerts on unrounded values for 100% parity with model.py
    lower_val = max(0.0, pred - q80_width)
    upper_val = pred + q80_width
    decisions = evaluate_alert_rules(pred, q80_width, DEFAULT_THRESHOLD)

    payload = {
        "status": "ok",
        "reason": None,
        "generated_at": now_utc_iso,
        "issued_on": str(eval_idx.date()),
        "forecast_for": str(forecast_for_date.date()),
        "pm25_today": float(np.round(pm25_today_raw, 1)),
        "model": float(np.round(pred, 1)),
        "q80_width": float(np.round(q80_width, 2)),
        "lower": float(np.round(lower_val, 1)),
        "upper": float(np.round(upper_val, 1)),
        "lower_80": float(np.round(lower_val, 1)),
        "upper_80": float(np.round(upper_val, 1)),
        "baseline": float(np.round(pm25_today_raw, 1)),
        "alert": decisions["calibrated"],
        "alert_calibrated": decisions["calibrated"],
        "alert_point_forecast": decisions["point"],
        "alert_80": decisions["conservative"],
        "threshold": DEFAULT_THRESHOLD,
        "in_diwali_window": is_diwali_window(forecast_for_date),
        "data_source": data_source,
        "fallback_active": fallback_active,
        "uncertainty_warning": uncertainty_warning,
        "model_trained_through": model_trained_through,
        "model_status": "active",
    }

    write_latest_json(args.output, payload)
    print(
        f"Forecast for {payload['forecast_for']} (issued {payload['issued_on']}): "
        f"{payload['model']} µg/m³ (Range: {payload['lower']}–{payload['upper']}) "
        f"Alert={payload['alert']} Fallback={payload['fallback_active']}"
    )


if __name__ == "__main__":
    main()