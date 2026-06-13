# ROADMAP — {{PROJECT_NAME}}

Índice mestre dos épicos. Cada épico tem sua spec em `roadmap/E##-<slug>.md`; cada
task tem spec em `roadmap/E##/T##.NN-<slug>.md` e um STATE.md por (sub-)épico.

| Épico | Entrega | Estimativa | Status |
|---|---|---|---|
| [E01](roadmap/E01-<slug>.md) | <entrega macro> | <Nd> | ⏳ |
| [E02](roadmap/E02-<slug>.md) | <...> | <...> | ⏳ |

Legenda de status: ✅ COMPLETO · ⏳ em andamento/pendente.

## Convenções
- Cada task vira pasta `controle/AAAA-MM-DD-T0N.NN-<slug>/` (ver AGENTS.md).
- Toda task de frontend obriga `/nova-tela-fe` (protótipo → aprovação → implementação).
- Máx 1 task em `fase=execucao` por vez (exceção: worktrees em sub-épicos sem overlap de arquivos).
- Status de task `done` é propagado ao índice pelo hook `roadmap-task-status-sync.py`.

## Dependências (macro)
```
<diagrama ASCII opcional: E01 -> E02 -> ...>
```
