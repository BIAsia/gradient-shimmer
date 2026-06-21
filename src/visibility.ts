/** True when `background-clip: text` is usable (prefixed or not). SSR-safe. */
export function supportsBackgroundClipText(): boolean {
  if (typeof window === "undefined" || typeof window.CSS?.supports !== "function") {
    return true // assume support on the server / old engines; the visual degrades anyway
  }
  return (
    window.CSS.supports("background-clip", "text") ||
    window.CSS.supports("-webkit-background-clip", "text")
  )
}

/** True when the user asked for reduced motion. SSR-safe. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

export interface GateOptions {
  pauseOnScroll: boolean
  pauseWhenOffscreen: boolean
}

const VIEWPORT_ROOT_MARGIN = "160px"
const SCROLL_IDLE_MS = 120

/**
 * Wire viewport (IntersectionObserver), page-visibility, and scroll-idle gates
 * to `onChange(active)`. `active` = on-screen (or that gate disabled) AND the
 * page is visible AND nothing is scrolling (or that gate disabled). Returns a
 * cleanup. No-ops gracefully on the server.
 */
export function observeShimmerActive(
  el: Element,
  { pauseOnScroll, pauseWhenOffscreen }: GateOptions,
  onChange: (active: boolean) => void
): () => void {
  if (typeof window === "undefined") return () => {}

  let inViewport = !pauseWhenOffscreen || typeof IntersectionObserver === "undefined"
  let pageVisible = typeof document === "undefined" ? true : !document.hidden
  let notScrolling = true
  const compute = () => onChange(inViewport && pageVisible && notScrolling)

  let io: IntersectionObserver | undefined
  if (pauseWhenOffscreen && typeof IntersectionObserver !== "undefined") {
    io = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1]
        if (!entry) return
        inViewport = entry.isIntersecting
        compute()
      },
      { rootMargin: VIEWPORT_ROOT_MARGIN }
    )
    io.observe(el)
  }

  const onVisibility = () => {
    pageVisible = !document.hidden
    compute()
  }
  document.addEventListener("visibilitychange", onVisibility)

  let scrollTimer: ReturnType<typeof setTimeout> | undefined
  const onScroll = () => {
    notScrolling = false
    compute()
    clearTimeout(scrollTimer)
    scrollTimer = setTimeout(() => {
      notScrolling = true
      compute()
    }, SCROLL_IDLE_MS)
  }
  const scrollOpts = { passive: true, capture: true } as const
  if (pauseOnScroll) window.addEventListener("scroll", onScroll, scrollOpts)

  compute()

  return () => {
    io?.disconnect()
    document.removeEventListener("visibilitychange", onVisibility)
    if (pauseOnScroll) window.removeEventListener("scroll", onScroll, { capture: true })
    clearTimeout(scrollTimer)
  }
}
