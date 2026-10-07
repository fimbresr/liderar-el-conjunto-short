// voz + score (con ducking por sidechain) + sfx -> out/audio.m4a a -14 LUFS (loudnorm de dos pasadas)
import { execFileSync, spawnSync } from 'child_process';
const V = '../Cómo_liderar_a_expertos_sin_serlo.m4a';
const inputs = ['-i', V, '-f', 'f32le', '-ar', '48000', '-ac', '2', '-i', 'out/music.f32', '-f', 'f32le', '-ar', '48000', '-ac', '2', '-i', 'out/sfx.f32'];
const base = '[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,volume=enable=\'between(t,3.74,5.22)\':volume=0,asplit=2[v1][v2];' +
  '[1:a]volume=0.55[m];[m][v1]sidechaincompress=threshold=0.02:ratio=10:attack=8:release=350:makeup=1[md];' +
  '[2:a]volume=0.5[fx];[v2]volume=1.0[vo];[md][fx][vo]amix=inputs=3:normalize=0:duration=longest,apad=whole_dur=103.2,atrim=0:103.2';
const run = (f, extra = []) => execFileSync('ffmpeg', ['-hide_banner', '-nostats', '-y', ...inputs, '-filter_complex', f, ...extra], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const pr = spawnSync('ffmpeg', ['-hide_banner', '-nostats', ...inputs, '-filter_complex', base + ',loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], { encoding: 'utf8' });
const txt = pr.stderr ?? '';
if (pr.status !== 0) { console.error(txt.slice(-2000)); process.exit(1); }
let m; try { m = JSON.parse(txt.slice(txt.lastIndexOf('{'), txt.lastIndexOf('}') + 1)); } catch (e) { console.error('loudnorm: JSON no parseable:', e.message, '\n' + txt.slice(-1000)); process.exit(1); }
const ln = `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
run(base + ',' + ln, ['-c:a', 'aac', '-b:a', '192k', '-ar', '48000', 'out/audio.m4a']);
console.log('medido antes:', m.input_i, 'LUFS, TP', m.input_tp);
