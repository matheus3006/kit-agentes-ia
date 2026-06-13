# E0X · <nome do épico> · STATE

> Live State · ler em ~30s ao retomar a sessão · **atualizar a cada task closure**.
> Estimativa: <Nd> · ADRs: <ADR-XXXX, ...> · Criado: AAAA-MM-DD

## Status atual
- **Fase:** <onde o épico está>
- **Tasks concluídas:** N/M · **Última atualização:** <branch/commit>
- **Próxima task sugerida:** <T0X.NN>
- **Bloqueado por:** <...> · **Bloqueante de go-live:** <...>

## Tasks
- [ ] T0X.01 <título> (estimativa-papel · medição-real quando fechar)
- [ ] T0X.02 <...>

## Schema relacionado
<migrations · tabelas alteradas/novas · funções/edge functions>

## ADRs aplicáveis
<ADR-XXXX — o que cobre>

## Arquivos de produção
<preencher conforme as tasks abrem>

## Smoke script
- Path: `scripts/smoke-e0X.sh` · Último resultado: <PASS N/N> · Como rodar: `bash scripts/smoke-e0X.sh`
- Cobre: <quais ACs>

## Cuidados acumulados
<decisões/erratas travadas por task — memória técnica densa>

## Open issues / risks
<...>

## Pre-flight (nova sessão · 30s)
1. Ler este STATE.md
2. `git log --oneline -10` nos paths do épico
3. `bash scripts/smoke-e0X.sh`
4. Conferir última task em `controle/` se houver fase=execucao em andamento

## Convenção de update
Commitar este STATE.md no MESMO PR da task closure (single source of truth).
