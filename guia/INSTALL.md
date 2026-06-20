# INSTALL — instalar o método num projeto novo

> Leitor: um **agente**. Execute na ordem. O **Passo 3 (verificação)** é obrigatório —
> ele PROVA que o gate funciona. Não declare a instalação concluída sem ele.
> Notação: `KIT` = este diretório `kit/`; `PROJ` = a raiz do projeto novo.

## Pré-requisitos
- **Python 3** no PATH (os hooks são stdlib puro · zero deps).
- **Node 18+** apenas se for usar o painel vivo (`scripts/gen-painel.mjs`).
- Claude Code com suporte a hooks, skills e commands de projeto (`.claude/`).

## Passo 0 — decidir o escopo
- **Núcleo (sempre):** controle + watchdog + plan-summary-enforcer + 4 templates + ciclo + execute-closure + CONTEXT/ADR/STATE.
- **Módulos opcionais:** Frontend (protótipo HTML+JSX — modelo cadillac via `criar-prototipo`/`incrementar-prototipo`, + `html-prototype` legado), Roadmap-tracking (roadmap-sync + painel), Vitrine.
- Como desligar cada módulo: ver [ADAPTACAO.md](ADAPTACAO.md) › "Módulos opcionais".

## Passo 1 — copiar a estrutura
A partir da raiz do projeto novo:
```bash
# núcleo
cp -R  KIT/.claude            PROJ/.claude
cp     KIT/AGENTS.md          PROJ/AGENTS.md
cp     KIT/CLAUDE.md          PROJ/CLAUDE.md
mkdir -p PROJ/controle
cp -R  KIT/controle/_TEMPLATE PROJ/controle/_TEMPLATE
cp     KIT/controle/README.md PROJ/controle/README.md
cp -R  KIT/docs               PROJ/docs

# frontend (opcional)
cp -R  KIT/prototipos_html    PROJ/prototipos_html

# roadmap/painel/smoke (opcional)
cp -R  KIT/scripts            PROJ/scripts

# tornar executáveis
chmod +x PROJ/.claude/hooks/*.py PROJ/scripts/*.sh 2>/dev/null || true
```

> **Skills de protótipo (modelo cadillac):** o `cp -R KIT/.claude PROJ/.claude` acima já
> traz as skills novas — confira que vieram inteiras (motor + exemplo + referências):
> ```bash
> ls PROJ/.claude/skills/criar-prototipo/{SKILL.md,templates,examples/minimal,references}   # 8 templates + 5 minimal + cadillac-model.md
> ls PROJ/.claude/skills/incrementar-prototipo/{SKILL.md,references/incremento-delta.md}
> ```
> `templates/` e `examples/minimal/` são **copiados, nunca editados in-place** (na adaptação
> você só toca `ds.jsx`/`screens.jsx`/tokens — `engine.jsx`/`templates/` ficam intactos).

## Passo 2 — adaptar (detalhe em ADAPTACAO.md)
1. **CLAUDE.md** — preencher `{{PROJECT_NAME}}`, a stack oficial, as invariantes críticas (cada uma citando seu ADR) e o glossário.
2. **Hooks** — revisar o bloco `# ===== CONFIG =====` no topo de `context-control-watchdog.py` (mínimo: nada é obrigatório; `STATE_NAMESPACE` é opcional pois o estado é keyado por hash do root).
3. **Vitrine** (se usar) — editar `SURFACES` e `VITRINE_DEPLOY_TARGET` em `vitrine-sync-reminder.py`.
4. **Docs** — preencher `docs/CONTEXT.md` (glossário) e `docs/ROADMAP.md` (índice). `docs/roadmap/painel-data.json` já vem com um seed válido.
5. **Limpar módulos não usados** do `settings.json` (ver ADAPTACAO.md).

## Passo 3 — VERIFICAÇÃO (obrigatória)
Rode tudo abaixo. Qualquer falha = instalação NÃO concluída.

```bash
# 3a. sintaxe de todos os hooks
python3 -m py_compile PROJ/.claude/hooks/*.py && echo "hooks compilam"

# 3b. testes do gate — provam deny-sem-aprovação e allow-após-aprovação
python3 PROJ/.claude/hooks/test_context_control_watchdog.py   # esperado: 6 / 6 passed
python3 PROJ/.claude/hooks/test_vitrine_sync_reminder.py      # esperado: todos PASS (se usar vitrine)

# 3c. settings.json é JSON válido
python3 -c "import json,sys; json.load(open('PROJ/.claude/settings.json')); print('settings.json OK')"

# 3d. painel gera sem erro (se usar)
node PROJ/scripts/gen-painel.mjs && echo "painel OK"

# 3e. auto-teste do MOTOR cadillac (se usar frontend) — serve o exemplo neutro
#      numa porta livre e confirma 200. Prova que o motor portado roda standalone.
cd PROJ/.claude/skills/criar-prototipo/examples/minimal && P={{DEFAULT_PROTO_PORT}}
while lsof -ti :$P >/dev/null 2>&1; do P=$((P+1)); done
python3 -m http.server $P >/tmp/min.log 2>&1 & SRV=$!; sleep 0.5
curl -sI http://localhost:$P/ | head -1   # esperado: HTTP/1.0 200 OK
kill $SRV
```

> O passo **3e** é o auto-teste do motor: se o `examples/minimal/` (produto "Demo",
> domínio neutro) sobe e responde 200 com console limpo, o cadillac portado está íntegro
> nesse clone. É a contraparte "frontend" da demonstração viva do gate.

**3e. Demonstração viva do gate (in-session, manual):**
1. Declare no chat: `nova tarefa: teste-instalacao - validar gate`.
2. SEM criar `controle/teste-instalacao/`, tente editar um arquivo de produção → o watchdog deve **NEGAR** ("Declare/crie uma task ativa…").
3. Crie `controle/teste-instalacao/` com os 4 arquivos (copie de `_TEMPLATE/`), `ESTADO.md` em `fase: execucao` mas SEM aprovação → tentar editar produção ainda **NEGA** ("Plano ainda nao aprovado" / "Execucao sem aprovacao").
4. Digite `aprovado` (ou `/aprovar-plano`) → edição de produção **LIBERADA**.
5. Só declare a instalação concluída quando observar a transição **deny → allow**.

> Por que isto importa: copiar arquivos não prova que o gate funciona no ambiente real.
> A demonstração viva é a evidência. É o mesmo princípio (verificação antes de concluir)
> que o método aplica em toda task.

## Passo 4 — primeiro uso
Abra a primeira task real: `nova tarefa: <slug> - <descrição>` e siga o ciclo em [AGENTS.md](../kit/AGENTS.md). Para frontend, use `/nova-tela-fe`.

## Manutenção / re-sync
Os hooks e skills são software vivo — evoluem no projeto-fonte. Para atualizar o kit,
re-derive os artefatos da fonte canônica e re-aplique a parametrização (bloco CONFIG).
Rode os testes do Passo 3b após qualquer atualização de hook.
