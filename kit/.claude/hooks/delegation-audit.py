#!/usr/bin/env python3
"""Hook observador de delegacao. NAO bloqueia.

Detecta quando o modelo principal poderia ter delegado para um subagent mais
barato. Loga em ~/.claude/state/agent-context/delegation-log.jsonl.

Padroes:
  - explore_chain: Read|Grep|Glob >= 5 em sequencia sem Agent/Bash
  - edit_distinct: Edit em >= 3 arquivos distintos sem reset
"""
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path

EXPLORE_TOOLS = {"Read", "Grep", "Glob"}
EDIT_TOOLS = {"Edit", "Write", "MultiEdit"}
RESET_TOOLS = {"Agent", "Bash"}
EXPLORE_THRESHOLD = 5
EDIT_THRESHOLD = 3
STATE_TTL_SECONDS = 7 * 24 * 3600


def state_dir() -> Path:
    p = Path.home() / ".claude" / "state" / "agent-context"
    p.mkdir(parents=True, exist_ok=True)
    return p


def cleanup_old_states(directory: Path) -> None:
    cutoff = time.time() - STATE_TTL_SECONDS
    for f in directory.glob("delegation-state-*.json"):
        try:
            if f.stat().st_mtime < cutoff:
                f.unlink()
        except Exception:
            pass


def load_state(path: Path) -> dict:
    if not path.exists():
        return {"explore_chain": [], "edit_files": []}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {"explore_chain": [], "edit_files": []}


def save_state(path: Path, state: dict) -> None:
    try:
        path.write_text(json.dumps(state), encoding="utf-8")
    except Exception:
        pass


def append_log(entry: dict) -> None:
    log_path = state_dir() / "delegation-log.jsonl"
    try:
        with log_path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    except Exception:
        pass


def main() -> None:
    try:
        data = json.load(sys.stdin)
    except Exception:
        return
    tool = data.get("tool_name", "")
    session_id = data.get("session_id", "no-session")
    sid_safe = "".join(c if c.isalnum() or c in "-_" else "_" for c in session_id)[:64]
    sd = state_dir()
    cleanup_old_states(sd)
    state_path = sd / f"delegation-state-{sid_safe}.json"
    state = load_state(state_path)
    fired = None
    if tool in EXPLORE_TOOLS:
        state["explore_chain"].append(tool)
        state["edit_files"] = []
        if len(state["explore_chain"]) >= EXPLORE_THRESHOLD:
            fired = {
                "pattern": "explore_chain",
                "count": len(state["explore_chain"]),
                "tools": list(state["explore_chain"]),
                "suggestion": (
                    "Considerar Agent({subagent_type:'Explore'}) — "
                    "exploracao ampla cabe em Sonnet read-only."
                ),
            }
    elif tool in EDIT_TOOLS:
        tool_input = data.get("tool_input", {}) or {}
        file_path = tool_input.get("file_path") or ""
        if file_path and file_path not in state["edit_files"]:
            state["edit_files"].append(file_path)
        state["explore_chain"] = []
        if len(state["edit_files"]) >= EDIT_THRESHOLD:
            fired = {
                "pattern": "edit_distinct",
                "count": len(state["edit_files"]),
                "files": list(state["edit_files"]),
                "suggestion": (
                    "Considerar Agent({model:'sonnet'}) com brief curto — "
                    "edits mecanicos em N arquivos distintos."
                ),
            }
    elif tool in RESET_TOOLS:
        state["explore_chain"] = []
        state["edit_files"] = []
    save_state(state_path, state)
    if fired:
        entry = {
            "ts": datetime.now().astimezone().isoformat(timespec="seconds"),
            "session_id": session_id,
            "cwd": os.environ.get("CLAUDE_PROJECT_DIR") or data.get("cwd") or "",
            **fired,
        }
        append_log(entry)


if __name__ == "__main__":
    main()
