---
description: Inicia servidor HTTP local do prototipo HTML+JSX. Detecta hub/consolidado em prototipos_html/, varre porta livre a partir de {{DEFAULT_PROTO_PORT}}, sobe server na raiz, retorna URL e abre no Chrome se MCP disponivel.
---

Inicie o servidor HTTP local do prototipo HTML+JSX e retorne a URL pro user.

Constante de porta: `{{DEFAULT_PROTO_PORT}}` (default `8765`). Toda referencia
de porta abaixo usa essa constante — sem numeros hard-coded.

Argumento opcional: `$ARGUMENTS` pode conter um task-id especifico
(ex.: `2026-05-20-nome-da-tela`) pra deep-link direto num consolidado. Se vazio,
detectar automaticamente.

Protocolo:

1. **Detectar alvo:**
   - Liste `prototipos_html/` excluindo `_template`.
   - Se `$ARGUMENTS` foi passado, usar como task-id (deep-link do consolidado).
   - Caso contrario:
     - Se existir `prototipos_html/index.html` com `PROTOS[]` (hub/vitrine), o
       alvo e o **hub** (abre a raiz).
     - Senao, se houver apenas 1 pasta de consolidado, usa essa (deep-link).
     - Se houver multiplas pastas e nenhum hub, listar com mtime e escolher a
       mais recente.
     - Se zero consolidados, parar e instruir o user a rodar `/criar-prototipo`
       (novo) ou `/nova-tela-fe` primeiro.

2. **Validar estrutura:**
   - Hub: confirmar que `prototipos_html/index.html` existe e contem `PROTOS`.
   - Consolidado: confirmar que `prototipos_html/<task-id>/index.html` existe.
   - Se faltar, parar e reportar.

3. **Escolher porta livre (sweep) e matar so o server proprio anterior:**
   - NUNCA `kill -9` em processo de terceiro. So mata o servidor PROPRIO
     anterior, registrado em `/tmp/proto-srv.pid`.
   - A partir de `{{DEFAULT_PROTO_PORT}}`, varre p/ cima ate a 1a porta livre.
   ```bash
   PORT={{DEFAULT_PROTO_PORT}}
   # mata so o servidor proprio anterior, se houver
   if [ -f /tmp/proto-srv.pid ]; then kill "$(cat /tmp/proto-srv.pid)" 2>/dev/null; fi
   # varre p/ a 1a porta livre a partir da preferida
   while lsof -ti :"$PORT" >/dev/null 2>&1; do PORT=$((PORT+1)); done
   echo "Porta escolhida: $PORT"
   ```

4. **Subir server na RAIZ de prototipos_html e definir o que abrir:**
   - Servir a **raiz** `prototipos_html/` (nao a pasta da task) — assim o hub e
     os consolidados ficam todos acessiveis pela mesma porta.
   - Se existir hub (`index.html` com `PROTOS[]`), abrir a raiz; senao deep-link
     do consolidado unico/escolhido.
   ```bash
   cd prototipos_html
   python3 -m http.server "$PORT" >/tmp/proto-srv.log 2>&1 & echo $! >/tmp/proto-srv.pid
   if grep -q "PROTOS" index.html 2>/dev/null; then OPEN="http://localhost:$PORT/"; else OPEN="http://localhost:$PORT/<task-id>/"; fi
   echo "Abrir: $OPEN"
   ```
   Use `run_in_background=true` no Bash tool — server precisa ficar vivo.

5. **Smoke test imediato (asset generico):**
   - Aguardar 2 segundos (`sleep 2`).
   - `curl -sI http://localhost:$PORT/ | head -1` deve retornar HTTP 200.
   - Confirmar que a pagina servida tem o motor: o `index.html` (hub ou
     consolidado) carrega tags `<script>` conhecidas (React UMD / Babel
     standalone / `.jsx`):
     ```bash
     curl -s "$OPEN" | grep -qi "<script" && echo "smoke ok: script tag presente"
     ```
   - Se falhar, mostrar `/tmp/proto-srv.log` e parar.

6. **Tentar abrir no Chrome MCP (se disponivel):**
   - Verificar `mcp__Claude_in_Chrome__list_connected_browsers`.
   - Se conectado: navegar pra `$OPEN`.
   - Se nao conectado: apenas reportar a URL pro user abrir manualmente.

7. **Retornar pro user:**
   - URL: `$OPEN` (raiz/hub ou deep-link do consolidado)
   - Porta escolhida pelo sweep
   - Alvo (hub ou task-id do consolidado)
   - PID do server (`/tmp/proto-srv.pid`, pra `kill` manual depois se quiser)
   - Lembrete: `/criar-prototipo` (novo consolidado) · `/incrementar-prototipo`
     (crescer existente) · `/melhorar-prototipo` (iterar o que existe).

**Anti-loopholes:**
- Nao usar `python3 -m http.server` sem `&`/run_in_background — server morre.
- Toda porta vem de `{{DEFAULT_PROTO_PORT}}` (default `8765`) — nada de `8000`
  ou numeros soltos; o sweep resolve conflito sem hard-code.
- Nunca `kill -9` em processo de terceiro: so o servidor proprio anterior
  (via `/tmp/proto-srv.pid`) e encerrado.
- Se a porta dedicada estiver ocupada, o sweep usa a proxima livre e reporta
  qual — sem quebrar o fluxo com `Address already in use`.
