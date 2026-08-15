// dsh-qbetter-config — native DSH bundle host half.
// Standard Cordis plugin: config hub HTTP JSON endpoints.
import { join } from 'node:path'

export const name = 'dsh-qbetter-config'
export const inject = []

const SECRET_KEYS = ['key', 'token', 'secret', 'password', 'credential']

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let data = ''
    request.on('data', (chunk) => {
      data += chunk
      if (data.length > 1024 * 1024) {
        reject(new Error('request body too large'))
        request.destroy()
      }
    })
    request.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}) } catch (error) { reject(error) }
    })
    request.on('error', reject)
  })
}

function sameOrigin(request) {
  try {
    const origin = request.headers.origin
    if (!origin) return true
    return new URL(origin).host === request.headers.host
  } catch { return false }
}

function sendJson(response, status, value) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(value))
}

export async function apply(ctx) {
  const get = (key) => {
    try { return ctx.get(key) } catch { return undefined }
  }
  const settingsSvc = get('settings')
  const sandboxPolicy = get('sandboxPolicy')
  const agentDefaultModel = get('agentDefaultModel')
  const wr = get('workspaceRegistry')
  const fsSvc = get('fs')

  let mcpServers = []
  let wish = { search: false, schedule: true }
  let dshHome = process.env.DSH_HOME || ''
  let workspaceRoot = process.cwd()

  async function resolveBase() {
    if (fsSvc) {
      try { workspaceRoot = await fsSvc.resolve('.', {}) } catch { /* ignore */ }
    }
    if (!dshHome) dshHome = workspaceRoot
  }

  function safeValue(value, depth) {
    if (depth > 4) return '[…]'
    if (value === null || value === undefined) return value
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value
    if (Array.isArray(value)) return value.slice(0, 20).map((item) => safeValue(item, depth + 1))
    if (typeof value === 'object') {
      const out = {}
      for (const key of Object.keys(value).slice(0, 30)) {
        if (SECRET_KEYS.some((s) => key.toLowerCase().includes(s))) { out[key] = '***'; continue }
        out[key] = safeValue(value[key], depth + 1)
      }
      return out
    }
    return String(value)
  }

  async function readJson(rel) {
    try {
      if (!fsSvc) return null
      const target = await fsSvc.resolve(rel, {})
      return JSON.parse(await fsSvc.readText(target))
    } catch { return null }
  }
  async function writeJson(rel, value) {
    if (!fsSvc) return false
    try {
      const target = await fsSvc.resolve(rel, {})
      await fsSvc.writeText(target, JSON.stringify(value, null, 2))
      return true
    } catch { return false }
  }

  async function loadAll() {
    await resolveBase()
    const saved = await readJson(join(dshHome, '.dsh-features', 'config.json'))
    if (saved && typeof saved === 'object') {
      if (Array.isArray(saved.mcpServers)) mcpServers = saved.mcpServers
      if (saved.wish && typeof saved.wish === 'object') wish = Object.assign(wish, saved.wish)
    }
  }
  await loadAll().catch(() => {})

  function yamlStr(value) {
    const s = String(value)
    return /[:#\s,{}[\]]/.test(s) ? JSON.stringify(s) : s
  }

  function generatePatch() {
    const lines = ['# 由 dsh-qbetter-config 生成的组合补丁（贴入 profiles/web/cordis.patch.yml，重启生效）', '- insert:']
    if (wish.schedule) {
      lines.push("    - id: schedule")
      lines.push("      name: '@deepseek-ai/dsh-schedule'")
    }
    for (const server of mcpServers) {
      if (!server || !server.serverName) continue
      lines.push("    - id: mcp-" + yamlStr(server.serverName))
      lines.push("      name: '@deepseek-ai/dsh-mcp-client'")
      lines.push('      config:')
      lines.push('        serverName: ' + yamlStr(server.serverName))
      if (server.transport === 'stdio') {
        lines.push('        transport: stdio')
        lines.push('        command: ' + yamlStr(server.command || 'npx'))
        if (server.args) lines.push('        args: ' + JSON.stringify(String(server.args).split(',').map((x) => x.trim()).filter(Boolean)))
      } else {
        lines.push('        transport: streamable-http')
        lines.push('        url: ' + yamlStr(server.url || 'https://example.com/mcp'))
        if (server.headers) {
          let headers = server.headers
          if (typeof headers === 'string') {
            try { headers = JSON.parse(headers) } catch { headers = null }
          }
          if (headers && typeof headers === 'object' && !Array.isArray(headers)) lines.push('        headers: ' + JSON.stringify(headers))
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
    const featureCfg = await readJson(join(dshHome, '.dsh-features', 'config.json'))
    let settingsList = []
    if (settingsSvc && typeof settingsSvc.describe === 'function') {
      try {
        const desc = settingsSvc.describe()
        const list = Array.isArray(desc) ? desc : []
        for (const item of list) {
          const ns = item.namespace || item.ns || item.name
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
      mcpServers: mcpServers.map((server) => ({ ...server })),
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
      try { out.sandbox = { defaultMode: sandboxPolicy.defaultMode, workspaceRoot: sandboxPolicy.workspaceRoot } } catch { /* ignore */ }
    }
    if (agentDefaultModel && typeof agentDefaultModel.currentSelection === 'function') {
      try { out.model = agentDefaultModel.currentSelection() } catch { /* ignore */ }
    }
    if (wr && typeof wr.list === 'function') {
      try { out.workspaces = wr.list().map((workspace) => ({ id: workspace.id, path: workspace.path, title: workspace.title })) } catch { /* ignore */ }
    }
    return out
  }

  const api = {
    status: async () => configStatus(),
    model: async (args) => {
      const provider = String((args && args.provider) || '').trim()
      const model = String((args && args.model) || '').trim()
      if (!provider || !model) return { error: 'provider 与 model 不能为空' }
      if (!settingsSvc) return { error: 'settings 服务不可用' }
      try {
        await settingsSvc.update('agent-default-model', { provider, model })
        return { ok: true }
      } catch (error) { return { error: '更新失败：' + String((error && error.message) || error) + '（可手动编辑 settings.yaml 的 agent-default-model 段）' } }
    },
    providers: async (args) => {
      const providers = Array.isArray(args && args.providers) ? args.providers : []
      if (!settingsSvc) return { error: 'settings 服务不可用' }
      try {
        await settingsSvc.update('llm-pi-ai', { providers })
        return { ok: true }
      } catch (error) { return { error: '更新失败：' + String((error && error.message) || error) + '（可手动编辑 settings.yaml 的 llm-pi-ai 段）' } }
    },
    'mcp/list': async () => mcpServers.map((server) => ({ ...server })),
    'mcp/save': async (args) => {
      const raw = (args && args.server) || {}
      const serverName = String(raw.serverName || '').trim()
      if (!serverName) return { error: 'serverName 必填' }
      const transport = raw.transport === 'stdio' ? 'stdio' : 'streamable-http'
      let headers = raw.headers
      if (typeof headers === 'string') {
        const trimmed = headers.trim()
        if (!trimmed) headers = undefined
        else {
          try { headers = JSON.parse(trimmed) } catch { return { error: 'headers 必须是合法 JSON 对象' } }
        }
      }
      if (headers !== undefined && headers !== null && (typeof headers !== 'object' || Array.isArray(headers))) return { error: 'headers 必须是 JSON 对象' }
      const server = {
        serverName,
        transport,
        command: transport === 'stdio' ? String(raw.command || 'npx').trim() : undefined,
        args: transport === 'stdio' ? String(raw.args || '').trim() : undefined,
        url: transport === 'streamable-http' ? String(raw.url || '').trim() : undefined,
        headers: headers || undefined,
      }
      if (transport === 'streamable-http' && !/^https?:\/\//i.test(server.url || '')) return { error: 'url 必须以 http(s):// 开头' }
      const index = mcpServers.findIndex((item) => item.serverName === serverName)
      if (index >= 0) mcpServers[index] = server
      else mcpServers.push(server)
      await writeJson(join(dshHome, '.dsh-features', 'config.json'), { mcpServers, wish })
      return mcpServers.map((item) => ({ ...item }))
    },
    'mcp/delete': async (args) => {
      mcpServers = mcpServers.filter((item) => item.serverName !== (args && args.serverName))
      await writeJson(join(dshHome, '.dsh-features', 'config.json'), { mcpServers, wish })
      return mcpServers.map((item) => ({ ...item }))
    },
    wish: async (args) => {
      if (typeof (args && args.search) === 'boolean') wish.search = args.search
      if (typeof (args && args.schedule) === 'boolean') wish.schedule = args.schedule
      await writeJson(join(dshHome, '.dsh-features', 'config.json'), { mcpServers, wish })
      return { ...wish, patch: generatePatch() }
    },
    patch: async () => generatePatch(),
  }

  ctx.inject(['webServer'], (hostCtx) => {
    hostCtx.effect(() => {
      const routes = [
        ['/dsh-qbetter-config/status', api.status],
        ['/dsh-qbetter-config/model', api.model],
        ['/dsh-qbetter-config/providers', api.providers],
        ['/dsh-qbetter-config/mcp/list', api['mcp/list']],
        ['/dsh-qbetter-config/mcp/save', api['mcp/save']],
        ['/dsh-qbetter-config/mcp/delete', api['mcp/delete']],
        ['/dsh-qbetter-config/wish', api.wish],
        ['/dsh-qbetter-config/patch', api.patch],
      ]
      const disposers = []
      for (const [path, handler] of routes) {
        const dispose = hostCtx.webServer.register({
          kind: 'exact',
          path,
          handler: async (request, response) => {
            if (request.method !== 'POST') {
              response.writeHead(405, { allow: 'POST' })
              response.end()
              return
            }
            if (!sameOrigin(request)) {
              sendJson(response, 403, { error: 'untrusted origin' })
              return
            }
            try {
              const args = await readJsonBody(request)
              sendJson(response, 200, await handler(args))
            } catch (error) {
              sendJson(response, 500, { error: String((error && error.message) || error) })
            }
          },
        })
        disposers.push(dispose)
      }
      return () => { for (const dispose of disposers) { try { dispose() } catch { /* ignore */ } } }
    }, 'dsh-qbetter-config: http routes')
  })
}
