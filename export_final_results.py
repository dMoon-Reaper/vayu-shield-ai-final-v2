"""Canonical export entrypoint (delegates to model.py and model_diwali.py).

Kept for backward compatibility with scripts or documentation referencing
`python export_final_results.py` so `results.json` always contains the complete
evaluation, failure audit, and Diwali ablation schema from a single source of truth.
"""
import os
import runpy


def main():
    print("Delegating export to canonical pipeline: model.py ...")
    runpy.run_path("model.py", run_name="__main__")

    if os.path.exists("model_diwali.py"):
        print("\nUpdating results.json with 5-variant ablation: model_diwali.py ...")
        runpy.run_path("model_diwali.py", run_name="__main__")


if __name__ == "__main__":
    main()