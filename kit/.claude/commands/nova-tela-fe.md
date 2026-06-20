---
description: Roteiro guiado para nova tela/fluxo de frontend — prototipo HTML+JSX (Babel standalone) -> implementacao.
---

Conduza o desenvolvimento de nova tela seguindo `docs/frontend/html-prototype-checklist.md`.

Substituimos a etapa Figma por um prototipo HTML+JSX:
React 18 + Babel standalone via CDN + components/*.jsx separados por dominio.
Isso permite revisao visual imediata sem dependencia de tooling pesado.

> **Modelo cadillac (default):** para o prototipo multi-tela/multi-papel use
> `/criar-prototipo` (novo consolidado) ou `/incrementar-prototipo` (crescer um
> existente). Este roteiro descreve a etapa de prototipo -> implementacao;
> delegue a geracao do consolidado a essas skills.

Constante de porta: `{{DEFAULT_PROTO_PORT}}` (default `8765`).

Protocolo:

1. Abra task de controle: crie `controle/<task-id>/` com LIMITES.md, PLANO.html,
   ESTADO.md (fase: limites), LEDGER.md.

2. Fase 1 — Prototipo HTML+JSX:
   Crie `prototipos_html/<task-id>/index.html` (orquestrador React 18 + Babel
   standalone) e `prototipos_html/<task-id>/components/*.jsx` separados por
   dominio (ui, data, i18n, screens, app).
   Use `prototipos_html/_template/` como ponto de partida.
   Cubra todos os estados: default, hover, focus, active, disabled, loading,
   empty, error.
   Tokens via CSS variables (:root light + [data-theme="dark"]).
   i18n centralizada (pt-BR default).
   Showcase com tabs/switchers para alternar entre views, idiomas, temas.
   Sirva localmente via `/iniciar-prototipo` (porta-livre a partir de
   `{{DEFAULT_PROTO_PORT}}`; serve a raiz de `prototipos_html/` e abre o hub).
   Peca aprovacao explicita ao usuario. Sem aprovacao, pare.

3. Fase 2 — Plano de implementacao no projeto real:
   Mapeie componentes do prototipo para o stack real do projeto:
   `{{PRODUCT_STACK}}` (frontend; ver CLAUDE.md > Stack) e, se houver,
   `{{BACKEND_LAYER}}` (camada de dados/BFF que a tela vai consumir).
   Nao assuma stack: leia o que o projeto declara.
   Liste tokens (color/space/radius/type) e modos.
   Quando portar uma tela ja aprovada, parta de `{{REFERENCE_PROTOTYPE}}`
   (default `_template`) como referencia; o resto e' stub.
   Preencha PLANO.html > Mapeamento Prototipo -> Producao.
   Peca aprovacao canonica (aprovado | /aprovar-plano).

4. Fase 3 — Implementacao no projeto:
   Reproduza o prototipo no stack oficial. Tokens via arquivo central de tema;
   nunca hex/px magicos espalhados pelos componentes.
   Acessibilidade WCAG AA; foco visivel; ordem de tabulacao logica.
   Seguranca: nao logar PII/segredos conforme o regime de privacidade do
   projeto (`{{COMPLIANCE_REQS}}`); sem token nem segredo em log.

5. Verificacao:
   Todos os ACs do LIMITES.md evidenciados no LEDGER.md.
   Snapshot lado-a-lado (prototipo vs implementacao) no LEDGER.
   ESTADO.md em fase: concluida.
