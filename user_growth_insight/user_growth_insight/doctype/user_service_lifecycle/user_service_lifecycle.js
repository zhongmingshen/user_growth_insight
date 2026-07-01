frappe.ui.form.on('User Service Lifecycle', {
  refresh(frm) {
    frm.set_query('churn_reason', () => ({ filters: {} }));
  },
  service_status(frm) {
    if (frm.doc.service_status !== '流失') {
      frm.set_value('churn_reason', '');
      frm.set_value('churned_on', '');
    }
  },
});
