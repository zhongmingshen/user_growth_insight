# User Growth Insight 部署与验收文档

本文档用于从零准备环境、安装 Frappe v15 自定义 App `user_growth_insight`、启动服务，并完成最终验收。当前项目已在 Windows + WSL2 Ubuntu 24.04 环境中跑通，本文同时给出通用部署步骤和本机已验证配置。

## 1. 交付范围

`user_growth_insight` 是一个 Frappe v15 自定义 App，包含三项核心交付：

| 类型 | 名称/入口 | 说明 |
| --- | --- | --- |
| DocType | `User Service Lifecycle` | 用户服务开通、试用、活跃、流失生命周期数据单据 |
| Report | `User Growth Overview` | 基于生命周期单据聚合新增、流失、净增长、MRR、流失率 |
| Page | `/app/user-growth-dashboard` | 用于大屏展示的用户增长观测台 |

数据源统一来自 `User Service Lifecycle`。安装 App 后，`after_install` 会自动幂等导入 mock 数据，当前内置样本为 72 条，覆盖 6 个地区、活跃/试用/流失状态。

## 2. 系统要求

### 2.1 推荐硬件

| 资源 | 最低要求 | 推荐配置 |
| --- | --- | --- |
| CPU | 2 核 | 4 核及以上 |
| 内存 | 4 GB | 8 GB 及以上 |
| 磁盘 | 20 GB 可用空间 | 40 GB 及以上 |
| 网络 | 可访问 GitHub / Python / Node 包源 | 稳定外网或已配置镜像源 |

### 2.2 操作系统

推荐使用 Linux 或 WSL2：

- Ubuntu 22.04/24.04
- Debian 12
- Windows 10/11 + WSL2 Ubuntu

Windows 原生也可用于源码静态校验，但完整 Frappe bench 运行建议放在 Linux/WSL 环境内。

## 3. 环境要求

Frappe v15 运行环境建议如下：

| 组件 | 推荐版本 | 本机已验证版本 |
| --- | --- | --- |
| Python | 3.10 - 3.12 | WSL: Python 3.12.3 |
| Node.js | 18 LTS | v18.19.1 |
| npm | Node 随附 | 9.2.0 |
| Yarn | 1.x | 1.22.22 |
| MariaDB | 10.6+ | 10.11.14 |
| Redis | 6+ | 7.0.15 |
| Bench CLI | 5.x | 5.31.0 |
| Frappe | v15 | 15.113.3 |

本机 Windows 侧 Python 为 3.14.6，可用于运行本项目的静态校验脚本；Frappe 站点实际运行在 WSL Ubuntu 24.04 内。

## 4. 本机目录约定

当前已验证部署使用以下路径：

| 项目 | 路径 |
| --- | --- |
| Windows 源码目录 | `K:\面试项目\user_growth_insight` |
| WSL 源码挂载路径 | `/mnt/k/面试项目/user_growth_insight` |
| WSL bench 目录 | `/home/frappe/frappe-bench-ugi` |
| WSL app 目录 | `/home/frappe/frappe-bench-ugi/apps/user_growth_insight` |
| Frappe site | `ugi.local` |
| Web 端口 | `8000` |
| 访问地址 | `http://127.0.0.1:8000` |

WSL bench 内的 app 仓库 remote `upstream` 指向 Windows 源码目录，便于把 Windows 工作区中的最新提交同步到 bench 内运行。

## 5. 系统与环境搭建

以下命令以 Ubuntu/WSL 为例。生产部署请根据公司安全规范调整用户、端口、数据库密码和进程管理方式。

### 5.1 安装系统依赖

```bash
sudo apt update
sudo apt install -y \
  git curl wget build-essential python3-dev python3-pip python3-venv \
  mariadb-server mariadb-client redis-server xvfb libffi-dev libssl-dev \
  libjpeg-dev zlib1g-dev liblcms2-dev libblas-dev liblapack-dev \
  libtiff5-dev libwebp-dev pkg-config
```

### 5.2 安装 Node.js 18 和 Yarn 1

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g yarn
```

验证：

```bash
python3 --version
node --version
npm --version
yarn --version
redis-server --version
mariadb --version
```

### 5.3 初始化数据库与服务

```bash
sudo service mariadb start
sudo service redis-server start
```

设置 MariaDB root 密码和安全选项：

```bash
sudo mysql_secure_installation
```

Frappe v15 常见 MariaDB 配置建议：

```bash
sudo tee /etc/mysql/mariadb.conf.d/99-frappe.cnf >/dev/null <<'EOF'
[mysqld]
character-set-client-handshake = FALSE
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

[mysql]
default-character-set = utf8mb4
EOF

