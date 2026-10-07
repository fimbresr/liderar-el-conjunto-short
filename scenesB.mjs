// Escenas 18–35 (54 s → fin).
import {
  W, q, C, T, TL, tw, chars, slam, pop, bg, rrect, line, strike, circle, star, spikes, check, cross,
  clamp, prog, lerp, eo3, eo5, ei3, eio, rng,
} from './lib.mjs';

const hash = (n) => rng(n * 7919 + 13)();

// ───────── 18 · OPPENHEIMER → LOS ÁLAMOS ─────────
const oppen = (() => {
  const t0 = q(54.16), K = { map: q(55.44) };
  const ph = Array.from({ length: 10 }, (_, i) => [hash(i + 1) * 6.28, hash(i + 40) * 6.28]);
  return {
    id: 'oppen', t0, bg: 'ink', tr: 'slab',
    cues: [[t0, 'hit', 1], [q(54.45), 'hit', 0.9], [K.map, 'whoosh', 1], [K.map + 0.15, 'hit', 1]],
    draw(c, t) {
      bg(c, C.ink);
      const out = ei3(prog(t, K.map - 0.05, K.map + 0.3)) * -900;
      if (out > -899) {
        chars(c, 'ROBERT', 70, 640 + out, t, t0, { sz: 330, col: C.bone, st: 0.05, dy: -420 });
        chars(c, 'OPPENHEIMER', 70, 900 + out, t, q(54.45), { sz: 205, col: C.bone, st: 0.035, dy: -420 });
      }
      if (t >= K.map) {
        for (let i = 0; i < 10; i++) {
          const p = eo5(prog(t, K.map + i * 0.04, K.map + 0.5 + i * 0.04)), r0 = 70 + i * 52 + p * 0;
          c.beginPath();
          for (let a = 0; a <= 64; a++) {
            const th = a / 64 * Math.PI * 2;
            const r = r0 * p * (1 + 0.08 * Math.sin(3 * th + ph[i][0]) + 0.05 * Math.sin(5 * th + ph[i][1]));
            c[a ? 'lineTo' : 'moveTo'](540 + Math.cos(th) * r, 760 + Math.sin(th) * r * 0.9);
          }
          c.closePath(); c.strokeStyle = i === 4 ? C.acc : C.g3; c.lineWidth = i === 4 ? 6 : 3; c.stroke();
        }
        const pp = pop(t, K.map + 0.2, 0.35);
        c.save(); c.translate(540, 760); c.scale(pp, pp); circle(c, 0, -30, 34, C.acc);
        c.fillStyle = C.acc; c.beginPath(); c.moveTo(-26, -14); c.lineTo(26, -14); c.lineTo(0, 40); c.closePath(); c.fill(); circle(c, 0, -30, 12, C.ink); c.restore();
        TL(c, 'LOS ÁLAMOS', 70, 1300, { sz: 230, col: C.bone, s: slam(t, K.map + 0.15, 0.22, 1.5) });
      }
    },
  };
})();

