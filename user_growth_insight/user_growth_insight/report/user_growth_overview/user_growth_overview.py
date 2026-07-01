from __future__ import annotations

from frappe import _

from user_growth_insight.api.dashboard import get_records
from user_growth_insight.api.metrics import aggregate_lifecycle


def execute(filters=None):
    filters = filters or {}
    records = get_records(filters)
    summary = aggregate_lifecycle(records, filters)
    columns = get_columns()
    data = summary["monthly"]
    chart = get_chart(data)
    report_summary = get_report_summary(summary)
    return columns, data, None, chart, report_summary


def get_columns():
    return [
        {"fieldname": "month", "label": _("月份"), "fieldtype": "Data", "width": 110},
        {"fieldname": "new_users", "label": _("新增用户"), "fieldtype": "Int", "width": 110},
        {"fieldname": "churned_users", "label": _("流失用户"), "fieldtype": "Int", "width": 110},
        {"fieldname": "net_growth", "label": _("净增长"), "fieldtype": "Int", "width": 110},
        {"fieldname": "active_users", "label": _("活跃用户"), "fieldtype": "Int", "width": 110},
        {"fieldname": "trial_users", "label": _("试用用户"), "fieldtype": "Int", "width": 110},
        {"fieldname": "mrr", "label": _("月经常性收入"), "fieldtype": "Currency", "width": 150},
        {"fieldname": "churn_rate", "label": _("流失率 %"), "fieldtype": "Percent", "width": 110},
    ]


def get_chart(data):
    return {
        "data": {
            "labels": [row["month"] for row in data],
            "datasets": [
                {"name": _("新增用户"), "values": [row["new_users"] for row in data]},
                {"name": _("流失用户"), "values": [row["churned_users"] for row in data]},
                {"name": _("净增长"), "values": [row["net_growth"] for row in data]},
            ],
        },
        "type": "line",
        "height": 280,
        "colors": ["#c2ef4e", "#fa7faa", "#7170ff"],
    }


def get_report_summary(summary):
    return [
        {"value": summary["total_users"], "label": _("样本用户"), "datatype": "Int"},
        {"value": summary["active_users"], "label": _("当前活跃"), "datatype": "Int"},
        {"value": summary["churned_users"], "label": _("累计流失"), "datatype": "Int"},
        {"value": summary["total_mrr"], "label": _("当前 MRR"), "datatype": "Currency"},
        {"value": summary["avg_mrr"], "label": _("平均 MRR"), "datatype": "Currency"},
    ]
