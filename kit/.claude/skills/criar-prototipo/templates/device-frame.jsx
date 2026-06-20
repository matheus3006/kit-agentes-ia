// ┌─ MOTOR (genérico · não re-derivar) ─────────────────────────────────────────┐
// │ device-frame.jsx — moldura mobile iOS/Android em torno de uma viewport       │
// │ 390×800. ScaledDevice encaixa o frame inteiro no palco quando a janela é      │
// │ estreita (fit-to-stage por ResizeObserver). É o que faz o mobile "caber       │
// │ sempre" em qualquer viewport sem cortar. Tokens de device injetados aqui       │
// │ (DeviceTokens) p/ não tocar o tokens.css canônico do seu design-system.        │
// └─────────────────────────────────────────────────────────────────────────────┘

const DEVICE_W = 390;
const DEVICE_H = 800;
// Espessura da moldura externa por plataforma (bezel + padding): iOS 9*2, Android 3*2.
const FRAME_BEZEL = { ios: 18, android: 6 };

// Injeta os tokens de device (sombra do aparelho) sem editar o tokens.css.
// Ajuste a sombra à identidade do seu DS se quiser — é o único pedaço "de marca" aqui.
function DeviceTokens() {
  return React.createElement('style', null,
    ':root{--device-shadow:0 50px 90px -30px rgba(20,20,30,0.45), 0 0 0 1px rgba(20,20,30,0.06)}' +
    '[data-theme="dark"]{--device-shadow:0 50px 90px -30px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.05)}'
  );
}

// useIsMobile — viewport estreito (<=900px p/ apps desktop-first), reativo.
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

// useElementSize — mede o content-box (ResizeObserver). Base do fit-to-stage.
function useElementSize() {
  const ref = React.useRef(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({ width: r.width, height: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size];
}

// DeviceFrame — moldura iOS ou Android. `children` = a tela mobile. Usa var(--bg).
function DeviceFrame({ platform, theme, children }) {
  const W = DEVICE_W, H = DEVICE_H;
  const fg = theme === 'dark' ? '#FAF7F2' : '#1A1A1F';

  if (platform === 'android') {
    return React.createElement('div', { style: { width: W + 6, height: H + 6, background: '#1A1A1F', borderRadius: 32, padding: 3, boxShadow: 'var(--device-shadow)', flexShrink: 0 } },
      React.createElement('div', { style: { width: W, height: H, background: 'var(--bg)', borderRadius: 30, overflow: 'hidden', position: 'relative' } },
        React.createElement('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', fontSize: 12, fontWeight: 600, color: fg, zIndex: 30, pointerEvents: 'none' } },
          React.createElement('span', { style: { fontVariantNumeric: 'tabular-nums' } }, '21:42'),
          React.createElement('span', null, '•••  87%'),
        ),
        React.createElement('div', { style: { position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 12, height: 12, background: '#0A0A0E', borderRadius: '50%', zIndex: 40 } }),
        React.createElement('div', { style: { position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', width: 100, height: 3, background: fg, borderRadius: 2, opacity: 0.5, zIndex: 30, pointerEvents: 'none' } }),
        React.createElement('div', { style: { position: 'absolute', inset: 0, paddingTop: 28, paddingBottom: 18 } }, children),
      ),
    );
  }

  // iOS
  return React.createElement('div', { style: { width: W + 18, height: H + 18, background: '#0A0A0E', borderRadius: 56, padding: 9, boxShadow: 'var(--device-shadow)', position: 'relative', flexShrink: 0 } },
    React.createElement('div', { style: { width: W, height: H, background: 'var(--bg)', borderRadius: 47, overflow: 'hidden', position: 'relative' } },
      React.createElement('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, height: 44, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 28px 8px', fontSize: 13, fontWeight: 700, color: fg, zIndex: 30, pointerEvents: 'none' } },
        React.createElement('span', { style: { fontVariantNumeric: 'tabular-nums' } }, '21:42'),
        React.createElement('span', null, '● ● ● 100%'),
      ),
      React.createElement('div', { style: { position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)', width: 120, height: 34, background: '#0A0A0E', borderRadius: 24, zIndex: 40 } }),
      React.createElement('div', { style: { position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 134, height: 5, background: fg, borderRadius: 3, opacity: 0.92, zIndex: 30, pointerEvents: 'none' } }),
      React.createElement('div', { style: { position: 'absolute', inset: 0, paddingTop: 44, paddingBottom: 24 } }, children),
    ),
  );
}

// ScaledDevice — encaixa o DeviceFrame inteiro no palco disponível (escala ≤1).
// `avail` = {width,height} do palco (use useElementSize no container). Nunca corta.
function ScaledDevice({ platform, theme, avail, children }) {
  const bezel = FRAME_BEZEL[platform];
  const frameW = DEVICE_W + bezel, frameH = DEVICE_H + bezel;
  const scale = avail.width > 0 && avail.height > 0
    ? Math.min(1, avail.width / frameW, avail.height / frameH)
    : 0;
  return React.createElement('div', { style: { width: frameW * scale, height: frameH * scale, visibility: scale > 0 ? 'visible' : 'hidden' } },
    React.createElement('div', { style: { transform: `scale(${scale})`, transformOrigin: 'top left' } },
      React.createElement(DeviceFrame, { platform, theme }, children),
    ),
  );
}