// ───────── 19 · NOBEL → ALINEAR ─────────
const nobel = (() => {
  const t0 = q(56.85), K = { slash: q(57.3), shat: q(58.05), pero: q(58.05), cols: q(58.65), glint: q(59.7), rank: q(60.45) };
  const rows = [560, 710, 860, 1010, 1160];
  const offL = rows.map((_, i) => (hash(i + 200) - 0.5) * 220), offR = rows.map((_, i) => (hash(i + 300) - 0.5) * 220);
  return {
    id: 'nobel', t0, bg: 'bone', tr: 'push',
    cues: [[t0, 'hit', 1], [K.slash, 'swoosh', 1], [K.slash + 0.15, 'hit', 1], [K.shat, 'crack', 1], [K.pero, 'hit', 1.2],
      ...rows.map((_, i) => [K.cols + i * 0.1 + 0.3, 'snap', 0.8]), [K.glint, 'ding', 0.9], [K.rank, 'ding', 0.7]],
    draw(c, t) {
      bg(c, C.bone);
      if (t < K.cols - 0.05) {
        const pm = pop(t, t0, 0.4), sh = prog(t, K.shat, K.shat + 0.8);
        if (sh < 1) {
          [-1, 0, 1].forEach(sd => {
            c.save(); c.translate(540 + sd * 320 * eo3(sh), 700 + (sd === 0 ? 1 : 0.4) * 900 * sh * sh);
            c.rotate(sd * 1.2 * sh); c.scale(pm * 1.3, pm * 1.3);
            c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 200, -Math.PI / 2 + sd * 2.09 - 1.05, -Math.PI / 2 + sd * 2.09 + 1.05); c.closePath();
            c.fillStyle = C.ink; c.fill(); c.restore();
          });
          if (sh === 0) {
            // cinta + detalles de la medalla
            c.save(); c.translate(540, 700); c.scale(pm * 1.3, pm * 1.3);
            c.fillStyle = C.acc; c.beginPath(); c.moveTo(-90, -400); c.lineTo(-10, -400); c.lineTo(90, -150); c.lineTo(10, -150); c.closePath(); c.fill();
            c.beginPath(); c.moveTo(90, -400); c.lineTo(10, -400); c.lineTo(-90, -150); c.lineTo(-10, -150); c.closePath(); c.fill();
            circle(c, 0, 0, 200, null, C.bone, 8); circle(c, 0, 0, 160, null, C.g3, 4);
            T(c, 'NOBEL', 0, 30, { sz: 100, al: 'c', col: C.bone, tr: 6 }); c.restore();
          }
        }
        const sp = eo5(prog(t, K.slash, K.slash + 0.2));
        if (sp && sh < 0.3) line(c, 280, 440, 800, 960, C.acc, 36, sp);
        TL(c, 'SIN PREMIO NOBEL', 70, 1210, { sz: 140, col: C.ink, s: slam(t, q(57.0), 0.2, 1.4) });
        if (t >= K.pero && t < K.cols - 0.05) TL(c, 'PERO', 540 - tw(c, 'PERO', 520) / 2, 950, { sz: 520, col: C.acc, s: slam(t, K.pero, 0.22, 1.6), stroke: C.bone, lw: 20 });
      } else {
        T(c, 'CIENTÍFICOS', 90, 460, { sz: 40, f: 'u', col: C.ink, tr: 8 });
        T(c, 'MILITARES', 990, 460, { sz: 40, f: 'u', col: C.ink, tr: 8, al: 'r' });
        rows.forEach((y, i) => {
          const a = K.cols + i * 0.1, ap = eo5(prog(t, a, a + 0.4)), pp = pop(t, K.cols - 0.2 + i * 0.05, 0.3);
          const yl = y + offL[i] * (1 - ap), yr = y + offR[i] * (1 - ap);
          if (ap > 0.4) line(c, 270, y, 810, y, C.acc, 8, eo3(prog(t, a + 0.25, a + 0.6)));
          c.save(); c.translate(220, yl); c.scale(pp, pp); circle(c, 0, 0, 52, C.ink); c.restore();
          if (t >= K.glint + i * 0.05) spikes(c, 220, yl, 62, 62 + 36 * (1 - prog(t, K.glint + i * 0.05 + 0.2, K.glint + i * 0.05 + 0.5)), 10, C.acc, 7, t);
          c.save(); c.translate(860, yr); c.scale(pp, pp); c.fillStyle = C.ink; c.fillRect(-52, -52, 104, 104);
          if (t >= K.rank + i * 0.05) { c.strokeStyle = C.acc; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(-26, 10); c.lineTo(0, -18); c.lineTo(26, 10); c.stroke(); }
          c.restore();
        });
        TL(c, 'ALINEAR', 540 - tw(c, 'ALINEAR', 150) / 2, 1345, { sz: 150, col: C.ink, s: slam(t, K.cols, 0.22, 1.4) });
      }
    },
  };
})();

// ───────── 20 · OJO / EMPATÍA ─────────
const eye = (() => {
  const t0 = q(61.8), K = { open: q(62.1), emp: q(62.7), x: q(64.65) };
  const chipT = [q(63.45), q(63.75), q(64.05)];
  return {
    id: 'eye', t0, bg: 'ink', tr: 'cut',
    cues: [[t0, 'hit', 1.1], [K.open, 'swoosh', 0.7], [K.emp, 'hit', 0.8], ...chipT.map(a => [a, 'stamp', 0.9]), [K.x, 'hit', 1.3]],
    draw(c, t) {
      bg(c, C.ink);
      TL(c, 'Y OJO,', 70, 400, { sz: 200, col: C.bone, s: slam(t, t0, 0.22, 1.6) });
      const o = eo5(prog(t, K.open, K.open + 0.3)) * (1 - 0.9 * Math.max(0, 1 - Math.abs(t - 63.0) * 9) * (t > 62.8 && t < 63.2 ? 1 : 0));
      if (o > 0) {
        c.save(); c.translate(540, 660); c.beginPath(); c.moveTo(-260, 0);
        c.quadraticCurveTo(0, -230 * o, 260, 0); c.quadraticCurveTo(0, 230 * o, -260, 0); c.closePath();
        c.fillStyle = C.bone; c.fill(); c.clip();
        const dx = Math.sin(t * 2.4) * 70; circle(c, dx, 0, 100, C.ink); circle(c, dx, 0, 56, C.acc); circle(c, dx - 20, -22, 14, C.bone);
        c.restore();
      }
      if (t >= K.emp) TL(c, 'SU EMPATÍA', 70, 940, { sz: 150, col: C.acc, s: slam(t, K.emp, 0.22, 1.4) });
      chipT.forEach((a, i) => {
        const p = pop(t, a, 0.3); if (!p) return;
        const y = 1000 + i * 120;
        c.save(); c.translate(540, y + 45); c.scale(1, p); c.fillStyle = C.bone; rrect(c, -400, -45, 800, 90, 20); c.fill();
        check(c, -330, 0, 56, C.acc, 12); T(c, 'TIENES RAZÓN', -270, 26, { sz: 84, col: C.ink }); c.restore();
      });
      const xp = eo5(prog(t, K.x, K.x + 0.25));
      if (xp) cross(c, 540, 1150, 210, C.acc, 36, xp);
    },
  };
})();

