---
version: alpha
name: Jhâr-Ajhârân
description: Achromatic ledger workbench for high-tempo offline CAT exam preparation (CPNS, BUMN, TOEIC, IELTS) with multi-lens tactical solving hints.
colors:
  primary: "#141414"
  secondary: "#525860"
  tertiary: "#1D5FBF"
  neutral: "#F2F4F7"
  surface: "#FFFFFF"
  raised: "#EAEEF3"
  border: "#E2E6EC"
  positive: "#247B50"
  negative: "#C4242A"
  warning: "#92400E"
typography:
  h1:
    fontFamily: Geist
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  h2:
    fontFamily: Geist
    fontSize: 1rem
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: Geist
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.45
  small:
    fontFamily: Geist
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.35
  kpi:
    fontFamily: Geist
    fontSize: 1.875rem
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  mono:
    fontFamily: Geist Mono
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1.35
rounded:
  sm: 4px
  md: 6px
  lg: 8px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 20px
  xl: 24px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    height: 36px
    padding: 12px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    height: 36px
    padding: 12px
  card-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  badge-accent:
    backgroundColor: "{colors.tertiary}"
    textColor: "#FFFFFF"
    typography: "{typography.small}"
    rounded: "{rounded.pill}"
    padding: "{spacing.sm}"
  status-pass:
    backgroundColor: "#DCFAE5"
    textColor: "{colors.positive}"
    typography: "{typography.small}"
    rounded: "{rounded.pill}"
    padding: "{spacing.sm}"
  status-fail:
    backgroundColor: "#FFEDEA"
    textColor: "{colors.negative}"
    typography: "{typography.small}"
    rounded: "{rounded.pill}"
    padding: "{spacing.sm}"
  status-doubt:
    backgroundColor: "#FFFBEB"
    textColor: "{colors.warning}"
    typography: "{typography.small}"
    rounded: "{rounded.pill}"
    padding: "{spacing.sm}"
  canvas-ground:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.secondary}"
    typography: "{typography.body}"
    padding: "{spacing.xl}"
  option-row:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.primary}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  option-border:
    backgroundColor: "{colors.border}"
    textColor: "{colors.primary}"
    typography: "{typography.mono}"
    rounded: "{rounded.sm}"
    padding: "{spacing.xs}"
---

## Overview

Jhâr-Ajhârân adopts the **Achromatic Ledger** app direction (seed `1071996283`). Exam candidates spend 90 to 120 minutes reading dense passages, numerical series, and situational judgement prompts; ornamental UI chrome causes visual fatigue and slows reading speed. The interface strips away decorative gradients, tinted icon tiles, and confetti in favor of cool ledger paper (`#F2F4F7`), crisp white work sheets (`#FFFFFF`), high-contrast ink (`#141414`), and a single data hue (`#1D5FBF`) reserved strictly for passing-grade benchmarks and the active tactical hint lens.

## Colors

- **Primary (`#141414`):** Deep ink for question stems, primary action controls, and headline figures.
- **Secondary (`#525860`):** Muted slate for metadata, timers, and secondary labels (passes WCAG AA > 7:1 on white and `#F2F4F7`).
- **Tertiary (`#1D5FBF`):** Ledger blue reserved exclusively for the main data series (passing-grade comparison bars, active hint lens indicator, and keyboard focus ring).
- **Neutral (`#F2F4F7`):** Low-chroma ledger ground that separates white panels cleanly without drop shadows.
- **Semantic Status Pairs:** Pass (`#247B50` on `#DCFAE5`), Below Benchmark (`#C4242A` on `#FFEDEA`), and Doubt/Time Warning (`#92400E` on `#FFFBEB`).

## Typography

Self-hosted **Geist** (`400`, `500`, `600`, `700`) and **Geist Mono** (`400`, `500`) in `.woff2` format ensure 100% offline rendering without external CDN dependencies. All numeric counters, timers, passing grades, and pace metrics enforce `font-variant-numeric: tabular-nums` so digits never jitter during live countdowns.

## Layout

Desktop (`1440px`) uses a `248px` open-plane sidebar beside a fluid canvas with a uniform `16px` grid gap. In the exam workbench, an 8-column question and tactical-hint sheet pairs with a 4-column live question-number matrix and pace monitor. On mobile (`390px`), the sidebar folds into a `48px` top header bar and a thumb-zone bottom control strip with `44px+` touch targets.

## Elevation & Depth

Zero resting drop shadows. Hierarchy is established through surface tone steps (`#F2F4F7` ground -> `#FFFFFF` panel -> `#EAEEF3` interactive well) and `1px solid #E2E6EC` structural hairlines.

## Shapes

Bimodal tight geometry: `8px` radius on panels (`--radius-card`), `6px` on interactive controls and option rows (`--radius-control`), and `999px` pills reserved strictly for semantic status tags.

## Components

- **3-Lens Tactical Hint Deck:** Progressive disclosure tabs (*Taktik 1: Jalur Kilat <15 dtk*, *Taktik 2: Eliminasi Opsi*, *Taktik 3: Pola & Rumus Inti*, plus *Jebakan Umum*) that guide reasoning without prematurely spoiling the answer letter.
- **Dual-Scoring Option Matrix:** Supports both binary scoring (TWK, TIU, TKD, English) and weighted 1-to-5 gradation breakdown across all five options (TKP CPNS & Core Values AKHLAK BUMN).

## Do's and Don'ts

- **Do** keep every font, icon, and question pack bundled in the Service Worker cache for zero-network operation.
- **Do** show the exact point weight (1 to 5) of every option A-E during TKP and AKHLAK review.
- **Don't** reveal the final answer letter inside Hint 1 or Hint 2 before the user commits to an option.
- **Don't** use purple gradients, sparklines inside KPI strips, or decorative icons inside colored circles.
