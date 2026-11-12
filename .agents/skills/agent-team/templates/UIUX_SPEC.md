# UI/UX Specification: [Feature / Project Name]

## 1. Aesthetic Direction & Design System
- **Product Archetype:** [e.g., SaaS Dashboard | E-Commerce | Developer Tool | Portfolio]
- **Design Dials:**
  - Variance: [1-10] (1: Centered/Minimal | 5: Modern Balanced | 9: Bold/Asymmetric)
  - Motion: [1-10] (1: Subtle Micro | 5: Stagger/Standard | 8: Complex Motion)
  - Density: [1-10] (2: Spacious | 5: Standard | 8: Compact Dashboard)
- **Target Stack:** [e.g., Next.js + Tailwind CSS | Flutter | React + Shadcn UI]

### Typography & Fonts
- **Primary / Body Font:** [e.g., Inter, Plus Jakarta Sans]
- **Heading / Accent Font:** [e.g., Syne, Cal Sans]
- **Code / Monospace:** [e.g., JetBrains Mono]
- **Scale:** H1 (2.25rem), H2 (1.75rem), H3 (1.25rem), Body (1rem / 16px base), Caption (0.875rem)

### Color Palette (Tokens)
- **Background:** 
- **Surface / Cards:** 
- **Primary Accent:** 
- **Secondary / Highlight:** 
- **Border / Subtle:** 
- **Semantic Accents:** Success | Warning | Error | Info

---

## 2. Layout Hierarchy & Responsive Breakpoints
- **Mobile (< 768px):** Single column, bottom navigation / drawer, touch targets >= 44x44px
- **Tablet (768px - 1023px):** Adaptive column grid, collapsable sidebars
- **Desktop (>= 1024px):** Persistent layout, content container constraints (max 1280px / 1440px)
- **Spacing Scale:** 4px / 8px base rhythm (`--space-1` to `--space-8`)

---

## 3. Component & State Matrix
| Component | Default | Hover / Focus | Active | Disabled | Loading / Skeleton | Empty / Error |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| | | | | | | |

---

## 4. Micro-Interactions, Animation & Feedback
- **Transitions:** [e.g., 150ms ease-out for interactive states, 250ms cubic-bezier for drawers/modals]
- **Reduced Motion:** Gracefully downgrade animations to instant opacity transitions when `prefers-reduced-motion: reduce` is active.
- **Empty & Error States Copy:** Human, contextual, and clear guidance (integrated from Humanizer).

---

## 5. UI/UX Pro Max Priority Quality Gate
- [ ] **Accessibility:** Contrast ratio >= 4.5:1 (WCAG AA) for all text and interactive icons.
- [ ] **Focus Rings:** Visible focus ring on all interactive elements during keyboard navigation.
- [ ] **Touch Ergonomics:** Touch targets >= 44x44px with >= 8px spacing on touch viewports.
- [ ] **No Layout Shift (CLS):** Media elements reserve fixed aspect ratios/skeletons before loading.
- [ ] **Icons:** High-quality SVG icons only (zero emoji as functional buttons/icons).
