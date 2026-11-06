/**
 * Fails if the production bundle contains anything that looks like a backend secret.
 * Usage: npm run build && node e2e/scan-bundle.mjs
 */
import fs from 'fs'
import path from 'path'

const DIST = path.resolve('dist')
const PATTERNS = [/gsk_[A-Za-z0-9]{10,}/, /GROQ_API_KEY/i, /sk-[A-Za-z0-9]{20,}/, /ADMIN_TOKEN/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/]

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) yield* walk(p)
    else if (/\.(js|css|html|map|json|txt)$/.test(e.name)) yield p
  }
}

if (!fs.existsSync(DIST)) {
  console.error('dist/ not found - run `npm run build` first')
  process.exit(2)
}
let bad = 0
let files = 0
for (const f of walk(DIST)) {
  files++
  const text = fs.readFileSync(f, 'utf8')
  for (const re of PATTERNS) {
    if (re.test(text)) {
      console.error(`FOUND ${re} in ${path.relative(DIST, f)}`)
      bad++
    }
  }
}
console.log(`${files} files scanned, ${bad} problems`)
process.exit(bad ? 1 : 0)
