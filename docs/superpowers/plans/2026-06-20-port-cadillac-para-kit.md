# Port do Modelo Cadillac para o Kit guia-projetos — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Levar o modelo de protótipo "cadillac" (maduro em CRM-BreakWeb) para o kit-fonte `guia-projetos`, GENÉRICO e neutro, de modo que QUALQUER projeto que clone+instale o kit ganhe `/criar-prototipo`, `/incrementar-prototipo`, `/melhorar-prototipo` e `/iniciar-prototipo` funcionando.

**Architecture:** Portar o NEUTRO (motor cadillac: templates/, examples/minimal/, references) com **lealdade ao motor** (reuso verbatim, sem reescrever a engine). Descascar o domínio BreakWeb em princípios genéricos + invariantes opcionais (default OFF). Preservar os gotchas de PROCESSO do kit (prototipos_html editável só em execução · vitrine · controle/). A NEUTRALIDADE do kit + funcionar em qualquer clone é a restrição-mãe. Validação decisiva = **clone-smoke**: clone descartável + install + subagente clean-room cria→incrementa um protótipo de domínio NOVO, sobe em porta livre, console limpo.

**Tech Stack:** Markdown (skills/commands/docs), JSX (React 18 UMD + Babel standalone — engine cadillac), HTML, CSS (design tokens), JSON (settings.json), Python (hooks/tests existentes), Bash (smoke scripts).

**Repos:**
- Fonte madura: `/Users/matheus/AlmaSoftwareHouse/CRM-BreakWeb/.claude/skills/{criar-prototipo,incrementar-prototipo}/` + `.claude/commands/` + `docs/frontend/html-prototype-checklist.md`
- Alvo (kit): `/Users/matheus/PESSOAL/guia-projetos/kit/` + docs do método em `/Users/matheus/PESSOAL/guia-projetos/guia/`
- Galeria (só ponteiro, NÃO copiar): manila (`CRM-BreakWeb/prototipos_html/`), cadillac-delivery (`cadillac/delivery_cadillac/prototipos_html/`), nutri (`nutriApp/prototipos_html/`)

---

## Decisões fechadas (escopo travado)

| # | Decisão | Escolha |
|---|---------|---------|
| 1 | html-prototype | **Coexistir**, cadillac default; marcar a antiga como "superseded" |
| 2 | Exemplos | **Neutro bundlado** (`examples/minimal/` + `templates/`) **+ galeria-ponteiro** em guia/03 |
| 3 | iniciar-prototipo | **Porta-livre (sweep) + servir raiz + abrir hub** (deep-link se não houver hub) |
| 4 | 2 eixos de domínio | **Princípio genérico + invariante opcional, default OFF** (mecânica fica no motor, naming sai) |
| 5 | settings.json | **Estreitar** `Read(**/*token*)` p/ padrões de segredo-real |
| 6 | régua 12/12 | **Autorar régua canônica 12/12** no checklist do kit |
| 7 | i18n | Estrutura obrigatória, locales configuráveis, **default pt-BR + en** |

Limpezas mecânicas (sem pergunta): unificar 8765/8000 → constante `{{DEFAULT_PROTO_PORT}}` (default 8765); `tone='window'` → `tone='semantic'`; remover anedota Docker 1ª-pessoa; trocar paths absolutos `/Users/matheus/...` por ponteiros relativos/internos.

---

## Convenções de parametrização (duas camadas distintas — NÃO confundir)

1. **Install-time `{{PLACEHOLDER}}`** (convenção ADAPTACAO): preenchidos pelo adaptador na hora do install/adaptação ao projeto. Ex.: `{{PROJECT_NAME}}`, `{{DEFAULT_PROTO_PORT}}`, `{{LOCALES}}`, `{{PROJECT_DS}}`, blocos opcionais white-label / cor-semântica-reservada.
2. **Scaffold-time `__TOKEN__`** (marcadores da engine cadillac): preenchidos pela própria skill ao gerar uma tela/consolidado. Ex.: `__APP__`, `__ROLE__`, `__VER__`, `__KEY__`. NÃO são `{{...}}` de install — documentar a diferença em ADAPTACAO p/ não embaralhar.

---

## Inventário de genericização (tabela autoritativa — fonte de verdade dos edits)

Cada item: vazamento verbatim → vira (princípio genérico / invariante opcional). O critério GREEN de cada arquivo portado é **grep do termo de domínio = zero**.

