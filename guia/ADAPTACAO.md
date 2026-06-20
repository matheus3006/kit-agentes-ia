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

## Placeholders — DUAS camadas distintas (não confundir)

O kit usa duas convenções de parametrização que parecem iguais mas são preenchidas em
momentos diferentes e por agentes diferentes:

1. **Install-time `{{PLACEHOLDER}}`** — você (adaptador) preenche **agora**, na hora de
   instalar/adaptar o kit ao projeto. São os valores desta seção. Busque-os com
   `grep -rn "{{" PROJ/` e troque todos.
2. **Scaffold-time `__TOKEN__`** — preenchidos **depois**, pela própria skill de protótipo
   (`criar-prototipo`/`incrementar-prototipo`) a cada tela/consolidado que ela gera:
   `__APP__` (nome do app), `__ROLE__` (papel/perfil), `__VER__` (`?v=` cache-bust),
   `__KEY__` (chave da tela no registry). **Não toque nesses** na adaptação — eles são
   marcadores do motor cadillac e a skill os resolve sozinha. Se você ver `__...__` num
   `templates/` ou no consolidado gerado, é scaffold-time, não install-time.

### Install-time `{{...}}` a substituir

**Base (sempre):**

| Placeholder | Default | O que é / quando ativar | Aparece em |
|-------------|---------|-------------------------|-----------|
| `{{PROJECT_NAME}}` | — (obrigatório) | Nome do projeto. | `CLAUDE.md`, `docs/ROADMAP.md`, `docs/roadmap/painel-data.json` (`meta.project`), `docs/CONTEXT.md` (implícito), template de protótipo (`index.html` title, `i18n.jsx` appName, comentários), `criar-prototipo/SKILL.md`, hub |

**Protótipo cadillac (se usar frontend):**

| Placeholder | Default | O que é / quando ativar | Aparece em |
|-------------|---------|-------------------------|-----------|
| `{{DEFAULT_PROTO_PORT}}` | `8765` | Porta preferida do servidor de protótipo (o `/iniciar-prototipo` varre p/ cima se ocupada). Trocar só se 8765 colidir com algo fixo do projeto. | `iniciar-prototipo.md`, `nova-tela-fe.md`, `guia/05` |
| `{{LOCALES}}` | `pt-BR,en` | Lista de locales do i18n (estrutura é obrigatória; a **lista** é configurável). Adicione/remova locales conforme o produto. | `i18n` do consolidado/minimal; checklist §6 item 8 |
| `{{PROJECT_DS}}` | — | Slug do design-system/namespace de telas (`window.<DS>Screens`). Define o prefixo das pastas de consolidado. | `criar-prototipo/SKILL.md`, `incrementar-prototipo/SKILL.md` |
| `{{ROLE}}` | — | Papel/perfil da superfície (ex.: `admin`, `cliente`). Compõe `<ds>-<papel>/`. | `criar-prototipo/SKILL.md`, `incrementar-prototipo/SKILL.md` |
| `{{CENTRAL_TOKENS_DOC}}` | — | Path do doc/mapa de tokens central do stack real (destino de tokens promovidos do protótipo). | `melhorar-prototipo.md` |
| `{{PRODUCT_STACK}}` | — | Stack oficial do produto (ex.: a do `CLAUDE.md`). Usado nos guard-rails de "não confundir protótipo com produção". | `nova-tela-fe.md` |
| `{{BACKEND_LAYER}}` | — | Camada de backend/BFF do produto. | `nova-tela-fe.md` |
| `{{COMPLIANCE_REQS}}` | — | Regime de privacidade/compliance do projeto (ex.: `LGPD`, `GDPR`). Governa o item "não logar PII/segredos". | `nova-tela-fe.md`, checklist §6 item 10 |
| `{{REFERENCE_PROTOTYPE}}` | `_template` | Protótipo de referência a portar de uma task aprovada; o resto fica stub. | `nova-tela-fe.md` |
| `{{TYPOGRAPHY}}` | — | Tipografia do hub (links de fonte + `font-family`). SEAM no topo do `hub.index.html`. | `criar-prototipo/templates/hub.index.html` |

### Blocos OPCIONAIS (default OFF — ative só se o produto tiver o atributo)

Estes vêm desligados. As invariantes correspondentes em `criar-prototipo/SKILL.md` estão
marcadas **(opt-in)**: só ative o bloco se a condição se aplicar ao produto de `{{PROJECT_NAME}}`.

**White-label** (ative só se o mesmo shell serve marcas distintas):

| Placeholder | O que é |
|-------------|---------|
| `{{TENANT_BRAND}}` / `{{TENANT_INITIALS}}` | Marca e iniciais do tenant (cliente). Só na variante SPLIT multi-papel. |
| `{{AGENCY_BRAND}}` / `{{AGENCY_INITIALS}}` | Marca e iniciais da agência/fornecedor. Só na variante SPLIT. |

Invariante associada: identidade de marca tem fonte única (`brandFor()` em `ds.jsx`); shell
e telas leem dela; sem strings de marca hard-coded; o shell **nunca** mostra a marca do fornecedor.

**Cor semântica reservada** (ative só se o produto tiver uma cor com significado reservado):

| Placeholder | O que é |
|-------------|---------|
| `{{RESERVED_SEMANTIC_TOKEN}}` | O token de cor reservado (ex.: o `--<algo>` que não pode virar CTA). |
| `{{RESERVED_MEANING}}` | O significado que esse token carrega (ex.: um estado/janela de tempo). |
| `{{ADR_REF}}` | O ADR do projeto que registra essa decisão. |

Invariante associada: a cor reservada mantém o significado reservado e **nunca** vira CTA —
CTA usa `--brand`. O `tone="semantic"` do `SwGroup` é o eixo semântico extra opcional (genérico).

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
- [ ] `grep -rn "{{" PROJ/` → zero placeholders **install-time** sobrando (os `__TOKEN__` scaffold-time FICAM — são do motor)
- [ ] `grep -rni "<seu-repo-de-vitrine>\|AAAA-MM-DD-app-mvp" PROJ/.claude` → trocados (se usar vitrine)
- [ ] CLAUDE.md com stack + invariantes reais
- [ ] Blocos opcionais (white-label / cor-reservada) ativados **só** se o produto tiver o atributo; senão, deixados OFF
- [ ] `settings.json` só com os hooks dos módulos escolhidos
- [ ] Passo 3 do INSTALL.md (testes + auto-teste do motor cadillac) verde
