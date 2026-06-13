# ADAPTACAO — o que trocar por projeto

A maior parte do kit é **neutra** e não precisa mudar. Só os pontos abaixo carregam
valores específicos de projeto. Filosofia: poucos pontos de variação, defaults bons.

## Variáveis nos blocos CONFIG dos hooks
Cada hook tem (ou pode ter) um bloco `# ===== CONFIG =====` no topo.

| Hook | Constante | Default | Precisa trocar? |
|------|-----------|---------|-----------------|
| `context-control-watchdog.py` | `STATE_NAMESPACE` | `"agent-context"` | **Opcional.** O estado é keyado por SHA1 da raiz do projeto, então a pasta `~/.claude/state/<ns>/` pode ser compartilhada entre projetos sem colisão. Renomear só organiza/depura. |
| `context-control-watchdog.py` | `KILL_SWITCH_ENV` | `"CONTEXT_CONTROL"` | Opcional. Nome da env var que desliga o watchdog (`<VAR>=off`). |
| `context-control-watchdog.py` | `CONTROL_DIR` | `"controle"` | Raramente. |
| `context-control-watchdog.py` | `PROTOTYPE_DIR` | `"prototipos_html"` | Raramente. |
| `context-control-watchdog.py` | `PROTOTYPE_CHECKLIST` | `"docs/frontend/html-prototype-checklist.md"` | Só se mudar o path do checklist. |
| `vitrine-sync-reminder.py` | `VITRINE_DEPLOY_TARGET` | `"<seu-repo-de-vitrine>"` | **Sim, se usar vitrine.** |
| `vitrine-sync-reminder.py` | `SURFACES` | uma superfície `#app` de exemplo | **Sim, se usar vitrine.** Liste suas superfícies de frontend (label, slug do consolidado, markers, word_regex opcional). |

> Se renomear `KILL_SWITCH_ENV`, atualize também o `env.pop(...)` no topo de
> `test_context_control_watchdog.py` (ele zera essa var antes de testar).

## Placeholders `{{...}}` a substituir
| Placeholder | Aparece em |
|-------------|-----------|
| `{{PROJECT_NAME}}` | `CLAUDE.md`, `docs/ROADMAP.md`, `docs/roadmap/painel-data.json` (`meta.project`), `docs/CONTEXT.md` (implícito), template de protótipo (`index.html` title, `i18n.jsx` appName, comentários) |

Busque-os com: `grep -rn "{{" PROJ/` e preencha.

## Defaults que FICAM (não mexer sem motivo forte)
- `controle/` e os 4 arquivos `LIMITES.md` / `PLANO.html` / `ESTADO.md` / `LEDGER.md`.
- Os caps de linha **80 / 120 / 60 / 150** (em `CAPS` no watchdog).
- O vocabulário de fases (`limites … concluida`) e as frases de aprovação (`aprovado`, `aprovar`, `pode executar`, `/aprovar-plano`).
- A deny-list de segredos em `settings.json` (genérica, serve a qualquer projeto).
- Os 8 estados visuais obrigatórios do protótipo.

## Módulos opcionais — como desligar
Edite `PROJ/.claude/settings.json` removendo os blocos de hook que não quer.

**Projeto sem frontend:**
- Não copie `prototipos_html/`.
- Remova do `settings.json`: `vitrine-sync-reminder.py`.
- Opcional: remova a skill `html-prototype` e os commands `nova-tela-fe`/`iniciar-prototipo`/`melhorar-prototipo`.
- No watchdog, as keywords de protótipo ficam inertes (sem `prototipos_html/` nada dispara) — pode deixar.

**Projeto sem roadmap/painel:**
- Remova do `settings.json`: `roadmap-task-status-sync.py` e `painel-sync-reminder.py`.
- Não copie `scripts/gen-painel.mjs` nem `docs/roadmap/`.

**Quero só o gate (mínimo absoluto):**
- Deixe no `settings.json` apenas `context-control-watchdog.py` (nos 4 eventos) e, opcionalmente, `plan-summary-enforcer.py`.
- Remova os demais hooks.

**Quero telemetria de custo (delegação):**
- Mantenha `delegation-audit.py` — só loga em `~/.claude/state/<ns>/`, nunca bloqueia.

## Checklist final de adaptação
- [ ] `grep -rn "{{" PROJ/` → zero placeholders sobrando
- [ ] `grep -rni "<seu-repo-de-vitrine>\|AAAA-MM-DD-app-mvp" PROJ/.claude` → trocados (se usar vitrine)
- [ ] CLAUDE.md com stack + invariantes reais
- [ ] `settings.json` só com os hooks dos módulos escolhidos
- [ ] Passo 3 do INSTALL.md (testes) verde
