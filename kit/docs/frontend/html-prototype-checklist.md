# Checklist de Protótipo HTML+JSX

Substituímos o fluxo Figma por protótipos HTML+JSX rodados direto no browser
via Babel standalone.

## Pré-requisitos
- Task ativa declarada (`nova tarefa: ...`)
- Diretório `prototipos_html/<task-id>/` criado
- Template base copiado de `prototipos_html/_template/`

## Estrutura mínima do protótipo
```
prototipos_html/<task-id>/
├── index.html
└── components/
    ├── i18n.jsx
    ├── data.jsx
    ├── icons.jsx
    ├── ui.jsx
    ├── <dominio>.jsx     (uma ou mais telas do domínio)
    └── app.jsx
```

## Cobertura obrigatória de estados
- [ ] **default** — estado base, dados típicos
- [ ] **hover** — feedback visual em elementos interativos
- [ ] **focus** — outline visível, ordem de tabulação lógica
- [ ] **active/pressed** — transformação sutil ao tocar
- [ ] **disabled** — opacidade + cursor not-allowed
- [ ] **loading** — skeleton ou spinner, sem layout shift
- [ ] **empty** — ilustração + CTA + copy explicativo
- [ ] **error** — mensagem clara + ação de recuperação

## Tokens via CSS variables
- [ ] Cores no `:root` (light) + `[data-theme="dark"]` (override)
- [ ] Sem hex inline nos componentes — só `var(--token)`
- [ ] Espaçamentos consistentes (--space-1..6)
- [ ] Raios (--radius-sm/md/lg/full)
- [ ] Sombras (--shadow-sm/md/lg)

## i18n (estrutura obrigatória, lista de locales configurável)
- [ ] `TRANSLATIONS = { '<locale>': {...} }` presente — estrutura obrigatória mesmo
      com um único locale (evita refactor depois)
- [ ] Lista de locales configurável por projeto (default `pt-BR,en`)
- [ ] Hook `useT()` para acesso; merge não-destrutivo ao adicionar locale
- [ ] Sem strings hard-coded nos componentes

## Showcase
- [ ] Header sticky com brand + tabs + switchers
- [ ] Tab por persona/role/feature
- [ ] Switcher de tema (light | dark)
- [ ] Switcher de plataforma (iOS | Android | Web) se aplicável
- [ ] Modo "All Screens" com grade scrollável + zoom controls
- [ ] ErrorBoundary por tab (uma tela quebrada não derruba o resto)
- [ ] Switcher de idioma (locales configuráveis; default `pt-BR,en`)

## Acessibilidade do protótipo
- [ ] Contraste mínimo 4.5:1 para texto normal, 3:1 para large
- [ ] Foco visível em todos os interativos
- [ ] Ordem de tabulação lógica
- [ ] `role` e `aria-label` onde semântica HTML não cobre

## Tech stack do protótipo (NÃO da implementação real)
- React 18 via unpkg.com (development build para erros claros)
- @babel/standalone 7.29+ via unpkg.com
- Fontes via Google Fonts (`Plus Jakarta Sans` + `JetBrains Mono`)
- Zero build step — abrir `index.html` no browser ou servir via
  `python3 -m http.server 8000`

## Como servir e revisar
```bash
cd prototipos_html/<task-id>
python3 -m http.server 8000
# Abrir http://localhost:8000 em Chrome
```

## Aprovação
Antes de portar para o stack real:
- [ ] Showcase rodando sem erros no console
- [ ] Todas as personas/views cobertas
- [ ] Estados visuais marcados acima
- [ ] Tokens centralizados, sem mágicos
- [ ] Usuário digitou `aprovado` ou `/aprovar-plano`

Sem aprovação, NÃO iniciar implementação no projeto real.

## §6 — Régua de conformância (12/12)

Régua canônica do modelo cadillac. Vale para qualquer protótipo HTML+JSX (gerado
por `criar-prototipo`/`incrementar-prototipo` ou single-showcase legado). Um
consolidado conforme bate 12/12; os 2 eixos de domínio entram como itens
**OPCIONAIS (opt-in)** — N/A quando o produto não tem o atributo.

- [ ] **1.** Carrega via 1 `index.html` consolidado; React 18 UMD + Babel standalone.
- [ ] **2.** Ordem de load preservada (`i18n → i18n-chrome → ui → nav → registry → device-frame → showcase → app-shell → screens → app`).
- [ ] **3.** Cada tela = 1 IIFE; hooks no topo; sem 2 funções top-level colidindo.
- [ ] **4.** `?v=` cache-bust em toda tag local + iframe do hub.
- [ ] **5.** Registry `window.<DS>Screens` + `registerScreen`/`getScreen` + `ScreenBoundary`.
- [ ] **6.** Device-frame fit-to-stage (ResizeObserver) responsivo; `100dvh`/safe-center.
- [ ] **7.** Design tokens só na camada `tokens.css`/`ds.jsx`; device/chrome via merge, sem tocar canônico.
- [ ] **8.** i18n estrutura presente (merge não-destrutivo); locales configuráveis (default `pt-BR,en`).
- [ ] **9.** Showcase/hub: `PROTOS[]` manifesto coerente; `wip:true` = placeholder.
- [ ] **10.** Sem segredos/PII logados (conforme `{{COMPLIANCE_REQS}}`).
- [ ] **11.** Console limpo ao servir (zero erro).
- [ ] **12.** Motor não-editado: só `ds.jsx`/`screens.jsx`/tokens mudam; `engine.jsx`/`templates/` intactos.
- [ ] **(opt-in A)** Cor semântica reservada nunca vira CTA (`{{RESERVED_SEMANTIC_TOKEN}}`/`{{ADR_REF}}`).
- [ ] **(opt-in B)** White-label: marca com fonte única `brandFor()`; shell nunca mostra marca do fornecedor.

## Pós-ship — refletir no showcase consolidado (anti-drift)
Depois que a tela é aprovada e shippada, no **closure da task**:
- [ ] Refletir as telas aprovadas no showcase consolidado — merge DENTRO do
  consolidado existente, não aba nova no hub.
- [ ] Bump do `?v=` nos scripts do `index.html` (cache-bust).
- [ ] **Redeploy** da vitrine (commit+push → auto-deploy) + conferir live.

Regra fixa (também em `AGENTS.md` e na skill `execute-closure`); reforçada pelo
hook `vitrine-sync-reminder.py` no closure.
