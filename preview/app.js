const escapeHtml = (value) => {
  const div = document.createElement('div');
  div.textContent = value === null || value === undefined ? '' : String(value);
  return div.innerHTML;
};

const fetchDashboard = async () => {
  const params = new URLSearchParams();
  ['region', 'channel', 'plan'].forEach((id) => {
    const value = document.getElementById(id).value;
    if (value) params.set(id, value);
  });
  const response = await fetch(`/api/dashboard?${params.toString()}`);
  return response.json();
};

const fillSelect = (id, values) => {
  const select = document.getElementById(id);
  const first = select.firstElementChild;
  select.innerHTML = '';
  select.appendChild(first);
  Object.keys(values || {}).sort().forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
};

const renderKpis = (data) => {
  const money = new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 });
  const kpis = [
    ['ACTIVE', data.active_users, '活跃用户'],
    ['CHURN', data.churned_users, '累计流失'],
    ['MRR', money.format(data.total_mrr), '当前 MRR'],
    ['DEVICES', data.total_devices, '设备覆盖'],
    ['ARPA', money.format(data.avg_mrr), '平均 MRR'],
  ];
  document.getElementById('kpis').innerHTML = kpis.map(([code, value, label]) => `
    <article class="ugi-kpi"><span>${code}</span><strong>${escapeHtml(value)}</strong><em>${label}</em></article>
  `).join('');
};

const renderLineChart = (rows) => {
  const svg = document.getElementById('lineChart');
  const width = 920;
  const height = 320;
  const pad = 34;
  const maxValue = Math.max(...rows.flatMap((row) => [row.new_users, row.churned_users, row.active_users]), 1);
  const x = (index) => pad + (index * (width - pad * 2)) / Math.max(rows.length - 1, 1);
  const y = (value) => height - pad - (value / maxValue) * (height - pad * 2);
  const pathFor = (key) => rows.map((row, index) => `${index ? 'L' : 'M'} ${x(index)} ${y(row[key])}`).join(' ');
  svg.innerHTML = `
    <defs>
      <linearGradient id="ugiGlow" x1="0" x2="1">
        <stop offset="0%" stop-color="#c2ef4e"/><stop offset="54%" stop-color="#7170ff"/><stop offset="100%" stop-color="#fa7faa"/>
      </linearGradient>
      <filter id="softGlow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    ${[0, 1, 2, 3, 4].map((step) => `<line x1="${pad}" x2="${width - pad}" y1="${pad + step * 62}" y2="${pad + step * 62}" class="ugi-grid-line"/>`).join('')}
    <path d="${pathFor('active_users')}" class="ugi-path active" filter="url(#softGlow)"/>
    <path d="${pathFor('new_users')}" class="ugi-path new"/>
    <path d="${pathFor('churned_users')}" class="ugi-path churn"/>
    ${rows.map((row, index) => `<circle cx="${x(index)}" cy="${y(row.active_users)}" r="4" class="ugi-node"></circle>`).join('')}
    <g class="ugi-axis">${rows.map((row, index) => `<text x="${x(index)}" y="306">${row.month.slice(5)}</text>`).join('')}</g>
  `;
};

const renderBars = (id, values) => {
  const entries = Object.entries(values || {}).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map((entry) => entry[1]), 1);
  document.getElementById(id).innerHTML = entries.map(([label, value]) => `
    <div class="ugi-bar-row">
      <span>${escapeHtml(label)}</span>
      <div class="ugi-bar-track"><i style="width:${(value / max) * 100}%"></i></div>
      <strong>${value}</strong>
    </div>
  `).join('');
};

const renderOrbit = (values) => {
  const entries = Object.entries(values || {}).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, entry) => sum + entry[1], 0) || 1;
  document.getElementById('channels').innerHTML = entries.map(([label, value], index) => {
    const size = 48 + Math.round((value / total) * 92);
    return `<div class="ugi-orbit-node node-${index}" style="--size:${size}px"><strong>${value}</strong><span>${escapeHtml(label)}</span></div>`;
  }).join('');
};

const renderReasons = (values) => {
  const entries = Object.entries(values || {}).filter(([label]) => label !== '未流失').sort((a, b) => b[1] - a[1]);
  document.getElementById('churn').innerHTML = entries.map(([label, value]) => `
    <div class="ugi-reason"><span>${escapeHtml(label)}</span><strong>${value}</strong></div>
  `).join('');
};

const refresh = async () => {
  const data = await fetchDashboard();
  fillSelect('region', data.region_distribution);
  fillSelect('channel', data.channel_distribution);
  fillSelect('plan', data.plan_distribution);
  document.getElementById('signal').textContent = `${data.logo_metric}%`;
  renderKpis(data);
  renderLineChart(data.monthly);
  renderBars('regions', data.region_distribution);
  renderOrbit(data.channel_distribution);
  renderBars('plans', data.plan_distribution);
  renderReasons(data.churn_reasons);
};

['region', 'channel', 'plan'].forEach((id) => document.getElementById(id).addEventListener('change', refresh));
refresh();
