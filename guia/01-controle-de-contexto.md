# Pilar 1 — Protocolo de Controle de Contexto

> Leitor: um agente de IA que vai instalar e operar este método num projeto novo.
> Este documento descreve o GATE que governa toda edição de produção. Antes de
> editar qualquer arquivo fora de `controle/`, você precisa entender e satisfazer
> o que está aqui. Não é convenção — é imposto por hook.

## O problema que isto resolve

Um agente de IA tem duas falhas estruturais quando opera num repositório real:

1. **Amnésia entre sessões.** O `session_id` rotaciona entre turnos. O que você
   decidiu, planejou e aprovou num turno some no turno seguinte se for guardado
   por sessão. O resultado é retrabalho e decisões reabertas.
2. **Deriva de escopo.** Sem uma âncora forte, o agente edita "só mais esse
   arquivo", refatora de passagem, toca coisas fora do que foi combinado. A
   correção fica enterrada num diff gigante e o humano perde o controle.

O protocolo ataca os dois com um **gate determinístico** no `PreToolUse`: o hook
`.claude/hooks/context-control-watchdog.py` NEGA a edição quando as condições não
estão satisfeitas. Não há boa-vontade envolvida — o `Edit`/`Write`/`MultiEdit`
simplesmente não acontece. Ver `02-hooks-de-validacao.md` para como o hook se
pluga nos eventos.

## A regra central

> Nenhuma edição de produção (qualquer arquivo fora de `controle/`) sem uma task
> **ativa, planejada e aprovada**.

Edições dentro de `controle/` são sempre livres — é onde você escreve o plano e o
diário. Edições em `prototipos_html/` seguem um gate de fase próprio (ver abaixo).
Todo o resto do repositório está trancado até a task estar em `fase: execucao`
com aprovação válida.

## Como declarar uma task

No início da conversa, escreva exatamente:

```
nova tarefa: <slug> - <descrição breve>
```

O watchdog faz match com a regex `nova tarefa:\s*([slug])\s*-\s*(.+)` e deriva:

```
task_id = AAAA-MM-DD-<slug-normalizado>
```

O slug é normalizado para `kebab-case` (`normalize_slug`: minúsculas, não-alfanum
vira `-`, colapsa repetições). Se já existe uma task com o mesmo id daquele dia e
ela está `concluida`, o hook escolhe o próximo sufixo livre (`-2`, `-3`, …) via
`choose_task_id`. O id derivado vira a "task ativa" gravada em estado.

Você então cria `controle/<task-id>/` com os 4 arquivos obrigatórios.

## Os 4 arquivos obrigatórios (e seus CAPS)

Cada arquivo tem um papel e um limite de linhas imposto pelo hook (`CAPS` no
código; estourar o cap bloqueia a edição com "Compact controle files first."):

| Arquivo | Cap | Papel |
|---|---|---|
| `LIMITES.md` | ≤80 | Escopo IN/OUT + Acceptance Criteria **verificáveis** + invariantes que não podem ser violadas. É o contrato da task. |
| `PLANO.html` | ≤120 | O QUÊ / POR QUÊ / COMO / RISCOS, legível pelo humano (HTML com barra de leitura Sépia/Claro/Escuro + A−/A+). É o que o stakeholder aprova. |
| `ESTADO.md` | ≤60 | Frontmatter com `fase:` — a máquina de estados que o hook lê. É a fonte de verdade do ciclo de vida. |
| `LEDGER.md` | ≤150 | Decisões + evidência de cada AC + (opcional) calibração de tempo. É o diário append-only da task. |

Os caps forçam concisão: o controle é um sumário operável, não documentação
extensa. Templates limpos em `controle/_TEMPLATE/` — copie-os ao criar a task.

## O ciclo de 7 fases

A fase vive no frontmatter de `ESTADO.md` (`fase: <valor>`) e é avançada
**manualmente por você** editando esse arquivo. O watchdog lê o valor para decidir
o gate. As fases válidas (`VALID_PHASES` no código):

```
limites → planejamento → aprovacao → [GATE HUMANO] → execucao → verificacao → concluida
```

1. **`limites`** — escreva `LIMITES.md`: escopo, fora-de-escopo, ACs, invariantes.
2. **`planejamento`** — escreva `PLANO.html` com as 4 seções.
3. **`aprovacao`** — apresente o plano ao usuário (via `AskUserQuestion`) e pare.
4. **[gate humano]** — o usuário digita uma frase de aprovação **exact-match**:
   `aprovado` | `aprovar` | `pode executar` | `/aprovar-plano` (`APPROVAL_PHRASES`).
   O hook grava `approval-<key>.json` amarrado ao `task_id` ativo. **Nada que você
   escreva como agente conta como aprovação** — só a fala literal do humano.
5. **`execucao`** — edições no repositório liberadas (sob a cadência por-edit).
6. **`verificacao`** — preencha as evidências de cada AC no `LEDGER.md`.
7. **`concluida`** — feche (via skill `execute-closure`). A partir
   daqui o gate se fecha de novo para essa task.

Enquanto a fase for diferente de `execucao`, qualquer edição externa é negada com
"Plano ainda nao aprovado." Em `execucao` sem aprovação registrada, é negada com
"Execucao sem aprovacao valida."

## A cadência por-edit (a invariante anti-amnésia mais poderosa)

Esta é a peça central contra a deriva. Após CADA edição de produção, o
`PostToolUse` do watchdog marca `pending_update: true` em `edit-<key>.json` e
**bloqueia a próxima edição externa** até que **ambos** `ESTADO.md` E `LEDGER.md`
tenham `mtime` mais recente que o último edit (`pending_update` / `block` com
"Update ESTADO.md + LEDGER first.").

