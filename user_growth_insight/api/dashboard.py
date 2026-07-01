from __future__ import annotations

import frappe

from user_growth_insight.api.metrics import aggregate_lifecycle


DOCTYPE = "User Service Lifecycle"
FIELDS = [
    "name",
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
    "account_owner",
]


def build_db_filters(filters: dict | None = None) -> dict:
    filters = filters or {}
    db_filters = {}
    for key in ("region", "channel", "plan", "service_status", "risk_level"):
        if filters.get(key):
            db_filters[key] = filters[key]
    return db_filters


def get_records(filters: dict | None = None):
    return frappe.get_all(
        DOCTYPE,
        fields=FIELDS,
        filters=build_db_filters(filters),
        order_by="opened_on asc",
    )


@frappe.whitelist()
def get_dashboard_data(filters=None):
    if isinstance(filters, str):
        filters = frappe.parse_json(filters)
    records = get_records(filters)
    return aggregate_lifecycle(records, filters)


@frappe.whitelist()
def get_growth_series(filters=None):
    return get_dashboard_data(filters).get("monthly", [])
