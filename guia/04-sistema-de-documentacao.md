# Pilar 4 — Sistema de documentação

> Leitor: um agente de IA que vai instalar e operar este método num projeto novo.
> Este documento descreve o conjunto de artefatos de documentação que mantém o
> projeto consistente entre sessões e entre agentes. Cada artefato tem um papel
> distinto; juntos, são a memória de longo prazo do projeto (o controle de
> `01-controle-de-contexto.md` é a memória por-task; isto é a memória do projeto).

## A camada de documentação, em uma visão

| Artefato | Papel | Cadência |
|---|---|---|
| `docs/CONTEXT.md` | Glossário canônico (linguagem ubíqua) | Cresce quando um termo é decidido |
| `docs/ROADMAP.md` + `docs/roadmap/E##*.md` | Spec estável de épicos e tasks | Escrito uma vez, estável |
| `docs/roadmap/E0X/STATE.md` | Live state por (sub-)épico | **Atualizado a cada closure** |
| `docs/adr/NNNN-*.md` | Decisões arquiteturais com trade-off | Quando uma decisão cristaliza |
| `docs/roadmap/PAINEL.html` | Painel vivo pronto×falta (derivado de JSON) | Regenerado a cada closure |
| `scripts/smoke-e0X.sh` | Gate informal de pre-merge por épico | Cresce conforme tasks fecham |
| `docs/flows/*.mmd` | Diagramas de fluxo (UX/técnico/arquitetura) | Sob demanda |

A distinção central: **spec é estável, state é vivo.** A spec de uma task
(`T##.NN-*.md`) descreve o que ela deve fazer e quase não muda. O STATE descreve
onde o épico está agora e muda toda vez que uma task fecha. Confundir os dois é o
erro clássico — leva specs reescritas a cada sessão e states que mentem.

## CONTEXT.md — o glossário canônico

`docs/CONTEXT.md` é a **linguagem ubíqua** do projeto, no sentido de DDD: todo doc,
ADR, código e conversa usa os mesmos termos com o mesmo significado. Convenções:

- Termos em **PascalCase PT-BR**, em ordem alfabética. O domínio é canônico em
  português; exceções em código (nome de tabela/tipo em inglês) são documentadas no
  próprio termo.
- Cada termo tem três partes: uma **definição comportamental** de um parágrafo (o
  que é, como se comporta no domínio); um campo **"Distinto de:"** que separa o termo
  de um vizinho próximo (é o que evita confusão entre conceitos parecidos); e um
  campo **"Formalizado em:"** que aponta o ADR onde a decisão foi cristalizada (ou
  "Sem ADR dedicado").

```
## <TermoCanônico>
<Definição comportamental em 1 parágrafo.>
- **Distinto de:** <termo próximo> — <por que é diferente>
- **Formalizado em:** [ADR-XXXX](adr/XXXX-<slug>.md)
```

Por que dá consistência ao projeto inteiro: quando o agente, o humano e o código
chamam a mesma coisa pelo mesmo nome, ambiguidade some. Um termo no glossário é a
fronteira entre "Cliente" (consumidor) e "Staff" (operador), entre "Pedido" e
"Comanda" — distinções que, se ficarem implícitas, geram bugs de modelagem. Termos
nascem normalmente numa sessão de grilling (`grill-with-docs`, ver
`05-skills-e-commands.md`) e entram aqui já apontando para o ADR.

## ROADMAP.md + specs de épico e task

A hierarquia de planejamento é de três níveis:

1. **`docs/ROADMAP.md`** — o índice mestre. Uma tabela `Épico | Entrega | Estimativa
   | Status` com link para cada spec de épico. Legenda de status simples (✅ completo
   · ⏳ em andamento). Também documenta as convenções globais (cada task vira pasta
   `controle/`, frontend obriga `/nova-tela-fe`, máx 1 task em `fase=execucao`) e as
   dependências macro entre épicos.
2. **`docs/roadmap/E##-<slug>.md`** — a spec **estável** de um épico. A entrega macro,
   os ACs de alto nível, as decisões já tomadas. Escrita uma vez, mexida raramente.
3. **`docs/roadmap/E##/T##.NN-<slug>.md`** — a spec de uma task individual, dentro da
   pasta do épico.

A convenção de nomes é rígida e load-bearing: **épicos `E##`** (E01, E02…), **tasks
`T##.NN`** (T04.02 = segunda task do épico 4). Esse padrão no slug é o que o hook de
sync usa para propagar status `done` de volta ao índice — ver `02-hooks-de-validacao.md`.

## STATE.md — o artefato anti-deriva

