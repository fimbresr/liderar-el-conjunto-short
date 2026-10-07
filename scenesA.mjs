// Escenas 0–17 (0 s → 54 s). Cada escena: t0, bg, tr (transición de entrada), cues (SFX) y draw(c,t).
import {
  W, H, q, C, T, TL, tw, chars, slam, pop, bg, rrect, line, strike, circle, star, spikes, dotGrid,
  jigsaw, prog, lerp, eo3, eo5, ei3, eio, eback, ebounce, rng,
} from './lib.mjs';

const hash = (n) => rng(n * 7919 + 13)();

// ───────── 0 · HOOK ─────────
const hook = (() => {
  const K = { a: 0, b: 0.3, neq: 1.05, jefe: 1.5 };
  return {
    id: 'hook', t0: 0, bg: 'ink', tr: 'cut',
    cues: [[K.a, 'hit', 1], [K.neq, 'hit', 1], [K.jefe, 'boom', 1]],
    draw(c, t) {
      bg(c, C.ink); dotGrid(c, C.g2, 60, 0.35);
      TL(c, 'EL MEJOR', 70, 470, { sz: 200, col: C.bone, s: slam(t, K.a, 0.28, 1.7) });
      const sx = (1 - eo5(prog(t, K.b, K.b + 0.4))) * -1100;
      TL(c, 'ESPECIALISTA', 70 + sx, 700, { sz: 232, col: C.bone });
      // ≠ dibujado a mano
      const s = slam(t, K.neq, 0.25, 2.4);
      if (s > 0) {
        c.save(); c.translate(540, 850); c.scale(s, s);
        line(c, -150, -40, 150, -40, C.acc, 34); line(c, -150, 40, 150, 40, C.acc, 34);
        line(c, -90, 100, 90, -100, C.acc, 34); c.restore();
      }
      const js = slam(t, K.jefe, 0.3, 2.0);
      if (js > 0) {
        const j = t > K.jefe + 0.3 ? Math.sin(t * 60) * 4 * Math.exp(-(t - K.jefe - 0.3) * 2) : 0;
        TL(c, 'JEFE', 540 - tw(c, 'JEFE', 440) / 2 + j, 1370, { sz: 440, col: C.acc, s: js });
      }
    },
  };
})();

// ───────── 1 · TÍTULO ─────────
const title = (() => {
  const t0 = q(2.55);
  return {
    id: 'title', t0, bg: 'bone', tr: 'slab',
    cues: [[t0, 'hit', 1], [q(3.15), 'hit', 0.8], [q(3.9), 'swoosh', 0.8], [q(4.5), 'tick', 1]],
    draw(c, t) {
      bg(c, C.bone);
      chars(c, 'LIDERAR', 70, 640, t, t0, { sz: 330, col: C.ink, st: 0.05, dy: -420 });
      chars(c, 'EL CONJUNTO', 70, 900, t, q(3.15), { sz: 215, col: C.ink, st: 0.04, dy: -420 });
      line(c, 70, 700, 70 + 560, 700, C.acc, 18, eo5(prog(t, q(4.5), q(4.8))));
      c.save(); c.beginPath(); c.rect(0, 1000, 70 + 940 * eo5(prog(t, q(3.9), q(4.5))), 400); c.clip();
      T(c, 'ENSAYO', 70, 1230, { sz: 300, col: C.acc }); c.restore();
    },
  };
})();

// ───────── 2 · MITO ─────────
const myth = (() => {
  const t0 = q(5.4), K = { crack: q(6.6), stamp: q(7.5), split: q(8.1) };
  const crack = [[560, 330], [500, 470], [610, 620], [480, 770], [600, 920], [500, 1070], [590, 1180], [530, 1270]];
  const card = (c, t) => {
    const s = 0.7 + 0.3 * eback(prog(t, t0, t0 + 0.4));
    c.save(); c.translate(540, 800); c.scale(s, s); c.translate(-540, -800);
    c.fillStyle = C.bone; rrect(c, 90, 360, 900, 880, 28); c.fill();
    const L = ['EL MEJOR', 'ESPECIALISTA', 'TIENE QUE SER', 'EL JEFE'];
    L.forEach((ln, i) => {
      const a = t0 + 0.15 + i * 0.15, p = eo5(prog(t, a, a + 0.25));
      c.save(); c.beginPath(); c.rect(120, 360, 840 * p + 1, 880); c.clip();
      T(c, ln, 130, 549 + i * 195, { sz: 170, col: i === 3 ? C.acc : C.ink }); c.restore();
    });
    c.restore();
  };
  const poly = (c, side) => {
    c.beginPath();
    c.moveTo(side < 0 ? -200 : W + 200, 300);
    crack.forEach(([x, y]) => c.lineTo(x, y));
    c.lineTo(side < 0 ? -200 : W + 200, 1300); c.closePath();
  };
  return {
    id: 'myth', t0, bg: 'ink', tr: 'iris',
    cues: [[t0, 'hit', 0.8], [K.crack, 'crack', 1], [K.stamp, 'hit', 1.2], [K.split, 'boom', 0.8]],
    draw(c, t) {
      bg(c, C.ink);
      if (t < K.split) {
        card(c, t);
        const p = prog(t, K.crack, K.crack + 0.5);
        if (p > 0) {
          c.save(); c.strokeStyle = C.acc; c.lineWidth = 14; c.lineJoin = 'round'; c.beginPath();
          const n = (crack.length - 1) * p;
          crack.forEach(([x, y], i) => {
            if (i <= n) c.lineTo(x, y);
            else if (i - 1 < n) { const f = n - (i - 1), [px, py] = crack[i - 1]; c.lineTo(lerp(px, x, f), lerp(py, y, f)); }
            if (i === 0) { c.moveTo(x, y); }
          });
          c.stroke(); c.restore();
        }
      } else {
        const e = eo3(prog(t, K.split, K.split + 0.7)), d = t - K.split;
        [-1, 1].forEach(sd => {
          c.save(); poly(c, sd); c.clip();
          c.translate(540, 800); c.rotate(sd * 0.1 * e); c.translate(sd * 150 * e, 40 * e + d * 14); c.translate(-540, -800);
          card(c, t); c.restore();
        });
      }
      const s = slam(t, K.stamp, 0.25, 2.4);
      if (s > 0) {
        const fall = Math.max(0, t - (K.split + 0.7));
        TL(c, 'MITO', 540 - tw(c, 'MITO', 420) / 2, 880 + fall * fall * 140, { sz: 420, col: C.acc, rot: -0.13, s, stroke: C.ink, lw: 14 });
      }
    },
  };
})();

