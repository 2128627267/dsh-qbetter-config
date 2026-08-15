# dsh-better-config 更好的配置

为 DeepSeek Harness 增加"更好的配置"设置页——集中展示所有可配置项与配置入口，让每个能力都有"更高自由度"的配置路径：

- **沙箱模式**（read-only / workspace-write / danger-full-access）与工作区根
- **默认模型**（provider / model，改自 设置 → 模型 或 settings.yaml）
- **工作区列表**
- **设置命名空间**（settings.yaml 已注册段，脱敏展示）
- **常用配置模板**（一键复制）：
  - MCP 服务器挂载（`@deepseek-ai/dsh-mcp-client`）
  - 内置定时任务挂载（`@deepseek-ai/dsh-schedule`）
  - 会话全文搜索启用（SQLite FTS5）
  - Agent 预设位置
- 配置入口说明：settings.yaml（热重载）/ cordis.patch.yml（重启生效）/ .agent-presets / .dsh-features/config.json

## Host RPC

| 方法 | 返回 |
|------|------|
| `config/status` | `{ sandbox, model, workspaces, settings, templates }` |

## 安装与自动启动（bundle 插件）

本插件已打包为标准 DSH bundle：安装后随 DSH 进程启动自动注册并激活，无需 `cordis_define`，也无需配置 `plugin-autostart.json`。

```bash
# 发布到 npm 后（推荐，他人安装同样用这条）：
dsh plugin --profile web add dsh-better-config
# 本地目录测试：
dsh plugin --profile web add <本目录>
```

然后重启 `dsh web`：

- host 半部由插件自身自动定义并运行；
- 已连接的浏览器页面会自动加载 client 半部（首次安装已预授权，无需再点批准）；
- 新开的页面首次进入设置页时自动 reconcile 并加载 client。

---

## 安装与自动启动（bundle 插件）

本插件已打包为标准 DSH bundle：安装后随 DSH 进程启动自动注册并激活，无需 `cordis_define`，也无需配置 `plugin-autostart.json`。

```bash
# 发布到 npm 后（推荐，他人安装同样用这条）：
dsh plugin --profile web add dsh-better-config
# 本地目录测试：
dsh plugin --profile web add <本目录>
```

然后重启 `dsh web`：

- host 半部由插件自身自动定义并立即运行；
- 浏览器页面启动时自动 reconcile 并加载 client 半部（首次安装已预授权，无需再点批准、无需进入设置页）。

---
