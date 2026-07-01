frappe.listview_settings['User Service Lifecycle'] = {
  add_fields: ['service_status', 'risk_level', 'monthly_recurring_revenue', 'region'],
  onload(listview) {
    listview.page.add_inner_button(__('增长大屏'), () => {
      frappe.set_route('user-growth-dashboard');
    });
    listview.page.add_inner_button(__('增长报表'), () => {
      frappe.set_route('query-report', 'User Growth Overview');
    });
  },
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
