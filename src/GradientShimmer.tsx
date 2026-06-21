"use client"

import { createElement, type CSSProperties, useEffect, useMemo, useRef } from "react"
import { buildBandGradient } from "./build-band-gradient"
import { easingPresets, gradientPresets } from "./presets"
import type { GradientInput, GradientShimmerProps, GradientStop } from "./types"
import {
  observeShimmerActive,
  prefersReducedMotion,
  supportsBackgroundClipText,
} from "./visibility"

// Sweep speed is normalized so the highlight travels a constant px/s at any size.
const SPEED_MULTIPLIER = 0.8
const REFERENCE_DISTANCE_PX = 280
const FALLBACK_TEXT_WIDTH_PX = 96
const MAX_SPREAD_PX = 48
const SPREAD_MID_RATIO = 0.72
// Font size the spread/char default is tuned for; larger text scales up from here.
const BASE_FONT_PX = 14

function resolveStops(gradient: GradientInput | undefined): GradientStop[] {
  if (!gradient) return gradientPresets.sunrise
  if (typeof gradient === "string") return gradientPresets[gradient] ?? gradientPresets.sunrise
  return gradient
}

/**
 * A text shimmer that sweeps a multi-stop gradient highlight across its text.
 * Web-Animations-API driven, zero runtime dependencies, no CSS import.
 */
export function GradientShimmer({
  children,
  gradient,
  easing = "smooth",
  duration = 1.45,
  spread = 3,
  angle = 105,
  pauseBetween = 1000,
  baseColor = "currentColor",
  pauseOnScroll = true,
  pauseWhenOffscreen = true,
  respectReducedMotion = true,
  as = "span",
  className,
  style,
}: GradientShimmerProps) {
  const ref = useRef<HTMLElement | null>(null)
  const stops = useMemo(() => resolveStops(gradient), [gradient])
  const backgroundImage = useMemo(() => buildBandGradient(stops, angle), [stops, angle])
  const easingValue = easingPresets[easing] ?? easingPresets.smooth

  // SSR-safe seed so the first paint has a valid band (no font scale known yet).
  const initialSpread = Math.min(children.length * spread, MAX_SPREAD_PX)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const measure = () => {
      const textWidth = el.getBoundingClientRect().width || FALLBACK_TEXT_WIDTH_PX
      const fontSize = Number.parseFloat(getComputedStyle(el).fontSize) || BASE_FONT_PX
      const fontScale = fontSize / BASE_FONT_PX
      const spreadPx = Math.min(children.length * spread * fontScale, MAX_SPREAD_PX * fontScale)
      const layerWidth = Math.max(1, textWidth + spreadPx * 2)
      const start = -spreadPx - layerWidth / 2
      const end = textWidth + spreadPx - layerWidth / 2
      const travel = Math.max(1, textWidth + spreadPx * 2)
      const referenceDuration = duration / SPEED_MULTIPLIER
      const pixelsPerSecond = REFERENCE_DISTANCE_PX / referenceDuration
      const durationMs = (travel / pixelsPerSecond) * 1000
      el.style.setProperty("--gs-spread", `${spreadPx}px`)
      el.style.setProperty("--gs-spread-mid", `${spreadPx * SPREAD_MID_RATIO}px`)
      el.style.backgroundSize = `${layerWidth}px 100%`
      return { start, end, durationMs }
    }

    // No `background-clip: text` support → the transparent text-fill would hide
    // the text entirely. Strip it so the text renders in its normal color, and
    // skip the sweep (there's nothing to clip the gradient to).
    if (!supportsBackgroundClipText()) {
      el.style.removeProperty("-webkit-text-fill-color")
      return
    }

    // Refine the seeded vars with a real measurement.
    measure()

    if (respectReducedMotion && prefersReducedMotion()) return // static, no sweep

    let anim: Animation | null = null
    let pauseTimer: ReturnType<typeof setTimeout> | undefined
    let active = true
    let cancelled = false

    const runSweep = () => {
      if (cancelled) return
      const { start, end, durationMs } = measure()
      const next = el.animate(
        [{ backgroundPosition: `${start}px center` }, { backgroundPosition: `${end}px center` }],
        { duration: durationMs, easing: easingValue, fill: "forwards" }
      )
      if (!active) next.pause()
      // Cancel the previous (now-finished) sweep only after the next one has taken
      // over the property — otherwise finished `fill: forwards` animations pile up
      // on the element across cycles.
      anim?.cancel()
      anim = next
      next.onfinish = () => {
        pauseTimer = setTimeout(runSweep, Math.max(0, pauseBetween))
      }
    }

    const stopVisibility = observeShimmerActive(
      el,
      { pauseOnScroll, pauseWhenOffscreen },
      (next) => {
        active = next
        if (anim) {
          if (active) anim.play()
          else anim.pause()
        }
      }
    )

    runSweep()

    return () => {
      cancelled = true
      anim?.cancel()
      clearTimeout(pauseTimer)
      stopVisibility()
    }
  }, [
    children,
    spread,
    duration,
    easingValue,
    pauseBetween,
    pauseOnScroll,
    pauseWhenOffscreen,
    respectReducedMotion,
  ])

  const mergedStyle: CSSProperties = {
    position: "relative",
    display: "inline-block",
    backgroundImage,
    backgroundRepeat: "no-repeat",
    // First paint spans the full text (a static gradient); the effect swaps in
    // the px layer width once measured and starts sweeping.
    backgroundSize: "100% 100%",
    backgroundColor: "var(--gs-base)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    // Reveal the clipped gradient via text-fill-color (not `color: transparent`)
    // so `currentColor` in `--gs-base` still resolves to the real text color.
    WebkitTextFillColor: "transparent",
    ["--gs-base" as string]: baseColor,
    ["--gs-spread" as string]: `${initialSpread}px`,
    ["--gs-spread-mid" as string]: `${initialSpread * SPREAD_MID_RATIO}px`,
    ...style,
  }

  return createElement(as, { ref, className, style: mergedStyle }, children)
}