// ───────── 3 · ROMPECABEZAS (A y B comparten el estado de las piezas) ─────────
const S = 250, GX = 165, GY = 430;
const hs = [[1, -1], [-1, 1], [1, 1]], vs = [[-1, 1, 1], [1, -1, 1]];
const tileEdges = (r, k) => ({
  t: r === 0 ? 0 : -vs[r - 1][k], b: r === 2 ? 0 : vs[r][k],
  l: k === 0 ? 0 : -hs[r][k - 1], r: k === 2 ? 0 : hs[r][k],
});
const R = rng(42);
const scat = Array.from({ length: 9 }, (_, i) => {
  const r = Math.floor(i / 3), k = i % 3;
  const cell = [4, 0, 8, 2, 6, 1, 7, 5, 3][i];
  return { x: 40 + (cell % 3) * 330 + (R() - 0.5) * 50, y: 440 + Math.floor(cell / 3) * 260 + (R() - 0.5) * 40, rot: (R() - 0.5) * 1.1 };
});
const ORDER = [0, 1, 2, 5, 4, 3, 6, 7, 8];
const PZ = { drop: q(10.05), accent: q(14.85), assemble: q(16.65), done: q(18.0) };
function puzzle(c, t) {
  for (let i = 0; i < 9; i++) {
    const r = Math.floor(i / 3), k = i % 3, e = tileEdges(r, k);
    const ax = GX + k * S, ay = GY + r * S, sc = scat[i];
    const o = ORDER.indexOf(i), a0 = PZ.assemble + o * 0.15;
    const dp = prog(t, PZ.drop + i * 0.07, PZ.drop + i * 0.07 + 0.7);
    let x = sc.x, y = lerp(-320, sc.y, ebounce(dp)), rot = sc.rot + (1 - eo3(dp)) * 1.2;
    const ap = prog(t, a0, a0 + 0.4);
    if (ap > 0) { const k2 = eback(ap); x = lerp(sc.x, ax, k2); y = lerp(sc.y, ay, k2); rot = lerp(sc.rot, 0, eo3(ap)); }
    let sx = 1;
    const isAcc = i === 4;
    let fill = C.ink2;
    if (isAcc && t >= PZ.accent) { fill = C.acc; if (ap <= 0) { sx = 1 + 0.18 * pop(t, PZ.accent, 0.3) * (t < q(15.9) ? 1 : 0.4); } }
    if (t >= PZ.done) fill = isAcc ? C.acc : C.bone;
    if (dp <= 0) continue;
    if (isAcc && t >= PZ.accent && t < q(15.9) + 0.3 && ap <= 0) {
      spikes(c, x + S / 2, y + S / 2, 190, 190 + 90 * (t < q(15.9) ? pop(t, PZ.accent, 0.4) : 1 - prog(t, q(15.9), q(15.9) + 0.3)), 16, C.acc, 10, t * 0.6);
    }
    c.save(); c.translate(x + S / 2, y + S / 2); c.rotate(rot); c.scale(sx, sx); c.translate(-S / 2, -S / 2);
    jigsaw(c, 0, 0, S - 8, e, fill, t >= PZ.done ? C.ink : C.bone, 5); c.restore();
  }
}
const puzA = (() => {
  const t0 = q(10.05), K = { lid: q(10.95), rom: q(12.15) };
  return {
    id: 'puzA', t0, bg: 'ink', tr: 'push',
    cues: [[t0, 'whoosh', 0.7], ...Array.from({ length: 9 }, (_, i) => [t0 + 0.7 + i * 0.07, 'tick', 0.6]), [K.lid, 'hit', 1], [K.rom, 'hit', 0.9]],
    draw(c, t) {
      bg(c, C.ink);
      const s1 = slam(t, K.lid, 0.25, 1.6);
      if (s1) TL(c, 'LIDERAZGO', 70, 370, { sz: 190, col: C.bone, s: s1 });
      puzzle(c, t);
      const s2 = slam(t, K.rom, 0.25, 1.6);
      if (s2) TL(c, 'ES UN ROMPECABEZAS', 70, 1300, { sz: 128, col: C.acc, s: s2 });
    },
  };
})();
const puzB = (() => {
  const t0 = q(13.35), K = { tu: q(13.65), brill: q(14.85), strk: q(15.9), enc: q(16.2), rest: q(17.4) };
  const asm = ORDER.map((_, o) => PZ.assemble + o * 0.15 + 0.4);
  return {
    id: 'puzB', t0, bg: 'ink', tr: 'none',
    cues: [[K.brill, 'ding', 1], [K.strk, 'swoosh', 0.8], ...asm.map(a => [a, 'snap', 0.8]), [PZ.done, 'hit', 1.1], [PZ.done + 0.1, 'ding', 0.7]],
    draw(c, t) {
      bg(c, C.ink);
      if (t < K.enc) TL(c, 'TU TRABAJO NO ES', 70, 370, { sz: 130, col: C.bone, s: slam(t, K.tu, 0.2, 1.4) });
      else TL(c, 'SABER ENCAJAR', 70, 370, { sz: 190, col: C.acc, s: slam(t, K.enc, 0.25, 1.5) });
      puzzle(c, t);
      if (t >= K.brill && t < K.rest) {
        const w = tw(c, 'LA PIEZA BRILLANTE', 128);
        TL(c, 'LA PIEZA BRILLANTE', 70, 1300, { sz: 128, col: C.bone, s: slam(t, K.brill, 0.22, 1.4) });
        strike(c, 60, 1255, 80 + w, eo5(prog(t, K.strk, K.strk + 0.2)), C.acc, 18, -0.02);
      }
      if (t >= K.rest) TL(c, 'A TODAS LAS DEMÁS', 70, 1300, { sz: 128, col: C.bone, s: slam(t, K.rest, 0.22, 1.4) });
    },
  };
})();

