FRONTEND ANTI-SLOP REFACTOR

The frontend is already implemented and functional.

Your job is NOT to redesign the application from scratch.
Your job is to audit and improve the existing frontend so it feels intentional, polished, consistent, and production-quality.

IMPORTANT:
Do not blindly rewrite components.
Do not create a new design system.
Do not change the application's core functionality.
Do not add unnecessary features.

==================================================
1. FIRST: AUDIT THE EXISTING FRONTEND
==================================================

Before editing anything:

- Inspect the entire frontend structure.
- Identify all routes/pages.
- Inspect shared components.
- Inspect the existing design system.
- Inspect Tailwind/theme configuration.
- Inspect typography, colors, spacing, buttons, cards, forms, navigation, modals, tables, empty states, loading states, and responsive behavior.
- Identify duplicated UI patterns.
- Identify inconsistent patterns between pages.

Create an internal mental checklist of:
- visual inconsistencies
- spacing inconsistencies
- typography problems
- unnecessary decorative elements
- excessive cards
- excessive rounded corners
- excessive shadows
- unnecessary gradients
- inconsistent buttons
- inconsistent icons
- bad responsive behavior
- weak visual hierarchy
- excessive empty space
- cramped layouts
- generic AI-generated UI patterns

Only after understanding the existing frontend should you modify it.

==================================================
2. ANTI-SLOP PRINCIPLES
==================================================

Remove visual patterns that make the application look AI-generated or generic.

Avoid:

- excessive gradients
- random colorful gradients
- glassmorphism without purpose
- excessive blur
- excessive shadows
- excessive rounded cards
- giant hero sections
- decorative blobs
- unnecessary floating elements
- excessive icons
- emojis used as UI decoration
- unnecessary badges
- excessive pills
- excessive borders
- huge typography without hierarchy
- repetitive cards
- identical card layouts everywhere
- excessive animations
- animations that do not communicate state
- arbitrary hover effects
- excessive whitespace
- fake dashboard statistics
- decorative charts without meaningful data
- generic "AI SaaS" layouts

The interface should feel designed by a product designer, not generated from a UI template.

==================================================
3. PRESERVE THE EXISTING VISUAL IDENTITY
==================================================

Do NOT replace the current design language.

Instead:

- improve the existing typography
- normalize spacing
- normalize component dimensions
- improve hierarchy
- improve alignment
- improve consistency
- remove unnecessary decoration
- improve interaction states
- improve responsive behavior

If an existing component already works well, keep it.

Do not replace good code simply because you would personally implement it differently.

==================================================
4. TYPOGRAPHY
==================================================

Audit typography across the application.

Make sure there is a clear hierarchy between:

- page title
- section title
- card title
- body text
- secondary text
- labels
- metadata
- buttons

Avoid:
- too many font sizes
- random font weights
- oversized headings
- low contrast secondary text
- inconsistent line heights

Typography should create hierarchy before decoration does.

==================================================
5. SPACING
==================================================

Normalize spacing using the project's existing spacing system.

Look for:

- inconsistent padding
- inconsistent card spacing
- inconsistent gaps
- cramped forms
- excessive whitespace
- elements that are visually misaligned

Use consistent spacing relationships instead of arbitrary values.

Do not introduce dozens of one-off spacing values.

==================================================
6. COMPONENT CONSISTENCY
==================================================

Find repeated UI patterns.

Examples:

- buttons
- inputs
- cards
- badges
- dialogs
- dropdowns
- navigation items
- page headers
- tables
- empty states
- loading states

If the same pattern appears multiple times with slightly different styling, consolidate it where doing so genuinely improves consistency.

Do NOT create abstractions for tiny one-off elements.

==================================================
7. PAGE-BY-PAGE AUDIT
==================================================

Inspect every page individually.

For each page ask:

1. What is the primary user action?
2. Is it visually obvious?
3. Is the page hierarchy clear?
4. Is there unnecessary UI?
5. Is anything visually competing with the main content?
6. Are sections aligned?
7. Does the page feel intentionally designed?
8. Does mobile layout make sense?
9. Are loading/error/empty states handled?
10. Does anything look like a generic AI-generated component?

Fix the highest-impact problems first.

==================================================
8. RESPONSIVE DESIGN
==================================================

Audit:

- mobile
- tablet
- desktop

Do not simply shrink desktop layouts.

Check:

- navigation
- tables
- cards
- forms
- buttons
- dialogs
- typography
- spacing
- horizontal overflow
- grid layouts

Mobile should feel intentionally designed.

==================================================
9. INTERACTION QUALITY
==================================================

Improve interaction states where necessary:

- hover
- focus
- active
- disabled
- loading
- error
- success

Do not add animations everywhere.

Use motion only when it improves:
- feedback
- orientation
- hierarchy
- state transition

Keep animations subtle and purposeful.

==================================================
10. ACCESSIBILITY
==================================================

Check:

- keyboard navigation
- focus states
- button semantics
- form labels
- aria attributes where necessary
- color contrast
- interactive element sizes
- meaningful alt text
- disabled states

Do not sacrifice accessibility for aesthetics.

==================================================
11. CODE QUALITY
==================================================

While fixing the frontend:

- remove obvious duplication
- remove dead UI code
- remove unused imports
- remove unused components only when clearly unused
- fix obvious TypeScript issues
- preserve existing architecture
- avoid unnecessary abstractions
- avoid `any`
- do not suppress errors just to make the build pass

Do not turn a visual cleanup into a complete architectural rewrite.

==================================================
12. NO FEATURE CREEP
==================================================

DO NOT add:

- new pages
- new features
- new dashboards
- fake statistics
- fake data
- additional animations
- additional sections
- unnecessary settings
- unnecessary notifications
- unnecessary filters

unless the existing implementation clearly requires them to fix an existing UX problem.

==================================================
13. PRIORITY ORDER
==================================================

Fix issues in this order:

1. Broken functionality
2. Layout problems
3. Responsive problems
4. Visual hierarchy
5. Typography
6. Spacing
7. Component consistency
8. Interaction states
9. Accessibility
10. Decorative polish

Do not polish shadows while the layout is broken.

==================================================
14. IMPORTANT CODING RULE
==================================================

Before changing a component, understand why it exists.

Prefer:

small, targeted improvements

over:

large rewrites.

If something is already good:

KEEP IT.

If something is mediocre:

IMPROVE IT.

If something is unnecessary:

REMOVE IT.

If something is broken:

FIX IT.

==================================================
15. FINAL VERIFICATION
==================================================

After the audit:

- run TypeScript/typecheck
- run lint
- run the relevant build
- verify all affected routes
- verify responsive behavior
- check for console errors
- check for hydration errors
- check for broken imports
- check for missing keys
- check for accessibility regressions

Do not claim the frontend is fixed unless you actually verify it.

FINAL GOAL:

The result should feel like the same product, but significantly more intentional, refined, consistent, and production-ready.

DO NOT REDESIGN IT.
DO NOT REBUILD IT.
DO NOT ADD FEATURES.

POLISH THE EXISTING FRONTEND.
REMOVE THE SLOP.