# User Growth Insight

`user_growth_insight` 是一个 Frappe v15 自定义 App，包含用户服务开通/流失单据、用户增长数据报表和用户增长大屏页面。所有报表与大屏指标都基于 `User Service Lifecycle` 这一个 DocType。

## 交付内容

- DocType: `User Service Lifecycle`
- Script Report: `User Growth Overview`
- Desk Page: `/app/user-growth-dashboard`
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

- 单据列表：Desk 搜索 `User Service Lifecycle`
- 报表：Desk 搜索 `User Growth Overview`
- 大屏：访问 `/app/user-growth-dashboard`

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
