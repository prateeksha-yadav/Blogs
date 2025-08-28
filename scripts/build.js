#!/usr/bin/env node
const { execSync } = require('child_process')

function run(cmd) {
  console.log('> ' + cmd)
  execSync(cmd, { stdio: 'inherit' })
}

const clientId = process.env.NEXT_PUBLIC_TINA_CLIENT_ID
const token = process.env.TINA_TOKEN

try {
  if (clientId && token) {
    console.log('Tina env detected — running tinacms build')
    run('npx tinacms build')
  } else {
    console.log('Tina env not detected — skipping tinacms build')
  }
  // Always run next build after conditional Tina build
  run('npx next build')
} catch (err) {
  console.error(err)
  process.exit(1)
}