// ───────── 5 · LA TRAMPA ─────────
const trap = (() => {
  const t0 = q(18.75), K = { open: q(19.35), tr: q(20.1), snap: q(20.1), spec: q(20.55) };
  const jaw = (c, x, dir, col) => {
    c.save(); c.fillStyle = col;
    c.fillRect(dir > 0 ? x - 60 : x, 780, 60, 440);
    for (let i = 0; i < 5; i++) {
      const y = 790 + i * 88 + (dir > 0 ? 0 : 44);
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + dir * 96, y + 44); c.lineTo(x, y + 88); c.closePath(); c.fill();
    }
    c.restore();
  };
  return {
    id: 'trap', t0, bg: 'ink', tr: 'slab',
    cues: [[t0, 'hit', 1], [K.open, 'swoosh', 0.8], [K.snap, 'trap', 1.3], [K.spec, 'hit', 0.9]],
    draw(c, t) {
      bg(c, C.ink);
      T(c, '01', 540, 1180, { sz: 1150, al: 'c', col: 'none', stroke: C.g2, lw: 5 });
      if (t < q(19.8)) {
        TL(c, 'PRIMERO', 540 - tw(c, 'PRIMERO', 330) / 2, 760, { sz: 330, col: C.bone, s: slam(t, t0, 0.25, 1.6) });
        return;
      }
      TL(c, 'LA', 70, 340, { sz: 150, col: C.bone, s: slam(t, q(19.8), 0.2, 1.4) });
      const sT = slam(t, K.tr, 0.22, 1.9);
      if (sT) TL(c, 'TRAMPA', 70, 650, { sz: 360, col: C.acc, s: sT });
      let open = 120 + 40 * Math.sin(t * 3);
      let xl = lerp(-120, 150, eo5(prog(t, K.open, K.open + 0.45)));
      let xr = lerp(1200, 930, eo5(prog(t, K.open, K.open + 0.45)));
      const cl = ei3(prog(t, K.snap - 0.2, K.snap));
      xl = lerp(xl, 480, cl); xr = lerp(xr, 600, cl);
      const jig = t > K.snap ? Math.sin((t - K.snap) * 70) * 6 * Math.exp(-(t - K.snap) * 7) : 0;
      jaw(c, xl + jig, 1, t > K.snap ? C.acc : C.bone); jaw(c, xr - jig, -1, t > K.snap ? C.acc : C.bone);
      if (t >= K.spec) chars(c, 'DE LA ESPECIALIZACIÓN', 70, 1340, t, K.spec, { sz: 128, col: C.bone, st: 0.03, dy: 80 });
    },
  };
})();

