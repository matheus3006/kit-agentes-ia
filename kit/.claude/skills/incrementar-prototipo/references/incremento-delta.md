# Incremento — o delta cirúrgico (antes/depois)

Os passos exatos para **fundir uma tela aprovada** num consolidado cadillac já aprovado, sem tocar no motor.
Leia antes da cirurgia. Os exemplos usam o exemplo embarcado (`examples/minimal/`, concatenado) e a forma
genérica da variante split (`<ds>-<papel>/` + `_shared-<ds>/`).

## As 4 cirurgias (sempre as mesmas; o lugar muda por variante)

1. **nav-key** — registrar a tela na árvore de navegação (`ROLES.<papel>.nav`).
2. **strings** — chaves i18n da tela (rótulo da nav + textos dos 8 estados), pt-BR + en.
3. **screen** — a tela como IIFE `registerScreen('navKey', C)`, **na ordem de carga antes do app**.
4. **`?v=` + hub** — bump do cache-bust em TODA tag local + reflexo no hub.

A tela em si (IIFE, hooks no topo, 8 estados) é da **camada 3 da `/criar-prototipo`** — delegada, não repetida aqui.

> **Qual variante?** Há um `_shared-<ds>/` + `<ds>-<papel>/`? → **SPLIT**. Há um `engine.jsx` único e
> `ds.jsx`/`screens.jsx` self-contained? → **CONCATENADO**. Não misture as duas.

---

## Variante CONCATENADO (self-contained · ex.: `examples/minimal/`)

Tudo num diretório: `index.html` + `ds.jsx` + `engine.jsx` + `screens.jsx` + `app.jsx`.

### 1+2 · nav-key e strings em `ds.jsx`

```js
// ROLES.<papel>.nav[].items  — ANTES
items: [
  { key: 'home',  labelKey: 'nav.home',  icon: 'home' },
  { key: 'items', labelKey: 'nav.items', icon: 'list' },
]
// DEPOIS — acrescenta a nav-key da tela nova
items: [
  { key: 'home',    labelKey: 'nav.home',    icon: 'home' },
  { key: 'items',   labelKey: 'nav.items',   icon: 'list' },
  { key: 'reports', labelKey: 'nav.reports', icon: 'grid' },   // ← novo
]
```

```js
// TRANSLATIONS — acrescenta em CADA idioma (pt-BR canônico + en fallback)
'nav.reports': 'Relatórios',                 // (en: 'Reports')
'reports.title': 'Relatórios',
'reports.empty.title': 'Sem dados ainda', 'reports.empty.body': '…',
'reports.error.title': 'Falha ao carregar', 'reports.error.body': '…',
```

> **Ícone fora do set?** O `Icon` tem fallback (círculo) mas não deixe assim: adicione o `path` em
> `ICON_PATHS` (concatenado: `ds.jsx`; split: `icons.jsx`) e use o nome novo.

### 3 · a tela em `screens.jsx`

Acrescente **um bloco IIFE** no fim do arquivo (mesma forma das telas existentes), terminando em
`registerScreen`. **Não** crie um segundo componente no escopo de topo — a IIFE isola o escopo.

```js
// ===== tela: reports ==========================================================
(function () {
  function Screen({ device, screenState }) {
    const { t } = useT();
    const isMobile = device === 'mobile';
    // hooks SEMPRE aqui no topo, antes de qualquer return condicional.
    if (screenState === 'loading') { /* skeleton */ }
    if (screenState === 'empty')   { /* EmptyState */ }
    if (screenState === 'error')   { /* EmptyState alert */ }
    return /* default */ null;
  }
  registerScreen('reports', Screen);   // ← a navKey casa com items[].key
})();
```

### 4 · `index.html` (NÃO há tag nova) + `?v=`

No concatenado a tela vive em `screens.jsx`, que **já está** na ordem de carga — **nenhuma tag nova**.
Só **bump do `?v=`** em todas as 4 tags locais (o browser cacheia `.jsx`):

```html
<!-- ANTES: ?v=20260620a  →  DEPOIS: ?v=20260620b em TODAS -->
<script type="text/babel" src="ds.jsx?v=20260620b"></script>
<script type="text/babel" src="engine.jsx?v=20260620b"></script>
<script type="text/babel" src="screens.jsx?v=20260620b"></script>
<script type="text/babel" src="app.jsx?v=20260620b"></script>
```

