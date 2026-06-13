#!/usr/bin/env python3
"""Hook central de controle de contexto.

Bloqueia edicoes de producao (fora de CONTROL_DIR) sem uma task ativa, planejada
e aprovada. Tambem gateia edicoes em PROTOTYPE_DIR/<task-id>/ ao fluxo de
prototipo HTML+JSX. E o unico hook do kit que pode NEGAR uma edicao.

Para adaptar a um projeto novo, edite apenas o bloco CONFIG abaixo. O restante
do codigo e agnostico de projeto. Veja guia/ADAPTACAO.md.
"""
import hashlib
import json
import os
import re
import sys
import time
from datetime import datetime
from pathlib import Path

# ===== CONFIG (edite para o seu projeto) ===================================
# Pasta de estado em ~/.claude/state/<STATE_NAMESPACE>/. Os arquivos de estado
# sao keyados por SHA1 da raiz do projeto, entao a pasta pode ser compartilhada
# entre varios projetos sem colisao. Renomear e opcional (so organiza/depura).
STATE_NAMESPACE = "agent-context"
# Env var que desliga o watchdog por completo quando vale "off".
KILL_SWITCH_ENV = "CONTEXT_CONTROL"
# Diretorio de controle (relativo a raiz). Edicoes aqui sao sempre liberadas.
CONTROL_DIR = "controle"
# Diretorio de prototipos. Edicoes aqui seguem o gate de fase do prototipo.
PROTOTYPE_DIR = "prototipos_html"
# Checklist lembrado quando o prompt menciona tela/prototipo/frontend.
PROTOTYPE_CHECKLIST = "docs/frontend/html-prototype-checklist.md"
# ===========================================================================

EDIT_TOOLS = {"Edit", "Write", "MultiEdit"}
VALID_PHASES = {
    "limites",
    "planejamento",
    "aprovacao",
    "execucao",
    "verificacao",
    "concluida",
}
APPROVAL_PHRASES = {"aprovado", "aprovar", "pode executar", "/aprovar-plano"}
CAPS = {
    "LIMITES.md": 80,
    "PLANO.html": 120,
    "ESTADO.md": 60,
    "LEDGER.md": 150,
}

PROTOTYPE_PROMPT_KEYWORDS = {
    "prototipo",
    "protótipo",
    "prototype",
    "tela",
    "screen",
    "componente",
    "component",
    "jsx",
    "showcase",
}
PROTOTYPE_TASK_KEYWORDS = {
    "prototipo",
    "protótipo",
    "tela",
    "screen",
    "jsx",
    "componente",
    "frontend",
    "fe",
}
VALID_PROTOTYPE_PHASES = {"componentes", "showcase", "estados", "revisao"}

NON_CONCLUDED_PHASES = VALID_PHASES - {"concluida"}


def now_iso():
    return datetime.now().astimezone().isoformat(timespec="seconds")


def load_stdin():
    try:
        return json.load(sys.stdin)
    except Exception:
        return {}


def project_root(data):
    root = os.environ.get("CLAUDE_PROJECT_DIR") or data.get("cwd") or os.getcwd()
    return Path(root).resolve()


def state_dir():
    path = Path.home() / ".claude" / "state" / STATE_NAMESPACE
    path.mkdir(parents=True, exist_ok=True)
    return path