// ───────── 21 · ENTENDER EL RIESGO ─────────
const risk = (() => {
  const t0 = q(65.7), K = { riesgo: q(67.05) };
  const cards = [[90, 690], [570, 690], [90, 960], [570, 960]], rt = [q(66.75), q(67.35), q(68.4), q(69.15)];
  const lens = [[t0, 540, 560], [rt[0] - 0.4, 300, 760], [rt[0], 380, 810], [rt[1] - 0.25, 380, 810], [rt[1], 860, 810], [rt[2] - 0.3, 860, 810], [rt[2], 380, 1080], [rt[3] - 0.25, 380, 1080], [rt[3], 860, 1080], [rt[3] + 3, 860, 1080]];
  const lensPos = (t) => {
    for (let i = 0; i < lens.length - 1; i++) {
      const [a, ax, ay] = lens[i], [b, bx, by] = lens[i + 1];
      if (t <= b) { const k = eio(clamp((t - a) / Math.max(0.01, b - a))); return [lerp(ax, bx, k), lerp(ay, by, k)]; }
    }
    return [860, 1080];
  };
  return {
    id: 'risk', t0, bg: 'bone', tr: 'iris',
    cues: [[t0, 'hit', 1], [K.riesgo, 'hit', 1], ...rt.map(a => [a, 'ding', 0.7]), [rt[0], 'tick', 1]],
    draw(c, t) {
      bg(c, C.bone);
      TL(c, 'ENTENDER', 70, 410, { sz: 220, col: C.ink, s: slam(t, t0, 0.22, 1.5) });
      TL(c, 'SU RIESGO', 70, 590, { sz: 170, col: C.acc, s: slam(t, K.riesgo, 0.22, 1.5) });
      cards.forEach(([x, y], i) => {
        const p = pop(t, t0 + 0.3 + i * 0.08, 0.35); if (!p) return;
        c.save(); c.translate(x + 210, y + 105); c.scale(p, p);
        c.fillStyle = C.ink; rrect(c, -210, -105, 420, 210, 22); c.fill();
        circle(c, -120, -20, 38, C.bone); c.fillStyle = C.bone; c.beginPath(); c.arc(-120, 90, 60, Math.PI, 0); c.fill();
        c.fillStyle = C.g2; c.fillRect(-40, -50, 100, 14); c.fillRect(-40, -20, 140, 14); c.fillRect(-40, 10, 70, 14);
        if (t >= rt[i]) {
          const hp = pop(t, rt[i], 0.35); c.save(); c.translate(130, 40); c.scale(hp, hp);
          c.fillStyle = C.acc; c.beginPath(); c.moveTo(0, -62); c.lineTo(58, 44); c.lineTo(-58, 44); c.closePath(); c.fill();
          T(c, '!', 0, 30, { sz: 80, al: 'c', col: C.ink }); c.restore();
        }
        c.restore();
      });
      const [lx, ly] = lensPos(t), lp = pop(t, t0 + 0.6, 0.3);
      if (lp) {
        c.save(); c.translate(t < rt[0] - 0.4 ? lx : lx + 40, ly + (t < rt[0] - 0.4 ? 0 : 20)); c.scale(lp, lp);
        c.strokeStyle = C.acc; c.lineWidth = 16; c.beginPath(); c.arc(0, 0, 92, 0, Math.PI * 2); c.stroke();
        line(c, 66, 66, 150, 150, C.acc, 26); c.restore();
      }
      if (t >= q(69.0)) TL(c, 'DE CADA EXPERTO', 70, 1350, { sz: 110, col: C.ink, s: slam(t, q(69.0), 0.2, 1.3) });
    },
  };
})();