| # | Vazamento (verbatim) | Arquivo(s) fonte | Vira |
|---|---|---|---|
| 1 | `BreakWeb` / `CRM-BreakWeb` | criar SKILL.md:124,128 | `{{PROJECT_NAME}}` |
| 2 | bloco "Invariantes de produto BreakWeb" | criar SKILL.md:124-129 | "Invariantes de produto (opt-in — só quando a tela toca o domínio de `{{PROJECT_NAME}}`)" |
| 3 | `verde = janela 24h, nunca CTA` (ADR-0005) | SKILL.md:129; registry `tone='window'`; tokens.css; checklist §6; incrementar | **Invariante OPCIONAL (default OFF):** "uma cor semântica reservada mantém o significado reservado e nunca vira CTA — CTA usa `--brand`." Parametrizar `{{RESERVED_SEMANTIC_TOKEN}}`/`{{RESERVED_MEANING}}`/`{{ADR_REF}}` |
| 4 | `janela 24h` / WhatsApp (`--window-open/closing/closed`, `MSG_FAILED`) | data.jsx; tokens.css; registry SwGroup | "um eixo semântico extra opcional por tela"; WhatsApp nunca nomeado |
| 5 | white-label `brandFor()`, `zero powered-by leak` | SKILL.md:128; manila | **Invariante OPCIONAL (se white-label):** "identidade de marca tem fonte única (`brandFor()` em ds.jsx); shell/telas leem dela; sem strings de marca hard-coded; shell nunca mostra a marca do fornecedor" |
| 6 | `Pizzaria do Ze`/`PZ`, `Grazi`/`G` | manila data.jsx | `{{TENANT_BRAND}}`/`{{TENANT_INITIALS}}`, `{{AGENCY_BRAND}}`/`{{AGENCY_INITIALS}}` (só na variante SPLIT) |
| 7 | roles `agent`/`account`/`agency`, `_shared-manila/`, `manila-*`, `window.ManilaScreens` | manila; criar SKILL.md:59; incrementar | `{{PROJECT_DS}}`/`{{ROLE}}`; namespace `window.<DS>Screens`; variante SPLIT `_shared-<ds>/` + `<ds>-<papel>/` |
| 8 | `Funil`, `screen-funil.jsx`, modo-support, `PERMISSIONS`/Q55, billing/overage | incrementar; manila | "uma superfície aprovada = 1+ telas coerentes"; mock de domínio só em `data.jsx`/`screens/`/`i18n` |
| 9 | Hub `--accent: #FF007F`, "Protótipos · modelo cadillac", Inter/JetBrains | templates `hub.index.html` | neutralizar/tokenizar paleta do hub; tirar "modelo cadillac" da UI visível; fonte = SEAM/`{{TYPOGRAPHY}}` |
| 10 | `LGPD`, PII (telefone/mensagem) | nova-tela-fe.md:38; checklist §6 | `{{COMPLIANCE_REQS}}` (LGPD/GDPR/…); "não logar PII/segredos conforme o regime de privacidade do projeto" |
| 11 | Stack `React 18 + Vite + Tailwind + shadcn`; BFF `Spring Boot`; `workspace_id` | nova-tela-fe.md:30,36,39 | `{{PRODUCT_STACK}}`, `{{BACKEND_LAYER}}`; tenant scoping = invariante white-label opcional |
| 12 | path absoluto `/Users/matheus/.../2026-05-20-cliente-mvp/`; ponteiros `_shared-manila/` | cadillac-model.md:119-127; SKILL.md | `{{LIVE_EXAMPLE}}` → interno `examples/minimal/`; descrever cadillac como "o protótipo de origem" sem path pessoal |
| 13 | anedota Docker "ja vi acontecer" | iniciar-prototipo.md:59 | "se a porta dedicada estiver ocupada, avise e use a próxima livre" (sem 1ª pessoa) |
| 14 | IDs de task/épico: `T01.01`, `E01`, `F-AGCY-03/07`, `wf_...`, nomes datados | nova-tela-fe.md:51; manila; READMEs | `{{REFERENCE_PROTOTYPE}}` (default `_template`); "tela real portada de uma task aprovada; o resto é stub" |
| 15 | cauda pós-ship: `#cliente`, path datado, `feedback-vitrine-prototipos`, `<seu-repo-de-vitrine>`, decisão-entrevista pt-BR-only | kit checklist:41,54,86-95 | "após ship, reflita as telas aprovadas no showcase consolidado, suba `?v=`, redeploy"; i18n "estrutura obrigatória, lista de locales configurável" |

---

## Gotchas de PROCESSO a preservar (do KIT — válidos em todo install; NÃO são domínio)

1. `prototipos_html/` editável só enquanto a task governante está em `execucao` (em `verificacao`/`concluida` o watchdog BLOQUEIA — reabrir antes).
2. Espinha `controle/<task-id>/` = `LIMITES.md`/`PLANO.html`/`ESTADO.md`/`LEDGER.md`; edits dentro de `controle/` isentos da regra de toque.
3. "Touch obrigatório": antes de editar fora de `controle/`, tocar `ESTADO`+`LEDGER` da task ativa.
4. Aprovação = gate humano duro: usuário digita literalmente `aprovado` (ou `/aprovar-plano`). Nada que o agente escreve conta. "Eu testei e funciona" nunca fecha.
5. Vitrine/hub: `PROTOS[]` `{key,label,src,wip,ref}` é o manifesto; *crescer* sobe `?v=` da entrada existente, *criar* = novo consolidado (criar-prototipo, não incrementar). `wip:true` = placeholder.
6. `_template/` e `examples/minimal/` são copiados, nunca editados in-place. Editar só `ds.jsx`/`screens.jsx`/tokens — nunca `engine.jsx`/`templates/`.
7. Babel-standalone escopo global: cada tela = 1 IIFE; ordem de load load-bearing; hooks no topo antes de qualquer return condicional.
8. `?v=` cache-bust em TODA tag local + iframe do hub.
9. Camada de tokens: device/chrome injetam via `<style>`/merge; nunca tocam `tokens.css`/`TRANSLATIONS` canônicos.

---

## Estrutura de arquivos (criar / modificar)

**NOVA skill `kit/.claude/skills/criar-prototipo/`:**
- `SKILL.md` — eixo NASCER (portado + genericizado)
- `references/cadillac-model.md` — 4 camadas, ordem de load, fit-to-stage, CSS responsivo (portado; só §5 reescrita)
- `templates/` (8): `app-shell.jsx`, `device-frame.jsx`, `registry.jsx`, `i18n-chrome.jsx`, `screen.iife.jsx`, `showcase.jsx`, `hub.index.html`, `consolidado.index.html`
- `examples/minimal/` (5): `index.html`, `ds.jsx`, `engine.jsx`, `screens.jsx`, `app.jsx`

**NOVA skill `kit/.claude/skills/incrementar-prototipo/`:**
- `SKILL.md` — eixo CRESCER (delta-fusão cirúrgica)
- `references/incremento-delta.md`

**MODIFICAR:**
- `kit/.claude/commands/iniciar-prototipo.md` — porta-livre + servir raiz + abrir hub
- `kit/.claude/commands/melhorar-prototipo.md` — sync com versão evoluída + cadillac-aware
- `kit/.claude/commands/nova-tela-fe.md` — constante de porta + placeholders de stack/compliance (toque leve)
- `kit/.claude/skills/html-prototype/SKILL.md` — reposicionar como legado single-showcase ("superseded")
- `kit/.claude/settings.json` — estreitar `Read(**/*token*)`
- `kit/docs/frontend/html-prototype-checklist.md` — régua 12/12 canônica §6 + cauda genérica + i18n default
- `guia/03-prototipo-frontend.md` — cadillac substitui single-showcase + galeria-ponteiro
- `guia/05-skills-e-commands.md` — tabelas das 4 skills/commands
- `guia/00-visao-geral.md` — Pilar 3 (toque leve)
- `guia/ADAPTACAO.md` — registry dos novos placeholders + as 2 camadas
- `guia/INSTALL.md` — passo de cópia das skills novas + verificação que exercita o cadillac

**NÃO copiar (só ponteiro):** manila / cadillac-delivery / nutri.
**NÃO tocar (mantém legado):** `kit/prototipos_html/_template/` (template single-showcase do html-prototype).

---

## Fases & Tasks

### Task 0 — RED: baseline do clone-smoke (PROVAR a falha antes de portar)

**Files:**
- Create: `/tmp/kit-smoke-baseline/` (projeto descartável)
- Create (artefato de evidência): `docs/superpowers/plans/evidence/2026-06-20-RED-baseline.md`

