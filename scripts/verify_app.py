from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path


sys.dont_write_bytecode = True

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "user_growth_insight"
APP_MODULE = PACKAGE / "user_growth_insight"


REQUIRED_FILES = [
    ROOT / "pyproject.toml",
    ROOT / "README.md",
    PACKAGE / "hooks.py",
    PACKAGE / "modules.txt",
    APP_MODULE / "doctype/user_service_lifecycle/user_service_lifecycle.json",
    APP_MODULE / "report/user_growth_overview/user_growth_overview.json",
    APP_MODULE / "report/user_growth_overview/user_growth_overview.py",
    APP_MODULE / "report/user_growth_overview/user_growth_overview.js",
    APP_MODULE / "page/user_growth_dashboard/user_growth_dashboard.json",
    APP_MODULE / "page/user_growth_dashboard/user_growth_dashboard.js",
    PACKAGE / "public/css/user_growth_dashboard.css",
    PACKAGE / "data/user_service_lifecycle_mock.json",
]


def fail(message: str) -> None:
    print(f"FAIL: {message}", file=sys.stderr)
    raise SystemExit(1)


def load_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        fail(f"{path} is not valid JSON: {exc}")


def import_metrics():
    path = PACKAGE / "api/metrics.py"
    spec = importlib.util.spec_from_file_location("ugi_metrics", path)
    if not spec or not spec.loader:
        fail("cannot import metrics module")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> None:
    for path in REQUIRED_FILES:
        if not path.exists():
            fail(f"missing required file: {path}")

    doctype = load_json(APP_MODULE / "doctype/user_service_lifecycle/user_service_lifecycle.json")
    if doctype.get("name") != "User Service Lifecycle":
        fail("doctype name mismatch")

    fieldnames = {field.get("fieldname") for field in doctype.get("fields", [])}
    required_fields = {
        "user_id",
        "user_name",
        "region",
        "channel",
        "plan",
        "service_status",
        "opened_on",
        "churned_on",
        "monthly_recurring_revenue",
        "device_count",
        "risk_level",
        "churn_reason",
    }
    missing_fields = required_fields - fieldnames
    if missing_fields:
        fail(f"doctype missing fields: {sorted(missing_fields)}")

    report = load_json(APP_MODULE / "report/user_growth_overview/user_growth_overview.json")
    if report.get("report_type") != "Script Report":
        fail("report is not a Script Report")
    if report.get("ref_doctype") != "User Service Lifecycle":
        fail("report ref_doctype mismatch")

    page = load_json(APP_MODULE / "page/user_growth_dashboard/user_growth_dashboard.json")
    if page.get("name") != "user-growth-dashboard":
        fail("page route mismatch")

    records = load_json(PACKAGE / "data/user_service_lifecycle_mock.json")
    if len(records) < 60:
        fail(f"mock data too small: {len(records)}")
    if {record.get("doctype") for record in records} != {"User Service Lifecycle"}:
        fail("mock data contains unexpected doctype")

    statuses = {record.get("service_status") for record in records}
    if not {"活跃", "试用", "流失"}.issubset(statuses):
        fail("mock data must include active, trial, and churned users")

    metrics = import_metrics()
    summary = metrics.aggregate_lifecycle(records)
    if not summary["monthly"]:
        fail("aggregation returned no monthly rows")
    if summary["active_users"] <= 0 or summary["churned_users"] <= 0:
        fail("aggregation did not produce active and churned users")
    if summary["total_mrr"] <= 0:
        fail("aggregation did not produce positive MRR")
    if not summary["region_distribution"] or not summary["channel_distribution"]:
        fail("aggregation missing region or channel distribution")

    required_readme_terms = [
        "bench get-app",
        "install-app user_growth_insight",
        "User Service Lifecycle",
        "User Growth Overview",
        "/app/user-growth-dashboard",
    ]
    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    missing_terms = [term for term in required_readme_terms if term not in readme]
    if missing_terms:
        fail(f"README missing terms: {missing_terms}")

    print("PASS: app structure, JSON, mock data, README, and aggregation checks passed")
    print(
        "SUMMARY:",
        {
            "records": len(records),
            "months": len(summary["monthly"]),
            "active_users": summary["active_users"],
            "churned_users": summary["churned_users"],
            "total_mrr": summary["total_mrr"],
        },
    )


if __name__ == "__main__":
    main()