// ───────── 22 · SISTEMA ─────────
const system = (() => {
  const t0 = q(69.9), K = { nodes: q(70.65), opt: q(71.7), all: q(72.3) };
  const pts = Array.from({ length: 6 }, (_, i) => [540 + Math.cos(i / 6 * Math.PI * 2 - 1.57) * 300, 840 + Math.sin(i / 6 * Math.PI * 2 - 1.57) * 300]);
  return {
    id: 'system', t0, bg: 'ink', tr: 'slab',
    cues: [[t0, 'boom', 1], ...pts.map((_, i) => [K.nodes + i * 0.1, 'tick', 0.6]), [K.opt, 'hit', 1.1], [K.all, 'hit', 1.2], [K.opt, 'ding', 0.8]],
    draw(c, t) {
      bg(c, C.ink);
      T(c, '03', 540, 1300, { sz: 1250, al: 'c', col: 'none', stroke: C.g2, lw: 5 });
      if (t < K.nodes + 0.3) T(c, 'FINALMENTE', 70, 360, { sz: 56, f: 'u', col: C.bone, tr: 16 });
      const lit = t >= K.opt, pul = lit ? 1 + 0.25 * Math.max(0, 1 - (t - K.opt) * 3) + 0.04 * Math.sin(t * 8) : 1;
      pts.forEach((p, i) => {
        const nx = pts[(i + 1) % 6], lp = eo3(prog(t, K.nodes + 0.3 + i * 0.05, K.nodes + 0.6 + i * 0.05));
        line(c, p[0], p[1], nx[0], nx[1], lit ? C.acc : C.g3, 6, lp); line(c, p[0], p[1], 540, 840, lit ? C.acc : C.g3, 4, lp);
      });
      pts.forEach((p, i) => { const pp = pop(t, K.nodes + i * 0.1, 0.3); if (pp) circle(c, p[0], p[1], 46 * pp * pul, lit ? C.acc : C.bone); });
      const cp = pop(t, K.nodes, 0.3); if (cp) circle(c, 540, 840, 70 * cp * pul, lit ? C.acc : C.bone);
      if (lit) TL(c, 'LO ÓPTIMO', 70, 450, { sz: 230, col: C.bone, s: slam(t, K.opt, 0.22, 1.5) });
      if (t >= K.all) TL(c, 'PARA TODO EL SISTEMA', 70, 1340, { sz: 120, col: C.acc, s: slam(t, K.all, 0.22, 1.4) });
    },
  };
})();

// ───────── 23 · PERFECTO → HUNDIR ─────────
const seesaw = (() => {
  const t0 = q(73.5), K = { perf: q(75.3), tilt: q(76.5), splash: q(77.1) };
  return {
    id: 'seesaw', t0, bg: 'bone', tr: 'push',
    cues: [[t0, 'hit', 0.9], [K.perf, 'ding', 1], [K.perf, 'hit', 0.9], [K.tilt, 'swoosh', 1], [K.splash, 'splash', 1.3]],
    draw(c, t) {
      bg(c, C.bone);
      if (t < K.perf) { TL(c, '¿TE HAS DADO', 70, 400, { sz: 200, col: C.ink, s: slam(t, t0, 0.22, 1.5) }); TL(c, 'CUENTA?', 70, 590, { sz: 200, col: C.acc, s: slam(t, q(74.4), 0.22, 1.5) }); }
      else if (t < K.tilt) TL(c, 'PERFECTO', 70, 480, { sz: 285, col: C.ink, s: slam(t, K.perf, 0.22, 1.5) });
      else TL(c, 'HUNDIR', 70, 480, { sz: 285, col: C.acc, s: slam(t, K.tilt, 0.22, 1.5) });
      const th = 0.3 * eio(prog(t, K.tilt, K.splash)) + (t > K.splash ? Math.sin((t - K.splash) * 14) * 0.02 * Math.exp(-(t - K.splash) * 3) : 0);
      const wy = 1215;
      // pivote
      c.fillStyle = C.ink; c.beginPath(); c.moveTo(540, 1120); c.lineTo(470, 1290); c.lineTo(610, 1290); c.closePath(); c.fill();
      c.save(); c.translate(540, 1120); c.rotate(th);
      c.fillStyle = C.ink; c.fillRect(-420, -14, 840, 28);
      // bloque A (perfecto)
      const ap = pop(t, t0 + 0.2, 0.35);
      c.save(); c.translate(-330, -14 - 75 * ap); c.scale(ap, ap); c.fillStyle = C.ink; c.fillRect(-75, -75, 150, 150);
      T(c, 'A', 0, 36, { sz: 120, al: 'c', col: C.bone }); c.restore();
      // bloque B
      const sink = Math.max(0, t - K.splash) * 140 * Math.min(1, (t - K.splash) * 2);
      c.save(); c.translate(330, -14 - 75 * ap + sink); c.scale(ap, ap); c.fillStyle = C.acc; c.fillRect(-75, -75, 150, 150);
      T(c, 'B', 0, 36, { sz: 120, al: 'c', col: C.ink }); c.restore();
      c.restore();
      if (t >= K.perf && t < K.tilt + 0.4) {
        const sx = 540 + Math.cos(th) * -330 - Math.sin(th) * (-14 - 75), sy = 1120 + Math.sin(th) * -330 + Math.cos(th) * (-14 - 75);
        spikes(c, sx, sy - 5, 100, 100 + 60 * pop(t, K.perf, 0.4), 12, C.acc, 8, t * 0.8);
        circle(c, sx, sy - 5, 140 * pop(t, K.perf, 0.4), null, C.acc, 5);
      }
      // agua
      c.fillStyle = C.ink; c.beginPath(); c.moveTo(0, 1400);
      for (let x = 0; x <= W; x += 20) c.lineTo(x, wy + Math.sin(x * 0.02 + t * 3) * 8);
      c.lineTo(W, 1400); c.closePath();
      if (t >= K.splash - 0.1) { c.globalAlpha = 1; } else c.globalAlpha = 0;
      c.fill(); c.globalAlpha = 1;
      if (t >= K.splash) for (let i = 0; i < 8; i++) {
        const u = (t - K.splash + i * 0.12) % 1; circle(c, 840 + (hash(i) - 0.5) * 160, wy + 40 - u * 260, 10 + hash(i + 9) * 12, null, C.acc, 4);
      }
    },
  };
})();

