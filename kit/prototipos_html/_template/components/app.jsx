// {{PROJECT_NAME}} — Shell + Showcase wrapper (TEMPLATE)
// Substitua o conteudo de DemoScreen pelo prototipo real da sua tela.

const { useState: useS, useEffect: useE, useMemo: useM } = React;

const detectLang = () => {
  const nav = (navigator.language || 'pt-BR').toLowerCase();
  if (nav.startsWith('pt')) return 'pt-BR';
  if (nav.startsWith('es')) return 'es';
  return 'en';
};

/* ---------- ErrorBoundary por tab ---------- */
class TabErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('[Showcase tab error]', this.props.tabName, error, info); }
  componentDidUpdate(prevProps) {
    if (prevProps.tabName !== this.props.tabName && this.state.error) this.setState({ error: null });
  }
  render() {
    if (this.state.error) {
      const e = this.state.error;
      return (
        <div style={{
          flex: 1, padding: 32,
          display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', justifyContent: 'center',
          color: 'var(--danger)', textAlign: 'center', maxWidth: 720, margin: '0 auto',
        }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Render error em "{this.props.tabName}"</div>
          <code style={{
            fontSize: 12.5, padding: 12, borderRadius: 10,
            background: 'var(--surface)', border: '1px solid var(--border)',
            color: 'var(--fg)', maxWidth: '100%', overflow: 'auto', whiteSpace: 'pre-wrap', textAlign: 'left',
          }}>{String(e?.stack || e?.message || e)}</code>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Abra o DevTools console para o stack trace completo.</div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ---------- DemoScreen: cobre os 8 estados visuais ---------- */
const DemoScreen = ({ state, lang }) => {
  const t = useT(lang);

  if (state === 'loading') {
    return (
      <Card style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Skeleton w="60%" h={20} />
        <Skeleton w="100%" h={14} />
        <Skeleton w="100%" h={14} />
        <Skeleton w="40%" h={14} />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <Skeleton w={100} h={40} r="var(--radius-md)" />
          <Skeleton w={100} h={40} r="var(--radius-md)" />
        </div>
      </Card>
    );
  }
  if (state === 'empty') {
    return <Card style={{ width: 360 }}><EmptyState title={t('emptyTitle')} body={t('emptyBody')} cta={t('emptyCta')} onCta={() => {}} /></Card>;
  }
  if (state === 'error') {
    return <Card style={{ width: 360 }}><ErrorState title={t('errorTitle')} body={t('errorBody')} cta={t('errorCta')} onCta={() => {}} /></Card>;
  }

  // default | hover | focus | active | disabled — mesma estrutura, variacoes de feedback do Button
  const disabled = state === 'disabled';
  return (
    <Card style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800 }}>{t('helloUser', { name: MOCK_USER.name })}</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>{t('tagline')}</div>
      </div>
      <Field label="Email" value={MOCK_USER.email} onChange={() => {}} disabled={disabled} />
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="primary" disabled={disabled}>{t('ctaPrimary')}</Button>
        <Button variant="secondary" disabled={disabled}>{t('ctaSecondary')}</Button>
      </div>
    </Card>
  );
};

/* ---------- Showcase wrapper ---------- */
const STATES = ['default', 'hover', 'focus', 'active', 'disabled', 'loading', 'empty', 'error'];

const Showcase = () => {
  const [lang, setLang] = useS(detectLang());
  const [theme, setTheme] = useS('light');
  const [state, setState] = useS('default');
  const t = useT(lang);

  useE(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);

  const StateLabel = useM(() => ({
    default: t('stateDefault'),
    hover: t('stateHover'),
    focus: t('stateFocus'),
    active: t('stateActive'),
    disabled: t('stateDisabled'),
    loading: t('stateLoading'),
    empty: t('stateEmpty'),
    error: t('stateError'),
  }), [t]);

  return (
    <div className="showcase-shell">
      <header className="showcase-header">
        <div className="showcase-brand">
          <span>{t('appName')}</span>
          <span className="accent">•</span>
        </div>

        <div className="showcase-tabs">
          {STATES.map((s) => (
            <button key={s} className={s === state ? 'active' : ''} onClick={() => setState(s)}>
              {StateLabel[s]}
            </button>
          ))}
        </div>

        <div className="showcase-switchers">
          <div className="sw-group" aria-label={t('swLang')}>
            {['pt-BR', 'en', 'es'].map((l) => (
              <button key={l} className={l === lang ? 'active' : ''} onClick={() => setLang(l)}>{l}</button>
            ))}
          </div>
          <div className="sw-group" aria-label={t('swTheme')}>
            <button className={theme === 'light' ? 'active' : ''} onClick={() => setTheme('light')}>{t('swLight')}</button>
            <button className={theme === 'dark' ? 'active' : ''} onClick={() => setTheme('dark')}>{t('swDark')}</button>
          </div>
        </div>
      </header>

      <main className="showcase-body">
        <TabErrorBoundary tabName={state}>
          <DemoScreen state={state} lang={lang} />
        </TabErrorBoundary>
      </main>
    </div>
  );
};
