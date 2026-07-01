frappe.provide('user_growth_insight');

user_growth_insight.get_route_key = function () {
  const route = frappe.get_route_str
    ? frappe.get_route_str()
    : (frappe.get_route ? frappe.get_route().join('/') : '');
  const fallback = document.body.getAttribute('data-route') || '';
  return decodeURIComponent(route || fallback || '').toLowerCase();
};

user_growth_insight.ensure_desk_styles = function () {
  if ($('#ugi-desk-runtime-style').length) return;

  $('head').append(`
    <style id="ugi-desk-runtime-style">
      .ugi-desk-jump {
        position: fixed !important;
        right: 22px !important;
        bottom: 22px !important;
        z-index: 1040 !important;
        display: flex !important;
        gap: 8px !important;
        padding: 8px !important;
        border: 1px solid rgba(17, 24, 39, 0.12) !important;
        border-radius: 12px !important;
        background: rgba(8, 10, 12, 0.86) !important;
        box-shadow: 0 18px 44px rgba(0, 0, 0, 0.22) !important;
        backdrop-filter: blur(16px) saturate(150%) !important;
      }

      .ugi-desk-jump a {
        min-width: 76px !important;
        padding: 8px 10px !important;
        border-radius: 8px !important;
        color: #ecfdf5 !important;
        font-size: 12px !important;
        font-weight: 650 !important;
        line-height: 1 !important;
        text-align: center !important;
        text-decoration: none !important;
        white-space: nowrap !important;
      }

      .ugi-desk-jump a:first-child {
        color: #101405 !important;
        background: #c2ef4e !important;
        box-shadow: 0 0 24px rgba(194, 239, 78, 0.35) !important;
      }

      .ugi-desk-jump a:not(:first-child) {
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        background: rgba(255, 255, 255, 0.06) !important;
      }

      body.ugi-route-dashboard,
      body.ugi-route-growth-report,
      body.ugi-route-lifecycle {
        overflow: hidden !important;
      }

      body.ugi-route-dashboard .ugi-desk-jump {
        display: none !important;
      }

      body.ugi-route-dashboard .page-head {
        min-height: 52px !important;
      }

      body.ugi-route-dashboard .page-head .page-title {
        min-height: 40px !important;
      }

      body.ugi-route-dashboard .page-form {
        padding-top: 4px !important;
        padding-bottom: 4px !important;
      }

      body.ugi-route-dashboard .page-content,
      body.ugi-route-dashboard .layout-main-section {
        overflow: hidden !important;
      }

      body.ugi-route-dashboard .ugi-screen {
        box-sizing: border-box !important;
        height: calc(100vh - 148px) !important;
        min-height: 0 !important;
        overflow: hidden !important;
        margin: -15px -15px 0 !important;
        padding: 18px 28px 20px !important;
        background:
          radial-gradient(circle at 12% 12%, rgba(113, 112, 255, 0.2), transparent 28%),
          radial-gradient(circle at 82% 18%, rgba(194, 239, 78, 0.1), transparent 24%),
          linear-gradient(135deg, #121827 0%, #060809 52%, #171023 100%) !important;
      }

      body.ugi-route-dashboard .ugi-hero {
        margin-bottom: 10px !important;
      }

      body.ugi-route-dashboard .ugi-hero h1 {
        margin: 4px 0 0 !important;
        color: rgba(247, 248, 248, 0.82) !important;
        font-size: clamp(30px, 3vw, 42px) !important;
        font-weight: 520 !important;
        line-height: 1 !important;
        letter-spacing: 0 !important;
      }

      body.ugi-route-dashboard .ugi-kpis {
        grid-template-columns: repeat(5, minmax(130px, 1fr)) !important;
        gap: 10px !important;
        margin-bottom: 10px !important;
      }

      body.ugi-route-dashboard .ugi-kpi {
        min-height: 92px !important;
        padding: 12px 14px !important;
      }

      body.ugi-route-dashboard .ugi-kpi strong {
        margin-top: 8px !important;
        font-size: clamp(24px, 2vw, 32px) !important;
      }

      body.ugi-route-dashboard .ugi-kpi em {
        margin-top: 5px !important;
      }

      body.ugi-route-dashboard .ugi-main {
        height: calc(100% - 200px) !important;
        display: grid !important;
        grid-template-columns: minmax(0, 1.5fr) minmax(245px, 0.72fr) minmax(245px, 0.72fr) !important;
        grid-template-rows: repeat(2, minmax(0, 1fr)) !important;
        gap: 10px !important;
      }

      body.ugi-route-dashboard .ugi-panel {
        min-height: 0 !important;
        padding: 14px 15px !important;
      }

      body.ugi-route-dashboard .ugi-panel-large {
        grid-column: 1 !important;
        grid-row: 1 / span 2 !important;
        min-height: 0 !important;
      }

      body.ugi-route-dashboard .ugi-panel-head {
        margin-bottom: 10px !important;
      }

      body.ugi-route-dashboard .ugi-line-chart {
        height: calc(100% - 34px) !important;
        min-height: 0 !important;
      }

      body.ugi-route-dashboard .ugi-orbit {
        min-height: 0 !important;
        height: calc(100% - 34px) !important;
      }

      body.ugi-route-dashboard .ugi-orbit-node {
        transform: scale(0.84) !important;
        transform-origin: center !important;
      }

      body.ugi-route-growth-report .page-content,
      body.ugi-route-growth-report .layout-main-section {
        height: calc(100vh - 126px) !important;
        overflow: hidden !important;
      }

      body.ugi-route-growth-report .page-form {
        padding-top: 6px !important;
        padding-bottom: 6px !important;
      }

      body.ugi-route-growth-report .report-summary {
        margin: 10px 0 8px !important;
        display: grid !important;
        grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
        gap: 8px !important;
      }

      body.ugi-route-growth-report .report-summary .summary-item {
        min-height: 54px !important;
        padding: 8px 10px !important;
      }

      body.ugi-route-growth-report .chart-wrapper {
        height: 235px !important;
        margin: 0 !important;
        overflow: hidden !important;
      }

      body.ugi-route-growth-report .chart-container {
        height: 218px !important;
        overflow: hidden !important;
      }

      body.ugi-route-growth-report .chart-container svg {
        max-height: 218px !important;
      }

      body.ugi-route-growth-report .report-wrapper {
        height: calc(100vh - 560px) !important;
        min-height: 260px !important;
        overflow: hidden !important;
      }

      body.ugi-route-growth-report .report-wrapper .datatable {
        height: 100% !important;
        max-height: 100% !important;
        overflow: hidden !important;
      }

      body.ugi-route-growth-report .report-wrapper .dt-scrollable {
        height: calc(100% - 105px) !important;
        max-height: calc(100% - 105px) !important;
        overflow: auto !important;
      }

      body.ugi-route-growth-report .report-wrapper .result,
      body.ugi-route-growth-report .report-wrapper .no-result,
      body.ugi-route-growth-report .report-wrapper .freeze {
        min-height: 0 !important;
      }

      body.ugi-route-growth-report .report-footer {
        display: none !important;
      }

      body.ugi-route-lifecycle .page-content,
      body.ugi-route-lifecycle .layout-main-section {
        height: calc(100vh - 132px) !important;
        overflow: hidden !important;
      }

      body.ugi-route-lifecycle .frappe-list {
        height: calc(100vh - 204px) !important;
        overflow: hidden !important;
      }

      body.ugi-route-lifecycle .frappe-list .result {
        max-height: calc(100vh - 292px) !important;
        overflow: auto !important;
      }

      body.ugi-route-lifecycle .list-row-container {
        max-height: none !important;
      }

      @media (max-width: 1180px) {
        body.ugi-route-dashboard,
        body.ugi-route-growth-report,
        body.ugi-route-lifecycle {
          overflow: auto !important;
        }

        body.ugi-route-dashboard .ugi-screen,
        body.ugi-route-growth-report .page-content,
        body.ugi-route-growth-report .layout-main-section,
        body.ugi-route-lifecycle .page-content,
        body.ugi-route-lifecycle .layout-main-section {
          height: auto !important;
          overflow: visible !important;
        }
      }
    </style>
  `);
};

user_growth_insight.apply_route_state = function () {
  const route = user_growth_insight.get_route_key();
  const is_dashboard = route.startsWith('user-growth-dashboard');
  const is_report = route === 'query-report/user growth overview'
    || route === 'query-report/user%20growth%20overview';
  const is_lifecycle = route.includes('user service lifecycle')
    || route.includes('user-service-lifecycle');

  $('body')
    .toggleClass('ugi-route-dashboard', is_dashboard)
    .toggleClass('ugi-route-growth-report', is_report)
    .toggleClass('ugi-route-lifecycle', is_lifecycle);
};

user_growth_insight.ensure_desk_shortcuts = function () {
  user_growth_insight.ensure_desk_styles();
  user_growth_insight.apply_route_state();

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

user_growth_insight.refresh_desk_shell = function () {
  user_growth_insight.ensure_desk_shortcuts();
  setTimeout(user_growth_insight.apply_route_state, 0);
  setTimeout(user_growth_insight.apply_route_state, 250);
};

$(document).on('page-change', user_growth_insight.refresh_desk_shell);
$(document).ready(user_growth_insight.refresh_desk_shell);
