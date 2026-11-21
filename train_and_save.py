"""Reproduce training from model.py and serialize the frozen log-ratio model
with out-of-fold monthly conformal quantiles.

Outputs:
  - models/model.joblib
  - models/meta.json
"""
import datetime
import json
import os
import joblib
import pandas as pd
import sklearn

from features import (
    DEFAULT_THRESHOLD,
    FEATURE_COLUMNS,
    WIND_SPEED_UNIT,
    compute_features,
    compute_oof_conformal_quantiles,
    encode_log_ratio_target,
    prepare_causal_dataframe,
)
from model import TEST_DAYS, make_model


def main():
    data_path = (
        "data/delhi_daily_openaq.csv"
        if os.path.exists("data/delhi_daily_openaq.csv")
        else "data/delhi_daily.csv"
    )
    print(f"Loading training dataset from: {data_path}")
    raw_df = pd.read_csv(data_path, parse_dates=["date"]).set_index("date").sort_index()

    feature_df, raw_pm25 = prepare_causal_dataframe(raw_df, ffill_limit=3)
    X = compute_features(feature_df, include_diwali=False)
    data = X.assign(target=raw_pm25.shift(-1)).dropna(subset=["pm25_today", "target"])

    train, test = data.iloc[:-TEST_DAYS], data.iloc[-TEST_DAYS:]
    print(f"Train date range: {train.index.min().date()} to {train.index.max().date()} ({len(train)} days)")
    print(f"Test  date range: {test.index.min().date()} to {test.index.max().date()} ({len(test)} days)")

    y_train_ratio = encode_log_ratio_target(train["pm25_today"].values, train["target"].values)
    gbm = make_model()
    gbm.fit(train[FEATURE_COLUMNS], y_train_ratio)

    # Strictly out-of-fold expanding-window conformal residual quantiles
    conformal = compute_oof_conformal_quantiles(train, FEATURE_COLUMNS, make_model, n_splits=5)
    print(f"Computed OOF conformal q80: {conformal['q80']:.2f} µg/m³ | q90: {conformal['q90']:.2f} µg/m³")

    os.makedirs("models", exist_ok=True)
    model_path = "models/model.joblib"
    joblib.dump(gbm, model_path)
    print(f"Saved model to: {model_path}")

    meta = {
        "model_name": "HistGradientBoostingRegressor",
        "target_mode": "log_ratio",
        "wind_speed_unit": WIND_SPEED_UNIT,
        "threshold": DEFAULT_THRESHOLD,
        "model_params": {
            "max_depth": 3,
            "learning_rate": 0.05,
            "max_iter": 300,
            "random_state": 0,
        },
        "features": FEATURE_COLUMNS,
        "feature_count": len(FEATURE_COLUMNS),
        "interval_method": "oof_monthly_conformal",
        "q80": conformal["q80"],
        "q90": conformal["q90"],
        "monthly_q80": conformal["monthly_q80"],
        "monthly_q90": conformal["monthly_q90"],
        "oof_sample_count": conformal["oof_sample_count"],
        "train_date_range": [str(train.index.min().date()), str(train.index.max().date())],
        "train_rows": int(len(train)),
        "test_rows": int(len(test)),
        "model_trained_through": str(train.index.max().date()),
        "sklearn_version": sklearn.__version__,
        "trained_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }

    meta_path = "models/meta.json"
    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2)
    print(f"Saved metadata to: {meta_path}")


if __name__ == "__main__":
    main()