sudo service mariadb restart
```

Redis 如果提示 `Memory overcommit must be enabled`，可按需设置：

```bash
echo 'vm.overcommit_memory=1' | sudo tee /etc/sysctl.d/99-frappe-redis.conf
sudo sysctl --system
```

## 6. 安装 Bench 与创建站点

### 6.1 安装 Bench CLI

```bash
python3 -m pip install --user frappe-bench
export PATH="$HOME/.local/bin:$PATH"
bench --version
```

如果使用专门的 Linux 用户：

```bash
sudo adduser frappe
sudo usermod -aG sudo frappe
su - frappe
```

### 6.2 初始化 Frappe v15 bench

```bash
bench init frappe-bench-ugi --frappe-branch version-15
cd frappe-bench-ugi
```

### 6.3 创建站点

```bash
bench new-site ugi.local
```

按提示输入 MariaDB root 密码和 Frappe Administrator 密码。创建完成后可设置默认站点：

```bash
bench use ugi.local
```

如果不设置默认站点，后续命令统一显式加 `--site ugi.local`。

## 7. 安装本 App

### 7.1 从本地路径安装

如果源码已经在本机，例如：

```text
K:\面试项目\user_growth_insight
```

在 WSL 中对应路径为：

```text
/mnt/k/面试项目/user_growth_insight
```

进入 bench 目录后执行：

```bash
cd /home/frappe/frappe-bench-ugi
bench get-app /mnt/k/面试项目/user_growth_insight
bench --site ugi.local install-app user_growth_insight
bench --site ugi.local migrate
bench build --app user_growth_insight
bench --site ugi.local clear-cache
```

### 7.2 从 GitHub 安装

项目仓库：

```text
https://github.com/zhongmingshen/user_growth_insight.git
```

安装命令：

```bash
cd /home/frappe/frappe-bench-ugi
bench get-app https://github.com/zhongmingshen/user_growth_insight.git
bench --site ugi.local install-app user_growth_insight
bench --site ugi.local migrate
bench build --app user_growth_insight
bench --site ugi.local clear-cache
```

### 7.3 更新已安装 App

如果 bench 内 app remote 指向工作区：

```bash
cd /home/frappe/frappe-bench-ugi/apps/user_growth_insight
git pull --ff-only upstream main

cd /home/frappe/frappe-bench-ugi
bench --site ugi.local migrate
bench build --app user_growth_insight
bench --site ugi.local clear-cache
```

如果从 GitHub 拉取：

```bash
cd /home/frappe/frappe-bench-ugi/apps/user_growth_insight
git pull --ff-only origin main
```

## 8. 启动与访问

开发环境启动：

```bash
cd /home/frappe/frappe-bench-ugi
bench start
```

启动成功后访问：

```text
http://127.0.0.1:8000
```

登录 Frappe Desk 后，访问以下入口：

| 功能 | URL |
| --- | --- |
| 增长大屏 | `http://127.0.0.1:8000/app/user-growth-dashboard` |
| 增长报表 | `http://127.0.0.1:8000/app/query-report/User%20Growth%20Overview` |
| 生命周期数据 | `http://127.0.0.1:8000/app/user-service-lifecycle` |

Desk 内右下角也会出现快捷入口：`增长大屏`、`增长报表`、`生命周期`。大屏页会隐藏 Desk 顶栏并以沉浸式全屏展示。

## 9. Mock 数据与重置

安装 App 时，`after_install` 会调用：

```python
user_growth_insight.setup.seed.after_install
```

种子数据来源：

```text
user_growth_insight/data/user_service_lifecycle_mock.json
```

导入逻辑是幂等的：如果同名 `UGI-*` 样本已存在，会跳过，避免重复插入。

如需手动补齐 mock 数据：

```bash
cd /home/frappe/frappe-bench-ugi
bench --site ugi.local execute user_growth_insight.setup.seed.seed_user_service_lifecycle
```

如需重新安装演示数据，可先在 Desk 中删除 `UGI-*` 样本，或在确认无业务数据风险后通过数据库/脚本清理再执行上述命令。

## 10. 源码级静态校验

在 Windows 源码目录执行：

```powershell
cd K:\面试项目\user_growth_insight
python scripts\verify_app.py
python -m compileall user_growth_insight
```

`scripts\verify_app.py` 会检查：

- Frappe app 关键结构是否存在
- DocType / Report / Page JSON 是否能解析
- mock 数据条数与关键字段
- 报表和大屏依赖的 API 文件
- 独立聚合逻辑是否能产出新增、流失、净增长、MRR、地区分布、渠道分布等指标

## 11. 运行态验收步骤

