import { type CSSProperties, type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react"
import { GradientShimmer, gradientPresets, type GradientPresetName, type GradientStop } from "gradient-shimmer"
import { ThemeToggle } from "./motion/ThemeToggle"
import { gsap, prefersReducedMotion } from "./motion/gsap"
import { usePageMotion } from "./motion/usePageMotion"
import { useSmoothScroll } from "./motion/useSmoothScroll"

type Easing = "smooth" | "gentle" | "snappy"

const PRESET_NAMES = Object.keys(gradientPresets) as GradientPresetName[]
const RUNNING_TITLE = "gradient-shimmer"
const INSTALL = "npm i gradient-shimmer"
const COLUMN = 460

function swatchCss(stops: GradientStop[]) {
  const sorted = [...stops].sort((a, b) => a.position - b.position)
  return `linear-gradient(180deg, ${sorted.map((s) => `${s.color} ${Math.round(s.position * 100)}%`).join(", ")})`
}

function Label({ children }: { children: ReactNode }) {
  return (
    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--muted)" }}>
      {children}
    </p>
  )
}

function InstallCard({ command }: { command: ReactNode }) {
  const [copied, setCopied] = useState(false)
  const checkRef = useRef<HTMLSpanElement | null>(null)
  const copy = async () => {
    let ok = false
    try {
      if (window.isSecureContext && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(INSTALL)
        ok = true
      }
    } catch {
      ok = false
    }
    if (!ok) {
      // Fallback for non-secure contexts (LAN IP / http) and older browsers.
      try {
        const ta = document.createElement("textarea")
        ta.value = INSTALL
        ta.setAttribute("readonly", "")
        ta.style.position = "fixed"
        ta.style.top = "0"
        ta.style.opacity = "0"
        document.body.appendChild(ta)
        ta.select()
        ok = document.execCommand("copy")
        document.body.removeChild(ta)
      } catch {
        ok = false
      }
    }
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    }
  }
  useEffect(() => {
    if (copied && checkRef.current && !prefersReducedMotion()) {
      gsap.fromTo(checkRef.current, { scale: 0.3 }, { scale: 1, duration: 0.4, ease: "back.out(3)" })
    }
  }, [copied])
  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy install command"
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "14px 16px",
        borderRadius: 14,
        background: "var(--surface)",
        border: "0.5px solid var(--border)",
        boxShadow: "var(--panel-shadow)",
        cursor: "pointer",
        font: "inherit",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", minWidth: 0, flex: 1, fontFamily: "var(--mono)", fontSize: 14 }}>
        <span style={{ color: "var(--muted)", flex: "0 0 auto", marginRight: 6 }}>$</span>
        <span className="no-scrollbar" style={{ minWidth: 0, overflowX: "auto", whiteSpace: "nowrap" }}>
          {command}
        </span>
      </span>
      <span style={{ flex: "0 0 auto", color: copied ? "var(--fg)" : "var(--muted)", fontSize: 13, display: "inline-flex", width: 16, justifyContent: "center" }}>
        {copied ? <span ref={checkRef} style={{ display: "inline-block" }}>✓</span> : <CopyIcon />}
      </span>
    </button>
  )
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <rect x="5.5" y="5.5" width="8" height="8" rx="2" />
      <path d="M10.5 5.5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4.5a2 2 0 0 0 2 2h1.5" />
    </svg>
  )
}

function GradientSwatch({ name, selected, onSelect }: { name: GradientPresetName; selected: boolean; onSelect: () => void }) {
  return (
    <div className="swatch-wrap">
      <button
        type="button"
        data-swatch
        className="swatch"
        aria-label={name}
        aria-pressed={selected}
        onClick={onSelect}
        style={{
          width: 40,
          height: 40,
          borderRadius: 999,
          border: "none",
          padding: 0,
          cursor: "pointer",
          background: "transparent",
          boxShadow: selected ? "0 0 0 2px var(--bg), 0 0 0 3.5px var(--ring)" : "none",
        }}
      >
        <span
          aria-hidden
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            borderRadius: 999,
            backgroundImage: swatchCss(gradientPresets[name]),
            // Hairline sits OUTSIDE the circle so it defines the edge without
            // tinting the gradient — the band now fills top-to-bottom.
            boxShadow: selected ? "none" : "0 0 0 1px var(--border)",
          }}
        />
      </button>
      <span className="swatch-name" aria-hidden>{name}</span>
    </div>
  )
}

