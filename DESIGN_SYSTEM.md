# Design System Documentation

This document outlines the design system, UI/UX patterns, and implementation guidelines extracted from the existing LMS client application. This serves as a source of truth for replicating the exact look, feel, and user experience in a new client application.

## 1. Design Tokens

The application uses **Tailwind CSS v4** which defines design tokens directly in `styles.css` using the `@theme inline` directive instead of a traditional `tailwind.config.ts`. The default color space relies heavily on the `oklch()` format for dynamic and vibrant color management.

### Typography Scale
- **Mono**: `"JetBrains Mono", ui-monospace, monospace` (`--font-mono`)
- **Display**: `"Space Grotesk", ui-sans-serif, system-ui, sans-serif` (`--font-display`)
- **Body**: `"Inter", ui-sans-serif, system-ui, sans-serif` (`--font-body`)
- Tabular Nums are supported via `.num` class (`font-variant-numeric: tabular-nums`).

### Color Palette (Default Theme)
- **Background**: `oklch(0.08 0.01 260)` (Deep Space Blue/Black)
- **Foreground**: `oklch(0.96 0.01 200)` (Near White)
- **Primary**: `#de04fb` (Vibrant Neon Pink/Purple)
- **Primary Foreground**: `#ffffff`
- **Secondary**: `oklch(0.18 0.02 260)` (Elevated dark tone)
- **Card/Popover**: `oklch(0.11 0.015 260)`
- **Muted**: `oklch(0.15 0.015 260)` (Subtle borders and backgrounds)
- **Destructive**: `oklch(0.65 0.25 25)`
- **Border/Input**: `oklch(0.25 0.02 260 / 60%)`

### Derived Brand Shades (via `color-mix`)
- **Primary Soft**: 12% primary + transparent
- **Primary Muted**: 35% primary + transparent
- **Primary Glow**: 60% primary + white
- **Primary Deep**: 65% primary + black

### Specialized Tokens
- **Gradients**: `--gradient-primary` (`linear-gradient(135deg, var(--primary), var(--primary-deep))`)
- **Shadows**: `--shadow-primary-glow` (`0 0 32px color-mix(in oklab, var(--primary) 55%, transparent)`)
- **Radius Scale**: Base `--radius` is `0.25rem` (4px). Scales up to `4xl`.

### Admin Theme (`.admin-theme`)
The application features a specific `.admin-theme` class that slightly alters the background, card, and popover colors to lighter, more distinct shades, along with a larger base `--radius` (`0.625rem`). It also introduces several `--neon-*` colors and `--grad-*` gradients.

---

## 2. UI Components (Shadcn/UI & Radix)

The project leverages a highly customized **Shadcn/UI** architecture overlaid on **Radix UI** primitives. 

### Configuration (`components.json`)
- **Style**: `new-york`
- **Base Color**: `slate`
- **CSS Variables**: `true`
- **Icon Library**: `lucide-react`
- **Aliases**: Components are historically aliased to `@/components` and `@/components/ui`, but specific core UI primitives (like Dialog, Sonner, Input OTP) are implemented directly in `@/presentation/core-ui/`.

### Component Styling Guidelines
- **Buttons / CTA**: Primary actions often use the background gradient `bg-[image:var(--gradient-primary)]` to create a striking aesthetic, paired with `text-primary-foreground`.
- **Badges / Role Tags**: Achieved via colored text with low-opacity backgrounds and borders. Example (Student Role): `text-cyan-400 bg-cyan-400/10 border-cyan-400/30`.
- **Active Navigation States**: Highlighted using `data-[status=active]` selectors. They feature a soft background `bg-primary-soft`, foreground text, and a subtle ring `ring-1 ring-primary/40`.
- **Hover States**: Extremely subtle. Often use `hover:bg-foreground/[0.04]` or `hover:bg-destructive/[0.06]`.

---

## 3. Layout Patterns

The structure follows an "App Shell" paradigm using Flexbox, characterized by fixed structural elements and scrollable content areas.

### Topbar (Header)
- **Structure**: Sticky positioned (`sticky top-0 z-30`), usually `h-14` scaling up to `md:h-20`.
- **Glassmorphism**: Achieved via `bg-background/80 backdrop-blur-xl`.
- **Border**: A very subtle separation line using `border-b border-border/60`.

### Sidebar
- **Structure**: Hidden on mobile, fixed width (`w-20` shrink-0) on desktop.
- **Positioning**: Sticky positioned (`sticky top-14`) to sit precisely under the header, height calculated as `h-[calc(100vh-3.5rem)]`.
- **Styling**: `bg-background/60` with a subtle right border `border-r border-border/60`.

### Mobile Navigation
- Utilizes a full-screen drawer pattern. The drawer (`w-72 max-w-[80vw]`) slides over a blurred overlay `bg-background/80 backdrop-blur-sm`.

---

## 4. Component-Based Styling Principles

The application employs consistent, modular styling techniques across all core components to maintain a premium, cohesive look.

### Dashboard & Data Views
- **Bento Grid Layouts**: Dashboards heavily use "Bento Box" grids (e.g., `grid gap-4 sm:grid-cols-2 lg:grid-cols-4`).
- **Container Sizing**: Main dashboard views are constrained for readability (`max-w-[1400px] mx-auto w-full`).
- **Data Timelines**: Vertical timelines are created using CSS pseudo-elements (`relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-border`) combined with absolutely positioned glowing dots.

