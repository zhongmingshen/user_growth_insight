frappe.provide('user_growth_insight');

user_growth_insight.ensure_desk_shortcuts = function () {
  if (!frappe.boot || !frappe.boot.user || frappe.boot.user === 'Guest') return;
  if ($('.ugi-desk-jump').length) return;

  const links = [
    { label: __('增长大屏'), route: '/app/user-growth-dashboard' },
    { label: __('增长报表'), route: '/app/query-report/User%20Growth%20Overview' },
    { label: __('生命周期'), route: '/app/user-service-lifecycle' },
  ];

  const bar = $(`
    <nav class="ugi-desk-jump" aria-label="${__('User Growth Insight shortcuts')}">
      ${links.map((link) => `<a href="${link.route}">${link.label}</a>`).join('')}
    </nav>
  `);

  $('body').append(bar);
};

$(document).on('page-change', user_growth_insight.ensure_desk_shortcuts);
$(document).ready(user_growth_insight.ensure_desk_shortcuts);
