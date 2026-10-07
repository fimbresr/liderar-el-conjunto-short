// transcript.json (Parakeet) -> words.mjs con correcciones al texto original del clipping
import fs from 'fs';
const raw = JSON.parse(fs.readFileSync('transcript.json', 'utf8'));
const src = Array.isArray(raw) ? raw : raw.words ?? raw.segments?.flatMap(s => s.words) ?? raw;
let w = src.map(x => ({ t: x.text ?? x.word, s: x.start, e: x.end }));
const out = [];
for (let i = 0; i < w.length; i++) {
  const x = w[i];
  if (x.t === 'Piénos') {
    const m = (x.s + x.e) / 2;
    out.push({ t: 'Piénsalo', s: x.s, e: m }, { t: 'un', s: m, e: x.e });
  } else if (x.t === 'Rigosaki.') {
    const m = (x.s + x.e) / 2;
    out.push({ t: 'Arrigo', s: x.s, e: m }, { t: 'Sacchi.', s: m, e: x.e });
  } else if (x.t === 'René' || x.t === 'Fimbres.' || (x.t === 'de' && w[i + 1]?.t === 'René')) continue;
  else if (x.t === 'Ace') out.push({ ...x, t: 'AC' });
  else if (x.t === 'si,') out.push({ ...x, t: 'si' });
  else if (x.t === 'bueno') continue;
  else if (x.t === 'sabe') out.push({ ...x, t: 'sabes' });
  else if (x.t === 'pero' && w[i + 1]?.t === 'de') {
    out.push(x, { t: 'uff.', s: x.e + 0.03, e: w[i + 1].s - 0.05 });
  } else out.push(x);
}
fs.writeFileSync('words.mjs', 'export const WORDS = ' + JSON.stringify(out) + ';\n');
console.log(out.length, 'palabras');
