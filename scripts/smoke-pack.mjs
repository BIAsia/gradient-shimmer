import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { join } from "node:path"
import { tmpdir } from "node:os"

const root = fileURLToPath(new URL("..", import.meta.url))
const workdir = join(tmpdir(), `gradient-shimmer-smoke-${Date.now()}`)
const packDir = join(workdir, "pack")
const consumerDir = join(workdir, "consumer")

function run(command, args, cwd) {
  execFileSync(command, args, {
    cwd,
    stdio: "inherit",
    env: { ...process.env, npm_config_fund: "false", npm_config_audit: "false" },
  })
}

function capture(command, args, cwd) {
  return execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, npm_config_fund: "false", npm_config_audit: "false" },
  })
}

mkdirSync(packDir, { recursive: true })
mkdirSync(consumerDir, { recursive: true })

try {
  run("npm", ["run", "build"], root)
  const packJson = capture(
    "npm",
    ["pack", "--json", "--ignore-scripts", "--pack-destination", packDir],
    root
  )
  const [{ filename }] = JSON.parse(packJson)
  const tarball = join(packDir, filename)
  if (!existsSync(tarball)) throw new Error(`Packed tarball was not created: ${tarball}`)

  writeFileSync(
    join(consumerDir, "package.json"),
    JSON.stringify(
      {
        private: true,
        type: "module",
        dependencies: {
          "@types/react": "18.3.18",
          "gradient-shimmer": `file:${tarball}`,
          react: "18.3.1",
          "react-dom": "18.3.1",
          typescript: "^5.5.0",
        },
      },
      null,
      2
    )
  )

  run("npm", ["install", "--ignore-scripts"], consumerDir)

  writeFileSync(
    join(consumerDir, "esm.mjs"),
    `import { GradientShimmer, buildBandGradient, gradientPresets } from "gradient-shimmer"

if (typeof GradientShimmer !== "function") throw new Error("GradientShimmer ESM export missing")
if (Object.keys(gradientPresets).length < 1) throw new Error("gradientPresets ESM export missing")
const css = buildBandGradient([{ color: "#fff", position: 0 }, { color: "#000", position: 1 }], 105)
if (!css.includes("--gs-spread")) throw new Error("gradient CSS vars missing")
if (!css.includes("color-mix")) throw new Error("color-mix blend missing")
`
  )

  writeFileSync(
    join(consumerDir, "cjs.cjs"),
    `const pkg = require("gradient-shimmer")

if (typeof pkg.GradientShimmer !== "function") throw new Error("GradientShimmer CJS export missing")
if (typeof pkg.buildBandGradient !== "function") throw new Error("buildBandGradient CJS export missing")
`
  )

  writeFileSync(
    join(consumerDir, "typecheck.tsx"),
    `import { GradientShimmer, type GradientShimmerProps } from "gradient-shimmer"

const props: GradientShimmerProps = {
  children: "memory-research",
  gradient: "sunrise",
  duration: 1.2,
  baseColor: "currentColor",
  id: "status-text",
  "aria-label": "Running memory research",
}

export const node = <GradientShimmer {...props} data-state="running" />
`
  )

  writeFileSync(
    join(consumerDir, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2020",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          jsx: "react-jsx",
          strict: true,
          skipLibCheck: true,
        },
        include: ["typecheck.tsx"],
      },
      null,
      2
    )
  )

  run("node", ["esm.mjs"], consumerDir)
  run("node", ["cjs.cjs"], consumerDir)
  run("npx", ["tsc", "--noEmit"], consumerDir)
  console.log(`smoke ok: ${filename}`)
} finally {
  if (!process.env.KEEP_GRADIENT_SHIMMER_SMOKE) {
    rmSync(workdir, { recursive: true, force: true })
  } else {
    console.log(`kept smoke workspace: ${workdir}`)
  }
}