`docs/roadmap/E0X/STATE.md` (um por épico ou sub-épico) é o documento **mais
importante** contra a deriva entre sessões. É o "live state": deve ser lido em ~30
segundos ao retomar a sessão e dá ao agente o contexto completo de onde o épico está
sem precisar reler o histórico. **Atualizado a cada task closure**, no mesmo PR (é a
single source of truth do ciclo de vida do épico). Seções do template
(`docs/roadmap/E0X/STATE-template.md`):

- **Status atual** — fase do épico, tasks concluídas N/M, última atualização
  (branch/commit), próxima task sugerida, bloqueios (e o que é bloqueante de go-live).
- **Tasks** — checklist `[ ] T0X.NN` com estimativa-papel e medição-real ao fechar.
- **Schema relacionado** — migrations, tabelas, funções, edge functions tocadas.
- **ADRs aplicáveis** — quais ADRs governam o épico e o que cobrem.
- **Arquivos de produção** — preenchidos conforme as tasks abrem.
- **Smoke script** — path, último resultado (PASS N/N), como rodar, o que cobre.
- **Cuidados acumulados** — memória técnica densa: decisões e erratas travadas por
  task. É onde mora o conhecimento que não cabe num ADR mas não pode ser perdido.
- **Open issues / risks**.
- **Pre-flight (nova sessão · 30s)** — o ritual de retomada: ler o STATE, `git log`
  nos paths do épico, rodar o smoke, conferir a última task em `controle/`.

O STATE vive **fora de `controle/`**, então o cap de linhas do watchdog não se aplica
— ele pode crescer com o épico. É a peça que faz uma sessão nova "saber onde parou".

## ADRs — Architecture Decision Records

`docs/adr/NNNN-<slug>.md` registra decisões com trade-off arquitetural real.
Convenções (`docs/adr/0000-template.md`):

- **Numeração sequencial de 4 dígitos** (`0001`, `0002`…). Nome `NNNN-<slug>.md`.
- O template tem: Status (Proposed/Accepted/Superseded), Data, contexto da task onde
  foi tomada, decisão com mecânica numerada (e `### Schema` SQL/contrato se houver),
  alternativas consideradas (com a ESCOLHIDA marcada), consequências (positivas/
  negativas com mitigação/neutras), implementação, open questions e roadmap.
- **Supersede via ADR novo.** Revisar uma decisão **não** é editar o ADR antigo —
  cria-se um ADR NOVO que aponta para o antigo (`Supersede: ADR-XXXX`, citando a
  cláusula específica revista). O antigo permanece como histórico imutável.
- **Errata inline** para ajustes menores num ADR já Accepted: uma seção
  `## Errata (AAAA-MM-DD · contexto)` no próprio arquivo, sem criar ADR novo.

Quando criar ADR **vs** quando NÃO:

- **Criar:** a decisão tem trade-off arquitetural — escolha entre tecnologias,
  modelagem de dados, mecanismo de segurança, contrato entre superfícies. Algo que,
  se revisto depois, custa caro e precisa de rastro do "porquê".
- **Não criar:** escolha de UI/produto sem trade-off arquitetural (cor de botão,
  ordem de campos, copy). Isso vive no protótipo e no STATE, não num ADR.

A conexão com `grill-with-docs`: a skill conduz uma sessão de grilling que desafia o
plano contra o modelo de domínio existente, afia a terminologia, e **atualiza
CONTEXT.md e cria/edita ADRs inline** conforme as decisões cristalizam. ADRs raramente
nascem do nada — nascem de um grilling.

## PAINEL — o painel vivo (pronto × falta)

O segundo mecanismo de "done" (o primeiro é a verificação de ACs no closure). É um
painel HTML que mostra, por superfície e por épico, o que está pronto e o que falta.
Mecânica anti-drift:

- **`docs/roadmap/painel-data.json`** é a fonte de dados — a única coisa editável à
  mão. Estrutura: `surfaces[].epics[].screens[]`, mais blocos `backends`, `priorities`
  e `staleDocs`.
- **`node scripts/gen-painel.mjs`** lê o JSON e gera `docs/roadmap/PAINEL.html`.
- **`docs/roadmap/PAINEL.html` é DERIVADO** — nunca editar à mão. O próprio header do
  HTML gerado avisa isso. Editar o HTML é trabalho perdido: o próximo `gen-painel.mjs`
  sobrescreve.

Os **5 status** de cada tela:

- **`done`** — existe e completa (FE + backend onde aplicável).
- **`fe-only`** — tela navegável, mas backend ainda é stub/mock (o "segundo momento").
- **`partial`** — existe mas incompleta (falta um estado ou um fluxo).
- **`missing`** — planejada mas NÃO existe no código.
- **`backend`** — lógica de servidor faltante (NÃO é tela; vai no bloco `backends`).

