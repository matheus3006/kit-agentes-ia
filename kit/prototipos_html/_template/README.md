# Template de Prototipo HTML+JSX

Substitui Figma como fonte de verdade
visual antes da implementacao no stack real.

## Como usar
```bash
# Copiar template para sua task
cp -r prototipos_html/_template prototipos_html/<task-id>

# Servir e abrir no browser
cd prototipos_html/<task-id>
python3 -m http.server 8000
# Acessar http://localhost:8000
```

## Estrutura
- `index.html` — orquestrador (React 18 + Babel standalone via CDN)
- `components/i18n.jsx` — TRANSLATIONS (pt-BR / en / es)
- `components/data.jsx` — mocks (nunca PII real)
- `components/icons.jsx` — SVG inline
- `components/ui.jsx` — primitivos (Button, Card, Field, EmptyState, etc.)
- `components/app.jsx` — Showcase shell com tabs de estados + switchers

## Estados visuais cobertos (showcase)
default, hover, focus, active, disabled, loading, empty, error

## Customizando para sua tela
1. Atualizar `--primary`, `--accent` no `index.html` se necessario
2. Substituir strings em `i18n.jsx`
3. Adicionar componentes especificos em `components/<dominio>.jsx`
   e referenciar via `<script type="text/babel" src=...>` no `index.html`
4. Trocar `DemoScreen` em `app.jsx` pelo prototipo real
5. Manter Showcase tabs + switchers para revisao completa
