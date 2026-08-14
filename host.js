// dsh-better-config Host half v3 — 配置中心：真实表单（模型/提供者热更新、MCP 服务器管理、patch 一键生成）
return {
  async apply(ctx) {
    const get = (name) => ctx.get(name)
    const settingsSvc = get('settings')
    const sandboxPolicy = get('sandboxPolicy')
    const agentDefaultModel = get('agentDefaultModel')
    const wr = get('workspaceRegistry')
    const fsSvc = get('fs')

    const DIR = '.dsh-features'
    const SECRET_KEYS = ['key', 'token', 'secret', 'password', 'credential']
    let mcpServers = []
    let wish = { search: false, schedule: true }

    function safeValue(v, depth) {
      if (depth > 4) return '[…]'
      if (v === null || v === undefined) return v
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v
      if (Array.isArray(v)) return v.slice(0, 20).map((x) => safeValue(x, depth + 1))
      if (typeof v === 'object') {
        const out = {}
        for (const k of Object.keys(v).slice(0, 30)) {
          if (SECRET_KEYS.some((s) => k.toLowerCase().includes(s))) { out[k] = '***'; continue }
          out[k] = safeValue(v[k], depth + 1)
        }
        return out
      }
      return String(v)
    }

    async function readJson(rel) {
      try {
        if (!fsSvc) return null
        const t = await fsSvc.resolve(rel, {})
        return JSON.parse(await fsSvc.readText(t))
      } catch { return null }
    }
    async function writeJson(rel, val) {
      if (!fsSvc) return false
      try {
        const t = await fsSvc.resolve(rel, {})
        await fsSvc.writeText(t, JSON.stringify(val, null, 2))
        return true
      } catch { return false }
    }

    async function loadAll() {
      const c = await readJson(DIR + '/config.json')
      if (c && typeof c === 'object') {
        if (Array.isArray(c.mcpServers)) mcpServers = c.mcpServers
        if (c.wish && typeof c.wish === 'object') wish = Object.assign(wish, c.wish)
      }
    }
    loadAll()

    function yamlStr(v) {
      const s = String(v)
      return /[:#\s,{}[\]]/.test(s) ? JSON.stringify(s) : s
    }

    function generatePatch() {
      const lines = ['# 由 dsh-better-config 生成的组合补丁（贴入 profiles/web/cordis.patch.yml，重启生效）', '- insert:']
      if (wish.schedule) {
        lines.push("    - id: schedule")
        lines.push("      name: '@deepseek-ai/dsh-schedule'")
      }
      for (const s of mcpServers) {
        if (!s || !s.serverName) continue
        lines.push("    - id: mcp-" + yamlStr(s.serverName))
        lines.push("      name: '@deepseek-ai/dsh-mcp-client'")
        lines.push('      config:')
        lines.push('        serverName: ' + yamlStr(s.serverName))
        if (s.transport === 'stdio') {
          lines.push('        transport: stdio')
          lines.push('        command: ' + yamlStr(s.command || 'npx'))
          if (s.args) lines.push('        args: ' + JSON.stringify(String(s.args).split(',').map((x) => x.trim()).filter(Boolean)))
        } else {
          lines.push('        transport: streamable-http')
          lines.push('        url: ' + yamlStr(s.url || 'https://example.com/mcp'))
          if (s.headers) {
            try { lines.push('        headers: ' + JSON.stringify(JSON.parse(s.headers))) } catch { /* ignore */ }
          }
        }
      }
      if (wish.search) {
        lines.push('- id: session-query-sqlite')
        lines.push('  config:')
        lines.push("    path: !!js dshHomePath('storages') + '/session-search.db'")
        lines.push('    openAt: first-search')
      }
      return lines.join('\n')
    }

    async function configStatus() {
      const featureCfg = await readJson(DIR + '/config.json')
      let settingsList = []
      if (settingsSvc && typeof settingsSvc.describe === 'function') {
        try {
          const desc = settingsSvc.describe()
          const list = Array.isArray(desc) ? desc : []
          for (const d of list) {
            const ns = d.namespace || d.ns || d.name
            if (!ns) continue
            let value = null
            try { value = safeValue(settingsSvc.get(ns), 0) } catch { /* ignore */ }
            settingsList.push({ ns, value })
          }
        } catch { /* ignore */ }
      }
      const out = {
        sandbox: null,
        model: null,
        workspaces: [],
        settings: settingsList,
        featureCfg,
        mcpServers: mcpServers.map((s) => ({ ...s })),
        wish: { ...wish },
        patch: generatePatch(),
        env: [
          ['DSH_HOME', 'Harness 主目录（配置/profiles/sessions 所在）'],
          ['DSH_PERMISSION_MODE', '沙箱模式：read-only / workspace-write / danger-full-access'],
          ['DSH_TELEMETRY_MODE', '遥测：FULL / FEEDBACK_ONLY（默认关闭）'],
          ['DSH_TELEMETRY_OTLP_URL', '遥测上报端点（默认 https://harness-telemetry.deepseeksvc.com/v1/logs）'],
          ['DSH_TOOLS_MODE', '工具呈现：native / code / both'],
          ['DSH_WEB_URL / DSH_WEB_MODE', 'Web 启动后注入模型 shell 的地址/模式变量'],
        ],
      }
      if (sandboxPolicy) {
        try {
          out.sandbox = { defaultMode: sandboxPolicy.defaultMode, workspaceRoot: sandboxPolicy.workspaceRoot }
        } catch { /* ignore */ }
      }
      if (agentDefaultModel && typeof agentDefaultModel.currentSelection === 'function') {
        try { out.model = agentDefaultModel.currentSelection() } catch { /* ignore */ }
      }
      if (wr && typeof wr.list === 'function') {
        try { out.workspaces = wr.list().map((w) => ({ id: w.id, path: w.path, title: w.title })) } catch { /* ignore */ }
      }
      return out
    }

    harness.handle('config/status', async () => configStatus())

    // 默认模型热更新（settings 服务，写入 settings.yaml 热重载）
    harness.handle('config/model', async (args) => {
      const provider = String(args.provider || '').trim()
      const model = String(args.model || '').trim()
      if (!provider || !model) return { error: 'provider 与 model 不能为空' }
      if (!settingsSvc) return { error: 'settings 服务不可用' }
      try {
        await settingsSvc.update('agent-default-model', { provider, model })
        return { ok: true }
      } catch (e) { return { error: '更新失败：' + String(e && e.message || e) + '（可手动编辑 settings.yaml 的 agent-default-model 段）' } }
    })

    // 多提供者路由配置热更新（llm-pi-ai，写 settings.yaml 热重载）
    harness.handle('config/providers', async (args) => {
      const providers = Array.isArray(args.providers) ? args.providers : []
      if (!settingsSvc) return { error: 'settings 服务不可用' }
      try {
        await settingsSvc.update('llm-pi-ai', { providers })
        return { ok: true }
      } catch (e) { return { error: '更新失败：' + String(e && e.message || e) + '（可手动编辑 settings.yaml 的 llm-pi-ai 段）' } }
    })

    // MCP 服务器管理（表单 → 持久化 → 生成 patch）
    harness.handle('config/mcp/list', async () => mcpServers.map((s) => ({ ...s })))
    harness.handle('config/mcp/save', async (args) => {
      const s = args.server || {}
      if (!s.serverName || !String(s.serverName).trim()) return { error: 'serverName 必填' }
      s.serverName = String(s.serverName).trim()
      if (s.transport !== 'stdio') s.transport = 'streamable-http'
      const idx = mcpServers.findIndex((x) => x.serverName === s.serverName)
      if (idx >= 0) mcpServers[idx] = s
      else mcpServers.push(s)
      await writeJson(DIR + '/config.json', { mcpServers, wish })
      return mcpServers.map((x) => ({ ...x }))
    })
    harness.handle('config/mcp/delete', async (args) => {
      mcpServers = mcpServers.filter((x) => x.serverName !== args.serverName)
      await writeJson(DIR + '/config.json', { mcpServers, wish })
      return mcpServers.map((x) => ({ ...x }))
    })
    harness.handle('config/wish', async (args) => {
      if (typeof args.search === 'boolean') wish.search = args.search
      if (typeof args.schedule === 'boolean') wish.schedule = args.schedule
      await writeJson(DIR + '/config.json', { mcpServers, wish })
      return { ...wish, patch: generatePatch() }
    })
    harness.handle('config/patch', async () => generatePatch())
  },
}
