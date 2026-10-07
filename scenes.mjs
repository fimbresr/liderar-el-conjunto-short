// Orquesta de escenas, transiciones, shake de impactos y subtítulos. drawFrame(c,t) es función pura del tiempo.
import { W, H, C, T, tw, clamp, eo5 } from './lib.mjs';
import { SCENES_A } from './scenesA.mjs';
import { SCENES_B } from './scenesB.mjs';
import { WORDS } from './words.mjs';

export const TOTAL = 103.2;
export const FPS = 30;
export const SCENES = [...SCENES_A, ...SCENES_B].map((s, i, a) => ({ ...s, t1: a[i + 1]?.t0 ?? TOTAL }));
export const CUES = SCENES.flatMap(s => s.cues.map(([t, type, g = 1]) => ({ t, type, g }))).sort((a, b) => a.t - b.t);

const TR = 0.3;
const SHAKE = new Set(['hit', 'boom', 'thud', 'crack', 'trap', 'stamp', 'splash', 'bounce']);
const shakeAt = (t) => {
  let x = 0, y = 0;
  for (const k of CUES) {
    if (k.t > t) break;
    if (!SHAKE.has(k.type) || t - k.t > 0.5) continue;
    const d = t - k.t, a = 13 * k.g * Math.exp(-d * 11);
    x += Math.sin(d * 83 + k.t * 7) * a; y += Math.cos(d * 71 + k.t * 3) * a;
  }
  return [x, y];
};
const sceneIdx = (t) => { let i = 0; while (i < SCENES.length - 1 && t >= SCENES[i + 1].t0) i++; return i; };
const drawScene = (c, s, t) => { c.save(); const [x, y] = shakeAt(t); c.translate(x, y); s.draw(c, t); c.restore(); };

// ── subtítulos ──
const chunks = (() => {
  const out = []; let cur = [];
  const flush = () => { if (cur.length) { out.push(cur); cur = []; } };
  WORDS.forEach(w => {
    cur.push(w);
    const len = cur.map(x => x.t).join(' ').length;
    if (/[.?!,]$/.test(w.t) || cur.length >= 3 || len > 20) flush();
  });
  flush();
  return out.map((ws, i, a) => {
    const s = ws[0].s - 0.04, last = ws[ws.length - 1], nx = a[i + 1]?.[0].s;
    return { ws, s, e: nx !== undefined && nx - last.e < 0.45 ? nx - 0.04 : last.e + 0.25 };
  });
})();
function captions(c, t, scene) {
  if (scene.cap === 'none') return;
  const ch = chunks.find(k => t >= k.s && t < k.e); if (!ch) return;
  const fg = scene.bg === 'bone' ? C.ink : C.bone;
  const txt = ch.ws.map(w => w.t.replace(/[.,]$/, '').toUpperCase());
  let sz = 76; const full = () => tw(c, txt.join(' '), sz, 'u', 1);
  while (full() > 960 && sz > 40) sz -= 2;
  const sp = tw(c, ' ', sz, 'u', 1);
  const p = clamp((t - ch.s) / 0.12), sc = 0.9 + 0.1 * eo5(p);
  c.save(); c.translate(540, 1495); c.scale(sc, sc);
  let x = -full() / 2;
  txt.forEach((w, i) => {
    const w0 = ch.ws[i], on = t >= w0.s - 0.02 && (i === txt.length - 1 || t < ch.ws[i + 1].s - 0.02);
    T(c, w, x, 0, { sz, f: 'u', col: on ? C.acc : fg, tr: 1 });
    x += tw(c, w, sz, 'u', 1) + sp;
  });
  c.restore();
}

export function drawFrame(c, t) {
  const i = sceneIdx(t), s = SCENES[i], lt = t - s.t0;
  if (i > 0 && lt < TR && s.tr !== 'cut' && s.tr !== 'none') {
    const prev = SCENES[i - 1], p = lt / TR, e = eo5(p);
    if (s.tr === 'push') {
      c.save(); c.translate(0, -H * e); drawScene(c, prev, t); c.restore();
      c.save(); c.translate(0, H * (1 - e)); drawScene(c, s, t); c.restore();
    } else {
      drawScene(c, prev, t);
      c.save(); c.beginPath();
      if (s.tr === 'slab') { const x0 = W * (1 - e); c.rect(x0, 0, W - x0 + 1, H); }
      else c.arc(540, 800, e * 1500, 0, Math.PI * 2);
      c.clip(); drawScene(c, s, t); c.restore();
      c.save(); c.fillStyle = C.acc;
      if (s.tr === 'slab') c.fillRect(W * (1 - e) - 46 * (1 - p), 0, 46 * (1 - p), H);
      else { c.strokeStyle = C.acc; c.lineWidth = 22 * (1 - p); c.beginPath(); c.arc(540, 800, e * 1500, 0, Math.PI * 2); c.stroke(); }
      c.restore();
    }
  } else drawScene(c, s, t);
  captions(c, t, s);
}