// ───────── 24 · REDUCIR INVENTARIOS ─────────
const inventory = (() => {
  const t0 = q(77.7), K = { cut: q(78.15), line: q(78.75), star: q(79.35) };
  const cellXY = (i) => [90 + (i % 3) * 180, 640 + Math.floor(i / 3) * 180];
  const gone = (i) => K.cut + (8 - i) * 0.15 * 0.75; // desaparecen de la última a la primera dejando 3
  return {
    id: 'inventory', t0, bg: 'ink', tr: 'cut',
    cues: [[t0, 'hit', 1], [K.cut, 'hit', 0.7], ...[8, 7, 6, 5, 4, 3].map(i => [gone(i), 'tick', 0.8]), [K.line, 'riser', 0.7], [K.star, 'ding', 1.1], [K.star, 'hit', 0.9]],
    draw(c, t) {
      bg(c, C.ink);
      TL(c, 'REDUCIR', 70, 410, { sz: 200, col: C.bone, s: slam(t, t0, 0.22, 1.5) });
      TL(c, 'INVENTARIOS', 70, 560, { sz: 140, col: C.acc, s: slam(t, K.cut, 0.2, 1.4) });
      for (let i = 0; i < 9; i++) {
        const [x, y] = cellXY(i), g = i >= 3 ? prog(t, gone(i), gone(i) + 0.25) : 0, p = pop(t, t0 + 0.15 + i * 0.03, 0.3) * (1 - eo3(g));
        if (p <= 0.01) continue;
        c.save(); c.translate(x + 75, y + 75); c.scale(p, p); c.rotate(g * 0.8); c.fillStyle = C.bone; c.fillRect(-75, -75, 150, 150);
        c.fillStyle = C.ink; c.fillRect(-75, -6, 150, 12); c.fillRect(-6, -75, 12, 150); c.restore();
      }
      // gráfica de finanzas
      line(c, 660, 1150, 660, 650, C.g3, 5); line(c, 660, 1150, 1000, 1150, C.g3, 5);
      const lp = eo3(prog(t, K.line, K.star));
      c.strokeStyle = C.acc; c.lineWidth = 16; c.lineJoin = 'round'; c.lineCap = 'round'; c.beginPath();
      const g = [[680, 1110], [760, 1040], [820, 1060], [900, 900], [980, 740]];
      g.forEach(([x, y], i) => { const k = Math.min(1, Math.max(0, lp * 4 - i)); if (i === 0) c.moveTo(x, y); else if (k > 0) { const [px, py] = g[i - 1]; c.lineTo(lerp(px, x, k), lerp(py, y, k)); } });
      c.stroke();
      if (t >= K.star) { const sp = pop(t, K.star, 0.4); star(c, 980, 740, 80 * sp, C.bone, t * 0.5); spikes(c, 980, 740, 90, 90 + 50 * sp, 12, C.acc, 7, t); }
      if (t >= K.star) TL(c, 'BRILLA FINANZAS', 70, 1340, { sz: 130, col: C.bone, s: slam(t, K.star, 0.2, 1.4) });
    },
  };
})();

// ───────── 25 · PARALIZADO ─────────
const freeze = (() => {
  const t0 = q(79.8), K = { uff: q(79.95), stop: q(81.15), stamp: q(82.2) };
  return {
    id: 'freeze', t0, bg: 'bone', tr: 'iris',
    cues: [[t0, 'whoosh', 0.8], [K.uff, 'hit', 0.8], [K.stop, 'thud', 1.4], [K.stop, 'crack', 0.8], [K.stamp, 'hit', 1.3]],
    draw(c, t) {
      bg(c, C.bone);
      const u = prog(t, t0, K.stop), ang = 14 * (1 - Math.pow(1 - u, 3));
      const jolt = t > K.stop ? Math.sin((t - K.stop) * 60) * 0.03 * Math.exp(-(t - K.stop) * 8) : 0;
      c.save(); c.translate(540, 760); c.rotate(ang + jolt); c.fillStyle = C.acc; c.beginPath();
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * Math.PI * 2, h = Math.PI / 12 * 0.55;
        [[a - h * 1.3, 250], [a - h * 0.7, 320], [a + h * 0.7, 320], [a + h * 1.3, 250]].forEach(([aa, r]) => c.lineTo(Math.cos(aa) * r, Math.sin(aa) * r));
      }
      c.closePath(); c.fill(); circle(c, 0, 0, 90, C.bone); c.restore();
      if (t >= K.stop) { const pp = pop(t, K.stop, 0.3); c.save(); c.translate(540, 760); c.scale(pp, pp); c.fillStyle = C.ink; c.fillRect(-52, -80, 38, 160); c.fillRect(14, -80, 38, 160); c.restore(); }
      if (t >= K.uff && t < K.stop) TL(c, 'UFF.', 650, 400, { sz: 150, col: C.ink, rot: 0.1, s: slam(t, K.uff, 0.2, 1.5) });
      if (t >= K.stamp) TL(c, 'PARALIZADA', 70, 1280, { sz: 225, col: C.ink, rot: -0.04, s: slam(t, K.stamp, 0.22, 1.8) });
      if (t >= K.stamp) T(c, 'TODA LA OPERACIÓN', 78, 1350, { sz: 48, f: 'u', col: C.acc, tr: 10 });
    },
  };
})();