// ───────── 6 · CIRUJANO ─────────
const surgeon = (() => {
  const t0 = q(22.8), K = { st0: q(23.4), cruz: q(24.15) };
  const plus = (c, x, y, s, col) => { c.fillStyle = col; c.fillRect(x - s * 0.17, y - s / 2, s * 0.34, s); c.fillRect(x - s / 2, y - s * 0.17, s, s * 0.34); };
  return {
    id: 'surgeon', t0, bg: 'bone', tr: 'push',
    cues: [[t0, 'hit', 0.9], ...[0, 1, 2, 3, 4].map(i => [K.st0 + i * 0.15, 'tick', 0.9]), [K.cruz, 'hit', 1.2]],
    draw(c, t) {
      bg(c, C.bone);
      TL(c, '¿DE QUÉ SIRVE', 70, 430, { sz: 190, col: C.ink, s: slam(t, t0, 0.22, 1.5) });
      TL(c, 'TENER AL MEJOR', 70, 590, { sz: 130, col: C.ink, s: slam(t, q(23.1), 0.2, 1.4) });
      for (let i = 0; i < 5; i++) {
        const a = K.st0 + i * 0.15, p = pop(t, a, 0.3);
        if (p) star(c, 150 + i * 195, 740, 78 * p, C.acc, 0);
        else star(c, 150 + i * 195, 740, 78, '#D2CBB8', 0);
      }
      const s = slam(t, K.cruz, 0.28, 2);
      if (s) { c.save(); c.translate(540, 1070); c.scale(s, s); plus(c, 0, 0, 320, C.acc); c.restore(); }
      if (t >= K.cruz) TL(c, 'CIRUJANO', 540 - tw(c, 'CIRUJANO', 150) / 2, 1380, { sz: 150, col: C.ink, s: slam(t, K.cruz + 0.15, 0.2, 1.4) });
    },
  };
})();

// ───────── 7 · HOSPITAL (camas) ─────────
const bedXY = (i) => ({ x: 110 + (i % 4) * 220, y: 640 + Math.floor(i / 4) * 190 });
function bed(c, x, y, col, a = 1) {
  c.save(); c.globalAlpha = a; c.strokeStyle = col; c.lineWidth = 8; c.lineJoin = 'round';
  rrect(c, x, y + 20, 200, 110, 14); c.stroke();
  c.fillStyle = col; rrect(c, x + 14, y + 36, 54, 36, 8); c.fill();
  c.fillRect(x, y + 130, 8, 24); c.fillRect(x + 192, y + 130, 8, 24); c.restore();
}
const hospital = (() => {
  const t0 = q(25.05);
  return {
    id: 'hospital', t0, bg: 'ink', tr: 'cut',
    cues: [[t0, 'hit', 1], ...Array.from({ length: 12 }, (_, i) => [q(25.5) + i * 0.075, 'tick', 0.4]), [q(26.4), 'swoosh', 0.6]],
    draw(c, t) {
      bg(c, C.ink);
      const sp = slam(t, t0, 0.25, 1.8);
      c.save(); c.translate(220, 410); c.scale(sp, sp); c.fillStyle = C.acc; rrect(c, -110, -110, 220, 220, 22); c.fill(); c.restore();
      T(c, 'H', 220, 490, { sz: 250, al: 'c', col: C.bone, s: sp });
      if (sp) TL(c, 'HOSPITAL', 370, 485, { sz: 200, col: C.bone, s: sp });
      for (let i = 0; i < 12; i++) {
        const p = pop(t, q(25.5) + i * 0.075, 0.3);
        if (!p) continue;
        const b = bedXY(i); c.save(); c.translate(b.x + 100, b.y + 70); c.scale(p, p); bed(c, -100, -70, C.bone); c.restore();
      }
      // el cirujano recorre las camas en serpiente
      const pr = prog(t, q(25.95), q(27.3));
      if (pr > 0) {
        const n = pr * 11, a = Math.floor(n), f = n - a;
        const pa = bedXY(a), pb = bedXY(Math.min(11, a + 1));
        const x = lerp(pa.x, pb.x, eio(f)) + 100, y = lerp(pa.y, pb.y, eio(f)) + 70;
        c.fillStyle = C.acc; c.fillRect(x - 12, y - 40, 24, 80); c.fillRect(x - 40, y - 12, 80, 24);
      }
    },
  };
})();

// ───────── 8 · ¿CAMAS? ¿PRESUPUESTO? ─────────
const budget = (() => {
  const t0 = q(27.45), K = { pres: q(28.2), q: q(29.4) };
  return {
    id: 'budget', t0, bg: 'ink', tr: 'cut',
    cues: [[t0, 'hit', 1], [K.pres, 'hit', 1], [q(28.95), 'tick', 1], [K.q, 'thud', 1]],
    draw(c, t) {
      bg(c, C.ink);
      const step = Math.floor((t - t0) / 0.15);
      if (t < K.pres) {
        const off = ei3(prog(t, K.pres - 0.3, K.pres)) * 900;
        c.save(); c.translate(0, off);
        for (let i = 0; i < 12; i++) {
          const b = bedXY(i), vis = hash(step * 13 + i) > 0.45;
          bed(c, b.x, b.y, vis ? C.bone : C.g2, vis ? 1 : 0.55);
          if (!vis) T(c, '?', b.x + 100, b.y + 112, { sz: 110, al: 'c', col: C.acc });
        }
        c.restore();
        TL(c, '¿CAMAS?', 70, 520, { sz: 330, col: C.acc, s: slam(t, t0, 0.22, 1.6) });
      } else {
        TL(c, '¿PRESUPUESTO?', 70, 480, { sz: 165, col: C.bone, s: slam(t, K.pres, 0.22, 1.5) });
        const frozen = t > q(28.95);
        const st2 = frozen ? Math.floor((q(28.95) - K.pres) / 0.15) : Math.floor((t - K.pres) / 0.15);
        for (let i = 0; i < 7; i++) {
          const hgt = 120 + hash(st2 * 7 + i) * 520, h = frozen ? hgt * (1 - 0.35 * eo3(prog(t, q(28.95), K.q))) : hgt;
          c.fillStyle = frozen ? C.g2 : (i % 2 ? C.bone : C.acc);
          c.fillRect(90 + i * 130, 1290 - h, 96, h);
        }
        if (t >= K.q) T(c, '?', 540, 1180, { sz: 900, al: 'c', col: C.acc, s: slam(t, K.q, 0.25, 2), stroke: C.ink, lw: 16 });
      }
    },
  };
})();

