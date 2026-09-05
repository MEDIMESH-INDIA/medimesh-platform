# MEDIMESH Design System

This document outlines the foundational design system and visual language established during the initial landing page development for the MEDIMESH platform. Future pages and features must adhere to these tokens, components, and architectural rules to maintain a coherent, premium, and professional healthcare technology identity.

## 1. Typography

The platform utilizes a dual-font typographic hierarchy that balances editorial readability with a modern software aesthetic.

*   **Primary (Body & UI)**: `Manrope` (Sans-serif)
    *   Used for all interface elements, metadata, labels, and standard paragraphs.
*   **Secondary (Headings)**: `Playfair Display` (Serif)
    *   Used strictly for high-impact storytelling headers, primary Hero titles, and major section dividers.

## 2. Color Palette (Tailwind Tokens)

Do not use arbitrary colors. Rely entirely on the extended Tailwind tokens:

### Primary Identity
*   `primary`: `#0A7A6A` (MEDIMESH Teal) - Network, primary CTAs, core brand.
*   `primary-light`: `#E6F2F0` (Soft Mint) - Subtle highlights and backgrounds.
*   `background`: `#FDFBF7` (Warm Ivory) - Global canvas background.
*   `foreground`: `#1A1C1B` (Deep Charcoal) - Global text, footer background.
*   `muted-foreground`: `#5C6661` (Warm Grey) - Secondary text, subtitles.

### Semantic & Accents (The Secondary Palette)
*   `blue-light` (`#8DB9D9`) & `blue-muted` (`#5E8FAF`): Discovery, search, and clinical information.
*   `lavender` (`#B7A9D6`): Data intelligence, analytics, and comparisons.
*   `peach` (`#E7A58B`) & `coral` (`#D98275`): Patient-facing narratives and human stories.
*   `sage` (`#9CAF9A`): Hospital infrastructure and physical institutions.
*   `amber` (`#D6A85F`): Verification, trust highlights, and rating scores.

### Surface & Borders
*   `surface`: `#FFFFFF` (Pure White) - Floating cards and elevated UI.
*   `surface-elevated`: `#F4F1EA` (Stone) - Inset containers, secondary backgrounds.
*   `border`: `#E8E5DF` - All dividers and card outlines.

## 3. Spacing & Shadows

*   **Cards**: Standard shadow is `shadow-sm` or `shadow-card` (custom token). 
*   **Hover States**: Use `shadow-card-hover` (a teal-tinted shadow `rgba(10, 122, 106, 0.1)`) coupled with a subtle `-translate-y-0.5` transform for interactive elements.
*   **Border Radius**: Use `rounded-xl` or `rounded-2xl` for UI components, and `rounded-[2rem]` for major image or full-section containers.

## 4. Animation & Motion

*   **Framer Motion**: Use the standardized `ScrollReveal` or `AnimatedContent` wrappers for entrance animations.
*   **Timing**: Use duration `0.6` to `0.8` seconds with `easeOut`. Avoid bouncy or overly aggressive springs.
*   **Hover**: Keep transitions around `200ms` - `500ms`. Elements should lift or slide smoothly (e.g., `group-hover:translate-x-1`).
*   **Reduced Motion**: Respect `prefers-reduced-motion` settings where applicable.

## 5. Background System (The Mesh)

The interactive particle mesh (`InteractiveMeshBackground`) is the signature background element.
*   It operates globally on the `PageShell` / `LandingPage` root.
*   **Visibility Control**: Use `Section` components with `background="transparent"`, `background="muted"`, or `background="white"` to mask or reveal the mesh. 
*   **Rule**: The footer must ALWAYS have a solid background (`bg-foreground` z-index `20+`) to terminate the mesh completely at the bottom of the page.

## 6. Development Rules

1.  **Component Reuse**: Before building a new UI component, check `src/components/common` (Buttons, Containers, SectionHeadings).
2.  **Navigation**: Never use `<a href="#">`. Use `react-router-dom` `<Link>` components pointing to real routes or standard placeholder components (`/discover`, `/about`, etc.).
3.  **Vibe-Coding Ban**: Avoid unstructured "glassmorphism everywhere" or random CSS gradients. Use gradients sparingly as subtle washes (e.g., `bg-gradient-to-tr from-peach/10 mix-blend-multiply opacity-20`).
4.  **Imagery**: Prefer high-quality, professional editorial photography over generic stock photos. Compose images with floating UI elements to anchor them into the platform aesthetic.

## 7. Product Primitives

The landing page is the permanent visual source of truth. Product pages should compose these shared primitives instead of recreating local card, field, or background styles:

* `MedimeshBackground`: shared graph-paper, mesh, and ambient-node stack.
* `GraphPaperBackground` and `MeshOverlay`: intensity-controlled background layers.
* `FrostedPanel`: strategic surface variants (`subtle`, `elevated`, `floating`).
* `AuthCard`: the standard public-auth form surface.
* `AppPageContainer` and `PageHeader`: application spacing and editorial hierarchy.
* `FormField` / `.medimesh-field`: consistent labels, controls, focus, help, and validation states.
* `Button`: primary, outline, secondary, and ghost actions. Do not create page-local button systems.
* `EmptyState`, `LoadingState`, `SourceBadge`, and `SectionEyebrow`: standard product feedback and metadata.

Background intensity is deliberate: landing uses full intensity; auth and dashboards use medium graph with light-to-medium mesh; Discover uses medium graph and light mesh; comparison, saved, profile, and settings use light graph with minimal mesh.

## 8. Product Integrity

* Use serif typography for major page headlines and emotional statements; use sans-serif for navigation, forms, metadata, cards, and body copy.
* Controls use 10–14px radii, cards 18–24px, frosted containers 22–28px, and product canvases 28–36px.
* Page transitions use a 300ms fade with an 8px vertical offset. Interactive cards may lift 2px; buttons press to `scale(.98)`.
* Never infer ratings, rankings, availability, verification, patient counts, appointments, revenue, or operational analytics.
* Label non-live records as demonstration data and preserve source/review metadata wherever records are compared or evaluated.