// ───────── 26 · SIN SOLUCIONES MÁGICAS ─────────
const magic = (() => {
  const t0 = q(82.95), K = { nohay: q(83.55), sol: q(83.85), mag: q(84.45), strk: q(84.75) };
  return {
    id: 'magic', t0, bg: 'ink', tr: 'push',
    cues: [[t0, 'ding', 0.8], [K.nohay, 'hit', 1], [K.sol, 'hit', 0.9], [K.mag, 'crack', 1.2], [K.mag, 'hit', 1], [K.strk, 'swoosh', 1]],
    draw(c, t) {
      bg(c, C.ink);
      TL(c, 'NO HAY', 70, 400, { sz: 220, col: C.bone, s: slam(t, K.nohay, 0.2, 1.5) });
      TL(c, 'SOLUCIONES', 70, 610, { sz: 200, col: C.bone, s: slam(t, K.sol, 0.2, 1.5) });
      const s = slam(t, K.mag, 0.24, 1.8);
      if (s) { TL(c, 'MÁGICAS', 70, 900, { sz: 300, col: C.acc, s }); strike(c, 40, 810, 40 + tw(c, 'MÁGICAS', 300) + 50, eo5(prog(t, K.strk, K.strk + 0.2)), C.bone, 26, -0.03); }
      // varita
      const br = prog(t, K.mag, K.mag + 0.7), wp = pop(t, t0, 0.4);
      const half = (sd) => {
        c.save(); c.translate(540 + sd * -40 * 0, 1130); c.rotate(-0.6);
        const e = eo3(br); c.translate(sd * 120 * e, sd * -30 * e + e * e * 200 * (sd > 0 ? 1 : 0.6)); c.rotate(sd * 0.5 * e);
        c.fillStyle = C.bone; c.fillRect(sd > 0 ? 0 : -300, -18, 300, 36);
        c.fillStyle = C.ink; c.fillRect(sd > 0 ? 0 : -300, -18, sd > 0 ? 60 : 0, 36); c.restore();
      };
      c.save(); if (wp) { half(-1); half(1); } c.restore();
      if (br < 0.2) {
        const tipX = 540 + Math.cos(-0.6) * 300, tipY = 1130 + Math.sin(-0.6) * 300;
        star(c, tipX, tipY, 70 * wp, C.acc, t * 1.5, 4, 0.3);
        spikes(c, tipX, tipY, 90, 90 + 40 * Math.abs(Math.sin(t * 6)), 8, C.acc, 6, t);
      }
    },
  };
})();

// ───────── 27 · PRIORIDADES → PESO ÉTICO ─────────
const duty = (() => {
  const t0 = q(85.05), K = { def: q(85.95), peso: q(86.4), drop: q(87.0), etico: q(87.45) };
  const wd = [700, 600, 500, 380];
  return {
    id: 'duty', t0, bg: 'bone', tr: 'slab',
    cues: [[t0, 'hit', 0.8], [K.def, 'swoosh', 1], [K.def + 0.2, 'hit', 0.9], [K.peso, 'whoosh', 0.8], [K.drop, 'thud', 1.5], [K.drop, 'hit', 1.2], [K.etico, 'hit', 1]],
    draw(c, t) {
      bg(c, C.bone);
      if (t < K.peso + 0.2) {
        const out = ei3(prog(t, K.peso, K.peso + 0.2)) * 1200;
        TL(c, 'DEFINE PRIORIDADES', 70, 400 - out * 0.3, { sz: 130, col: C.ink, s: slam(t, t0, 0.22, 1.4) });
        const mv = eio(prog(t, K.def, K.def + 0.4));
        wd.forEach((w, i) => {
          let slot = i; if (i === 3) slot = 3 * (1 - mv); else if (mv > 0) slot = i + mv;
          const y = 520 + slot * 150, p = pop(t, t0 + 0.1 + i * 0.07, 0.3);
          c.save(); c.translate(0, out); c.fillStyle = i === 3 ? C.acc : C.ink; c.fillRect(160, y, w * p, 100);
          T(c, String(Math.round(slot) + 1), 120, y + 78, { sz: 90, al: 'r', col: C.ink }); c.restore();
        });
      }
      if (t >= K.peso) {
        const dp = ei3(prog(t, K.drop - 0.45, K.drop)), cy = lerp(-250, 1010, dp);
        const sq = t >= K.drop ? 1 - 0.55 * eo3(prog(t, K.drop, K.drop + 0.12)) + (t > K.drop + 0.12 ? 0.05 * Math.sin((t - K.drop) * 20) * Math.exp(-(t - K.drop) * 4) : 0) : 1;
        c.save(); c.translate(540, 1130); c.scale(1 / sq * 0.9 + 0.1, sq); circle(c, 0, -70, 70, C.acc); c.restore();
        c.fillStyle = C.ink; c.fillRect(360, cy - 300 + (t >= K.drop ? 70 * (1 - sq) : 0), 360, 360);
        TL(c, 'PESO', 70, 390, { sz: 200, col: C.ink, s: slam(t, K.drop, 0.2, 1.6) });
        if (t >= K.etico) TL(c, 'ÉTICO', 70, 580, { sz: 200, col: C.acc, s: slam(t, K.etico, 0.2, 1.6) });
      }
    },
  };
})();

