---
name: incrementar-prototipo
description: >-
  Use quando for CRESCER um protótipo cadillac que JÁ existe — fundir uma nova tela/estado/papel num consolidado existente, sem reescrever o motor. Gatilhos: "adicionar tela ao protótipo", "incrementar", "fundir segunda tela", "nova variante no showcase". Para um protótipo NOVO do zero use criar-prototipo.
---

# Incrementar Protótipo (modelo cadillac)

## Princípio central

Um protótipo **cresce** fundindo trabalho **já aprovado** num consolidado **já aprovado** — reusando o
motor que já roda lá, nunca re-derivando. Esta skill é o eixo **CRESCER**; a irmã `/criar-prototipo` é o
eixo **NASCER**. O que muda ao crescer não é o motor nem a tela em si — é a **integração segura** de um
delta num produto que já existe. Por isso esta skill possui **só o delta**: localizar o alvo → cirurgia de
integração → gate de aprovação do incremento → reflexo na vitrine.

> **Por que reusar e não recriar:** quando o motor (registry/router, device-frame, showcase, casca) foi
> re-derivado à mão nasceu um bug real de hooks-após-return numa tela mobile que travou o app. O consolidado
> alvo já tem o `ScreenBoundary`, a ordem de carga e o fit-to-stage corretos. Crescer reusando-os é o que
> faz o incremento "funcionar sempre". Lealdade ao motor provado > reescrever.

## Quando usar / quando NÃO usar

- **Use** quando um consolidado aprovado existe (ex.: `prototipos_html/{{PROJECT_DS}}-{{ROLE}}/`) e uma
  tela/feature aprovada precisa entrar nele — uma superfície aprovada = 1+ telas coerentes (ex.: um fluxo =
  lista + editor + tabela + drawer).
- **NÃO** para nascer um protótipo/consolidado/papel novo (mesmo que registre num hub existente) →
  `/criar-prototipo`. **NÃO** para refinar/iterar uma tela que já está no consolidado → `/melhorar-prototipo`.
  **NÃO** para portar o aprovado pra stack real (passo de produção, ver `CLAUDE.md`).

## A irmã faz o trabalho pesado (delegação)

**REQUIRED SUB-SKILL: `criar-prototipo`.** A receita de **como escrever a tela** — IIFE única por screen,
hooks sempre no topo (antes de qualquer `return` condicional), os 8 estados, `registerScreen('navKey', C)`,
a divisão ds (edita) ↔ motor (não toca) — é a **camada 3** da `/criar-prototipo`. **Leia/invoque a irmã para
escrever a tela; não reescreva a receita aqui.** Esta skill assume a tela já escrita (ou em escrita pela irmã)
e cobre o que a irmã não cobre: fundi-la com segurança.

## Workflow do incremento (o delta)

1. **Localize o alvo.** Qual consolidado aprovado cresce? Identifique o tipo do motor:
   - **split** (multi-superfície): `_shared-<ds>/` (motor) + `<ds>-<papel>/` (consolidado).
   - **concatenado** (self-contained): um `engine.jsx` + `ds.jsx`/`screens.jsx`. Ex.: `examples/minimal/`.
   - Confirme que o alvo está **aprovado** (LEDGER/memória). Se o consolidado não existe → não é incremento,
     é `/criar-prototipo`.
2. **Garanta a fase certa (watchdog).** Para editar `prototipos_html/` a task que governa o consolidado
   precisa estar em `execucao` — em `verificacao`/`concluida` o Edit é **bloqueado**. Reabra se preciso.
3. **Escreva a tela** — pela camada 3 da `/criar-prototipo` (delegado). Uma IIFE + `registerScreen`.
4. **Faça a cirurgia de integração** — o delta cirúrgico. Os passos exatos (antes/depois de cada arquivo,
   nas duas variantes) estão em **`references/incremento-delta.md`** — leia antes de tocar. Resumo:
   nav-key na árvore `ROLES.nav` · strings no i18n · a screen na ordem de carga (telas **ANTES** do app) ·
   **bump `?v=` em TODA tag local** do consolidado (não só a nova) + no `src` do iframe do hub.
5. **Passe pelo gate de aprovação do incremento** (ver abaixo) — antes de declarar fundido.
6. **Reflita na vitrine.** A tela já vive no consolidado (reflexo inerente). Confirme o hub apontando com
   `?v=` novo; atualize o `ref` da entrada `PROTOS` se a superfície ganhou algo notável. Deploy = decisão do
   founder (AGENTS.md §Vitrine).

