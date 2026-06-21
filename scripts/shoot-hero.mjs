import { chromium } from "playwright-core"
import os from "node:os"
import path from "node:path"

const EXECUTABLE = path.join(
  os.homedir(),
  "Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64",
  "Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
)

const out = process.argv[2] ?? "assets/hero.png"
const delay = Number(process.argv[3] ?? 1300)

const browser = await chromium.launch({ executablePath: EXECUTABLE })
const page = await browser.newPage({
  viewport: { width: 1000, height: 480 },
  deviceScaleFactor: 2,
  colorScheme: "light",
})
await page.goto("http://localhost:3020/", { waitUntil: "networkidle" })
await page.waitForTimeout(delay) // let the entrance finish + catch a shimmer frame
await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1000, height: 470 } })
await browser.close()
console.log("saved", out)
