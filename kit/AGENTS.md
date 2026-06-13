# AGENTS.md — Protocolo de Controle de Contexto

## Regra central
Toda edição fora de `controle/` exige uma task ativa com plano aprovado.
O hook `.claude/hooks/context-control-watchdog.py` **impõe** isso no `PreToolUse` —
não é convenção opcional, é um gate que nega a edição.

## Declarar task
Escreva no início da conversa:
  nova tarefa: <slug> - <descrição breve>

O watchdog deriva `task_id = AAAA-MM-DD-<slug>` e exige os 4 arquivos em `controle/<task-id>/`.

## Os 4 arquivos obrigatórios (caps de linha impostos pelo hook)
- `LIMITES.md` (≤80)  — escopo IN/OUT + Acceptance Criteria verificáveis + invariantes
- `PLANO.html` (≤120) — O QUÊ / POR QUÊ / COMO / RISCOS (legível pelo humano)
- `ESTADO.md` (≤60)   — frontmatter `fase:` (a máquina de estados que o hook lê)
- `LEDGER.md` (≤150)  — decisões + evidência de cada AC + (opcional) calibração de tempo
Templates limpos em `controle/_TEMPLATE/`.

## Ciclo de vida obrigatório
1. fase: limites      — escopo e ACs em LIMITES.md
2. fase: planejamento — escrever PLANO.html
3. fase: aprovacao    — apresentar o plano ao usuário (via AskUserQuestion)
4. Usuário digita     — "aprovado" | "aprovar" | "pode executar" | /aprovar-plano
5. fase: execucao     — edições no repositório liberadas
6. fase: verificacao  — evidências no LEDGER, ACs verificados
7. fase: concluida    — fechar via skill `execute-closure`

A fase vive no frontmatter de ESTADO.md e é avançada manualmente pelo agente.
O watchdog lê esse valor para decidir o gate.

## Cadência por-edit (anti-amnésia)
Após CADA edição de produção, o watchdog bloqueia a próxima edição externa até que
ESTADO.md **e** LEDGER.md tenham mtime mais recente. O diário nunca fica atrás do código.
Edições dentro de `controle/` e `prototipos_html/` são livres.

## Tarefas triviais
`tipo: trivial` em ESTADO.md + a string literal `Auto-aprovado por triviabilidade`
no LEDGER.md pulam a fase de aprovação (o hook faz grep por essa string).

## Bypass
/no-control                  — bypassa o watchdog somente no turno atual
CONTEXT_CONTROL=off          — desabilita o watchdog completamente (env var · ver CONFIG do hook)

## Frontend: protótipo HTML+JSX antes de implementar
Toda nova tela/fluxo obedece `/nova-tela-fe`:
1. Protótipo em `prototipos_html/<task-id>/` (index.html + components/*.jsx via Babel standalone)
2. Cobertura dos 8 estados visuais: default, hover, focus, active, disabled, loading, empty, error
3. Aprovação explícita do usuário sobre o protótipo
4. Só então: implementação no stack real
Checklist completo: `docs/frontend/html-prototype-checklist.md`.

## Vitrine — refletir toda tela aprovada (anti-drift)  [módulo opcional]
No closure de toda task de frontend, a tela aprovada é refletida no protótipo
consolidado da sua superfície + redeploy. Configure `SURFACES` no hook
`vitrine-sync-reminder.py`. Remova esta seção se o projeto não usar vitrine.

## Painel vivo do roadmap  [módulo opcional]
No closure, atualize `docs/roadmap/painel-data.json` e rode `node scripts/gen-painel.mjs`
para regenerar `docs/roadmap/PAINEL.html` (derivado do JSON, anti-drift — nunca editar à mão).

## STATE.md por épico
`docs/roadmap/E0X/STATE.md` vive fora de `controle/` (o cap de linhas não se aplica).
Live state lido em ~30s ao retomar a sessão; atualizado a cada task closure.

## Invariantes de segurança (sempre, sem exceção)
- Não logar dados pessoais, tokens, segredos
- Não ler `.env`, `*.key`, `*.pem` (deny list em `.claude/settings.json`)
- Não executar comandos destrutivos sem confirmação explícita
- Preservar mudanças não commitadas do usuário
