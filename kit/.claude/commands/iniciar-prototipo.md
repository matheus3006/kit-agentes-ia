---
description: Inicia servidor HTTP local do prototipo HTML+JSX ativo. Detecta task-id mais recente em prototipos_html/, mata server antigo na porta 8765, sobe novo, retorna URL e abre no Chrome se MCP disponivel.
---

Inicie o servidor HTTP local do prototipo HTML+JSX e retorne a URL pro user.

Argumento opcional: `$ARGUMENTS` pode conter um task-id especifico
(ex.: `2026-05-20-nome-da-tela`). Se vazio, detectar automaticamente.

Protocolo:

1. **Detectar prototipo alvo:**
   - Liste `prototipos_html/` excluindo `_template`.
   - Se `$ARGUMENTS` foi passado, usar como task-id.
   - Caso contrario:
     - Se houver apenas 1 pasta de task, usa essa.
     - Se houver multiplas, listar com mtime e escolher a mais recente.
     - Se zero pastas, parar e instruir o user a rodar `/nova-tela-fe` primeiro.

2. **Validar estrutura:**
   - Confirmar que `prototipos_html/<task-id>/index.html` existe.
   - Confirmar que `prototipos_html/<task-id>/components/` existe.
   - Se faltar, parar e reportar.

3. **Matar server antigo na porta 8765 (se houver):**
   ```bash
   lsof -ti :8765 2>/dev/null | xargs kill -9 2>/dev/null
   sleep 1
   ```

4. **Subir server:**
   ```bash
   cd prototipos_html/<task-id>
   python3 -m http.server 8765 > /tmp/proto-srv-<task-id>.log 2>&1 &
   ```
   Use `run_in_background=true` no Bash tool — server precisa ficar vivo.

5. **Smoke test imediato:**
   - Aguardar 2 segundos (`sleep 2`).
   - `curl -sI http://localhost:8765/` deve retornar HTTP 200.
   - `curl -s http://localhost:8765/components/app.jsx | head -3` deve mostrar codigo JSX (nao 404).
   - Se falhar, mostrar `/tmp/proto-srv-<task-id>.log` e parar.

6. **Tentar abrir no Chrome MCP (se disponivel):**
   - Verificar `mcp__Claude_in_Chrome__list_connected_browsers`.
   - Se conectado: navegar pra `http://localhost:8765/`.
   - Se nao conectado: apenas reportar a URL pro user abrir manualmente.

7. **Retornar pro user:**
   - URL: `http://localhost:8765`
   - Task-id ativa
   - PID do server (pra `kill` manual depois se quiser)
   - Lembrete: `/melhorar-prototipo` pra iterar.

**Anti-loopholes:**
- Nao usar `python3 -m http.server` sem `&`/run_in_background — server morre.
- Nao usar porta 8000 (conflito comum com outros projetos); 8765 e dedicada.
- Sempre matar server antigo antes de subir novo — `Address already in use` quebra fluxo.
- Se Docker estiver tomando 8765 (ja vi acontecer), avisar user e sugerir porta alternativa.
