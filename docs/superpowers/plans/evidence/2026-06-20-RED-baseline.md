# RED Baseline — Port Cadillac para o Kit (2026-06-20)

Estabelece o teste que FALHA antes do port (Iron Law: RED antes de GREEN) e o baseline
de regressão dos testes existentes do kit.

## 1. RED gate — skills cadillac ausentes num install fresh

Clone descartável recebeu só o payload do install (`kit/.claude` + `kit/prototipos_html`):

```
$ ls /tmp/kit-smoke-baseline/.claude/skills/
execute-closure
html-prototype
mermaid-flow

$ test ! -d .../skills/criar-prototipo  -> RED OK: criar-prototipo ausente
$ test ! -d .../skills/incrementar-prototipo -> RED OK: incrementar-prototipo ausente
```

**Conclusão RED:** um pedido de `/criar-prototipo` ou `/incrementar-prototipo` num clone+install
de hoje NÃO tem skill que resolva. Este é o teste que falha. O port (Tasks 1-11) torna-o GREEN,
provado pelo clone-smoke (Task 12).

## 2. Baseline de regressão — testes existentes do kit (GREEN hoje)

⚠️ Correção de runner: `test_context_control_watchdog.py` e `test_vitrine_sync_reminder.py`
são **scripts** (asserções em nível de módulo via `check()`), não suites pytest. Rodar via
`pytest` causa erro de COLETA (o hook emite saída não-JSON durante o import sob pytest) —
isso é artefato do runner, não bug. Invocação correta = como script (conforme o docstring de cada um).

Rodados da forma correta:

```
$ python3 test_context_control_watchdog.py   -> SUMMARY: 6 / 6 passed
$ python3 test_vitrine_sync_reminder.py      -> Todos os cenarios PASS (9/9)
$ bash kit/scripts/smoke-template.sh         -> SMOKE OK (skeleton: 1 checks pendentes), exit 0
```

**Baseline:** watchdog 6/6, vitrine 9/9, smoke-template OK. A Definição de Pronto compara contra
isto (não pode regredir). Verificação deve usar a invocação-script, NÃO pytest.
