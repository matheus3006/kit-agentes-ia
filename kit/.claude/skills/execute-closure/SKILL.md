---
name: execute-closure
description: Pipeline de fechamento de tarefa. Invoca ao concluir execucao para validar ACs, atualizar LEDGER, transicionar ESTADO para concluida e propagar status no roadmap. Use quando terminar a fase de execucao de uma task em controle/.
---

# execute-closure

Skill que conduz o fechamento ordenado de uma task ativa em `controle/<task-id>/`.

## Quando invocar
- Apos completar a fase de execucao de uma task (codigo implementado, testes
  rodando) e antes de declarar a task como concluida.

## Checklist
1. Verificar Acceptance Criteria
   - Abrir `controle/<task-id>/LIMITES.md`
   - Para cada AC, validar manualmente (rodando comando, lendo arquivo,
     inspecionando UI) e registrar evidencia no `LEDGER.md`

2. Atualizar LEDGER.md
   - Adicionar bloco `## Verification` se ausente
   - Cada AC ganha linha: `AC#: passed — <evidencia: comando | path:linha | screenshot>`
   - Se algum AC falhou: NAO fechar — voltar para fase: execucao e ajustar

3. Sincronizar roadmap (se task tem padrao T##.NN no slug)
   - Se o projeto tiver hook de sync (ex.: `roadmap-task-status-sync.py`), ele
     propaga automaticamente; caso contrario, atualizar a mao.
   - Verificar: `docs/roadmap/E##/T##.NN-*.md` deve estar `status: done`
   - Verificar: epico `docs/roadmap/E##-*.md` deve ter checkbox `[x]`

4. Verificar caps de arquivos de controle
   - LIMITES.md <= 80 linhas
   - PLANO.html  <= 120 linhas
   - ESTADO.md <= 60 linhas
   - LEDGER.md <= 150 linhas
   - Se excedeu: compactar antes de fechar

5. Transicionar ESTADO.md para `fase: concluida`
   - Atualizar tambem `## Active Phase: concluida`

6. Reportar ao usuario
   - Bloco `# Resumo do fechamento` em PT-BR
   - O QUE foi entregue, evidencias, links para PR/commits, riscos remanescentes

7. (OPCIONAL · anti-drift) Refletir na vitrine de prototipos + redeploy
   - Passo aplicavel apenas a tasks de frontend e quando o projeto mantem uma
     vitrine consolidada de prototipos. As superficies (SURFACES) e os caminhos
     dos consolidados se configuram no proprio projeto.
   - Se a task entregou/ajustou uma tela ja aprovada: refletir a tela no
     prototipo consolidado da superficie correspondente — merge DENTRO dele,
     NAO aba nova no hub. Bump `?v=` no index.html (cache-bust).
   - Redeploy da vitrine (commit+push -> deploy) + conferir live.
   - Se o projeto tiver hook (ex.: `vitrine-sync-reminder.py`), ele lembra no
     closure.

8. (OPCIONAL · anti-drift) Regenerar o painel do roadmap
   - Passo aplicavel apenas se o projeto mantem painel derivado de dados.
   - Atualizar `docs/roadmap/painel-data.json` refletindo o que a task mudou
     (telas que viraram done/fe-only, gaps fechados, telas novas, docs stale
     corrigidos).
   - Rodar `node scripts/gen-painel.mjs` -> regenera `docs/roadmap/PAINEL.html`.
   - O painel e DERIVADO do JSON; nunca editar o HTML a mao. Se o projeto tiver
     hook (ex.: `painel-sync-reminder.py`), ele lembra no closure.

## Anti-padroes
- Fechar com AC sem evidencia concreta
- Compactar LEDGER removendo decisoes importantes (mover para ADR, nao deletar)
- Fechar sem rodar lint/testes do projeto
