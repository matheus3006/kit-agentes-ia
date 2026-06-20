# Modelo cadillac — referência

O modelo destrinchado, o CSS responsivo completo, e os dois exemplos vivos. Leia quando precisar
do detalhe que o `SKILL.md` resume.

## Índice
1. As 4 camadas em profundidade
2. Ordem de carga canônica
3. Mobile: fit-to-stage + single-pane
4. CSS responsivo completo (o chrome que colapsa)
5. Os dois exemplos vivos (fonte canônica)
6. templates/ ↔ examples/ (manter em sincronia)

---

## 1 · As 4 camadas em profundidade

**Hub** (`prototipos_html/index.html`) — porta de entrada. Tabs por papel/superfície; cada tab troca o
`src` de um `<iframe>`. Deep-link por `#hash` (compartilhável). `wip:true` → placeholder com referência
(item não servido). Cache-bust `?v=` no `src` do iframe.

**Consolidado** (`<superfície>/index.html` + `app.jsx`) — UMA superfície tela-pronta, travada num papel.
Dois modos no mesmo app:
- **produto** — "é o produto": shell white-label limpa, router por nav-key. É o que o cliente veria.
- **showcase** — vitrine de revisão: percorre cada tela em cada estado, emoldurada.

O `app.jsx` só faz `ReactDOM.createRoot(...).render(<AppShell role="..."/>)`. A troca de papel é do hub,
não de um switcher interno — cada consolidado é UM produto.

**Showcase tela-a-tela** (`showcase.jsx`) — `AppShowcase` lista as nav-keys que têm screen registrada e
renderiza um bloco por tela no estado selecionado (default/loading/empty/error). Os estados
**interativos** (hover/focus/active/disabled) não são switcher — vivem nos componentes; o texto de ajuda
no topo lembra disso.

**Device-frame + responsivo** (`device-frame.jsx` + `<style>`) — ver §3 e §4.

---

## 2 · Ordem de carga canônica

A ordem dos `<script>` no `index.html` é **load-bearing**. Um arquivo que referencia `TRANSLATIONS`,
`ROLES` ou `Icon` antes de eles existirem recebe `undefined` e quebra no parse/primeiro render.

```
React + ReactDOM + Babel (CDN)
i18n.jsx            (DS · define TRANSLATIONS, I18nProvider, useT)
i18n-chrome.jsx     (motor · merge não-destrutivo do vocabulário de chrome)
ui.jsx              (DS · Icon, Card, EmptyState, Tag, GlobalKeyframes)
nav.jsx / data.jsx  (DS · ROLES, brandFor, Shell, MobileShell)
registry.jsx        (motor · registerScreen/getScreen/ScreenBoundary/SwGroup)
device-frame.jsx    (motor · DeviceFrame/ScaledDevice/useIsMobile/useElementSize)
showcase.jsx        (motor · AppShowcase)
app-shell.jsx       (motor · AppShell — orquestra)
screens/screen-*.jsx(telas · cada uma IIFE + registerScreen · ANTES do app)
app.jsx             (entry · render AppShell)
```

No exemplo mínimo, `ui.jsx`+`nav.jsx`+`i18n.jsx` estão fundidos em `ds.jsx`, e o motor inteiro em
`engine.jsx` — mesma ordem relativa (`ds.jsx → engine.jsx → screens.jsx → app.jsx`).

### Onde o motor mora no install (copie pra dentro de `prototipos_html/`)

Num install real o motor-fonte fica em `.claude/skills/criar-prototipo/templates/` (split) e o bundle
self-contained em `.claude/skills/criar-prototipo/examples/minimal/engine.jsx` — ambos **fora** de
`prototipos_html/`. O `python3 -m http.server` serve **com raiz em `prototipos_html/`**: um `<script src>`
que tenta subir até `.claude/...` não resolve sob essa raiz e é frágil. Logo, **copie o motor para dentro
da pasta servida**, nunca o referencie in-place:

- **Consolidado único (concatenado):** copie `examples/minimal/engine.jsx` para a pasta do protótipo
  (`prototipos_html/<task-id>/engine.jsx`).
- **SPLIT / multi-papel:** copie os `templates/*.jsx` necessários para um `_shared-<ds>/` **sob**
  `prototipos_html/` (ex.: `prototipos_html/_shared-<ds>/registry.jsx`). O consolidado então aponta com
  caminho relativo que **fica dentro da raiz servida** (ex.: `../_shared-<ds>/registry.jsx`), nunca
  `../../.claude/...`.

Regra única: **todo `<script src>` local resolve sob a raiz servida `prototipos_html/`**.
`<task-id>` = slug com prefixo de data (ex.: `AAAA-MM-DD-<slug>-mvp`).

---

## 3 · Mobile: fit-to-stage + single-pane

**Fit-to-stage.** `ScaledDevice` mede o palco (`useElementSize` → `ResizeObserver`) e escala a moldura
390×800 por `Math.min(1, palco/frame)` — 1:1 em tela grande, encolhe em palco menor, **nunca corta**.
Enquanto o palco mede 0 (1º paint), `visibility:hidden` evita um flash desalinhado. (Num preview
headless sem `ResizeObserver`, a escala fica 0 e o device não aparece no modo produto — é limitação do
ambiente, não do código; em browser real escala normal.)

