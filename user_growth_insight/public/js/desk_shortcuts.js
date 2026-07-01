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

      body.ugi-route-dashboard .navbar,
      body.ugi-route-dashboard .page-head {
        display: none !important;
      }

      body.ugi-route-dashboard .page-form {
        display: none !important;
      }

      body.ugi-route-dashboard .page-container,
      body.ugi-route-dashboard .page-body,
      body.ugi-route-dashboard .page-content,
      body.ugi-route-dashboard .layout-main-section {
        width: 100vw !important;
        max-width: none !important;
        height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        border-radius: 0 !important;
        background: #060809 !important;
        overflow: hidden !important;
      }

      body.ugi-route-dashboard .ugi-screen {
        box-sizing: border-box !important;
        position: fixed !important;
        inset: 0 !important;
        z-index: 2000 !important;
        width: 100vw !important;
        height: 100vh !important;
        min-height: 0 !important;
        overflow: hidden !important;
        margin: 0 !important;
        padding: 22px 28px 24px !important;
        background:
          radial-gradient(circle at 12% 12%, rgba(113, 112, 255, 0.2), transparent 28%),
          radial-gradient(circle at 82% 18%, rgba(194, 239, 78, 0.1), transparent 24%),
          linear-gradient(135deg, #121827 0%, #060809 52%, #171023 100%) !important;
      }

      body.ugi-route-dashboard .ugi-hero {
        display: grid !important;
        grid-template-columns: minmax(360px, 0.9fr) minmax(560px, 1.1fr) !important;
        align-items: start !important;
        gap: 20px !important;
        margin-bottom: 14px !important;
      }

      body.ugi-route-dashboard .ugi-hero h1 {
        margin: 4px 0 0 !important;
        color: rgba(247, 248, 248, 0.82) !important;
        font-size: clamp(30px, 2.8vw, 48px) !important;
        font-weight: 520 !important;
        line-height: 1 !important;
        letter-spacing: 0 !important;
      }

      body.ugi-route-dashboard .ugi-command {
        display: grid !important;
        gap: 10px !important;
        justify-items: end !important;
      }

      body.ugi-route-dashboard .ugi-filters,
      body.ugi-route-dashboard .ugi-actions {
        display: flex !important;
        align-items: center !important;
        justify-content: flex-end !important;
        gap: 8px !important;
        min-width: 0 !important;
      }

      body.ugi-route-dashboard .ugi-filter {
        display: grid !important;
        grid-template-columns: auto minmax(112px, 1fr) !important;
        align-items: center !important;
        gap: 8px !important;
        margin: 0 !important;
        padding: 7px 10px !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 8px !important;
        background: rgba(255, 255, 255, 0.055) !important;
      }

      body.ugi-route-dashboard .ugi-filter span {
        color: rgba(208, 214, 224, 0.7) !important;
        font-size: 12px !important;
        white-space: nowrap !important;
      }

      body.ugi-route-dashboard .ugi-filter select {
        width: 100% !important;
        min-width: 0 !important;
        border: 0 !important;
        outline: none !important;
        background: transparent !important;
        color: #f7f8f8 !important;
        font-size: 12px !important;
      }

      body.ugi-route-dashboard .ugi-filter option {
        color: #111827 !important;
      }

      body.ugi-route-dashboard .ugi-actions a,
      body.ugi-route-dashboard .ugi-actions button,
      body.ugi-route-dashboard .ugi-time {
        min-height: 34px !important;
        padding: 8px 11px !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 999px !important;
        background: rgba(255, 255, 255, 0.055) !important;
        color: #d0d6e0 !important;
        font-size: 12px !important;
        line-height: 1 !important;
        text-decoration: none !important;
        white-space: nowrap !important;
      }

      body.ugi-route-dashboard .ugi-actions button {
        cursor: pointer !important;
      }

      body.ugi-route-dashboard .ugi-actions button[data-action="refresh"] {
        color: #101405 !important;
        border-color: transparent !important;
        background: #c2ef4e !important;
      }

      body.ugi-route-dashboard .ugi-kpis {
        grid-template-columns: repeat(5, minmax(150px, 1fr)) !important;
        gap: 10px !important;
        margin-bottom: 12px !important;
      }

      body.ugi-route-dashboard .ugi-kpi {
        min-height: 88px !important;
        padding: 12px 15px !important;
        box-shadow: inset 0 0 16px rgba(255, 255, 255, 0.02), 0 12px 36px rgba(0, 0, 0, 0.2) !important;
      }

      body.ugi-route-dashboard .ugi-kpi strong {
        margin-top: 7px !important;
        font-size: clamp(24px, 1.9vw, 34px) !important;
      }

      body.ugi-route-dashboard .ugi-kpi em {
        margin-top: 5px !important;
      }

      body.ugi-route-dashboard .ugi-main {
        height: calc(100vh - 220px) !important;
        display: grid !important;
        grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.78fr) minmax(320px, 0.78fr) !important;
        grid-template-rows: repeat(2, minmax(0, 1fr)) !important;
        gap: 12px !important;
      }

      body.ugi-route-dashboard .ugi-panel {
        min-height: 0 !important;
        padding: 15px 16px !important;
        box-shadow: inset 0 0 16px rgba(255, 255, 255, 0.02), 0 14px 42px rgba(0, 0, 0, 0.22) !important;
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
        transform: scale(0.9) !important;
        transform-origin: center !important;
      }

      @media (min-width: 1181px) and (max-width: 1450px) {
        body.ugi-route-dashboard .ugi-screen {
          padding: 18px 22px 20px !important;
        }

        body.ugi-route-dashboard .ugi-hero {
          grid-template-columns: minmax(280px, 0.74fr) minmax(480px, 1.26fr) !important;
          gap: 14px !important;
        }

        body.ugi-route-dashboard .ugi-kpis {
          grid-template-columns: repeat(5, minmax(118px, 1fr)) !important;
        }

        body.ugi-route-dashboard .ugi-main {
          grid-template-columns: minmax(420px, 1.2fr) minmax(240px, 0.7fr) minmax(240px, 0.7fr) !important;
        }
      }

      @media (max-width: 1180px) {
        body.ugi-route-dashboard {
          overflow: hidden !important;
        }

        body.ugi-route-dashboard .ugi-screen {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          padding: 16px !important;
          overflow: hidden !important;
        }

        body.ugi-route-dashboard .ugi-hero {
          display: grid !important;
          grid-template-columns: minmax(240px, 0.85fr) minmax(300px, 1.15fr) !important;
          gap: 12px !important;
          margin-bottom: 10px !important;
        }

        body.ugi-route-dashboard .ugi-hero h1 {
          font-size: clamp(26px, 4vw, 36px) !important;
        }

        body.ugi-route-dashboard .ugi-command {
          gap: 7px !important;
        }

        body.ugi-route-dashboard .ugi-filters,
        body.ugi-route-dashboard .ugi-actions {
          flex-wrap: wrap !important;
          gap: 6px !important;
        }

        body.ugi-route-dashboard .ugi-filter {
          grid-template-columns: auto minmax(78px, 1fr) !important;
          padding: 6px 8px !important;
        }

        body.ugi-route-dashboard .ugi-actions a,
        body.ugi-route-dashboard .ugi-actions button,
        body.ugi-route-dashboard .ugi-time {
          min-height: 30px !important;
          padding: 7px 9px !important;
          font-size: 11px !important;
        }

        body.ugi-route-dashboard .ugi-kpis {
          grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
          gap: 8px !important;
          margin-bottom: 8px !important;
        }

        body.ugi-route-dashboard .ugi-kpi {
          min-height: 76px !important;
          padding: 9px 10px !important;
        }

        body.ugi-route-dashboard .ugi-kpi strong {
          font-size: clamp(20px, 3vw, 28px) !important;
        }

        body.ugi-route-dashboard .ugi-kpi em,
        body.ugi-route-dashboard .ugi-kpi small {
          font-size: 10px !important;
        }

        body.ugi-route-dashboard .ugi-main {
          height: calc(100vh - 190px) !important;
          grid-template-columns: minmax(360px, 1.25fr) minmax(210px, 0.75fr) !important;
          grid-template-rows: repeat(4, minmax(0, 1fr)) !important;
          gap: 8px !important;
        }

        body.ugi-route-dashboard .ugi-panel {
          padding: 10px 11px !important;
        }

        body.ugi-route-dashboard .ugi-panel-large {
          grid-column: 1 !important;
          grid-row: 1 / span 4 !important;
        }

        body.ugi-route-dashboard .ugi-panel:not(.ugi-panel-large) {
          min-height: 0 !important;
        }

        body.ugi-route-dashboard .ugi-panel-head {
          margin-bottom: 6px !important;
        }

        body.ugi-route-dashboard .ugi-bars,
        body.ugi-route-dashboard .ugi-reasons {
          gap: 7px !important;
        }

        body.ugi-route-dashboard .ugi-bar-row {
          grid-template-columns: 56px 1fr 24px !important;
          gap: 7px !important;
          font-size: 11px !important;
        }

        body.ugi-route-dashboard .ugi-orbit-node {
          transform: scale(0.72) !important;
        }
      }

      @media (max-width: 760px) {
        body.ugi-route-dashboard .ugi-hero {
          grid-template-columns: 1fr !important;
        }

        body.ugi-route-dashboard .ugi-command,
        body.ugi-route-dashboard .ugi-filters,
        body.ugi-route-dashboard .ugi-actions {
          justify-items: start !important;
          justify-content: flex-start !important;
        }

        body.ugi-route-dashboard .ugi-kpis {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }

        body.ugi-route-dashboard .ugi-main {
          height: calc(100vh - 295px) !important;
          grid-template-columns: 1fr !important;
          grid-template-rows: minmax(260px, 1fr) repeat(4, minmax(90px, 0.35fr)) !important;
          overflow: auto !important;
        }

        body.ugi-route-dashboard .ugi-panel-large {
          grid-column: 1 !important;
          grid-row: auto !important;
        }
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
        body.ugi-route-growth-report,
        body.ugi-route-lifecycle {
          overflow: auto !important;
        }

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

$(document)
  .off('page-change.user-growth-insight')
  .on('page-change.user-growth-insight', user_growth_insight.refresh_desk_shell);
$(document).ready(user_growth_insight.refresh_desk_shell);
