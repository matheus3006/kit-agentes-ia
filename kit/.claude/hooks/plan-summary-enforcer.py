#!/usr/bin/env python3
"""Hook reforcador de resumo de plano. NAO bloqueia.

Apos ExitPlanMode, injeta reminder pedindo o bloco '# Resumo do plano'
com 4 secoes obrigatorias (O QUE / POR QUE / COMO / RISCOS).
"""
import json
import os
import sys
from datetime import datetime
from pathlib import Path

REMINDER = (
    "REMINDER: voce acabou de apresentar um plano via ExitPlanMode. "
    "Antes de iniciar execucao (ou ao fim deste turn), entregue um bloco "
    "final em PT-BR — # Resumo do plano — com 4 secoes obrigatorias:\n"
    "1) **O QUE** — entrega final em 2-4 bullets.\n"
    "2) **POR QUE** — motivacao humana e constraints "
    "(hipotese de risco, ADR, invariante critica).\n"
    "3) **COMO** — sequencia de execucao em fases ou steps numerados, citando arquivos.\n"
    "4) **RISCOS** — riscos concretos com impacto + mitigacao. "
    "Se nao houver risco real, escreva 'nenhum identificado'; nunca omita a secao."
)


def state_dir() -> Path:
    p = Path.home() / ".claude" / "state" / "agent-context"
    p.mkdir(parents=True, exist_ok=True)
    return p


def append_log(entry: dict) -> None:
    log_path = state_dir() / "plan-summaries.jsonl"
    try:
        with log_path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    except Exception:
        pass


def main() -> None:
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)
    if (
        data.get("hook_event_name") != "PostToolUse"
        or data.get("tool_name") != "ExitPlanMode"
    ):
        sys.exit(0)
    append_log(
        {
            "ts": datetime.now().astimezone().isoformat(timespec="seconds"),
            "session_id": data.get("session_id", "unknown"),
            "cwd": data.get("cwd", os.getcwd()),
        }
    )
    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": "PostToolUse",
                    "additionalContext": REMINDER,
                }
            },
            ensure_ascii=False,
        )
    )
    sys.exit(0)


if __name__ == "__main__":
    main()
