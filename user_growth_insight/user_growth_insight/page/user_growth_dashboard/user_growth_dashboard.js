frappe.pages['user-growth-dashboard'].on_page_load = function (wrapper) {
  const page = frappe.ui.make_app_page({
    parent: wrapper,
    title: __('User Growth Dashboard'),
    single_column: true,
  });

  wrapper.growth_dashboard = new UserGrowthDashboard(page, wrapper);
};

class UserGrowthDashboard {
  constructor(page, wrapper) {
    this.page = page;
    this.wrapper = $(wrapper);
    this.filters = {};
    this.escape = (value) => {
      const text = String(value === null || value === undefined ? '' : value);
      if (frappe.utils && frappe.utils.escape_html) {
        return frappe.utils.escape_html(text);
      }
      return $('<div>').text(text).html();
    };
    this.formatNumber = (value) => Number(value || 0).toLocaleString();
    this.formatMoney = (value, compact = false) => {
      const amount = Number(value || 0);
      if (compact && Math.abs(amount) >= 1000) {
        return `${(amount / 1000).toFixed(amount >= 100000 ? 1 : 0)}K`;
      }
      return amount.toLocaleString(undefined, { maximumFractionDigits: 0 });
    };
    this.make();
    this.bind();
    this.refresh();
  }

  make() {
    this.region = this.page.add_field({
      label: __('地区'),
      fieldtype: 'Select',
      fieldname: 'region',
      options: '\n华东\n华南\n华北\n西南\n华中\n西北',
      change: () => this.applyFilters(),
    });
    this.channel = this.page.add_field({
      label: __('渠道'),
      fieldtype: 'Select',
      fieldname: 'channel',
      options: '\n官网注册\n渠道伙伴\n销售外呼\n内容投放\n线下活动\n老客推荐',
      change: () => this.applyFilters(),
    });
    this.plan = this.page.add_field({
      label: __('套餐'),
      fieldtype: 'Select',
      fieldname: 'plan',
      options: '\nStarter\nGrowth\nBusiness\nEnterprise',
      change: () => this.applyFilters(),
    });

    this.page.set_primary_action(__('刷新'), () => this.refresh(), 'refresh');
    this.container = $(`
      <section class="ugi-screen">
        <div class="ugi-grid-mist"></div>
        <header class="ugi-hero">
          <div>
            <p class="ugi-kicker">USER GROWTH OBSERVATORY</p>
            <h1>增长态势观测台</h1>
          </div>
          <div class="ugi-time">
            <span class="ugi-dot"></span>
            <span data-role="updated-at">Syncing</span>
          </div>
        </header>
        <section class="ugi-kpis" data-role="kpis"></section>
        <section class="ugi-main">
          <article class="ugi-panel ugi-panel-large">
            <div class="ugi-panel-head">
              <span>Growth Signal</span>
              <strong data-role="signal-score">0%</strong>
            </div>
            <svg class="ugi-line-chart" data-role="line-chart" viewBox="0 0 920 320" preserveAspectRatio="none"></svg>
          </article>
          <article class="ugi-panel">
            <div class="ugi-panel-head">
              <span>Region Field</span>
              <strong>分布</strong>
            </div>
            <div class="ugi-bars" data-role="regions"></div>
          </article>
          <article class="ugi-panel">
            <div class="ugi-panel-head">
              <span>Channel Orbit</span>
              <strong>来源</strong>
            </div>
            <div class="ugi-orbit" data-role="channels"></div>
          </article>
          <article class="ugi-panel">
            <div class="ugi-panel-head">
              <span>Plan Stack</span>
              <strong>套餐</strong>
            </div>
            <div class="ugi-bars compact" data-role="plans"></div>
          </article>
          <article class="ugi-panel">
            <div class="ugi-panel-head">
              <span>Churn Reasons</span>
              <strong>流失</strong>
            </div>
            <div class="ugi-reasons" data-role="churn"></div>
          </article>
        </section>
      </section>
    `).appendTo(this.page.main);
  }

  bind() {
    $(window).on('resize.user-growth-dashboard', frappe.utils.debounce(() => this.render(this.data), 150));
  }

  applyFilters() {
    this.filters = {
      region: this.region.get_value(),
      channel: this.channel.get_value(),
      plan: this.plan.get_value(),
    };
    this.refresh();
  }

  refresh() {
    frappe.call({
      method: 'user_growth_insight.api.dashboard.get_dashboard_data',
      args: { filters: this.filters },
      freeze: false,
      callback: (response) => {
        this.data = response.message || {};
        this.render(this.data);
      },
    });
  }