// ───────── 9 · SACCHI ─────────
const sacchi = (() => {
  const t0 = q(29.85), K = { arr: q(30.45), sac: q(30.9) };
  return {
    id: 'sacchi', t0, bg: 'bone', tr: 'slab',
    cues: [[t0, 'swoosh', 0.7], [K.arr, 'hit', 1], [K.sac, 'hit', 1]],
    draw(c, t) {
      bg(c, C.bone);
      T(c, 'MIRA A', 70, 340 + (1 - eo5(prog(t, t0, t0 + 0.3))) * -60, { sz: 56, f: 'u', col: C.ink, tr: 16 });
      const sa = slam(t, K.arr, 0.25, 1.6);
      if (sa) TL(c, 'ARRIGO', 70, 720, { sz: 400, col: C.ink, s: sa });
      const ss = slam(t, K.sac, 0.25, 1.6);
      if (ss) TL(c, 'SACCHI', 70, 1080, { sz: 400, col: C.acc, s: ss });
      // balón que rebota
      const p = prog(t, t0 + 0.2, q(31.5));
      if (p > 0) {
        const x = lerp(-120, 1200, p), by = Math.abs(Math.sin(p * Math.PI * 4)) * 240 * (1 - p * 0.5);
        const y = 1290 - 96 - by, rot = p * 18;
        c.save(); c.translate(x, y); c.rotate(rot); circle(c, 0, 0, 86, C.ink);
        c.fillStyle = C.bone; c.beginPath();
        for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5 - Math.PI / 2; c.lineTo(Math.cos(a) * 34, Math.sin(a) * 34); }
        c.closePath(); c.fill(); c.restore();
      }
    },
  };
})();

// ───────── 10 · NUNCA ÉLITE ─────────
const elite = (() => {
  const t0 = q(31.5), K = { l2: q(31.95), l3: q(32.55), st: q(32.85) };
  return {
    id: 'elite', t0, bg: 'ink', tr: 'push',
    cues: [[t0, 'hit', 0.9], [K.l2, 'hit', 0.9], [K.l3, 'hit', 1.1], [K.st, 'swoosh', 1]],
    draw(c, t) {
      bg(c, C.ink);
      TL(c, 'NUNCA FUE', 70, 560, { sz: 190, col: C.bone, s: slam(t, t0, 0.22, 1.5) });
      TL(c, 'UN FUTBOLISTA', 70, 770, { sz: 190, col: C.bone, s: slam(t, K.l2, 0.22, 1.5) });
      const s = slam(t, K.l3, 0.25, 1.8);
      if (s) TL(c, 'DE ÉLITE', 70, 1090, { sz: 330, col: C.bone, s });
      strike(c, 40, 970, 40 + tw(c, 'DE ÉLITE', 330) + 60, eo5(prog(t, K.st, K.st + 0.25)), C.acc, 30, -0.02);
    },
  };
})();

// ───────── 11a · ESCUDO AC MILAN ─────────
const milan = (() => {
  const t0 = q(33.15), K = { s: q(33.3) };
  const shield = (c) => {
    c.beginPath(); c.moveTo(-300, -330); c.lineTo(300, -330); c.lineTo(300, 40);
    c.bezierCurveTo(300, 250, 120, 330, 0, 380); c.bezierCurveTo(-120, 330, -300, 250, -300, 40); c.closePath();
  };
  return {
    id: 'milan', t0, bg: 'bone', tr: 'iris',
    cues: [[K.s, 'hit', 1.1], [q(33.75), 'tick', 0.8]],
    draw(c, t) {
      bg(c, C.bone);
      const p = pop(t, K.s, 0.4);
      c.save(); c.translate(540, 760); c.scale(p, p);
      shield(c); c.fillStyle = C.ink; c.fill(); c.save(); shield(c); c.clip();
      for (let i = -3; i < 3; i++) { if (i % 2 === 0) { c.fillStyle = C.acc; c.fillRect(i * 100, -340, 100, 740); } }
      c.restore(); shield(c); c.strokeStyle = C.ink; c.lineWidth = 16; c.stroke(); c.restore();
      TL(c, 'AC MILAN', 540 - tw(c, 'AC MILAN', 190) / 2, 1290, { sz: 190, col: C.ink, s: slam(t, q(33.6), 0.22, 1.5) });
      T(c, 'LLEVÓ AL', 70, 330, { sz: 56, f: 'u', col: C.ink, tr: 14, a: prog(t, t0, t0 + 0.2) });
    },
  };
})();

