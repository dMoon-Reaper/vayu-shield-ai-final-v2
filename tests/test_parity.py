"""Stratified parity test: ensures offline live inference (forecast_live.py)
matches results.json across diverse held-out test days (first, cleanest,
borderline near 60 µg/m³, Diwali window, peak smog, and final day).
"""
import json
import os
import subprocess
import sys
import pytest


def _select_stratified_days(days: list, threshold: float = 60.0) -> list:
    """Pick representative days dynamically without hardcoded dates or values."""
    picked = {}

    def add(label, day_obj):
        if day_obj is not None:
            picked[day_obj["issued_on"]] = (label, day_obj)

    add("first_day", days[0])
    add("last_day", days[-1])
    add("cleanest_day", min(days, key=lambda d: d["actual"]))
    add("peak_day", max(days, key=lambda d: d["actual"]))
    add("borderline_day", min(days, key=lambda d: abs(d["model"] - threshold)))

    diwali_days = [d for d in days if d.get("in_diwali_window")]
    if diwali_days:
        add("diwali_day", diwali_days[0])

    return list(picked.values())


def test_offline_parity_with_results_json():
    csv_path = "data/delhi_daily_openaq.csv"
    if not os.path.exists(csv_path):
        pytest.skip(f"Test skipped: {csv_path} is absent.")

    results_file = "results.json"
    if not os.path.exists(results_file):
        pytest.fail(f"Missing {results_file} reference file.")

    with open(results_file) as f:
        results = json.load(f)

    threshold = float(results.get("threshold", 60))
    sample_days = _select_stratified_days(results["days"], threshold=threshold)
    assert len(sample_days) >= 3

    out_json = "tests/latest_test.json"
    os.makedirs("tests", exist_ok=True)

    for label, ref in sample_days:
        cmd = [
            sys.executable,
            "forecast_live.py",
            "--offline",
            "--as-of",
            ref["issued_on"],
            "--output",
            out_json,
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        assert res.returncode == 0, f"forecast_live.py failed on {label} ({ref['issued_on']}): {res.stderr}"

        with open(out_json) as f:
            live = json.load(f)

        assert live["status"] == "ok", f"Unexpected status on {label}"
        assert live["issued_on"] == ref["issued_on"]
        assert live["forecast_for"] == ref["date"]
        assert pytest.approx(live["model"], abs=0.1) == float(ref["model"])
        assert pytest.approx(live["baseline"], abs=0.1) == float(ref["baseline"])
        assert pytest.approx(live["lower_80"], abs=0.1) == float(ref["lower_80"])
        assert pytest.approx(live["upper_80"], abs=0.1) == float(ref["upper_80"])
        assert live["alert"] == bool(ref["alert"]), f"Alert mismatch on {label} ({ref['issued_on']})"
        assert live["alert_point_forecast"] == bool(ref["alert_point_forecast"])
        assert live["alert_80"] == bool(ref["alert_80"])
        assert live["in_diwali_window"] == bool(ref["in_diwali_window"])