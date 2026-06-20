# Pilar 3 — Protótipo HTML+JSX como fonte de verdade visual

> Leitor: um agente de IA que vai instalar e operar este método num projeto novo.
> Este documento descreve como toda tela ou fluxo de frontend nasce — antes de uma
> linha de código de produção. O fluxo é imposto pelo command `/nova-tela-fe` e pelo
> gate de aprovação do watchdog (ver `01-controle-de-contexto.md`).

## O princípio

Não há Figma neste método. A fonte de verdade visual é um **protótipo HTML+JSX
navegável** que roda direto no browser, sem build step, via Babel standalone. Antes
de tocar o stack real, você produz um app React 18 que cobre todos os estados de
todas as telas em jogo, serve localmente, e só porta para produção **após aprovação
canônica explícita do humano**.

O modelo default é o **cadillac multi-superfície**: cada superfície aprovada (um
papel, um fluxo, um conjunto coerente de telas) vira um **consolidado** próprio em
`prototipos_html/<task-id>/`, e um **hub** (`prototipos_html/index.html` com `PROTOS[]`)
indexa todos os consolidados. As telas nascem num consolidado e *crescem* nele sem
reescrever o motor. As skills `criar-prototipo` (nascer um consolidado novo) e
`incrementar-prototipo` (fundir uma tela num consolidado existente) operam esse
modelo; a skill legada `html-prototype` cobre só o caso single-showcase de tela
única (ver `05-skills-e-commands.md`).

Por que isto e não Figma:

1. **Zero ferramenta intermediária.** O protótipo é HTML+JSX — o agente escreve,
   o humano abre no browser, ambos veem a mesma coisa. Nada de exportar, sincronizar
   ou interpretar specs de design.
2. **É código React.** Os tokens, a estrutura de componentes e a lógica de estado
   já estão na linguagem do destino. Portar para Flutter/Next.js é tradução 1:1,
   não reinterpretação de um mockup estático.
3. **Itera em segundos.** Editar um `.jsx` e dar F5 é mais rápido que qualquer
   ciclo de design tool. O protótipo é descartável e barato — é onde a UX é decidida.

A regra dura: **sem aprovação do protótipo, não se implementa nada no stack real.**

## Estrutura de arquivos (modelo cadillac multi-superfície)

Cada superfície aprovada vira um **consolidado** em `prototipos_html/<task-id>/`, e o
**hub** na raiz indexa todos eles:

```
prototipos_html/
├── index.html                  # HUB: PROTOS[] {key,label,src,wip,ref} + iframes ?v= por consolidado
└── <task-id>/                  # um CONSOLIDADO por superfície aprovada
    ├── index.html              # Orquestrador: React 18 + Babel via CDN, tokens, app-shell, registry
    ├── i18n.jsx                # TRANSLATIONS centralizadas + nada hard-coded
    ├── ds.jsx                  # Design system: tokens, primitivos, ícones, brandFor()
    ├── data.jsx                # Mocks (NUNCA PII ou dados reais)
    ├── engine.jsx              # Motor cadillac (registry, device-frame, showcase, app-shell) — NÃO editar
    ├── screens.jsx             # As telas da superfície (cada tela = 1 IIFE, registrada no registry)
    └── app.jsx                 # Monta o app-shell sobre o registry
```

A ordem de load importa: no `index.html`, os `<script type="text/babel">` carregam na
sequência **`i18n → i18n-chrome → ui → nav → registry → device-frame → showcase →
app-shell → screens → app`**, porque cada um depende dos anteriores no escopo global
(sem módulos ES, tudo no mesmo namespace de browser). O motor (`engine.jsx`/`templates/`)
é copiado e nunca editado in-place — você mexe só em `ds.jsx`/`screens.jsx`/tokens.

**Como começar.** Não copie um template à mão — invoque a skill:

- **Protótipo novo** (uma superfície do zero) → `/criar-prototipo`. Ela gera o
  consolidado a partir de `templates/` (motor) + uma DS mínima, e o exemplo neutro
  embarcado (`criar-prototipo/examples/minimal/`) é o ground-truth do "copie-me".
