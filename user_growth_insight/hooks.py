app_name = "user_growth_insight"
app_title = "User Growth Insight"
app_publisher = "Codex"
app_description = "User service lifecycle records, growth report, and dashboard page"
app_email = "codex@example.com"
app_license = "MIT"

# The stylesheet is scoped to `.ugi-screen`, so loading it in Desk is safe and
# keeps the custom Page free of external build dependencies.
app_include_css = ["/assets/user_growth_insight/css/user_growth_dashboard.css?v=20260701-fullscreen"]
app_include_js = ["/assets/user_growth_insight/js/desk_shortcuts.js?v=20260701-fullscreen"]

after_install = "user_growth_insight.setup.seed.after_install"

fixtures = [
    {
        "dt": "User Service Lifecycle",
        "filters": [["name", "like", "UGI-%"]],
    }
]
