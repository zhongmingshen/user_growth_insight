frappe.listview_settings['User Service Lifecycle'] = {
  add_fields: ['service_status', 'risk_level', 'monthly_recurring_revenue', 'region'],
  get_indicator(doc) {
    if (doc.service_status === '流失') {
      return [__('流失'), 'red', 'service_status,=,流失'];
    }
    if (doc.service_status === '试用') {
      return [__('试用'), 'orange', 'service_status,=,试用'];
    }
    if (doc.risk_level === '高') {
      return [__('高风险'), 'yellow', 'risk_level,=,高'];
    }
    return [__('活跃'), 'green', 'service_status,=,活跃'];
  },
};