- **Crescer um existente** (adicionar uma tela/estado/papel a um consolidado) →
  `/incrementar-prototipo`. Delta-fusão cirúrgica: registra a tela no registry, sobe
  o `?v=`, deixa o motor intacto.

Detalhe das 4 camadas, da ordem de load e do fit-to-stage em
`kit/.claude/skills/criar-prototipo/references/cadillac-model.md`.

## O index.html (orquestrador do consolidado)

É o único HTML de cada consolidado. Responsabilidades, na ordem em que aparecem:

1. **`<html lang="pt-BR" data-theme="light">`** — o atributo `data-theme` no
   elemento raiz é o gancho do switcher de tema. O app-shell troca `light`/`dark`
   chamando `document.documentElement.setAttribute('data-theme', theme)`.
2. **Fontes via `<link>`** — preconnect + a tipografia do projeto (SEAM `{{TYPOGRAPHY}}`).
   Trocar aqui é onde a identidade começa.
3. **Bloco `<style>` com os tokens** — `:root` define o tema light; `[data-theme="dark"]`
   sobrescreve. Device/chrome injetam camadas extras via `<style>`/merge **sem tocar**
   os tokens canônicos. Detalhe na próxima seção.
4. **CDNs no fim do `<body>`** — nesta ordem fixa:
   ```html
   <script src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
   <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
   <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"></script>
   ```
   Use os builds `development` do React: stack traces e warnings claros valem mais
   que tamanho num protótipo.
5. **As camadas como `type="text/babel"`** — Babel transpila JSX no browser em
   runtime. Cada `<script type="text/babel" src="X.jsx?v=N">` **na ordem de load** e
   com `?v=` de cache-bust em toda tag local. Cada tela em `screens.jsx` é uma IIFE
   isolada (hooks no topo, antes de qualquer return condicional) que se registra no
   `window.<DS>Screens` via `registerScreen`.
6. **O mount** — um último bloco inline monta o app-shell sobre o registry:
   ```html
   <script type="text/babel">
     const root = ReactDOM.createRoot(document.getElementById('root'));
     root.render(<AppShell/>);
   </script>
   ```

## Tokens CSS obrigatórios (zero hex inline)

Toda cor, espaço, raio e sombra é uma CSS variable. Componentes só consomem
`var(--token)` — nunca um hex ou px mágico solto no JSX. O conjunto mínimo do
template (`index.html`, bloco `:root`):

- **Cores de marca:** `--primary`, `--primary-deep`, `--primary-soft`, `--accent`,
  `--accent-soft`.
- **Superfície/tema:** `--bg`, `--fg`, `--surface`, `--surface-2`, `--input-bg`,
  `--border`, `--border-strong`, `--muted`, `--header-blur-bg`, `--tabbar-bg`.
- **Status:** `--ok` / `--ok-soft`, `--warn` / `--warn-soft`, `--danger` / `--danger-soft`.
- **Escala de espaço:** `--space-1` (4px) … `--space-6` (32px).
- **Raios:** `--radius-sm` / `--radius-md` / `--radius-lg` / `--radius-full`.
- **Sombras:** `--shadow-sm` / `--shadow-md` / `--shadow-lg`.

O bloco `[data-theme="dark"]` redefine cada token de cor (não os de espaço/raio,
que são invariantes ao tema). Regra: se você precisou escrever um `#hex` dentro de
um componente, é sinal de que falta um token — adicione-o ao `:root` + ao dark.

## Os 8 estados visuais obrigatórios

O showcase tem uma aba por estado. Cada tela do protótipo precisa renderizar todos
os oito, com critério objetivo de "feito":

- **default** — estado base, dados típicos. A tela como ela é 90% do tempo.
- **hover** — feedback visual em elementos interativos (mudança de cor/elevação).
- **focus** — outline visível (não removido!) + ordem de tabulação lógica.
- **active/pressed** — transformação sutil ao tocar (o template usa `scale(0.97)`
  no primitivo `Press`).
- **disabled** — opacidade reduzida + `cursor: not-allowed` + sem resposta a clique.
- **loading** — skeleton ou spinner, **sem layout shift** (o esqueleto ocupa o
  mesmo espaço do conteúdo final). O template traz `Skeleton` com shimmer.
