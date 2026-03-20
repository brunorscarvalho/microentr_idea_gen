#!/usr/bin/env bash
# push-export.sh — copia o JSON exportado para exports/latest.json e faz push
#
# Usage:
#   ./scripts/push-export.sh ~/Downloads/microentr-export-2026-03-20.json
#   ./scripts/push-export.sh  # usa o ficheiro mais recente em ~/Downloads

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="${REPO_ROOT}/exports/latest.json"

# Resolve o ficheiro de input
if [[ $# -ge 1 ]]; then
  INPUT="$1"
else
  # Auto-detecta o export mais recente em ~/Downloads
  INPUT=$(ls -t ~/Downloads/microentr-export-*.json 2>/dev/null | head -1 || true)
  if [[ -z "$INPUT" ]]; then
    echo "❌ Nenhum ficheiro microentr-export-*.json encontrado em ~/Downloads"
    echo "   Exporta primeiro na app e indica o caminho:"
    echo "   ./scripts/push-export.sh ~/Downloads/microentr-export-YYYY-MM-DD.json"
    exit 1
  fi
  echo "→ Auto-detectado: $INPUT"
fi

if [[ ! -f "$INPUT" ]]; then
  echo "❌ Ficheiro não encontrado: $INPUT"
  exit 1
fi

# Valida que é um export válido
node -e "
  const s = JSON.parse(require('fs').readFileSync('$INPUT', 'utf8'));
  const required = ['insights','opportunities','experiments','decisionLog','scoringWeights','lastUpdated'];
  const missing = required.filter(k => !(k in s));
  if (missing.length) { console.error('❌ JSON inválido — faltam campos:', missing.join(', ')); process.exit(1); }
  console.log('✓ Export válido — lastUpdated:', s.lastUpdated);
" || exit 1

cp "$INPUT" "$TARGET"
echo "✓ Copiado para exports/latest.json"

cd "$REPO_ROOT"
git add exports/latest.json

if git diff --cached --quiet; then
  echo "⏭ Sem alterações — o vault já está actualizado."
  exit 0
fi

EXPORT_DATE=$(node -e "console.log(require('$TARGET').lastUpdated.split('T')[0])")
git commit -m "chore: update cockpit export ${EXPORT_DATE}"
git push

echo ""
echo "✓ Push feito. O GitHub Actions irá sincronizar o Obsidian vault automaticamente."
echo "  Verifica o progresso em: $(git remote get-url origin | sed 's/\.git$//')/actions"
