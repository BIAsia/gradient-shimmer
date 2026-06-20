import type { EasingPreset, GradientPresetName, GradientStop } from "./types"

/** Built-in gradients. Raw colors, so the presets read true regardless of theme. */
export const gradientPresets: Record<GradientPresetName, GradientStop[]> = {
  sunrise: [
    { color: "#EF9B62", position: 0 },
    { color: "#A0C4E8", position: 1 },
  ],
  sunset: [
    { color: "#B6D3EF", position: 0 },
    { color: "#E8CCAF", position: 0.4 },
    { color: "#F09050", position: 0.63 },
    { color: "#F888A0", position: 0.9 },
  ],
  mint: [
    { color: "#DECEE8", position: 0 },
    { color: "#CBBAEE", position: 0.21 },
    { color: "#7DC0FB", position: 0.46 },
    { color: "#00C7A6", position: 1 },
  ],
  twilight: [
    { color: "#E3CCE6", position: 0 },
    { color: "#4E8CD5", position: 0.35 },
    { color: "#6068C2", position: 0.64 },
    { color: "#38364E", position: 1 },
  ],
  candy: [
    { color: "#D9F5FA", position: 0 },
    { color: "#FCD9D6", position: 0.31 },
    { color: "#FCBAC9", position: 0.61 },
    { color: "#F0B3F5", position: 1 },
  ],
}

/** Named easing presets mapped to their cubic-bezier curves. */
export const easingPresets: Record<EasingPreset, string> = {
  // Balanced ease-in-out: dwells off-text at the ends, accelerates across glyphs.
  smooth: "cubic-bezier(0.45, 0, 0.55, 1)",
  // Softer, longer dwell at the ends.
  gentle: "cubic-bezier(0.76, 0, 0.24, 1)",
  // Quicker pass across the text.
  snappy: "cubic-bezier(0.3, 0, 0.2, 1)",
}
