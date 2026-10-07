# Liderar el conjunto — short 9:16

Short vertical (1080×1920, 1:43) de motion graphics sobre el ensayo *Liderar el conjunto*: el mejor especialista no tiene que ser el jefe.

▶ **Video:** [liderar-el-conjunto-short.mp4](liderar-el-conjunto-short.mp4)

## Cómo está hecho
- Cada cuadro es función pura del tiempo (`window.seek(t)`), dibujado en canvas.
- Score y SFX sintetizados en código a 100 BPM (`synth.mjs`, rejilla en `beats.json`); loudness −14 LUFS.
- Tiempos por palabra con Parakeet (`transcript.json` → `prep.mjs` → `words.mjs`).

## Re-renderizar
```bash
npm install
node synth.mjs && node mix.mjs   # audio (requiere el audio de narración y ffmpeg)
node render.mjs                  # out/video.mp4 (Chromium headless de Playwright + ffmpeg)
```
