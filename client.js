// dsh-better-config Client half v3 — 配置中心：真实表单（模型/提供者/MCP/开关）+ 原生主题样式
return {
  async apply(ctx) {
    const slots = ctx.get('slots')
    if (slots === undefined) return
    styles.insert(`
      .dshn { font-size: 13px; line-height: 1.55; color: var(--dsw-alias-label-primary, #111827); }
      .dshn h3 { margin: 0 0 10px; font-size: 14px; font-weight: 600; }
      .dshn .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
      .dshn .card { border: 1px solid var(--dsw-alias-border-l1, rgba(0,0,0,.15)); border-radius: 8px; padding: 12px 14px; margin: 10px 0; background: var(--dsw-alias-bg-layer-1, #ffffff); }
      .dshn input, .dshn textarea, .dshn select { background: var(--dsw-alias-bg-base, #ffffff); color: var(--dsw-alias-label-primary, #111827); border: 1px solid var(--dsw-alias-border-l1, rgba(0,0,0,.15)); border-radius: 6px; padding: 6px 10px; font-size: 13px; width: 100%; box-sizing: border-box; }
      .dshn input:focus, .dshn textarea:focus, .dshn select:focus { outline: none; border-color: var(--dsw-alias-brand-primary, #2563eb); }
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
    const h = React.createElement
    const el = (type, props, ...children) => h(type, props || {}, ...children)
    const call = (method, args) => host.call(method, args || {}).catch((e) => ({ error: String((e && e.message) || e) }))
    const copyText = (text) => { try { navigator.clipboard.writeText(text).catch(() => {}) } catch (e) { /* ignore */ } }

    function useData(method) {
      const [state, setState] = React.useState({ loading: true, data: null, error: null })
      React.useEffect(() => {
        let alive = true
        host.call(method, {})
          .then((d) => { if (alive) setState({ loading: false, data: d, error: null }) })
          .catch((e) => { if (alive) setState({ loading: false, data: null, error: String((e && e.message) || e) }) })
        return () => { alive = false }
      }, [method])
      return state
    }

    function BetterConfigPage() {
      const [copied, setCopied] = React.useState(null)
      const [msg, setMsg] = React.useState('')
      const [modelForm, setModelForm] = React.useState({ provider: '', model: '' })
      const [provText, setProvText] = React.useState('')
      const [wish, setWish] = React.useState({ search: false, schedule: true })
      const [patch, setPatch] = React.useState('')
      const [mcpForm, setMcpForm] = React.useState({ serverName: '', transport: 'streamable-http', command: 'npx', args: '', url: 'https://example.com/mcp', headers: '' })
      const [mcps, setMcps] = React.useState(null)
      const st = useData('config/status')
      React.useEffect(() => {
        if (st.data && !st.data.error) {
          const d = st.data
          if (d.model && modelForm.provider === '') setModelForm({ provider: d.model.provider || '', model: d.model.model || '' })
          const pi = (d.settings || []).find((s) => s.ns === 'llm-pi-ai')
          if (pi && pi.value && provText === '') setProvText(JSON.stringify(pi.value.providers || [], null, 2))
          if (d.wish) setWish({ search: !!d.wish.search, schedule: d.wish.schedule !== false })
          if (d.patch) setPatch(d.patch)
          if (Array.isArray(d.mcpServers)) setMcps(d.mcpServers)
        }
      }, [st.data])
      const saveModel = async () => {
        const r = await call('config/model', modelForm)
        setMsg(r.ok ? '✓ 默认模型已热更新（settings.yaml 已写入）' : '✗ ' + r.error)
      }
      const saveProviders = async () => {
        try {
          const providers = JSON.parse(provText)
          if (!Array.isArray(providers)) throw new Error('需要 JSON 数组')
          const r = await call('config/providers', { providers })
          setMsg(r.ok ? '✓ 提供者已热更新（多模型路由立即生效）' : '✗ ' + r.error)
        } catch (e) { setMsg('JSON 解析失败：' + String(e && e.message || e)) }
      }
      const saveMcp = async () => {
        if (!mcpForm.serverName.trim()) { setMsg('serverName 必填'); return }
        const r = await call('config/mcp/save', { server: mcpForm })
        if (r.error) setMsg('✗ ' + r.error)
        else { setMcps(r); setMcpForm({ serverName: '', transport: 'streamable-http', command: 'npx', args: '', url: 'https://example.com/mcp', headers: '' }) }
        const st2 = await call('config/status')
        if (st2.patch) setPatch(st2.patch)
      }
      const delMcp = async (serverName) => {
        const r = await call('config/mcp/delete', { serverName })
        if (!r.error) setMsg('✓ 已删除 MCP 服务器「' + serverName + '」（重启后完全移除）')
        else setMsg('✗ ' + (r.error || '删除失败'))
        if (!r.error) setMcps(r)
        const st2 = await call('config/status')
        if (st2.patch) setPatch(st2.patch)
      }
      const saveWish = async (next) => {
        const r = await call('config/wish', next)
        if (!r.error) { setWish({ search: !!r.search, schedule: r.schedule !== false }); setPatch(r.patch) }
      }
      if (st.loading) return el('div', { className: 'muted dshn' }, '加载中…')
      if (st.error) return el('div', { className: 'err dshn' }, '错误：' + st.error)
      const d = st.data || {}
      const json = (v) => { try { return JSON.stringify(v, null, 2) } catch { return String(v) } }
      return el('div', { className: 'dshn' },
        el('h3', null, '配置中心 Config Center'),
        msg ? el('div', { className: 'hint' }, msg) : null,
        el('div', { className: 'card' },
          el('h3', null, '默认模型（热更新，无需重启）'),
          el('div', { className: 'row', style: { marginBottom: 6 } },
            el('input', { style: { flex: 1 }, placeholder: 'provider（如 deepseek-official）', value: modelForm.provider, onChange: (e) => setModelForm({ ...modelForm, provider: e.target.value }) }),
            el('input', { style: { flex: 1 }, placeholder: 'model（如 deepseek-v4-flash）', value: modelForm.model, onChange: (e) => setModelForm({ ...modelForm, model: e.target.value }) }),
            el('button', { className: 'primary', onClick: saveModel }, '保存')),
          el('div', { className: 'muted' }, '当前：' + ((d.model && (d.model.provider + ' / ' + d.model.model)) || '—'))),
        el('div', { className: 'card' },
          el('h3', null, '多模型路由提供者（llm-pi-ai，热更新）'),
          el('textarea', { placeholder: '[{"name":"zhipu-ai","displayName":"智谱","apiKeyEnv":"ZHIPU_AI_API_KEY","baseURL":"https://open.bigmodel.cn/api/paas/v4","models":[{"id":"glm-4.5-air","name":"GLM-4.5-Air"}]}]', value: provText, onChange: (e) => setProvText(e.target.value), rows: 14, style: { minHeight: 280, fontFamily: 'ui-monospace, Consolas, monospace' } }),
          el('div', { className: 'row', style: { marginTop: 6 } },
            el('button', { className: 'primary', onClick: saveProviders }, '保存提供者'),
            el('span', { className: 'muted' }, '保存后对应模型立即出现在模型选择器中')),
          el('div', { className: 'muted', style: { marginTop: 4 } }, '当前沙箱模式：' + ((d.sandbox && d.sandbox.defaultMode) || '—') + '（工作区根 ' + ((d.sandbox && d.sandbox.workspaceRoot) || '—') + '，切换在权限预设按钮）')),
        el('div', { className: 'card' },
          el('h3', null, 'MCP 服务器（表单管理 → 一键生成补丁）'),
          (mcps || []).map((s) => el('div', { key: s.serverName, className: 'item' },
            el('div', { className: 'row', style: { justifyContent: 'space-between' } },
              el('b', null, s.serverName),
              el('button', { className: 'danger', onClick: () => delMcp(s.serverName) }, '删除')),
            el('div', { className: 'muted' }, (s.transport === 'stdio' ? 'stdio: ' + (s.command || '') + ' ' + (s.args || '') : s.url || '')))),
          el('div', { className: 'row', style: { marginBottom: 6 } },
            el('input', { style: { flex: 1 }, placeholder: 'serverName（唯一）', value: mcpForm.serverName, onChange: (e) => setMcpForm({ ...mcpForm, serverName: e.target.value }) }),
            el('select', { style: { width: 150 }, value: mcpForm.transport, onChange: (e) => setMcpForm({ ...mcpForm, transport: e.target.value }) },
              el('option', { value: 'streamable-http' }, 'streamable-http'),
              el('option', { value: 'stdio' }, 'stdio'))),
          mcpForm.transport === 'stdio'
            ? el('div', { className: 'row', style: { marginBottom: 6 } },
              el('input', { style: { flex: 1 }, placeholder: 'command（如 npx）', value: mcpForm.command, onChange: (e) => setMcpForm({ ...mcpForm, command: e.target.value }) }),
              el('input', { style: { flex: 2 }, placeholder: 'args（逗号分隔，如 -y, my-mcp-server）', value: mcpForm.args, onChange: (e) => setMcpForm({ ...mcpForm, args: e.target.value }) }))
            : el('div', { className: 'row', style: { marginBottom: 6 } },
              el('input', { style: { flex: 3 }, placeholder: 'url（如 https://example.com/mcp）', value: mcpForm.url, onChange: (e) => setMcpForm({ ...mcpForm, url: e.target.value }) }),
              el('input', { style: { flex: 2 }, placeholder: 'headers JSON（可选）', value: mcpForm.headers, onChange: (e) => setMcpForm({ ...mcpForm, headers: e.target.value }) })),
          el('div', { className: 'row' },
            el('button', { className: 'primary', onClick: saveMcp }, '添加/更新服务器'),
            el('span', { className: 'muted' }, 'MCP 连接需重启后生效（补丁在下方生成）'))),
        el('div', { className: 'card' },
          el('h3', null, '内置能力开关（重启后生效）'),
          el('div', { className: 'row', style: { marginBottom: 6 } },
            el('label', null, el('input', { type: 'checkbox', checked: wish.schedule, onChange: (e) => saveWish({ ...wish, schedule: e.target.checked }) }), ' 内置定时任务 dsh-schedule'),
            el('label', null, el('input', { type: 'checkbox', checked: wish.search, onChange: (e) => saveWish({ ...wish, search: e.target.checked }) }), ' 会话全文搜索（SQLite FTS5）')),
          el('div', { className: 'row' },
            el('button', { onClick: () => { copyText(patch); setCopied('patch') } }, copied === 'patch' ? '已复制 ✓' : '复制补丁'),
            el('span', { className: 'muted' }, '贴入 profiles/web/cordis.patch.yml 后重启；或回复我"写入补丁"由我自动写入')),
          el('pre', null, patch)),
        el('div', { className: 'card' },
          el('h3', null, '设置命名空间（settings.yaml）'),
          (d.settings || []).length === 0 ? el('div', { className: 'muted' }, '无已注册命名空间') :
            (d.settings || []).map((s) => el('div', { key: s.ns, className: 'item' },
              el('b', null, s.ns),
              el('pre', null, json(s.value))))),
        el('div', { className: 'card' },
          el('h3', null, '环境变量'),
          el('table', null,
            el('thead', null, el('tr', null, el('th', null, '变量'), el('th', null, '说明'))),
            el('tbody', null, (d.env || []).map(([k, v]) => el('tr', { key: k },
              el('td', null, el('code', null, k)), el('td', { className: 'muted' }, v)))))),
      )
    }

    slots.inject('settings.section', () =>
      slots.register({ name: 'settings.section', id: 'dsh-better-config', order: 90, label: () => '配置中心' }, () => el(BetterConfigPage)))
  },
}
