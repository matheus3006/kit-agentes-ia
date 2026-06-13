#!/usr/bin/env python3
"""Hook lembrete da vitrine multi-superficie. NAO bloqueia (advisory).

Dispara quando uma task de frontend fecha (controle/<task-id>/ESTADO.md ->
fase: concluida) SEM evidencia de ter refletido a tela aprovada no prototipo
consolidado da sua superficie (ver SURFACES no CONFIG). Emite um lembrete
via additionalContext — torna deterministica a regra que antes era so memoria.

Regra fixa (memoria feedback-vitrine-prototipos · AGENTS.md · checklist FE ·
skill execute-closure · padrao consolidado do vitrine-sync #72-#75): toda tela
APROVADA vai pro consolidado da superficie + bump ?v= + redeploy git da vitrine.

Heuristica:
- so age em controle/<task-id>/ESTADO.md com fase=concluida;
- superficie detectada por marcadores em ESTADO+LEDGER (SURFACES); superficie
  cujo consolidado ja e' citado conta como sincronizada -> fica fora do
  lembrete (evita auto-nag da propria sync); todas sincronizadas -> silencio;
- marcador FE generico sem superficie identificavel -> lembrete lista os 3
  consolidados (silencia se qualquer um ja for citado).
Qualquer erro -> exit 0 (nunca bloqueia o fluxo).
"""
import json
import re
import sys
from pathlib import Path

EDIT_TOOLS = {"Edit", "Write", "MultiEdit"}
ESTADO_PATH_REGEX = re.compile(r"controle/([^/]+)/ESTADO\.md$")
TERMINAL_PHASE = "concluida"

# \bboard\b / \badmin\b: word boundary evita falso positivo em "onboarding";
# recall > precisao — falso positivo custa um lembrete advisory ignoravel,
# falso negativo custa drift na vitrine.
# ===== CONFIG (edite para o seu projeto) ===================================
# Nome do alvo de redeploy da vitrine (repo/projeto que faz auto-deploy ao push).
VITRINE_DEPLOY_TARGET = "<seu-repo-de-vitrine>"
# Cada superficie de frontend tem um prototipo consolidado em
# prototipos_html/<consolidated>/. 'markers' = strings que, se aparecem em
# ESTADO/LEDGER da task, identificam a superficie. 'word_regex' (opcional) usa
# palavra p/ evitar falso-positivo de substring (ex.: "board" em "onboarding").
SURFACES = (
    {
        "label": "#app",
        "consolidated": "AAAA-MM-DD-app-mvp",
        "markers": ("apps/mobile", "#app", "presentation/"),
        "word_regex": None,
    },
    # Exemplos adicionais — descomente e ajuste por superficie do seu projeto:
    # {"label": "#board", "consolidated": "AAAA-MM-DD-board-mvp",
    #  "markers": ("#board", "apps/web/app/board"),
    #  "word_regex": re.compile(r"board")},
    # {"label": "#admin", "consolidated": "AAAA-MM-DD-admin-mvp",
    #  "markers": ("#admin", "apps/web/app/admin"),
    #  "word_regex": re.compile(r"admin")},
)
# ===========================================================================
GENERIC_FE_MARKERS = ("prototipos_html", "fe-only", "nova-tela-fe")


def build_reminder(surfaces):
    targets = " · ".join(
        f"{s['label']} (prototipos_html/{s['consolidated']}/)" for s in surfaces
    )
    return (
        "Vitrine: esta task de frontend fechou. Regra fixa "
        "(feedback-vitrine-prototipos · AGENTS.md · execute-closure): reflita a "
        f"tela APROVADA no consolidado da superficie — {targets} — com merge "
        "DENTRO do consolidado (nao aba nova no hub) + bump ?v= em TODAS as "
        f"tags + REDEPLOY git da vitrine (commit+push -> {VITRINE_DEPLOY_TARGET} "
        "auto-deploy; NUNCA vercel --prod local) + conferir o live antes de "
        "encerrar de vez. Se ja refletiu ou a superficie nao se aplica, ignore."
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


def matches_surface(low, surface):
    if any(marker.lower() in low for marker in surface["markers"]):
        return True
    return bool(surface["word_regex"] and surface["word_regex"].search(low))


def pending_surfaces(low):
    detected = [s for s in SURFACES if matches_surface(low, s)]
    if detected:
        return [s for s in detected if s["consolidated"].lower() not in low]
    if not any(marker in low for marker in GENERIC_FE_MARKERS):
        return []
    if any(s["consolidated"].lower() in low for s in SURFACES):
        return []
    return list(SURFACES)


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
    pending = pending_surfaces(text.lower())
    if not pending:
        sys.exit(0)
    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": "PostToolUse",
                    "additionalContext": build_reminder(pending),
                }
            }
        )
    )
    sys.exit(0)


if __name__ == "__main__":
    main()
