import type { GradientStop } from "./types"

/** Saturated core half-width as a fraction of `--gs-spread-mid`. */
const BAND_CORE_RATIO = 0.44

/**
 * Build the CSS `background-image` for the moving highlight band.
 *
 * Every stop is distributed across the saturated core
 * `[-spread_mid*0.44 .. +spread_mid*0.44]`, then fades out to the base text
 * color through a soft mix at `±spread_mid` and the plain base at `±spread`.
 * The band reads the runtime CSS variables `--gs-base`, `--gs-spread` and
 * `--gs-spread-mid` (set by the component after measuring), so it scales with
 * font size. Pure and DOM-free — safe to call on the server or unit-test.
 */
export function buildBandGradient(stops: GradientStop[], angle: number): string {
  const sorted = [...stops].sort((a, b) => a.position - b.position)
  const first = sorted[0]?.color ?? "white"
  const last = sorted[sorted.length - 1]?.color ?? "white"

  const core = sorted
    .map((stop) => {
      const factor = (stop.position - 0.5) * 2 * BAND_CORE_RATIO
      return `${stop.color} calc(50% + var(--gs-spread-mid) * ${factor.toFixed(4)})`
    })
    .join(", ")

  return [
    `linear-gradient(${angle}deg`,
    `var(--gs-base) calc(50% - var(--gs-spread))`,
    `color-mix(in oklab, var(--gs-base) 42%, ${first}) calc(50% - var(--gs-spread-mid))`,
    core,
    `color-mix(in oklab, var(--gs-base) 42%, ${last}) calc(50% + var(--gs-spread-mid))`,
    `var(--gs-base) calc(50% + var(--gs-spread)))`,
  ].join(", ")
}
