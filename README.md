# gradient-shimmer

<p align="center">
  <img src="https://raw.githubusercontent.com/BIAsia/gradient-shimmer/main/assets/hero.png" alt="gradient-shimmer — a multi-stop gradient text shimmer for React" width="760" />
</p>

A zero-dependency React text shimmer that sweeps a **multi-stop gradient**
highlight across your text. Driven by the Web Animations API — no CSS import, no
Tailwind, no runtime dependencies.

```bash
npm i gradient-shimmer
```

## Usage

```tsx
import { GradientShimmer } from "gradient-shimmer"

export function Running() {
  return <GradientShimmer gradient="sunrise">memory-research</GradientShimmer>
}
```

Pass your own gradient stops instead of a preset:

```tsx
<GradientShimmer
  gradient={[
    { color: "#EF9B62", position: 0 },
    { color: "#A0C4E8", position: 1 },
  ]}
  easing="smooth"
  pauseBetween={1000}
>
  building your project…
</GradientShimmer>
```

The text is real DOM text (selectable, screen-readable), the band fades into the
text's own `currentColor`, and the sweep pauses off-screen, while scrolling, and
under `prefers-reduced-motion`.

## Compatibility

`gradient-shimmer` supports React 18+ and current evergreen browsers.

The full animated shimmer effect relies on:

- `background-clip: text` / `-webkit-background-clip: text` to clip the gradient
  to real text.
- `color-mix()` to keep the highlight's soft edges visually blended into the
  base text color.
- `Element.animate()` from the Web Animations API to run the sweep.
- `IntersectionObserver` for the off-screen pause behavior.

Fallback behavior is deliberately readable:

- If `background-clip: text` is unavailable, the component renders ordinary text.
- If `Element.animate()` is unavailable, the text keeps its first static gradient
  paint and does not sweep.
- If `IntersectionObserver` is unavailable, the shimmer still works; only the
  off-screen pause gate is skipped.
- If `color-mix()` is unavailable, the original blended highlight is not
  guaranteed. This library keeps `color-mix()` because that blend is part of the
  intended visual design.

The package is SSR-safe to import, but the component itself is client-side. The
published entry files include `"use client"` for React Server Components /
Next.js App Router projects.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `string` | — | The text to shimmer. |
| `gradient` | `GradientStop[] \| GradientPresetName` | `"sunrise"` | Multi-stop band or a preset (see below). |
| `easing` | `"smooth" \| "gentle" \| "snappy"` | `"smooth"` | Sweep curve. |
| `duration` | `number` | `1.45` | Reference speed; normalized by text width (constant px/s). |
| `spread` | `number` | `3` | Band width in px/char; scales with font size. |
| `angle` | `number` | `105` | Gradient angle in degrees. |
| `pauseBetween` | `number` | `1000` | Idle gap (ms) after each sweep. |
| `baseColor` | `string` | `"currentColor"` | Color the band fades into. |
| `pauseOnScroll` | `boolean` | `true` | Pause while the page scrolls. |
| `pauseWhenOffscreen` | `boolean` | `true` | Pause while outside the viewport. |
| `respectReducedMotion` | `boolean` | `true` | Static gradient under reduced motion. |
| `as` | `ElementType` | `"span"` | Element to render. |
| `className` / `style` / `aria-*` / `data-*` | — | — | Passed through. |

## Presets

Built-in `gradient` names (`GradientPresetName`):

`sunrise` · `bubble` · `sunset` · `peach` · `tonic` · `mint` · `spring` · `twilight` · `bay`

## Also exported

```ts
import { gradientPresets, easingPresets, buildBandGradient } from "gradient-shimmer"
```

`buildBandGradient(stops, angle)` is the pure helper that returns the CSS
`background-image` for the highlight band — useful for SSR or custom rendering.
It uses `--gs-base`, `--gs-spread`, and `--gs-spread-mid` CSS variables when
used outside the bundled component.

## Next.js

The published entry files include `"use client"` so `GradientShimmer` works in
Next.js App Router projects. You can import it from a Client Component directly:

```tsx
import { GradientShimmer } from "gradient-shimmer"

export function StatusText() {
  return <GradientShimmer>building your project...</GradientShimmer>
}
```

## Release check

```bash
pnpm release:check
```

This type-checks the source, packs the npm tarball, installs it into a temporary
consumer project with React 18, and verifies ESM, CJS, and TypeScript imports.

## License

MIT
