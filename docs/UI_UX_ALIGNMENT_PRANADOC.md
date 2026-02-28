# UI/UX Alignment Notes (PranaDoc-style)

## What was aligned
- Typography stack:
  - Sans: Geist
  - Serif display: Instrument Serif
- Color system:
  - Background: stone/off-white (`#faf9f7`, `#f8f7f4` style)
  - Primary accent: light healthcare blue (`#7DB8D4`)
  - Primary hover/deeper accent: `#5A9AB8`
- Layout rhythm:
  - Sticky translucent header
  - Large serif hero headline
  - Rounded cards (2xl/3xl)
  - Soft borders (`stone-200`) and subtle shadows
  - Spacious vertical sections (`pt-28 md:pt-40`, `py-16 md:py-24`)

## Routes updated with aligned style
- `/`
- `/ai-doctor`
- Shared shell via `src/components/page-shell.tsx`
- Global header/footer and theme tokens

## Notes
- Structure and spacing style were matched closely for validation.
- Proprietary logo/assets and exact brand text were not copied verbatim.
