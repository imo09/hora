// genera marchio/opzioni-marchio.html con i caratteri incorporati
import fs from 'node:fs';
import path from 'node:path';
const root = path.dirname(new URL(import.meta.url).pathname);
const nm = (...a) => path.join(root, '..', 'node_modules', '@fontsource', ...a);
const f = (pkg, file, fam, w) => `@font-face{font-family:'${fam}';font-weight:${w};font-display:swap;src:url(data:font/woff2;base64,${fs.readFileSync(nm(pkg, 'files', file)).toString('base64')}) format('woff2')}`;
const fonts = [f('poppins', 'poppins-latin-600-normal.woff2', 'Poppins', 600), f('space-grotesk', 'space-grotesk-latin-400-normal.woff2', 'Space Grotesk', 400), f('space-grotesk', 'space-grotesk-latin-600-normal.woff2', 'Space Grotesk', 600), f('space-mono', 'space-mono-latin-400-normal.woff2', 'Space Mono', 400)].join('\n');
const out = path.join(root, 'opzioni-marchio.html');
fs.writeFileSync(out, fs.readFileSync(path.join(root, 'opzioni.src.html'), 'utf8').replace('{{FONTS}}', fonts));
console.log('ok', out);
