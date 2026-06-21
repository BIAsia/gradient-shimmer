import { type CSSProperties, type ReactNode, useState } from "react"
import { GradientShimmer, gradientPresets, type GradientPresetName, type GradientStop } from "gradient-shimmer"

type Easing = "smooth" | "gentle" | "snappy"

const PRESET_NAMES = Object.keys(gradientPresets) as GradientPresetName[]
const RUNNING_TITLE = "memory-research"
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
  const copy = () => {
    navigator.clipboard?.writeText(INSTALL)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }
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
      <span style={{ fontFamily: "var(--mono)", fontSize: 14 }}>
        <span style={{ color: "var(--muted)" }}>$ </span>
        {command}
      </span>
      <span style={{ color: copied ? "var(--fg)" : "var(--muted)", fontSize: 13, display: "inline-flex", width: 16, justifyContent: "center" }}>
        {copied ? "✓" : <CopyIcon />}
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
    <button
      type="button"
      aria-label={name}
      aria-pressed={selected}
      onClick={onSelect}
      style={{
        width: 40,
        height: 40,
        flex: "0 0 auto",
        borderRadius: 999,
        border: "none",
        padding: 2,
        cursor: "pointer",
        background: "transparent",
        boxShadow: selected ? "0 0 0 2px var(--ring), 0 0 0 5px var(--bg)" : "0 0 0 1px var(--border)",
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
          border: "1px solid rgba(255,255,255,0.7)",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
        }}
      />
    </button>
  )
}

function Segment({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 500,
        cursor: "pointer",
        color: active ? "var(--fg)" : "var(--muted)",
        background: active ? "var(--surface)" : "transparent",
        border: active ? "0.5px solid var(--border)" : "0.5px solid transparent",
        boxShadow: active ? "var(--panel-shadow)" : "none",
      }}
    >
      {children}
    </button>
  )
}

