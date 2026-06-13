#!/usr/bin/env python3
"""Teste de disparo do vitrine-sync-reminder (kit generico).

Roda o hook como subprocesso com ESTADO.md/LEDGER.md em diretorio temporario —
nao toca no repositorio. Alinhado a config DEFAULT do kit (uma superficie #app
em SURFACES). Ao adicionar superficies no CONFIG do hook (ex.: #board com
word_regex), acrescente cenarios analogos aqui — inclusive um de word-boundary.

Uso:  python3 .claude/hooks/test_vitrine_sync_reminder.py [caminho-do-hook]
Esperado: todos os cenarios PASS (exit 0); qualquer FAIL -> exit 1.
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

HOOK = sys.argv[1] if len(sys.argv) > 1 else str(
    Path(__file__).with_name("vitrine-sync-reminder.py")
)

APP = "AAAA-MM-DD-app-mvp"  # slug 'consolidated' da superficie default #app


def estado(body, fase="concluida", indent=""):
    return f"---\n{indent}fase: {fase}\n---\n\n# ESTADO\n\n{body}\n"


def run_hook(estado_text, ledger_text=None, tool_name="Write", file_name="ESTADO.md"):
    """Retorna (exit_code, additionalContext | None)."""
    with tempfile.TemporaryDirectory() as tmp:
        task_dir = Path(tmp) / "controle" / "AAAA-MM-DD-task-x"
        task_dir.mkdir(parents=True)
        target = task_dir / file_name
        target.write_text(estado_text, encoding="utf-8")
        if ledger_text is not None:
            (task_dir / "LEDGER.md").write_text(ledger_text, encoding="utf-8")
        payload = {
            "hook_event_name": "PostToolUse",
            "tool_name": tool_name,
            "tool_input": {"file_path": str(target)},
        }
        proc = subprocess.run(
            [sys.executable, HOOK],
            input=json.dumps(payload),
            capture_output=True,
            text=True,
        )
        if not proc.stdout.strip():
            return proc.returncode, None
        out = json.loads(proc.stdout)
        return proc.returncode, out["hookSpecificOutput"]["additionalContext"]


FAILURES = []


def check(name, result, contains=(), not_contains=(), silent=False):
    code, reminder = result
    ok = code == 0
    if silent:
        ok = ok and reminder is None
    else:
        ok = (
            ok
            and reminder is not None
            and all(c in reminder for c in contains)
            and not any(c in reminder for c in not_contains)
        )
    print(("PASS" if ok else "FAIL") + f" · {name}")
    if not ok:
        FAILURES.append((name, code, reminder))


# superficie #app pendente (marcador apps/mobile) -> lembra o consolidado
check(
    "#app pendente -> lembra o consolidado",
    run_hook(estado("Tela FE-only no app (apps/mobile · presentation/).")),
    contains=(APP,),
)
# FE generico sem superficie especifica -> lista as superficies configuradas (#app)
check(
    "FE generico sem superficie -> lembra superficies configuradas",
    run_hook(estado("Nova tela aprovada via nova-tela-fe · showcase fe-only.")),
    contains=(APP,),
)
# anti auto-nag: consolidado citado = sincronizado -> silencio
check(
    "#app ja citando o consolidado -> silencio",
    run_hook(estado(f"Refletido em prototipos_html/{APP}/ + ?v= bump.")),
    silent=True,
)
# regressao fase indentada no frontmatter (ancora ^\s*) -> dispara igual
check(
    "fase indentada -> dispara",
    run_hook(estado("Tela do app (apps/mobile) fe-only.", indent="  ")),
    contains=(APP,),
)
# silencios
check(
    "fase=execucao -> silencio",
    run_hook(estado("Tela do app (apps/mobile) fe-only.", fase="execucao")),
    silent=True,
)
check(
    "task nao-FE -> silencio",
    run_hook(estado("Ajuste no backend de pagamento (HMAC + idempotencia).")),
    silent=True,
)
check(
    "tool nao-edit -> silencio",
    run_hook(estado("Tela do app (apps/mobile) fe-only."), tool_name="Read"),
    silent=True,
)
check(
    "path nao-ESTADO -> silencio",
    run_hook(estado("Tela do app (apps/mobile) fe-only."), file_name="NOTAS.md"),
    silent=True,
)
# deteccao via LEDGER (nao so ESTADO) -> dispara
check(
    "superficie citada so no LEDGER -> dispara",
    run_hook(
        estado("Closure da task."),
        ledger_text="Evidencias: tela aprovada em apps/mobile · presentation/.",
    ),
    contains=(APP,),
)

if FAILURES:
    print(f"\n{len(FAILURES)} cenario(s) FALHARAM:")
    for name, code, reminder in FAILURES:
        print(f"  - {name} · exit={code} · reminder={reminder!r}")
    sys.exit(1)
print("\nTodos os cenarios PASS.")
