// Build di hora: unisce le parti in src/hora.jsx, crea dist/ pronta per GitHub Pages.
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.dirname(new URL(import.meta.url).pathname);
const P = (...a) => path.join(root, ...a);
const VERSION = '1.2';

// 1. file sorgente unico
if (fs.existsSync(P('src/parts'))) {
  const parts = fs.readdirSync(P('src/parts')).filter((f) => f.endsWith('.jsx')).sort();
  fs.writeFileSync(P('src/hora.jsx'), parts.map((f) => fs.readFileSync(P('src/parts', f), 'utf8')).join('\n'));
}
fs.mkdirSync(P('build'), { recursive: true });

// 2. bundle
const res = await build({
  entryPoints: [P('src/hora.jsx')], bundle: true, minify: true, format: 'iife', target: ['es2019', 'safari14'],
  define: { 'process.env.NODE_ENV': '"production"' }, write: false, legalComments: 'none', jsx: 'transform'
});
const js = res.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');

// 3. font incorporati (nessuna richiesta esterna)
const font = (pkg, file, family, weight) => {
  const b64 = fs.readFileSync(P('node_modules/@fontsource', pkg, 'files', file)).toString('base64');
  return `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:swap;src:url(data:font/woff2;base64,${b64}) format('woff2')}`;
};
const fonts = [
  font('space-grotesk', 'space-grotesk-latin-400-normal.woff2', 'Space Grotesk', 400),
  font('space-grotesk', 'space-grotesk-latin-500-normal.woff2', 'Space Grotesk', 500),
  font('space-grotesk', 'space-grotesk-latin-600-normal.woff2', 'Space Grotesk', 600),
  font('poppins', 'poppins-latin-600-normal.woff2', 'Poppins', 600),
  font('space-mono', 'space-mono-latin-400-normal.woff2', 'Space Mono', 400)
].join('');
const css = fs.readFileSync(P('src/style.css'), 'utf8');

// 4. marchio e icone
const mark = (c = '#2F9184', moon = '#C99A4E') => `<circle cx="24" cy="24" r="19" fill="none" stroke="${c}" stroke-width="3.3" stroke-linecap="round" stroke-dasharray="99.5 200" transform="rotate(-90 24 24)"/><path d="M14 23q3.33-3.4 6.67 0t6.67 0t6.67 0" fill="none" stroke="${c}" stroke-width="3.3" stroke-linecap="round"/><path d="M17.5 30q3.25-3 6.5 0t6.5 0" fill="none" stroke="${c}" stroke-width="3.3" stroke-linecap="round" stroke-opacity="0.5"/><circle cx="7.55" cy="14.5" r="4.2" fill="${moon}"/>`;
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">${mark()}</svg>`;
const tile = (scale) => {
  const s = 512, m = s * scale, o = (s - m) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}"><rect width="${s}" height="${s}" fill="#EEF1EF"/><g transform="translate(${o} ${o}) scale(${m / 48})">${mark()}</g></svg>`;
};
const dist = P('dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
fs.writeFileSync(P('dist/favicon.svg'), favicon);
fs.writeFileSync(P('build/icon-any.svg'), tile(0.66));
fs.writeFileSync(P('build/icon-maskable.svg'), tile(0.5));
const png = (svg, out, size) => execFileSync('python3', ['-c', `import cairosvg,sys;cairosvg.svg2png(url=sys.argv[1],write_to=sys.argv[2],output_width=int(sys.argv[3]),output_height=int(sys.argv[3]))`, svg, out, String(size)]);
png(P('build/icon-any.svg'), P('dist/icon-192.png'), 192);
png(P('build/icon-any.svg'), P('dist/icon-512.png'), 512);
png(P('build/icon-maskable.svg'), P('dist/icon-maskable-512.png'), 512);
png(P('build/icon-any.svg'), P('dist/apple-touch-icon.png'), 180);

// 5. index.html
const html = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<title>hora</title>
<meta name="description" content="hora: calendario calmo e locale di nautargo. Eventi, promemoria, sveglie, categorie e attività, a mano, a voce o da Claude.">
<meta name="theme-color" content="#F3F4F1">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="hora">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,${encodeURIComponent(favicon)}">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<style>${fonts}${css}</style>
</head>
<body>
<div id="root"></div>
<script>${js}</script>
</body>
</html>
`;
fs.writeFileSync(P('dist/index.html'), html);

// 6. manifest e service worker
fs.writeFileSync(P('dist/manifest.webmanifest'), JSON.stringify({
  name: 'hora', short_name: 'hora', description: 'Calendario calmo e locale di nautargo', lang: 'it',
  start_url: './', scope: './', display: 'standalone', orientation: 'portrait',
  background_color: '#EEF1EF', theme_color: '#F3F4F1',
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
}, null, 2));
fs.writeFileSync(P('dist/sw.js'), `// hora ${VERSION}: funziona anche senza rete
const CACHE = 'hora-${VERSION}';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png', 'favicon.svg'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then((res) => { const cp = res.clone(); caches.open(CACHE).then((c) => c.put('index.html', cp)); return res; }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(r).then((hit) => hit || fetch(r).then((res) => { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(r, cp)); return res; })));
});
self.addEventListener('notificationclick', (e) => { e.notification.close(); e.waitUntil(self.clients.matchAll({ type: 'window' }).then((cs) => (cs[0] ? cs[0].focus() : self.clients.openWindow('./')))); });
`);
fs.writeFileSync(P('dist/CNAME'), 'hora.nautargo.com\n');
console.log('ok', (fs.statSync(P('dist/index.html')).size / 1024).toFixed(0) + ' KB');
