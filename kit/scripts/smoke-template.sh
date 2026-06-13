#!/usr/bin/env bash
# scripts/smoke-e0X.sh — smoke test do (sub-)épico E0X
#
# Executável ao fim de cada task do épico (gate informal de pre-merge).
# Skeleton: troque `todo "..."` por `check "label" <comando>` conforme as tasks fecham.
# Uso: bash scripts/smoke-e0X.sh
# Saída: contador PASS/FAIL/TODO + exit 0 (tudo PASS ou ainda skeleton) / 1 (qualquer FAIL).

set -euo pipefail

# ---- helpers (inline · zero deps) ----
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
PASS=0; FAIL=0; TODO=0

section() { echo; echo "─── $1 ───"; }

check() {  # uso: check "label" comando args...
  local label="$1"; shift
  if "$@" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ PASS${NC} $label"; PASS=$((PASS+1))
  else
    echo -e "  ${RED}✗ FAIL${NC} $label"; FAIL=$((FAIL+1))
  fi
}

todo() { echo -e "  ${YELLOW}⊘ TODO${NC} $1"; TODO=$((TODO+1)); }

# ---- checks (substitua os todos conforme as tasks do épico fecham) ----
section "E0X — <nome do épico>"

todo "T0X.01: <AC a verificar — ex.: migration aplicada / arquivo existe / teste passa>"
# Exemplo de check real:
# check "T0X.01: migration de schema existe" test -f supabase/migrations/0001_init.sql
# check "T0X.02: RPC definido"               bash -c "grep -q 'create function minha_rpc' supabase/migrations/*.sql"

# ---- sumário ----
echo
echo -e "  ${GREEN}PASS=$PASS${NC}  ${RED}FAIL=$FAIL${NC}  ${YELLOW}TODO=$TODO${NC}"
[ "$FAIL" -gt 0 ] && exit 1
echo "SMOKE OK${TODO:+ (skeleton: $TODO checks pendentes)}"
exit 0
