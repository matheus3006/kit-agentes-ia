# GREEN — Clone-Smoke (prova de portabilidade) — 2026-06-20

Prova decisiva: um clone+install do kit, usando SÓ o que o install copiou, gera e cresce
um protótipo cadillac de domínio NOVO, sobe em porta livre, com console limpo. Subagentes
clean-room (proibidos de ler qualquer outro repo).

## Setup
- Clone descartável `/tmp/kit-smoke`; copiado só o payload: `.claude/`, `prototipos_html/`, `docs/`.
- Skills instaladas: criar-prototipo (8 templates + 5 minimal + 1 ref), incrementar-prototipo, execute-closure, html-prototype, mermaid-flow.
- **Gate de neutralidade no install:** `grep -rniE "breakweb|manila|whatsapp|janela 24|pizzaria|grazi|/Users/matheus|spring boot|shadcn"` → exit 1 (ZERO match).

## Domínio NOVO: "Acervo" (catálogo de biblioteca) — distinto de delivery/CRM/nutri

### criar-prototipo (clean-room, subagente A)
- Gerou `prototipos_html/2026-06-20-acervo-mvp/` (index.html consolidado + ds.jsx + engine.jsx + screens.jsx + app.jsx).
- 2 telas: Catálogo (busca + filtros gênero + lista com disponibilidade) e Detalhe (sinopse + Reservar). Estados default/loading/empty/error.
- **Browser real (Claude Preview MCP):** renderizou — switchers Produto/Showcase · Desktop/Mobile · Claro/Escuro, chips, livros com tags Disponível/Emprestado. **Console: ZERO erros** (só o aviso benigno do Babel-standalone). Screenshot capturado.

### incrementar-prototipo (clean-room, subagente B)
- Fundiu uma 3ª tela "Minhas Reservas" (key `reservas`) no consolidado EXISTENTE — delta cirúrgico.
- **Motor intacto:** `engine.jsx` SHA-256 idêntico antes/depois; `diff` vs motor instalado = byte-idêntico. Só ds.jsx/screens.jsx/index.html tocados.
- `?v=` subiu 20260620a → 20260620b em todas as 4 tags locais.
- Registry passou a 3 telas (catalogo, detalhe, reservas); nav atualizada (sidebar + bottom-nav mobile).
- **Browser real:** nav mostra Catálogo/Detalhe/Minhas Reservas; a tela Reservas renderiza (reservado/emprestado/atrasado + ações Devolver/Cancelar). **Console: ZERO erros.**

## Régua 12/12 contra o consolidado gerado
| Item | Evidência | OK |
|---|---|---|
| 1 consolidado React18+Babel | renderizou no browser | ✓ |
| 2 ordem de load | ds→engine→screens→app | ✓ |
| 3 IIFE/hooks-topo | 3 telas em IIFE, registerScreen | ✓ |
| 4 ?v= cache-bust | 20260620b nas 4 tags | ✓ |
| 5 registry window.<DS>Screens | 3 registerScreen | ✓ |
| 6 device-frame fit-to-stage | switch Desktop/Mobile renderiza | ✓ |
| 7 tokens só em ds/tokens | ds.jsx é o seam | ✓ |
| 8 i18n pt-BR+en | 'pt-BR' + 'en' em ds.jsx | ✓ |
| 9 showcase/PROTOS | standalone (sem hub) — single consolidado | ✓ (N/A hub) |
| 10 sem PII logado | sem console.log de dado | ✓ |
| 11 console limpo | ZERO erros (browser MCP) | ✓ |
| 12 motor não-editado | engine.jsx byte-idêntico ao instalado | ✓ |
| opt-in A (cor reservada) | domínio neutro não usa | N/A |
| opt-in B (white-label) | single-brand | N/A |

**Veredito: 12/12 (opt-ins N/A). Portabilidade PROVADA.**

## Frictions surfaçadas (→ REFACTOR Task 13)
- **A1/B1 (path-wiring em install):** a rota SPLIT (`_shared-<ds>/`) não documenta COMO o motor chega à pasta num install (templates vivem em `.claude/skills/...`, fora de `prototipos_html/`). Skill deve dizer "copie o motor de `.claude/skills/criar-prototipo/{templates|examples/minimal/engine.jsx}` para a pasta do protótipo — nunca referencie in-place". Hub é OPCIONAL: se não há hub, o passo de bump do iframe é no-op.
- **B2/B3 (standalone sem controle/LEDGER):** falta um caminho "leve/standalone" documentado para installs sem a pilha controle/preview/LEDGER.
- **C1 (neutralidade):** o `<title>` do consolidado gerado herda "modelo cadillac" (jargão interno na UI do produto-final) — parametrizar.
- **B4/minor:** vocabulário "8 estados" na referência vs o switcher de 4 estados do engine (default/loading/empty/error) — reconciliar. `<task-id>` shape indefinido.