function SegmentedControl<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  const segRef = useRef<HTMLDivElement | null>(null)
  const indRef = useRef<HTMLDivElement | null>(null)
  const btns = useRef<(HTMLButtonElement | null)[]>([])

  // Slide the indicator to the active button, reading the live DOM so resizes
  // (and font swaps) reposition it without a stale closure.
  const place = () => {
    const ind = indRef.current
    const active = btns.current.find((b) => b?.getAttribute("aria-pressed") === "true")
    if (ind && active) {
      ind.style.width = `${active.offsetWidth}px`
      ind.style.transform = `translateX(${active.offsetLeft}px)`
    }
  }

  useLayoutEffect(place, [value, options])
  useEffect(() => {
    if (!segRef.current) return
    const ro = new ResizeObserver(place)
    ro.observe(segRef.current)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={segRef} className="seg">
      <div ref={indRef} className="seg-indicator" aria-hidden />
      {options.map((o, i) => (
        <button
          key={o.value}
          ref={(el) => {
            btns.current[i] = el
          }}
          type="button"
          className="seg-btn"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function SliderRow({ label, value, min, max, step, onChange, format }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format: (v: number) => string }) {
  const valueRef = useRef<HTMLSpanElement | null>(null)
  useEffect(() => {
    if (valueRef.current && !prefersReducedMotion()) {
      gsap.fromTo(valueRef.current, { scale: 1.18 }, { scale: 1, duration: 0.35, ease: "power2.out", overwrite: true })
    }
  }, [value])
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 7, width: "100%" }}>
      <span style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
        <span style={{ fontWeight: 400 }}>{label}</span>
        <span ref={valueRef} style={{ display: "inline-block", color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{format(value)}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  )
}

function ChannelRow({ title, running, selected, shimmer }: { title: string; running?: boolean; selected?: boolean; shimmer?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 12, background: selected ? "var(--bg-weak)" : "transparent" }}>
      <span style={{ width: 18, textAlign: "center", color: running ? "var(--fg)" : "var(--muted)", fontWeight: 500 }}>#</span>
      <span style={{ minWidth: 0, fontSize: 15, fontWeight: 500 }}>
        {running ? shimmer : <span style={{ color: "var(--muted)" }}>{title}</span>}
      </span>
    </div>
  )
}

const PROPS: Array<[string, string, string]> = [
  ["gradient", 'preset | stops[]', '"sunrise"'],
  ["easing", "smooth | gentle | snappy", '"smooth"'],
  ["duration", "number", "1.45"],
  ["spread", "number", "3"],
  ["angle", "number", "105"],
  ["pauseBetween", "number (ms)", "1000"],
]

const SECTION: CSSProperties = { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: "100%" }
const DIVIDER: CSSProperties = { width: "100%", height: 0, borderTop: "0.5px solid var(--border)" }
const ROW: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, width: "100%" }
// Quiet label, matched to the Props rows below.
const ROW_LABEL: CSSProperties = { fontSize: 13, fontWeight: 400, color: "var(--fg)", whiteSpace: "nowrap" }

