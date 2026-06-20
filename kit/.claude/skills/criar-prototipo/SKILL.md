---
name: criar-prototipo
description: Use quando for criar um protótipo HTML+JSX NOVO de uma ou mais telas/fluxos/papéis (modelo cadillac multi-superfície), do zero. Default para "novo protótipo", "nova tela cadillac", "showcase multi-papel", "consolidado", "hub de protótipos". Para CRESCER um protótipo cadillac existente use incrementar-prototipo; para uma tela única legada use html-prototype.
---

# Criar Protótipo (modelo cadillac)

## Princípio central

Um protótipo nasce **montando um motor já provado**, não reescrevendo-o do zero. O motor (registry+router,
device-frame, showcase, casca) é genérico e vive em `templates/`. Você só escreve o **design-system** (as
cores/ícones/primitivas) e as **telas**. Tudo o que você não toca é o que sempre funcionou.

> **Por que isso importa:** quando o motor foi escrito à mão na última vez, nasceu um bug real de
> hooks-after-return-condicional (`InboxMobile`) que travou o app inteiro. O motor bundlado já tem o
> ScreenBoundary, a ordem de carga e o fit-to-stage corretos. Re-derivá-lo é re-introduzir esses bugs.

Stack fixa: **React 18 UMD + Babel standalone**, sem build (sem Vite/webpack/Tailwind). Tokens via CSS vars.
Isto **substitui** a abordagem single-showcase da skill antiga `html-prototype` para qualquer protótipo novo.

## Quando usar

- Nasce um protótipo novo (nova superfície/papel/produto) → scaffold completo (camadas 1–4).
- Entra uma tela nova num protótipo existente → só a camada 3 (uma screen IIFE + registrar).
- O usuário pede "tela", "mockup", "protótipo", "showcase", "versão mobile", "device frame", "responsivo".

**Não** use para: portar protótipo aprovado para a stack real (isso é o passo de produção, ver CLAUDE.md);
editar a skill `html-prototype` antiga (fora de escopo, ela coexiste).

## As 4 camadas do modelo

| # | Camada | Arquivo(s) | O que faz |
|---|--------|-----------|-----------|
| 1 | **Hub** | `index.html` (raiz de `prototipos_html/`) | Tabs por papel/superfície → carrega o consolidado num `<iframe>`; deep-link por `#hash`; `?v=` cache-bust. |
| 2 | **Consolidado** | `<surface>/index.html` + `app.jsx` | UMA superfície tela-pronta. Ordem de carga load-bearing + entry trava o papel. Tem 2 modos: **produto** (app real, router por nav) e **showcase** (revisão). |
| 3 | **Showcase tela-a-tela** | `showcase.jsx` (motor) + `screens/screen-*.jsx` | Percorre CADA tela registrada nos estados default/loading/empty/error, emoldurada. hover/focus/active/disabled ficam vivos nos componentes. |
| 4 | **Device-frame + responsivo** | `device-frame.jsx` (motor) + `<style>` no `index.html` | App mobile real (moldura iOS/Android, single-pane, fit-to-stage) **e** chrome que colapsa em viewport estreito. Ver seção dedicada abaixo. |

Fluxo de revisão do founder: **showcase** (vê todas as telas/estados) → aprova → porta pra produção.

## Workflow de scaffold

Trabalhe em `prototipos_html/<task-id>/` (ou na raiz para o hub). **Comece copiando `examples/minimal/`**
e adaptando — `templates/` tem os arquivos-fonte avulsos para referência.

**Duas formas de montar o motor** (escolha pelo tamanho — não misture):
- **Self-contained / descartável (default):** copie `examples/minimal/` — o motor vem **concatenado** num
  único `engine.jsx`. Ordem de carga **curta**: `ds.jsx → engine.jsx → screens.jsx → app.jsx`. Use para 1
  superfície (é o que o subagente de validação faz).
- **Multi-superfície:** use o motor **split** (os arquivos de `templates/`) num `_shared-<ds>/` + cada
  superfície num `<ds>-<papel>/` (ex.: `_shared-{{PROJECT_DS}}/` + `{{PROJECT_DS}}-{{ROLE}}/`, um por papel).
  Ordem de carga **longa** (ver passo 4). Ver `references/cadillac-model.md`.

1. **Copie o esqueleto** (`examples/minimal/`): `index.html`, `ds.jsx`, `engine.jsx`, `screens.jsx`,
   `app.jsx` — já rodando.
