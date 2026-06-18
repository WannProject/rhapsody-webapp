---
name: Rhapsody Noir
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1b1b'
  surface-container: '#1f1f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#303030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#ffffff'
  on-tertiary: '#313030'
  tertiary-container: '#e5e2e1'
  on-tertiary-container: '#656464'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474646'
  background: '#131313'
  on-background: '#e2e2e2'
  surface-variant: '#353535'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

The design system is built for a high-performance audio environment where focus and clarity are paramount. It targets professional musicians and producers who require a distraction-free interface that recedes into the background, allowing the creative work to take center stage. 

The aesthetic is a blend of **Minimalism** and **High-Contrast Bold**. It utilizes a "total black" philosophy to minimize eye strain during long studio sessions while using stark white accents to create a rhythmic, percussive visual hierarchy. The emotional response is one of precision, authority, and modern sophistication. 

Key stylistic principles:
- **Absolute Contrast:** Use pure black and pure white to define primary actions and critical information.
- **Rhythmic Grids:** Elements are aligned to a strict modular scale to evoke a sense of timing and structure.
- **Functional Clarity:** Decoration is stripped away in favor of utility and legible data visualization.

## Colors

The palette is strictly monochromatic to maintain professional focus and ensure maximum accessibility.

- **Primary (#FFFFFF):** Reserved for text, iconography, and high-priority call-to-action elements.
- **Surface High (#1A1A1A):** Used for interactive components like input fields, active states, and elevated cards.
- **Surface Low (#121212):** Used for secondary containers and subtle section nesting.
- **Background (#000000):** The foundation of the UI. All layouts must start from absolute black to create an infinite depth effect.
- **Accent (Optional):** While the system is black and white, subtle gray scales (e.g., #888888) can be used for disabled states or secondary metadata.

## Typography

This design system uses a dual-font strategy to balance character with utility. **Montserrat** provides a geometric, rhythmic feel for headlines, echoing the structural nature of music notation. **Inter** is used for all body and UI text to ensure maximum legibility at small sizes and high-density data views.

- **Headlines:** Should be tight-leading and bold. Use uppercase for "Label" styles to create a technical, "equipment-label" look.
- **Body:** Maintain generous line height (1.5-1.6) to ensure readability against the dark background.
- **Data/Numeric:** For track times, BPM, and frequencies, use Inter with tabular lining figures if available to ensure columns of numbers align perfectly.

## Layout & Spacing

The layout follows a strict **4px baseline grid**. All spacing tokens are multiples of 4 to ensure a mathematical harmony throughout the interface.

- **Fluid Grid:** Use a 12-column grid for desktop views. On mobile, transition to a single-column stack with 16px side margins.
- **Density:** The system favors a medium-to-high density layout. Use `md` (16px) for standard padding between grouped elements and `xl` (40px) to separate major sections.
- **Alignment:** All text should be left-aligned by default to mimic the flow of a musical score. Centered text is reserved for empty states or splash screens only.

## Elevation & Depth

In a pure black environment, traditional shadows are ineffective. This design system uses **Tonal Layering** and **Low-Contrast Outlines** to define hierarchy.

- **Z-0 (Background):** #000000.
- **Z-1 (Platter/Cards):** #121212. Use a subtle 1px border of #1A1A1A to define edges if two dark surfaces meet.
- **Z-2 (Modals/Popovers):** #1A1A1A. Apply a thin white outline (10-15% opacity) to provide a "rim light" effect, separating the element from the darkness below.
- **Interactive States:** Instead of shadows, use "Glow" effects (very low spread white shadows) only for active transport controls (Play, Record) to signify "Power On" status.

## Shapes

The shape language is **Soft (0.25rem)**. This provides a professional, engineered look that feels modern without the excessive friendliness of fully rounded "pill" shapes.

- **Standard Elements:** (Buttons, Inputs, Cards) use a 4px corner radius.
- **Large Containers:** Use 8px (rounded-lg) for secondary panels.
- **Media Elements:** Album art or waveforms should remain perfectly square (0px) to contrast against the soft UI elements, emphasizing the "content" over the "container."

## Components

### Buttons
- **Primary:** Solid White background, Black text. High impact.
- **Secondary:** Transparent background, 1px White border, White text.
- **Ghost:** No background or border, White text. Used for low-priority utility actions.

### Input Fields
- **Default:** Background #121212, 1px border #1A1A1A, White text.
- **Focus:** 1px border #FFFFFF. No "glow" necessary; the high contrast is sufficient.

### Chips & Tags
- Used for genres or track tags. Use #1A1A1A background with 12px Inter Bold (Label-sm) text.

### Cards
- Surfaces should be #121212. Content within cards should follow the primary/secondary hierarchy. Avoid nested cards; use horizontal dividers (#1A1A1A) for separation instead.

### Transport Controls (Play, Stop, Record)
- These are the heartbeat of the system. Icons should be larger than standard UI icons (24px+). The "Record" button may use a subtle red dot, but all other controls must remain pure White.

### Waveforms & Progress
- Progress bars use a solid White fill over a #1A1A1A track. Waveforms should be rendered in White with 60% opacity for the background and 100% for the played portion.