# User Growth Insight

`user_growth_insight` 是一个 Frappe v15 自定义 App，包含用户服务开通/流失单据、用户增长数据报表和用户增长大屏页面。所有报表与大屏指标都基于 `User Service Lifecycle` 这一个 DocType。

## 交付内容

- DocType: `User Service Lifecycle`
- Script Report: `User Growth Overview`
- Desk Page: `/app/user-growth-dashboard`
- Desk Workspace: `User Growth Insight`
- Python API:
  - `user_growth_insight.api.dashboard.get_dashboard_data(filters=None)`
  - `user_growth_insight.api.dashboard.get_growth_series(filters=None)`
- Mock 数据: `user_growth_insight/data/user_service_lifecycle_mock.json`，安装后由 `after_install` 幂等导入

## 安装

在已有 Frappe bench 中执行：

```bash
bench get-app /absolute/path/to/user_growth_insight
bench --site <site-name> install-app user_growth_insight
bench --site <site-name> migrate
```

如果源码已经位于 bench 的 `apps` 目录下，也可以直接：

```bash
bench --site <site-name> install-app user_growth_insight
bench --site <site-name> migrate
```

## 使用入口

- 登录 Frappe Desk 后，左侧进入 `User Growth Insight` 工作台。
- 所有 Desk 页面右下角会出现快捷入口：`增长大屏`、`增长报表`、`生命周期`。
- 单据列表：`/app/user-service-lifecycle`
- 报表：`/app/query-report/User%20Growth%20Overview`
- 大屏：`/app/user-growth-dashboard`

## 部署与验收文档

完整部署文档见 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)，包含系统要求、环境安装、bench/site/app 安装、启动命令、mock 数据说明、验收步骤和常见问题。

最终验收截图位于 [docs/screenshots/final](docs/screenshots/final)：

- `01-user-growth-dashboard.png`
- `02-user-growth-overview-report.png`
- `03-user-service-lifecycle-list.png`

## Mock 数据说明

安装 App 时，`after_install` 会读取内置 mock 数据并插入 `User Service Lifecycle`。脚本会先检查记录名，已存在的样本不会重复插入。需要重新补齐演示数据时，可在 bench 控制台或 patch 中调用：

```python
from user_growth_insight.setup.seed import seed_user_service_lifecycle
seed_user_service_lifecycle()
```

## 本地静态验证

当前机器如果没有 `bench`/`frappe` 命令，可以先运行源码级检查：

```bash
python scripts/verify_app.py
python -m compileall user_growth_insight
```

`scripts/verify_app.py` 会校验 Frappe 关键文件、JSON 语法、mock 数据数量、字段覆盖、报表/Page/API 文件存在性，以及独立聚合逻辑是否能产出新增、流失、净增长、MRR、地区与渠道分布。

## 本地大屏预览

如果暂时没有完整 Frappe bench 环境，可以先启动内置预览服务。它复用同一份 mock 数据和同一套 Python 聚合逻辑，用于检查大屏视觉与指标：

```bash
python preview/server.py 8088
```

然后访问：

```text
http://127.0.0.1:8088
```
