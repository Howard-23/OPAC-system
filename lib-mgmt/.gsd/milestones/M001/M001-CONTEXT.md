# M001: Core Infrastructure & UI Parity — Context

**Gathered:** 2026-05-03
**Status:** Ready for planning

## Implementation Decisions
- **Styling**: All components must use a custom Tailwind configuration to support "bevel-sunken" and "bevel-raised" utility classes.
- **Color Palette**: Primary background is `#D4D0C8`. Use `bg-classic` as a token.
- **Typography**: Inter/Roboto at 12px for body, 14px for headers.
- **Login Modal**: Must include the `infolib.` logo area in the top half with a gradient background.
- **Grid Ratio**: Title (45%), Author (30%), Callno (15%), Year (10%).

## Agent's Discretion
- **Modernization**: Use modern SVG icons (Lucide) instead of the original low-res bitmaps, but maintain the same placement and metaphor.
- **Validation**: Use React Hook Form + Zod for all form validation.

## Research Findings (from wireframe-1)
- The legacy system uses a very specific "Workstation lock" warning in the Authority dialog; this should be implemented as a persistent banner or modal overlay.
- "Control No." is likely auto-generated using a `YYMMDD` prefix followed by sequential numbers.
