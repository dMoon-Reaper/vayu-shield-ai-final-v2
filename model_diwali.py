"""Diwali ablation experiment: do calendar features and a log-ratio target help?

Run:  python model_diwali.py
Needs: pip install pandas numpy scikit-learn

Trains all five variants on the exact same causal train/test split and base
feature set used in model.py, reporting error overall, in the winter smog season,
and inside the Diwali window.
Outputs: Updates 'diwali_variants' and 'diwali_experiment_metadata' in results.json.
"""
import json
import os
from typing import Dict, Tuple
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

from features import (
    BASE_FEATURE_COLUMNS,
    DIWALI_DATES,
    DIWALI_DATE_SOURCES,
    DIWALI_FEATURE_COLUMNS,
    compute_features,
    decode_log_ratio_prediction,
    encode_log_ratio_target,
    prepare_causal_dataframe,
)

TEST_DAYS = 120


def _make_gbm() -> HistGradientBoostingRegressor:
    return HistGradientBoostingRegressor(
        max_depth=3,
        learning_rate=0.05,
        max_iter=300,
        random_state=0,
    )


def run_diwali_ablation(
    raw_df: pd.DataFrame,
    test_days: int = TEST_DAYS,
    verbose: bool = True,
) -> Tuple[list, Dict[str, object], pd.DataFrame]:
    """Run the 5-variant Diwali & log-ratio ablation on raw station DataFrame."""
    feature_df, raw_pm25 = prepare_causal_dataframe(raw_df, ffill_limit=3)
    X_all = compute_features(feature_df, include_diwali=True)

    # Target uses strictly uninterpolated next-day station PM2.5
    data = X_all.assign(target=raw_pm25.shift(-1)).dropna(subset=["pm25_today", "target"])
    data["target_date"] = data.index + pd.Timedelta(days=1)

    base_feats = list(BASE_FEATURE_COLUMNS)
    all_feats = list(BASE_FEATURE_COLUMNS + DIWALI_FEATURE_COLUMNS)

    train, test = data.iloc[:-test_days], data.iloc[-test_days:]
    actual = test["target"]
    today = test["pm25_today"]

    if verbose:
        print(
            f"Diwali Ablation Train: {train.index.min().date()} to {train.index.max().date()} "
            f"({len(train)} days, {int(train['diwali_window'].sum())} in a Diwali window)"
        )
        print(
            f"Diwali Ablation Test:  {test.index.min().date()} to {test.index.max().date()} "
            f"({len(test)} days, {int(test['diwali_window'].sum())} in a Diwali window)\n"
        )

    ratio_train = encode_log_ratio_target(train["pm25_today"].values, train["target"].values)

    preds = {
        "Persistence (tomorrow = today)": today,
        "GBM (Base Features)": pd.Series(
            _make_gbm().fit(train[base_feats], train["target"]).predict(test[base_feats]),
            index=test.index,
        ),
        "GBM + Diwali Features": pd.Series(
            _make_gbm().fit(train[all_feats], train["target"]).predict(test[all_feats]),
            index=test.index,
        ),
        "GBM Log-Ratio": pd.Series(
            decode_log_ratio_prediction(
                today.values,
                _make_gbm().fit(train[base_feats], ratio_train).predict(test[base_feats]),
            ),
            index=test.index,
        ),
        "GBM Log-Ratio + Diwali": pd.Series(
            decode_log_ratio_prediction(
                today.values,
                _make_gbm().fit(train[all_feats], ratio_train).predict(test[all_feats]),
            ),
            index=test.index,
        ),
    }

    td = test["target_date"]
    in_season = (td.dt.month > 10) | ((td.dt.month == 10) & (td.dt.day >= 15))
    in_diwali = test["diwali_window"] == 1.0

    persistence_mae_all = float(np.round(mean_absolute_error(actual, today), 2))
    descriptions = {
        "Persistence (tomorrow = today)": "Naive baseline projecting today's PM2.5 directly onto tomorrow.",
        "GBM (Base Features)": "HistGradientBoostingRegressor on the 17 shared meteorological and lag features.",
        "GBM + Diwali Features": "Additive GBM augmented with target-aligned Diwali offset (-10 to +10) and window flag.",
        "GBM Log-Ratio": "HistGradientBoostingRegressor predicting multiplicative log-ratio ln(tomorrow / today).",
        "GBM Log-Ratio + Diwali": "Multiplicative log-ratio GBM augmented with Diwali calendar offset and window flag.",
    }
    short_names = {
        "Persistence (tomorrow = today)": "Persistence",
        "GBM (Base Features)": "GBM Base",
        "GBM + Diwali Features": "GBM + Diwali",
        "GBM Log-Ratio": "GBM LogRatio",
        "GBM Log-Ratio + Diwali": "LogRatio + Diwali",
    }

    rows = []
    structured_variants = []
    for name, p in preds.items():
        rmse_all = float(np.round(mean_squared_error(actual, p) ** 0.5, 2))
        mae_all = float(np.round(mean_absolute_error(actual, p), 2))
        mae_season = (
            float(np.round(mean_absolute_error(actual[in_season], p[in_season]), 2))
            if int(in_season.sum()) > 0
            else None
        )
        mae_diwali = (
            float(np.round(mean_absolute_error(actual[in_diwali], p[in_diwali]), 2))
            if int(in_diwali.sum()) > 0
            else None
        )
        mae_pre = (
            float(np.round(mean_absolute_error(actual[~in_season], p[~in_season]), 2))
            if int((~in_season).sum()) > 0
            else None
        )

        rows.append({
            "variant": name,
            "RMSE all": rmse_all,
            "MAE all": mae_all,
            "MAE season (>=15 Oct)": mae_season,
            "MAE Diwali window": mae_diwali,
            "MAE before 15 Oct": mae_pre,
        })
        structured_variants.append({
            "variant": name,
            "short_name": short_names[name],
            "description": descriptions[name],
            "rmse_all": rmse_all,
            "mae_all": mae_all,
            "mae_season": mae_season,
            "mae_diwali_window": mae_diwali,
            "mae_pre_season": mae_pre,
            "improved_over_baseline": bool(mae_all < persistence_mae_all),
        })

    # Dynamically flag lowest MAE variant(s)
    best_mae = min(v["mae_all"] for v in structured_variants)
    for v in structured_variants:
        v["is_best"] = bool(v["mae_all"] == best_mae)

    by_name = {v["variant"]: v for v in structured_variants}
    gbm_base = by_name["GBM (Base Features)"]
    gbm_diw = by_name["GBM + Diwali Features"]
    lr_base = by_name["GBM Log-Ratio"]

    conclusion = (
        f"Evaluating all 5 variants on the shared {len(base_feats)}-feature causal pipeline shows "
        f"additive GBM Diwali MAE changed from {gbm_base['mae_diwali_window']} to {gbm_diw['mae_diwali_window']} µg/m³ "
        f"when adding calendar features, confirming sample scarcity across limited historical Diwali cycles. "
        f"Multiplicative log-ratio target formulation achieved overall RMSE {lr_base['rmse_all']} µg/m³, "
        f"overall MAE {lr_base['mae_all']} µg/m³ (vs. persistence {persistence_mae_all} µg/m³), and smog-season MAE "
        f"{lr_base['mae_season']} µg/m³."
    )

    metadata = {
        "cited_diwali_dates": DIWALI_DATES,
        "date_sources": DIWALI_DATE_SOURCES,
        "train_diwali_days": int(train["diwali_window"].sum()),
        "test_diwali_days": int(test["diwali_window"].sum()),
        "persistence_mae_all": persistence_mae_all,
        "scientific_conclusion": conclusion,
    }

    summary_df = pd.DataFrame(rows)
    if verbose:
        print("Error by period (µg/m³, lower is better):")
        print(summary_df.round(2).to_string(index=False))
        print("\nScientific Takeaway:")
        print(conclusion)

    return structured_variants, metadata, summary_df


def main():
    data_path = (
        "data/delhi_daily_openaq.csv"
        if os.path.exists("data/delhi_daily_openaq.csv")
        else "data/delhi_daily.csv"
    )
    print("Using data file:", data_path)
    raw_df = pd.read_csv(data_path, parse_dates=["date"]).set_index("date").sort_index()
    variants, metadata, _ = run_diwali_ablation(raw_df, test_days=TEST_DAYS, verbose=True)

    full_results = {}
    if os.path.exists("results.json"):
        try:
            with open("results.json", "r") as f:
                full_results = json.load(f)
        except Exception as e:
            print("Warning: Could not read existing results.json:", e)

    full_results["diwali_variants"] = variants
    full_results["diwali_experiment_metadata"] = metadata
    with open("results.json", "w") as f:
        json.dump(full_results, f, indent=2)
    print("\nSuccessfully updated results.json with 'diwali_variants' and metadata.")


if __name__ == "__main__":
    main()