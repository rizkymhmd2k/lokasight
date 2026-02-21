# Spacing Audit

Audit date: 2026-02-21

Scope: `app/` (utilities matching `p*`, `m*`, `gap-*`, `space-*`)

## Summary

- Spacing usage follows Tailwind’s default numeric scale (`px-4`, `p-6`, `p-8`, `p-10`, `p-12`, `gap-2`, `gap-10`, etc).
- No non-standard spacing utilities remain in `app/` (e.g. no `pt-25`, `pb-15`, `pb-30`, `mr-50`).

## Non-standard utilities (resolved)

Previously, these appeared in the codebase:

- `pt-25`
- `mr-50`
- `pb-30`
- `pb-15`

They were migrated to the approved Tailwind scale:

- `pt-25` → `pt-24`
- `pb-15` → `pb-16`
- `pb-30` → `pb-32`
- `mr-50` → `mr-48`

## Most common spacing utilities

Counts across `app/`:

- `gap-2` (10)
- `px-4` (9)
- `gap-10` (7)
- `pt-24` (5)
- `mt-3` (5)
- `gap-1.5` (4)
- `gap-3` (4)
- `mt-4` (4)

## Decision (implemented)

Keep spacing on Tailwind’s standard scale (4px grid) and avoid inventing new numeric keys. If a layout needs a special case, prefer a documented semantic token (design decision) over ad-hoc integers.
