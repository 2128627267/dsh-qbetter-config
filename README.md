# dsh-qbetter-config 更好的配置

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

## Host RPC（HTTP JSON）

| 方法 | 返回 |
|------|------|
| `POST /dsh-qbetter-config/status` | `{ sandbox, model, workspaces, settings, templates, mcpServers, wish, patch }` |
| `POST /dsh-qbetter-config/model` | 热更新默认模型 |
| `POST /dsh-qbetter-config/providers` | 热更新多模型提供者 |
| `POST /dsh-qbetter-config/mcp/save` / `mcp/delete` | 管理 MCP 服务器 |
| `POST /dsh-qbetter-config/wish` | 能力开关 |
| `POST /dsh-qbetter-config/patch` | 生成补丁 |

## 安装（原生 bundle，与 dshmarket 同类）

本插件是标准 DSH bundle：安装后作为普通插件运行，**不产生 Cordis 动态插件、无需批准、无需任何手动激活**。

```bash
dsh plugin --profile web add dsh-qbetter-config
```

重启 `dsh web` 后：

- 设置页“配置中心”直接挂载；
- 配置读写走 HTTP JSON 接口；
- 不出现 `qbcfg-*`，也没有 `run-*` 消息。

## 仓库

- GitHub：https://github.com/2128627267/dsh-qbetter-config
- Topic：`dsh-plugin`（发布时请在仓库设置里添加该 topic）

---
