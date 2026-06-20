---
description: Workflow guiado para propor melhorias no prototipo HTML+JSX ativo. Captura escopo via AskUserQuestion, carrega skills de UI e UX em paralelo, e gera plano formal via writing-plans com base nas respostas.
---

Conduza o usuario por um workflow guiado para propor melhorias visuais e
funcionais no prototipo HTML+JSX ativo (modelo cadillac).

Doc de tokens central: `{{CENTRAL_TOKENS_DOC}}` (o mapa de tokens do projeto
que vai pro tema do stack real; o adaptador preenche o caminho no install).
Toda referencia abaixo usa esse placeholder.

Argumento opcional: `$ARGUMENTS` pode conter uma intencao livre (ex.: "card
do produto, espacamento ruim"). Se preenchido, usar como semente da analise.

> **Este comando MELHORA o que ja existe — nao cria nem cresce telas.**
> Para **adicionar uma tela** ao prototipo cadillac: use
> `/incrementar-prototipo` (fundir nova tela/estado/papel num consolidado
> existente) ou `/criar-prototipo` (novo consolidado do zero). Aqui o foco e'
> refinar visual/UX/tokens das telas que ja estao no consolidado.

Protocolo:

1. **Detectar prototipo alvo:**
   - Listar `prototipos_html/` excluindo `_template`.
   - Se 1 consolidado → usa esse. Se varios → escolher mais recente por mtime.
   - Se zero consolidados, parar e instruir `/criar-prototipo`.
   - Ler o consolidado (`index.html` + registry / `screens.jsx`, ou
     `components/` no layout legado single-showcase) pra mapear as telas
     existentes como contexto.

2. **AskUserQuestion 1 — Escopo principal:**
   - Refinar tela existente
   - Refinar componentes globais (ui.jsx)
   - Mudar paleta/tokens/identidade visual
   - Adicionar nova tela → **redireciona:** este comando nao adiciona telas;
     encaminhe pro `/incrementar-prototipo` (crescer o consolidado) ou
     `/criar-prototipo` (novo consolidado) e encerre o fluxo aqui.

3. **AskUserQuestion 2 — Detalhamento (depende da resposta 1):**
   - Se "refinar tela": qual tela (listar as telas registradas no consolidado
     ativo, lendo o registry / `screens.jsx`)
   - Se "refinar componentes": quais primitivos (Button/Card/Field/...)
   - Se "tokens": qual dimensao (paleta / tipografia / espacamento / radii / sombras)

4. **AskUserQuestion 3 — Descrever os problemas e desejos:**
   - Pergunta aberta com "Other" como unica opcao real, instruindo o user
     a colar texto livre descrevendo:
     - o que esta ruim hoje (visual, fluxo, microcopy, acessibilidade)
     - o que quer ver em vez disso
     - referencias visuais (links/screenshots se houver)

5. **Carregar skills UI/UX em paralelo (se instaladas no ambiente):**
   Use o Skill tool em paralelo para enriquecer a analise. Sao dependencias
   externas opcionais — use SOMENTE as disponiveis e relevantes pro escopo:
   - `ui-ux-pro-max` — design system queries, padroes de UX
   - `design:design-critique` — feedback estruturado
   - `design-audit` — auditoria visual sistematica
   - `emil-design-eng` — polimento e micro-interacoes
   - `ui-typography` — regras tipograficas obrigatorias
   (Ex.: ui-typography so se a melhoria envolve texto; emil-design-eng se
   envolve animacao.)

6. **Sintese de proposta (texto pro user, antes do plano):**
   - Estado atual: arquivos/componentes tocados (cite linhas se relevante)
   - Problemas identificados (cruzar input do user com skills carregadas)
   - Propostas de melhoria (3-5 itens priorizados por impacto/esforco)
   - Riscos/trade-offs visuais
   - Mapeamento futuro pro stack real (se a mudanca afetar tokens centrais que
     vao pro tema central do stack — ex.: `{{CENTRAL_TOKENS_DOC}}`)

7. **AskUserQuestion 4 — Confirmar antes do plan:**
   - Aprovar todas as propostas
   - Selecionar apenas algumas (multi-select)
   - Ajustar antes (volta pra passo 6)

8. **Invocar superpowers:writing-plans:**
   Gerar plano formal em
   `docs/superpowers/plans/YYYY-MM-DD-melhorar-prototipo-<slug>.md`
   contendo:
   - Estado atual (componentes/arquivos)
   - Mudancas propostas (passo a passo)
   - Criterios de aceite (visual checklist + estados cobertos)
   - Como rodar e validar (referenciar `/iniciar-prototipo`)
   - Impacto no mapa de tokens central se aplicavel
   - Estimativa de tempo

9. **Encerramento:**
   - Sumario do plano + caminho do arquivo gerado
   - Lembrete: para aplicar, user usa `/aprovar-plano` ou diz "aprovado".
   - Lembrete: `/iniciar-prototipo` pra ver o estado atual lado-a-lado
     com a proposta durante revisao.

**Anti-loopholes:**
- NUNCA aplicar mudancas no prototipo antes de o user aprovar via `/aprovar-plano`.
- Se o user pedir "so muda direto", parar e pedir aprovacao formal — o
  fluxo existe pra evitar drift visual nao-rastreado.
- NUNCA adicionar/inventar uma tela neste comando — se o escopo for crescer o
  prototipo, encaminhe pro `/incrementar-prototipo` ou `/criar-prototipo`
  (este comando so MELHORA telas existentes).
- Skills UI/UX sao consultivas — opinioes delas conflitantes vao pra
  sintese (passo 6) pro user decidir, nao auto-aplicar.
- Tipografia: rodar ui-typography SEMPRE quando a mudanca envolver
  texto visivel (ENFORCEMENT MODE da skill, conforme description).
- Se a mudanca afetar o mapa de tokens central (ex.:
  `{{CENTRAL_TOKENS_DOC}}`), propor edicao no plano — nao editar o
  doc fora do plan aprovado.

**Touch obrigatorio:**
Antes de editar qualquer arquivo fora de `controle/`, tocar ESTADO+LEDGER
da task ativa (gotcha do watchdog).
