// ┌─ MOTOR (NÃO TOQUE) ─────────────────────────────────────────────────────────┐
// │ engine.jsx — o motor cadillac concatenado (registry + device-frame + showcase  │
// │ + app-shell + i18n-chrome), idêntico aos arquivos em ../../templates/. É o      │
// │ pedaço "que sempre funciona": você customiza ds.jsx e screens.jsx, nunca isto.  │
// │ Consome do ds.jsx: I18nProvider · useT · GlobalKeyframes · ROLES · brandFor ·   │
// │ Shell · MobileShell · Icon · Card · EmptyState · Tag · TRANSLATIONS.            │
// └─────────────────────────────────────────────────────────────────────────────┘

// ===== registry + router =======================================================
window.AppScreens = window.AppScreens || {};
function registerScreen(key, component) { window.AppScreens[key] = component; }
function getScreen(key) { return (window.AppScreens || {})[key] || null; }

class ScreenBoundary extends React.Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err, info) { console.error('[screen error]', this.props.screenKey, err, info); }
  componentDidUpdate(prev) { if (prev.screenKey !== this.props.screenKey && this.state.err) this.setState({ err: null }); }
  render() {
    if (this.state.err) {
      const e = this.state.err;
      return React.createElement('div', { style: { flex: 1, padding: 32, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', textAlign: 'center' } },
        React.createElement('div', { style: { fontSize: 16, fontWeight: 700 } }, 'Erro de render em "' + this.props.screenKey + '"'),
        React.createElement('code', { style: { fontSize: 12, padding: 12, borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', maxWidth: '100%', overflow: 'auto', whiteSpace: 'pre-wrap', textAlign: 'left' } }, String(e && (e.stack || e.message) || e)),
      );
    }
    return this.props.children;
  }
}

function SwGroup({ label, value, onChange, options, tone }) {
  return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
    label ? React.createElement('span', { className: 'sw-label', style: swLabel }, label) : null,
    React.createElement('div', { style: swWrap, role: 'tablist' },
      options.map((o) => {
        const act = value === o.key;
        let activeBg = 'var(--brand)', activeFg = 'var(--brand-fg)';
        if (tone === 'window' && act) { const c = { open: 'var(--success)', closing: 'var(--warning)', closed: 'var(--danger)' }[o.key]; activeBg = c; activeFg = '#fff'; }
        return React.createElement('button', { key: o.key, role: 'tab', 'aria-selected': act, onClick: () => onChange(o.key), className: 'press',
          style: { border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', background: act ? activeBg : 'transparent', color: act ? activeFg : 'var(--text-muted)', transition: 'all 150ms var(--ease)' } }, o.label);
      }),
    ),
  );
}
const swLabel = { fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-faint)' };
const swWrap = { display: 'flex', gap: 2, background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: 3 };

// ===== device-frame (mobile + fit-to-stage) ====================================
const DEVICE_W = 390, DEVICE_H = 800;
const FRAME_BEZEL = { ios: 18, android: 6 };
function DeviceTokens() {
  return React.createElement('style', null,
    ':root{--device-shadow:0 50px 90px -30px rgba(20,20,30,0.45), 0 0 0 1px rgba(20,20,30,0.06)}' +
    '[data-theme="dark"]{--device-shadow:0 50px 90px -30px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.05)}');
}
function useIsMobile() {
  const [mobile, setMobile] = React.useState(() => window.matchMedia('(max-width: 900px)').matches);
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const onChange = (e) => setMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return mobile;
}
function useElementSize() {
  const ref = React.useRef(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver((entries) => { const r = entries[0].contentRect; setSize({ width: r.width, height: r.height }); });
    ro.observe(el); return () => ro.disconnect();
  }, []);
  return [ref, size];
}
function DeviceFrame({ platform, theme, children }) {
  const W = DEVICE_W, H = DEVICE_H;
  const fg = theme === 'dark' ? '#FAF7F2' : '#1A1A1F';
  if (platform === 'android') {
    return React.createElement('div', { style: { width: W + 6, height: H + 6, background: '#1A1A1F', borderRadius: 32, padding: 3, boxShadow: 'var(--device-shadow)', flexShrink: 0 } },
      React.createElement('div', { style: { width: W, height: H, background: 'var(--bg)', borderRadius: 30, overflow: 'hidden', position: 'relative' } },
        React.createElement('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', fontSize: 12, fontWeight: 600, color: fg, zIndex: 30, pointerEvents: 'none' } },
          React.createElement('span', { style: { fontVariantNumeric: 'tabular-nums' } }, '21:42'), React.createElement('span', null, '•••  87%')),
        React.createElement('div', { style: { position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 12, height: 12, background: '#0A0A0E', borderRadius: '50%', zIndex: 40 } }),
        React.createElement('div', { style: { position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', width: 100, height: 3, background: fg, borderRadius: 2, opacity: 0.5, zIndex: 30, pointerEvents: 'none' } }),
        React.createElement('div', { style: { position: 'absolute', inset: 0, paddingTop: 28, paddingBottom: 18 } }, children)));
  }
  return React.createElement('div', { style: { width: W + 18, height: H + 18, background: '#0A0A0E', borderRadius: 56, padding: 9, boxShadow: 'var(--device-shadow)', position: 'relative', flexShrink: 0 } },
    React.createElement('div', { style: { width: W, height: H, background: 'var(--bg)', borderRadius: 47, overflow: 'hidden', position: 'relative' } },
      React.createElement('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, height: 44, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 28px 8px', fontSize: 13, fontWeight: 700, color: fg, zIndex: 30, pointerEvents: 'none' } },
        React.createElement('span', { style: { fontVariantNumeric: 'tabular-nums' } }, '21:42'), React.createElement('span', null, '● ● ● 100%')),
      React.createElement('div', { style: { position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)', width: 120, height: 34, background: '#0A0A0E', borderRadius: 24, zIndex: 40 } }),
      React.createElement('div', { style: { position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 134, height: 5, background: fg, borderRadius: 3, opacity: 0.92, zIndex: 30, pointerEvents: 'none' } }),
      React.createElement('div', { style: { position: 'absolute', inset: 0, paddingTop: 44, paddingBottom: 24 } }, children)));
}
function ScaledDevice({ platform, theme, avail, children }) {
  const bezel = FRAME_BEZEL[platform];
  const frameW = DEVICE_W + bezel, frameH = DEVICE_H + bezel;
  const scale = avail.width > 0 && avail.height > 0 ? Math.min(1, avail.width / frameW, avail.height / frameH) : 0;
  return React.createElement('div', { style: { width: frameW * scale, height: frameH * scale, visibility: scale > 0 ? 'visible' : 'hidden' } },
    React.createElement('div', { style: { transform: `scale(${scale})`, transformOrigin: 'top left' } },
      React.createElement(DeviceFrame, { platform, theme }, children)));
}

// ===== showcase tela-a-tela ====================================================
function AppShowcase({ role, screenState, device, platform, theme }) {
  const { t } = useT();
  const r = ROLES[role] || ROLES[Object.keys(ROLES)[0]];
  const items = r.nav.reduce((acc, s) => acc.concat(s.items), []).filter((it) => getScreen(it.key));
  return React.createElement('div', { style: { position: 'absolute', inset: 0, overflow: 'auto', background: 'var(--surface-2)' } },
    React.createElement('div', { style: { maxWidth: 1180, margin: '0 auto', padding: '22px 24px 60px', display: 'flex', flexDirection: 'column', gap: 26 } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } },
        React.createElement('h2', { style: { margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' } }, t('showcase.title')),
        React.createElement('span', { style: { fontSize: 11.5, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 6 } }, React.createElement(Icon, { name: 'info', size: 13 }), t('showcase.live'))),
      items.length === 0 ? React.createElement(Card, { style: { maxWidth: 460 } }, React.createElement(EmptyState, { icon: 'grid', title: t('showcase.empty') })) : null,
      items.map((it) => React.createElement(ShowcaseBlock, { key: it.key + '-' + screenState + '-' + device, item: it, screenState, device, platform, theme })),
    ));
}
function ShowcaseBlock({ item, screenState, device, platform, theme }) {
  const { t } = useT();
  const Screen = getScreen(item.key);
  const stateLabel = { default: t('state.default'), loading: t('state.loading'), empty: t('state.empty'), error: t('state.error') }[screenState] || screenState;
  const screenEl = React.createElement(ScreenBoundary, { key: item.key + screenState, screenKey: item.key + screenState }, React.createElement(Screen, { device, screenState }));
  return React.createElement('section', null,
    React.createElement('header', { style: { display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 } },
      React.createElement('span', { style: { display: 'inline-flex', width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--r)', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' } }, React.createElement(Icon, { name: item.icon, size: 15 })),
      React.createElement('h3', { style: { margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' } }, t(item.labelKey)),
      React.createElement(Tag, { tone: screenState === 'error' ? 'danger' : screenState === 'empty' ? 'neutral' : screenState === 'loading' ? 'warning' : 'brand' }, stateLabel)),
    device === 'mobile'
      ? React.createElement('div', { style: { display: 'flex', justifyContent: 'center', padding: '8px 0 4px' } }, React.createElement(DeviceFrame, { platform, theme }, screenEl))
      : React.createElement('div', { style: { height: 640, borderRadius: 'var(--rb)', border: '1px solid var(--border)', background: 'var(--bg)', overflow: 'hidden', boxShadow: 'var(--e1)', display: 'flex', flexDirection: 'column' } }, screenEl));
}

// ===== app-shell (orquestração) ================================================
function AppShell({ role }) {
  const r = ROLES[role] || ROLES[Object.keys(ROLES)[0]];
  const [mode, setMode] = React.useState('produto');
  const [device, setDevice] = React.useState('desktop');
  const [platform, setPlatform] = React.useState('ios');
  const [theme, setTheme] = React.useState('light');
  const [lang, setLang] = React.useState('pt-BR');
  const [active, setActive] = React.useState(r.home);
  const [screenState, setScreenState] = React.useState('default');
  const [collapsed, setCollapsed] = React.useState(false);
  React.useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);
  return React.createElement(I18nProvider, { lang },
    React.createElement(GlobalKeyframes, null),
    React.createElement(DeviceTokens, null),
    React.createElement(AppShellInner, { role, r, mode, setMode, device, setDevice, platform, setPlatform, theme, setTheme, lang, setLang, active, setActive, screenState, setScreenState, collapsed, setCollapsed }));
}
function AppShellInner(p) {
  const { t } = useT();
  const [bodyRef, bodySize] = useElementSize();
  // height inline (100dvh): a barra de endereço do mobile não corta a última faixa.
  return React.createElement('div', { className: 'showcase-shell', style: { display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' } },
    React.createElement(ReviewStrip, Object.assign({}, p, { t })),
    React.createElement('div', { ref: bodyRef, style: { flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' } },
      p.mode === 'showcase'
        ? React.createElement(AppShowcase, { role: p.role, screenState: p.screenState, device: p.device, platform: p.platform, theme: p.theme })
        : React.createElement(ProductBody, Object.assign({}, p, { bodySize }))));
}
function ReviewStrip(p) {
  const { t } = p;
  const id = brandFor(p.role);
  const showcase = p.mode === 'showcase';
  return React.createElement('header', { className: 'showcase-header', style: { display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', padding: '8px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', minHeight: 52 } },
    React.createElement('div', { className: 'showcase-brand', style: { display: 'flex', alignItems: 'baseline', gap: 7 } },
      React.createElement('span', { style: { fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' } }, id.name),
      React.createElement('span', { className: 'brand-suffix', style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)', border: '1px solid var(--border)', borderRadius: 'var(--radius-pill)', padding: '2px 8px' } }, t('app.proto'))),
    React.createElement('span', { style: { fontSize: 12, fontWeight: 600, color: 'var(--brand)' } }, t(p.r.nameKey)),
    React.createElement('div', { className: 'showcase-switchers', style: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' } },
      React.createElement(SwGroup, { label: t('sw.mode'), value: p.mode, onChange: p.setMode, options: [{ key: 'produto', label: t('mode.produto') }, { key: 'showcase', label: t('mode.showcase') }] }),
      React.createElement(SwGroup, { label: t('sw.device'), value: p.device, onChange: p.setDevice, options: [{ key: 'desktop', label: t('device.desktop') }, { key: 'mobile', label: t('device.mobile') }] }),
      p.device === 'mobile' ? React.createElement(SwGroup, { label: t('sw.platform'), value: p.platform, onChange: p.setPlatform, options: [{ key: 'ios', label: t('platform.ios') }, { key: 'android', label: t('platform.android') }] }) : null,
      React.createElement(SwGroup, { label: t('sw.theme'), value: p.theme, onChange: p.setTheme, options: [{ key: 'light', label: t('theme.light') }, { key: 'dark', label: t('theme.dark') }] }),
      showcase ? React.createElement(SwGroup, { label: t('sw.state'), value: p.screenState, onChange: p.setScreenState, options: [{ key: 'default', label: t('state.default') }, { key: 'loading', label: t('state.loading') }, { key: 'empty', label: t('state.empty') }, { key: 'error', label: t('state.error') }] }) : null,
      showcase ? React.createElement(SwGroup, { label: t('sw.lang'), value: p.lang, onChange: p.setLang, options: [{ key: 'pt-BR', label: 'PT' }, { key: 'en', label: 'EN' }] }) : null));
}
function ProductBody(p) {
  const Screen = getScreen(p.active);
  if (p.device === 'mobile') {
    const inner = React.createElement(MobileShell, { role: p.role, active: p.active, onNav: p.setActive },
      React.createElement(ScreenBoundary, { key: p.active, screenKey: p.active },
        Screen ? React.createElement(Screen, { device: 'mobile', screenState: 'default' }) : React.createElement(SoonInline, null)));
    const avail = { width: Math.max(0, p.bodySize.width - 40), height: Math.max(0, p.bodySize.height - 40) };
    return React.createElement('div', { className: 'showcase-body', style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', padding: 20, overflow: 'hidden' } },
      React.createElement(ScaledDevice, { platform: p.platform, theme: p.theme, avail }, inner));
  }
  return React.createElement(Shell, { role: p.role, active: p.active, onNav: p.setActive, collapsed: p.collapsed, onToggle: () => p.setCollapsed((v) => !v) },
    React.createElement(ScreenBoundary, { key: p.active, screenKey: p.active },
      Screen ? React.createElement(Screen, { device: 'desktop', screenState: 'default' }) : React.createElement(SoonInline, null)));
}
function SoonInline() {
  const { t } = useT();
  return React.createElement('div', { style: { flex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 } },
    React.createElement(EmptyState, { icon: 'grid', title: t('soon.title'), body: t('soon.body') }));
}

// ===== i18n-chrome (vocabulário do motor · merge não-destrutivo) ===============
(function () {
  const add = {
    'pt-BR': { 'app.proto': 'Protótipo', 'sw.mode': 'Modo', 'sw.device': 'Tela', 'sw.platform': 'Plataforma', 'sw.theme': 'Tema', 'sw.state': 'Estado', 'sw.lang': 'Idioma', 'mode.produto': 'Produto', 'mode.showcase': 'Showcase', 'device.desktop': 'Desktop', 'device.mobile': 'Mobile', 'platform.ios': 'iOS', 'platform.android': 'Android', 'theme.light': 'Claro', 'theme.dark': 'Escuro', 'state.default': 'Padrão', 'state.loading': 'Carregando', 'state.empty': 'Vazio', 'state.error': 'Erro', 'showcase.title': 'Showcase tela-a-tela', 'showcase.live': 'hover · focus · active · disabled ficam vivos nos componentes — interaja para vê-los.', 'showcase.empty': 'Nenhuma tela registrada para este papel ainda.', 'soon.title': 'Em breve', 'soon.body': 'Esta superfície ainda não foi prototipada.' },
    'en': { 'app.proto': 'Prototype', 'sw.mode': 'Mode', 'sw.device': 'Screen', 'sw.platform': 'Platform', 'sw.theme': 'Theme', 'sw.state': 'State', 'sw.lang': 'Language', 'mode.produto': 'Product', 'mode.showcase': 'Showcase', 'device.desktop': 'Desktop', 'device.mobile': 'Mobile', 'platform.ios': 'iOS', 'platform.android': 'Android', 'theme.light': 'Light', 'theme.dark': 'Dark', 'state.default': 'Default', 'state.loading': 'Loading', 'state.empty': 'Empty', 'state.error': 'Error', 'showcase.title': 'Screen-by-screen showcase', 'showcase.live': 'hover · focus · active · disabled are live in the components — interact to see them.', 'showcase.empty': 'No screen registered for this role yet.', 'soon.title': 'Coming soon', 'soon.body': 'This surface has not been prototyped yet.' },
  };
  if (typeof TRANSLATIONS !== 'undefined') {
    Object.keys(add).forEach((lng) => { TRANSLATIONS[lng] = TRANSLATIONS[lng] || {}; Object.keys(add[lng]).forEach((k) => { if (TRANSLATIONS[lng][k] === undefined) TRANSLATIONS[lng][k] = add[lng][k]; }); });
  }
})();
