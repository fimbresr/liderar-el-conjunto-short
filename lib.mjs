// Helpers de dibujo puros: todo es función del tiempo, sin estado entre frames.
export const W = 1080, H = 1920;
export const GRID = 0.15; // semicorchea a 100 BPM
export const q = t => Math.round(t / GRID) * GRID;
export const C = {
  ink: '#0E0F12', ink2: '#1B1C20', bone: '#F1ECE0', bone2: '#DDD6C4',
  acc: '#FF4B1F', g2: '#4A4B50', g3: '#8E8D88', void: '#060607',
};
export const DISP = '"DIN Condensed", Impact, sans-serif';
export const UI = '"Avenir Next", "Helvetica Neue", sans-serif';

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const prog = (t, a, b) => clamp((t - a) / (b - a));
export const lerp = (a, b, k) => a + (b - a) * k;
export const eo3 = x => 1 - Math.pow(1 - x, 3);
export const eo5 = x => 1 - Math.pow(1 - x, 5);
export const ei3 = x => x * x * x;
export const eio = x => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const eback = x => { const c1 = 2.2, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export const ebounce = x => {
  const n = 7.5625, d = 2.75;
  if (x < 1 / d) return n * x * x;
  if (x < 2 / d) return n * (x -= 1.5 / d) * x + .75;
  if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + .9375;
  return n * (x -= 2.625 / d) * x + .984375;
};
export function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
export const rng = seed => mulberry32(seed);

// texto: o = {sz, f:'d'|'u', col, al:'l'|'c'|'r', bl, tr, rot, sx, sy, w}
export function T(c, s, x, y, o = {}) {
  c.save();
  c.translate(x, y);
  if (o.rot) c.rotate(o.rot);
  c.scale(o.sx ?? o.s ?? 1, o.sy ?? o.s ?? 1);
  const f = o.f === 'u' ? UI : DISP;
  c.font = `${o.w ?? (o.f === 'u' ? 800 : 700)} ${o.sz ?? 100}px ${f}`;
  c.letterSpacing = (o.tr ?? 0) + 'px';
  c.textAlign = { l: 'left', c: 'center', r: 'right' }[o.al ?? 'l'];
  c.textBaseline = o.bl ?? 'alphabetic';
  if (o.a != null) c.globalAlpha = o.a;
  if (o.stroke) { c.lineWidth = o.lw ?? 3; c.strokeStyle = o.stroke; c.lineJoin = 'round'; c.strokeText(s, 0, 0); }
  if (o.col !== 'none') { c.fillStyle = o.col ?? C.bone; c.fillText(s, 0, 0); }
  c.restore();
}
export function tw(c, s, sz, f = 'd', tr = 0, w) {
  c.save();
  c.font = `${w ?? (f === 'u' ? 800 : 700)} ${sz}px ${f === 'u' ? UI : DISP}`;
  c.letterSpacing = tr + 'px';
  const m = c.measureText(s).width;
  c.restore();
  return m;
}
// letras que caen/entran una a una; devuelve nada. dir: y offset inicial
export function chars(c, s, x, y, t, t0, o = {}) {
  const st = o.st ?? 0.04, dur = o.dur ?? 0.28, dy = o.dy ?? -160;
  const sz = o.sz ?? 100, tr = o.tr ?? 0;
  let cx = x;
  if (o.al === 'c') cx = x - tw(c, s, sz, o.f, tr) / 2;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const p = prog(t, t0 + i * st, t0 + i * st + dur);
    const w = tw(c, ch, sz, o.f, tr);
    if (p > 0) T(c, ch, cx, y + (1 - eo3(p)) * dy, { ...o, al: 'l', tr, a: o.fade ? p : 1 });
    cx += w + tr;
  }
}
// sello: entra grande y se asienta. devuelve escala
export const slam = (t, t0, d = 0.22, from = 1.5) => t < t0 ? 0 : 1 + (from - 1) * (1 - eo5(clamp((t - t0) / d)));
export const pop = (t, t0, d = 0.35) => t < t0 ? 0 : eback(clamp((t - t0) / d));