- **empty** — ilustração/ícone + copy explicativo + CTA de saída. Não uma página
  em branco. O template traz `EmptyState`.
- **error** — mensagem clara do que falhou + ação de recuperação. `role="alert"`.
  O template traz `ErrorState`.

Critério de aceite: nenhum estado pode ser "pulado". Uma tela sem `empty` ou sem
`error` é uma tela incompleta — esses são os estados que o stack real vai precisar e
que mais escapam quando se pula direto para o código.

## i18n centralizada

Toda string visível vem de um dicionário, nunca hard-coded no JSX. O padrão
(`i18n.jsx` + `useT` em `ui.jsx`):

```js
const TRANSLATIONS = { 'pt-BR': { ctaPrimary: 'Confirmar', helloUser: 'Olá, {name}' } };
const useT = (lang) => {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS['pt-BR'];
  return (k, vars) => { let s = dict[k]; if (vars) for (const v in vars) s = s.replace('{'+v+'}', vars[v]); return s ?? k; };
};
// no componente:  const t = useT(lang);  ...  <Button>{t('ctaPrimary')}</Button>
```

Mesmo em projeto monolíngue (pt-BR only — caso comum no MVP), use a estrutura
`TRANSLATIONS[lang][key]`. O custo é zero e evita um refactor global quando um
segundo idioma aparecer: basta adicionar uma chave de locale. O template traz
pt-BR/en/es como exemplo; o checklist do kit registra que o padrão real adotado foi
**pt-BR only**, com a estrutura preservada para expansão.

## O motor: registry, showcase e app-shell

O motor cadillac (`engine.jsx` no consolidado, `templates/` na skill) é copiado e
nunca editado. Suas peças:

- **Registry** (`window.<DS>Screens` + `registerScreen`/`getScreen` + `ScreenBoundary`).
  Cada tela se auto-registra ao carregar; o app-shell pede a tela ativa por chave.
  O `ScreenBoundary` isola o erro de uma tela — ela quebra dentro do próprio frame e
  **não derruba o consolidado inteiro**.
- **Showcase** — o chrome de revisão: header sticky com brand (de `brandFor()`) +
  tabs (uma por tela/papel/estado) + switchers à direita. Switchers alternam **tema**
  (light/dark — escreve `data-theme` na raiz), **plataforma** (iOS/Android/Web) e
  **idioma** (merge não-destrutivo no i18n); os demais passam props às telas.
- **Device-frame** — moldura responsiva com `fit-to-stage` via `ResizeObserver`
  (`useElementSize`/`useIsMobile` → `isMobile?ScaledDevice:DeviceFrame`), `100dvh` e
  safe-center. É o que faz a tela mobile caber na palco sem distorcer.
- **App-shell** — orquestra tudo: estado local de `lang`/`theme`/`active`, aplica o
  tema na raiz, e renderiza a tela ativa dentro do device-frame + `ScreenBoundary`.

O **hub** (`prototipos_html/index.html`) é a camada acima dos consolidados: lê o
manifesto `PROTOS[]` (`{key,label,src,wip,ref}`) e embute cada consolidado num iframe
com `?v=` de cache-bust. `wip:true` marca um placeholder ainda não pronto. *Crescer*
um consolidado existente sobe o `?v=` da entrada; *criar* uma superfície nova adiciona
uma entrada — nunca se mistura os dois.

## Acessibilidade do protótipo

O protótipo já nasce acessível, porque a a11y vira requisito do porte:

- **Contraste** mínimo 4.5:1 para texto normal, 3:1 para texto grande. Valide os
  tokens de cor contra o fundo nos dois temas.
- **Foco visível** em todos os interativos — nunca `outline: none` sem substituto.
- **Ordem de tabulação lógica** — siga a ordem do DOM; o primitivo `Press` do
  template já expõe `tabIndex` e trata `Enter`.
- **`role` e `aria-label`** onde o HTML semântico não cobre (ex.: um `<div role="button">`
  precisa de `aria-disabled`; o `ErrorState` usa `role="alert"`).

## Como servir e revisar

Duas formas. A canônica é o command:

```
/iniciar-prototipo            # detecta o hub (ou o consolidado mais recente)
```