  render(data) {
    if (!data || !data.monthly) return;
    this.container.find('[data-role="updated-at"]').text(frappe.datetime.now_datetime());
    this.container.find('[data-role="signal-score"]').text(`${data.logo_metric || 0}%`);
    this.renderKpis(data);
        this.renderLineChart(data.monthly);
    this.renderBars('[data-role="regions"]', data.region_distribution);
    this.renderOrbit(data.channel_distribution);
    this.renderBars('[data-role="plans"]', data.plan_distribution);
    this.renderReasons(data.churn_reasons);
  }

  renderKpis(data) {
    const kpis = [
      { label: '活跃用户', value: this.formatNumber(data.active_users), code: 'ACTIVE', hint: 'accounts' },
      { label: '累计流失', value: this.formatNumber(data.churned_users), code: 'CHURN', hint: 'lost' },
      { label: '当前 MRR', value: this.formatMoney(data.total_mrr, true), code: 'MRR', hint: 'CNY / month' },
      { label: '设备覆盖', value: this.formatNumber(data.total_devices), code: 'DEVICES', hint: 'devices' },
      { label: '平均 MRR', value: this.formatMoney(data.avg_mrr), code: 'ARPA', hint: 'CNY / account' },
    ];
    this.container.find('[data-role="kpis"]').html(kpis.map((item) => `
      <article class="ugi-kpi">
        <span>${this.escape(item.code)}</span>
        <strong>${this.escape(item.value)}</strong>
        <em>${this.escape(item.label)}</em>
        <small>${this.escape(item.hint)}</small>
      </article>
    `).join(''));
  }

  renderLineChart(rows) {
    const svg = this.container.find('[data-role="line-chart"]');
    const width = 920;
    const height = 320;
    const pad = 34;
    const maxValue = Math.max(...rows.flatMap((row) => [row.new_users, row.churned_users, row.active_users]), 1);
    const x = (index) => pad + (index * (width - pad * 2)) / Math.max(rows.length - 1, 1);
    const y = (value) => height - pad - (value / maxValue) * (height - pad * 2);
    const pathFor = (key) => rows.map((row, index) => `${index ? 'L' : 'M'} ${x(index)} ${y(row[key])}`).join(' ');
    const ticks = rows.map((row, index) => `<text x="${x(index)}" y="306">${row.month.slice(5)}</text>`).join('');

    svg.html(`
      <defs>
        <linearGradient id="ugiGlow" x1="0" x2="1">
          <stop offset="0%" stop-color="#c2ef4e"/>
          <stop offset="54%" stop-color="#7170ff"/>
          <stop offset="100%" stop-color="#fa7faa"/>
        </linearGradient>
        <filter id="softGlow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      ${[0, 1, 2, 3, 4].map((step) => `<line x1="${pad}" x2="${width - pad}" y1="${pad + step * 62}" y2="${pad + step * 62}" class="ugi-grid-line"/>`).join('')}
      <path d="${pathFor('active_users')}" class="ugi-path active" filter="url(#softGlow)"/>
      <path d="${pathFor('new_users')}" class="ugi-path new"/>
      <path d="${pathFor('churned_users')}" class="ugi-path churn"/>
      ${rows.map((row, index) => `<circle cx="${x(index)}" cy="${y(row.active_users)}" r="4" class="ugi-node"><title>${row.month}: ${row.active_users}</title></circle>`).join('')}
      <g class="ugi-axis">${ticks}</g>
    `);
  }

  renderBars(selector, values) {
    const entries = Object.entries(values || {}).sort((a, b) => b[1] - a[1]);
    const max = Math.max(...entries.map((entry) => entry[1]), 1);
    this.container.find(selector).html(entries.map(([label, value]) => `
      <div class="ugi-bar-row">
        <span>${this.escape(label)}</span>
        <div class="ugi-bar-track"><i style="width:${(value / max) * 100}%"></i></div>
        <strong>${value}</strong>
      </div>
    `).join(''));
  }

  renderOrbit(values) {
    const entries = Object.entries(values || {}).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((sum, entry) => sum + entry[1], 0) || 1;
    this.container.find('[data-role="channels"]').html(entries.map(([label, value], index) => {
      const size = 48 + Math.round((value / total) * 92);
      return `<div class="ugi-orbit-node node-${index}" style="--size:${size}px"><strong>${value}</strong><span>${this.escape(label)}</span></div>`;
    }).join(''));
  }

  renderReasons(values) {
    const entries = Object.entries(values || {}).filter(([label]) => label !== '未流失').sort((a, b) => b[1] - a[1]);
    this.container.find('[data-role="churn"]').html(entries.map(([label, value]) => `
      <div class="ugi-reason"><span>${this.escape(label)}</span><strong>${value}</strong></div>
    `).join('') || '<div class="ugi-empty">暂无流失样本</div>');
  }
}