**Single-pane de verdade.** Onde mobile é uso real, a casca vira `MobileShell` (conteúdo + bottom-nav, sem
sidebar) e a navegação é uma coluna por vez. Um Inbox vira lista → thread → voltar — não o layout desktop
de 3 painéis espremido. No showcase, o device usa `DeviceFrame` direto (sem escala) porque o palco do
showcase rola.

---

## 4 · CSS responsivo completo (o chrome que colapsa)

Cole no `<style>` do `index.html`. O cadillac faz o chrome do showcase virar uma faixa fina de 1 linha em
viewport estreito, com os switchers rolando no eixo-x e os rótulos sumindo. O motor já põe as classes
(`showcase-header`, `showcase-brand`, `brand-suffix`, `showcase-switchers`, `sw-label`, `showcase-body`).

```css
/* casca do showcase — 100dvh impede a barra de endereço do mobile de cortar a última faixa */
.showcase-shell { display: flex; flex-direction: column; height: 100vh; height: 100dvh; overflow: hidden; position: relative; }

/* header de switchers — sticky no topo */
.showcase-header { position: sticky; top: 0; z-index: 50; display: flex; align-items: center; gap: 24px; }
.showcase-switchers { margin-left: auto; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.sw-label { font-size: 11px; text-transform: uppercase; letter-spacing: .6px; font-weight: 800; }

/* corpo = "palco" do device escalado. safe center: device mais alto que o palco NÃO é cortado no topo */
.showcase-body { flex: 1; min-height: 0; overflow: auto; display: flex;
                 align-items: safe center; justify-content: safe center; }

::-webkit-scrollbar { width: 0; height: 0; }

@media (max-width: 640px) {
  .showcase-header    { flex-wrap: nowrap; gap: 8px; padding: 8px 12px; }  /* faixa fina, 1 linha */
  .showcase-brand     { flex-shrink: 0; }
  .brand-suffix       { display: none; }                                  /* esconde o badge supérfluo */
  .showcase-switchers { margin-left: auto; flex-wrap: nowrap; overflow-x: auto; min-width: 0; gap: 8px; }
  .sw-label           { display: none; }                                  /* só os botões */
  .showcase-body      { padding: 12px; }
}
```

Os dois detalhes que mais erram: `align-items: safe center` (não só `center`) e `height: 100dvh`
(não `100vh`). Sem eles, o device é cortado no topo / atrás da barra de endereço.

---

## 5 · Os exemplos vivos (fonte canônica)

Quando o template e o motor vivo divergirem, **os exemplos vivos vencem** — eles rodam em produção de
revisão e foram caçados a bugs.

**Referência canônica embarcada — `examples/minimal/`.** O exemplo neutro que viaja com esta skill
(`examples/minimal/{index.html,ds.jsx,engine.jsx,screens.jsx,app.jsx}`) é a prova mínima de que o motor +
uma DS enxuta sobem limpos. Use-o como o "copie-me" de partida e como o ground-truth quando o `SKILL.md` ou
um template ficar ambíguo: o que `examples/minimal/` faz é o comportamento esperado do motor. `engine.jsx` é
o motor CONCATENADO (mesmos seams dos `templates/` preenchidos — ver §6). Olhe nele o
`@media(max-width:640px)`, o `useIsMobile`/`useElementSize`/`DeviceFrame`/`ScaledDevice`
(`isMobile?ScaledDevice:DeviceFrame`) e o registry+router (`ErrorBoundary key={active}`, `ComingSoon`).

**Galeria de protótipos de origem (referência externa, não embarcada).** O modelo cadillac nasceu maduro
em protótipos reais de domínios bem diferentes — eles comprovam que o motor é **agnóstico de domínio**:
- **split multi-papel + white-label** — um consolidado por papel sob um motor compartilhado, com a marca
  vindo de fonte única (`brandFor()`) e um eixo semântico reservado opcional por tela (`tone`); inclui uma
  tela mobile single-pane real (lista→thread→voltar).
- **device-frame/registry de origem** — o protótipo de um domínio de delivery onde nasceram o
  `DeviceFrame`/`ScaledDevice` e o registry+router descritos acima.
- **mesmo motor, outro domínio** — o mesmíssimo motor reaplicado a um domínio de saúde (app de paciente /
  painel profissional / PWA), sem tocar a engine.

A galeria é só ponteiro conceitual: nada dela é copiado para o kit. O que viaja embarcado e é a fonte
canônica de uso é `examples/minimal/`.

---

## 6 · templates/ ↔ examples/ (manter em sincronia)

`templates/{registry,device-frame,showcase,app-shell,i18n-chrome}.jsx` (motor SPLIT, com `// SEAM:`) e
`examples/minimal/engine.jsx` (motor CONCATENADO, seams preenchidos) carregam o **mesmo** código. Se você
corrigir um bug no motor, corrija nos dois. O exemplo é a prova de que o motor + uma DS mínima sobem
limpos; os templates são o "copie-me" para um protótipo de verdade (multi-arquivo, multi-tela).
