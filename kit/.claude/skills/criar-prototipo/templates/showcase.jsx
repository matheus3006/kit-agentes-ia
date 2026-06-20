// ┌─ MOTOR (genérico · não re-derivar) ─────────────────────────────────────────┐
// │ showcase.jsx — modo "Showcase tela-a-tela": percorre CADA tela registrada do  │
// │ papel no ESTADO selecionado (default/loading/empty/error), emoldurada. Os      │
// │ estados vivos (hover/focus/active/disabled) acontecem nos próprios componentes.│
// │ É a vitrine que o founder revisa antes de aprovar p/ produção.                 │
// │                                                                              │
// │ // SEAM: o design-system prove — useT · ROLES · Icon · Card · EmptyState · Tag.│
// └─────────────────────────────────────────────────────────────────────────────┘

function AppShowcase({ role, screenState, device, platform, theme }) {
  const { t } = useT();
  const r = ROLES[role] || ROLES[Object.keys(ROLES)[0]];
  // Telas REAIS deste consolidado = nav-keys com screen registrada.
  const items = r.nav.reduce((acc, s) => acc.concat(s.items), []).filter((it) => getScreen(it.key));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'auto', background: 'var(--surface-2)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '22px 24px 60px', display: 'flex', flexDirection: 'column', gap: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>{t('showcase.title')}</h2>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon name="info" size={13} />{t('showcase.live')}
          </span>
        </div>

        {items.length === 0 && (
          <Card style={{ maxWidth: 460 }}><EmptyState icon="grid" title={t('showcase.empty')} /></Card>
        )}

        {items.map((it) => (
          <ShowcaseBlock key={it.key + '-' + screenState + '-' + device} item={it} screenState={screenState} device={device} platform={platform} theme={theme} />
        ))}
      </div>
    </div>
  );
}

function ShowcaseBlock({ item, screenState, device, platform, theme }) {
  const { t } = useT();
  const Screen = getScreen(item.key);
  const stateLabel = { default: t('state.default'), loading: t('state.loading'), empty: t('state.empty'), error: t('state.error') }[screenState] || screenState;

  const screenEl = (
    <ScreenBoundary key={item.key + screenState} screenKey={item.key + screenState}>
      <Screen device={device} screenState={screenState} />
    </ScreenBoundary>
  );

  return (
    <section>
      <header style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
        <span style={{ display: 'inline-flex', width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--r)', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}><Icon name={item.icon} size={15} /></span>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{t(item.labelKey)}</h3>
        <Tag tone={screenState === 'error' ? 'danger' : screenState === 'empty' ? 'neutral' : screenState === 'loading' ? 'warning' : 'brand'}>{stateLabel}</Tag>
      </header>

      {device === 'mobile' ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
          <DeviceFrame platform={platform} theme={theme}>{screenEl}</DeviceFrame>
        </div>
      ) : (
        <div style={{ height: 640, borderRadius: 'var(--rb)', border: '1px solid var(--border)', background: 'var(--bg)', overflow: 'hidden', boxShadow: 'var(--e1)', display: 'flex', flexDirection: 'column' }}>
          {screenEl}
        </div>
      )}
    </section>
  );
}
