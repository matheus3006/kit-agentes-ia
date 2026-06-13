#!/usr/bin/env bash
# check-pii-logs.sh — guard contra PII de Cliente em logs (LGPD · CLAUDE.md · ADR-0021).
#
# Falha (exit 1) se encontrar chamadas de log que exponham telefone/cpf/email do
# Cliente, ou que serializem objetos sensíveis inteiros (customer/order/payer/address).
# Pensado para integrar ao CI ANTES de E3 (Sentry/Crashlytics) ampliar a superfície.
#
# Uso: bash scripts/check-pii-logs.sh
# Portável macOS (BSD grep): sem \b, usa --exclude-dir.

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SCAN_DIRS=(supabase/functions apps/web/app apps/web/lib apps/web/components tools)
EXCLUDES=(--exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist --exclude-dir=build --exclude-dir=.git)

LOG_CALL='(console\.(log|error|warn|info|debug)|print|debugPrint)'

# Padrões de risco (ERE, sem \b para compatibilidade BSD/GNU):
PATTERNS=(
  # campo PII direto em log: .phone / .telefone / .cpf
  "${LOG_CALL}\([^)]*\.(phone|telefone|cpf)"
  # email de cliente/payer em log
  "${LOG_CALL}\([^)]*(customer|payer|cliente)\.email"
  # objeto sensível inteiro em log: console.log(customer) / print(order) ...
  "${LOG_CALL}\(\s*(customer|order|payer|address|cliente)\s*\)"
  # serialização de objeto sensível inteiro
  "${LOG_CALL}\([^)]*JSON\.stringify\(\s*(customer|order|payer|address)"
)

hits=0
findings=""
for pat in "${PATTERNS[@]}"; do
  for d in "${SCAN_DIRS[@]}"; do
    [ -d "$d" ] || continue
    out="$(grep -rnE "${EXCLUDES[@]}" "$pat" "$d" 2>/dev/null || true)"
    if [ -n "$out" ]; then
      findings+="$out"$'\n'
      hits=$((hits + $(printf '%s' "$out" | grep -c . || true)))
    fi
  done
done

if [ "$hits" -gt 0 ]; then
  echo "❌ check-pii-logs: $hits ocorrência(s) de possível PII de Cliente em log (LGPD):"
  echo ""
  printf '%s\n' "$findings"
  echo "Logue IDs/counts/códigos — NUNCA dados pessoais ou objetos inteiros. Ver webhook-mercado-pago/index.ts (padrão BOM)."
  exit 1
fi

echo "✅ check-pii-logs: nenhuma PII de Cliente em logs detectada nos diretórios de código."
exit 0
