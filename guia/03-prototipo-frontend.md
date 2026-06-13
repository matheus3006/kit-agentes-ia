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

## Estrutura de arquivos mínima

Todo protótipo vive em `prototipos_html/<task-id>/` e tem esta forma:

```
prototipos_html/<task-id>/
├── index.html                  # Orquestrador: React 18 + Babel via CDN, tokens, showcase shell
└── components/
    ├── i18n.jsx                # TRANSLATIONS centralizadas + nada hard-coded
    ├── data.jsx                # Mocks (NUNCA PII ou dados reais)
    ├── icons.jsx               # SVG inline, sem dependência externa
    ├── ui.jsx                  # Primitivos (Press, Button, Card, Field, Skeleton, Empty/Error)
    ├── <dominio>.jsx           # Uma ou mais telas do domínio (ex.: checkout.jsx, board.jsx)
    └── app.jsx                 # Shell + Showcase wrapper (tabs de estado, switchers, ErrorBoundary)
```

A ordem importa: no `index.html`, os `<script type="text/babel">` carregam nesta
sequência (i18n → data → icons → ui → domínio → app), porque cada um depende dos
anteriores em escopo global (sem módulos ES, tudo no mesmo namespace de browser).

**Como começar.** Copie o template de uma vez:

```bash
cp -r prototipos_html/_template prototipos_html/<task-id>
```

O `_template/` já traz os 5 componentes, o `index.html` completo com tokens, e um
`DemoScreen` que demonstra os 8 estados. Você adapta, não cria do zero.

## O index.html (orquestrador)

É o único HTML do protótipo. Responsabilidades, na ordem em que aparecem no arquivo:

1. **`<html lang="pt-BR" data-theme="light">`** — o atributo `data-theme` no
   elemento raiz é o gancho do switcher de tema. O Showcase troca `light`/`dark`
   chamando `document.documentElement.setAttribute('data-theme', theme)`.
2. **Fontes via Google Fonts** — `<link>` com preconnect. No template: `Plus Jakarta
   Sans` (display) + `JetBrains Mono` (mono). Trocar aqui é onde a identidade começa.
3. **Bloco `<style>` com os tokens** — `:root` define o tema light; `[data-theme="dark"]`
   sobrescreve. Mais a "showcase chrome" (header sticky, tabs, switchers). Detalhe na
   próxima seção.
4. **CDNs no fim do `<body>`** — nesta ordem fixa:
   ```html
   <script src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
   <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
   <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"></script>
   ```
   Use os builds `development` do React: stack traces e warnings claros valem mais
   que tamanho num protótipo.
5. **Os componentes como `type="text/babel"`** — Babel transpila JSX no browser em
   runtime. Cada `<script type="text/babel" src="components/X.jsx">` na ordem de
   dependência.
6. **O mount** — um último bloco inline:
   ```html
   <script type="text/babel">
     const root = ReactDOM.createRoot(document.getElementById('root'));
     root.render(<Showcase/>);
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

## O Showcase

`app.jsx` exporta o componente `Showcase` — o chrome de revisão que embrulha as
telas. Componentes:

- **Header sticky** com brand + as tabs de estado/persona + os switchers (alinhados
  à direita via `margin-left:auto`).
- **Tabs** — uma por estado visual (no template: os 8 estados) e/ou uma por
  persona/role/feature quando o protótipo cobre várias telas.
- **Switchers** — grupos de botões para alternar **tema** (light/dark), **plataforma**
  (iOS/Android/Web, quando aplicável) e **idioma** (quando multilíngue). O switcher
  de tema escreve `data-theme` na raiz; os demais passam props às telas.
- **ErrorBoundary por tab** (`TabErrorBoundary`, classe React) — uma tela que quebra
  mostra o stack inline naquela aba e **não derruba o showcase inteiro**. Ela reseta
  o erro ao trocar de aba (`componentDidUpdate`).
- **Opcionais:** um `DeviceFrame` (moldura de telefone para telas mobile) e um modo
  "All Screens" — grade scrollável com todas as telas e zoom controls, para revisão
  panorâmica.

Estrutura do `Showcase`: estado local para `lang`/`theme`/`state`, um `useEffect`
que aplica o tema na raiz, e o `<main>` renderizando `<TabErrorBoundary><Tela .../></TabErrorBoundary>`.

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
/iniciar-prototipo            # detecta a task mais recente em prototipos_html/
```

