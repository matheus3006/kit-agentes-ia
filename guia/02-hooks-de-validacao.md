# Pilar 2 — Hooks de validação

> Leitor: um agente de IA instalando e operando este método. Este documento
> cataloga TODOS os hooks do kit, o que cada um faz, o que exige ou bloqueia, e
> como adaptá-los. O gate de controle de contexto (o mais importante) tem detalhe
> completo em `01-controle-de-contexto.md`; aqui ele aparece resumido junto dos
> demais.

## O conceito

Hooks são scripts **Python puro (stdlib, zero dependências)** que o Claude Code
executa em eventos do ciclo de vida da sessão. Eles são plugados via
`.claude/settings.json` no formato:

```json
"PostToolUse": [
  {
    "matcher": "Edit|Write|MultiEdit",
    "hooks": [
      { "type": "command",
        "command": "python3 \"$CLAUDE_PROJECT_DIR/.claude/hooks/<hook>.py\"" }
    ]
  }
]
```

- O **evento** (`UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `SessionEnd`, …)
  é a chave do objeto `hooks`.
- O **matcher** é uma regex contra o nome da ferramenta; o hook só roda quando bate.
- O **command** recebe o payload do evento em `stdin` (JSON) e responde em `stdout`.
- **`$CLAUDE_PROJECT_DIR`** é expandida para a raiz do projeto — sempre referencie
  os hooks por esse prefixo para que o wiring seja portável.

O hook decide o resultado pelo que imprime: um `permissionDecision: "deny"`
(PreToolUse) nega a chamada; um `decision: "block"` (PostToolUse) força refazer; um
`additionalContext` injeta texto no contexto do agente sem bloquear nada; e silêncio
(`exit 0` sem output) deixa passar.

## Tabela dos hooks do kit

Classificados por papel. Todos vivem em `kit/.claude/hooks/` e estão religados em
`kit/.claude/settings.json`.

| Hook | Classe | Evento · matcher | O que faz |
|---|---|---|---|
| `context-control-watchdog.py` | **GUARDRAIL** (pode NEGAR) | `UserPromptSubmit`; `PreToolUse`/`PostToolUse`/`SessionEnd` · `Edit\|Write\|MultiEdit` | Impõe o protocolo de controle de contexto. Único hook que bloqueia edição. |
| `roadmap-task-status-sync.py` | **AUTOMAÇÃO** (escreve no repo) | `PostToolUse` · `Edit\|Write\|MultiEdit` | Propaga a fase da task para o roadmap (status + checkbox). |
| `delegation-audit.py` | **TELEMETRIA** (só loga) | `PostToolUse` · `Read\|Grep\|Glob\|Edit\|Write\|MultiEdit\|Agent\|Bash` | Detecta cadeias longas de exploração/edição e loga sugestão de delegar. |
| `plan-summary-enforcer.py` | **LEMBRETE** (advisory) | `PostToolUse` · `ExitPlanMode` | Exige o bloco "# Resumo do plano" com 4 seções. |
| `vitrine-sync-reminder.py` | **LEMBRETE** (advisory) | `PostToolUse` · `Edit\|Write\|MultiEdit` | No closure de task de frontend, lembra de refletir a tela na vitrine. |
| `painel-sync-reminder.py` | **LEMBRETE** (advisory) | `PostToolUse` · `Edit\|Write\|MultiEdit` | No closure de qualquer task, lembra de regenerar o painel do roadmap. |

### context-control-watchdog (GUARDRAIL)

O gate central. Em `PreToolUse`, nega qualquer `Edit`/`Write`/`MultiEdit` fora de
`controle/` quando não há task ativa + plano aprovado + fase `execucao` + a cadência
`ESTADO.md`+`LEDGER.md` satisfeita. Em `PostToolUse`, marca `pending_update` após
cada edit de produção (a invariante anti-amnésia). Em `UserPromptSubmit`, interpreta
`nova tarefa: …`, as frases de aprovação e `/no-control`. Estado keyado por SHA1 do
project-root (sobrevive a rotação de `session_id`, isola worktrees). Detalhe completo
em `01-controle-de-contexto.md`.

### plan-summary-enforcer (LEMBRETE)

Engata em `PostToolUse` quando o `tool_name` é `ExitPlanMode`. Não bloqueia — injeta
um `additionalContext` exigindo que você entregue, antes de executar (ou ao fim do
turno), um bloco final em PT-BR **# Resumo do plano** com 4 seções obrigatórias:

1. **O QUÊ** — entrega final em 2-4 bullets.
2. **POR QUÊ** — motivação humana e constraints (hipótese de risco, ADR, invariante).
3. **COMO** — sequência de execução em passos numerados, citando arquivos.
4. **RISCOS** — riscos concretos com impacto + mitigação; se não houver, escreva
   "nenhum identificado" — nunca omita a seção.

Também faz append de uma linha em `plan-summaries.jsonl` (telemetria de quando você
saiu do plan mode).

### roadmap-task-status-sync (AUTOMAÇÃO)

Engata em `PostToolUse` (edits). Só age quando o arquivo editado bate
`controle/<task-id>/ESTADO.md` E o `task-id` contém um rótulo de task de roadmap
`T##.NN` (regex `t(\d{2})[.\-](\d{2})`). Lê a `fase` do frontmatter e propaga:

- `fase: concluida` → escreve `status: done` no frontmatter de
  `docs/roadmap/E##/T##.NN-*.md` **e** marca o checkbox `[x]` no índice do épico
  `docs/roadmap/E##-*.md`.
- qualquer fase ativa (`limites`…`verificacao`) → escreve `status: in_progress`
  (sem mexer no checkbox).

Idempotente: se o status alvo já é o atual, sai sem escrever. É o que mantém o
roadmap em sincronia com o estado real das tasks sem você editar dois lugares.

### delegation-audit (TELEMETRIA)

Engata em `PostToolUse` para um conjunto amplo de ferramentas. Mantém estado por
sessão e detecta dois padrões:

- **`explore_chain`** — `Read`/`Grep`/`Glob` ≥ 5 em sequência sem um `Agent`/`Bash`
  no meio. Sugere `Agent({subagent_type:'Explore'})` — exploração ampla cabe num
  subagent read-only mais barato.
- **`edit_distinct`** — `Edit` em ≥ 3 arquivos distintos sem reset. Sugere delegar
  os edits mecânicos a um `Agent({model:'sonnet'})` com brief curto.

`Agent`/`Bash` zeram os contadores (são o "reset"). **Só loga** em
`delegation-log.jsonl` — nunca bloqueia, nunca injeta contexto. É um sinal para
revisão de custo/padrão de trabalho, não um guardrail.

### vitrine-sync-reminder + painel-sync-reminder (LEMBRETES de closure)

Ambos engatam em `PostToolUse` (edits) e só disparam quando o arquivo é
`controle/<task-id>/ESTADO.md` **com `fase: concluida`** — ou seja, no momento do
fechamento. Ambos são **anti auto-nag**: leem `ESTADO.md` + `LEDGER.md` e, se já há
evidência de que a ação foi feita, ficam em silêncio.

- **`painel-sync-reminder`** (toda task): se `ESTADO`/`LEDGER` não citam
  `gen-painel` / `painel.html` / `painel-data.json`, lembra de atualizar
  `docs/roadmap/painel-data.json` e rodar `node scripts/gen-painel.mjs` para
  regenerar `docs/roadmap/PAINEL.html` (derivado do JSON, anti-drift — nunca editar
  o HTML à mão).
- **`vitrine-sync-reminder`** (só frontend): detecta a superfície da task por
  marcadores em `ESTADO`/`LEDGER` (config `SURFACES`). Se a tela aprovada não foi
  refletida no protótipo consolidado daquela superfície, lembra de fazer o merge no
  consolidado + bump `?v=` em todas as tags + redeploy git. Uma superfície cujo
  consolidado já é citado conta como sincronizada e fica fora do lembrete. Marcador
  FE genérico sem superfície identificável lista todos os consolidados (e silencia
  se qualquer um já for citado).

## A deny-list de segredos (em `settings.json`)

Independente dos hooks, `settings.json` traz uma deny-list de leitura genérica e
orientada a LGPD/segredos. Os globs negam `Read` sobre:

```
.env, .env.production, .env.staging, .env.development, .env.test
**/.env*  (mesmas variantes recursivas)
**/secrets/**
**/*secret*  ·  **/*credentials*  ·  **/*token*
**/*.pem  ·  **/*.key  ·  **/*.p12  ·  **/*.pfx
**/id_rsa*  ·  **/id_ed25519*
```

e pede confirmação (`ask`) para `.env.local` / `**/.env.local`. Isso impede que
você leia (e portanto logue/exponha) credenciais e dados sensíveis — uma barreira
de plataforma, não dependente de um hook estar correto.

## Os testes (a auto-verificação do kit)

O kit acompanha testes Python que provam o comportamento dos hooks. Rodá-los É a
auto-verificação da instalação (ver `INSTALL.md`):

- **`test_context_control_watchdog.py`** — 6 cenários cobrindo o gate: nega edição
  externa sem aprovação; permite depois que o plano é aprovado; comportamento
  cross-session (estado keyado por project-root sobrevivendo à troca de
  `session_id`). É a prova de que a invariante central funciona.
- **`test_vitrine_sync_reminder.py`** — alinhado à config default (`SURFACES` com
  `#app`): prova que o lembrete dispara no closure de frontend e silencia quando já
  sincronizado. Se você editar `SURFACES`, ajuste este teste à sua config.

Rode-os antes de confiar o protocolo a um projeto novo. Verde = os hooks estão
instalados e respondendo como o documento descreve.

## Padrão de robustez (em todos os hooks)

- **Toda exceção → `exit 0`.** Nenhum hook quebra o fluxo do agente por bug próprio:
  JSON malformado em `stdin`, arquivo de estado corrompido, filesystem read-only —
  tudo degrada para "permitir/silenciar", nunca para "travar".
- **Lembretes saem cedo e em silêncio quando não se aplicam.** O primeiro passo de
  cada advisory é checar evento, matcher, path e fase; se algo não bate, `sys.exit(0)`
  sem imprimir nada. Você nunca recebe um lembrete fora de contexto.
- **Telemetria nunca interfere.** `delegation-audit` só escreve em log; falha de
  escrita é engolida.

## Como adaptar

Cada hook traz um bloco `CONFIG` (ou constantes no topo) com o que muda por projeto:

- `context-control-watchdog.py` → bloco `CONFIG` (linhas ~20-33): `STATE_NAMESPACE`,
  `KILL_SWITCH_ENV`, `CONTROL_DIR`, `PROTOTYPE_DIR`, `PROTOTYPE_CHECKLIST`.
- `vitrine-sync-reminder.py` → bloco `CONFIG` (linhas ~34-56): `VITRINE_DEPLOY_TARGET`
  e a tupla `SURFACES` (uma entrada por superfície de frontend, com `label`,
  `consolidated`, `markers` e `word_regex` opcional para evitar falso-positivo de
  substring — ex.: `board` dentro de `onboarding`). Se o projeto não tem vitrine,
  remova este hook do `settings.json`.
- `painel-sync-reminder.py` → constantes `SYNC_MARKERS` e o comando em `REMINDER` (o
  nome do script gerador e dos arquivos do painel).
- `roadmap-task-status-sync.py` → regexes `ROADMAP_TASK_REGEX` /
  `ESTADO_PATH_REGEX` e a estrutura de pastas `docs/roadmap/E##/`.
- `delegation-audit.py` → `EXPLORE_THRESHOLD`, `EDIT_THRESHOLD`, `STATE_TTL_SECONDS`.

Detalhe do passo-a-passo em `ADAPTACAO.md`; instalação em `INSTALL.md`.

## Arquivos no kit

- `kit/.claude/hooks/context-control-watchdog.py`
- `kit/.claude/hooks/roadmap-task-status-sync.py`
- `kit/.claude/hooks/delegation-audit.py`
- `kit/.claude/hooks/plan-summary-enforcer.py`
- `kit/.claude/hooks/vitrine-sync-reminder.py`
- `kit/.claude/hooks/painel-sync-reminder.py`
- `kit/.claude/settings.json` — wiring dos 6 hooks + deny-list de segredos.
- `kit/.claude/hooks/test_context_control_watchdog.py`,
  `kit/.claude/hooks/test_vitrine_sync_reminder.py` — auto-verificação.

## Cross-referências

- `01-controle-de-contexto.md` — o gate em detalhe (fases, estado, cadência).
- `04-sistema-de-documentacao.md` — `controle/`, roadmap, painel e a vitrine que os
  lembretes guardam.
- `INSTALL.md` — instalação e como rodar os testes.
- `ADAPTACAO.md` — os blocos `CONFIG` por projeto.
