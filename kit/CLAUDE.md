# {{PROJECT_NAME}} — instruções sempre-on

Responda em PT-BR, direto ao ponto, com checklist curto e riscos objetivos.
Perguntas somente quando bloquearem execução.

## Stack oficial
<!-- Preencha com a stack real do projeto. Exemplo: -->
- Backend: {{ex.: Supabase / Node / ...}}
- Frontend: {{ex.: Flutter + Riverpod / Next.js + Tailwind / ...}}
- Banco: {{ex.: Postgres 15}}
- Infra: {{ex.: Supabase Cloud + Vercel}}

## Arquitetura
{{Descreva superfícies, integrações externas e decisões macro. Cite os ADRs.}}

## Invariantes críticas
<!-- Regras de domínio que NENHUMA task pode violar. Cite o ADR de cada uma. -->
- {{invariante 1 (ADR-XXXX)}}
- {{invariante 2 (ADR-XXXX)}}
- **Glossário canônico:** termos do domínio em PT-BR (ver `docs/CONTEXT.md`).

## Processo obrigatório
Antes de qualquer edição no repo, siga `AGENTS.md`. Ignore somente com `/no-control`.

Antes de executar tarefa não-trivial:
1. Entre em plan mode.
2. Chame AskUserQuestion para validar o plano.
3. Ajuste conforme respostas antes de editar.

## Formato de plano obrigatório
Ao final de toda elaboração de plano, entregue bloco `# Resumo do plano` com:
- **O QUÊ** (entrega em 2-4 bullets)
- **POR QUÊ** (motivação e constraints)
- **COMO** (sequência numerada, citando arquivos)
- **RISCOS** (impacto + mitigação; se nenhum: "nenhum identificado")

## Frontend: protótipo HTML+JSX como fonte de verdade visual
1. Antes de tocar código de produção, protótipo em `prototipos_html/<task-id>/`
   (orquestrador React 18 + Babel standalone + components/*.jsx).
2. Cobrir todos os estados: default, hover, focus, active, disabled, loading, empty, error.
3. Tokens via CSS variables (`:root` light + `[data-theme="dark"]`); zero hex/px mágicos.
4. i18n centralizada.
5. Showcase com switchers (views/idiomas/temas/plataformas).
6. Aprovação canônica do protótipo antes de portar para o stack real.
Checklist: `docs/frontend/html-prototype-checklist.md`.

## Código
- SRP sempre; OCP e DIP apenas quando explicitamente necessário.
- Solução direta; zero abstrações especulativas.
- Sem comentários óbvios — somente quando o WHY for não-óbvio.
- Nomes completos alinhados ao domínio; sem abreviações soltas.

## Segurança / LGPD
- Não logar dados pessoais, tokens, segredos, .env ou credenciais.
- Deny list em `.claude/settings.json` cobre arquivos sensíveis.

## Roadmap
- `docs/ROADMAP.md` (índice) + `docs/roadmap/E##-<slug>.md` por épico
  + `docs/roadmap/E##/T##.NN-<slug>.md` por task.

## Docs de referência
- `docs/CONTEXT.md` — glossário do domínio (termos canônicos)
- `docs/adr/` — Architecture Decision Records
- `docs/frontend/html-prototype-checklist.md`

## Skills obrigatórias por gatilho
- **Início de projeto / novo ADR:** `grill-with-docs` antes de registrar decisão de design.
- **Feature com ≥ 2 arquivos:** `superpowers:writing-plans` para o plano detalhado.
- **Nova tela/fluxo de frontend:** `/nova-tela-fe`.
- **Brainstorming antes de criar feature:** `superpowers:brainstorming`.