Ele serve a **raiz** de `prototipos_html/` (não a pasta de uma task isolada), varre a
porta livre a partir da porta dedicada (`{{DEFAULT_PROTO_PORT}}`, default **8765**) —
se a preferida estiver ocupada por terceiro, o sweep sobe até a primeira livre e
reporta qual. Mata só o **próprio** server anterior (PID em `/tmp/proto-srv.pid`),
nunca processo de terceiro. Sobe em background (`run_in_background`), faz smoke
(`curl -sI` → 200) e, se existir `prototipos_html/index.html` com `PROTOS[]`, abre o
**hub**; senão, deep-link do consolidado único. Com Chrome MCP conectado, abre a URL.
Não suba o server sem background — ele morre junto com o comando.

Manualmente, se preferir:

```bash
cd prototipos_html
P=8765; while lsof -ti :$P >/dev/null 2>&1; do P=$((P+1)); done
python3 -m http.server $P
# abrir http://localhost:$P/ (hub) ou http://localhost:$P/<task-id>/ (consolidado)
```

## Aprovação canônica (o gate)

A aprovação é **por superfície**: cada consolidado aprovado libera o porte daquela
superfície — não há mais "uma aprovação por task" amarrando todas as telas juntas.
Antes de portar para o stack real, o checklist exige a régua de conformância **12/12**
(ver `docs/frontend/html-prototype-checklist.md`, §6): consolidado carrega via 1
`index.html`, ordem de load preservada, cada tela = 1 IIFE, `?v=` em toda tag local,
registry coerente, device-frame responsivo, tokens só na camada canônica, i18n
presente, console limpo, motor não-editado. E então o **gate humano**:

> O usuário precisa digitar literalmente `aprovado` (ou `/aprovar-plano`).

Regras absolutas:

- **Nada que você escreva como agente conta como aprovação.** Só a fala literal do
  humano libera o porte. Isso é o mesmo gate descrito em `01-controle-de-contexto.md`
  — o watchdog grava a aprovação amarrada ao `task_id`.
- **Nunca auto-grave a aprovação** contornando o hook (ex.: escrevendo o JSON de
  approval à mão, ou rodando o command em nome do usuário). O fluxo existe para
  impedir drift visual não-rastreado.
- Se o humano disser "só muda direto", **pare e peça a aprovação formal** — não pule.

Sem aprovação, a fase da task não vira `execucao` e o watchdog nega qualquer edição
fora de `controle/`/`prototipos_html/`.

## Skills e commands de apoio

- **`/nova-tela-fe`** — o roteiro mestre. Conduz as 3 fases: (1) protótipo HTML+JSX,
  (2) plano de implementação mapeando protótipo → stack real, (3) implementação +
  verificação. É o ponto de entrada de toda tela nova; delega a geração do consolidado
  a `criar-prototipo`/`incrementar-prototipo`.
- **`criar-prototipo`** (skill) — **default** para protótipo novo: nasce um consolidado
  multi-tela/multi-papel do zero (modelo cadillac), a partir de `templates/` + DS mínima.
- **`incrementar-prototipo`** (skill) — *crescer* um consolidado cadillac existente:
  funde uma tela/estado/papel via delta cirúrgico, sem reescrever o motor.
- **`html-prototype`** (skill) — **legado**, só para o protótipo single-showcase de
  tela única rápida; "superseded" por `criar-prototipo`.
- **`/iniciar-prototipo`** — serve a raiz de `prototipos_html/`, varre porta livre e
  abre o hub (ou deep-link do consolidado).
- **`/melhorar-prototipo`** — workflow guiado de iteração no consolidado ativo: captura
  escopo via `AskUserQuestion`, carrega skills de UI/UX em paralelo, e gera plano formal
  via `superpowers:writing-plans`. *Melhora* o que existe — para adicionar tela, use
  `incrementar-prototipo`/`criar-prototipo`. Nunca aplica mudança sem aprovação.

Detalhe de cada um em `05-skills-e-commands.md`.

## Galeria de exemplos vivos

O modelo cadillac nasceu maduro em protótipos reais de domínios bem diferentes — eles
comprovam que o motor é **agnóstico de domínio**. A galeria é só **ponteiro
conceitual**: nada dela é copiado para o kit.

