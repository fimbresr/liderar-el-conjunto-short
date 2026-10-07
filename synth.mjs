// Score + SFX sintetizados. Todo cae en la rejilla de 100 BPM (semicorchea = 0.15 s). Salida: out/music.f32, out/sfx.f32, beats.json
import fs from 'fs';
import { CUES, TOTAL } from './scenes.mjs';
import { mulberry32 } from './lib.mjs';

const SR = 48000, BPM = 100, BEAT = 60 / BPM, SIX = BEAT / 4, BAR = BEAT * 4;
const N = Math.ceil((TOTAL + 1) * SR);
const rnd = mulberry32(2026);
const mk = () => [new Float32Array(N), new Float32Array(N)];
const [mL, mR] = mk(), [sL, sR] = mk(), kick = new Float32Array(N);
const TAU = Math.PI * 2;

const lpA = fc => 1 - Math.exp(-TAU * fc / SR);
function lowpass(x, fc) { const a = lpA(fc); let y = 0; for (let i = 0; i < x.length; i++) { y += a * (x[i] - y); x[i] = y; } return x; }
function highpass(x, fc) { const a = lpA(fc); let y = 0; for (let i = 0; i < x.length; i++) { y += a * (x[i] - y); x[i] = x[i] - y; } return x; }
function bandpass(x, fcFn, Q = 1.2) {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const w = TAU * fcFn(i / x.length) / SR, al = Math.sin(w) / (2 * Q), cs = Math.cos(w);
    const b0 = al, b2 = -al, a0 = 1 + al, a1 = -2 * cs, a2 = 1 - al;
    const y = (b0 * x[i] + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = y; x[i] = y;
  }
  return x;
}
const noise = n => Float32Array.from({ length: n }, () => rnd() * 2 - 1);
const gen = (dur, f) => Float32Array.from({ length: Math.floor(dur * SR) }, (_, i) => f(i / SR, i));
function put(L, R, t, x, g = 1, pan = 0) {
  const s0 = Math.round(t * SR), l = Math.cos((pan + 1) * Math.PI / 4) * g, r = Math.sin((pan + 1) * Math.PI / 4) * g;
  for (let i = 0; i < x.length && s0 + i < N; i++) { if (s0 + i < 0) continue; L[s0 + i] += x[i] * l; R[s0 + i] += x[i] * r; }
}

// ── instrumentos ──
const kickS = () => { let ph = 0; return gen(0.38, (t) => { ph += TAU * (46 + 70 * Math.exp(-t * 30)) / SR; return Math.sin(ph) * Math.exp(-t * 8.5) + (t < 0.004 ? (rnd() - .5) * .5 : 0); }); };
const bassS = (f, d) => { let ph = 0; const x = gen(d, (t) => { ph += f / SR; return (Math.sin(TAU * ph) * 0.8 + (2 * (ph % 1) - 1) * 0.35) * Math.min(1, t * 200) * Math.exp(-t * 3.2); }); return lowpass(x, 260); };
const pluckS = (f) => { let p = 0; return lowpass(gen(0.3, (t) => { p += f / SR; const tri = 2 * Math.abs(2 * (p % 1) - 1) - 1; return (tri * 0.8 + Math.sin(TAU * p * 2) * 0.25) * Math.exp(-t * 13) * Math.min(1, t * 400); }), 3800); };
const hatS = () => highpass(gen(0.09, (t) => (rnd() * 2 - 1) * Math.exp(-t * 85)), 5500);
const clapS = () => bandpass(gen(0.22, (t) => (rnd() * 2 - 1) * (Math.exp(-t * 26) + (t > 0.012 && t < 0.03 ? 0.6 : 0) + (t > 0.03 && t < 0.045 ? 0.5 : 0))), () => 1700, 0.9);
const padS = (freqs, d) => {
  const x = new Float32Array(Math.floor(d * SR));
  freqs.forEach(f => [-6, 0, 6].forEach(c => { let p = rnd(); const ff = f * Math.pow(2, c / 1200); for (let i = 0; i < x.length; i++) { p += ff / SR; x[i] += (2 * (p % 1) - 1) * 0.05; } }));
  lowpass(x, 1100); lowpass(x, 1100);
  for (let i = 0; i < x.length; i++) { const u = i / x.length; x[i] *= Math.sin(Math.PI * Math.min(1, u * 1.15)) ** 0.7; }
  return x;
};

