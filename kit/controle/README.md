# controle/ — Diretorio de tarefas

Cada tarefa ativa vive em `controle/<task-id>/` com 4 arquivos obrigatorios.
O watchdog em `.claude/hooks/context-control-watchdog.py` valida a existencia
deles antes de permitir qualquer edicao fora de `controle/`.

## Convencao de task-id
`<YYYY-MM-DD>-<slug>` ou `<YYYY-MM-DD>-T<NN>.<NN>-<slug>` (se task pertence a
um epico do roadmap).

Exemplo: `2026-05-15-T04.01-onboarding-passageiro`

## Arquivos obrigatorios (caps de linhas)
- LIMITES.md  (max 80) — escopo, fora-de-escopo, ACs, invariantes
- PLANO.html  (max 120) — steps, arquivos tocados, riscos
- ESTADO.md   (max 60) — frontmatter com fase atual
- LEDGER.md   (max 150) — decisoes, evidencias de ACs

## Fluxo
1. Declarar: `nova tarefa: <slug> - <descricao>` (hook registra o task_id)
2. Criar os 4 arquivos
3. Avancar fase em ESTADO.md: limites -> planejamento -> aprovacao
4. Apresentar PLANO.html ao usuario; aguardar `aprovado` ou `/aprovar-plano`
5. Hook transiciona para fase: execucao
6. Implementar; cada edit externo exige update em ESTADO.md + LEDGER.md
7. Verificar ACs; preencher Verification no LEDGER
8. Fechar com fase: concluida; hook propaga roadmap status

## Tarefas triviais
Adicione `tipo: trivial` em ESTADO.md + registre exatamente o texto
"Auto-aprovado por triviabilidade" no LEDGER.md para pular aprovacao canonica.

## Bypass
- `/no-control` no prompt — bypassa watchdog SOMENTE no turno atual
- `export CONTEXT_CONTROL=off` — desabilita o watchdog inteiro
