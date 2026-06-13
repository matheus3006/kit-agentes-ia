#!/usr/bin/env python3
"""Hook sincronizador de status do roadmap. NAO bloqueia.

Detecta edicoes em controle/<task-id>/ESTADO.md e propaga a fase para o
arquivo de task no roadmap. O slug deve conter T##.NN para ser sincronizado.

fase concluida   -> status: done       + checkbox [x] no epico
qualquer ativa   -> status: in_progress (sem mudar checkbox)
"""
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

EDIT_TOOLS = {"Edit", "Write", "MultiEdit"}
ROADMAP_TASK_REGEX = re.compile(r"t(\d{2})[.\-](\d{2})", re.IGNORECASE)
ESTADO_PATH_REGEX = re.compile(r"controle/([^/]+)/ESTADO\.md$")
TERMINAL_PHASE = "concluida"
ACTIVE_PHASES = {
    "limites",
    "planejamento",
    "aprovacao",
    "execucao",
    "verificacao",
}


def state_dir() -> Path:
    p = Path.home() / ".claude" / "state" / "agent-context"
    p.mkdir(parents=True, exist_ok=True)
    return p


def log_event(entry: dict) -> None:
    try:
        with (state_dir() / "roadmap-status-log.jsonl").open(
            "a", encoding="utf-8"
        ) as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    except Exception:
        pass


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def read_frontmatter_field(text: str, field: str):
    if not text.startswith("---"):
        return None
    end = text.find("\n---", 3)
    if end == -1:
        return None
    match = re.search(
        r"^\s*" + re.escape(field) + r"\s*:\s*(.+?)\s*$",
        text[3:end],
        re.MULTILINE,
    )
    return match.group(1).strip().strip("'\"") if match else None


def update_frontmatter_field(text: str, field: str, new_value: str):
    if not text.startswith("---"):
        return text, False
    end = text.find("\n---", 3)
    if end == -1:
        return text, False
    head, tail = text[:end], text[end:]
    new_head, count = re.compile(
        r"^(" + re.escape(field) + r")\s*:\s*.+?\s*$", re.MULTILINE
    ).subn(rf"\1: {new_value}", head)
    if count == 0 or new_head == head:
        return text, False
    return new_head + tail, True


def find_task_file(project_root: Path, epic_num: str, task_num: str):
    epic_dir = project_root / "docs" / "roadmap" / f"E{epic_num}"
    if not epic_dir.exists():
        return None
    candidates = sorted(epic_dir.glob(f"T{epic_num}.{task_num}-*.md"))
    return candidates[0] if candidates else None


def find_epic_index_file(project_root: Path, epic_num: str):
    roadmap_dir = project_root / "docs" / "roadmap"
    if not roadmap_dir.exists():
        return None
    candidates = sorted(roadmap_dir.glob(f"E{epic_num}-*.md"))
    return candidates[0] if candidates else None


def update_epic_checkbox(epic_file: Path, task_label: str, mark_done: bool) -> bool:
    text = epic_file.read_text(encoding="utf-8")
    pattern = re.compile(
        r"^(- \[)([ x])(\] \[" + re.escape(task_label) + r"[^\]]*\][^\n]*)$",
        re.MULTILINE,
    )
    new_text, count = pattern.subn(rf"\1{'x' if mark_done else ' '}\3", text)
    if count == 0 or new_text == text:
        return False
    epic_file.write_text(new_text, encoding="utf-8")
    return True


def main() -> None:
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
    if not file_path:
        sys.exit(0)
    path_match = ESTADO_PATH_REGEX.search(file_path)
    if not path_match:
        sys.exit(0)
    task_id_full = path_match.group(1)
    roadmap_match = ROADMAP_TASK_REGEX.search(task_id_full)
    if not roadmap_match:
        sys.exit(0)
    epic_num, task_num = roadmap_match.group(1), roadmap_match.group(2)
    task_label = f"T{epic_num}.{task_num}"
    estado_path = Path(file_path)
    if not estado_path.exists():
        sys.exit(0)
    try:
        estado_text = estado_path.read_text(encoding="utf-8")
    except Exception:
        sys.exit(0)
    fase = (read_frontmatter_field(estado_text, "fase") or "").strip().lower()
    if fase == TERMINAL_PHASE:
        new_status = "done"
    elif fase in ACTIVE_PHASES:
        new_status = "in_progress"
    else:
        sys.exit(0)
    project_root = Path(
        os.environ.get("CLAUDE_PROJECT_DIR") or data.get("cwd") or os.getcwd()
    ).resolve()
    task_file = find_task_file(project_root, epic_num, task_num)
    if task_file is None:
        sys.exit(0)
    try:
        task_text = task_file.read_text(encoding="utf-8")
    except Exception:
        sys.exit(0)
    old_status = (
        (read_frontmatter_field(task_text, "status") or "unknown").strip().lower()
    )
    if old_status == new_status:
        sys.exit(0)
    new_text, changed = update_frontmatter_field(task_text, "status", new_status)
    if changed:
        task_file.write_text(new_text, encoding="utf-8")
    epic_changed = False
    epic_file = find_epic_index_file(project_root, epic_num)
    if epic_file:
        try:
            epic_changed = update_epic_checkbox(
                epic_file, task_label, new_status == "done"
            )
        except Exception:
            pass
    log_event(
        {
            "ts": now_iso(),
            "event": "sync",
            "task_label": task_label,
            "fase": fase,
            "old_status": old_status,
            "new_status": new_status,
            "task_file_updated": changed,
            "epic_checkbox_updated": epic_changed,
        }
    )
    sys.exit(0)


if __name__ == "__main__":
    main()
