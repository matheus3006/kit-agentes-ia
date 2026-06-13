# Design Tokens · {{PROJECT_NAME}}

> EXEMPLO. Os valores (cores/raios/etc) abaixo são ilustrativos —
> substitua pela identidade visual do seu projeto. A ESTRUTURA (categorias de
> token e o mapeamento protótipo → tema central do stack real) é o que importa.

Fonte de verdade visual do protótipo HTML+JSX (validado no Cliente MVP). Mapeamento canônico CSS Variables ↔ Flutter `ThemeData` (Material 3) ↔ Cupertino para T01.05+.

**Status:** referência fechada. Mudanças requerem aprovação visual no protótipo antes de propagar pro Flutter.

---

## Paleta

Brand vintage marsala + sage. **Não** neon, **não** gradientes RGB. Inspiração: hot-rod americano dos 50, paper texture, sobreposição editorial.

### Cores marca (constantes — light & dark mantêm hue)

| Token | Hex | Uso |
|---|---|---|
| `--primary` (light) | `#7E1F22` | CTA, brand, ícones ativos, indicador de categoria, total |
| `--primary` (dark) | `#B5413E` | Mesma função, contraste OK no bg charcoal |
| `--primary-deep` | `#5C1518` / `#D85A57` | Pressed state, hover button |
| `--primary-soft` | `#F4E5E1` / `#3A1517` | Bg de chip ativo, bg checkbox marcado |
| `--accent` (light) | `#84AB45` | Sage. Success, ações secundárias, badges veggie |
| `--accent` (dark) | `#A5C962` | Sage clarificado pra contraste |
| `--accent-soft` | `#EAF1D8` / `#2B3A18` | Bg de badge success, bg de toast verde |

### Superficies (light)

| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#FAF7F2` | Cream off-white (paper vintage) |
| `--surface` | `#FFFFFF` | Card, modal, sheet |
| `--surface-2` | `#F2EDE5` | Cream quente — input bg, badge neutro |
| `--input-bg` | `#F2EDE5` | Mesmo que surface-2 |
| `--border` | `rgba(26,26,31,0.08)` | Linhas finas |
| `--border-strong` | `rgba(26,26,31,0.18)` | Linhas visíveis |
| `--fg` | `#1A1A1F` | Charcoal — texto principal |
| `--muted` | `#6B655B` | Warm gray (não cinza azulado) — labels, secondary text |

### Superfícies (dark)

| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#15151A` | Charcoal profundo |
| `--surface` | `#1F1F26` | Card, modal |
| `--surface-2` | `#2A2A33` | Input bg |
| `--fg` | `#F0EBE2` | Cream texto |
| `--muted` | `#8F8978` | Texto secundário |

### Status

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--ok` | `#84AB45` | `#A5C962` | Success — usa sage (não verde florescente) |
| `--warn` | `#C28A2E` | `#D9A655` | Mostarda vintage |
| `--danger` | `#B5413E` | `#D85A57` | Terracota (harmoniza com marsala) |

---

## Tipografia

| Família | Uso | Pesos |
|---|---|---|
| **DM Serif Display** (`--font-editorial`) | Headings de tela, nomes de produto, títulos de seção, totais grandes | 400 |
| **Plus Jakarta Sans** (`--font-display`) | Body, labels, microcopy, números UI | 400, 500, 600, 700, 800 |
| **JetBrains Mono** (`--font-mono`) | Numerais tabular (preços em listas, ETA), códigos | 500, 700 |

### Escala tipográfica

| Token | Tamanho | Aplicação típica |
|---|---|---|
| Display | 36px / DM Serif | Login screen H1 |
| H1 | 28-30px / DM Serif | Detail screen título do produto |
| H2 | 22px / DM Serif | Section headings |
| H3 | 17-18px / Jakarta 700 | Card title, AppBar title |
| Body | 14-15px / Jakarta 500 | Texto geral |
| Caption | 12-13px / Jakarta 600 | Labels, helpers |
| Micro | 11px / Jakarta 800 uppercase 0.5px | Categorias, badges |

### Letter-spacing

- Headings DM Serif: `-0.4 a -1px` (apertado, editorial)
- Body: default
- Micro caps: `+0.5 a +1.5px`

---

## Espaçamento (4pt scale)

| Token | Valor |
|---|---|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 24px |
| `--space-6` | 32px |

Padding padrão de tela: **20px horizontal**.

---

## Bordas e sombras

| Token | Valor |
|---|---|
| `--radius-sm` | 6px |
| `--radius-md` | 10px |
| `--radius-lg` | 16px |
| `--radius-full` | 999px |
| `--shadow-sm` | `0 1px 2px rgba(15,23,42,0.06)` |
| `--shadow-md` | `0 4px 12px rgba(15,23,42,0.08)` |
| `--shadow-lg` | `0 12px 28px rgba(15,23,42,0.14)` |
| `--device-shadow` | `0 22px 60px rgba(26,26,31,0.22)` (light) / `0 22px 60px rgba(0,0,0,0.6)` (dark) |