- [ ] **Step 1** — Criar clone descartável e instalar SÓ o que o install copia:
```bash
rm -rf /tmp/kit-smoke-baseline && mkdir -p /tmp/kit-smoke-baseline && cd /tmp/kit-smoke-baseline && git init -q
cp -R /Users/matheus/PESSOAL/guia-projetos/kit/.claude /tmp/kit-smoke-baseline/.claude
cp -R /Users/matheus/PESSOAL/guia-projetos/kit/prototipos_html /tmp/kit-smoke-baseline/prototipos_html
```
- [ ] **Step 2** — Provar que as skills cadillac NÃO existem ainda:
```bash
ls /tmp/kit-smoke-baseline/.claude/skills/   # esperado: execute-closure, html-prototype, mermaid-flow (SEM criar-prototipo/incrementar-prototipo)
test ! -d /tmp/kit-smoke-baseline/.claude/skills/criar-prototipo && echo "RED OK: criar-prototipo ausente"
```
Expected: "RED OK: criar-prototipo ausente" — este é o teste que falha (skill inexistente).
- [ ] **Step 3** — Capturar baseline de roteamento (description-trigger): registrar que hoje só existe `html-prototype` para qualquer pedido de protótipo. Anotar em `evidence/2026-06-20-RED-baseline.md` a saída dos steps 1-2 + a observação "um pedido de '/criar-prototipo' ou 'protótipo multi-tela cadillac' não tem skill para resolver".
- [ ] **Step 4** — Rodar os testes existentes do kit p/ baseline verde de regressão. **Runner correto = script** (são testes script-style com asserções em nível de módulo; `pytest` é o runner ERRADO e erra na coleta):
```bash
cd /Users/matheus/PESSOAL/guia-projetos/kit/.claude/hooks
python3 test_context_control_watchdog.py   # esperado: SUMMARY: 6 / 6 passed
python3 test_vitrine_sync_reminder.py      # esperado: Todos os cenarios PASS (9/9)
bash /Users/matheus/PESSOAL/guia-projetos/kit/scripts/smoke-template.sh   # esperado: SMOKE OK, exit 0
```
Baseline confirmado GREEN: watchdog 6/6, vitrine 9/9, smoke OK (ver `evidence/2026-06-20-RED-baseline.md`).
- [ ] **Step 5** — Commit do artefato de evidência (sem tocar kit):
```bash
cd /Users/matheus/PESSOAL/guia-projetos && git add docs/superpowers/plans && git commit -m "test: RED baseline do clone-smoke cadillac (skills ausentes provadas)"
```

---

### Task 1 — settings.json: estreitar `Read(**/*token*)` (desbloqueia tokens.css)

**Files:**
- Modify: `kit/.claude/settings.json` (regra de deny da permissão Read)

- [ ] **Step 1** — Ler a deny-list atual e localizar `Read(**/*token*)`:
```bash
grep -n "token" /Users/matheus/PESSOAL/guia-projetos/kit/.claude/settings.json
```
- [ ] **Step 2** — Substituir a regra ampla por padrões de segredo-real. Trocar a entrada `"Read(**/*token*)"` por estas três:
```
"Read(**/*.token)",
"Read(**/*token*.json)",
"Read(**/*auth*token*)"
```
(Preserva proteção a segredos de API; libera `tokens.css`/`design-tokens.css`/`tokens.jsx`.)
- [ ] **Step 3** — Validar JSON + provar que design-tokens ficou legível e segredo continua negado:
```bash
python3 -c "import json;json.load(open('/Users/matheus/PESSOAL/guia-projetos/kit/.claude/settings.json'));print('JSON ok')"
grep -c "Read(\*\*/\*token\*)" /Users/matheus/PESSOAL/guia-projetos/kit/.claude/settings.json   # esperado: 0
```
- [ ] **Step 4** — Commit:
```bash
git add kit/.claude/settings.json && git commit -m "fix(settings): estreita deny de token p/ segredos reais; libera design-tokens (tokens.css)"
```

---

### Task 2 — Portar o MOTOR: `criar-prototipo/templates/` (8 arquivos, near-verbatim)

**Files:**
- Create: `kit/.claude/skills/criar-prototipo/templates/{app-shell,device-frame,registry,i18n-chrome,screen.iife,showcase}.jsx`, `{hub,consolidado}.index.html`

- [ ] **Step 1** — Copiar os 8 templates verbatim:
```bash
mkdir -p /Users/matheus/PESSOAL/guia-projetos/kit/.claude/skills/criar-prototipo/templates
cp /Users/matheus/AlmaSoftwareHouse/CRM-BreakWeb/.claude/skills/criar-prototipo/templates/* /Users/matheus/PESSOAL/guia-projetos/kit/.claude/skills/criar-prototipo/templates/
```
- [ ] **Step 2** — `registry.jsx`: renomear o branch de domínio `tone='window'` → `tone='semantic'` (mantém a mecânica de 3 estados, tira o naming janela-24h). Editar a(s) ocorrência(s) `tone='window'`/`'window'` no `SwGroup` para `'semantic'` e o comentário associado para "eixo semântico extra opcional (genérico)".
- [ ] **Step 3** — `app-shell.jsx`: remover do comentário-cabeçalho a referência `_shared-manila/app-shell.jsx` (trocar por "espelha o app-shell do consolidado").
- [ ] **Step 4** — `hub.index.html`: de-skin. (a) `--accent: #FF007F` → token neutro `var(--brand, #2563EB)`; (b) remover a tag visível "Protótipos · modelo cadillac" → "Protótipos · {{PROJECT_NAME}}"; (c) fontes Inter/JetBrains → comentário SEAM `{{TYPOGRAPHY}}`; (d) `PROTOS[]` de exemplo → 1 entrada de exemplo neutra apontando `examples/minimal/`.
- [ ] **Step 5** — `consolidado.index.html` e `screen.iife.jsx`: confirmar que só usam marcadores scaffold `__APP__`/`__ROLE__`/`__VER__`/`__KEY__` (sem domínio). Nenhuma edição se grep limpo.
- [ ] **Step 6** — GREEN por grep (zero domínio nos templates):
```bash
cd /Users/matheus/PESSOAL/guia-projetos/kit/.claude/skills/criar-prototipo/templates
grep -rniE "breakweb|manila|whatsapp|janela 24|pizzaria|grazi|#FF007F|tone=.window" . ; echo "exit=$?"
```
Expected: nenhum match (exit 1 do grep). `tone='window'` e `#FF007F` eliminados.
- [ ] **Step 7** — Commit:
```bash
git add kit/.claude/skills/criar-prototipo/templates && git commit -m "feat(criar-prototipo): porta motor cadillac (templates) genericizado"
```

