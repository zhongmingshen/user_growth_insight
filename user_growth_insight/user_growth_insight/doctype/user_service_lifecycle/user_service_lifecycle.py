import frappe
from frappe.model.document import Document


class UserServiceLifecycle(Document):
    def validate(self):
        if self.service_status == "流失" and not self.churned_on:
            frappe.throw("流失用户必须填写流失日期")
        if self.churned_on and self.opened_on and self.churned_on < self.opened_on:
            frappe.throw("流失日期不能早于开通日期")
        if self.service_status != "流失":
            self.churn_reason = ""
