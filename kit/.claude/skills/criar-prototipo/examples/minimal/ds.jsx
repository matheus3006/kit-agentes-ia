// ┌─ DESIGN-SYSTEM (VOCÊ EDITA ISTO) ───────────────────────────────────────────┐
// │ ds.jsx — tudo o que é "de marca" / do produto: i18n, primitivas visuais,      │
// │ árvore de navegação e as cascas (Shell desktop + MobileShell). O motor          │
// │ (engine.jsx) consome estes globais via os seams. Troque cores/ícones/telas      │
// │ aqui; NÃO edite o engine.jsx. (Tokens de cor: <style> no index.html.)           │
// └─────────────────────────────────────────────────────────────────────────────┘

// ---- i18n ---------------------------------------------------------------------
const TRANSLATIONS = {
  'pt-BR': {
    'app.product': 'Demo',
    'role.user': 'Equipe', 'role.user.sub': 'voce@demo.app',
    'nav.section.main': 'Principal',
    'nav.home': 'Início', 'nav.items': 'Itens',
    'home.hello': 'Bom dia 👋', 'home.lead': 'Visão geral do dia.',
    'home.metric.open': 'Em aberto', 'home.metric.done': 'Concluídos',
    'home.recent': 'Atividade recente',
    'home.row.a': 'Pedido #1042 criado', 'home.row.b': 'Cliente respondeu', 'home.row.c': 'Tarefa concluída',
    'home.empty.title': 'Nada por aqui ainda', 'home.empty.body': 'Quando houver atividade, ela aparece aqui.',
    'home.error.title': 'Não deu para carregar', 'home.error.body': 'Tente novamente em instantes.',
    'items.title': 'Itens', 'items.new': 'Novo item',
    'items.col.name': 'Nome', 'items.col.status': 'Status',
    'items.status.active': 'Ativo', 'items.status.draft': 'Rascunho',
    'items.empty.title': 'Sem itens', 'items.empty.body': 'Crie o primeiro item para começar.',
    'items.error.title': 'Falha ao listar', 'items.error.body': 'Recarregue para tentar de novo.',
  },
  'en': {
    'app.product': 'Demo',
    'role.user': 'Team', 'role.user.sub': 'you@demo.app',
    'nav.section.main': 'Main',
    'nav.home': 'Home', 'nav.items': 'Items',
    'home.hello': 'Good morning 👋', 'home.lead': 'Today at a glance.',
    'home.metric.open': 'Open', 'home.metric.done': 'Done',
    'home.recent': 'Recent activity',
    'home.row.a': 'Order #1042 created', 'home.row.b': 'Customer replied', 'home.row.c': 'Task completed',
    'home.empty.title': 'Nothing here yet', 'home.empty.body': 'Activity will show up here.',
    'home.error.title': 'Could not load', 'home.error.body': 'Try again in a moment.',
    'items.title': 'Items', 'items.new': 'New item',
    'items.col.name': 'Name', 'items.col.status': 'Status',
    'items.status.active': 'Active', 'items.status.draft': 'Draft',
    'items.empty.title': 'No items', 'items.empty.body': 'Create the first item to get started.',
    'items.error.title': 'Failed to list', 'items.error.body': 'Reload to try again.',
  },
};

const I18nContext = React.createContext({ t: (k) => k, lang: 'pt-BR' });
function I18nProvider({ lang, children }) {
  // Lê TRANSLATIONS ao vivo (i18n-chrome do motor já mesclou as chaves de chrome).
  const t = React.useCallback((k) => {
    const d = TRANSLATIONS[lang] || TRANSLATIONS['pt-BR'];
    if (d && d[k] !== undefined) return d[k];
    const base = TRANSLATIONS['pt-BR'];
    return (base && base[k] !== undefined) ? base[k] : k;
  }, [lang]);
  return React.createElement(I18nContext.Provider, { value: { t, lang } }, children);
}
function useT() { return React.useContext(I18nContext); }

// ---- estilos globais (.press, focus-visible) ----------------------------------
function GlobalKeyframes() {
  return React.createElement('style', null,
    '.press{transition:transform 120ms var(--ease)}' +
    '.press:active{transform:scale(0.97)}' +
    'button:focus-visible,[role="tab"]:focus-visible{outline:2px solid var(--brand);outline-offset:2px}' +
    '@media (prefers-reduced-motion: reduce){.press{transition:none}}'
  );
}

// ---- Icon (conjunto mínimo + fallback: nunca crasha) --------------------------
const ICON_PATHS = {
  home: 'M3 11l9-8 9 8M5 10v10h14V10',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  info: 'M12 16v-4M12 8h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  alert: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  bell: 'M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0',
  logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  chevron: 'M9 18l6-6-6-6',
};
function Icon({ name, size = 18 }) {
  const d = ICON_PATHS[name] || 'M12 2a10 10 0 100 20 10 10 0 000-20z'; // fallback: círculo
  return React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
    React.createElement('path', { d }));
}

