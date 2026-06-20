# Pilar 5 — Skills, commands e subagent

> Leitor: um agente de IA que vai instalar e operar este método num projeto novo.
> Este documento descreve as automações de comportamento do kit — as skills, os
> commands e o subagent — e as dependências externas que o método invoca mas não
> empacota. É o que transforma os pilares anteriores em rotinas disparáveis.

## Skill vs command vs subagent

Os três são mecanismos distintos do Claude Code, com gatilhos e escopos diferentes:

- **Skill** — uma capacidade com `description` que o agente carrega **por
  reconhecimento de gatilho**. O agente lê a `description` e decide invocar quando o
  contexto bate (ex.: "novo protótipo multi-tela" dispara `criar-prototipo`). Vive em
  `.claude/skills/<nome>/SKILL.md`. É conhecimento + procedimento que o agente puxa
  quando precisa.
- **Command** — um slash-command **invocado explicitamente** pelo humano (ou pelo
  agente quando instruído), `/nome`. Vive em `.claude/commands/<nome>.md`. É um
  roteiro fixo que dispara uma sequência conhecida. O humano escolhe o momento.
- **Subagent** — um agente **separado, com toolset próprio e contexto isolado**,
  que o agente principal delega para uma sub-tarefa. Vive em `.claude/agents/<nome>.md`.
  Roda em sua própria janela de contexto e devolve um relatório. É paralelismo e
  isolamento de contexto.

O kit usa: 5 skills (procedimentos recorrentes do método), 5 commands (pontos de
entrada manuais), 1 subagent (pesquisa read-only).

## As 5 SKILLS do kit

| Skill | Trigger (description) | O que faz |
|---|---|---|
| `criar-prototipo` | Protótipo HTML+JSX **novo** de uma ou mais telas/fluxos/papéis (modelo cadillac) — do zero | Nasce um consolidado multi-superfície a partir do motor cadillac (`templates/` + DS mínima); **default** para protótipo (ver `03-prototipo-frontend.md`) |
| `incrementar-prototipo` | **Crescer** um protótipo cadillac que já existe — fundir nova tela/estado/papel | Delta-fusão cirúrgica: registra a tela no registry, sobe o `?v=`, motor intacto |
| `html-prototype` | **Apenas** protótipo legado de tela única (single-showcase) rápido | Gera o protótipo single-showcase; "superseded" por `criar-prototipo` |
| `execute-closure` | Ao concluir a execução de uma task em `controle/` | Pipeline de fechamento (abaixo) |
| `mermaid-flow` | Precisa visualizar arquitetura, fluxo UX ou fluxo técnico | Gera diagramas `.mmd` (ver `04-sistema-de-documentacao.md`) |

As três skills de protótipo são **disambiguantes por gatilho**: `criar-prototipo` é o
default para qualquer protótipo novo (multi-tela/multi-papel/hub); `incrementar-prototipo`
é o caminho para *adicionar* tela a um consolidado existente; `html-prototype` cobre só
o nicho legado de tela única. As descriptions são escritas para rotear sem ambiguidade.

### execute-closure (em detalhe)

É **como uma task fecha corretamente** — o pipeline ordenado que transforma "código
escrito" em "task concluída e propagada". Passos (`execute-closure/SKILL.md`):

1. **Validar ACs com evidência.** Abrir `controle/<task-id>/LIMITES.md`; para cada
   Acceptance Criterion, validar manualmente (rodar comando, ler arquivo, inspecionar
   UI) e registrar a **evidência concreta** no `LEDGER.md` (comando | `path:linha` |
   screenshot). Se algum AC falha, **não fecha** — volta para `fase: execucao`.
2. **Atualizar LEDGER.md** com o bloco `## Verification`: cada AC ganha uma linha
   `AC#: passed — <evidência>`.
3. **Sincronizar roadmap** (se o slug tem padrão `T##.NN`): o hook de sync propaga o
   status `done` ao índice e ao épico; sem hook, atualiza-se à mão. Verificar que
   `docs/roadmap/E##/T##.NN-*.md` está `status: done` e o épico tem `[x]`.
4. **Verificar os caps** dos arquivos de controle (LIMITES ≤80, PLANO ≤120, ESTADO
   ≤60, LEDGER ≤150). Se estourou, compactar antes de fechar (movendo decisão para
   ADR, nunca deletando).
5. **Transicionar `ESTADO.md` para `fase: concluida`**.
6. **Reportar ao usuário** um bloco `# Resumo do fechamento` (o quê foi entregue,
   evidências, links de PR/commit, riscos remanescentes).
