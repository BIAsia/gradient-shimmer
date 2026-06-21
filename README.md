# gradient-shimmer

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

The text is real DOM text (selectable, screen-readable), the base color is
`currentColor` by default, and the sweep pauses off-screen, while scrolling, and
under `prefers-reduced-motion`.

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
| `pauseWhenOffscreen` | `boolean` | `true` | Pause + drop the layer off-screen. |
| `respectReducedMotion` | `boolean` | `true` | Static gradient under reduced motion. |
| `as` | `ElementType` | `"span"` | Element to render. |
| `className` / `style` | — | — | Passed through. |

## Presets

Built-in `gradient` names (`GradientPresetName`):

`sunrise` · `bubble` · `sunset` · `peach` · `tonic` · `mint` · `spring` · `twilight` · `bay`

## Also exported

```ts
import { gradientPresets, easingPresets, buildBandGradient } from "gradient-shimmer"
```

`buildBandGradient(stops, angle)` is the pure helper that returns the CSS
`background-image` for the highlight band — useful for SSR or custom rendering.

## License

MIT
