// ┌─ MOTOR (genérico · não re-derivar) ─────────────────────────────────────────┐
// │ i18n-chrome.jsx — vocabulário de CHROME do motor (modo/tela/plataforma/tema/  │
// │ estado/showcase/soon). Carregar SEMPRE depois do i18n.jsx do seu DS e antes    │
// │ de qualquer render. Merge NÃO-destrutivo: só preenche chaves ausentes, então   │
// │ o motor funciona mesmo com um i18n mínimo, sem pisar nas escolhas do seu DS.    │
// │                                                                              │
// │ // SEAM: o i18n.jsx do seu DS define `TRANSLATIONS` (e as chaves de produto:   │
// │   nav.* e o conteúdo das telas). Aqui só entram as chaves do próprio motor.     │
// └─────────────────────────────────────────────────────────────────────────────┘
(function () {
  const add = {
    'pt-BR': {
      'app.proto': 'Protótipo',
      'sw.mode': 'Modo', 'sw.device': 'Tela', 'sw.platform': 'Plataforma',
      'sw.theme': 'Tema', 'sw.state': 'Estado', 'sw.lang': 'Idioma',
      'mode.produto': 'Produto', 'mode.showcase': 'Showcase',
      'device.desktop': 'Desktop', 'device.mobile': 'Mobile',
      'platform.ios': 'iOS', 'platform.android': 'Android',
      'theme.light': 'Claro', 'theme.dark': 'Escuro',
      'state.default': 'Padrão', 'state.loading': 'Carregando', 'state.empty': 'Vazio', 'state.error': 'Erro',
      'showcase.title': 'Showcase tela-a-tela',
      'showcase.live': 'hover · focus · active · disabled ficam vivos nos componentes — interaja para vê-los.',
      'showcase.empty': 'Nenhuma tela registrada para este papel ainda.',
      'soon.title': 'Em breve', 'soon.body': 'Esta superfície ainda não foi prototipada.',
    },
    'en': {
      'app.proto': 'Prototype',
      'sw.mode': 'Mode', 'sw.device': 'Screen', 'sw.platform': 'Platform',
      'sw.theme': 'Theme', 'sw.state': 'State', 'sw.lang': 'Language',
      'mode.produto': 'Product', 'mode.showcase': 'Showcase',
      'device.desktop': 'Desktop', 'device.mobile': 'Mobile',
      'platform.ios': 'iOS', 'platform.android': 'Android',
      'theme.light': 'Light', 'theme.dark': 'Dark',
      'state.default': 'Default', 'state.loading': 'Loading', 'state.empty': 'Empty', 'state.error': 'Error',
      'showcase.title': 'Screen-by-screen showcase',
      'showcase.live': 'hover · focus · active · disabled are live in the components — interact to see them.',
      'showcase.empty': 'No screen registered for this role yet.',
      'soon.title': 'Coming soon', 'soon.body': 'This surface has not been prototyped yet.',
    },
  };
  if (typeof TRANSLATIONS !== 'undefined') {
    Object.keys(add).forEach((lng) => {
      TRANSLATIONS[lng] = TRANSLATIONS[lng] || {};
      Object.keys(add[lng]).forEach((k) => {
        if (TRANSLATIONS[lng][k] === undefined) TRANSLATIONS[lng][k] = add[lng][k];
      });
    });
  }
})();
