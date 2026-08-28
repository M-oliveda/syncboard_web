---
name: Origin UI
colors:
  surface: "#fff8f3"
  surface-dim: "#e2d8ce"
  surface-bright: "#fff8f3"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#fcf2e7"
  surface-container: "#f7ece1"
  surface-container-high: "#f1e7db"
  surface-container-highest: "#ebe1d6"
  on-surface: "#1f1b14"
  on-surface-variant: "#43474a"
  inverse-surface: "#353028"
  inverse-on-surface: "#f9efe4"
  outline: "#73787b"
  outline-variant: "#c3c7ca"
  surface-tint: "#50616a"
  primary: "#0c1e26"
  on-primary: "#ffffff"
  primary-container: "#22333b"
  on-primary-container: "#899ba5"
  inverse-primary: "#b7c9d3"
  secondary: "#6f5b42"
  on-secondary: "#ffffff"
  secondary-container: "#f8dbbc"
  on-secondary-container: "#745f46"
  tertiary: "#251a0d"
  on-tertiary: "#ffffff"
  tertiary-container: "#3b2f20"
  on-tertiary-container: "#a89682"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#d3e5f0"
  primary-fixed-dim: "#b7c9d3"
  on-primary-fixed: "#0c1e25"
  on-primary-fixed-variant: "#384952"
  secondary-fixed: "#fbdebf"
  secondary-fixed-dim: "#ddc2a4"
  on-secondary-fixed: "#271906"
  on-secondary-fixed-variant: "#56432d"
  tertiary-fixed: "#f4dfc9"
  tertiary-fixed-dim: "#d7c3ae"
  on-tertiary-fixed: "#241a0c"
  on-tertiary-fixed-variant: "#524534"
  background: "#fff8f3"
  on-background: "#1f1b14"
  surface-variant: "#ebe1d6"
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: "700"
    lineHeight: "1.1"
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: "600"
    lineHeight: "1.2"
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: "600"
    lineHeight: "1.2"
  title-md:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: "600"
    lineHeight: "1.4"
  body-base:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: "400"
    lineHeight: "1.6"
  body-sm:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: "400"
    lineHeight: "1.5"
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: "700"
    lineHeight: "1"
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  container-margin: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  section-padding: 64px
---

## Brand & Style

The design system is built upon a "Warm Professionalism" narrative, balancing the
technical precision of a collaborative platform with a grounded, organic aesthetic. It
targets high-performance teams that value both clarity and comfort during long focus
sessions.

The style is a fusion of **Modern Corporate** and **Tactile Minimalism**. It avoids the
sterility of pure-white interfaces by utilizing a core palette of bone, clay, and deep
teal. The visual language emphasizes structural integrity through intentional spacing
and clear typographic hierarchy, creating a sense of a reliable digital workspace that
feels "physical" and permanent.

## Colors

The palette revolves around a sophisticated interplay of earthen tones and deep oceanic
teals.

- **Primary Canvas:** Uses a crisp white in light mode, shifting to a deep near-black
  for high-focus environments.
- **Warmth & Texture:** The secondary and neutral tones (Golden accent and Warm beige)
  are used for subtle layering, surfaces, and non-critical interactive elements to
  reduce eye strain.
- **High Contrast:** The "Dark Teal" (brand-800) provides the rhythmic anchor for the
  UI, used for primary actions and essential navigational markers.
- **Dark Mode Strategy:** Invert the hierarchy—text becomes light beige to maintain
  warmth, while borders become ghosted teal overlays to define space without introducing
  harsh lines.

## Typography

The design system exclusively utilizes **Space Grotesk**. This choice brings a
technical, geometric edge to the warm color palette, ensuring the product feels like a
modern tool rather than a lifestyle blog.

- **Headlines:** Use tighter letter spacing and bold weights to emphasize the geometric
  nature of the letterforms.
- **Body Text:** Standard weight with a generous line height (1.6) to ensure legibility
  during collaborative document editing.
- **Labels:** Small caps are utilized for metadata and category headers to provide
  visual distinction without increasing font size.
- **Mobile scaling:** Headlines should shrink by approximately 25-30% to maintain
  composition on smaller viewports.

## Layout & Spacing

This design system employs a **Fluid Grid** system based on a 4px baseline.

- **Desktop:** 12-column grid with 24px margins and 16px gutters.
- **Tablet:** 8-column grid with 20px margins.
- **Mobile:** 4-column grid with 16px margins.

Spacing is used to create "grouping" through proximity. Use larger vertical stacks
(`stack-lg`) between distinct content modules, and tighter spacing (`stack-sm`) for
related form inputs or list items. Alignment should always favor the left-axis to
maintain the "board" feel of the interface.

## Elevation & Depth

Elevation in this design system is primarily achieved through **Tonal Layers** and
**Low-Contrast Outlines** rather than heavy shadows.

- **Level 0 (Base):** brand-50.
- **Level 1 (Cards/Sidebar):** A subtle background shift to brand-100 or a 1px border of
  brand-100.
- **Level 2 (Modals/Popovers):** These use a light, diffused ambient shadow (8% opacity
  brand-800, 12px blur) to lift them from the canvas.

In dark mode, depth is created by "lighting" the surfaces. The further an element is
from the base background, the lighter its gray/teal value becomes.

## Shapes

The shape language is "Soft-Geometric." While the typography is sharp, the containers
are significantly rounded to invite interaction and reduce the "industrial" feel.

- **Standard Elements:** Buttons, inputs, and small cards use a **10px (rounded-lg)**
  radius.
- **Container Elements:** Modals and large feature sections use **14px (rounded-xl)**.
- **Dialogs/Overlays:** Use the largest **18px (rounded-2xl)** radius to create a
  distinct "sheet" appearance.

## Components

Following the Nova-style architecture, components are clean and highly functional:

- **Buttons:** Primary buttons use brand-800 with brand-50 text. Secondary buttons use a
  brand-100 background with brand-800 text. Hover states should involve a subtle
  darkening of the background (10% shift).
- **Input Fields:** 10px radius with a 1px brand-100 border. On focus, the border shifts
  to brand-600.
- **Chips:** Highly rounded (pill-shaped) with brand-100 backgrounds. Text should be
  brand-600 in `label-caps` style.
- **Cards:** No shadow by default; 1px brand-100 border. Content should have 24px
  internal padding.
- **Lists:** Items separated by 1px horizontal lines (brand-100). Hover states use a
  brand-100 background tint.
- **Collaboration Elements:** Presence indicators (avatars) should have a 2px white
  "stroke" to separate them from backgrounds when stacked.
