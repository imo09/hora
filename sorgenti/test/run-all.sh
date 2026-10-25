#!/bin/sh
# esegue build e tutti i test di hora (fuso di Roma, come sul telefono)
set -e
cd "$(dirname "$0")/.."
export TZ=Europe/Rome
node build.mjs
npx esbuild test/logic-entry.jsx --bundle --platform=node --format=esm --outfile=build/logic.test.mjs --log-level=warning --define:process.env.NODE_ENV='"production"'
node build/logic.test.mjs
node test/render.test.mjs
node test/touch.test.mjs
node test/days5.test.mjs
node test/v14.test.mjs
node test/v15.test.mjs