// ───────── 11b · COPAS DE EUROPA ─────────
const cups = (() => {
  const t0 = q(34.35), K = { eu: q(34.95) };
  const cup = (c) => {
    c.fillStyle = C.ink; c.strokeStyle = C.ink;
    c.beginPath(); c.moveTo(-150, -250); c.lineTo(150, -250); c.bezierCurveTo(150, -100, 80, -30, 20, -20); c.lineTo(-20, -20);
    c.bezierCurveTo(-80, -30, -150, -100, -150, -250); c.fill();
    c.fillRect(-20, -22, 40, 96); rrect(c, -110, 70, 220, 46, 10); c.fill();
    c.lineWidth = 24; c.beginPath(); c.arc(-150, -170, 66, Math.PI * 0.5, Math.PI * 1.5); c.stroke();
    c.beginPath(); c.arc(150, -170, 66, -Math.PI * 0.5, Math.PI * 0.5); c.stroke();
  };
  return {
    id: 'cups', t0, bg: 'bone', tr: 'cut',
    cues: [[t0, 'hit', 1], [K.eu, 'ding', 1], [K.eu, 'hit', 0.8]],
    draw(c, t) {
      bg(c, C.bone);
      TL(c, 'COPAS', 70, 410, { sz: 250, col: C.ink, s: slam(t, t0, 0.22, 1.6) });
      const rise = 1 - eo5(prog(t, t0 + 0.1, t0 + 0.6));
      c.save(); c.translate(540, 800 + rise * 500); cup(c); c.restore();
      const ps = pop(t, K.eu, 0.5);
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * Math.PI * 2 + t * 0.5, r = 380 * ps;
        if (ps) star(c, 540 + Math.cos(a) * r, 760 + Math.sin(a) * r * 0.9, 34, C.acc, a);
      }
      const s = slam(t, K.eu, 0.25, 1.7);
      if (s) TL(c, 'DE EUROPA', 540 - tw(c, 'DE EUROPA', 170) / 2, 1290, { sz: 170, col: C.acc, s });
    },
  };
})();

// ───────── 11c · TÁCTICA COLECTIVA ─────────
const tactic = (() => {
  const t0 = q(36.3), K = { tac: q(37.35), compact: q(38.1) };
  const P = [[540, 1230], [250, 1080], [420, 1080], [660, 1080], [830, 1080], [250, 880], [420, 880], [660, 880], [830, 880], [400, 650], [680, 650]];
  const links = [[1, 2], [2, 3], [3, 4], [5, 6], [6, 7], [7, 8], [1, 5], [2, 6], [3, 7], [4, 8], [9, 10], [6, 9], [7, 10], [5, 9], [8, 10]];
  const pos = (i, t) => {
    const g = prog(t, K.tac, K.tac + 0.4), cp = eo3(prog(t, K.compact, K.compact + 0.5));
    let [x, y] = P[i];
    x = lerp(540, x, 1 - cp * 0.35);
    const sway = g * Math.sin((t - K.tac) * 3.2) * 110, adv = g * Math.sin((t - K.tac) * 2.1) * 60;
    return [x + sway, y + adv - cp * 80];
  };
  return {
    id: 'tactic', t0, bg: 'ink', tr: 'iris',
    cues: [[t0, 'swoosh', 0.7], ...P.map((_, i) => [t0 + 0.1 + i * 0.045 + 0.0, 'tick', 0.35]), [K.tac, 'hit', 1], [K.compact, 'ding', 0.8]],
    draw(c, t) {
      bg(c, C.ink);
      c.strokeStyle = C.g2; c.lineWidth = 5; c.strokeRect(140, 430, 800, 860);
      line(c, 140, 860, 940, 860, C.g2, 5); circle(c, 540, 860, 110, null, C.g2, 5);
      c.strokeRect(300, 430, 480, 130); c.strokeRect(300, 1160, 480, 130);
      if (t < K.tac) T(c, 'ENTENDÍA', 70, 345, { sz: 56, f: 'u', col: C.bone, tr: 14 });
      else TL(c, 'TÁCTICA COLECTIVA', 70, 365, { sz: 140, col: C.acc, s: slam(t, K.tac, 0.22, 1.5) });
      const lp = eo3(prog(t, K.tac, K.tac + 0.35));
      links.forEach(([a, b]) => { const A = pos(a, t), B = pos(b, t); if (lp) line(c, A[0], A[1], B[0], B[1], C.acc, 6, lp); });
      P.forEach((_, i) => {
        const p = pop(t, t0 + 0.1 + i * 0.045, 0.3); if (!p) return;
        const [x, y] = pos(i, t); circle(c, x, y, 30 * p, i === 0 ? C.acc : C.bone);
      });
    },
  };
})();

