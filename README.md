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

## 动态插件加载

`host.js` + `client.js` 为 Cordis 动态插件代码（函数体）。在会话中用 cordis_define / cordis_run 加载（client 半部需用户批准）。

## 持久安装

```bash
npx dsh plugin --profile web add <本目录>
```

然后在 `profiles/web/cordis.patch.yml` 追加：

```yaml
- id: better-config
  name: 'dsh-better-config'
```