2. **Edite só o `ds.jsx`** (o seam): tokens (`<style>` no `index.html` ou `tokens.css`), `TRANSLATIONS`
   (só as strings de **produto/telas** — as chaves de chrome `mode.*`/`state.*`/`soon.*` já vêm do motor
   via `i18n-chrome`, merge não-destrutivo), primitivas (`Icon`/`Card`/`EmptyState`/`Tag`), `ROLES`/`nav`,
   `Shell`/`MobileShell`, `brandFor`. **Não toque no `engine.jsx`** — é o motor provado.
3. **Escreva as telas** em `screens.jsx` (ou `screens/screen-*.jsx` num protótipo grande): cada tela é uma
   **IIFE** que chama `registerScreen('navKey', Component)`. A tela recebe `{ device, screenState }` e deve
   cobrir os estados que fizerem sentido (ver os 8 estados no checklist).
4. **Confira a ordem de carga** no `index.html` (load-bearing) e ponha `?v=<data>` em TODA tag local.
   Curta: `ds → engine → screens → app`. Longa (split): i18n → i18n-chrome → ds/ui → registry →
   device-frame → (shell) → showcase → app-shell → screens → app.
5. **Registre no hub** *(opcional — só se houver hub/vitrine)*: adicione a entrada no array `PROTOS` de
   `prototipos_html/index.html` com `?v=`. **Pule** para um protótipo standalone/descartável.
6. **Verifique** (ver seção Verificação): sobe no preview sem erro de console; os 8 estados, dark/light e
   mobile conferidos.

## MOBILE & RESPONSIVO (não negociável — os dois eixos)

O modelo cadillac trata mobile como cidadão de 1ª classe em **dois eixos independentes**. Cobrir os dois.

### Eixo A — app mobile real (device-frame)
- O toggle **device: mobile** emoldura a tela numa moldura **iOS/Android** real (`DeviceFrame`), viewport
  390×800, com status bar, notch/punch-hole e home-indicator.
- `ScaledDevice` + `useElementSize` (ResizeObserver) + `useIsMobile` fazem **fit-to-stage**: a moldura
  escala (≤1) para caber no palco em qualquer viewport, nunca corta. Isso é motor — não reescreva.
- Mobile é **single-pane de verdade** onde o uso real é mobile: a casca vira `MobileShell` (conteúdo +
  **bottom-nav**, sem sidebar). Um fluxo lista→detalhe→voltar é single-pane (uma coluna por vez), não o
  layout desktop encolhido. Ex.: Inbox = lista de conversas → thread → voltar.

### Eixo B — responsividade do chrome
O chrome do showcase (header de switchers) **colapsa** em telas estreitas — o cadillac faz isso muito bem.
O CSS completo está em `references/cadillac-model.md`; o essencial:

```css
.showcase-shell { height: 100vh; height: 100dvh; overflow: hidden; }   /* dvh: barra do mobile não corta */
.showcase-body  { flex: 1; min-height: 0; overflow: auto;
                  align-items: safe center; justify-content: safe center; }  /* device centrado, sem clip */
@media (max-width: 640px) {
  .showcase-header   { flex-wrap: nowrap; padding: 8px 12px; }   /* faixa fina de 1 linha */
  .brand-suffix      { display: none; }                          /* esconde o supérfluo */
  .showcase-switchers{ flex-wrap: nowrap; overflow-x: auto; min-width: 0; }  /* switchers rolam no eixo-x */
  .sw-label          { display: none; }                          /* só os botões, sem rótulo */
}
```

`safe center` (não só `center`) é o detalhe que impede o device de ser cortado quando é mais alto que o
palco — sem ele, o topo some atrás do header. `100dvh` (não `100vh`) impede a barra de endereço do mobile
de comer a última faixa.

## Gotchas (cada um mordeu de verdade — por isso estão aqui)

**Universais do motor (valem em todo protótipo):**

