// medusa build compiles the app into .medusa/server, but does not carry
// over the project's static/ folder (product images checked into git).
// The local file provider serves uploads relative to process.cwd(), which
// at runtime is .medusa/server, so without this copy the images 404 in
// production even though the files exist in the repo.
const fs = require("fs")
const path = require("path")

const src = path.join(__dirname, "..", "static")
const dest = path.join(__dirname, "..", ".medusa", "server", "static")

if (!fs.existsSync(src)) {
  process.exit(0)
}

fs.mkdirSync(dest, { recursive: true })

for (const file of fs.readdirSync(src)) {
  fs.copyFileSync(path.join(src, file), path.join(dest, file))
}

console.log(`Copied static assets to ${dest}`)