Em outras palavras: **o diário nunca pode ficar atrás do código.** Você edita um
arquivo de produção → é obrigado a registrar o que fez e em que estado está →
só então pode editar o próximo. Isso transforma o `LEDGER.md` num log fiel em
tempo real e impede que você acumule 12 edições silenciosas antes de "lembrar" de
documentar. Cada passo é forçadamente reconciliado com o plano. É barato de
satisfazer (duas edições em `controle/`, que são livres) e caro de burlar — exatamente
o incentivo certo.

`clear_pending_if_satisfied` zera a flag assim que os dois mtimes passam o último
edit; depois disso a próxima edição externa é liberada.

## Detalhes não-óbvios do enforcement (com o código)

- **Estado keyado por SHA1 do project-root, NÃO por `session_id`** (`state_key`):
  `hashlib.sha1(str(project_root).encode()).hexdigest()[:16]`. O comentário no
  código documenta o bug que motivou isso — guardar por `session_id` fazia o
  `active`/`approval` de um turno sumir no turno seguinte (o famoso
  `approval-without-active`). Keyar por raiz deixa o estado **estável entre turnos**
  e **isola worktrees concorrentes**: cada checkout tem seu próprio arquivo de
  estado, então duas tasks paralelas em worktrees diferentes não se atropelam.
- **Fallback que deriva a task ativa do `ESTADO.md`** (`derive_active_task_id`):
  se o arquivo `active-<key>.json` sumir (rotação de sessão, limpeza no
  `SessionEnd`), o hook varre `controle/*/ESTADO.md`, ignora as `concluida`, e
  escolhe a NÃO-concluída com `mtime` mais recente — **desde que tocada nas
  últimas 24h**. O TTL é deliberado: uma task não-concluída parada há semanas é
  ESQUECIDA, não "ativa" (senão uma task trivial velha reabriria o gate sozinha).
  O ciclo real toca `ESTADO.md` a cada edit, então uma task em andamento sempre
  tem mtime fresco. A fonte de verdade do que está ativo é o próprio `controle/`,
  não um cache.
- **`controle/` e `prototipos_html/` são livres** (`is_control_path`,
  `is_prototype_path`): editar o plano/diário nunca é bloqueado. Protótipos seguem
  um gate de fase separado (`fase_prototipo` em `componentes`/`showcase`/`estados`/
  `revisao`), liberado nas fases iniciais da task — o fluxo HTML+JSX acontece antes
  da aprovação do código de produção.
- **`SessionEnd` preserva `active`+`approval` enquanto a task não está `concluida`**
  (`handle_session_end`): só limpa o que é turn-scoped (`bypass`, `edit_state`). O
  GC real é o cleanup de 24h. Isso é o que faz a aprovação sobreviver à rotação de
  turno.

## O caminho trivial (pular a aprovação)

Para mudanças pequenas e óbvias, declare no frontmatter de `ESTADO.md`:

```
tipo: trivial
```

e registre **literalmente** no `LEDGER.md` a string:

```
Auto-aprovado por triviabilidade
```

`has_trivial_autoapproval` faz `grep` por essa string exata e dispensa a frase de
aprovação humana. Use com parcimônia — o caminho trivial existe para correções de
typo, ajuste de constante, renomeação local; não para qualquer coisa que toque a
lógica de domínio ou as invariantes do projeto.

## Bypass (escape hatches)

- **`/no-control`** — primeira coisa no prompt do turno. Grava `no-control-<key>.json`,
  válido **somente para o turno atual** (deletado no próximo `UserPromptSubmit` e
  no `SessionEnd`). Use para uma intervenção pontual fora do protocolo.
- **`CONTEXT_CONTROL=off`** (env var, nome em `KILL_SWITCH_ENV`) — desliga o
  watchdog **por completo** enquanto setada. Útil em CI ou ao depurar o próprio
  hook. Em produção, deixe ligada.

## Robustez

Toda exceção dentro do hook resulta em `exit 0` (allow). O gate **nunca quebra o
fluxo do agente** por um bug próprio — um `ESTADO.md` malformado, um JSON de estado
corrompido, um filesystem read-only degradam para "permitir", não para "travar a
sessão". A filosofia: o controle é um guardrail, não um ponto único de falha. (Ver
`02-hooks-de-validacao.md` — todos os hooks seguem esse padrão.)

## Como adaptar

Toda a configuração por-projeto está no bloco `CONFIG` no topo de
`context-control-watchdog.py` (linhas ~20-33): `STATE_NAMESPACE`, `KILL_SWITCH_ENV`,
`CONTROL_DIR`, `PROTOTYPE_DIR`, `PROTOTYPE_CHECKLIST`. O resto do código é agnóstico
de projeto. As frases de aprovação (`APPROVAL_PHRASES`) e os caps (`CAPS`) também são
constantes editáveis logo abaixo. Para o passo-a-passo de instalação e os pontos de
adaptação de cada hook, ver `ADAPTACAO.md` e `INSTALL.md`.

## Arquivos no kit

- `kit/AGENTS.md` — o protocolo em si, em forma de instrução curta sempre-on.
- `kit/.claude/hooks/context-control-watchdog.py` — o gate (este pilar).
- `kit/.claude/settings.json` — wiring do hook nos eventos `UserPromptSubmit`,
  `PreToolUse`, `PostToolUse`, `SessionEnd`.
- `kit/controle/_TEMPLATE/{LIMITES.md,PLANO.html,ESTADO.md,LEDGER.md}` — os 4 templates.
- `kit/controle/README.md` — convenção de `task-id` e fluxo resumido.

## Cross-referências

- `02-hooks-de-validacao.md` — o conjunto completo de hooks e como se plugam.
- `INSTALL.md` — instalação e auto-verificação via testes.
- `ADAPTACAO.md` — os blocos `CONFIG` a editar por projeto.
