---
name: AgriMac Sovereign
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbd9d9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#eae8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#3f4941'
  inverse-surface: '#303030'
  inverse-on-surface: '#f2f0f0'
  outline: '#6f7a70'
  outline-variant: '#bec9be'
  surface-tint: '#0d6c3e'
  primary: '#00542d'
  on-primary: '#ffffff'
  primary-container: '#106e3f'
  on-primary-container: '#98edb2'
  inverse-primary: '#83d89f'
  secondary: '#586400'
  on-secondary: '#ffffff'
  secondary-container: '#d5ea60'
  on-secondary-container: '#5b6900'
  tertiary: '#454948'
  on-tertiary: '#ffffff'
  tertiary-container: '#5d6160'
  on-tertiary-container: '#d9dcda'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9ff5b9'
  primary-fixed-dim: '#83d89f'
  on-primary-fixed: '#00210e'
  on-primary-fixed-variant: '#00522c'
  secondary-fixed: '#d8ed63'
  secondary-fixed-dim: '#bcd14a'
  on-secondary-fixed: '#191e00'
  on-secondary-fixed-variant: '#414b00'
  tertiary-fixed: '#e0e3e1'
  tertiary-fixed-dim: '#c4c7c5'
  on-tertiary-fixed: '#181c1b'
  on-tertiary-fixed-variant: '#434846'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding-mobile: 16px
  container-padding-desktop: 40px
  gutter: 24px
  section-gap: 64px
---

## Brand & Style
The design system embodies a "Sovereign Minimalist" aesthetic tailored for high-stakes agricultural management. It balances the grit of industrial farming with the precision of a premium financial suite. The target audience includes enterprise farm operators and agronomists who require clarity over clutter. 

The visual language is rooted in **Minimalism** with a **Corporate Modern** finish. It utilizes expansive whitespace to reduce cognitive load, paired with high-quality typography to establish authority. The emotional response is one of calm control, reliability, and modern efficiency.

## Colors
This design system uses a high-contrast palette to signify growth and professionalism. 

- **Primary (Forest Green):** Used for essential actions, active states, and brand anchoring. It represents stability and the core of the agricultural sector.
- **Secondary (Subtle Lime):** Employed sparingly as an accent for "positive growth" indicators, status badges, or high-intent highlights. 
- **Tertiary (Soft Gray/Mist):** Applied to backgrounds and container fills to soften the interface and prevent visual fatigue.
- **Neutral:** A range of grays used for text hierarchy and subtle borders, ensuring the primary green remains the dominant focal point.

## Typography
Inter is the exclusive typeface for this design system, chosen for its exceptional legibility in data-heavy environments. The hierarchy is strictly enforced through weight and scale. 

Headlines utilize tighter letter-spacing and heavier weights to feel "architectural" and grounded. Body text maintains generous line-heights to ensure readability during long sessions of data analysis. Labels are often treated with slight tracking (letter-spacing) to distinguish them from interactive body text.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a heavy emphasis on "The Breathable Dashboard."

- **Desktop:** A 12-column grid with 40px outer margins and 24px gutters. Content is often centered in a max-width container (1440px) to maintain focus.
- **Tablet:** 8-column grid with 24px margins.
- **Mobile:** 4-column grid with 16px margins.

Spacing follows an 8px linear scale. Section gaps are intentionally large (64px+) to create a distinct separation between different functional areas of the "Super Admin" interface, reinforcing a sense of premium organization.

## Elevation & Depth
The system uses **Tonal Layers** combined with **Ambient Shadows** to create a "Super Admin" hierarchy.

1. **Surface (Background):** #F4F7F5.
2. **Level 1 (Cards/Panels):** Pure White (#FFFFFF) with an extremely soft shadow (Offset 0, 4px; Blur 20px; Opacity 4% Black).
3. **Level 2 (Popovers/Modals):** Pure White with a more defined but still diffuse shadow (Offset 0, 12px; Blur 40px; Opacity 8% Black).

Outlines are rarely used. Depth is instead communicated through subtle shifts in surface color and the softest possible shadows, giving the UI a "floating" and lightweight feel.

## Shapes
In line with the "High-End" aesthetic, this design system utilizes generous **Rounded** corners. 

Standard components (buttons, inputs) use a 12px-16px radius. Large containers and dashboard cards use a 24px radius to feel modern and approachable. This softness contrasts with the professional, structured nature of the Forest Green palette, preventing the platform from feeling too "industrial" or rigid.

## Components
- **Buttons:** Primary buttons are solid #106E3F with white text, featuring a 12px corner radius. Secondary buttons use a subtle gray stroke (#E0E0E0) or a ghost style with Forest Green text.
- **Input Fields:** Minimalist design with a #F9F9F9 fill and no border in default state. On focus, a 1px solid Forest Green border appears. Labels are positioned above the field in `label-sm`.
- **Cards:** The primary vehicle for data. Pure white, 24px corner radius, with 32px internal padding. Shadows are near-invisible.
- **Chips/Status Badges:** Used for crop status or livestock health. These use a "Soft Fill" approach: a light tint of the status color (e.g., light lime for "Healthy") with dark text of the same hue.
- **Lists:** Data tables use generous row heights (64px+) and remove vertical borders, using only subtle horizontal dividers (#F0F0F0) to maintain the clean, open aesthetic.
- **Refined Iconography:** Line-based icons with a 2px stroke weight, utilizing the Forest Green for active states and a mid-gray for inactive states.