- **split multi-papel + white-label** — um consolidado por papel sob um motor
  compartilhado, com a marca vindo de fonte única (`brandFor()`/variants) e um eixo
  semântico reservado opcional por tela.
- **cadillac-delivery** — `device-frame`/`registry` de origem (domínio food-delivery):
  onde nasceram o `DeviceFrame`/`ScaledDevice` e o registry+router do motor.
- **mesmo motor, domínio de saúde** — o mesmíssimo motor reaplicado a um app de
  paciente / painel profissional / PWA, sem tocar a engine.

O que **viaja embarcado** e é a fonte canônica de uso é o exemplo neutro em
`criar-prototipo/examples/minimal/` — a prova mínima de que o motor + uma DS enxuta
sobem limpos. Use-o como o "copie-me" de partida.

## Como adaptar

- **Identidade visual:** troque a tipografia no `<link>` do `index.html` e os tokens de
  marca (`--brand` e variantes) no `:root` + `[data-theme="dark"]`. Em white-label, a
  marca tem fonte única em `brandFor()` (`ds.jsx`); o shell lê dela. Tudo o mais herda.
- **Stack-alvo do porte:** o protótipo é stack-agnóstico de propósito. O destino real
  (Flutter+Riverpod, Next.js+Tailwind, etc.) é lido do `CLAUDE.md > Stack oficial`
  na fase 2 do `/nova-tela-fe`. **Não assuma stack** — leia o que o projeto declara.
- **Telas do domínio:** não adicione telas à mão — invoque `incrementar-prototipo`
  (crescer um consolidado) ou `criar-prototipo` (superfície nova). A tela vira uma IIFE
  em `screens.jsx`, registrada no `window.<DS>Screens`; o mock de domínio fica só em
  `data.jsx`/`i18n`. O motor (`engine.jsx`/`templates/`) permanece intacto.
- **Anti-padrões a evitar:** Tailwind ou frameworks pesados no protótipo; qualquer
  build step (vite/webpack — mata o zero-friction); lógica de negócio real (use mocks
  em `data.jsx`); editar o motor in-place; acoplar o protótipo ao stack final.

## Arquivos no kit

- `kit/.claude/skills/criar-prototipo/SKILL.md` — eixo NASCER (modelo cadillac, default).
- `kit/.claude/skills/criar-prototipo/templates/` — o motor cadillac (8 arquivos:
  app-shell, device-frame, registry, i18n-chrome, screen.iife, showcase, hub.index.html,
  consolidado.index.html).
- `kit/.claude/skills/criar-prototipo/examples/minimal/` — exemplo neutro embarcado (5
  arquivos: index.html, ds.jsx, engine.jsx, screens.jsx, app.jsx).
- `kit/.claude/skills/criar-prototipo/references/cadillac-model.md` — 4 camadas, ordem
  de load, fit-to-stage, galeria de origem.
- `kit/.claude/skills/incrementar-prototipo/SKILL.md` + `references/incremento-delta.md`
  — eixo CRESCER (delta-fusão cirúrgica).
- `kit/.claude/skills/html-prototype/SKILL.md` — a skill legada (single-showcase).
- `kit/prototipos_html/_template/` — template legado single-showcase (mantido p/ compat).
- `kit/docs/frontend/html-prototype-checklist.md` — o checklist canônico + a régua 12/12 (§6).
- `kit/docs/frontend/design-tokens.md` — mapa de tokens central (para o porte ao stack real).
- `kit/.claude/commands/{nova-tela-fe,iniciar-prototipo,melhorar-prototipo}.md` — os commands.

## Cross-referências

- `05-skills-e-commands.md` — `criar-prototipo`, `incrementar-prototipo`, `html-prototype`,
  `/nova-tela-fe` e os commands de protótipo em detalhe.
- `kit/.claude/skills/criar-prototipo/references/cadillac-model.md` — o motor cadillac
  (4 camadas, ordem de load, fit-to-stage) e a galeria de origem.
- `01-controle-de-contexto.md` — o gate de aprovação e o `fase_prototipo` que libera `prototipos_html/`.