Ele mata qualquer server velho na porta dedicada **8765**, sobe um novo em background
(`python3 -m http.server 8765`, com `run_in_background`), faz smoke (`curl -sI` → 200)
e, se o Chrome MCP estiver conectado, abre a URL. A porta 8765 é dedicada para não
colidir com outros projetos (8000 colide muito). Não suba o server sem background —
ele morre junto com o comando.

Manualmente, se preferir:

```bash
cd prototipos_html/<task-id>
python3 -m http.server 8765
# abrir http://localhost:8765 no Chrome
```

## Aprovação canônica (o gate)

Antes de portar para o stack real, o checklist exige: showcase sem erros no console,
todas as personas/views cobertas, os 8 estados marcados, tokens centralizados. E
então o **gate humano**:

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
  verificação. É o ponto de entrada de toda tela nova.
- **`html-prototype`** (skill) — encapsula o padrão (estrutura, princípios de design,
  anti-padrões). Dispara em "protótipo / mockup / tela / showcase".
- **`/iniciar-prototipo`** — sobe o server local (porta 8765) e abre no browser.
- **`/melhorar-prototipo`** — workflow guiado de iteração: captura escopo via
  `AskUserQuestion`, carrega skills de UI/UX em paralelo, e gera plano formal via
  `superpowers:writing-plans`. Nunca aplica mudança sem aprovação.

Detalhe de cada um em `05-skills-e-commands.md`.

## Como adaptar

- **Identidade visual:** troque as fontes no `<link>` do `index.html` e os tokens de
  marca (`--primary`, `--accent` e variantes) no `:root` + `[data-theme="dark"]`.
  Tudo o mais herda.
- **Stack-alvo do porte:** o protótipo é stack-agnóstico de propósito. O destino real
  (Flutter+Riverpod, Next.js+Tailwind, etc.) é lido do `CLAUDE.md > Stack oficial`
  na fase 2 do `/nova-tela-fe`. **Não assuma stack** — leia o que o projeto declara.
- **Telas do domínio:** adicione `components/<dominio>.jsx`, referencie-o no
  `index.html` (na ordem certa de scripts) e adicione a tab/view no `app.jsx`.
- **Anti-padrões a evitar:** Tailwind ou frameworks pesados no protótipo; qualquer
  build step (vite/webpack — mata o zero-friction); lógica de negócio real (use mocks
  em `data.jsx`); acoplar o protótipo ao stack final (perde a iteração rápida).

## Arquivos no kit

- `kit/prototipos_html/_template/index.html` — orquestrador completo com tokens.
- `kit/prototipos_html/_template/components/{i18n,data,icons,ui,app}.jsx` — os 5 componentes-base.
- `kit/prototipos_html/_template/README.md` — guia de uso do template.
- `kit/docs/frontend/html-prototype-checklist.md` — o checklist canônico (estados, tokens, gate).
- `kit/docs/frontend/design-tokens.md` — mapa de tokens central (para o porte ao stack real).
- `kit/.claude/skills/html-prototype/SKILL.md` — a skill.
- `kit/.claude/commands/{nova-tela-fe,iniciar-prototipo,melhorar-prototipo}.md` — os commands.

## Cross-referências

- `05-skills-e-commands.md` — `/nova-tela-fe`, `html-prototype` e os commands de protótipo em detalhe.
- `01-controle-de-contexto.md` — o gate de aprovação e o `fase_prototipo` que libera `prototipos_html/`.