---

### Task 3 — Portar o exemplo NEUTRO: `criar-prototipo/examples/minimal/` (5 arquivos, verbatim)

**Files:**
- Create: `kit/.claude/skills/criar-prototipo/examples/minimal/{index.html,ds.jsx,engine.jsx,screens.jsx,app.jsx}`

- [ ] **Step 1** — Copiar verbatim (o reader confirmou `domain_leakage: []`; produto literalmente "Demo", brand `#2563EB`):
```bash
mkdir -p /Users/matheus/PESSOAL/guia-projetos/kit/.claude/skills/criar-prototipo/examples/minimal
cp /Users/matheus/AlmaSoftwareHouse/CRM-BreakWeb/.claude/skills/criar-prototipo/examples/minimal/* /Users/matheus/PESSOAL/guia-projetos/kit/.claude/skills/criar-prototipo/examples/minimal/
```
- [ ] **Step 2** — Alinhar o nit cosmético: `ROLES.user.initials` vs `brandFor()` (deixar consistente — `'D'` de "Demo"). Editar só se divergir.
- [ ] **Step 3** — GREEN por grep (zero domínio):
```bash
grep -rniE "breakweb|manila|whatsapp|janela 24|pizzaria|grazi" /Users/matheus/PESSOAL/guia-projetos/kit/.claude/skills/criar-prototipo/examples/minimal ; echo "exit=$?"
```
Expected: nenhum match.
- [ ] **Step 4** — Guard de "don't touch": confirmar relação `examples/minimal/engine.jsx` ↔ `templates/` (engine = bundle do motor). Documentar a relação no topo de `engine.jsx` se ainda não houver nota. Verificar que o minimal **roda standalone** (Task 9 cobre o serve).
- [ ] **Step 5** — Commit:
```bash
git add kit/.claude/skills/criar-prototipo/examples/minimal && git commit -m "feat(criar-prototipo): bundla exemplo neutro minimal (Demo) verbatim"
```

---

### Task 4 — Portar `criar-prototipo/references/cadillac-model.md` (genericizar só §5)

**Files:**
- Create: `kit/.claude/skills/criar-prototipo/references/cadillac-model.md`

- [ ] **Step 1** — Copiar verbatim:
```bash
mkdir -p /Users/matheus/PESSOAL/guia-projetos/kit/.claude/skills/criar-prototipo/references
cp /Users/matheus/AlmaSoftwareHouse/CRM-BreakWeb/.claude/skills/criar-prototipo/references/cadillac-model.md /Users/matheus/PESSOAL/guia-projetos/kit/.claude/skills/criar-prototipo/references/
```
- [ ] **Step 2** — §1-3,6 são neutros (4 camadas, ordem de load, fit-to-stage, sync templates↔examples) — preservar verbatim (lealdade ao motor).
- [ ] **Step 3** — §5 (exemplos vivos Manila/cadillac, path absoluto linhas ~119-127): reescrever para apontar ao exemplo interno `examples/minimal/` como referência canônica, e citar a **galeria** (manila/cadillac/nutri) de forma genérica como "protótipos de origem que comprovam o modelo agnóstico de domínio" — sem paths pessoais `/Users/matheus/...`.
- [ ] **Step 4** — Confirmar ordem de load documentada igual à fonte: `i18n → i18n-chrome → ui → nav → registry → device-frame → showcase → app-shell → screens → app`.
- [ ] **Step 5** — GREEN por grep:
```bash
grep -rniE "breakweb|manila|/Users/matheus|janela 24" /Users/matheus/PESSOAL/guia-projetos/kit/.claude/skills/criar-prototipo/references/cadillac-model.md ; echo "exit=$?"
```
Expected: nenhum match.
- [ ] **Step 6** — Commit:
```bash
git add kit/.claude/skills/criar-prototipo/references && git commit -m "feat(criar-prototipo): porta cadillac-model.md; §5 aponta exemplo interno + galeria"
```

---

### Task 5 — Portar `criar-prototipo/SKILL.md` (NASCER) genericizado + CSO

**Files:**
- Create: `kit/.claude/skills/criar-prototipo/SKILL.md`

- [ ] **Step 1** — Copiar verbatim como base:
```bash
cp /Users/matheus/AlmaSoftwareHouse/CRM-BreakWeb/.claude/skills/criar-prototipo/SKILL.md /Users/matheus/PESSOAL/guia-projetos/kit/.claude/skills/criar-prototipo/SKILL.md
```
- [ ] **Step 2** — **Frontmatter / CSO (trigger-only, disambiguante):** description SEM resumo de workflow, só gatilhos, e que roteie corretamente vs html-prototype/incrementar. Usar:
```yaml
---
name: criar-prototipo
description: Use quando for criar um protótipo HTML+JSX NOVO de uma ou mais telas/fluxos/papéis (modelo cadillac multi-superfície), do zero. Default para "novo protótipo", "nova tela cadillac", "showcase multi-papel", "consolidado", "hub de protótipos". Para CRESCER um protótipo cadillac existente use incrementar-prototipo; para uma tela única legada use html-prototype.
---
```
- [ ] **Step 3** — Bloco "Invariantes de produto BreakWeb" (linhas ~124-129) → "Invariantes de produto (opt-in)". Aplicar itens #2, #3, #5 do inventário: tornar o eixo cor-reservada e o white-label **invariantes OPCIONAIS, default OFF**, parametrizados (`{{RESERVED_SEMANTIC_TOKEN}}`/`{{RESERVED_MEANING}}`/`{{ADR_REF}}` e o bloco white-label `brandFor()`), com instrução explícita "ative só se o produto de `{{PROJECT_NAME}}` tiver esse atributo".
- [ ] **Step 4** — Linhas citando `BreakWeb`/`CRM`/path de checklist (SKILL.md:34,124,128,138,157) → `{{PROJECT_NAME}}` + path relativo do checklist do kit (`docs/frontend/html-prototype-checklist.md`). Seção "Ponteiros/exemplos vivos" → exemplo interno `examples/minimal/` + galeria genérica.
- [ ] **Step 5** — Preservar verbatim (lealdade): motor, workflow NASCER, gotchas universais de processo (lista de 9 acima), ordem de load, régua de verificação. NÃO reescrever a engine.
- [ ] **Step 6** — GREEN por grep + sanidade frontmatter:
```bash
grep -rniE "breakweb|manila|whatsapp|janela 24|/Users/matheus" /Users/matheus/PESSOAL/guia-projetos/kit/.claude/skills/criar-prototipo/SKILL.md ; echo "exit=$?"
head -5 /Users/matheus/PESSOAL/guia-projetos/kit/.claude/skills/criar-prototipo/SKILL.md   # frontmatter name+description
```
Expected: nenhum match de domínio; frontmatter válido.
- [ ] **Step 7** — Commit:
```bash
git add kit/.claude/skills/criar-prototipo/SKILL.md && git commit -m "feat(criar-prototipo): SKILL.md genericizado (CSO trigger-only, invariantes opt-in)"
```