## Gate de aprovação do incremento (disciplina)

Crescer toca um produto **já aprovado** — fundir cedo demais contamina o que estava validado. Antes de
declarar o incremento fundido:

- Sobe no preview **sem erro de console** (`preview_console_logs level=error` → "No console logs").
- Os **8 estados** da nova tela + **dark/light** + **mobile** (device-frame **e** chrome colapsado) conferidos.
- **Conformância 12/12 mantida** (lista abaixo) — o delta não pode regredir nenhum eixo do consolidado.
- **Screenshot** do(s) estado(s)-chave + **aprovação explícita do founder** registrada no LEDGER da task.

Sem o OK explícito, a tela fica no consolidado mas o incremento **não** está fechado. Não pule o gate só
porque "a tela isolada já foi aprovada" — o que se aprova aqui é a **fusão**, não a tela solta. E
**verificar que sobe limpo ≠ incremento aprovado**: console limpo + 8 estados são pré-requisito do gate,
não o gate. "Eu testei e funciona" não fecha a fusão — só o OK explícito do founder, registrado no LEDGER.

## Conformância (12/12 — herdada, não regredir)

A régua canônica 12/12 vive em `docs/frontend/html-prototype-checklist.md` §6 — o delta **não pode regredir
nenhum eixo** do consolidado. Eixos-chave herdados: hooks no topo · ordem de carga load-bearing · 1 IIFE por
screen · `ScreenBoundary key` · `?v=` em toda tag local · device-frame fit-to-stage · single-pane real onde
mobile é uso real · `100dvh` · colapso responsivo do chrome · i18n sem string solta. Invariantes **opt-in**
(só se o produto tiver o atributo): identidade white-label numa fonte só (`brandFor`); cor semântica reservada
nunca vira CTA — ver `criar-prototipo` §Invariantes.

## Gotchas (cada um mordeu de verdade)

| Gotcha | Por quê | Faça |
|--------|---------|------|
| **`prototipos_html/` só editável em `execucao`** | O watchdog bloqueia Edit lá em `verificacao`/`concluida`. | Reabra a task que governa o consolidado antes de fundir. |
| **`?v=` parcial** | Bumpar só a tag nova deixa o browser servir o motor/telas em cache → você revisa código velho. | Bump `?v=` em **todas** as tags locais do consolidado + iframe do hub. |
| **Screen depois do app** | A tela precisa estar registrada antes do `app.jsx` renderizar. | Insira `screens/screen-*.jsx` **antes** de `app.jsx` na ordem de carga. |
| **2º componente no topo** | Babel standalone compartilha escopo global → "already declared". | 1 IIFE por screen (a IIFE isola o escopo). |
| **`tokens.css` via Edit** | O deny de `Read` foi estreitado para segredos reais, então `tokens.css`/`tokens.jsx` já são legíveis e o Edit normal funciona. | Edite via Edit normalmente; se o deny de `Read` ainda pegar o arquivo no seu install, o append (Bash/python) ou `<style>` continua como alternativa. |
| **ResizeObserver inerte no preview headless** | `ScaledDevice` mede 0 → device não aparece no modo produto. É do ambiente, não bug. | Verifique mobile pelo showcase+`DeviceFrame` ou `preview_resize` + inspeção de classes. |

## Verificação

Igual ao gate acima: preview sem erro de console · 8 estados/dark/mobile · 12/12 mantida · screenshot ·
aprovação no LEDGER. **Auto-teste:** se o consolidado subia limpo antes e quebra depois do incremento, o
problema está no **seu delta** (tela/cirurgia), não no motor — reverta o último passo e isole.

## Ponteiros

- **`references/incremento-delta.md`** — o "diff" exato das cirurgias (concatenado **e** split), com
  antes/depois de cada arquivo. **Leia antes da cirurgia.**
- A irmã `criar-prototipo`: `SKILL.md` (camada 3 = como escrever a tela) · `references/cadillac-model.md`
  (motor destrinchado + CSS responsivo) · `examples/minimal/` (base reusada por esta skill).
- Exemplo embarcado (concatenado): `criar-prototipo/examples/minimal/`. Variante split: `_shared-<ds>/`
  (motor) + `<ds>-<papel>/` (consolidado por papel) + hub `prototipos_html/index.html`.
- Gate de frontend: `docs/frontend/html-prototype-checklist.md` · processo: `AGENTS.md`.
