#!/usr/bin/env python3
"""Teste de regressão do context-control-watchdog.

Verifica a resiliência à troca de session_id (bug `approval-without-active`)
SEM afrouxar o gate. Roda o hook como subprocesso com HOME + CLAUDE_PROJECT_DIR
isolados em diretórios temporários — não toca no estado real (~/.claude/state)
nem no repositório.

Uso:  python3 .claude/hooks/test_context_control_watchdog.py [caminho-do-hook]
Esperado: 4/4 no hook corrigido; 2/4 no hook com o bug de keying por sessão
(cenários A2/A3 falham — o bug; B/C passam — o gate continua firme).
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HOOK = sys.argv[1] if len(sys.argv) > 1 else str(
    Path(__file__).with_name("context-control-watchdog.py")
)


def run(home, proj, payload):
    env = {**os.environ, "HOME": home, "CLAUDE_PROJECT_DIR": proj}
    env.pop("CONTEXT_CONTROL", None)
    subprocess.run(
        [sys.executable, HOOK],
        input=json.dumps(payload),
        capture_output=True,
        text=True,
        env=env,
    )


def last_log(home):
    logp = Path(home) / ".claude" / "state" / "agent-context" / "hooks.log"
    try:
        lines = [ln for ln in logp.read_text().splitlines() if ln.strip()]
        return json.loads(lines[-1]) if lines else {}
    except FileNotFoundError:
        return {}


def mk_task(proj, fase, tipo="normal", trivial_ledger=False):
    td = Path(proj) / "controle" / "T"
    td.mkdir(parents=True, exist_ok=True)
    (td / "LIMITES.md").write_text("# Limites\nescopo\n")
    (td / "PLANO.html").write_text("<!doctype html><html><body>plano</body></html>\n")
    (td / "ESTADO.md").write_text(f"---\nfase: {fase}\ntipo: {tipo}\n---\n# Estado\n")
    ledger = "# Ledger\n" + ("Auto-aprovado por triviabilidade\n" if trivial_ledger else "")
    (td / "LEDGER.md").write_text(ledger)


results = []


def check(name, cond, detail=""):
    results.append(cond)
    print(("PASS" if cond else "FAIL"), "-", name, ("" if cond else f":: {detail}"))


def main():
    # Scenario A: declaração e aprovação/execução em session_ids diferentes (o bug)
    home_a = tempfile.mkdtemp()
    proj_a = tempfile.mkdtemp()
    mk_task(proj_a, "aprovacao")
    # turno 1 (sess-A): control-edit -> set_active
    run(home_a, proj_a, {
        "hook_event_name": "PostToolUse", "tool_name": "Edit",
        "tool_input": {"file_path": f"{proj_a}/controle/T/ESTADO.md"},
        "session_id": "sess-A",
    })
    # turno 2 (sess-B): usuário aprova
    run(home_a, proj_a, {
        "hook_event_name": "UserPromptSubmit", "prompt": "aprovado",
        "session_id": "sess-B",
    })
    log = last_log(home_a)
    check("A2 approval registra cross-session", log.get("reason") == "approval", str(log))
    # turno 3 (sess-C): fase->execucao, edit externo
    Path(f"{proj_a}/controle/T/ESTADO.md").write_text(
        "---\nfase: execucao\ntipo: normal\n---\n# Estado\n"
    )
    run(home_a, proj_a, {
        "hook_event_name": "PreToolUse", "tool_name": "Edit",
        "tool_input": {"file_path": f"{proj_a}/lib/foo.dart"},
        "session_id": "sess-C",
    })
    log = last_log(home_a)
    check("A3 edit externo allowed cross-session",
          log.get("reason") == "external-edit-allowed", str(log))

    # Scenario B: gate firme — fase != execucao deve NEGAR
    home_b = tempfile.mkdtemp()
    proj_b = tempfile.mkdtemp()
    mk_task(proj_b, "aprovacao")
    run(home_b, proj_b, {
        "hook_event_name": "PreToolUse", "tool_name": "Edit",
        "tool_input": {"file_path": f"{proj_b}/lib/foo.dart"},
        "session_id": "sess-X",
    })
    log = last_log(home_b)
    check("B fase!=execucao NEGA", log.get("decision") == "deny", str(log))

    # Scenario C: gate firme — execucao sem aprovação deve NEGAR
    home_c = tempfile.mkdtemp()
    proj_c = tempfile.mkdtemp()
    mk_task(proj_c, "execucao")  # tipo normal, sem trivial, sem approval file
    run(home_c, proj_c, {
        "hook_event_name": "PreToolUse", "tool_name": "Edit",
        "tool_input": {"file_path": f"{proj_c}/lib/foo.dart"},
        "session_id": "sess-Y",
    })
    log = last_log(home_c)
    check("C execucao sem aprovacao NEGA", log.get("decision") == "deny", str(log))

    # Scenario D: gate firme — task NÃO-concluída estagnada (>24h sem toque) não
    # pode ser derivada como active (senão trivial-autoapproval reabriria o gate).
    home_d = tempfile.mkdtemp()
    proj_d = tempfile.mkdtemp()
    mk_task(proj_d, "execucao", tipo="trivial", trivial_ledger=True)
    estado_d = f"{proj_d}/controle/T/ESTADO.md"
    stale = os.path.getmtime(estado_d) - 90000  # ~25h atrás
    os.utime(estado_d, (stale, stale))
    run(home_d, proj_d, {
        "hook_event_name": "PreToolUse", "tool_name": "Edit",
        "tool_input": {"file_path": f"{proj_d}/lib/foo.dart"},
        "session_id": "sess-Z",
    })
    log = last_log(home_d)
    check("D1 trivial+execucao estagnada (>24h) NAO vira active",
          log.get("decision") == "deny", str(log))
    os.utime(estado_d, None)  # mtime = agora -> mesma task volta a ser derivável
    run(home_d, proj_d, {
        "hook_event_name": "PreToolUse", "tool_name": "Edit",
        "tool_input": {"file_path": f"{proj_d}/lib/foo.dart"},
        "session_id": "sess-Z2",
    })
    log = last_log(home_d)
    check("D2 mesma task com mtime fresco vira active (trivial) -> allow",
          log.get("reason") == "external-edit-allowed", str(log))

    for d in (home_a, proj_a, home_b, proj_b, home_c, proj_c, home_d, proj_d):
        shutil.rmtree(d, ignore_errors=True)

    print(f"\nSUMMARY: {sum(1 for c in results if c)} / {len(results)} passed")
    sys.exit(0 if all(results) else 1)


if __name__ == "__main__":
    main()