### 11.1 App 安装验收

```bash
cd /home/frappe/frappe-bench-ugi
bench --site ugi.local list-apps
```

预期包含：

```text
frappe              15.x
user_growth_insight 0.0.1
```

### 11.2 端口验收

Windows 侧检查：

```powershell
netstat -ano | findstr ":8000"
```

预期能看到 `127.0.0.1:8000` 处于 `LISTENING`。

### 11.3 页面验收

打开以下页面并确认：

- `User Service Lifecycle` 列表可见，存在 mock 数据记录。
- `User Growth Overview` 报表可运行，能看到月度新增、流失、净增长、活跃用户、流失率、MRR 等列。
- `user-growth-dashboard` 大屏可见，顶部指标、增长曲线、地区分布、渠道分布、套餐分布、流失原因均有数据。

### 11.4 视觉验收

最终验收截图已保存到：

```text
docs/screenshots/final/
```

文件列表：

| 文件 | 内容 |
| --- | --- |
| `01-user-growth-dashboard.png` | 用户增长大屏 |
| `02-user-growth-overview-report.png` | 用户增长报表 |
| `03-user-service-lifecycle-list.png` | 生命周期数据列表 |

### 11.5 内存与前端事件验收

本项目已处理两个前端泄露风险：

- 大屏重复进入时，先清理 `resize.user-growth-dashboard` 事件，再绑定新的 resize handler。
- Desk 路由监听统一使用 `page-change.user-growth-insight` 命名空间，并在绑定前 `off`，避免脚本重复加载时堆积。

浏览器中可观察：

- `.ugi-screen` 数量应为 1。
- `#ugi-desk-runtime-style` 数量应为 1。
- `.ugi-desk-jump` 数量应为 1，且在大屏页隐藏。

## 12. 本机已验证状态

本机当前已验证配置：

| 项目 | 值 |
| --- | --- |
| WSL 发行版 | Ubuntu-24.04 / WSL2 |
| bench 目录 | `/home/frappe/frappe-bench-ugi` |
| site | `ugi.local` |
| webserver_port | `8000` |
| Bench CLI | `5.31.0` |
| Frappe | `15.113.3` |
| user_growth_insight | `0.0.1` |
| Python | `3.12.3` |
| Node.js | `18.19.1` |
| Yarn | `1.22.22` |
| Redis | `7.0.15` |
| MariaDB | `10.11.14` |

当前源码仓库：

```text
K:\面试项目\user_growth_insight
https://github.com/zhongmingshen/user_growth_insight.git
```

## 13. 常见问题

### 13.1 页面仍显示旧样式

执行：

```bash
cd /home/frappe/frappe-bench-ugi
bench build --app user_growth_insight
bench --site ugi.local clear-cache
```

然后浏览器强制刷新。

### 13.2 访问 127.0.0.1:8000 被拒绝

检查 bench 是否启动：

```bash
cd /home/frappe/frappe-bench-ugi
bench start
```

Windows 侧检查端口：

```powershell
netstat -ano | findstr ":8000"
```

### 13.3 Redis 提示 overcommit

开发环境通常不阻断启动，但建议设置：

```bash
echo 'vm.overcommit_memory=1' | sudo tee /etc/sysctl.d/99-frappe-redis.conf
sudo sysctl --system
```

### 13.4 mock 数据没有出现

执行：

```bash
cd /home/frappe/frappe-bench-ugi
bench --site ugi.local execute user_growth_insight.setup.seed.seed_user_service_lifecycle
bench --site ugi.local clear-cache
```

### 13.5 修改源码后 bench 未更新

如果 bench app 目录是从 Windows 工作区拉取的：

```bash
cd /home/frappe/frappe-bench-ugi/apps/user_growth_insight
git pull --ff-only upstream main

cd /home/frappe/frappe-bench-ugi
bench build --app user_growth_insight
bench --site ugi.local clear-cache
```

## 14. 交付验收清单

- [ ] 依赖安装完成，`python3/node/yarn/redis/mariadb/bench` 版本可查。
- [ ] `bench --site ugi.local list-apps` 显示 `user_growth_insight`。
- [ ] `bench start` 正常启动，`127.0.0.1:8000` 可访问。
- [ ] `User Service Lifecycle` 列表可见，并有 72 条 mock 数据。
- [ ] `User Growth Overview` 报表可见，筛选与指标正常。
- [ ] `/app/user-growth-dashboard` 大屏可见，宽屏展示不拥挤。
- [ ] `python scripts\verify_app.py` 通过。
- [ ] `python -m compileall user_growth_insight` 通过。
- [ ] `docs/screenshots/final/` 包含三张最终截图。