Por que separar "tela" de "backend": o método permite que o frontend nasça inteiro
(via protótipo) antes do backend existir. `fe-only` é um estado legítimo e comum —
a tela está pronta e aprovada, esperando o servidor. Misturar os dois numa única
barra de progresso esconderia que metade do trabalho real (o backend) ainda falta.
O painel torna esse gap explícito e é o que dá ao humano a visão honesta de "quanto
falta para go-live".

No closure (skill `execute-closure`, passo 8): atualize o JSON refletindo o que a
task mudou (telas que viraram `done`/`fe-only`, gaps fechados, docs stale corrigidos),
rode `node scripts/gen-painel.mjs`, commite o HTML regenerado. O hook
`painel-sync-reminder.py` lembra.

## Smoke scripts — gate informal de pre-merge

`scripts/smoke-e0X.sh`, um por épico. Bash puro, zero deps, com três helpers inline
(`scripts/smoke-template.sh`):

- **`section "label"`** — divisor visual de bloco.
- **`check "label" comando args...`** — roda o comando; verde se exit 0, vermelho se
  não. Incrementa PASS/FAIL.
- **`todo "label"`** — placeholder amarelo para um AC ainda não verificável.

O script começa como **skeleton**: só `todo`s. Conforme cada task do épico fecha,
você troca um `todo` pelo `check` real (`test -f migration.sql`, `grep -q 'create
function'`, etc.). No fim imprime `PASS=N FAIL=N TODO=N` e sai com 1 se houver
qualquer FAIL — é o gate informal que se roda antes de mergear uma task do épico, e
parte do ritual de pre-flight do STATE. Aponte para `scripts/smoke-template.sh` ao
criar o smoke de um novo épico.

## mermaid-flow — diagramas de fluxo

A skill `mermaid-flow` gera diagramas `.mmd` (Mermaid) em três sabores, cada um com
seu lugar:

- **Fluxo UX** (`docs/flows/<perfil>-ux.mmd`) — `flowchart TD/LR`: nós = telas,
  losangos = decisões do usuário, classes destacando estados especiais (empty/error/
  loading). Mapeia a jornada de um perfil.
- **Fluxo técnico** (`docs/flows/<perfil>-tech.mmd`) — `sequenceDiagram`: atores
  (Cliente/API/DB/Serviço externo), anotando endpoints, queries e mensagens de uma
  operação crítica.
- **Arquitetura** (`docs/architecture/<modulo>.mmd`) — `graph TB`/`C4Component`:
  boundaries de serviço e fontes de verdade.

Convenções: título via comentário `%% <Título>`, IDs curtos e legíveis (`LOGIN`,
`ORDER_CREATE`), `classDef` para nós críticos, máx ~30 nós por diagrama (quebrar em
sub-diagramas se passar). Detalhe da skill em `05-skills-e-commands.md`.

## Como adaptar

- **CONTEXT.md / ROADMAP.md** já vêm com placeholders (`{{PROJECT_NAME}}`, termos e
  épicos exemplo). Substitua pelo domínio real; mantenha a estrutura.
- **STATE.md:** copie `docs/roadmap/E0X/STATE-template.md` para `docs/roadmap/E0N/STATE.md`
  ao abrir cada épico.
- **PAINEL:** edite `painel-data.json` com as superfícies do seu projeto (a `id` de
  cada surface vira a âncora de navegação). Rode `gen-painel.mjs` para validar. As
  superfícies do método (app/board/admin no exemplo) são configuráveis.
- **Smoke:** copie `scripts/smoke-template.sh` para `scripts/smoke-e0N.sh` por épico.
- **ADRs:** comece a numeração em `0001`; `0000-template.md` é o molde, não um ADR real.

## Arquivos no kit

- `kit/docs/CONTEXT.md` — glossário canônico (com convenção e template de termo).
- `kit/docs/ROADMAP.md` — índice mestre + convenções.
- `kit/docs/roadmap/E0X/STATE-template.md` — template de live state por épico.
- `kit/docs/adr/0000-template.md` — template de ADR.
- `kit/docs/roadmap/painel-data.json` — fonte de dados do painel.
- `kit/scripts/gen-painel.mjs` — gerador do PAINEL.html (zero deps).
- `kit/scripts/smoke-template.sh` — template de smoke por épico.
- `kit/.claude/skills/mermaid-flow/SKILL.md` — a skill de diagramas.

## Cross-referências

- `02-hooks-de-validacao.md` — `roadmap-task-status-sync.py` e `painel-sync-reminder.py`
  automatizam a propagação de status e o lembrete de regenerar o painel.
- `05-skills-e-commands.md` — `execute-closure` (que dispara a atualização de STATE +
  painel), `mermaid-flow` e `grill-with-docs` (que alimenta CONTEXT.md e ADRs).