// ---- primitivas ---------------------------------------------------------------
function Card({ children, style }) {
  return React.createElement('div', { style: Object.assign({ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--rb)', padding: 16, boxShadow: 'var(--e1)' }, style) }, children);
}
function EmptyState({ icon, title, body }) {
  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', padding: 24, color: 'var(--text-muted)' } },
    React.createElement('div', { style: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', color: 'var(--text-faint)' } }, React.createElement(Icon, { name: icon || 'grid', size: 22 })),
    React.createElement('div', { style: { fontSize: 14, fontWeight: 600, color: 'var(--text)' } }, title),
    body ? React.createElement('div', { style: { fontSize: 12.5, maxWidth: 320 } }, body) : null,
  );
}
function Tag({ tone, children }) {
  const map = { brand: ['var(--brand-soft)', 'var(--brand)'], danger: ['var(--danger-soft)', 'var(--danger)'], warning: ['var(--warning-soft)', 'var(--warning)'], neutral: ['var(--surface-2)', 'var(--text-muted)'] };
  const [bg, fg] = map[tone] || map.neutral;
  return React.createElement('span', { style: { fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--radius-pill)', background: bg, color: fg, whiteSpace: 'nowrap' } }, children);
}

// ---- navegação por papel ------------------------------------------------------
const ROLES = {
  user: {
    key: 'user', home: 'home', nameKey: 'role.user', subKey: 'role.user.sub', initials: 'D',
    nav: [{ sectionKey: 'nav.section.main', items: [
      { key: 'home', labelKey: 'nav.home', icon: 'home' },
      { key: 'items', labelKey: 'nav.items', icon: 'list' },
    ] }],
  },
};
// Identidade numa fonte só (no protótipo real, white-label por papel — gotcha #6).
function brandFor() { return { name: 'Demo', initials: 'D' }; }

// ---- Shell desktop (sidebar) --------------------------------------------------
function Shell({ role, active, onNav, collapsed, onToggle, children }) {
  const { t } = useT();
  const r = ROLES[role] || ROLES.user;
  const id = brandFor(role);
  const W = collapsed ? 64 : 220;
  return React.createElement('div', { style: { display: 'flex', height: '100%', background: 'var(--bg)' } },
    React.createElement('aside', { style: { width: W, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--surface)', borderRight: '1px solid var(--border)', transition: 'width 200ms var(--ease)', overflow: 'hidden' } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '14px 0' : '14px 16px', justifyContent: collapsed ? 'center' : 'flex-start', minHeight: 56, borderBottom: '1px solid var(--border)' } },
        React.createElement('div', { style: { width: 32, height: 32, borderRadius: 9, background: 'var(--brand)', color: 'var(--brand-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 } }, id.initials),
        collapsed ? null : React.createElement('div', { style: { fontSize: 14, fontWeight: 600, color: 'var(--text)' } }, id.name),
      ),
      React.createElement('nav', { style: { flex: 1, overflowY: 'auto', padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4 } },
        r.nav.map((section, si) => React.createElement('div', { key: si },
          collapsed ? null : React.createElement('div', { style: { fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-faint)', padding: '6px 10px 4px' } }, t(section.sectionKey)),
          section.items.map((item) => React.createElement(NavItem, { key: item.key, item, active: active === item.key, collapsed, onClick: () => onNav(item.key), t })),
        )),
      ),
      React.createElement('div', { style: { borderTop: '1px solid var(--border)', padding: collapsed ? '10px 0' : '10px 12px', display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end' } },
        React.createElement('button', { className: 'press', onClick: onToggle, 'aria-label': collapsed ? 'Expandir' : 'Recolher', style: { border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } },
          React.createElement('div', { style: { transform: collapsed ? 'none' : 'rotate(180deg)' } }, React.createElement(Icon, { name: 'chevron', size: 16 }))),
      ),
    ),
    React.createElement('main', { style: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' } }, children),
  );
}

function NavItem({ item, active, collapsed, onClick, t }) {
  const [hover, setHover] = React.useState(false);
  return React.createElement('button', {
    type: 'button', onClick, title: collapsed ? t(item.labelKey) : undefined, className: 'press',
    onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false),
    style: { display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: collapsed ? '10px 0' : '9px 11px', justifyContent: collapsed ? 'center' : 'flex-start', border: 'none', borderRadius: 'var(--r)', textAlign: 'left', cursor: 'pointer', background: active ? 'var(--brand-soft)' : (hover ? 'var(--surface-2)' : 'transparent'), color: active ? 'var(--brand)' : (hover ? 'var(--text)' : 'var(--text-muted)'), fontWeight: active ? 600 : 500, fontSize: 13.5, transition: 'background 160ms var(--ease), color 160ms var(--ease)' },
  },
    React.createElement(Icon, { name: item.icon, size: 18 }),
    collapsed ? null : React.createElement('span', { style: { flex: 1, whiteSpace: 'nowrap' } }, t(item.labelKey)),
  );
}

// ---- MobileShell (bottom-nav · single-pane) -----------------------------------
function MobileShell({ role, active, onNav, children }) {
  const { t } = useT();
  const r = ROLES[role] || ROLES.user;
  const items = r.nav.reduce((acc, s) => acc.concat(s.items), []).slice(0, 5);
  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' } },
    React.createElement('div', { style: { flex: 1, minHeight: 0, overflow: 'hidden' } }, children),
    React.createElement('nav', { style: { flexShrink: 0, display: 'flex', borderTop: '1px solid var(--border)', background: 'var(--surface)' } },
      items.map((it) => {
        const on = active === it.key;
        return React.createElement('button', { key: it.key, onClick: () => onNav(it.key), className: 'press', 'aria-label': t(it.labelKey), 'aria-current': on ? 'page' : undefined,
          style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 2px 7px', border: 'none', background: 'transparent', color: on ? 'var(--brand)' : 'var(--text-muted)', cursor: 'pointer' } },
          React.createElement(Icon, { name: it.icon, size: 20 }),
          React.createElement('span', { style: { fontSize: 9.5, fontWeight: on ? 700 : 500 } }, t(it.labelKey)),
        );
      }),
    ),
  );
}