// ───────── 12 · COORDINAR ─────────
const coord = (() => {
  const t0 = q(38.7), K = { coord: q(40.2), big: q(41.4) };
  return {
    id: 'coord', t0, bg: 'bone', tr: 'push',
    cues: [[t0, 'hit', 0.9], ...Array.from({ length: 6 }, (_, i) => [K.coord + 0.15 * (i + 1) - 0.0, 'tick', 0.9]), [K.big, 'swell', 1], [q(42.6), 'hit', 1]],
    draw(c, t) {
      bg(c, C.bone);
      if (t < K.coord) {
        TL(c, 'LA VERDADERA', 70, 385, { sz: 140, col: C.ink, s: slam(t, t0, 0.22, 1.4) });
        TL(c, 'MAGIA', 70, 515, { sz: 140, col: C.acc, s: slam(t, q(39.6), 0.2, 1.5) });
      } else TL(c, 'SABER COORDINAR', 70, 400, { sz: 150, col: C.ink, s: slam(t, K.coord, 0.22, 1.4) });
      const rot = (t - t0) * 0.35, grow = pop(t, K.big, 0.5);
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2 + rot, R0 = 290;
        const x = 540 + Math.cos(a) * R0, y = 790 + Math.sin(a) * R0;
        const ap = pop(t, t0 + 0.2 + i * 0.08, 0.35), r = (64 + grow * 56) * ap;
        const lp = eo3(prog(t, K.coord + i * 0.15, K.coord + i * 0.15 + 0.3));
        if (lp) line(c, 540, 790, x, y, C.ink, 6, lp);
        if (ap) circle(c, x, y, r, C.ink);
      }
      const tuR = 36 * (1 - 0.2 * grow) * pop(t, t0, 0.3);
      circle(c, 540, 790, tuR, C.acc);
      if (t >= K.big) {
        TL(c, 'LOS QUE SABEN', 70, 1330, { sz: 100, col: C.ink, s: slam(t, K.big, 0.2, 1.3) });
        TL(c, 'MUCHÍSIMO MÁS QUE TÚ', 70, 1440 - 0, { sz: 100, col: C.acc, s: slam(t, q(41.7), 0.2, 1.3) });
      }
    },
  };
})();

// ───────── 13 · SEGUNDO (02) ─────────
const second = (() => {
  const t0 = q(43.35), K = { ghost: q(44.1), t2: q(45.0) };
  return {
    id: 'second', t0, bg: 'ink', tr: 'slab',
    cues: [[t0, 'boom', 1.2], [K.ghost, 'hit', 0.8], [K.t2, 'hit', 0.8]],
    draw(c, t) {
      bg(c, C.ink);
      if (t < K.ghost) T(c, '02', 540, 1150, { sz: 1000, al: 'c', col: C.acc, s: slam(t, t0, 0.3, 1.5) });
      else {
        T(c, '02', 540, 1180, { sz: 1150, al: 'c', col: 'none', stroke: C.g2, lw: 5 });
        TL(c, 'PARA LOGRAR ESO', 70, 650, { sz: 158, col: C.bone, s: slam(t, K.ghost, 0.22, 1.5) });
        TL(c, 'TIENES QUE SER', 70, 860, { sz: 150, col: C.bone, s: slam(t, K.t2, 0.22, 1.5) });
      }
    },
  };
})();

// ───────── 14 · LÍMITES ─────────
const limits = (() => {
  const t0 = q(45.75), K = { c: q(46.05), run: q(46.35), wall: q(47.25) };
  return {
    id: 'limits', t0, bg: 'bone', tr: 'cut',
    cues: [[t0, 'hit', 1], [K.c, 'hit', 0.9], [K.run, 'riser', 0.8], [K.wall, 'hit', 1.4]],
    draw(c, t) {
      bg(c, C.bone);
      TL(c, 'SÚPER', 70, 520, { sz: 330, col: C.ink, s: slam(t, t0, 0.22, 1.5) });
      TL(c, 'CONSCIENTE', 70, 760, { sz: 230, col: C.ink, s: slam(t, K.c, 0.22, 1.5) });
      for (let i = 0; i <= 40; i++) { const x = 80 + i * 22.5; line(c, x, 1010, x, i % 5 ? 1040 : 1060, C.ink, i % 5 ? 4 : 6); }
      line(c, 80, 1010, 980, 1010, C.ink, 6);
      const wp = pop(t, K.run - 0.2, 0.3);
      c.fillStyle = C.acc; c.fillRect(870, 900 - 30 * (1 - wp), 34, 240 * wp);
      for (let i = 0; i < 6; i++) line(c, 904, 920 + i * 36, 940, 905 + i * 36, C.acc, 6, wp);
      const run = ei3(prog(t, K.run, K.wall));
      let x = lerp(100, 850, run);
      if (t > K.wall) x -= eo3(prog(t, K.wall, K.wall + 0.4)) * 60;
      c.fillStyle = C.ink; c.beginPath(); c.moveTo(x, 996); c.lineTo(x - 26, 940); c.lineTo(x + 26, 940); c.closePath(); c.fill();
      if (t >= K.wall) spikes(c, 868, 1010, 30, 30 + 90 * prog(t, K.wall, K.wall + 0.3), 10, C.acc, 8);
      if (t >= q(46.95)) TL(c, 'DE TUS PROPIOS LÍMITES', 70, 1250, { sz: 104, col: C.ink, s: slam(t, q(46.95), 0.2, 1.3) });
    },
  };
})();