export function App() {
  const [presetId, setPresetId] = useState<GradientPresetName>("sunrise")
  const [easing, setEasing] = useState<Easing>("smooth")
  const [duration, setDuration] = useState(1.45)
  const [spread, setSpread] = useState(3)
  const [angle, setAngle] = useState(105)
  const [pauseBetween, setPauseBetween] = useState(700)
  const [title, setTitle] = useState(RUNNING_TITLE)

  const scope = useRef<HTMLDivElement | null>(null)

  useSmoothScroll()
  usePageMotion(scope, PRESET_NAMES.length)

  const channelText = title.trim() === "" ? RUNNING_TITLE : title
  const shimmerProps = { gradient: presetId, easing, duration, spread, angle, pauseBetween, pauseOnScroll: false } as const

  const runningShimmer = (
    <GradientShimmer {...shimmerProps} style={{ maxWidth: "100%" }}>
      {channelText}
    </GradientShimmer>
  )

  return (
    <>
      <div ref={scope} style={{ width: "100%", maxWidth: COLUMN + 48, margin: "0 auto", padding: "0 24px 100px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Top links */}
        <nav data-nav style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "22px 0 0" }}>
          <ThemeToggle />
          <div style={{ display: "flex", gap: 8 }}>
            <a className="pill-link" href="https://github.com/BIAsia/gradient-shimmer">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.32c-2.23.49-2.7-1.07-2.7-1.07-.36-.93-.89-1.18-.89-1.18-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.71 1.23 1.87.87 2.33.67.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.83-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.52.56.83 1.28.83 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
              GitHub
            </a>
            <a className="pill-link" href="https://x.com" aria-label="X">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M12.6 0h2.45l-5.36 6.12L16 16h-4.94l-3.87-5.06L2.77 16H.32l5.73-6.55L0 0h5.06l3.5 4.63L12.6 0Zm-.86 14.55h1.36L4.32 1.38H2.86l8.88 13.17Z" />
              </svg>
            </a>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ ...SECTION, gap: 40, padding: "76px 0 56px" }}>
          <div data-hero-title style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.25, fontFamily: '"InterVariable", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif', fontFeatureSettings: '"cv11" 1, "cv05" 1, "ss01" 1' }}>
            <GradientShimmer {...shimmerProps} style={{ whiteSpace: "nowrap" }}>
              {channelText}
            </GradientShimmer>
          </div>
          <div data-hero-item style={{ width: "100%", maxWidth: 320 }}>
            <InstallCard
              command={
                <GradientShimmer {...shimmerProps} style={{ fontFamily: "var(--mono)", fontWeight: 400, whiteSpace: "nowrap" }}>
                  {INSTALL}
                </GradientShimmer>
              }
            />
          </div>
          <div data-hero-item style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
            {PRESET_NAMES.map((name) => (
              <GradientSwatch key={name} name={name} selected={name === presetId} onSelect={() => setPresetId(name)} />
            ))}
          </div>
        </section>

        <div style={DIVIDER} />

        {/* Controls — two groups: text/easing, then the numeric sliders */}
        <section data-reveal style={{ ...SECTION, gap: 32, padding: "44px 0", alignItems: "stretch" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, width: "100%" }}>
            <label style={ROW}>
              <span style={ROW_LABEL}>Text</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={RUNNING_TITLE}
                spellCheck={false}
                style={{ width: 240, padding: "8px 12px", borderRadius: 10, border: "0.5px solid var(--border)", background: "var(--surface)", color: "var(--fg)", font: "inherit", fontSize: 14, textAlign: "left", outline: "none" }}
              />
            </label>
            <div style={ROW}>
              <span style={ROW_LABEL}>Easing</span>
              <SegmentedControl
                value={easing}
                onChange={setEasing}
                options={[
                  { value: "smooth", label: "Smooth" },
                  { value: "gentle", label: "Gentle" },
                  { value: "snappy", label: "Snappy" },
                ]}
              />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
            <SliderRow label="Speed" value={duration} min={0.6} max={8} step={0.05} onChange={setDuration} format={(v) => `${v.toFixed(2)}s`} />
            <SliderRow label="Spread" value={spread} min={1} max={8} step={0.5} onChange={setSpread} format={(v) => `${v}px/char`} />
            <SliderRow label="Angle" value={angle} min={0} max={180} step={1} onChange={setAngle} format={(v) => `${Math.round(v)}°`} />
            <SliderRow label="Pause" value={pauseBetween} min={0} max={3000} step={50} onChange={setPauseBetween} format={(v) => `${Math.round(v)}ms`} />
          </div>
        </section>

        <div style={DIVIDER} />

        {/* In context */}
        <section data-reveal style={{ ...SECTION, gap: 14, padding: "44px 0" }}>
          <Label>In the channel sidebar</Label>
          <div style={{ width: "100%", maxWidth: 300, background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 20, boxShadow: "var(--panel-shadow)", padding: 8 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <ChannelRow title="general" />
              <ChannelRow title={channelText} running selected shimmer={runningShimmer} />
              <ChannelRow title="design-sync" />
              <ChannelRow title="release-notes" />
            </div>
          </div>
        </section>

        <div style={DIVIDER} />

        {/* Usage */}
        <section data-reveal style={{ ...SECTION, gap: 14, padding: "44px 0", alignItems: "stretch" }}>
          <Label>Usage</Label>
          <pre className="code-card">
            <code>
              <span className="tok-kw">import</span> {"{ GradientShimmer } "}
              <span className="tok-kw">from</span> <span className="tok-str">"gradient-shimmer"</span>
              {"\n\n"}
              <span className="tok-punc">{"<GradientShimmer"}</span> gradient=<span className="tok-str">"sunrise"</span>
              <span className="tok-punc">{">"}</span>
              {"\n  memory-research\n"}
              <span className="tok-punc">{"</GradientShimmer>"}</span>
            </code>
          </pre>
        </section>

        <div style={DIVIDER} />

        {/* Props */}
        <section data-reveal style={{ ...SECTION, gap: 14, padding: "44px 0", alignItems: "stretch" }}>
          <Label>Props</Label>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {PROPS.map(([name, type, def]) => (
              <div key={name} data-prop-row style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "9px 0", borderBottom: "0.5px solid var(--border)", fontSize: 13 }}>
                <code style={{ fontFamily: "var(--mono)", color: "var(--fg)", minWidth: 104 }}>{name}</code>
                <span style={{ color: "var(--muted)", flex: 1 }}>{type}</span>
                <code style={{ fontFamily: "var(--mono)", color: "var(--muted)" }}>{def}</code>
              </div>
            ))}
          </div>
        </section>

        <footer style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, paddingTop: 56, fontSize: 13, color: "var(--muted)" }}>
          <span>MIT License</span>
          <span aria-hidden>·</span>
          <span>
            by <a href="https://x.com/mona_biasia">@mona_biasia</a>
          </span>
        </footer>
      </div>
    </>
  )
}
