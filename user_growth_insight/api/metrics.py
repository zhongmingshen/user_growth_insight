from __future__ import annotations

from collections import Counter, defaultdict
from datetime import date, datetime
from decimal import Decimal
from typing import Any, Iterable


DATE_FORMAT = "%Y-%m-%d"


def parse_date(value: Any) -> date | None:
    if not value:
        return None
    if isinstance(value, date):
        return value
    if isinstance(value, datetime):
        return value.date()
    return datetime.strptime(str(value), DATE_FORMAT).date()


def month_key(value: Any) -> str:
    parsed = parse_date(value)
    if not parsed:
        return ""
    return parsed.strftime("%Y-%m")


def decimal_to_float(value: Any) -> float:
    if value is None:
        return 0.0
    if isinstance(value, Decimal):
        return float(value)
    return float(value)


def normalize_record(record: Any) -> dict[str, Any]:
    if isinstance(record, dict):
        return record
    return {
        key: getattr(record, key, None)
        for key in [
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
    }


def record_matches_filters(record: dict[str, Any], filters: dict[str, Any] | None) -> bool:
    if not filters:
        return True

    opened_on = parse_date(record.get("opened_on"))
    churned_on = parse_date(record.get("churned_on"))
    from_date = parse_date(filters.get("from_date"))
    to_date = parse_date(filters.get("to_date"))

    if from_date and opened_on and opened_on < from_date and (not churned_on or churned_on < from_date):
        return False
    if to_date and opened_on and opened_on > to_date:
        return False

    for key in ("region", "channel", "plan", "service_status", "risk_level"):
        value = filters.get(key)
        if value and record.get(key) != value:
            return False

    return True


def aggregate_lifecycle(records: Iterable[Any], filters: dict[str, Any] | None = None) -> dict[str, Any]:
    normalized = [normalize_record(record) for record in records]
    filtered = [record for record in normalized if record_matches_filters(record, filters)]

    months = sorted(
        {
            key
            for record in filtered
            for key in (month_key(record.get("opened_on")), month_key(record.get("churned_on")))
            if key
        }
    )

    monthly = {
        key: {
            "month": key,
            "new_users": 0,
            "churned_users": 0,
            "net_growth": 0,
            "active_users": 0,
            "trial_users": 0,
            "mrr": 0.0,
            "churn_rate": 0.0,
        }
        for key in months
    }

    for record in filtered:
        opened_key = month_key(record.get("opened_on"))
        churned_key = month_key(record.get("churned_on"))
        if opened_key in monthly:
            monthly[opened_key]["new_users"] += 1
        if churned_key in monthly:
            monthly[churned_key]["churned_users"] += 1

    for key in months:
        month_end = datetime.strptime(f"{key}-28", DATE_FORMAT).date()
        active_records = [
            record
            for record in filtered
            if parse_date(record.get("opened_on"))
            and parse_date(record.get("opened_on")) <= month_end
            and (
                not parse_date(record.get("churned_on"))
                or parse_date(record.get("churned_on")) > month_end
            )
        ]
        active_users = [
            record
            for record in active_records
            if record.get("service_status") == "活跃"
            or not parse_date(record.get("churned_on"))
        ]
        trial_users = [record for record in active_records if record.get("service_status") == "试用"]
        monthly[key]["active_users"] = len(active_users)
        monthly[key]["trial_users"] = len(trial_users)
        monthly[key]["mrr"] = round(
            sum(decimal_to_float(record.get("monthly_recurring_revenue")) for record in active_users),
            2,
        )
        monthly[key]["net_growth"] = monthly[key]["new_users"] - monthly[key]["churned_users"]
        if active_users:
            monthly[key]["churn_rate"] = round(
                monthly[key]["churned_users"] / max(len(active_users) + monthly[key]["churned_users"], 1) * 100,
                2,
            )

    status_counts = Counter(record.get("service_status") or "未知" for record in filtered)
    region_counts = Counter(record.get("region") or "未知" for record in filtered)
    channel_counts = Counter(record.get("channel") or "未知" for record in filtered)
    plan_counts = Counter(record.get("plan") or "未知" for record in filtered)
    risk_counts = Counter(record.get("risk_level") or "未知" for record in filtered)
    churn_reasons = Counter(
        record.get("churn_reason") or "未流失"
        for record in filtered
        if record.get("service_status") == "流失"
    )

    active_now = [
        record
        for record in filtered
        if record.get("service_status") in ("活跃", "试用") and not record.get("churned_on")
    ]
    churned = [record for record in filtered if record.get("service_status") == "流失"]
    total_mrr = round(sum(decimal_to_float(record.get("monthly_recurring_revenue")) for record in active_now), 2)
    total_devices = sum(int(record.get("device_count") or 0) for record in active_now)

    owner_mrr: dict[str, float] = defaultdict(float)
    for record in active_now:
        owner_mrr[record.get("account_owner") or "未分配"] += decimal_to_float(
            record.get("monthly_recurring_revenue")
        )

    return {
        "filters": filters or {},
        "total_users": len(filtered),
        "active_users": len(active_now),
        "churned_users": len(churned),
        "trial_users": status_counts.get("试用", 0),
        "total_mrr": total_mrr,
        "total_devices": total_devices,
        "avg_mrr": round(total_mrr / len(active_now), 2) if active_now else 0,
        "logo_metric": round((len(active_now) - len(churned)) / max(len(filtered), 1) * 100, 2),
        "monthly": list(monthly.values()),
        "status_distribution": dict(status_counts),
        "region_distribution": dict(region_counts),
        "channel_distribution": dict(channel_counts),
        "plan_distribution": dict(plan_counts),
        "risk_distribution": dict(risk_counts),
        "churn_reasons": dict(churn_reasons),
        "owner_mrr": {key: round(value, 2) for key, value in owner_mrr.items()},
    }


def report_rows(records: Iterable[Any], filters: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    return aggregate_lifecycle(records, filters)["monthly"]