Cards de produto, sheets e CTAs primários **sem** drop shadow excessivo. Apenas border 1px e bg destacado.

---

## Touch targets

Mínimo **44×44pt** (iOS) / **48×48dp** (Android) — aplicado:
- `Press` component aceita qualquer conteúdo e respeita `minHeight: 44`
- `Button` size `md` = 48px min height
- `QtyStepper` botões = 40×40px (com hitSlop implícito do Press)

---

## Animações

| Token | Valor | Aplicação |
|---|---|---|
| Press scale | `scale(0.97)` em 120ms ease | Feedback tátil universal |
| Screen transition | 320ms `cubic-bezier(0.2, 0.8, 0.2, 1)` slide-in da direita | Navegação forward |
| Sheet slide-up | 280ms cubic-bezier | BottomSheet abrir |
| Toast slide-down | 280ms cubic-bezier | Notificações |
| Pulse current step | 1800ms ease-in-out infinite | Tracking step ativo |

**Respeitar `prefers-reduced-motion`** — todas as transitions caem pra `fadeIn` 200ms.

---

## Mapeamento Flutter ThemeData (Material 3)

Pra T01.05 quando criar `lib/theme/<seu>_theme.dart`:

```dart
ThemeData lightTheme = ThemeData(
  useMaterial3: true,
  brightness: Brightness.light,
  colorScheme: ColorScheme.light(
    primary: Color(0xFF7E1F22),         // --primary
    onPrimary: Color(0xFFFFFFFF),       // --surface
    primaryContainer: Color(0xFFF4E5E1),// --primary-soft
    secondary: Color(0xFF84AB45),       // --accent
    onSecondary: Color(0xFFFFFFFF),
    secondaryContainer: Color(0xFFEAF1D8),// --accent-soft
    surface: Color(0xFFFFFFFF),
    onSurface: Color(0xFF1A1A1F),       // --fg
    background: Color(0xFFFAF7F2),      // --bg
    onBackground: Color(0xFF1A1A1F),
    surfaceVariant: Color(0xFFF2EDE5),  // --surface-2
    onSurfaceVariant: Color(0xFF6B655B),// --muted
    outline: Color(0x1A1A1F0F),         // --border-strong
    error: Color(0xFFB5413E),           // --danger
  ),
  fontFamily: 'PlusJakartaSans',
  textTheme: TextTheme(
    displayLarge: TextStyle(fontFamily: 'DMSerifDisplay', fontSize: 36, letterSpacing: -1),
    headlineLarge: TextStyle(fontFamily: 'DMSerifDisplay', fontSize: 28, letterSpacing: -0.6),
    headlineMedium: TextStyle(fontFamily: 'DMSerifDisplay', fontSize: 22, letterSpacing: -0.4),
    titleMedium: TextStyle(fontWeight: FontWeight.w700, fontSize: 17),
    bodyMedium: TextStyle(fontWeight: FontWeight.w500, fontSize: 14),
    labelSmall: TextStyle(fontWeight: FontWeight.w800, fontSize: 11, letterSpacing: 0.5),
  ),
);

ThemeData darkTheme = lightTheme.copyWith(
  brightness: Brightness.dark,
  colorScheme: ColorScheme.dark(
    primary: Color(0xFFB5413E),
    secondary: Color(0xFFA5C962),
    surface: Color(0xFF1F1F26),
    background: Color(0xFF15151A),
    onSurface: Color(0xFFF0EBE2),
    // ...
  ),
);
```

### Cupertino (iOS-only fallback)

Quando precisar de widgets Cupertino puros (ex: `CupertinoActionSheet`):

```dart
CupertinoThemeData cupertinoTheme = CupertinoThemeData(
  primaryColor: Color(0xFF7E1F22),
  scaffoldBackgroundColor: Color(0xFFFAF7F2),
  // ...
);
```

---

## Anti-padrões a evitar

❌ **Botão pill rounded-full** em CTAs primários — usar `radius-md` (10px) pra manter cara editorial.
❌ **Drop shadow neon** ou `box-shadow` colorido — quebra o vintage paper feel.
❌ **Gradientes lineares** RGB ou multi-stop — vintage = chapado.
❌ **Emojis como ícones** (🍔 🍟) — usar SVG (icons.jsx).
❌ **Texto cinza azulado** (`#6B7280` Tailwind slate) — usar `--muted` warm gray.
❌ **Tipografia sans-serif em headings** — usar DM Serif Display.
❌ **Categoria com chip pill colorido** (Material default) — usar `CategoryChip` com underline marsala.

---

## Referências externas

- Protótipo HTML+JSX: `prototipos_html/2026-05-20-cliente-mvp/`
- Checklist HTML+JSX: `docs/frontend/html-prototype-checklist.md`
- Brand assets: `assets/brand/<seu-logo>.svg`
- Memory `project_brand_assets`: paleta oficial confirmada com cliente