---

## Variante SPLIT (multi-superfície · ex.: `<ds>-<papel>/` + `_shared-<ds>/`)

Motor + DS compartilhados em `_shared-<ds>/`; cada consolidado em `<ds>-<papel>/` com `index.html` + `app.jsx`
+ `screens/`. As telas auto-registram em `window.<DS>Screens` via `registerScreen` (ver `registry.jsx`).

### 1 · nav-key em `_shared-<ds>/data.jsx`

Edite **só o papel do consolidado-alvo** (`ROLES.<papel>` cresce o `<ds>-<papel>`; os outros papéis não mudam):

```js
// ROLES.<papel>.nav[].items — acrescenta a nav-key
{ key: 'fluxo', labelKey: 'nav.fluxo', icon: 'kanban' },   // ← novo
```

### 2 · strings em `_shared-<ds>/i18n.jsx`

Acrescente `nav.fluxo` + as chaves da tela em cada idioma. (Strings compartilhadas são inofensivas aos
outros consolidados; só o `ROLES.<papel>` é que mostra a nav-key.)

### 3 · novo arquivo `<surface>/screens/screen-<key>.jsx`

No split, **uma tela = um arquivo** (uma IIFE), dentro do consolidado-alvo (não no `_shared-`):

```js
// <ds>-<papel>/screens/screen-fluxo.jsx
(function () {
  function Screen({ device, screenState }) {
    /* hooks no topo · 8 estados · usa primitivas de ui.jsx/icons.jsx */
  }
  registerScreen('fluxo', Screen);
})();
```

### 4 · `<surface>/index.html` — inserir a tag (antes do app) + bump `?v=` em TUDO

```html
<!-- Telas deste consolidado (ANTES do app) -->
<script type="text/babel" src="screens/screen-home.jsx?v=20260620c"></script>
<script type="text/babel" src="screens/screen-fluxo.jsx?v=20260620c"></script>  <!-- ← novo -->

<!-- Entry -->
<script type="text/babel" src="app.jsx?v=20260620c"></script>
```

**Bump `?v=` em TODA tag local** — não só a nova: `tokens.css`, todos os `../_shared-<ds>/*.jsx`, todas as
`screens/*.jsx` e o `app.jsx`. Bumpar só a tag nova deixa o browser servir motor/telas em cache (você revisa
código velho e "conserta" fantasmas). O bump aqui muda só a chave de cache **desta** página.

### Hub `prototipos_html/index.html` — refletir

O consolidado **já tem** entrada no array `PROTOS`. Crescer = **bump do `?v=`** no `src` dela (e atualizar o
`ref` se a superfície ganhou algo notável). Não crie entrada nova (entrada nova = consolidado novo = `/criar-prototipo`).

```js
// ANTES
{ key: '<ds>-<papel>', label: '<Papel>', src: '<ds>-<papel>/index.html?v=20260620b', wip: false, ref: '<ds>-<papel>/ · papel <Papel> — Home …' },
// DEPOIS — bump do ?v= (+ ref atualizado)
{ key: '<ds>-<papel>', label: '<Papel>', src: '<ds>-<papel>/index.html?v=20260620c', wip: false, ref: '<ds>-<papel>/ · papel <Papel> — Home + Fluxo' },
```

---

## Checklist da cirurgia (rode antes do gate de aprovação)

- [ ] nav-key acrescentada ao **papel certo** (e ícone existe em `ICON_PATHS`/`icons.jsx`).
- [ ] strings `nav.<key>` + 8 estados em pt-BR **e** en (zero string hard-coded na tela).
- [ ] tela = **1 IIFE** terminando em `registerScreen('<key>', C)`; hooks no topo.
- [ ] split: arquivo em `<surface>/screens/` **e** `<script>` inserido **antes** do `app.jsx`.
- [ ] **`?v=` bumpado em TODA tag local** do consolidado + `src` do iframe no hub.
- [ ] consolidado sobe no preview **sem erro de console**; 8 estados/dark/mobile; conformância 12/12 mantida.
