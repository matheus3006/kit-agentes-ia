---
description: Workflow guiado para propor melhorias no prototipo HTML+JSX ativo. Captura escopo via AskUserQuestion, carrega skills de UI e UX em paralelo, e gera plano formal via writing-plans com base nas respostas.
---

Conduza o usuario por um workflow guiado para propor melhorias visuais e
funcionais no prototipo HTML+JSX ativo.

Argumento opcional: `$ARGUMENTS` pode conter uma intencao livre (ex.: "card
do produto, espacamento ruim"). Se preenchido, usar como semente da analise.

Protocolo:

1. **Detectar prototipo alvo:**
   - Listar `prototipos_html/` excluindo `_template`.
   - Se 1 pasta → usa essa. Se varias → escolher mais recente por mtime.
   - Se zero pastas, parar e instruir `/nova-tela-fe`.
   - Listar os componentes em `components/` pra contexto.

2. **AskUserQuestion 1 — Escopo principal:**
   - Refinar tela existente
   - Adicionar nova tela
   - Refinar componentes globais (ui.jsx)
   - Mudar paleta/tokens/identidade visual

3. **AskUserQuestion 2 — Detalhamento (depende da resposta 1):**
   - Se "refinar tela": qual tela (listar as telas existentes no prototipo
     ativo, lendo os componentes em `components/`)
   - Se "adicionar nova tela": qual tela (lista candidatas comuns OU "Other")
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
     vao pro tema central do stack — ex.: `docs/frontend/design-tokens.md`)

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
- NUNCA inventar nova tela sem perguntar primeiro qual ela e' (passo 3).
- Skills UI/UX sao consultivas — opinioes delas conflitantes vao pra
  sintese (passo 6) pro user decidir, nao auto-aplicar.
- Tipografia: rodar ui-typography SEMPRE quando a mudanca envolver
  texto visivel (ENFORCEMENT MODE da skill, conforme description).
- Se a mudanca afetar o mapa de tokens central (ex.:
  `docs/frontend/design-tokens.md`), propor edicao no plano — nao editar o
  doc fora do plan aprovado.

**Touch obrigatorio:**
Antes de editar qualquer arquivo fora de `controle/`, tocar ESTADO+LEDGER
da task ativa (gotcha do watchdog).