def write_json(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def read_json(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None


def log_event(data, decision, reason):
    try:
        line = json.dumps(
            {
                "ts": now_iso(),
                "event": data.get("hook_event_name"),
                "tool": data.get("tool_name"),
                "decision": decision,
                "reason": reason,
            },
            ensure_ascii=False,
        )
        with (state_dir() / "hooks.log").open("a", encoding="utf-8") as fh:
            fh.write(line + "\n")
    except Exception:
        pass


def output(payload):
    print(json.dumps(payload, ensure_ascii=False))


def allow(data, reason="allow", additional_context=None):
    log_event(data, "allow", reason)
    if additional_context:
        output(
            {
                "hookSpecificOutput": {
                    "hookEventName": data.get("hook_event_name"),
                    "additionalContext": additional_context,
                }
            }
        )
    sys.exit(0)


def deny_pre(data, reason):
    log_event(data, "deny", reason)
    output(
        {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": reason,
            }
        }
    )
    sys.exit(0)


def block(data, reason):
    log_event(data, "block", reason)
    output({"decision": "block", "reason": reason})
    sys.exit(0)


def state_key(data):
    """Chave de estado estável por projeto/worktree (NÃO por session_id).

    O session_id rotaciona entre turnos nesta plataforma: o active-task e o
    approval gravados num turno ficavam num arquivo `*-{session_id}.json` que o
    turno seguinte (outro session_id) não encontrava — daí o bug
    `approval-without-active`. Keyar por project-root deixa o estado estável
    entre turnos e isola worktrees concorrentes (cada root tem seu arquivo).
    """
    root = str(project_root(data))
    return hashlib.sha1(root.encode("utf-8")).hexdigest()[:16]


def active_path(data):
    return state_dir() / f"active-{state_key(data)}.json"


def approval_path(data):
    return state_dir() / f"approval-{state_key(data)}.json"


def bypass_path(data):
    return state_dir() / f"no-control-{state_key(data)}.json"


def edit_state_path(data):
    return state_dir() / f"edit-{state_key(data)}.json"


def is_old(path, max_age_seconds=86400):
    try:
        return time.time() - path.stat().st_mtime > max_age_seconds
    except FileNotFoundError:
        return True


def cleanup_old_state():
    cutoff = time.time() - 86400
    for path in state_dir().glob("*.json"):
        try:
            if path.stat().st_mtime < cutoff:
                path.unlink()
        except OSError:
            pass


def normalize_slug(slug):
    slug = re.sub(r"[^a-z0-9]+", "-", slug.strip().lower())
    return re.sub(r"-+", "-", slug).strip("-") or "tarefa"


def control_dir(root):
    return root / CONTROL_DIR


def prototype_dir(root):
    return root / PROTOTYPE_DIR


def _is_inside(path_str, base):
    try:
        path = Path(path_str).resolve(strict=False)
        return path.is_relative_to(base.resolve(strict=False))
    except Exception:
        return False


def is_control_path(root, file_path):
    return _is_inside(file_path, control_dir(root))


def is_prototype_path(root, file_path):
    return _is_inside(file_path, prototype_dir(root))


def prototype_task_id_from_path(root, file_path):
    try:
        rel = (
            Path(file_path)
            .resolve(strict=False)
            .relative_to(prototype_dir(root).resolve(strict=False))
        )
        return rel.parts[0] if rel.parts else None
    except Exception:
        return None


def tool_file_path(data):
    tool_input = data.get("tool_input") or {}
    return tool_input.get("file_path") or tool_input.get("path") or ""


def read_frontmatter(path):
    try:
        text = path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return {}
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    if end == -1:
        return {}
    values = {}
    for line in text[3:end].strip().splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            values[k.strip()] = v.strip().strip('"').strip("'")
    return values


def task_dir(root, task_id):
    return control_dir(root) / task_id


def estado_path(root, task_id):
    return task_dir(root, task_id) / "ESTADO.md"


def task_phase(root, task_id):
    return read_frontmatter(estado_path(root, task_id)).get("fase", "").lower()


def prototype_phase(root, task_id):
    return (
        read_frontmatter(estado_path(root, task_id))
        .get("fase_prototipo", "")
        .lower()
        .strip()
        or None
    )


def task_type(root, task_id):
    return read_frontmatter(estado_path(root, task_id)).get("tipo", "normal").lower()


def task_files(root, task_id):
    td = task_dir(root, task_id)
    return {
        "LIMITES.md": td / "LIMITES.md",
        "PLANO.html": td / "PLANO.html",
        "ESTADO.md": td / "ESTADO.md",
        "LEDGER.md": td / "LEDGER.md",
    }


def missing_task_files(root, task_id):
    return [n for n, p in task_files(root, task_id).items() if not p.exists()]


def line_count(path):
    try:
        return len(path.read_text(encoding="utf-8").splitlines())
    except FileNotFoundError:
        return 0


def cap_errors(root, task_id):
    errors = []
    for name, cap in CAPS.items():
        path = task_files(root, task_id).get(name)
        if path:
            count = line_count(path)
            if count > cap:
                errors.append(f"{name}>{cap} ({count})")
    return errors


def derive_active_task_id(root, max_age_seconds=86400):
    """Deriva a task ativa direto da fonte de verdade (controle/*/ESTADO.md).

    Fallback resiliente para quando o arquivo de active-task some — seja por
    troca de session_id, seja por limpeza no SessionEnd. Escolhe a task
    NÃO-concluída com ESTADO.md modificado mais recentemente.

    Só conta tasks tocadas nas últimas `max_age_seconds` (24h, mesmo TTL de
    is_old/approval): uma task não-concluída parada há semanas é ESQUECIDA, não
    "ativa". Sem esse limite, derivar uma task velha `tipo: trivial` em execucao
    reabriria o gate via has_trivial_autoapproval (que ignora o TTL do approval)
    sem o usuário declarar nada. O ciclo de vida real toca ESTADO.md a cada
    edit, então uma task em andamento sempre tem mtime fresco.
    """
    base = control_dir(root)
    if not base.is_dir():
        return None
    cutoff = time.time() - max_age_seconds
    best_mtime = -1.0
    best_task_id = None
    for estado in base.glob("*/ESTADO.md"):
        fase = read_frontmatter(estado).get("fase", "").lower().strip()
        if fase not in NON_CONCLUDED_PHASES:
            continue
        try:
            mtime = estado.stat().st_mtime
        except OSError:
            continue
        if mtime < cutoff:
            continue
        if mtime > best_mtime:
            best_mtime = mtime
            best_task_id = estado.parent.name
    return best_task_id


def load_active(data):
    root = project_root(data)
    path = active_path(data)
    if not is_old(path):
        payload = read_json(path)
        if (
            payload
            and payload.get("task_id")
            and task_phase(root, payload["task_id"]) != "concluida"
        ):
            return payload
    task_id = derive_active_task_id(root)
    if task_id:
        return {
            "task_id": task_id,
            "declared_at": now_iso(),
            "source": "derived-from-estado",
        }
    return None


def set_active(data, task_id):
    write_json(
        active_path(data),
        {"task_id": task_id, "declared_at": now_iso()},
    )


def has_valid_approval(data, task_id):
    path = approval_path(data)
    if is_old(path):
        return False
    payload = read_json(path) or {}
    return (
        payload.get("task_id") == task_id
        and payload.get("approval_phrase") in APPROVAL_PHRASES
    )


def has_trivial_autoapproval(root, task_id):
    if task_type(root, task_id) != "trivial":
        return False
    try:
        return "Auto-aprovado por triviabilidade" in (
            task_dir(root, task_id) / "LEDGER.md"
        ).read_text(encoding="utf-8")
    except FileNotFoundError:
        return False


def pending_update(data, root, task_id):
    state = read_json(edit_state_path(data)) or {}
    if state.get("task_id") != task_id or not state.get("pending_update"):
        return False
    last_edit = float(state.get("last_external_edit_at") or 0)
    files = task_files(root, task_id)
    try:
        return not (
            files["ESTADO.md"].stat().st_mtime > last_edit
            and files["LEDGER.md"].stat().st_mtime > last_edit
        )
    except FileNotFoundError:
        return True


def clear_pending_if_satisfied(data, root, task_id):
    state = read_json(edit_state_path(data)) or {}
    if state.get("task_id") != task_id or not state.get("pending_update"):
        return
    if not pending_update(data, root, task_id):
        state["pending_update"] = False
        state["cleared_at"] = now_iso()
        write_json(edit_state_path(data), state)


def choose_task_id(root, slug):
    today = datetime.now().astimezone().date().isoformat()
    base = f"{today}-{normalize_slug(slug)}"
    exact = task_dir(root, base)
    if exact.exists() and task_phase(root, base) != "concluida":
        return base
    if exact.exists() and task_phase(root, base) == "concluida":
        for index in range(2, 100):
            candidate = f"{base}-{index}"
            path = task_dir(root, candidate)
            if not path.exists() or task_phase(root, candidate) != "concluida":
                return candidate
    return base


def handle_user_prompt(data, root):
    cleanup_old_state()
    prompt = (data.get("prompt") or "").strip()
    lower = prompt.lower()
    if bypass_path(data).exists():
        try:
            bypass_path(data).unlink()
        except OSError:
            pass
    if lower.startswith("/no-control"):
        write_json(
            bypass_path(data),
            {"created_at": now_iso(), "prompt": prompt[:200]},
        )
        allow(
            data,
            "no-control",
            "Context control bypass ativo somente para este turno.",
        )
    if lower in APPROVAL_PHRASES or lower.startswith("/aprovar-plano"):
        active = load_active(data)
        if active:
            phrase = "/aprovar-plano" if lower.startswith("/aprovar-plano") else lower
            write_json(
                approval_path(data),
                {
                    "task_id": active["task_id"],
                    "approved_at": now_iso(),
                    "approval_phrase": phrase,
                },
            )
            allow(
                data,
                "approval",
                f"Plano aprovado para task ativa `{active['task_id']}`.",
            )
        allow(
            data,
            "approval-without-active",
            "Aprovação recebida, mas não há task ativa.",
        )
    match = re.match(
        r"nova tarefa:\s*([a-zA-Z0-9_.\-\s]+?)\s*-\s*(.+)",
        prompt,
        re.IGNORECASE | re.DOTALL,
    )
    if match:
        task_id = choose_task_id(root, match.group(1))
        set_active(data, task_id)
        allow(
            data,
            "new-task",
            f"Task ativa: `{task_id}`. Crie {CONTROL_DIR}/{task_id}/ antes de editar fora de {CONTROL_DIR}/.",
        )
    if any(kw in lower for kw in PROTOTYPE_PROMPT_KEYWORDS):
        allow(
            data,
            "prototype-prompt",
            f"OBRIGATORIO antes de task de frontend: ler {PROTOTYPE_CHECKLIST}. "
            f"Fluxo: {PROTOTYPE_DIR}/<task-id>/ (index.html + components/*.jsx) "
            "-> aprovacao -> implementacao no projeto.",
        )
    allow(data)


def handle_pre_tool(data, root):
    tool_name = data.get("tool_name") or ""
    if tool_name not in EDIT_TOOLS:
        allow(data)
    path = tool_file_path(data)
    if not path:
        allow(data, "no-file-path")
    if is_control_path(root, path):
        allow(data, "control-edit")
    if bypass_path(data).exists() and not is_old(bypass_path(data)):
        allow(data, "no-control-bypass")

    if is_prototype_path(root, path):
        active = load_active(data)
        if not active:
            deny_pre(
                data,
                "Declare/crie uma task ativa antes de editar em prototipos_html/.",
            )
        task_id = active["task_id"]
        missing = missing_task_files(root, task_id)
        if missing:
            deny_pre(
                data,
                f"Task ativa sem arquivos obrigatorios: {', '.join(missing)}.",
            )
        phase = task_phase(root, task_id)
        if phase not in VALID_PHASES:
            deny_pre(
                data,
                "ESTADO.md sem frontmatter valido ou fase desconhecida.",
            )
        if phase in {"limites", "planejamento", "aprovacao", "execucao"}:
            fase_proto = prototype_phase(root, task_id)
            if fase_proto and fase_proto not in VALID_PROTOTYPE_PHASES:
                deny_pre(
                    data,
                    f"fase_prototipo invalida: '{fase_proto}'. Use: {sorted(VALID_PROTOTYPE_PHASES)}.",
                )
            allow(data, "prototype-edit-allowed")
        deny_pre(
            data,
            f"Edicao em prototipos_html/ bloqueada na fase '{phase}'.",
        )

    active = load_active(data)
    if not active:
        deny_pre(
            data,
            "Declare/crie uma task ativa em controle/<task-id>/ antes de editar fora de controle/.",
        )
    task_id = active["task_id"]
    missing = missing_task_files(root, task_id)
    if missing:
        deny_pre(
            data,
            f"Task ativa sem arquivos obrigatorios: {', '.join(missing)}.",
        )
    phase = task_phase(root, task_id)
    if phase not in VALID_PHASES:
        deny_pre(
            data,
            "ESTADO.md sem frontmatter valido ou fase desconhecida.",
        )
    if phase != "execucao":
        deny_pre(
            data,
            "Plano ainda nao aprovado. Apresente PLANO.html ao usuario e aguarde aprovacao.",
        )
    if not (
        has_valid_approval(data, task_id) or has_trivial_autoapproval(root, task_id)
    ):
        deny_pre(
            data,
            "Execucao sem aprovacao valida. Use aprovacao canonica ou /aprovar-plano.",
        )
    errors = cap_errors(root, task_id)
    if errors:
        deny_pre(data, "Compact controle files first.")
    if pending_update(data, root, task_id):
        deny_pre(data, "Update ESTADO.md + LEDGER first.")
    allow(data, "external-edit-allowed")


def task_id_from_control_path(root, file_path):
    try:
        rel = (
            Path(file_path)
            .resolve(strict=False)
            .relative_to(control_dir(root).resolve(strict=False))
        )
        return rel.parts[0] if rel.parts else None
    except Exception:
        return None


def handle_post_tool(data, root):
    if data.get("tool_name") not in EDIT_TOOLS:
        allow(data)
    path = tool_file_path(data)
    if not path:
        allow(data, "no-file-path")
    if is_control_path(root, path):
        task_id = task_id_from_control_path(root, path)
        if task_id:
            set_active(data, task_id)
            clear_pending_if_satisfied(data, root, task_id)
            errors = cap_errors(root, task_id)
            if errors:
                block(data, "Compact controle files first.")
        allow(data, "control-edit")
    if is_prototype_path(root, path):
        allow(data, "prototype-edit-post")
    active = load_active(data)
    if not active:
        allow(data, "external-edit-without-active-post")
    write_json(
        edit_state_path(data),
        {
            "task_id": active["task_id"],
            "last_external_edit_at": time.time(),
            "pending_update": True,
            "file_path": path,
        },
    )
    block(data, "Update ESTADO.md + LEDGER first.")


def handle_session_end(data):
    # D-FIX-Hook-2 (estende D-FIX-Hook-1) · Preservar active+approval enquanto a
    # task ativa NAO esta concluida. O D-FIX-Hook-1 preservava so execucao/
    # verificacao; como o session_id rotaciona entre turnos e o approval
    # canonico acontece em fase=aprovacao, limpar nessas fases reabria o bug
    # 'approval-without-active' no turno seguinte. bypass + edit_state seguem
    # turn-scoped (sempre deletados). O cleanup de 24h continua sendo o GC real.
    preserve_active_approval = False
    active = load_active(data)
    if active:
        root = project_root(data)
        if task_phase(root, active["task_id"]) != "concluida":
            preserve_active_approval = True

    paths_to_unlink = [bypass_path(data), edit_state_path(data)]
    if not preserve_active_approval:
        paths_to_unlink.extend([active_path(data), approval_path(data)])

    for path in paths_to_unlink:
        try:
            path.unlink()
        except (FileNotFoundError, OSError):
            pass
    cleanup_old_state()
    allow(data, "session-end")


def main():
    data = load_stdin()
    if os.environ.get(KILL_SWITCH_ENV, "").lower() == "off":
        allow(data, "disabled")
    root = project_root(data)
    event = data.get("hook_event_name")
    if event == "UserPromptSubmit":
        handle_user_prompt(data, root)
    elif event == "PreToolUse":
        handle_pre_tool(data, root)
    elif event == "PostToolUse":
        handle_post_tool(data, root)
    elif event == "SessionEnd":
        handle_session_end(data)
    else:
        allow(data, "unhandled-event")


if __name__ == "__main__":
    main()
