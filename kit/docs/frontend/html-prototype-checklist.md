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

## i18n (pt-BR only no MVP — decisão entrevista 2026-05-19)
- [ ] `TRANSLATIONS = { 'pt-BR': {...} }` apenas — sem EN/ES no MVP
- [ ] Hook `useT()` para acesso (sem parâmetro `lang` no MVP)
- [ ] Sem strings hard-coded nos componentes
- [ ] Estrutura permite expansão pós-MVP (basta adicionar chave de locale)

## Showcase
- [ ] Header sticky com brand + tabs + switchers
- [ ] Tab por persona/role/feature
- [ ] Switcher de tema (light | dark)
- [ ] Switcher de plataforma (iOS | Android | Web) se aplicável
- [ ] Modo "All Screens" com grade scrollável + zoom controls
- [ ] ErrorBoundary por tab (uma tela quebrada não derruba o resto)
- ~~Switcher de idioma~~ — removido: MVP pt-BR only

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

## Pós-ship — refletir no #cliente (anti-drift)
Depois que a tela é aprovada e shippada, no **closure da task**:
- [ ] Refletir a tela aprovada no protótipo consolidado `#cliente`
  (`prototipos_html/2026-05-20-cliente-mvp/`) — merge DENTRO dele, não aba nova no hub.
- [ ] Bump do `?v=` nos scripts do `index.html` (cache-bust).
- [ ] **Redeploy** da vitrine (commit+push → `<seu-repo-de-vitrine>` auto-deploy) + conferir live.

Regra fixa (memória `feedback-vitrine-prototipos` · também em AGENTS.md e na skill
`execute-closure`); reforçada pelo hook `vitrine-sync-reminder.py` no closure.
