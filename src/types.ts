import type { CSSProperties, ElementType } from "react"

/** A single stop in the highlight band, positioned 0..1 across the sweep. */
export interface GradientStop {
  position: number
  color: string
}

export type GradientPresetName =
  | "sunrise"
  | "bubble"
  | "sunset"
  | "peach"
  | "tonic"
  | "mint"
  | "spring"
  | "twilight"
  | "bay"

/** Either an explicit multi-stop gradient or a built-in preset name. */
export type GradientInput = GradientStop[] | GradientPresetName

/** Named easing presets for the sweep (no raw cubic-bezier in the public API). */
export type EasingPreset = "smooth" | "gentle" | "snappy"

export interface GradientShimmerProps {
  /** The text to shimmer. Plain string only — the gradient sweeps over it. */
  children: string
  /** Multi-stop gradient or a preset name. Defaults to `"sunrise"`. */
  gradient?: GradientInput
  /** Sweep curve. Defaults to `"smooth"`. */
  easing?: EasingPreset
  /**
   * Reference sweep speed. The real CSS duration is normalized by text width so
   * the highlight travels at a constant px/s at any size. Defaults to `1.45`.
   */
  duration?: number
  /** Highlight band width in px per character; scales with font size. Defaults to `3`. */
  spread?: number
  /** Gradient angle in degrees. Defaults to `105`. */
  angle?: number
  /** Idle gap (ms) after each sweep before the next one. Defaults to `1000`. */
  pauseBetween?: number
  /** Base text color the band fades into. Defaults to `"currentColor"`. */
  baseColor?: string
  /** Pause the sweep while the page is scrolling. Defaults to `true`. */
  pauseOnScroll?: boolean
  /** Pause + drop the layer while off-screen. Defaults to `true`. */
  pauseWhenOffscreen?: boolean
  /** Render a static gradient (no sweep) under `prefers-reduced-motion`. Defaults to `true`. */
  respectReducedMotion?: boolean
  /** Element to render. Defaults to `"span"`. */
  as?: ElementType
  className?: string
  style?: CSSProperties
}
