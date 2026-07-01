from __future__ import annotations

import json
from pathlib import Path

import frappe


DATA_FILE = Path(__file__).resolve().parents[1] / "data" / "user_service_lifecycle_mock.json"


def after_install():
    seed_user_service_lifecycle()


def load_mock_records() -> list[dict]:
    with DATA_FILE.open("r", encoding="utf-8") as file:
        return json.load(file)


def seed_user_service_lifecycle() -> dict[str, int]:
    inserted = 0
    skipped = 0
    for row in load_mock_records():
        name = row["name"]
        if frappe.db.exists("User Service Lifecycle", name):
            skipped += 1
            continue
        doc = frappe.get_doc(row)
        doc.flags.ignore_permissions = True
        doc.insert()
        inserted += 1

    frappe.db.commit()
    return {"inserted": inserted, "skipped": skipped}
