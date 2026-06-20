// ┌─ TELAS (VOCÊ EDITA / ADICIONA) ─────────────────────────────────────────────┐
// │ screens.jsx — cada tela é uma IIFE que chama registerScreen('navKey', C). A    │
// │ tela recebe { device, screenState } e cobre os estados que fizerem sentido.    │
// │ hooks SEMPRE no topo (antes de qualquer return condicional). Num protótipo      │
// │ grande, separe em screens/screen-<key>.jsx (uma IIFE por arquivo).             │
// └─────────────────────────────────────────────────────────────────────────────┘

// ===== tela: home ==============================================================
(function () {
  function Scaffold({ isMobile, title, children }) {
    return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: 'var(--bg)' } },
      React.createElement('header', { style: { flexShrink: 0, height: isMobile ? 52 : 60, borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', padding: '0 16px' } },
        React.createElement('h1', { style: { margin: 0, fontSize: isMobile ? 15 : 16, fontWeight: 600, color: 'var(--text)' } }, title)),
      React.createElement('div', { style: { flex: 1, minHeight: 0, overflow: 'auto', padding: isMobile ? 16 : 22 } }, children));
  }

  function Stat({ label, value }) {
    return React.createElement(Card, { style: { flex: 1, minWidth: 130 } },
      React.createElement('div', { className: 'tnum', style: { fontSize: 26, fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' } }, value),
      React.createElement('div', { style: { fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 } }, label));
  }

  function Screen({ device, screenState }) {
    const { t } = useT();
    const isMobile = device === 'mobile';

    if (screenState === 'loading') {
      const bar = (w) => React.createElement('div', { style: { height: 14, width: w, borderRadius: 6, background: 'var(--surface-2)' } });
      return React.createElement(Scaffold, { isMobile, title: t('nav.home') },
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } }, bar('40%'), bar('80%'), bar('65%'), bar('72%')));
    }
    if (screenState === 'empty') return React.createElement(Scaffold, { isMobile, title: t('nav.home') }, React.createElement(EmptyState, { icon: 'grid', title: t('home.empty.title'), body: t('home.empty.body') }));
    if (screenState === 'error') return React.createElement(Scaffold, { isMobile, title: t('nav.home') }, React.createElement(EmptyState, { icon: 'alert', title: t('home.error.title'), body: t('home.error.body') }));

    return React.createElement(Scaffold, { isMobile, title: t('nav.home') },
      React.createElement('div', { style: { marginBottom: 18 } },
        React.createElement('div', { style: { fontSize: 18, fontWeight: 700, color: 'var(--text)' } }, t('home.hello')),
        React.createElement('div', { style: { fontSize: 13, color: 'var(--text-muted)' } }, t('home.lead'))),
      React.createElement('div', { style: { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 } },
        React.createElement(Stat, { label: t('home.metric.open'), value: '12' }),
        React.createElement(Stat, { label: t('home.metric.done'), value: '34' })),
      React.createElement('div', { style: { fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-faint)', marginBottom: 8 } }, t('home.recent')),
      React.createElement(Card, { style: { padding: 0 } },
        ['home.row.a', 'home.row.b', 'home.row.c'].map((k, i) =>
          React.createElement('div', { key: k, style: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderTop: i ? '1px solid var(--border)' : 'none' } },
            React.createElement('span', { style: { width: 8, height: 8, borderRadius: '50%', background: 'var(--brand)', flexShrink: 0 } }),
            React.createElement('span', { style: { fontSize: 13.5, color: 'var(--text)' } }, t(k))))));
  }

  registerScreen('home', Screen);
})();

// ===== tela: items =============================================================
(function () {
  function Scaffold({ isMobile, title, actions, children }) {
    return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: 'var(--bg)' } },
      React.createElement('header', { style: { flexShrink: 0, minHeight: isMobile ? 52 : 60, borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px' } },
        React.createElement('h1', { style: { margin: 0, fontSize: isMobile ? 15 : 16, fontWeight: 600, color: 'var(--text)' } }, title),
        React.createElement('div', { style: { marginLeft: 'auto', display: 'flex', gap: 8 } }, actions)),
      React.createElement('div', { style: { flex: 1, minHeight: 0, overflow: 'auto', padding: isMobile ? 16 : 22 } }, children));
  }

  function Screen({ device, screenState }) {
    const { t } = useT();
    const isMobile = device === 'mobile';

    // hover/focus/active vivem no botão (.press + focus-visible); 'disabled' fica
    // visível no botão secundário — cobre o estado disabled dos 8.
    const actions = [
      React.createElement('button', { key: 'imp', disabled: true, style: { border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-faint)', borderRadius: 8, padding: '7px 12px', fontSize: 13, fontWeight: 600, cursor: 'not-allowed', opacity: 0.6 } }, 'Importar'),
      React.createElement('button', { key: 'new', className: 'press', style: { border: 'none', background: 'var(--brand)', color: 'var(--brand-fg)', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' } }, '+ ' + t('items.new')),
    ];

    if (screenState === 'loading') {
      const bar = (w) => React.createElement('div', { style: { height: 14, width: w, borderRadius: 6, background: 'var(--surface-2)' } });
      return React.createElement(Scaffold, { isMobile, title: t('items.title'), actions }, React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } }, bar('100%'), bar('100%'), bar('70%')));
    }
    if (screenState === 'empty') return React.createElement(Scaffold, { isMobile, title: t('items.title'), actions }, React.createElement(EmptyState, { icon: 'list', title: t('items.empty.title'), body: t('items.empty.body') }));
    if (screenState === 'error') return React.createElement(Scaffold, { isMobile, title: t('items.title'), actions }, React.createElement(EmptyState, { icon: 'alert', title: t('items.error.title'), body: t('items.error.body') }));

    const rows = [
      { name: 'Onboarding', tone: 'brand', status: t('items.status.active') },
      { name: 'Campanha Q3', tone: 'neutral', status: t('items.status.draft') },
      { name: 'Newsletter', tone: 'brand', status: t('items.status.active') },
    ];
    return React.createElement(Scaffold, { isMobile, title: t('items.title'), actions },
      React.createElement(Card, { style: { padding: 0 } },
        React.createElement('div', { style: { display: 'flex', padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-faint)' } },
          React.createElement('span', { style: { flex: 1 } }, t('items.col.name')),
          React.createElement('span', null, t('items.col.status'))),
        rows.map((r, i) => React.createElement('div', { key: r.name, style: { display: 'flex', alignItems: 'center', padding: '12px 16px', borderTop: i ? '1px solid var(--border)' : 'none' } },
          React.createElement('span', { style: { flex: 1, fontSize: 13.5, color: 'var(--text)' } }, r.name),
          React.createElement(Tag, { tone: r.tone }, r.status)))));
  }

  registerScreen('items', Screen);
})();
