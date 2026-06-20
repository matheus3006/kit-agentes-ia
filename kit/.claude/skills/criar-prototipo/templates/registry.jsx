// ┌─ MOTOR (genérico · não re-derivar) ─────────────────────────────────────────┐
// │ registry.jsx — registry + router + ScreenBoundary + SwGroup.                │
// │ Cada screen-*.jsx se auto-registra via registerScreen('navKey', Component)  │
// │ num IIFE (evita colisão de globais no escopo compartilhado do Babel         │
// │ standalone). O app-shell resolve a tela por nav-key; miss → SoonScreen.     │
// │                                                                             │
// │ Contrato de tokens (o seu design-system DEVE prover estas CSS vars):        │
// │   --brand --brand-fg · --success --warning --danger · --surface --border    │
// │   --text --text-muted --text-faint · --surface-2 --radius --ease            │
// └─────────────────────────────────────────────────────────────────────────────┘

window.AppScreens = window.AppScreens || {};
function registerScreen(key, component) { window.AppScreens[key] = component; }
function getScreen(key) { return (window.AppScreens || {})[key] || null; }

// ErrorBoundary por tela: isola crash + reseta ao navegar (via key={active} no uso
// + componentDidUpdate de segurança). Uma tela quebrada não derruba o showcase.
class ScreenBoundary extends React.Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err, info) { console.error('[screen error]', this.props.screenKey, err, info); }
  componentDidUpdate(prev) {
    if (prev.screenKey !== this.props.screenKey && this.state.err) this.setState({ err: null });
  }
  render() {
    if (this.state.err) {
      const e = this.state.err;
      return React.createElement('div', {
        style: { flex: 1, padding: 32, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', textAlign: 'center' },
      },
        React.createElement('div', { style: { fontSize: 16, fontWeight: 700 } }, 'Erro de render em "' + this.props.screenKey + '"'),
        React.createElement('code', { style: { fontSize: 12, padding: 12, borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', maxWidth: '100%', overflow: 'auto', whiteSpace: 'pre-wrap', textAlign: 'left' } }, String(e && (e.stack || e.message) || e)),
      );
    }
    return this.props.children;
  }
}

// SwGroup — segmented control acessível, reusado em todo switcher (modo/device/
// tema/estado/idioma). tone="semantic" é o eixo semântico extra opcional (genérico):
// pinta o ativo com a cor semântica do estado (sucesso/aviso/perigo) — NUNCA como
// CTA de marca. CTA é sempre --brand.
function SwGroup({ label, value, onChange, options, tone }) {
  return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
    label ? React.createElement('span', { className: 'sw-label', style: swLabel }, label) : null,
    React.createElement('div', { style: swWrap, role: 'tablist' },
      options.map((o) => {
        const act = value === o.key;
        let activeBg = 'var(--brand)', activeFg = 'var(--brand-fg)';
        if (tone === 'semantic' && act) { const c = { open: 'var(--success)', closing: 'var(--warning)', closed: 'var(--danger)' }[o.key]; activeBg = c; activeFg = '#fff'; }
        return React.createElement('button', {
          key: o.key, role: 'tab', 'aria-selected': act, onClick: () => onChange(o.key), className: 'press',
          style: { border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', background: act ? activeBg : 'transparent', color: act ? activeFg : 'var(--text-muted)', transition: 'all 150ms var(--ease)' },
        }, o.label);
      }),
    ),
  );
}

const swLabel = { fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-faint)' };
const swWrap = { display: 'flex', gap: 2, background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: 3 };