const CH = [ // Am F C G
  { root: 55.0, tones: [220, 261.63, 329.63], arp: [440, 523.25, 659.25, 523.25] },
  { root: 43.65, tones: [174.61, 220, 261.63], arp: [349.23, 440, 523.25, 440] },
  { root: 65.41, tones: [261.63, 329.63, 392], arp: [523.25, 659.25, 784, 659.25] },
  { root: 49.0, tones: [196, 246.94, 293.66], arp: [392, 493.88, 587.33, 493.88] },
];
// capas por sección (segundos): [desde, hasta, {kick, hat, clap, bass, arp, pad}]
const SEC = [
  [0, 2.55, { kick: 1, hat: 0, clap: 0, bass: 0, arp: 0, pad: 0 }],
  [2.55, 18.75, { kick: 1, hat: 1, clap: 0, bass: 1, arp: 0, pad: 1 }],
  [18.75, 43.35, { kick: 1, hat: 1, clap: 1, bass: 1, arp: 1, pad: 1 }],
  [43.35, 69.9, { kick: .7, hat: 1, clap: 0, bass: 2, arp: 1, pad: 1 }],
  [69.9, 88.05, { kick: 1, hat: 1, clap: 1, bass: 2, arp: 1, pad: 1 }],
  [88.05, 91.5, { kick: 0, hat: 0, clap: 0, bass: 0, arp: 0, pad: 2 }],
  [91.5, 100.65, { kick: 1, hat: 1, clap: 1, bass: 2, arp: 1, pad: 1 }],
  [100.65, 103.2, { kick: 0, hat: 0, clap: 0, bass: 0, arp: 0, pad: 1 }],
];
const secAt = t => SEC.find(([a, b]) => t >= a && t < b)?.[2];

for (let bar = 0; bar * BAR < TOTAL; bar++) {
  const tb = bar * BAR, ch = CH[bar % 4], s = secAt(tb); if (!s) continue;
  if (s.pad) put(mL, mR, tb, padS(s.pad === 2 ? [55, 82.4, 110] : ch.tones, BAR + 0.3), s.pad === 2 ? 1.6 : 1, 0);
  for (let st = 0; st < 16; st++) {
    const t = tb + st * SIX, u = secAt(t); if (!u || t >= TOTAL) continue;
    if (st % 4 === 0 && u.kick) { const k = kickS(); put(mL, mR, t, k, 0.55 * u.kick, 0); put(kick, kick, t, k, 1, 0); }
    if (u.hat && st % 4 === 2) put(mL, mR, t, hatS(), 0.12, 0.3);
    if (u.hat && st % 2 === 1 && st % 4 !== 3 && u.bass === 2) put(mL, mR, t, hatS(), 0.05, -0.3);
    if (u.clap && (st === 4 || st === 12)) put(mL, mR, t, clapS(), 0.16, 0);
    if (u.bass === 1 && st % 8 === 0) put(mL, mR, t, bassS(ch.root, 1.0), 0.5, 0);
    if (u.bass === 2 && st % 2 === 0) put(mL, mR, t, bassS(st % 8 === 6 ? ch.root * 2 : ch.root, 0.28), 0.42, 0);
    if (u.arp && st % 2 === 0) put(mL, mR, t, pluckS(ch.arp[(st / 2 | 0) % 4]), 0.16, ((st / 2) % 2) ? 0.5 : -0.5);
  }
}

