// dsh-qbetter-config — native DSH bundle client half (classic __ModuleLoader__ bundle).
window.__ModuleLoader__.load({ id: "dsh-qbetter-config", factory: (require) => {
  var module = { exports: {} }
  var exports = module.exports
  Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" })

  var React = require("react")
  var name = "dsh-qbetter-config"
  var inject = ["slots"]

  function injectStyles(ctx, css) {
    try {
      var style = document.createElement("style")
      style.setAttribute("data-plugin", "dsh-qbetter-config")
      style.textContent = css
      document.head.appendChild(style)
      var cleanup = function () {
        try { if (style.parentNode) style.parentNode.removeChild(style) } catch (ignore) { /* ignore */ }
      }
      if (ctx && typeof ctx.effect === "function") {
        try { ctx.effect(function () { return cleanup }, "dsh-qbetter-config: styles") } catch (ignore) { /* ignore */ }
      }
      return cleanup
    } catch (ignore) { return function () {} }
  }

  function callApi(method, args) {
    return fetch("/dsh-qbetter-config/" + method, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(args || {})
    })
      .then(function (response) {
        return response.json().catch(function () { return {} }).then(function (body) {
          if (!response.ok) return { error: body.error || ("HTTP " + response.status) }
          return body
        })
      })
      .catch(function (error) { return { error: String((error && error.message) || error) } })
  }

  function apply(ctx) {
    var slots = ctx && ctx.slots
    if (!slots) return

    injectStyles(ctx, `
      .dshn { font-size: 13px; line-height: 1.55; color: var(--dsw-alias-label-primary, #111827); }
      .dshn h3 { margin: 0 0 10px; font-size: 14px; font-weight: 600; }
      .dshn .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
      .dshn .card { border: 1px solid var(--dsw-alias-border-l1, rgba(0,0,0,.15)); border-radius: 8px; padding: 12px 14px; margin: 10px 0; background: var(--dsw-alias-bg-layer-1, #ffffff); }
      .dshn input:not([type='checkbox']), .dshn textarea, .dshn select { background: var(--dsw-alias-bg-base, #ffffff); color: var(--dsw-alias-label-primary, #111827); border: 1px solid var(--dsw-alias-border-l1, rgba(0,0,0,.15)); border-radius: 6px; padding: 6px 10px; font-size: 13px; width: 100%; box-sizing: border-box; }
      .dshn input:not([type='checkbox']):focus, .dshn textarea:focus, .dshn select:focus { outline: none; border-color: var(--dsw-alias-brand-primary, #2563eb); }
      .dshn textarea { min-height: 56px; font-family: inherit; }
      .dshn button { background: var(--dsw-alias-bg-layer-2, #f3f4f6); color: var(--dsw-alias-label-primary, #111827); border: 1px solid var(--dsw-alias-border-l1, rgba(0,0,0,.15)); border-radius: 6px; padding: 5px 12px; cursor: pointer; font-size: 13px; }
      .dshn button:hover { border-color: var(--dsw-alias-label-secondary, #4b5563); }
      .dshn button.primary { background: var(--dsw-alias-brand-primary, #2563eb); border-color: transparent; color: var(--dsw-alias-label-primary-foreground, #ffffff); }
      .dshn button.danger { color: var(--dsw-alias-state-error-primary, #dc2626); }
      .dshn .muted { opacity: .62; font-size: 12px; color: var(--dsw-alias-label-secondary, #4b5563); }
      .dshn .item { border: 1px solid var(--dsw-alias-border-l1, rgba(0,0,0,.15)); border-radius: 8px; padding: 8px 10px; margin: 6px 0; background: var(--dsw-alias-bg-base, #ffffff); }
      .dshn .hint { font-size: 12px; opacity: .75; background: var(--dsw-alias-bg-layer-2, #f3f4f6); border-radius: 8px; padding: 8px 10px; margin: 8px 0; white-space: pre-wrap; color: var(--dsw-alias-label-secondary, #4b5563); }
      .dshn .err { color: var(--dsw-alias-state-error-primary, #dc2626); font-size: 12px; }
      .dshn pre { background: var(--dsw-alias-bg-base, #ffffff); border: 1px solid var(--dsw-alias-border-l1, rgba(0,0,0,.15)); border-radius: 6px; padding: 8px 10px; font-size: 12px; overflow: auto; white-space: pre-wrap; }
      .dshn table { width: 100%; border-collapse: collapse; font-size: 12px; }
      .dshn th, .dshn td { border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(0,0,0,.15)); padding: 5px 6px; text-align: left; }
      .dshn th { opacity: .6; font-weight: 600; }
      .dshn code { font-family: ui-monospace, Consolas, monospace; }
    `)

    var h = React.createElement
    var el = function (type, props) {
      var children = Array.prototype.slice.call(arguments, 2)
      return h.apply(null, [type, props || {}].concat(children))
    }
    var call = callApi
    var copyText = function (text) { try { navigator.clipboard.writeText(text).catch(function () {}) } catch (ignore) { /* ignore */ } }

    function useData(method) {
      var state = React.useState({ loading: true, data: null, error: null })
      var setState = state[1]
      React.useEffect(function () {
        var alive = true
        call(method, {}).then(function (data) {
          if (alive) setState({ loading: false, data: data, error: null })
        }).catch(function (error) {
          if (alive) setState({ loading: false, data: null, error: String((error && error.message) || error) })
        })
        return function () { alive = false }
      }, [method])
      return state[0]
    }

    function BetterConfigPage() {
      var copiedState = React.useState(null)
      var copied = copiedState[0]
      var setCopied = copiedState[1]
      var msgState = React.useState('')
      var msg = msgState[0]
      var setMsg = msgState[1]
      var modelFormState = React.useState({ provider: '', model: '' })
      var modelForm = modelFormState[0]
      var setModelForm = modelFormState[1]
      var provTextState = React.useState('')
      var provText = provTextState[0]
      var setProvText = provTextState[1]
      var wishState = React.useState({ search: false, schedule: true })
      var wish = wishState[0]
      var setWish = wishState[1]
      var patchState = React.useState('')
      var patch = patchState[0]
      var setPatch = patchState[1]
      var mcpFormState = React.useState({ serverName: '', transport: 'streamable-http', command: 'npx', args: '', url: 'https://example.com/mcp', headers: '' })
      var mcpForm = mcpFormState[0]
      var setMcpForm = mcpFormState[1]
      var mcpsState = React.useState(null)
      var mcps = mcpsState[0]
      var setMcps = mcpsState[1]
      var st = useData('status')

      React.useEffect(function () {
        if (st.data && !st.data.error) {
          var data = st.data
          if (data.model && modelForm.provider === '') setModelForm({ provider: data.model.provider || '', model: data.model.model || '' })
          var pi = (data.settings || []).find(function (item) { return item.ns === 'llm-pi-ai' })
          if (pi && pi.value && provText === '') setProvText(JSON.stringify(pi.value.providers || [], null, 2))
          if (data.wish) setWish({ search: !!data.wish.search, schedule: data.wish.schedule !== false })
          if (data.patch) setPatch(data.patch)
          if (Array.isArray(data.mcpServers)) setMcps(data.mcpServers)
        }
      }, [st.data])

      var saveModel = async function () {
        var result = await call('model', modelForm)
        setMsg(result.ok ? '✓ 默认模型已热更新（settings.yaml 已写入）' : '✗ ' + result.error)
      }
      var saveProviders = async function () {
        try {
          var providers = JSON.parse(provText)
          if (!Array.isArray(providers)) throw new Error('需要 JSON 数组')
          var result = await call('providers', { providers: providers })
          setMsg(result.ok ? '✓ 提供者已热更新（多模型路由立即生效）' : '✗ ' + result.error)
        } catch (error) { setMsg('JSON 解析失败：' + String((error && error.message) || error)) }
      }
      var saveMcp = async function () {
        if (!mcpForm.serverName.trim()) { setMsg('serverName 必填'); return }
        var result = await call('mcp/save', { server: mcpForm })
        if (result.error) setMsg('✗ ' + result.error)
        else { setMcps(result); setMcpForm({ serverName: '', transport: 'streamable-http', command: 'npx', args: '', url: 'https://example.com/mcp', headers: '' }) }
        var status = await call('status')
        if (status.patch) setPatch(status.patch)
      }
      var delMcp = async function (serverName) {
        var result = await call('mcp/delete', { serverName: serverName })
        if (!result.error) setMsg('✓ 已删除 MCP 服务器「' + serverName + '」（重启后完全移除）')
        else setMsg('✗ ' + (result.error || '删除失败'))
        if (!result.error) setMcps(result)
        var status = await call('status')
        if (status.patch) setPatch(status.patch)
      }
      var saveWish = async function (next) {
        var result = await call('wish', next)
        if (!result.error) { setWish({ search: !!result.search, schedule: result.schedule !== false }); setPatch(result.patch) }
      }

      if (st.loading) return el('div', { className: 'muted dshn' }, '加载中…')
      if (st.error) return el('div', { className: 'err dshn' }, '错误：' + st.error)
      var data = st.data || {}
      var json = function (value) { try { return JSON.stringify(value, null, 2) } catch { return String(value) } }

      return el('div', { className: 'dshn' },
        el('h3', null, '配置中心 Config Center'),
        msg ? el('div', { className: 'hint' }, msg) : null,
        el('div', { className: 'card' },
          el('h3', null, '默认模型（热更新，无需重启）'),
          el('div', { className: 'row', style: { marginBottom: 6 } },
            el('input', { style: { flex: 1 }, placeholder: 'provider（如 deepseek-official）', value: modelForm.provider, onChange: function (event) { setModelForm(Object.assign({}, modelForm, { provider: event.target.value })) } }),
            el('input', { style: { flex: 1 }, placeholder: 'model（如 deepseek-v4-flash）', value: modelForm.model, onChange: function (event) { setModelForm(Object.assign({}, modelForm, { model: event.target.value })) } }),
            el('button', { className: 'primary', onClick: saveModel }, '保存')),
          el('div', { className: 'muted' }, '当前：' + ((data.model && (data.model.provider + ' / ' + data.model.model)) || '—'))),
        el('div', { className: 'card' },
          el('h3', null, '多模型路由提供者（llm-pi-ai，热更新）'),
          el('textarea', { placeholder: '[{"name":"zhipu-ai","displayName":"智谱","apiKeyEnv":"ZHIPU_AI_API_KEY","baseURL":"https://open.bigmodel.cn/api/paas/v4","models":[{"id":"glm-4.5-air","name":"GLM-4.5-Air"}]}]', value: provText, onChange: function (event) { setProvText(event.target.value) }, rows: 14, style: { minHeight: 280, fontFamily: 'ui-monospace, Consolas, monospace' } }),
          el('div', { className: 'row', style: { marginTop: 6 } },
            el('button', { className: 'primary', onClick: saveProviders }, '保存提供者'),
            el('span', { className: 'muted' }, '保存后对应模型立即出现在模型选择器中')),
          el('div', { className: 'muted', style: { marginTop: 4 } }, '当前沙箱模式：' + ((data.sandbox && data.sandbox.defaultMode) || '—') + '（工作区根 ' + ((data.sandbox && data.sandbox.workspaceRoot) || '—') + '，切换在权限预设按钮）')),
        el('div', { className: 'card' },
          el('h3', null, 'MCP 服务器（表单管理 → 一键生成补丁）'),
          (mcps || []).map(function (server) {
            return el('div', { key: server.serverName, className: 'item' },
              el('div', { className: 'row', style: { justifyContent: 'space-between' } },
                el('b', null, server.serverName),
                el('button', { className: 'danger', onClick: function () { delMcp(server.serverName) } }, '删除')),
              el('div', { className: 'muted' }, (server.transport === 'stdio' ? 'stdio: ' + (server.command || '') + ' ' + (server.args || '') : server.url || '')))
          }),
          el('div', { className: 'row', style: { marginBottom: 6 } },
            el('input', { style: { flex: 1 }, placeholder: 'serverName（唯一）', value: mcpForm.serverName, onChange: function (event) { setMcpForm(Object.assign({}, mcpForm, { serverName: event.target.value })) } }),
            el('select', { style: { width: 150 }, value: mcpForm.transport, onChange: function (event) { setMcpForm(Object.assign({}, mcpForm, { transport: event.target.value })) } },
              el('option', { value: 'streamable-http' }, 'streamable-http'),
              el('option', { value: 'stdio' }, 'stdio'))),
          mcpForm.transport === 'stdio'
            ? el('div', { className: 'row', style: { marginBottom: 6 } },
              el('input', { style: { flex: 1 }, placeholder: 'command（如 npx）', value: mcpForm.command, onChange: function (event) { setMcpForm(Object.assign({}, mcpForm, { command: event.target.value })) } }),
              el('input', { style: { flex: 2 }, placeholder: 'args（逗号分隔，如 -y, my-mcp-server）', value: mcpForm.args, onChange: function (event) { setMcpForm(Object.assign({}, mcpForm, { args: event.target.value })) } }))
            : el('div', { className: 'row', style: { marginBottom: 6 } },
              el('input', { style: { flex: 3 }, placeholder: 'url（如 https://example.com/mcp）', value: mcpForm.url, onChange: function (event) { setMcpForm(Object.assign({}, mcpForm, { url: event.target.value })) } }),
              el('input', { style: { flex: 2 }, placeholder: 'headers JSON（可选）', value: mcpForm.headers, onChange: function (event) { setMcpForm(Object.assign({}, mcpForm, { headers: event.target.value })) } })),
          el('div', { className: 'row' },
            el('button', { className: 'primary', onClick: saveMcp }, '添加/更新服务器'),
            el('span', { className: 'muted' }, 'MCP 连接需重启后生效（补丁在下方生成）'))),
        el('div', { className: 'card' },
          el('h3', null, '内置能力开关（重启后生效）'),
          el('div', { className: 'row', style: { marginBottom: 6 } },
            el('label', null, el('input', { type: 'checkbox', checked: wish.schedule, onChange: function (event) { saveWish(Object.assign({}, wish, { schedule: event.target.checked })) } }), ' 内置定时任务 dsh-schedule'),
            el('label', null, el('input', { type: 'checkbox', checked: wish.search, onChange: function (event) { saveWish(Object.assign({}, wish, { search: event.target.checked })) } }), ' 会话全文搜索（SQLite FTS5）')),
          el('div', { className: 'row' },
            el('button', { onClick: function () { copyText(patch); setCopied('patch') } }, copied === 'patch' ? '已复制 ✓' : '复制补丁'),
            el('span', { className: 'muted' }, '贴入 profiles/web/cordis.patch.yml 后重启；或回复我"写入补丁"由我自动写入')),
          el('pre', null, patch)),
        el('div', { className: 'card' },
          el('h3', null, '设置命名空间（settings.yaml）'),
          (data.settings || []).length === 0 ? el('div', { className: 'muted' }, '无已注册命名空间') :
            (data.settings || []).map(function (item) {
              return el('div', { key: item.ns, className: 'item' },
                el('b', null, item.ns),
                el('pre', null, json(item.value)))
            })),
        el('div', { className: 'card' },
          el('h3', null, '环境变量'),
          el('table', null,
            el('thead', null, el('tr', null, el('th', null, '变量'), el('th', null, '说明'))),
            el('tbody', null, (data.env || []).map(function (pair) {
              return el('tr', { key: pair[0] },
                el('td', null, el('code', null, pair[0])), el('td', { className: 'muted' }, pair[1]))
            })))),
      )
    }

    slots.inject('settings.section', function () {
      return slots.register({ name: 'settings.section', id: 'dsh-qbetter-config', order: 90, label: function () { return '配置中心' } }, function () { return el(BetterConfigPage) })
    })
  }

  exports.name = name
  exports.inject = inject
  exports.apply = apply
  return module.exports
}})
