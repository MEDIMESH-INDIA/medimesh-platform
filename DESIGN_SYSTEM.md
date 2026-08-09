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
