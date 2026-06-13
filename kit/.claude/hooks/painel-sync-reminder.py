#!/usr/bin/env python3
"""Hook lembrete do PAINEL do roadmap. NAO bloqueia (advisory).

Dispara quando QUALQUER task fecha (controle/<task-id>/ESTADO.md -> fase: concluida)
sem evidencia de ter regenerado o painel vivo (docs/roadmap/PAINEL.html). Toda task
muda o status do roadmap, entao o painel deve refletir no closure. Espelha o
vitrine-sync-reminder.py (mesma mecanica), mas vale para TODA task, nao so frontend.

Regra fixa (skill execute-closure step 8): atualizar docs/roadmap/painel-data.json +
rodar `node scripts/gen-painel.mjs`. O painel e DERIVADO do JSON (anti-drift).

Heuristica:
- so age em controle/<task-id>/ESTADO.md com fase=concluida;
- se ESTADO+LEDGER ja citam gen-painel/PAINEL.html/painel-data.json, assume que ja
  regenerou -> silencia (evita auto-nag, inclusive da propria task da auditoria).
Qualquer erro -> exit 0 (nunca bloqueia o fluxo).
"""
import json
import re
import sys
from pathlib import Path

EDIT_TOOLS = {"Edit", "Write", "MultiEdit"}
ESTADO_PATH_REGEX = re.compile(r"controle/([^/]+)/ESTADO\.md$")
TERMINAL_PHASE = "concluida"
SYNC_MARKERS = ("gen-painel", "painel.html", "painel-data.json")
REMINDER = (
    "Painel do roadmap: esta task fechou. Regra fixa (execute-closure step 8): "
    "atualize docs/roadmap/painel-data.json (status do que a task mudou) e rode "
    "`node scripts/gen-painel.mjs` para regenerar docs/roadmap/PAINEL.html. "
    "O HTML e DERIVADO do JSON — nunca edite a mao. Se ja regenerou, ignore."
)


def read_frontmatter_field(text, field):
    if not text.startswith("---"):
        return None
    end = text.find("\n---", 3)
    if end == -1:
        return None
    m = re.search(
        r"^\s*" + re.escape(field) + r"\s*:\s*(.+?)\s*$", text[3:end], re.MULTILINE
    )
    return m.group(1).strip().strip("'\"") if m else None


def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)
    if data.get("hook_event_name") != "PostToolUse":
        sys.exit(0)
    if data.get("tool_name") not in EDIT_TOOLS:
        sys.exit(0)
    tool_input = data.get("tool_input") or {}
    file_path = tool_input.get("file_path") or tool_input.get("path") or ""
    if not ESTADO_PATH_REGEX.search(file_path):
        sys.exit(0)
    estado_path = Path(file_path)
    try:
        estado_text = estado_path.read_text(encoding="utf-8")
    except Exception:
        sys.exit(0)
    fase = (read_frontmatter_field(estado_text, "fase") or "").strip().lower()
    if fase != TERMINAL_PHASE:
        sys.exit(0)
    text = estado_text
    try:
        text += "\n" + (estado_path.parent / "LEDGER.md").read_text(encoding="utf-8")
    except Exception:
        pass
    low = text.lower()
    if any(marker in low for marker in SYNC_MARKERS):
        sys.exit(0)
    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": "PostToolUse",
                    "additionalContext": REMINDER,
                }
            }
        )
    )
    sys.exit(0)


if __name__ == "__main__":
    main()
