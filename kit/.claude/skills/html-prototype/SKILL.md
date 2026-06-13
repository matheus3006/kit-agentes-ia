---
name: html-prototype
description: Gera prototipos HTML+JSX (React 18 + Babel standalone) para validacao visual antes da implementacao na stack real. Use sempre que iniciar uma nova tela, fluxo ou componente de frontend, ou quando o usuario pedir prototipo, mockup, tela, screen, ou showcase.
---

# html-prototype

Skill que substitui o fluxo Figma pelo padrao HTML+JSX rodado direto no
browser via Babel standalone (React 18 + Babel standalone via CDN).

## Quando invocar
- Inicio de nova tela ou fluxo de frontend
- Pedido de mockup, prototipo, showcase visual
- Validacao de UX antes de tocar codigo de producao
- Comparacao de duas direcoes visuais para decisao do PM/cliente

## Estrutura obrigatoria
```
prototipos_html/<task-id>/
├── index.html                  # Orquestrador React 18 + Babel via CDN
└── components/
    ├── i18n.jsx                # TRANSLATIONS centralizadas (pt-BR default)
    ├── data.jsx                # Mock data, plans, defaults
    ├── icons.jsx               # SVG components
    ├── ui.jsx                  # Primitivos (Press, Toast, Field, Modal)
    ├── <dominio1>.jsx          # Telas do dominio 1
    ├── <dominio2>.jsx          # Telas do dominio 2
    └── app.jsx                 # Shell + Showcase wrapper
```

## Princıpios de design
1. **Tokens via CSS variables.** `:root` define light, `[data-theme="dark"]`
   override. Zero hex/px magicos espalhados pelos componentes.
2. **Estados visuais completos.** Cobrir default, hover, focus, active,
   disabled, loading, empty, error. Cada um documentado no showcase.
3. **i18n centralizada.** Mesmo se o projeto for so pt-BR, use a estrutura
   `TRANSLATIONS[lang][key]` para evitar refactor depois.
4. **Showcase com switchers.** Tabs entre telas + switchers de idioma, tema,
   plataforma (iOS/Android), role/perfil. Permite revisao rapida.
5. **Babel standalone via CDN.** Sem build step. Abrir no browser e funciona.
6. **Error boundary por tab.** Uma tela quebrada nao derruba o showcase inteiro.

## Padrao do orquestrador (index.html)
- React 18 + ReactDOM via unpkg
- @babel/standalone para transpilacao em browser
- `<script type="text/babel" src="components/X.jsx">` para cada componente
- Fontes via Google Fonts (Plus Jakarta Sans + JetBrains Mono recomendado)
- Showcase shell com header sticky, tabs, switchers e zoom controls
- All-screens mode com grade scrollavel para overview

## Workflow
1. Copiar `prototipos_html/_template/` para `prototipos_html/<task-id>/`
2. Adaptar i18n.jsx com as strings da nova tela
3. Criar componentes em components/<dominio>.jsx
4. Adicionar tabs/views no app.jsx
5. Servir: `cd prototipos_html/<task-id> && python3 -m http.server 8000`
6. Apresentar URL ao usuario; iterar ate aprovacao
7. So apos aprovacao, gerar plano de implementacao no stack real
   (ver stack-alvo em CLAUDE.md)

## Anti-padroes
- Tailwind ou frameworks pesados no prototipo (over-engineering)
- Build step (vite, webpack) — vai contra a proposta de zero-friction
- Logica de negocio real — prototipo simula com mocks em data.jsx
- Acoplar prototipo ao stack final — perde o ganho de iteracao rapida
