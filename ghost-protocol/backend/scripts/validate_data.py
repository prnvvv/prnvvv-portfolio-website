"""Validate every JSON file in backend/data. Exit code 1 on errors.

Usage: python scripts/validate_data.py
"""
import _bootstrap  # noqa: F401
import sys

from app.config import get_settings
from app.rag.data_validator import validate_data_dir


def main() -> int:
    report = validate_data_dir(get_settings().data_path)
    for w in report.warnings:
        print(f"WARNING  {w}")
    for e in report.errors:
        print(f"ERROR    {e}")
    print(f"\n{report.files_checked} files checked, {len(report.errors)} errors, {len(report.warnings)} warnings")
    return 0 if report.ok else 1


if __name__ == "__main__":
    sys.exit(main())
