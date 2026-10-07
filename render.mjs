// node render.mjs            -> video mudo out/video.mp4 (H.264 yuv420p CRF16)
// node render.mjs sheet      -> hojas de contacto, un cuadro por pulso (out/sheet_N.jpg)
// node render.mjs at 1.2 7.5 -> PNG sueltos en out/at_<t>.png
import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn, execFileSync } from 'child_process';
import { chromium } from 'playwright-core';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(ROOT, 'out'); fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html', '.mjs': 'text/javascript', '.js': 'text/javascript', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  let f;
  try { f = path.resolve(ROOT, '.' + decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html')); } catch { res.writeHead(400); return res.end(); }
  if (!f.startsWith(ROOT + path.sep) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] ?? 'application/octet-stream' }); res.end(fs.readFileSync(f));
}).listen(0, '127.0.0.1');
await new Promise(r => server.once('listening', r));
const port = server.address().port;

const chromeDir = process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1243/';
const exe = fs.readdirSync(chromeDir).map(d => chromeDir + d + '/chrome-headless-shell').find(p => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe });

async function page() {
  const p = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => { console.error('PAGEERROR', e.message); process.exit(1); });
  p.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  await p.goto(`http://127.0.0.1:${port}/index.html`);
  await p.waitForFunction(() => window.ready === true);
  return p;
}
const shot = (p, t, type = 'jpeg') => p.evaluate(tt => window.seek(tt), t).then(() => p.screenshot({ type, ...(type === 'jpeg' ? { quality: 94 } : {}) }));

const ffs = new Set();
const mode = process.argv[2] ?? 'full';
try {
const p0 = await page();
const TOTAL = await p0.evaluate(() => window.TOTAL), FPS = await p0.evaluate(() => window.FPS);

if (mode === 'at') {
  for (const t of process.argv.slice(3).map(Number)) fs.writeFileSync(`${OUT}/at_${t}.png`, await shot(p0, t, 'png'));
} else if (mode === 'sheet') {
  const dir = `${OUT}/beats`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const beat = 0.6; let n = 0;
  for (let t = 0.25; t < TOTAL - 0.1; t += beat, n++) fs.writeFileSync(`${dir}/f${String(n).padStart(3, '0')}.jpg`, await shot(p0, t));
  for (let s = 0; s * 24 < n; s++) {
    const files = Array.from({ length: Math.min(24, n - s * 24) }, (_, i) => `file '${dir}/f${String(s * 24 + i).padStart(3, '0')}.jpg'\nduration 1`);
    fs.writeFileSync(`${dir}/l${s}.txt`, files.join('\n'));
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', `${dir}/l${s}.txt`, '-vf', 'fps=1,scale=270:480,tile=8x3:padding=6:color=0x222222',
      '-frames:v', '1', '-update', '1', `${OUT}/sheet_${s}.jpg`]);
  }
  console.log('beats:', n, 'sheets:', Math.ceil(n / 24));
} else {
  const N = Math.round(TOTAL * FPS), W = 4, per = Math.ceil(N / W);
  await p0.close();
  const segs = await Promise.all(Array.from({ length: W }, async (_, k) => {
    const p = await page(), a = k * per, b = Math.min(N, a + per), f = `${OUT}/seg${k}.mp4`;
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-vf', 'scale=in_range=pc:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-r', String(FPS), '-g', '30', '-bf', '2', f], { stdio: ['pipe', 'inherit', 'inherit'] });
    ffs.add(ff);
    for (let i = a; i < b; i++) {
      const buf = await shot(p, i / FPS);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (k === 0 && i % 150 === 0) console.log(`frame ${i}/${per}`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
    return f;
  }));
  fs.writeFileSync(`${OUT}/list.txt`, segs.map(s => `file '${s}'`).join('\n'));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', `${OUT}/list.txt`, '-c', 'copy', `${OUT}/video.mp4`]);
  console.log('ok', N, 'frames');
}
} finally {
  for (const ff of ffs) ff.kill();
  await browser.close(); server.close();
}