// ── SFX ──
const sweep = (d, f0, f1, amp) => bandpass(noise(Math.floor(d * SR)).map((v, i, a) => v * amp(i / a.length)), u => f0 * Math.pow(f1 / f0, u), 1.6);
const SFX = {
  hit: () => { let ph = 0; const lo = gen(0.5, (t) => { ph += TAU * (38 + 120 * Math.exp(-t * 22)) / SR; return Math.sin(ph) * Math.exp(-t * 7); });
    const n = lowpass(gen(0.14, (t) => (rnd() * 2 - 1) * Math.exp(-t * 38)), 2600); return [lo, 0.9, n, 0.5]; },
  boom: () => { let ph = 0; const lo = gen(1.1, (t) => { ph += TAU * (30 + 70 * Math.exp(-t * 12)) / SR; return Math.sin(ph) * Math.exp(-t * 3.2); }); return [lo, 1.0, lowpass(gen(0.5, (t) => (rnd() * 2 - 1) * Math.exp(-t * 9)), 900), 0.5]; },
  thud: () => { let ph = 0; return [gen(0.6, (t) => { ph += TAU * (55 + 40 * Math.exp(-t * 30)) / SR; return Math.sin(ph) * Math.exp(-t * 9); }), 1.0]; },
  stamp: () => [lowpass(gen(0.2, (t) => (rnd() * 2 - 1) * Math.exp(-t * 28)), 1800), 0.7, gen(0.25, (t) => Math.sin(TAU * 70 * t) * Math.exp(-t * 14)), 0.7],
  tick: () => [highpass(gen(0.03, (t) => (rnd() * 2 - 1) * Math.exp(-t * 160) + Math.sin(TAU * 2400 * t) * Math.exp(-t * 200)), 1200), 0.5],
  snap: () => [gen(0.09, (t) => Math.sin(TAU * 820 * t) * Math.exp(-t * 70) + (rnd() * 2 - 1) * Math.exp(-t * 400) * 0.7), 0.6],
  pop: () => { let ph = 0; return [gen(0.12, (t) => { ph += TAU * (320 + 900 * Math.min(1, t * 14)) / SR; return Math.sin(ph) * Math.exp(-t * 30); }), 0.6]; },
  ding: () => [gen(1.4, (t) => (Math.sin(TAU * 1318.5 * t) * 0.6 + Math.sin(TAU * 1975.5 * t) * 0.3 + Math.sin(TAU * 2637 * t) * 0.15) * Math.exp(-t * 3.4)), 0.35],
  bounce: () => { let ph = 0; return [gen(0.4, (t) => { ph += TAU * (220 * Math.exp(-t * 6) + 60) / SR; return Math.sin(ph) * Math.exp(-t * 7); }), 0.8]; },
  crack: () => [highpass(gen(0.25, (t) => (rnd() * 2 - 1) * (Math.exp(-t * 60) + Math.exp(-t * 14) * 0.2 * (rnd() > 0.7 ? 1 : 0.2))), 1400), 0.7, gen(0.2, (t) => Math.sin(TAU * 60 * t) * Math.exp(-t * 20)), 0.6],
  trap: () => [gen(0.7, (t) => (Math.sin(TAU * 410 * t) * 0.5 + Math.sin(TAU * 655 * t) * 0.35 + Math.sin(TAU * 1130 * t) * 0.2) * Math.exp(-t * 7)), 0.5, highpass(gen(0.1, (t) => (rnd() * 2 - 1) * Math.exp(-t * 50)), 2000), 0.6, gen(0.4, (t) => Math.sin(TAU * 55 * t) * Math.exp(-t * 10)), 0.8],
  splash: () => [sweep(0.7, 2200, 500, u => Math.exp(-u * 5)), 0.9],
  swoosh: () => [sweep(0.4, 500, 5200, u => Math.sin(Math.PI * u) ** 1.5), 0.9],
  whoosh: () => [sweep(0.6, 300, 4200, u => Math.sin(Math.PI * u) ** 1.3), 1.0],
  riser: () => [sweep(0.9, 300, 6500, u => u * u), 0.8],
  swell: () => [lowpass(padS([220, 329.63, 440], 0.9), 2000), 6],
  rumble: () => [lowpass(gen(3.4, (t) => (rnd() * 2 - 1) * Math.sin(Math.PI * Math.min(1, t / 3.4)) ** 1.5), 140), 5.0],
  chord: () => [gen(2.6, (t) => [261.63, 329.63, 392, 523.25].reduce((a, f) => a + Math.sin(TAU * f * t) * Math.exp(-t * 1.8) + Math.sin(TAU * f * 2 * t) * Math.exp(-t * 3) * 0.25, 0) * 0.25), 0.9],
};
const PRE = { whoosh: 0.35, swoosh: 0.28, riser: 0.9, rumble: 0.0 }; // empiezan antes para terminar en la marca
const r2 = mulberry32(77);
for (const c of CUES) {
  const mk2 = SFX[c.type]; if (!mk2) { console.warn('sin SFX:', c.type); continue; }
  const parts = mk2(), pan = (r2() - .5) * 0.5;
  for (let i = 0; i < parts.length; i += 2) put(sL, sR, c.t - (PRE[c.type] ?? 0), parts[i], parts[i + 1] * c.g * 0.55, pan);
}
// reverb corta sobre SFX
for (const B of [sL, sR]) { const d = Math.round(0.083 * SR), d2 = Math.round(0.127 * SR); for (let i = Math.max(d, d2); i < N; i++) B[i] += B[i - d] * 0.22 + B[i - d2] * 0.14; }

// ── beats.json: rejilla medida sobre el kick renderizado ──
const env = new Float32Array(Math.floor(N / 48)); for (let i = 0; i < env.length; i++) { let m = 0; for (let j = 0; j < 48; j++) m = Math.max(m, Math.abs(kick[i * 48 + j])); env[i] = m; }
const on = []; let armed = true;
for (let i = 0; i < env.length; i++) { if (env[i] > 0.15 && armed) { on.push(i / 1000); armed = false; } if (env[i] < 0.02) armed = true; }
const dev = on.map(t => Math.abs(t - Math.round(t / BEAT) * BEAT));
fs.writeFileSync('beats.json', JSON.stringify({ bpm: BPM, beat: BEAT, sixteenth: SIX, measuredKickOnsets: on, maxDeviationMs: Math.round(Math.max(...dev) * 1000), grid: Array.from({ length: Math.floor(TOTAL / BEAT) }, (_, i) => +(i * BEAT).toFixed(3)) }));
console.log('kick onsets', on.length, 'max desv ms', Math.round(Math.max(...dev) * 1000));

const wr = (L, R, f) => { const b = Buffer.alloc(N * 8); for (let i = 0; i < N; i++) { b.writeFloatLE(L[i], i * 8); b.writeFloatLE(R[i], i * 8 + 4); } fs.writeFileSync(f, b); };
fs.mkdirSync('out', { recursive: true }); wr(mL, mR, 'out/music.f32'); wr(sL, sR, 'out/sfx.f32');
const pk = a => a.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
console.log('picos music', pk(mL).toFixed(2), 'sfx', pk(sL).toFixed(2));