export function bg(c, col) { c.fillStyle = col; c.fillRect(-60, -60, W + 120, H + 120); }
export function rrect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
export function line(c, x1, y1, x2, y2, col, w, p = 1) {
  c.save(); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(lerp(x1, x2, p), lerp(y1, y2, p)); c.stroke(); c.restore();
}
export function strike(c, x1, y, x2, p, col = C.acc, w = 16, rot = -0.03) {
  c.save(); c.translate((x1 + x2) / 2, y); c.rotate(rot);
  const hw = (x2 - x1) / 2;
  line(c, -hw, 0, hw, 0, col, w, p); c.restore();
}
export function circle(c, x, y, r, fill, stroke, lw = 6) {
  c.beginPath(); c.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); }
}
export function star(c, x, y, r, col, rot = 0, pts = 5, inner = 0.45) {
  c.save(); c.translate(x, y); c.rotate(rot); c.beginPath();
  for (let i = 0; i < pts * 2; i++) {
    const a = (i * Math.PI) / pts - Math.PI / 2, rr = i % 2 ? r * inner : r;
    c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  c.closePath(); c.fillStyle = col; c.fill(); c.restore();
}
export function spikes(c, x, y, r0, r1, n, col, w, rot = 0, p = 1) {
  c.save(); c.translate(x, y); c.rotate(rot); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    c.beginPath(); c.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
    c.lineTo(Math.cos(a) * lerp(r0, r1, p), Math.sin(a) * lerp(r0, r1, p)); c.stroke();
  }
  c.restore();
}
export function check(c, x, y, s, col, w, p = 1) {
  const pts = [[-.5, 0], [-.15, .4], [.55, -.45]];
  c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = col; c.lineWidth = w / s; c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(...pts[0]);
  const a = clamp(p * 2), b = clamp(p * 2 - 1);
  c.lineTo(lerp(pts[0][0], pts[1][0], a), lerp(pts[0][1], pts[1][1], a));
  if (b > 0) c.lineTo(lerp(pts[1][0], pts[2][0], b), lerp(pts[1][1], pts[2][1], b));
  c.stroke(); c.restore();
}
export function cross(c, x, y, s, col, w, p = 1, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round';
  const a = clamp(p * 2), b = clamp(p * 2 - 1);
  c.beginPath(); c.moveTo(-s, -s); c.lineTo(lerp(-s, s, a), lerp(-s, s, a)); c.stroke();
  if (b > 0) { c.beginPath(); c.moveTo(s, -s); c.lineTo(lerp(s, -s, b), lerp(-s, s, b)); c.stroke(); }
  c.restore();
}
export function dotGrid(c, col, gap = 60, a = 0.5) {
  c.save(); c.fillStyle = col; c.globalAlpha = a;
  for (let y = gap / 2; y < H; y += gap) for (let x = gap / 2; x < W; x += gap) c.fillRect(x - 1.5, y - 1.5, 3, 3);
  c.restore();
}
// pieza de rompecabezas. e = {t,r,b,l} en {-1,0,1} (1 = lengüeta hacia fuera)
export function jigsaw(c, x, y, s, e, fill, stroke, lw = 0) {
  const k = s * 0.17;
  const edge = (x0, y0, x1, y1, d) => {
    const ux = x1 - x0, uy = y1 - y0, L = Math.hypot(ux, uy);
    const nx = uy / L, ny = -ux / L; // normal hacia fuera (trazo horario, y abajo)
    const mx = x0 + ux / 2, my = y0 + uy / 2, uxn = ux / L, uyn = uy / L;
    if (!d) { c.lineTo(x1, y1); return; }
    const a = k * 0.75;
    const p1 = [mx - uxn * a, my - uyn * a], p2 = [mx + uxn * a, my + uyn * a];
    c.lineTo(p1[0], p1[1]);
    const cx = mx + nx * d * k * 0.8, cy = my + ny * d * k * 0.8;
    const a0 = Math.atan2(p1[1] - cy, p1[0] - cx);
    const aN = Math.atan2(ny * d, nx * d);
    let dl = aN - a0; while (dl > Math.PI) dl -= 2 * Math.PI; while (dl < -Math.PI) dl += 2 * Math.PI;
    const sw = dl * 2;
    for (let i = 1; i <= 16; i++) { const an = a0 + sw * i / 16; c.lineTo(cx + Math.cos(an) * k, cy + Math.sin(an) * k); }
    c.lineTo(x1, y1);
  };
  c.beginPath(); c.moveTo(x, y);
  edge(x, y, x + s, y, e.t); edge(x + s, y, x + s, y + s, e.r);
  edge(x + s, y + s, x, y + s, e.b); edge(x, y + s, x, y, e.l);
  c.closePath();
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke(); }
}

// texto alineado a la izquierda en x pero escalado desde su centro (para sellos/slams)
export function TL(c, s, x, y, o = {}) {
  const w = tw(c, s, o.sz ?? 100, o.f, o.tr ?? 0, o.w);
  T(c, s, x + w / 2, y, { ...o, al: 'c' });
  return w;
}
