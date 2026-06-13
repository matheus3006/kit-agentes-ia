# Método de trabalho com agentes — visão geral

> Este kit captura, de forma replicável e agnóstica de projeto, o método de trabalho
> com agentes de IA refinado no projeto Cadillac Delivery. O leitor-alvo é um **agente**
> que vai instalar e operar o método num projeto novo. Tudo em PT-BR.

## A ideia central
Agentes de IA são poderosos mas têm dois problemas crônicos: **amnésia** (esquecem o
contexto entre sessões) e **deriva de escopo** (editam além do combinado, sem plano).
O método resolve isso com **trilhos determinísticos impostos por hooks** — não por
disciplina ou boa vontade. Um hook que NEGA a edição é a diferença entre "convenção
que se esquece" e "trilho que não deixa sair".

Princípio que atravessa tudo: **evidência antes de afirmação**. Nada fecha sem prova;
o diário (LEDGER) nunca fica atrás do código; a doc derivada (painel) é gerada, não
escrita à mão; a própria instalação do kit é auto-verificável.

## Os 5 pilares
| # | Pilar | O que é | Guia |
|---|-------|---------|------|
| 1 | **Controle de contexto** | Toda edição de produção exige uma task ativa, planejada e aprovada em `controle/<task-id>/` (4 arquivos + 7 fases). Imposto pelo watchdog. | [01](01-controle-de-contexto.md) |
| 2 | **Hooks de validação** | 6 hooks Python (stdlib) plugados em eventos do Claude Code: 1 guardrail que bloqueia, 1 automação, 1 telemetria, 3 lembretes. | [02](02-hooks-de-validacao.md) |
| 3 | **Protótipo HTML+JSX** | Antes de tocar código de produção de frontend, um protótipo React+Babel standalone (sem build) cobre todos os estados visuais e é aprovado. Substitui Figma. | [03](03-prototipo-frontend.md) |
| 4 | **Sistema de documentação** | Glossário canônico (CONTEXT.md), roadmap com STATE.md vivo por épico, ADRs numerados, painel gerado de JSON, smoke tests. | [04](04-sistema-de-documentacao.md) |
| 5 | **Skills & commands** | A camada de UX que automatiza o método: skills (execute-closure, html-prototype, mermaid-flow), commands (/aprovar-plano, /nova-tela-fe, …) e o subagent researcher. | [05](05-skills-e-commands.md) |

## Como os pilares se encaixam
1. O **Pilar 1** é o núcleo — sem ele nada funciona. É o ciclo de vida da task.
2. O **Pilar 2** é o que torna o Pilar 1 determinístico (o watchdog) + reforços anti-deriva.
3. O **Pilar 3** é o trilho específico de frontend, que entra na fase de planejamento/execução do Pilar 1.
4. O **Pilar 4** é a memória de longo prazo do projeto (entre tasks e entre sessões).
5. O **Pilar 5** é o tecido que aciona tudo na ordem certa.

## Fluxo de uma task, do início ao fim
```
nova tarefa: <slug> - <desc>          (declara · watchdog registra)
  └─ fase: limites        → LIMITES.md (escopo + ACs)
  └─ fase: planejamento   → PLANO.html (O QUÊ/POR QUÊ/COMO/RISCOS)
  └─ fase: aprovacao      → apresenta ao humano (AskUserQuestion)
       humano digita "aprovado" / /aprovar-plano
  └─ fase: execucao       → edições liberadas; (frontend: protótipo → aprovação → port)
  └─ fase: verificacao    → cada AC com evidência no LEDGER
  └─ fase: concluida      → skill execute-closure (propaga roadmap/painel/vitrine)
```

## Mapa do kit
```
guia/                         ← VOCÊ ESTÁ AQUI (a documentação do método)
  00-visao-geral.md           este arquivo
  01..05-*.md                 um guia por pilar
  INSTALL.md                  como instalar num projeto novo (auto-verificável)
  ADAPTACAO.md                o que trocar por projeto (CONFIG + placeholders)
kit/                          ← os artefatos copiáveis
  AGENTS.md                   o protocolo de controle (constituição do ciclo)
  CLAUDE.md                   template de instruções sempre-on (preencher por projeto)
  .claude/
    settings.json             wiring dos hooks + deny-list de segredos
    hooks/                    6 hooks + 2 suítes de teste
    skills/                   execute-closure · html-prototype · mermaid-flow
    commands/                 aprovar-plano · no-control · nova-tela-fe · iniciar-prototipo · melhorar-prototipo
    agents/researcher.md      subagent read-only de pesquisa
  controle/_TEMPLATE/         os 4 arquivos-modelo de task
  prototipos_html/_template/  base do protótipo HTML+JSX
  docs/                       templates: CONTEXT · ROADMAP · adr/0000 · roadmap/E0X/STATE · frontend/checklist
  scripts/                    gen-painel.mjs · smoke-template.sh · check-pii-logs.sh
```

## Por onde começar
- Para **instalar** num projeto: vá direto para [INSTALL.md](INSTALL.md).
- Para **entender** antes de instalar: leia 01 → 02 → 03 → 04 → 05 nesta ordem.
- Para **adaptar**: [ADAPTACAO.md](ADAPTACAO.md).