| Gotcha | Por quê | Faça |
|--------|---------|------|
| **Hooks nunca depois de `return` condicional** | Quebrou o app real (`InboxMobile`): a ordem dos hooks muda entre renders → React crasha. | Todo `useState/useRef/useEffect` no topo do componente, antes de qualquer `return`. |
| **Ordem de carga é load-bearing** | Um arquivo que usa `TRANSLATIONS`/`ROLES`/`Icon` antes de eles existirem dá `undefined`. | Siga a ordem do workflow (passo 4). i18n e ds **antes** do motor; screens **antes** do app. |
| **1 IIFE por screen** | Babel standalone compartilha um escopo global; dois `function Inbox(){}` no topo → "already declared". | Embrulhe cada tela em `(function(){ … registerScreen('k', C); })()`. |
| **`ScreenBoundary key={active}`** | Sem `key`, o erro de uma tela "gruda" e persiste ao navegar pra outra. | Use `key={active}` (produto) e `key={item.key+state}` (showcase) — o motor já faz; mantenha. |
| **`?v=<data>` em toda tag local** | O browser cacheia `.jsx`; sem cache-bust você revisa código velho e "conserta" fantasmas. | Sufixo `?v=AAAAMMDD<letra>` em todo `src`/`href` local + no `src` do iframe do hub; bump ao publicar. |
| **Tokens no escopo do app** | Portal/modal montado no `body` perde as CSS vars do container → cores quebradas. | Mantenha o que usa tokens dentro da árvore com `data-theme`; device-tokens via `<style>` (já no motor). |

**Invariantes de produto (opt-in — só quando a tela toca o domínio de `{{PROJECT_NAME}}`):**

Ambos são **invariantes OPCIONAIS, default OFF**. Ative só se o produto de `{{PROJECT_NAME}}` tiver
o atributo correspondente — num protótipo fora desse domínio, ignore.

| Invariante opcional | Quando ativar | Faça |
|--------|---------|------|
| **(opt-in) Identidade white-label numa fonte só** | Se o produto for white-label (mesmo shell serve marcas distintas). | Identidade de marca tem fonte única (`brandFor()` em `ds.jsx`); shell/telas leem dela; sem strings de marca hard-coded; o shell nunca mostra a marca do fornecedor. |
| **(opt-in) Cor semântica reservada nunca vira CTA** | Se o produto tiver uma cor com significado reservado (`{{RESERVED_SEMANTIC_TOKEN}}` = `{{RESERVED_MEANING}}`, ver `{{ADR_REF}}`). | A cor reservada mantém o significado reservado e nunca vira CTA — CTA usa `--brand`. O `tone="semantic"` do `SwGroup` é o eixo semântico extra opcional (genérico). |

## Verificação (antes de apresentar / declarar pronto)

- Abre no preview **sem erro de console** (use o MCP de preview; cheque `preview_console_logs`). Sem preview
  MCP? Sirva a pasta (`python3 -m http.server --directory prototipos_html`) e cheque no browser; como sanity
  de sintaxe offline, rode os `.jsx` pelo `@babel/standalone` (preset react).
- Os **8 estados** (default/hover/focus/active/disabled/loading/empty/error), **dark/light** e **idiomas**
  conferidos no showcase. Mobile: device-frame iOS+Android e o chrome colapsado num viewport estreito.
- Invariantes de produto **opcionais** quando a tela tocar o domínio de `{{PROJECT_NAME}}`: cor
  semântica reservada, white-label (zero leak da marca do fornecedor), papéis, e não logar PII/segredos
  conforme `{{COMPLIANCE_REQS}}` (régua 12/12 em `docs/frontend/html-prototype-checklist.md` §6).
- Prova visual: screenshot do(s) estado(s)-chave para a validação do founder; aprovação registrada no LEDGER.

**Auto-teste do motor:** se você scaffoldou do zero, a prova de que o modelo está íntegro é o exemplo
`examples/minimal/` subir limpo. Se um protótipo novo dá erro de console que o exemplo não dá, o problema
está no que **você** escreveu (ds/screens), não no motor.

## Ponteiros

- `templates/` — o motor genérico copiável: `registry.jsx` · `device-frame.jsx` · `app-shell.jsx` ·
  `showcase.jsx` · `i18n-chrome.jsx` (seams marcados com `// SEAM:`) + `consolidado.index.html` ·
  `hub.index.html` · `screen.iife.jsx`.
- `examples/minimal/` — **comece aqui**: modelo completo mínimo, self-contained, rodável (hub-less; 1
  consolidado + 2 telas + showcase + device-frame). A divisão `ds.jsx` (edita) ↔ `engine.jsx` (não toca)
  é o princípio central feito código.
- `references/cadillac-model.md` — modelo destrinchado + **CSS responsivo completo** + a referência
  canônica embarcada (`examples/minimal/`) e a galeria de protótipos de origem (referência conceitual
  externa, não embarcada) que comprova o modelo agnóstico de domínio.
- Checklist do gate de frontend: `docs/frontend/html-prototype-checklist.md`.