// ───────── 28 · HIROSHIMA ─────────
const hiro = (() => {
  const t0 = q(88.05), K = { cargo: q(89.1), hiro: q(90.0) };
  return {
    id: 'hiro', t0, bg: 'void', tr: 'cut', cap: 'bone',
    cues: [[t0, 'rumble', 1], [K.cargo, 'thud', 0.8]],
    draw(c, t) {
      bg(c, C.void);
      T(c, 'TAL COMO OPPENHEIMER', 70, 420, { sz: 52, f: 'u', col: C.bone, tr: 12, a: eo3(prog(t, t0, t0 + 0.5)) });
      if (t >= K.cargo) TL(c, 'CARGÓ MORALMENTE', 70, 610, { sz: 140, col: C.g3, s: slam(t, K.cargo, 0.5, 1.1) });
      if (t >= K.hiro) chars(c, 'HIROSHIMA', 70, 930, t, K.hiro, { sz: 270, col: C.bone, st: 0.09, dy: -80, dur: 0.5, fade: true });
      // el peso permanece
      c.fillStyle = C.ink2; c.fillRect(400, 1020, 280, 280); c.strokeStyle = C.g2; c.lineWidth = 4; c.strokeRect(400, 1020, 280, 280);
      circle(c, 540, 1315, 24 + 0, C.acc);
    },
  };
})();

// ───────── 29 · UN LÍDER EXTRAORDINARIO ─────────
const leader = (() => {
  const t0 = q(91.5), K = { lid: q(92.55), ext: q(93.15) };
  return {
    id: 'leader', t0, bg: 'bone', tr: 'slab',
    cues: [[t0, 'hit', 1.2], [K.lid, 'hit', 1], [K.ext, 'hit', 1.1], [K.ext, 'ding', 1]],
    draw(c, t) {
      bg(c, C.bone);
      if (t < K.lid) {
        T(c, 'EN', 70, 380, { sz: 56, f: 'u', col: C.ink, tr: 16 });
        TL(c, 'DEFINITIVA', 70, 700, { sz: 250, col: C.ink, s: slam(t, t0, 0.25, 1.6) });
      } else {
        TL(c, 'UN LÍDER', 70, 640, { sz: 330, col: C.ink, s: slam(t, K.lid, 0.22, 1.6) });
        if (t >= K.ext) {
          const sp = pop(t, K.ext, 0.5);
          star(c, 540, 1110, 290 * sp, C.acc, t * 0.35, 8, 0.6);
          TL(c, 'EXTRAORDINARIO', 70, 840, { sz: 160, col: C.ink, s: slam(t, K.ext, 0.22, 1.5) });
        }
      }
    },
  };
})();

// ───────── 30 · NO NECESITA TODAS LAS RESPUESTAS ─────────
const answers = (() => {
  const t0 = q(93.9), K = { tener: q(94.5), todas: q(94.95), resp: q(95.25) };
  const chips = Array.from({ length: 12 }, (_, i) => ({
    x: 100 + (i % 4) * 230, y: 880 + Math.floor(i / 4) * 130, vx: (hash(i + 77) - 0.5) * 2600, vy: -600 - hash(i + 99) * 900, l: 'ABCDEFGHIJKL'[i],
  }));
  return {
    id: 'answers', t0, bg: 'ink', tr: 'iris',
    cues: [[t0, 'hit', 1], [K.tener, 'hit', 0.8], [K.resp, 'hit', 0.8], ...[0, 1, 2, 3].map(i => [t0 + 0.3 + i * 0.12, 'tick', 0.5]), [K.todas, 'whoosh', 1.2], [K.todas, 'crack', 0.9]],
    draw(c, t) {
      bg(c, C.ink);
      TL(c, 'NO NECESITA', 70, 410, { sz: 170, col: C.bone, s: slam(t, t0, 0.22, 1.5) });
      TL(c, 'TENER TODAS', 70, 580, { sz: 170, col: C.bone, s: slam(t, K.tener, 0.22, 1.5) });
      TL(c, 'LAS RESPUESTAS', 70, 750, { sz: 170, col: C.acc, s: slam(t, K.resp, 0.22, 1.5) });
      chips.forEach((ch, i) => {
        const p = pop(t, t0 + 0.3 + i * 0.04, 0.3); if (!p) return;
        const d = Math.max(0, t - K.todas - i * 0.015);
        const x = ch.x + ch.vx * d, y = ch.y + ch.vy * d + 2600 * d * d;
        c.save(); c.translate(x + 100, y + 50); c.rotate(d * (hash(i) - 0.5) * 12); c.scale(p, p);
        c.fillStyle = C.bone; rrect(c, -100, -50, 200, 100, 16); c.fill(); T(c, ch.l, 0, 34, { sz: 90, al: 'c', col: C.ink }); c.restore();
      });
      if (t >= K.todas + 0.5) T(c, '?', 540, 1250, { sz: 520, al: 'c', col: C.acc, s: pop(t, K.todas + 0.5, 0.4) });
    },
  };
})();