---

### Task 6 — Portar skill `incrementar-prototipo/` (CRESCER) genericizada

**Files:**
- Create: `kit/.claude/skills/incrementar-prototipo/SKILL.md`, `kit/.claude/skills/incrementar-prototipo/references/incremento-delta.md`

- [ ] **Step 1** — Copiar verbatim:
```bash
mkdir -p /Users/matheus/PESSOAL/guia-projetos/kit/.claude/skills/incrementar-prototipo/references
cp /Users/matheus/AlmaSoftwareHouse/CRM-BreakWeb/.claude/skills/incrementar-prototipo/SKILL.md /Users/matheus/PESSOAL/guia-projetos/kit/.claude/skills/incrementar-prototipo/SKILL.md
cp /Users/matheus/AlmaSoftwareHouse/CRM-BreakWeb/.claude/skills/incrementar-prototipo/references/incremento-delta.md /Users/matheus/PESSOAL/guia-projetos/kit/.claude/skills/incrementar-prototipo/references/incremento-delta.md
```
- [ ] **Step 2** — **CSO frontmatter (trigger-only, disambiguante):**
```yaml
---
name: incrementar-prototipo
description: Use quando for CRESCER um protótipo cadillac que JÁ existe — fundir uma nova tela/estado/papel num consolidado existente, sem reescrever o motor. Gatilhos: "adicionar tela ao protótipo", "incrementar", "fundir segunda tela", "nova variante no showcase". Para um protótipo NOVO do zero use criar-prototipo.
---
```
- [ ] **Step 3** — Genericizar exemplos de domínio (itens #4,#7,#8): `manila-agent`/`Funil`/`window.ManilaScreens` → `{{PROJECT_DS}}`/`window.<DS>Screens`/"a tela aprovada"; remover o item da régua "verde=janela 24h" (vira o invariante opcional do criar) — referenciar a régua 12/12 canônica do checklist (Task 11) em vez de duplicar.
- [ ] **Step 4** — Preservar verbatim: a delta-fusão cirúrgica, os gotchas de processo (IIFE, ordem de load, `?v=`, hooks-no-topo), o workaround de editar `tokens.css` via Bash/append (agora que Task 1 liberou o Read, validar se ainda é necessário — manter como alternativa, não obrigatório).
- [ ] **Step 5** — GREEN por grep:
```bash
grep -rniE "breakweb|manila|whatsapp|janela 24|funil|/Users/matheus" /Users/matheus/PESSOAL/guia-projetos/kit/.claude/skills/incrementar-prototipo ; echo "exit=$?"
```
Expected: nenhum match.
- [ ] **Step 6** — Commit:
```bash
git add kit/.claude/skills/incrementar-prototipo && git commit -m "feat(incrementar-prototipo): porta eixo CRESCER genericizado (CSO trigger-only)"
```

---

### Task 7 — `iniciar-prototipo.md`: porta-livre + servir raiz + abrir hub

**Files:**
- Modify: `kit/.claude/commands/iniciar-prototipo.md`

- [ ] **Step 1** — Ler o comando atual inteiro p/ pegar strings exatas (frontmatter porta, steps 3-7, linha 57 "não usar 8000", linha 59 anedota Docker):
```bash
cat -n /Users/matheus/PESSOAL/guia-projetos/kit/.claude/commands/iniciar-prototipo.md
```
- [ ] **Step 2** — Introduzir a constante `{{DEFAULT_PROTO_PORT}}` (default 8765) no frontmatter/cabeçalho e usá-la em todos os pontos onde hoje está `8765` hard-coded.
- [ ] **Step 3** — Trocar o `lsof -ti :8765 | xargs kill -9` por **sweep de porta livre** (tentar a preferida; se ocupada por processo de terceiro, varrer p/ cima até a 1ª livre; só matar processo PRÓPRIO anterior via `/tmp/proto-srv-<task-id>.log` PID). Bloco de referência a inserir:
```bash
PORT={{DEFAULT_PROTO_PORT}}
# mata só o servidor próprio anterior, se houver
if [ -f /tmp/proto-srv.pid ]; then kill "$(cat /tmp/proto-srv.pid)" 2>/dev/null; fi
# varre p/ a 1ª porta livre a partir da preferida
while lsof -ti :"$PORT" >/dev/null 2>&1; do PORT=$((PORT+1)); done
echo "Porta escolhida: $PORT"
```
- [ ] **Step 4** — Servir a **RAIZ** de `prototipos_html/` (não a pasta da task) e detectar hub: se existir `prototipos_html/index.html` com `PROTOS[]`, abrir o hub; senão deep-link do consolidado único. Bloco:
```bash
cd prototipos_html
python3 -m http.server "$PORT" >/tmp/proto-srv.log 2>&1 & echo $! >/tmp/proto-srv.pid
if grep -q "PROTOS" index.html 2>/dev/null; then OPEN="http://localhost:$PORT/"; else OPEN="http://localhost:$PORT/<task-id>/"; fi
echo "Abrir: $OPEN"
```
- [ ] **Step 5** — Genericizar o smoke asset: trocar o assert `curl .../components/app.jsx` (layout single-showcase antigo) por assert genérico: `curl -sI http://localhost:$PORT/ | head -1` = 200 + 1 tag de script conhecida do consolidado/minimal.
- [ ] **Step 6** — Remover a anedota Docker 1ª-pessoa (linha ~59) → "se a porta dedicada estiver ocupada, o sweep usa a próxima livre e reporta qual". Reconciliar a contradição 8000-vs-8765: tudo via `{{DEFAULT_PROTO_PORT}}`.
- [ ] **Step 7** — Verificar lógica do sweep num teste real (porta ocupada propositalmente):
```bash
python3 -m http.server 8765 >/dev/null 2>&1 & BUSY=$!; sleep 0.3
P=8765; while lsof -ti :"$P" >/dev/null 2>&1; do P=$((P+1)); done; echo "sweep escolheu $P (esperado 8766)"; kill $BUSY
```
Expected: "sweep escolheu 8766".
- [ ] **Step 8** — Commit:
```bash
git add kit/.claude/commands/iniciar-prototipo.md && git commit -m "fix(iniciar-prototipo): porta-livre por sweep, serve raiz, abre hub; remove anedota e 8765 fixo"
```

---

### Task 8 — `melhorar-prototipo.md` (sync evoluído + cadillac-aware) e `nova-tela-fe.md` (toque leve)

**Files:**
- Modify: `kit/.claude/commands/melhorar-prototipo.md`
- Modify: `kit/.claude/commands/nova-tela-fe.md`

- [ ] **Step 1** — Diff kit vs CRM do melhorar-prototipo p/ ver a evolução:
```bash
diff /Users/matheus/PESSOAL/guia-projetos/kit/.claude/commands/melhorar-prototipo.md /Users/matheus/AlmaSoftwareHouse/CRM-BreakWeb/.claude/commands/melhorar-prototipo.md
```
- [ ] **Step 2** — Trazer a versão evoluída do CRM, genericizando (path `design-tokens.md` → `{{CENTRAL_TOKENS_DOC}}`; sem domínio). Adicionar bloco "cadillac-aware": "**adicionar tela** → use `/incrementar-prototipo` (crescer existente) ou `/criar-prototipo` (novo consolidado); este comando é para *melhorar* o que já existe".
- [ ] **Step 3** — `nova-tela-fe.md` toque leve: reconciliar `http.server 8000` → `{{DEFAULT_PROTO_PORT}}`; placeholders `{{PRODUCT_STACK}}`/`{{BACKEND_LAYER}}`/`{{COMPLIANCE_REQS}}`/`{{REFERENCE_PROTOTYPE}}` (itens #10,#11,#14). Apontar "modelo cadillac" → criar/incrementar.
- [ ] **Step 4** — GREEN por grep nos dois:
```bash
grep -rniE "breakweb|manila|whatsapp|janela 24|spring boot|shadcn|8000|design-tokens\.md|workspace_id|lgpd" /Users/matheus/PESSOAL/guia-projetos/kit/.claude/commands/melhorar-prototipo.md /Users/matheus/PESSOAL/guia-projetos/kit/.claude/commands/nova-tela-fe.md ; echo "exit=$?"
```
Expected: nenhum match (8000 e domínio eliminados; stack/compliance parametrizados).
- [ ] **Step 5** — Commit:
```bash
git add kit/.claude/commands/melhorar-prototipo.md kit/.claude/commands/nova-tela-fe.md && git commit -m "feat(commands): melhorar-prototipo evoluído+cadillac-aware; nova-tela-fe parametrizado"
```

---

### Task 9 — Reposicionar `html-prototype` (coexistir, superseded) + régua 12/12 no checklist

**Files:**
- Modify: `kit/.claude/skills/html-prototype/SKILL.md`
- Modify: `kit/docs/frontend/html-prototype-checklist.md`

- [ ] **Step 1** — `html-prototype/SKILL.md`: estreitar a description p/ o nicho legado single-showcase, SEM colidir com criar-prototipo. Nova description (trigger-only):
```yaml
description: Use APENAS para um protótipo legado de TELA ÚNICA (single-showcase) rápido. Para protótipos multi-tela/multi-papel/hub (modelo cadillac) use criar-prototipo (default). Skill mantida por compatibilidade — "superseded" pelo criar-prototipo.
```
Adicionar no topo do corpo um aviso "> **Superseded:** o caminho default para protótipos é `/criar-prototipo`. Esta skill cobre só o caso single-showcase legado."
- [ ] **Step 2** — `html-prototype-checklist.md`: **autorar a régua canônica 12/12** numa seção `## §6 — Régua de conformância (12/12)`. 12 itens genéricos; os 2 eixos de domínio entram como itens OPCIONAIS marcados "(opt-in)". Itens (sementes da síntese, genéricos):
  1. Carrega via 1 `index.html` consolidado; React 18 UMD + Babel standalone.
  2. Ordem de load preservada (i18n→i18n-chrome→ui→nav→registry→device-frame→showcase→app-shell→screens→app).
  3. Cada tela = 1 IIFE; hooks no topo; sem 2 funções top-level colidindo.
  4. `?v=` cache-bust em toda tag local + iframe do hub.
  5. Registry `window.<DS>Screens` + `registerScreen`/`getScreen` + `ScreenBoundary`.
  6. Device-frame fit-to-stage (ResizeObserver) responsivo; `100dvh`/safe-center.
  7. Design tokens só na camada `tokens.css`/`ds.jsx`; device/chrome via merge, sem tocar canônico.
  8. i18n estrutura presente (merge não-destrutivo); locales configuráveis (default pt-BR+en).
  9. Showcase/hub: `PROTOS[]` manifesto coerente; `wip:true` = placeholder.
  10. Sem segredos/PII logados (conforme `{{COMPLIANCE_REQS}}`).
  11. Console limpo ao servir (zero erro).
  12. Motor não-editado: só `ds.jsx`/`screens.jsx`/tokens mudam; `engine.jsx`/`templates/` intactos.
  - (opt-in A) Cor semântica reservada nunca vira CTA (`{{RESERVED_SEMANTIC_TOKEN}}`/`{{ADR_REF}}`).
  - (opt-in B) White-label: marca com fonte única `brandFor()`; shell nunca mostra marca do fornecedor.
- [ ] **Step 3** — Genericizar a cauda pós-ship (item #15, linhas ~41,54,86-95): `#cliente`/path datado/`feedback-vitrine-prototipos`/`<seu-repo-de-vitrine>`/decisão-entrevista pt-BR-only → "após ship, reflita as telas aprovadas no showcase consolidado, suba `?v=`, redeploy"; i18n "estrutura obrigatória, lista de locales configurável".
- [ ] **Step 4** — GREEN por grep:
```bash
grep -rniE "breakweb|manila|#cliente|janela 24|2026-05-20-cliente" /Users/matheus/PESSOAL/guia-projetos/kit/docs/frontend/html-prototype-checklist.md /Users/matheus/PESSOAL/guia-projetos/kit/.claude/skills/html-prototype/SKILL.md ; echo "exit=$?"
```
Expected: nenhum match.
- [ ] **Step 5** — Commit:
```bash
git add kit/.claude/skills/html-prototype/SKILL.md kit/docs/frontend/html-prototype-checklist.md && git commit -m "feat(kit): html-prototype superseded; régua 12/12 canônica no checklist"
```

---

### Task 10 — Docs do método: guia/03, guia/05, guia/00

**Files:**
- Modify: `guia/03-prototipo-frontend.md`, `guia/05-skills-e-commands.md`, `guia/00-visao-geral.md`

- [ ] **Step 1** — `guia/03-prototipo-frontend.md`: substituir a narrativa single-showcase (seções "O index.html (orquestrador)", "O Showcase", "Como servir e revisar" com porta fixa, "Aprovação canônica" 1-por-task, "Como adaptar > Telas do domínio") pela do **modelo cadillac multi-superfície** (consolidado + hub + registry; servir raiz + porta-livre; uma aprovação por superfície). Atualizar "Skills e commands de apoio", "Arquivos no kit", "Cross-referências" p/ incluir criar/incrementar.
- [ ] **Step 2** — `guia/03`: adicionar a seção **"Galeria de exemplos vivos"** (ponteiro, decisão #2) com 1 linha cada:
  - manila = split multi-papel + white-label (`brandFor`/variants).
  - cadillac-delivery = device-frame/registry de origem (domínio food-delivery).
  - nutri = mesmo motor, domínio saúde (app paciente / painel nutri / PWA).
  - + "o exemplo neutro embarcado vive em `criar-prototipo/examples/minimal/`".
- [ ] **Step 3** — `guia/05-skills-e-commands.md`: atualizar a tabela "As SKILLS" (adicionar `criar-prototipo`, `incrementar-prototipo`; reposicionar `html-prototype` como legado single-showcase) e "Os COMMANDS" (`/iniciar-prototipo` porta-livre+hub, `/melhorar-prototipo` cadillac-aware). Atualizar "Arquivos no kit" e "Cross-referências".
- [ ] **Step 4** — `guia/00-visao-geral.md`: ajustar a descrição do Pilar 3 (protótipo HTML+JSX como fonte de verdade visual) p/ refletir o modelo cadillac (toque leve).
- [ ] **Step 5** — GREEN por grep:
```bash
grep -rniE "breakweb|manila|8765 fixo|porta fixa" /Users/matheus/PESSOAL/guia-projetos/guia/03-prototipo-frontend.md /Users/matheus/PESSOAL/guia-projetos/guia/05-skills-e-commands.md /Users/matheus/PESSOAL/guia-projetos/guia/00-visao-geral.md ; echo "exit=$?"
grep -liE "criar-prototipo|incrementar-prototipo" /Users/matheus/PESSOAL/guia-projetos/guia/03-prototipo-frontend.md /Users/matheus/PESSOAL/guia-projetos/guia/05-skills-e-commands.md   # esperado: ambos citam
```
- [ ] **Step 6** — Commit:
```bash
git add guia/03-prototipo-frontend.md guia/05-skills-e-commands.md guia/00-visao-geral.md && git commit -m "docs(guia): cadillac substitui single-showcase; galeria-ponteiro; tabelas das 4 skills/commands"
```

---

### Task 11 — ADAPTACAO.md (placeholders) + INSTALL.md (cópia + verificação cadillac)

**Files:**
- Modify: `guia/ADAPTACAO.md`, `guia/INSTALL.md`

- [ ] **Step 1** — `ADAPTACAO.md`: estender a seção de placeholders além de `{{PROJECT_NAME}}`. Registrar as **2 camadas** (install-time `{{...}}` vs scaffold-time `__...__`) e a lista nova: `{{DEFAULT_PROTO_PORT}}`, `{{LOCALES}}` (default `pt-BR,en`), `{{PROJECT_DS}}`/`{{ROLE}}`, `{{CENTRAL_TOKENS_DOC}}`, `{{PRODUCT_STACK}}`/`{{BACKEND_LAYER}}`/`{{COMPLIANCE_REQS}}`/`{{REFERENCE_PROTOTYPE}}`, e os blocos OPCIONAIS (white-label: `{{TENANT_BRAND}}` etc.; cor-reservada: `{{RESERVED_SEMANTIC_TOKEN}}`/`{{RESERVED_MEANING}}`/`{{ADR_REF}}`). Cada um: o que é, default, quando ativar.
- [ ] **Step 2** — `INSTALL.md`: adicionar ao passo de cópia as skills novas (`criar-prototipo/` com `templates/`+`examples/`+`references/`, `incrementar-prototipo/`).
- [ ] **Step 3** — `INSTALL.md`: trocar o passo de verificação p/ **exercitar o cadillac**: servir `criar-prototipo/examples/minimal/` numa porta livre e checar 200 + console limpo (auto-teste do motor):
```bash
cd .claude/skills/criar-prototipo/examples/minimal && P=8765; while lsof -ti :$P >/dev/null 2>&1; do P=$((P+1)); done
python3 -m http.server $P >/tmp/min.log 2>&1 & SRV=$!; sleep 0.5
curl -sI http://localhost:$P/ | head -1   # esperado: HTTP/1.0 200 OK
kill $SRV
```
- [ ] **Step 4** — GREEN por grep:
```bash
grep -rniE "breakweb|manila|/Users/matheus" /Users/matheus/PESSOAL/guia-projetos/guia/ADAPTACAO.md /Users/matheus/PESSOAL/guia-projetos/guia/INSTALL.md ; echo "exit=$?"
grep -c "{{DEFAULT_PROTO_PORT}}\|criar-prototipo" /Users/matheus/PESSOAL/guia-projetos/guia/ADAPTACAO.md /Users/matheus/PESSOAL/guia-projetos/guia/INSTALL.md
```
- [ ] **Step 5** — Commit:
```bash
git add guia/ADAPTACAO.md guia/INSTALL.md && git commit -m "docs(guia): ADAPTACAO registra placeholders cadillac (2 camadas); INSTALL copia+verifica o motor"
```

---

### Task 12 — GREEN decisivo: clone-smoke clean-room (PROVA de portabilidade)

> Este é o teste de integração que prova "funciona pra qualquer clone+install". Usa **subagentes clean-room** (superpowers:subagent-driven-development) que só enxergam o que o install copiou.

**Files:**
- Create: `/tmp/kit-smoke/` (projeto descartável NOVO)
- Create (evidência): `docs/superpowers/plans/evidence/2026-06-20-GREEN-clone-smoke.md`

- [ ] **Step 1** — Clone descartável + install conforme INSTALL.md (só o payload):
```bash
rm -rf /tmp/kit-smoke && mkdir -p /tmp/kit-smoke && cd /tmp/kit-smoke && git init -q
cp -R /Users/matheus/PESSOAL/guia-projetos/kit/.claude /tmp/kit-smoke/.claude
cp -R /Users/matheus/PESSOAL/guia-projetos/kit/prototipos_html /tmp/kit-smoke/prototipos_html
cp -R /Users/matheus/PESSOAL/guia-projetos/kit/docs /tmp/kit-smoke/docs
```
- [ ] **Step 2** — **Gate de neutralidade** (zero vazamento de domínio no que foi instalado):
```bash
grep -rniE "breakweb|manila|whatsapp|janela 24|pizzaria|grazi|/Users/matheus|spring boot|shadcn" /tmp/kit-smoke/.claude /tmp/kit-smoke/docs ; echo "exit=$? (esperado 1 = nenhum match)"
```
Expected: nenhum match. Se houver, é REFACTOR (Task 13).
- [ ] **Step 3** — Subagente clean-room A (domínio NOVO, ex.: "app de check-in de academia" ou "catálogo de biblioteca" — diferente de delivery/CRM/nutri/saúde): pedir `/criar-prototipo` só com o que está em `/tmp/kit-smoke`. Verificar que gera um consolidado em `prototipos_html/<data>-<nome>/` com `index.html` + motor via `templates/`.
- [ ] **Step 4** — Servir via a lógica do `/iniciar-prototipo` (porta-livre + raiz/hub) e checar **console limpo**:
```bash
cd /tmp/kit-smoke/prototipos_html && P=8765; while lsof -ti :$P >/dev/null 2>&1; do P=$((P+1)); done
python3 -m http.server $P >/tmp/smoke.log 2>&1 & SRV=$!; sleep 0.6
curl -sI http://localhost:$P/ | head -1   # 200
```
Usar Claude Preview MCP (preview_start + preview_console_logs) p/ confirmar zero erro de console no consolidado novo. `kill $SRV` ao fim.
- [ ] **Step 5** — Subagente clean-room B: `/incrementar-prototipo` fundindo uma 2ª tela no consolidado do step 3. Verificar delta cirúrgico (registry ganhou a tela, `?v=` subiu, motor intacto), servir, console limpo.
- [ ] **Step 6** — Conferir a régua 12/12 (Task 9 §6) item-a-item contra o consolidado gerado. Registrar 12/12 (menos opt-ins, que ficam N/A neste domínio neutro).
- [ ] **Step 7** — Registrar evidência (saídas dos steps 2,4,6 + nomes dos consolidados) em `evidence/2026-06-20-GREEN-clone-smoke.md`. Commit:
```bash
cd /Users/matheus/PESSOAL/guia-projetos && git add docs/superpowers/plans/evidence && git commit -m "test: GREEN clone-smoke — criar+incrementar num domínio novo, console limpo, porta-livre, 12/12"
```

---

### Task 13 — REFACTOR + regressão do kit + verification-before-completion

**Files:**
- Modify: o que o clone-smoke apontar (leakage residual, console error, hub não abrindo, routing confuso)

- [ ] **Step 1** — Para cada falha do Task 12: aplicar o counter mínimo (fechar loophole de leakage / corrigir console error / ajustar description-routing), recommit, **re-rodar o clone-smoke do zero** (rm -rf /tmp/kit-smoke). Repetir até bulletproof.
- [ ] **Step 2** — Regressão: testes existentes do kit ainda passam (runner = script, NÃO pytest):
```bash
cd /Users/matheus/PESSOAL/guia-projetos/kit/.claude/hooks
python3 test_context_control_watchdog.py   # 6 / 6 passed
python3 test_vitrine_sync_reminder.py      # 9/9 PASS
bash /Users/matheus/PESSOAL/guia-projetos/kit/scripts/smoke-template.sh   # SMOKE OK
```
Expected: todos passam (igual ao baseline da Task 0: watchdog 6/6, vitrine 9/9, smoke OK).
- [ ] **Step 3** — Teste de roteamento (CSO): num clone limpo, confirmar que um pedido de "protótipo multi-tela novo" roteia p/ `criar-prototipo`, "adicionar tela ao protótipo" p/ `incrementar-prototipo`, "tela única rápida legada" p/ `html-prototype` — sem ambiguidade (descriptions disambiguantes funcionam).
- [ ] **Step 4** — **verification-before-completion**: montar a tabela evidência-por-critério da Definição de Pronto (abaixo), cada linha com o comando + saída real. Só então declarar pronto.
- [ ] **Step 5** — Commit final + execute-closure (disciplina manual, sem watchdog neste repo):
```bash
git add -A && git commit -m "refactor: fecha loopholes do clone-smoke; regressão verde; port cadillac concluído"
```

---

## Definição de Pronto (evidência por critério — verification-before-completion)

| Critério | Evidência (comando) | Esperado |
|---|---|---|
| Kit NEUTRO (zero domínio) | `grep -rniE "breakweb\|manila\|whatsapp\|janela 24\|pizzaria\|grazi" kit/.claude kit/docs` | nenhum match |
| criar-prototipo instalado e completo | `ls kit/.claude/skills/criar-prototipo/{SKILL.md,references,templates,examples/minimal}` | 8 templates + 5 minimal + 2 refs |
| incrementar-prototipo instalado | `ls kit/.claude/skills/incrementar-prototipo/{SKILL.md,references/incremento-delta.md}` | presentes |
| Portabilidade PROVADA | clone-smoke Task 12 (criar+incrementar, domínio novo) | console limpo, porta-livre OK, 12/12 |
| iniciar-prototipo porta-livre | sweep test Task 7 step 7 | "sweep escolheu 8766" |
| settings.json libera tokens.css | `grep -c "Read(\*\*/\*token\*)" kit/.claude/settings.json` | 0 |
| Conformância cadillac (régua 12/12) | checklist §6 conferido no consolidado gerado | 12/12 (opt-ins N/A) |
| Testes do kit ainda passam | `python3 test_*.py` (script) + smoke-template.sh | verde (watchdog 6/6, vitrine 9/9, smoke OK) |
| Roteamento CSO sem ambiguidade | Task 13 step 3 | cada pedido → skill certa |
| Docs refletem cadillac | `grep -l criar-prototipo guia/03 guia/05 guia/ADAPTACAO.md guia/INSTALL.md` | todos citam |

---

## Notas de execução

- **Lealdade ao motor:** nas tasks 2-6, copiar verbatim primeiro, depois aplicar SÓ os edits do inventário. Não reescrever engine.
- **Disciplina manual:** este repo não tem watchdog. Commits frequentes (1 por task) são o ledger.
- **Galeria:** nunca copiar manila/cadillac/nutri pro kit — só ponteiro em guia/03.
- **Ordem:** Task 1 (settings) cedo p/ desbloquear tokens.css. Tasks 2-6 são o motor (sequenciais por dependência de pasta). Tasks 7-11 paralelizáveis. Task 12 só depois de tudo. Task 13 fecha.