7. **(opcional · anti-drift) Refletir na vitrine** — só para frontend e se o projeto
   mantém vitrine consolidada: mergear a tela no protótipo consolidado da superfície,
   bump `?v=` (cache-bust), redeploy, conferir live.
8. **(opcional · anti-drift) Regenerar o painel** — atualizar `painel-data.json`,
   rodar `node scripts/gen-painel.mjs`, commitar o HTML derivado.

Anti-padrões: fechar AC sem evidência concreta; compactar o LEDGER apagando decisões
importantes; fechar sem rodar lint/testes.

## Os 5 COMMANDS do kit

| Command | Dispara |
|---|---|
| `/aprovar-plano` | Registra a aprovação canônica do plano da task ativa; o watchdog grava o approval e a fase pode ir para `execucao`. É a frase exact-match que libera o gate (ver `01-controle-de-contexto.md`). |
| `/no-control` | Executa a solicitação do turno **sem** criar/atualizar `controle/` — bypass do watchdog válido só no turno atual. Mantém segurança, deny-list, não-logar e proteção contra destrutivo. |
| `/nova-tela-fe` | Roteiro mestre de frontend: abre a task de controle, conduz a fase de protótipo HTML+JSX, depois o plano de porte ao stack real, depois a implementação + verificação. Ponto de entrada de toda tela nova. |
| `/iniciar-prototipo` | Serve a **raiz** de `prototipos_html/`, varre a **porta livre** a partir de `{{DEFAULT_PROTO_PORT}}` (default 8765; sweep p/ cima se ocupada), mata só o próprio server anterior, sobe em background, faz smoke (`curl` → 200) e abre o **hub** (ou deep-link do consolidado) no Chrome MCP se disponível. |
| `/melhorar-prototipo` | Workflow guiado de iteração no consolidado ativo: `AskUserQuestion` para escopo, carrega skills de UI/UX em paralelo, gera plano formal via `superpowers:writing-plans`. **cadillac-aware**: *melhora* o que já existe — para **adicionar tela** use `incrementar-prototipo`/`criar-prototipo`. Nunca aplica mudança sem aprovação. |

Nota sobre `/aprovar-plano`: o arquivo do command contém literalmente a palavra
`aprovado` mais a instrução de atualizar `ESTADO.md` para `fase: execucao` e
registrar no LEDGER. É o gancho humano do gate — o agente nunca o dispara em nome
do usuário (seria contornar o guardrail).

## O subagent: researcher

`researcher` (`.claude/agents/researcher.md`) é um subagent **read-only** com toolset
restrito: `Read, Grep, Glob, Bash, WebFetch`. Roda no modelo `sonnet`. Por definição
nunca edita — levanta evidências e devolve um relatório.

Quando o agente principal deve delegar a ele:

- Pergunta ampla de código: "onde a lógica de X mora?", "quem usa Y?".
- Auditoria de consistência entre N arquivos.
- Levantar exemplos de uso de uma API/padrão; caçar TODOs/FIXMEs; comparar módulos
  similares.

Quando **não** usar (preferir tools diretas): lookup de um símbolo já conhecido (Grep
direto), leitura de um arquivo em caminho conhecido (Read direto), qualquer edição.

A heurística interna do researcher: Glob para mapear → Grep para localizar → Read
seletivo nos hits → relatório markdown (Sumário / Hits com `path:linha` / Padrões /
Lacunas / Próximas perguntas). Limites: nunca propõe design nem decide prioridades
(isso é do agente principal); se passar de 50 hits, para e pede refinamento. O valor
de delegar é **isolar contexto** — uma varredura ampla não polui a janela do agente
principal.

## Dependências EXTERNAS (referenciadas, não empacotadas)

O método **invoca** skills que **não fazem parte do kit** — são plugins/skills globais
que precisam estar instaladas no ambiente. O kit apenas as referencia pelo nome; se
não estiverem instaladas, o passo correspondente simplesmente não dispara. As que o
método cita:

- **`grill-with-docs`** (ou `grill-me`) — sessão de grilling que desafia o plano
  contra o modelo de domínio, afia terminologia e atualiza CONTEXT.md/ADRs inline.
  Gatilho: início de projeto e antes de registrar qualquer decisão de design.
- **`superpowers:writing-plans`** — gera o plano detalhado para features com ≥2
  arquivos. É o que `/melhorar-prototipo` invoca no passo final.
