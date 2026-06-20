// ┌─ TEMPLATE: uma tela do consolidado ─────────────────────────────────────────┐
// │ Substitua __KEY__ (nav-key, ex.: 'home') e o conteúdo. Cobra os estados que    │
// │ fizerem sentido. A tela recebe { device, screenState } do motor.               │
// │                                                                              │
// │ DOIS gotchas embutidos aqui de propósito:                                     │
// │  1) IIFE: a tela inteira vive dentro de (function(){ … })() — o escopo global  │
// │     do Babel standalone é compartilhado; sem IIFE, dois `function Screen(){}`  │
// │     colidem ("already declared").                                             │
// │  2) Hooks SEMPRE no topo, antes de qualquer return condicional (loading/empty/ │
// │     error). Mudar a ordem dos hooks entre renders crasha o React.              │
// └─────────────────────────────────────────────────────────────────────────────┘
(function () {
  function Screen({ device, screenState }) {
    const { t } = useT();               // hooks no topo — antes de qualquer return
    const isMobile = device === 'mobile';

    if (screenState === 'loading') {
      return React.createElement(ScreenScaffold, { isMobile, title: t('nav.__KEY__') },
        React.createElement(Spinner || 'div', null, '…'));   // SEAM: seu Spinner/Skeleton
    }
    if (screenState === 'empty') {
      return React.createElement(ScreenScaffold, { isMobile, title: t('nav.__KEY__') },
        React.createElement(EmptyState, { icon: 'grid', title: t('__KEY__.empty.title'), body: t('__KEY__.empty.body') }));
    }
    if (screenState === 'error') {
      return React.createElement(ScreenScaffold, { isMobile, title: t('nav.__KEY__') },
        React.createElement(EmptyState, { icon: 'alert', title: t('__KEY__.error.title'), body: t('__KEY__.error.body') }));
    }

    // default — o conteúdo real da tela. hover/focus/active/disabled vivem aqui (nos
    // componentes do seu DS), não no switcher de estado.
    return React.createElement(ScreenScaffold, { isMobile, title: t('nav.__KEY__') },
      React.createElement('div', { style: { padding: isMobile ? 16 : 24 } },
        /* SEAM: conteúdo da tela __KEY__ */
        React.createElement(Card, null, t('__KEY__.body')),
      ),
    );
  }

  // Casca interna da tela: header + corpo scrollável. Mantém o layout consistente
  // entre desktop e mobile (single-pane). SEAM: ajuste à sua linguagem visual.
  function ScreenScaffold({ isMobile, title, children }) {
    return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: 'var(--bg)' } },
      React.createElement('header', { style: { flexShrink: 0, height: isMobile ? 52 : 60, borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', padding: '0 16px' } },
        React.createElement('h1', { style: { margin: 0, fontSize: isMobile ? 15 : 16, fontWeight: 600, color: 'var(--text)' } }, title),
      ),
      React.createElement('div', { style: { flex: 1, minHeight: 0, overflow: 'auto' } }, children),
    );
  }

  registerScreen('__KEY__', Screen);
})();