// ───────── 15 · "NO LO SÉ" + AUTORIDAD ─────────
const dontKnow = (() => {
  const t0 = q(48.15), K = { oye: q(48.6), nolo: q(49.05), meter: q(49.8), hit: q(50.4) };
  return {
    id: 'dontKnow', t0, bg: 'ink', tr: 'iris',
    cues: [[t0, 'pop', 1], [K.oye, 'tick', 1], [K.nolo, 'hit', 1.1], [K.meter, 'swoosh', 0.7], [K.hit, 'bounce', 1.2]],
    draw(c, t) {
      bg(c, C.ink);
      const up = eo5(prog(t, K.meter, K.meter + 0.4));
      const sc = lerp(1, 0.62, up);
      c.save(); c.translate(540, lerp(600, 420, up)); c.scale(sc * pop(t, t0, 0.35), sc * pop(t, t0, 0.35)); c.translate(-540, -600);
      c.fillStyle = C.bone; rrect(c, 90, 380, 900, 440, 40); c.fill();
      c.beginPath(); c.moveTo(180, 818); c.lineTo(160, 940); c.lineTo(300, 818); c.closePath(); c.fill();
      if (t >= K.oye) TL(c, 'OYE,', 150, 600, { sz: 170, col: C.ink, s: slam(t, K.oye, 0.2, 1.3) });
      if (t >= K.nolo) TL(c, 'NO LO SÉ', 150, 790, { sz: 250, col: C.acc, s: slam(t, K.nolo, 0.22, 1.5) });
      c.restore();
      if (t >= K.meter) {
        T(c, 'AUTORIDAD', 90, 1010, { sz: 46, f: 'u', col: C.bone, tr: 12 });
        const shk = t > K.hit ? Math.sin((t - K.hit) * 80) * 8 * Math.exp(-(t - K.hit) * 8) : 0;
        c.fillStyle = C.acc; rrect(c, 90 + shk, 1040, 900, 90, 18); c.fill();
        // token "−" que rebota sin restar
        const fl = prog(t, K.meter, K.hit);
        let tx, ty;
        if (t < K.hit) { tx = lerp(-80, 540, fl); ty = 960 + (1 - fl) * -220; }
        else { const b = prog(t, K.hit, K.hit + 0.6); tx = 540 - b * 520; ty = 1040 - Math.sin(b * Math.PI) * 280 + b * b * 260; }
        circle(c, tx, ty, 62, C.bone); line(c, tx - 28, ty, tx + 28, ty, C.ink, 14);
        if (t >= K.hit) TL(c, 'NO RESTA', 540 - tw(c, 'NO RESTA', 150) / 2, 1300, { sz: 150, col: C.bone, s: slam(t, K.hit, 0.22, 1.4) });
      }
    },
  };
})();

// ───────── 17 · LA CLAVE / INTEGRAR ─────────
const keyScene = (() => {
  const t0 = q(51.0), K = { key: q(51.45), integ: q(52.35), fly: q(52.8), lock: q(53.25) };
  const shapes = [
    (c, r) => circle(c, 0, 0, r),
    (c, r) => c.fillRect(-r, -r, 2 * r, 2 * r),
    (c, r) => { c.beginPath(); c.moveTo(0, -r * 1.2); c.lineTo(r * 1.1, r); c.lineTo(-r * 1.1, r); c.closePath(); c.fill(); },
    (c, r) => { c.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; c.lineTo(Math.cos(a) * r * 1.15, Math.sin(a) * r * 1.15); } c.closePath(); c.fill(); },
  ];
  return {
    id: 'key', t0, bg: 'bone', tr: 'push',
    cues: [[t0, 'swoosh', 0.7], [K.key, 'hit', 1], [K.integ, 'hit', 0.8], [K.fly, 'whoosh', 1], [K.lock, 'trap', 1]],
    draw(c, t) {
      bg(c, C.bone);
      T(c, 'DE HECHO', 70, 300, { sz: 56, f: 'u', col: C.ink, tr: 16 });
      const sk = slam(t, K.key, 0.25, 1.6);
      if (sk) TL(c, 'LA CLAVE', 70, 490, { sz: 190, col: C.ink, s: sk });
      const kp = pop(t, K.key, 0.45), kr = (1 - eo3(prog(t, K.key + 0.1, K.key + 0.6))) * 0.9;
      c.save(); c.translate(540, 780); c.rotate(kr); c.scale(kp, kp);
      c.strokeStyle = C.ink; c.lineWidth = 38; c.beginPath(); c.arc(-170, 0, 80, 0, Math.PI * 2); c.stroke();
      c.fillStyle = C.ink; c.fillRect(-90, -16, 380, 32); c.fillRect(190, 0, 34, 90); c.fillRect(250, 0, 34, 66); c.restore();
      const fp = eo5(prog(t, K.fly, K.fly + 0.45));
      shapes.forEach((sh, i) => {
        const a = i * Math.PI / 2 + Math.PI / 4, tx = 370 + Math.cos(a) * 200, ty = 780 + Math.sin(a) * 200;
        const sx0 = i % 2 ? -150 : 1230, sy0 = i < 2 ? 200 : 1300;
        const x = lerp(sx0, tx, fp), y = lerp(sy0, ty, fp);
        if (t < K.fly) return;
        c.save(); c.translate(x, y); c.rotate((1 - fp) * 3); c.fillStyle = i === 0 ? C.acc : C.ink; sh(c, 56); c.restore();
      });
      if (t >= K.lock) circle(c, 370, 780, 300 * prog(t, K.lock, K.lock + 0.3), null, C.acc, 12 * (1 - prog(t, K.lock, K.lock + 0.4)));
      if (t >= K.integ) TL(c, 'INTEGRAR', 70, 1190, { sz: 230, col: C.ink, s: slam(t, K.integ, 0.22, 1.5) });
      if (t >= K.lock) TL(c, 'DISCIPLINAS', 70, 1360, { sz: 170, col: C.acc, s: slam(t, K.lock, 0.22, 1.5) });
    },
  };
})();

export const SCENES_A = [hook, title, myth, puzA, puzB, trap, surgeon, hospital, budget, sacchi, elite, milan, cups, tactic, coord, second, limits, dontKnow, keyScene];