// ───────── 31 · VALENTÍA → PREGUNTAS CORRECTAS ─────────
const brave = (() => {
  const t0 = q(96.0), K = { val: q(96.3), preg: q(97.35), corr: q(97.8) };
  return {
    id: 'brave', t0, bg: 'bone', tr: 'push',
    cues: [[t0, 'swoosh', 0.7], [K.val, 'hit', 1.3], [K.preg, 'hit', 1.1], [K.corr, 'ding', 1.2]],
    draw(c, t) {
      bg(c, C.bone);
      T(c, 'SINO LA', 70, 400, { sz: 56, f: 'u', col: C.ink, tr: 16 });
      const s = slam(t, K.val, 0.25, 1.7);
      if (s) { spikes(c, 540, 560, 440, 440 + 120 * Math.min(1, (t - K.val) * 3), 24, C.acc, 8, 0, 1); TL(c, 'VALENTÍA', 70, 700, { sz: 300, col: C.ink, s }); }
      if (t >= K.preg) {
        const pp = slam(t, K.preg, 0.25, 2);
        T(c, '?', 360, 1300, { sz: 700, al: 'c', col: C.acc, s: pp });
      }
      if (t >= K.corr) {
        circle(c, 780, 1050, 150 * eo3(prog(t, K.corr, K.corr + 0.25)), C.ink);
        check(c, 780, 1050, 200, C.bone, 28, eo3(prog(t, K.corr + 0.1, K.corr + 0.45)));
      }
    },
  };
})();

// ───────── 32 · UNIR EL TALENTO / DAR LA CARA ─────────
const unite = (() => {
  const t0 = q(98.4), K = { join: q(98.7), face: q(99.75) };
  return {
    id: 'unite', t0, bg: 'ink', tr: 'cut',
    cues: [[t0, 'hit', 1], [K.join, 'riser', 0.8], [q(99.45), 'hit', 1], [K.face, 'hit', 1.3], [K.face, 'ding', 1]],
    draw(c, t) {
      bg(c, C.ink);
      const mv = eio(prog(t, K.join, K.face - 0.3));
      const d = lerp(300, 0, mv);
      if (t < K.face) {
        circle(c, 540 - d, 720, 230, C.bone);
        circle(c, 540 + d, 720, 230, C.acc);
        c.save(); c.beginPath(); c.arc(540 - d, 720, 230, 0, Math.PI * 2); c.clip();
        c.beginPath(); c.arc(540 + d, 720, 230, 0, Math.PI * 2); c.fillStyle = C.ink; c.fill(); c.restore();
        TL(c, 'UNIR EL TALENTO', 70, 1170, { sz: 140, col: C.bone, s: slam(t, t0, 0.22, 1.4) });
      } else {
        const fp = pop(t, K.face, 0.4);
        c.save(); c.translate(540, 720); c.scale(fp, fp); circle(c, 0, 0, 230, C.bone);
        circle(c, -85, -40, 26, C.ink); circle(c, 85, -40, 26, C.ink);
        c.strokeStyle = C.ink; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.arc(0, 30, 90, 0.25, Math.PI - 0.25); c.stroke(); c.restore();
        TL(c, 'DAR LA CARA', 70, 1170, { sz: 200, col: C.acc, s: slam(t, K.face, 0.22, 1.5) });
      }
    },
  };
})();

// ───────── 33 · CIERRE ─────────
const endCard = (() => {
  const t0 = q(100.65);
  return {
    id: 'end', t0, bg: 'ink', tr: 'slab', cap: 'none',
    cues: [[t0, 'hit', 1.5], [t0, 'chord', 1], [q(100.95), 'hit', 0.8]],
    draw(c, t) {
      bg(c, C.ink);
      chars(c, 'LIDERAR', 70, 700, t, t0, { sz: 330, col: C.bone, st: 0.04, dy: -300 });
      chars(c, 'EL CONJUNTO', 70, 940, t, q(100.95), { sz: 215, col: C.bone, st: 0.03, dy: -300 });
      line(c, 70, 1020, 70 + 560 * 1, 1020, C.acc, 18, eo5(prog(t, q(101.4), q(101.7))));
    },
  };
})();

export const SCENES_B = [oppen, nobel, eye, risk, system, seesaw, inventory, freeze, magic, duty, hiro, leader, answers, brave, unite, endCard];
