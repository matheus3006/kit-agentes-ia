# Kit de método de trabalho com agentes de IA

Este repositório **não é uma aplicação** — é um **kit replicável** que captura o método
de trabalho com agentes de IA refinado no projeto Cadillac Delivery, num formato
agnóstico de projeto. Copie-o para qualquer app novo e instale o mesmo jeito de
trabalhar: controle de contexto determinístico, hooks de validação, protótipo visual
antes de codar, documentação viva e as skills/commands que automatizam tudo.

> **Público-alvo:** agentes de IA (que leem e instalam) + você (que confere).
> Para uma visão rápida e visual, abra **[`LEIA-ME.html`](LEIA-ME.html)** no navegador.

## O que tem aqui
```
guia/      A DOCUMENTAÇÃO do método (markdown · leitor = agente)
  00-visao-geral.md      filosofia + os 5 pilares + mapa do kit  ← comece aqui
  01-controle-de-contexto.md
  02-hooks-de-validacao.md
  03-prototipo-frontend.md
  04-sistema-de-documentacao.md
  05-skills-e-commands.md
  INSTALL.md             como instalar num projeto novo (passo-a-passo · auto-verificável)
  ADAPTACAO.md           o que trocar por projeto (CONFIG + placeholders)
kit/       OS ARTEFATOS copiáveis (hooks, skills, commands, templates, scripts)
LEIA-ME.html             overview visual (para leitura humana)
```

## Os 5 pilares (resumo)
1. **Controle de contexto** — toda edição de produção exige uma task ativa, planejada e aprovada em `controle/<task-id>/`. Imposto por um hook que NEGA a edição (não é convenção).
2. **Hooks de validação** — 6 hooks Python (stdlib): 1 guardrail + 1 automação + 1 telemetria + 3 lembretes.
3. **Protótipo HTML+JSX** — antes de codar frontend, um protótipo React+Babel (sem build) cobre todos os estados e é aprovado. Substitui Figma.
4. **Sistema de documentação** — glossário canônico, roadmap com STATE vivo, ADRs, painel gerado, smoke tests.
5. **Skills & commands** — a camada que automatiza o método (`/aprovar-plano`, `/nova-tela-fe`, `execute-closure`, …).

## Como usar
- **Entender:** leia [`guia/00-visao-geral.md`](guia/00-visao-geral.md) e depois 01→05.
- **Instalar num projeto:** siga [`guia/INSTALL.md`](guia/INSTALL.md) — inclui um passo de verificação que **prova** que o gate funciona (testes + demonstração viva deny→allow).
- **Adaptar:** [`guia/ADAPTACAO.md`](guia/ADAPTACAO.md).

## Garantia de qualidade do kit
Os hooks vêm com 2 suítes de teste (stdlib · rodam o hook como subprocesso isolado):
```bash
python3 kit/.claude/hooks/test_context_control_watchdog.py   # 6/6 — o gate bloqueia sem aprovação e libera depois
python3 kit/.claude/hooks/test_vitrine_sync_reminder.py      # todos PASS
```
Ambas passam neste kit, já parametrizado. Rodá-las após instalar é o Passo 3 do INSTALL.

## Origem
Derivado do método do projeto Cadillac Delivery (`AGENTS.md` + `.claude/` + `controle/`).
Os artefatos foram parametrizados (bloco `CONFIG` nos hooks · placeholders `{{...}}`) e
verificados. Para re-sincronizar com melhorias futuras da fonte, ver `guia/INSTALL.md` › Manutenção.