### Cards (`MagicBentoCard`)
- **Containers**: Cards rely on large border radii and subtle borders (`rounded-2xl border border-border bg-card`).
- **Depth & Shadows**: Instead of standard drop shadows, cards use glowing colored blurs (`shadow-xl` combined with custom `glowColor` props and absolutely positioned background blurred blobs like `blur-[100px] opacity-15`).
- **Icon Blocks**: Icons within cards are housed in tinted square containers to match the brand accent (e.g., `h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400`).

### Sidebar Navigation
- **Glass & Hairlines**: The sidebar relies on extreme transparency (`bg-[var(--surface)]/60 backdrop-blur-sm`) and ultra-thin borders (`border-[var(--hairline)]`).
- **Scroll Suppression**: Sidebars implement `[scrollbar-width:none]` and hide webkit scrollbars while adding `data-lenis-prevent="true"` to prevent global smooth scrolling from interfering with menu scrolling.
- **Active Navigation States**: Active dashboard links use primary gradients and deep shadows: `bg-[image:var(--grad-cta)] shadow-lg shadow-indigo-500/25 border-l-2 border-indigo-500`.

### Footer (`RevealFooter`)
- **Reveal Effect**: The footer uses a "curtain reveal" pattern. It is fixed to the bottom back layer (`fixed bottom-0 z-0`) while an empty `div` above it dynamically matches its height, allowing the page content to scroll up and reveal the footer underneath.
- **Typography**: Employs massive, fluidly scalable wordmarks (`font-size: clamp(3rem, 14.8vw, 12.5rem)`) using the `font-display` stack with ultra-tight tracking and line height (`tracking-[-0.06em] leading-[0.95]`).

---

## 5. Animations & Motion

The application avoids standard, clunky CSS transitions in favor of highly smooth, premium motion primitives.

### Smooth Scrolling (Lenis)
The app implements **Lenis** globally to override native browser scrolling.
- **Duration**: `1.2` seconds.
- **Easing Function**: Custom ease-out curve (`Math.min(1, 1.001 - Math.pow(2, -10 * t))`).
- **Styles**: Custom themed scrollbars are applied to the `html` tag. A `html.lenis` class ensures smooth behavior, overriding `overscroll-behavior`.

### Micro-Interactions & CSS Animations
- **Tailwind Animate CSS**: The plugin `tw-animate-css` is integrated to provide utility classes for simple, reusable animations.
- Hover transitions are brief but impactful, usually animating `colors` and `opacity`.

### Complex Animations
The project leverages the **GreenSock Animation Platform (GSAP)** and **Three.js** (via `@react-three/fiber` and `@react-three/drei`) for high-fidelity animations. Components like `<SplashCursor />`, `<DarkVeil />`, and `<MagicBento />` use WebGL shaders and GSAP timelines to create "wow" factors on the screen.

---

## 6. Implementation Guide

To perfectly replicate this UI/UX in a new frontend application, follow these specific steps:

### Step 1: Install Core Dependencies
Install the required animation and styling packages:
```bash
npm i tailwindcss @tailwindcss/vite tw-animate-css
npm i lenis lucide-react clsx tailwind-merge
npm i gsap three @react-three/fiber @react-three/drei
```

### Step 2: Configure Tailwind v4 & CSS
Copy the entire `styles.css` file verbatim into your new project. Ensure your build tool (e.g., Vite) is configured to use the `@tailwindcss/vite` plugin.

Since it's Tailwind v4, **do not create a `tailwind.config.ts`**. Instead, import your CSS directly into your app's entrypoint:
```css
/* src/styles.css */
@import "tailwindcss";
@import "tw-animate-css";
/* ... paste existing CSS tokens here ... */
```

### Step 3: Implement Global Smooth Scrolling
Create a `SmoothScroll.tsx` component and mount it at the root of your application to ensure native-feeling inertia scroll across all pages.
```tsx
import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);
  return null;
}
```

### Step 4: Apply the App Shell Pattern
Wrap your main router output in an `<AppShell>` component that provides the structural framework. Remember to use glassmorphic headers.

```tsx
<div className="relative min-h-screen bg-background text-foreground">
  {/* Header */}
  <header className="sticky top-0 z-30 h-14 border-b border-border/60 bg-background/80 backdrop-blur-xl">
    {/* Navigation */}
  </header>
  
  <div className="flex">
    {/* Sidebar */}
    <aside className="sticky top-14 h-[calc(100vh-3.5rem)] w-20 shrink-0 border-r border-border/60 bg-background/60 hidden md:flex">
      {/* Sidebar Items */}
    </aside>
    
    {/* Main Content Area */}
    <main className="min-w-0 flex-1">
      {children}
    </main>
  </div>
</div>
```

### Step 5: Radix & Shadcn Import Rules
For any new interactive components, initialize them via Shadcn UI but immediately override their standard border/background colors with the variables defined in `styles.css` (e.g., replace standard `bg-primary` with `bg-[image:var(--gradient-primary)]` for call-to-action buttons). Use `oklch` for any custom hardcoded colors to maintain vibrancy parity.
