// ┌─ MOTOR (genérico · não re-derivar) ─────────────────────────────────────────┐
// │ app-shell.jsx — AppShell({role}): a casca consolidada de UM papel/superfície. │
// │ Orquestra os eixos e roteia por registry. É a engine ÚNICA de cada            │
// │ consolidado — você NÃO edita isto; customiza o design-system (ds.jsx).         │
// │                                                                              │
// │ Eixos: mode (produto↔showcase) · device (desktop↔mobile) · platform           │
// │   (ios↔android) · theme (light↔dark) · lang · active(nav) · screenState.       │
// │                                                                              │
// │ // SEAM: o seu design-system DEVE prover estes globais —                      │
// │   I18nProvider · useT · GlobalKeyframes · ROLES · brandFor ·                   │
// │   Shell (sidebar desktop) · MobileShell (bottom-nav) · Icon · EmptyState.      │
// │ Extensões opcionais (espelha o app-shell do consolidado):                     │
// │   branding ao vivo (swatches) · eixo semântico extra opcional                 │
// │   (SwGroup tone="semantic").                                                  │
// └─────────────────────────────────────────────────────────────────────────────┘

function AppShell({ role }) {
  const r = ROLES[role] || ROLES[Object.keys(ROLES)[0]];
  // Hooks SEMPRE no topo, antes de qualquer return condicional (gotcha #1).
  const [mode, setMode] = React.useState('produto');
  const [device, setDevice] = React.useState('desktop');
  const [platform, setPlatform] = React.useState('ios');
  const [theme, setTheme] = React.useState('light');
  const [lang, setLang] = React.useState('pt-BR');
  const [active, setActive] = React.useState(r.home);
  const [screenState, setScreenState] = React.useState('default');
  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);

  return (
    <I18nProvider lang={lang}>
      <GlobalKeyframes />
      <DeviceTokens />
      <AppShellInner {...{ role, r, mode, setMode, device, setDevice, platform, setPlatform, theme, setTheme, lang, setLang, active, setActive, screenState, setScreenState, collapsed, setCollapsed }} />
    </I18nProvider>
  );
}

function AppShellInner(p) {
  const { t } = useT();
  const [bodyRef, bodySize] = useElementSize();
  return (
    <div className="showcase-shell" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      <ReviewStrip {...p} t={t} />
      <div ref={bodyRef} style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
        {p.mode === 'showcase'
          ? <AppShowcase role={p.role} screenState={p.screenState} device={p.device} platform={p.platform} theme={p.theme} />
          : <ProductBody {...p} bodySize={bodySize} />}
      </div>
    </div>
  );
}

// ReviewStrip — chrome de revisão: identidade do produto + switchers (modo/device/
// plataforma/tema/estado/idioma). As classes (.showcase-header etc.) vêm do <style>
// no index.html → é o que colapsa em viewport estreito (responsividade do chrome).
function ReviewStrip(p) {
  const { t } = p;
  const id = brandFor(p.role);
  const showcase = p.mode === 'showcase';
  return (
    <header className="showcase-header" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', padding: '8px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', minHeight: 52 }}>
      <div className="showcase-brand" style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>{id.name}</span>
        <span className="brand-suffix" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)', border: '1px solid var(--border)', borderRadius: 'var(--radius-pill)', padding: '2px 8px' }}>{t('app.proto')}</span>
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand)' }}>{t(p.r.nameKey)}</span>

      <div className="showcase-switchers" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <SwGroup label={t('sw.mode')} value={p.mode} onChange={p.setMode} options={[{ key: 'produto', label: t('mode.produto') }, { key: 'showcase', label: t('mode.showcase') }]} />
        <SwGroup label={t('sw.device')} value={p.device} onChange={p.setDevice} options={[{ key: 'desktop', label: t('device.desktop') }, { key: 'mobile', label: t('device.mobile') }]} />
        {p.device === 'mobile' && <SwGroup label={t('sw.platform')} value={p.platform} onChange={p.setPlatform} options={[{ key: 'ios', label: t('platform.ios') }, { key: 'android', label: t('platform.android') }]} />}
        <SwGroup label={t('sw.theme')} value={p.theme} onChange={p.setTheme} options={[{ key: 'light', label: t('theme.light') }, { key: 'dark', label: t('theme.dark') }]} />
        {showcase && <SwGroup label={t('sw.state')} value={p.screenState} onChange={p.setScreenState} options={[{ key: 'default', label: t('state.default') }, { key: 'loading', label: t('state.loading') }, { key: 'empty', label: t('state.empty') }, { key: 'error', label: t('state.error') }]} />}
        {showcase && <SwGroup label={t('sw.lang')} value={p.lang} onChange={p.setLang} options={[{ key: 'pt-BR', label: 'PT' }, { key: 'en', label: 'EN' }]} />}
      </div>
    </header>
  );
}

// ProductBody — o app real navegável. Desktop = Shell+sidebar; Mobile = device-frame
// escalado com MobileShell (single-pane + bottom-nav). Router por registry, sem ternário.
function ProductBody(p) {
  const Screen = getScreen(p.active);

  if (p.device === 'mobile') {
    const inner = (
      <MobileShell role={p.role} active={p.active} onNav={p.setActive}>
        <ScreenBoundary key={p.active} screenKey={p.active}>
          {Screen ? <Screen device="mobile" screenState="default" /> : <SoonInline />}
        </ScreenBoundary>
      </MobileShell>
    );
    // Escala SEMPRE p/ caber no palco (1:1 em tela grande, encolhe em palco menor).
    const avail = { width: Math.max(0, p.bodySize.width - 40), height: Math.max(0, p.bodySize.height - 40) };
    return (
      <div className="showcase-body" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', padding: 20, overflow: 'hidden' }}>
        <ScaledDevice platform={p.platform} theme={p.theme} avail={avail}>{inner}</ScaledDevice>
      </div>
    );
  }

  // Desktop — é o produto: Shell (sidebar) + router por nav.
  return (
    <Shell role={p.role} active={p.active} onNav={p.setActive} collapsed={p.collapsed} onToggle={() => p.setCollapsed((v) => !v)}>
      <ScreenBoundary key={p.active} screenKey={p.active}>
        {Screen ? <Screen device="desktop" screenState="default" /> : <SoonInline />}
      </ScreenBoundary>
    </Shell>
  );
}

// Placeholder p/ nav-key sem screen registrada (a "ComingSoon" do modelo).
function SoonInline() {
  const { t } = useT();
  return React.createElement('div', { style: { flex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 } },
    React.createElement(EmptyState, { icon: 'grid', title: t('soon.title'), body: t('soon.body') }),
  );
}