function SliderRow({ label, value, min, max, step, onChange, format }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format: (v: number) => string }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 7, width: "100%" }}>
      <span style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
        <span style={{ fontWeight: 500 }}>{label}</span>
        <span style={{ color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{format(value)}</span>
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
  ["baseColor", "string", '"currentColor"'],
]

const USAGE = `import { GradientShimmer } from "gradient-shimmer"

<GradientShimmer gradient="sunrise">
  memory-research
</GradientShimmer>`

const SECTION: CSSProperties = { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: "100%" }
const DIVIDER: CSSProperties = { width: "100%", height: 0, borderTop: "0.5px solid var(--border)" }

export function App() {
  const [presetId, setPresetId] = useState<GradientPresetName>("sunrise")
  const [easing, setEasing] = useState<Easing>("smooth")
  const [duration, setDuration] = useState(1.45)
  const [spread, setSpread] = useState(3)
  const [angle, setAngle] = useState(105)
  const [pauseBetween, setPauseBetween] = useState(700)
  const [title, setTitle] = useState(RUNNING_TITLE)
  const [lightBase, setLightBase] = useState(false)

  const channelText = title.trim() === "" ? RUNNING_TITLE : title
  const baseColor = lightBase ? "var(--muted)" : "currentColor"
  const shimmerProps = { gradient: presetId, easing, duration, spread, angle, pauseBetween, baseColor } as const

  const runningShimmer = (
    <GradientShimmer {...shimmerProps} style={{ maxWidth: "100%" }}>
      {channelText}
    </GradientShimmer>
  )

  return (
    <div style={{ width: "100%", maxWidth: COLUMN + 48, margin: "0 auto", padding: "0 24px 100px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Top links */}
      <nav style={{ width: "100%", display: "flex", justifyContent: "flex-end", gap: 8, padding: "22px 0 0" }}>
        <a className="pill-link" href="https://github.com/BIAsia/gradient-shimmer">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.32c-2.23.49-2.7-1.07-2.7-1.07-.36-.93-.89-1.18-.89-1.18-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.71 1.23 1.87.87 2.33.67.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.83-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.52.56.83 1.28.83 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
          </svg>
          GitHub
        </a>
        <a className="pill-link" href="https://npmjs.com/package/gradient-shimmer">
          npm
        </a>
        <a className="pill-link" href="https://x.com/mona_biasia" aria-label="X">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M12.6 0h2.45l-5.36 6.12L16 16h-4.94l-3.87-5.06L2.77 16H.32l5.73-6.55L0 0h5.06l3.5 4.63L12.6 0Zm-.86 14.55h1.36L4.32 1.38H2.86l8.88 13.17Z" />
          </svg>
        </a>
      </nav>

      {/* Hero */}
      <section style={{ ...SECTION, gap: 40, padding: "76px 0 56px" }}>
        <div style={{ fontSize: 38, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.25 }}>
          <GradientShimmer {...shimmerProps} style={{ whiteSpace: "nowrap" }}>
            {channelText}
          </GradientShimmer>
        </div>
        <div style={{ width: "100%", maxWidth: 320 }}>
          <InstallCard
            command={
              <GradientShimmer {...shimmerProps} style={{ fontFamily: "var(--mono)", fontWeight: 400 }}>
                {INSTALL}
              </GradientShimmer>
            }
          />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
          {PRESET_NAMES.map((name) => (
            <GradientSwatch key={name} name={name} selected={name === presetId} onSelect={() => setPresetId(name)} />
          ))}
        </div>
      </section>

      <div style={DIVIDER} />

      {/* Controls */}
      <section style={{ ...SECTION, gap: 22, padding: "44px 0" }}>
        <div style={{ ...SECTION, gap: 8 }}>
          <Label>Text</Label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={RUNNING_TITLE}
            spellCheck={false}
            style={{ width: "100%", maxWidth: 280, padding: "8px 12px", borderRadius: 10, border: "0.5px solid var(--border)", background: "var(--surface)", font: "inherit", fontSize: 14, textAlign: "center", outline: "none" }}
          />
        </div>
        <div style={{ ...SECTION, gap: 10 }}>
          <Label>Easing</Label>
          <div style={{ display: "flex", gap: 8 }}>
            {(["smooth", "gentle", "snappy"] as Easing[]).map((e) => (
              <Segment key={e} active={easing === e} onClick={() => setEasing(e)}>
                {e[0].toUpperCase() + e.slice(1)}
              </Segment>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 340 }}>
          <SliderRow label="Speed" value={duration} min={0.6} max={8} step={0.05} onChange={setDuration} format={(v) => `${v.toFixed(2)}s`} />
          <SliderRow label="Spread" value={spread} min={1} max={8} step={0.5} onChange={setSpread} format={(v) => `${v}px/char`} />
          <SliderRow label="Angle" value={angle} min={0} max={180} step={1} onChange={setAngle} format={(v) => `${Math.round(v)}°`} />
          <SliderRow label="Pause" value={pauseBetween} min={0} max={3000} step={50} onChange={setPauseBetween} format={(v) => `${Math.round(v)}ms`} />
          <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14 }}>
            <span style={{ fontWeight: 500 }}>Lighter base text</span>
            <input type="checkbox" checked={lightBase} onChange={(e) => setLightBase(e.target.checked)} style={{ width: 16, height: 16 }} />
          </label>
        </div>
      </section>

      <div style={DIVIDER} />

      {/* In context */}
      <section style={{ ...SECTION, gap: 14, padding: "44px 0" }}>
        <Label>In the channel sidebar</Label>
        <div style={{ width: "100%", maxWidth: 300, background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 20, boxShadow: "var(--panel-shadow)", padding: 8 }}>
          <p style={{ margin: 0, padding: "4px 8px 6px", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--muted)" }}>Channels</p>
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
      <section style={{ ...SECTION, gap: 14, padding: "44px 0", alignItems: "stretch" }}>
        <Label>Usage</Label>
        <pre style={{ margin: 0, padding: "16px 18px", borderRadius: 14, background: "var(--bg-weak)", fontFamily: "var(--mono)", fontSize: 13, lineHeight: 1.6, color: "var(--fg)", overflowX: "auto", textAlign: "left" }}>
          {USAGE}
        </pre>
      </section>

      <div style={DIVIDER} />

      {/* Props */}
      <section style={{ ...SECTION, gap: 14, padding: "44px 0", alignItems: "stretch" }}>
        <Label>Props</Label>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {PROPS.map(([name, type, def]) => (
            <div key={name} style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "9px 0", borderBottom: "0.5px solid var(--border)", fontSize: 13 }}>
              <code style={{ fontFamily: "var(--mono)", color: "var(--fg)", minWidth: 104 }}>{name}</code>
              <span style={{ color: "var(--muted)", flex: 1 }}>{type}</span>
              <code style={{ fontFamily: "var(--mono)", color: "var(--muted)" }}>{def}</code>
            </div>
          ))}
        </div>
      </section>

          <footer style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, paddingTop: 40, fontSize: 13, color: "var(--muted)" }}>
            <span>MIT License</span>
            <span aria-hidden>·</span>
            <span>by ziye</span>
      </footer>
    </div>
  )
}