- **`superpowers:brainstorming`** — exploração de intenção/requisitos antes de criar
  uma feature.
- **Skills de design** — consultivas, carregadas em paralelo por `/melhorar-prototipo`
  conforme o escopo: `ui-ux-pro-max` (design system, padrões de UX), `design-critique`
  (feedback estruturado), `design-audit` (auditoria visual sistemática),
  `emil-design-eng` (polimento e micro-interações), `ui-typography` (regras
  tipográficas — em enforcement mode quando há texto visível).

Regra para o instalador: estas são opcionais e externas. O kit funciona sem elas
(os passos que dependem delas degradam para "feito à mão"), mas o método pleno
assume que estão disponíveis no ambiente. Não tente empacotá-las no kit — instale-as
no ambiente do agente.

## A filosofia de gatilhos

O que amarra **quando** cada skill é usada não é decisão ad-hoc do agente — é a seção
**"Skills obrigatórias por gatilho"** no `CLAUDE.md` do projeto. Ela mapeia situação →
skill obrigatória:

- Início de projeto / novo ADR → `grill-with-docs` (antes de registrar a decisão).
- Feature com ≥2 arquivos → `superpowers:writing-plans` (plano detalhado).
- Nova tela/fluxo de frontend → `/nova-tela-fe`.
- Brainstorming antes de criar feature → `superpowers:brainstorming`.

Isso torna a invocação **determinística por contexto** em vez de depender da memória
do agente. O `CLAUDE.md` é sempre-on (carregado em toda sessão), então o gatilho está
sempre presente. Para disparo ainda mais rígido (não-burlável), um gatilho pode virar
um hook (ver `02-hooks-de-validacao.md`) — a seção do `CLAUDE.md` é o nudge macio; o
hook é o gate duro.

## Como adaptar

- **Registrar uma skill nova:** crie `.claude/skills/<nome>/SKILL.md` com frontmatter
  `name` + `description` (a `description` é o gatilho — escreva-a para casar com as
  situações reais de uso) e o corpo com "quando invocar / passos / anti-padrões",
  seguindo o padrão das 3 existentes.
- **Registrar um command novo:** crie `.claude/commands/<nome>.md` com frontmatter
  `description` e o corpo como roteiro numerado. Use `$ARGUMENTS` para argumento livre
  (ver `/iniciar-prototipo` e `/melhorar-prototipo`).
- **Registrar um subagent novo:** crie `.claude/agents/<nome>.md` com `name`,
  `description`, `tools` (restrinja ao mínimo — read-only quando for pesquisa) e
  `model`.
- **Amarrar o gatilho:** adicione a entrada na seção "Skills obrigatórias por gatilho"
  do `CLAUDE.md`. Sem isso, a skill existe mas o agente não sabe quando usá-la.
- **Dependências externas:** liste-as no `CLAUDE.md` como o kit faz, deixando claro
  que são do ambiente. Não as copie para dentro do kit.

## Arquivos no kit

- `kit/.claude/skills/criar-prototipo/` — eixo NASCER (modelo cadillac): `SKILL.md` +
  `templates/` (motor) + `examples/minimal/` (exemplo neutro) + `references/cadillac-model.md`.
- `kit/.claude/skills/incrementar-prototipo/` — eixo CRESCER: `SKILL.md` +
  `references/incremento-delta.md`.
- `kit/.claude/skills/html-prototype/SKILL.md` — geração de protótipo legado (single-showcase).
- `kit/.claude/skills/execute-closure/SKILL.md` — pipeline de fechamento.
- `kit/.claude/skills/mermaid-flow/SKILL.md` — diagramas de fluxo.
- `kit/.claude/commands/{aprovar-plano,no-control,nova-tela-fe,iniciar-prototipo,melhorar-prototipo}.md` — os 5 commands.
- `kit/.claude/agents/researcher.md` — o subagent read-only.
- `kit/CLAUDE.md` — a seção "Skills obrigatórias por gatilho" (a filosofia de disparo).

## Cross-referências

- `01-controle-de-contexto.md` — o gate que `/aprovar-plano` e `/no-control` operam.
- `03-prototipo-frontend.md` — `criar-prototipo`, `incrementar-prototipo`, `html-prototype`,
  `/nova-tela-fe`, `/iniciar-prototipo`, `/melhorar-prototipo` em contexto de frontend.
- `INSTALL.md` — instalação do kit e das dependências externas no ambiente.
