# Spacing System (Draft)

This repo currently mixes a few different spacing “languages” (Tailwind scale values, non-standard numeric utilities, and arbitrary `[px]` / `[vw]` values). That makes layouts harder to keep consistent and also risks some classes silently doing nothing.

## Status (implemented)

- Migrated non-standard spacing utilities to Tailwind’s default scale (4px grid): `pt-25` → `pt-24`, `pb-15` → `pb-16`, `pb-30` → `pb-32`, `mr-50` → `mr-48`.
- Removed the temporary custom `--spacing-*` tokens from `app/globals.css` to keep the system small and prevent new one-off values.
- Added an audit snapshot in `docs/design-system/spacing-audit.md`.

## What I’m seeing in the code

### 1) Non-standard Tailwind spacing utilities are used

Previously, the code used non-standard utilities like `pt-25`, `pb-15`, `pb-30`, `mr-50`. These were migrated to the nearest values on Tailwind’s default spacing scale so everything stays on a consistent 4px grid.

### 2) Too many “one-off” gaps/paddings for similar structures

The same structural patterns repeat with different values:

- “Section wrapper” padding is often `px-4` + `pt-24`, but some sections do `py-4` or other mixes.
- Card paddings vary (`p-6`, `p-8`, `p-10`, `p-12`) across similar card layouts.
- Stack gaps vary (`gap-8`, `gap-10`, `gap-16`) for similar “vertical rhythm” content stacks.

This is a classic sign the design needs a shared spacing vocabulary:

- a small primitive scale (e.g. 4px-based steps),
- plus a few semantic tokens (“page padding”, “section spacing”, “card padding”, “stack gap”).

### 3) Mixed units (scale + arbitrary) without clear rules

Arbitrary values like `h-[550px]`, `w-[70vw]`, `text-[27vw]` are totally valid for hero/typographic moments, but when they mix with ad-hoc spacing, it becomes difficult to predict overall rhythm.

## Recommendation: spacing primitives + semantic tokens

### Spacing primitives (4px grid)

Use a 4px base and a *small* approved set of steps. This gives enough flexibility while keeping a consistent rhythm:

| Token | px | Typical use |
|------:|---:|-------------|
| 0 | 0 | reset |
| 1 | 4 | micro adjustments |
| 2 | 8 | tight stacks, small paddings |
| 3 | 12 | small paddings |
| 4 | 16 | default paddings/gaps |
| 5 | 20 | roomy small blocks |
| 6 | 24 | section inner spacing (small) |
| 8 | 32 | section inner spacing (med) |
| 10 | 40 | large gaps/cards (large) |
| 12 | 48 | hero support spacing |
| 16 | 64 | big section spacing |
| 20 | 80 | very large section spacing |
| 24 | 96 | rare / large-screen only |

If you want to stay close to Tailwind defaults, you can align these to the existing Tailwind spacing scale where possible (e.g. `p-4`, `p-6`, `p-8`, `p-10`, `p-12`, `p-16`, `p-20`, `p-24`) and avoid inventing new integers like `25` or `30`.

### Semantic spacing tokens (the real “system”)

Define a few named tokens that map to primitives and can change by breakpoint:

- `space/page-x`: horizontal page padding (`px-4` on mobile, larger on desktop)
- `space/section-y`: vertical spacing between sections
- `space/card-pad`: internal padding for yellow/black cards
- `space/stack-sm`, `space/stack-md`, `space/stack-lg`: vertical gaps for content stacks
- `space/grid-gap`: default grid gap

This keeps layouts consistent while still letting you scale the whole site by adjusting a small set of decisions.

## Suggested mapping to current components

### Contact / Form cards

Current patterns:

- card padding: `p-8 lg:p-12`
- grid gap: `gap-10 lg:gap-16`
- form stack gap: `gap-8`

Systemize as:

- `card-pad` (e.g. 32 → 48)
- `grid-gap` (e.g. 40 → 64, only if truly needed)
- `stack-md` (e.g. 24–32 for forms, depending on density)

### Section wrappers

Current: repeated `px-4 pt-24`.

Systemize as:

- `page-x` for horizontal padding
- `section-y` for vertical padding or spacing (choose one convention: either “padding inside each section” or “margin between sections”, but don’t mix randomly)

## Figma guidance (design-system mindset)

- Create Variables:
  - `space/0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24`
  - semantic aliases: `space/page-x`, `space/section-y`, `space/card-pad`, `space/stack-md`, etc.
- Build components using semantic variables (e.g. “Card padding = `space/card-pad`”), not raw numbers.
- Keep Tailwind and Figma aligned (either by matching the primitive scale, or by explicitly documenting exceptions).

## If you want, next step

I can:

1) audit all spacing utilities across `app/` and list outliers,
2) propose an exact final token set (primitives + semantic),
3) add semantic spacing tokens (or small utility wrappers) if you want to reduce repetition further (e.g. “page padding”, “section spacing”, “card padding”) while keeping the underlying primitives on Tailwind’s default spacing scale.
