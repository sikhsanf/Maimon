
/* =====================================================================
   MUSIK PROSEDURAL (WebAudio) — tiap kota punya tema sendiri, battle punya tema sendiri.
   Lapisan: pad, bass, arpeggio, melodi (disusun dari motif A/B + variasi), drum/kendang/gong,
   reverb + delay + kompresor. Semua dibuat dari kode, tanpa file audio.
   ===================================================================== */
const Music = (() => {
  let lite = 0; // 0 penuh, 1 hemat (tanpa arp/perkusi halus), 2 sangat hemat (tanpa pad atas)
  const SC = { maj: [0, 2, 4, 5, 7, 9, 11], min: [0, 2, 3, 5, 7, 8, 10], dor: [0, 2, 3, 5, 7, 9, 10], mix: [0, 2, 4, 5, 7, 9, 10], phr: [0, 1, 4, 5, 7, 8, 10], pent: [0, 2, 4, 7, 9], minp: [0, 3, 5, 7, 10], slen: [0, 2, 5, 7, 9], pel: [0, 1, 3, 7, 8] };
  const CH = { maj: [0, 4, 7, 12], min: [0, 3, 7, 12], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11], dom7: [0, 4, 7, 10], sus4: [0, 5, 7, 12], sus2: [0, 2, 7, 12], add9: [0, 4, 7, 14], m9: [0, 3, 7, 14], dim: [0, 3, 6, 12], pw: [0, 7, 12, 19] };
  const STR = { X: 1, x: 0.65, o: 0.3 };
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const FORM = ['A', 'a', 'B', 'c', 'A', 'b', 'a', 'e'];

  /* ---------------- TEMA ----------------
     bpm, swing, spb (langkah per bar), root (midi), sc (tangga nada), ch (akor per bar: [offset, tipe]),
     bass/arp: pola per langkah (r=root 5=kuint 8=oktaf 3=terts, digit=nada akor, .=diam)
     dr: pola drum per instrumen (X x o)  lead/lead2: instrumen  A,B: motif [langkah,derajat,panjang] 2 bar */
  const TH = {
    pick: { bpm: 112, swing: 0.06, spb: 16, root: 48, sc: 'maj', lead: 'bell', lead2: 'pluck', bassI: 'sub', padV: 1, arpI: 'pluck',
      ch: [[0, 'add9'], [7, 'maj'], [9, 'm7'], [5, 'maj7']], bass: 'r.....r.5.....8.', arp: '0.2.4.2.0.2.4.2.',
      dr: { k: 'X.......x.......', s: '....x.......x...', h: 'x.x.x.x.x.x.x.xo', p: '..o...o...o...o.' },
      A: [[0, 4, 3], [3, 5, 3], [6, 7, 6], [16, 7, 3], [19, 5, 3], [22, 4, 8]], B: [[0, 5, 3], [3, 7, 3], [6, 9, 6], [16, 8, 3], [19, 7, 3], [22, 5, 8]] },
    intro: { bpm: 124, swing: 0, spb: 16, root: 50, sc: 'min', lead: 'brass', lead2: 'bell', bassI: 'pluck', padV: 1.3, arpI: 'pluck', arpOct: 1, gong: true,
      ch: [[0, 'min'], [8, 'maj'], [3, 'maj'], [10, 'maj'], [0, 'min'], [8, 'maj'], [5, 'min'], [7, 'dom7']],
      bass: 'r.r.r.r.r.r.r.8.', arp: '0.1.2.3.2.1.2.1.',
      dr: { k: 'X...X...X...X.x.', s: '....X.......X..x', h: 'x.x.x.x.x.x.x.xx', d: 'x..x..x.x..x.x..', c: '........x.......' },
      A: [[0, 7, 3], [4, 7, 1], [6, 9, 2], [8, 11, 6], [16, 10, 3], [20, 9, 1], [22, 7, 2], [24, 9, 8]], B: [[0, 11, 3], [4, 11, 1], [6, 12, 2], [8, 13, 6], [16, 12, 3], [20, 11, 1], [22, 9, 2], [24, 11, 8]] },
    depok: { bpm: 100, swing: 0.15, spb: 16, root: 48, sc: 'maj', lead: 'pluck', lead2: 'flute', bassI: 'sub', padV: 0, arpI: 'pluck', gong: false,
      ch: [[0, 'maj'], [5, 'maj'], [7, 'dom7'], [0, 'maj'], [9, 'm7'], [2, 'm7'], [7, 'dom7'], [0, 'maj']],
      bass: 'r...5...r...5...', arp: '.0.1.2.1.0.1.2.1', dr: { w: 'x...x...x...x...', h: '..o...o...o...o.' },
      A: [[0, 4, 2], [2, 5, 2], [4, 4, 4], [8, 2, 2], [10, 3, 2], [12, 2, 4], [16, 4, 2], [18, 5, 2], [20, 7, 4], [24, 5, 2], [26, 4, 2], [28, 2, 4]], B: [[0, 7, 2], [2, 6, 2], [4, 5, 4], [8, 4, 2], [10, 2, 2], [12, 4, 4], [16, 2, 2], [18, 4, 2], [20, 5, 4], [24, 4, 4], [28, 0, 4]] },
    lintas: { bpm: 100, swing: 0.04, spb: 16, root: 50, sc: 'mix', lead: 'flute', lead2: 'pluck', bassI: 'sub', padV: 0, arpI: 'pluck', gong: false,
      ch: [[0, 'maj'], [10, 'maj'], [5, 'maj'], [7, 'sus4'], [0, 'maj'], [9, 'm7'], [5, 'maj7'], [7, 'dom7']],
      bass: 'r...5...r..5r...', arp: '0.1.2.1.0.2.3.2.',
      dr: { k: 'X.......x.......', h: '..o...o...o...o.' },
      A: [[0, 4, 4], [4, 5, 2], [6, 4, 2], [8, 2, 4], [12, 3, 2], [14, 2, 2], [16, 4, 4], [20, 6, 2], [22, 5, 2], [24, 4, 4], [28, 2, 4]], B: [[0, 5, 4], [4, 6, 2], [6, 7, 2], [8, 6, 4], [12, 4, 2], [14, 5, 2], [16, 4, 4], [20, 2, 4], [24, 0, 8]] },
    bandung: { bpm: 96, swing: 0, spb: 16, root: 53, sc: 'pel', lead: 'flute', lead2: 'bell', bassI: 'sub', padV: 1, arpI: 'bell', gong: true,
      ch: [[0, 'sus2'], [0, 'sus2'], [5, 'sus2'], [7, 'sus4'], [0, 'sus2'], [0, 'pw'], [5, 'sus2'], [7, 'sus4']],
      bass: 'r.......5.......', arp: '0...2...1...3...',
      dr: { d: 'X...x.t.X.t.x...', t: '..o...o...o...o.', k: 'X.......x.......', p: 'o.o.o.o.o.o.o.o.' },
      A: [[0, 4, 4], [4, 3, 2], [6, 2, 2], [8, 3, 4], [12, 1, 4], [16, 0, 6], [22, 1, 2], [24, 2, 8]], B: [[0, 5, 4], [4, 4, 2], [6, 3, 2], [8, 4, 4], [12, 3, 2], [14, 2, 2], [16, 1, 4], [20, 0, 12]] },
    cirebon: { bpm: 100, swing: 0, spb: 16, root: 45, sc: 'phr', lead: 'flute', lead2: 'bell', bassI: 'sub', padV: 1, arpI: 'pluck', gong: true,
      ch: [[0, 'min'], [1, 'maj'], [0, 'min'], [10, 'maj'], [0, 'min'], [1, 'maj'], [10, 'maj'], [0, 'sus4']],
      bass: 'r..r..r.5..r..8.', arp: '0.2.0.2.1.3.1.3.',
      dr: { d: 'X..x..t.X.t.x.t.', k: 'X.......X.......', t: '..o.o...o.o.o...', p: 'o.o.o.o.o.o.o.o.' },
      A: [[0, 7, 3], [3, 8, 1], [4, 7, 4], [8, 5, 3], [11, 4, 1], [12, 5, 4], [16, 4, 3], [19, 5, 1], [20, 7, 4], [24, 4, 8]], B: [[0, 9, 4], [4, 8, 2], [6, 7, 2], [8, 8, 4], [12, 7, 4], [16, 5, 4], [20, 4, 4], [24, 7, 8]] },
    semarang: { bpm: 108, swing: 0, spb: 12, root: 55, sc: 'maj', lead: 'pluck', lead2: 'flute', bassI: 'sub', padV: 1.1, arpI: 'pluck',
      ch: [[0, 'maj'], [7, 'dom7'], [0, 'maj'], [5, 'maj'], [9, 'm7'], [2, 'dom7'], [7, 'dom7'], [0, 'maj']],
      bass: 'r...5.5.....', arp: '.0.1.2.1.2.1', dr: { k: 'X...........', s: '....x...x...', h: 'x.x.x.x.x.x.', w: '..o...o...o.' },
      A: [[0, 4, 4], [4, 7, 2], [6, 9, 2], [8, 7, 4], [12, 5, 4], [16, 4, 2], [18, 2, 2], [20, 4, 4]], B: [[0, 9, 4], [4, 8, 2], [6, 7, 2], [8, 5, 4], [12, 7, 4], [16, 4, 2], [18, 2, 2], [20, 0, 4]] },
    yogya: { bpm: 72, swing: 0, spb: 16, root: 50, sc: 'slen', lead: 'bell', lead2: 'flute', bassI: 'sub', padV: 1.3, arpI: 'bell', gong: true,
      ch: [[0, 'sus2'], [0, 'sus2'], [5, 'sus2'], [5, 'sus2'], [7, 'sus2'], [7, 'sus4'], [0, 'sus2'], [0, 'pw']],
      bass: 'r...............', arp: '0.......2.......',
      dr: { d: 'x.....x.x.....t.', t: '..o...o...o...o.', k: 'X.......o.......' },
      A: [[0, 4, 6], [6, 3, 2], [8, 2, 4], [12, 1, 4], [16, 2, 6], [22, 3, 2], [24, 4, 4], [28, 2, 4]], B: [[0, 5, 6], [6, 4, 2], [8, 3, 4], [12, 2, 4], [16, 1, 6], [22, 2, 2], [24, 0, 8]] },
    solo: { bpm: 64, swing: 0, spb: 16, root: 52, sc: 'pel', lead: 'flute', lead2: 'bell', bassI: 'sub', padV: 1.4, arpI: 'bell', gong: true,
      ch: [[0, 'sus2'], [0, 'sus2'], [3, 'sus2'], [3, 'sus4'], [0, 'sus2'], [7, 'sus2'], [3, 'sus2'], [0, 'pw']],
      bass: 'r...............', arp: '0...2...1...3...',
      dr: { d: 'X.......x.....t.', t: '....o.......o...', k: 'X...............' },
      A: [[0, 2, 8], [8, 3, 4], [12, 1, 4], [16, 0, 8], [24, 1, 4], [28, 2, 4]], B: [[0, 4, 8], [8, 3, 4], [12, 2, 4], [16, 3, 6], [22, 2, 2], [24, 0, 8]] },
    malang: { bpm: 100, swing: 0.04, spb: 16, root: 52, sc: 'maj', lead: 'flute', lead2: 'pluck', bassI: 'sub', padV: 1, arpI: 'pluck',
      ch: [[0, 'maj'], [9, 'm7'], [5, 'maj7'], [7, 'dom7'], [0, 'maj'], [9, 'm7'], [2, 'm7'], [7, 'sus4']],
      bass: 'r..r..5.r..r..5.', arp: '0.1.2.3.2.1.2.1.',
      dr: { k: 'X.....x.X.....x.', s: '....x.......x...', h: '..x...x...x...x.', p: 'o.o.o.o.o.o.o.o.', w: '..x.....x.......' },
      A: [[0, 7, 2], [2, 8, 2], [4, 9, 4], [8, 7, 4], [12, 5, 4], [16, 4, 4], [20, 5, 2], [22, 7, 2], [24, 5, 8]], B: [[0, 9, 4], [4, 11, 4], [8, 9, 2], [10, 8, 2], [12, 7, 4], [16, 5, 4], [20, 4, 4], [24, 2, 8]] },
    surabaya: { bpm: 126, swing: 0, spb: 16, root: 52, sc: 'min', lead: 'brass', lead2: 'synth', bassI: 'pluck', padV: 0.8, arpI: 'pluck',
      ch: [[0, 'min'], [8, 'maj'], [3, 'maj'], [10, 'maj'], [0, 'min'], [8, 'maj'], [5, 'maj'], [7, 'maj']],
      bass: 'r.r.r.r.r.r.r.r.', arp: '0.1.2.1.0.1.2.3.',
      dr: { k: 'X...X...X...X...', s: '....X.......X..x', h: 'x.x.x.x.x.x.x.xx', o: '..o...o...o...o.', c: '....x.......x...' },
      A: [[0, 7, 4], [4, 7, 2], [6, 8, 2], [8, 9, 4], [12, 7, 4], [16, 8, 4], [20, 7, 2], [22, 5, 2], [24, 4, 8]], B: [[0, 9, 4], [4, 9, 2], [6, 11, 2], [8, 12, 4], [12, 11, 2], [14, 9, 2], [16, 8, 8], [24, 7, 8]] },
    battle: { bpm: 156, swing: 0, spb: 16, root: 45, sc: 'min', lead: 'brass', lead2: 'synth', bassI: 'pluck', padV: 0.9, arpI: 'pluck', arpOct: 1,
      ch: [[0, 'min'], [0, 'min'], [8, 'maj'], [10, 'maj'], [0, 'min'], [0, 'min'], [5, 'min'], [7, 'dom7']],
      bass: 'rrr.rrr.rrr.rr8r', arp: '0123210301230210',
      dr: { k: 'X..xX..x X..xX.x.'.replace(' ', ''), s: '....X.......X..x', h: 'xxxxxxxxxxxxxxxx', o: '..o...o...o...o.', c: '....x.......x...' },
      A: [[0, 7, 2], [2, 7, 2], [4, 9, 2], [6, 7, 2], [8, 6, 4], [12, 7, 4], [16, 7, 2], [18, 7, 2], [20, 9, 2], [22, 11, 2], [24, 10, 6], [30, 9, 2]], B: [[0, 11, 4], [4, 9, 4], [8, 7, 4], [12, 9, 4], [16, 11, 2], [18, 12, 2], [20, 11, 2], [22, 9, 2], [24, 7, 8]] },
    battleRare: { bpm: 168, swing: 0, spb: 16, root: 47, sc: 'phr', lead: 'bell', lead2: 'brass', bassI: 'pluck', padV: 1, arpI: 'bell', arpOct: 1, gong: true,
      ch: [[0, 'min'], [1, 'maj'], [0, 'min'], [10, 'maj'], [0, 'min'], [1, 'maj'], [3, 'maj'], [7, 'dom7']],
      bass: 'rrr.rrr.rr.rr.8r', arp: '0123210301230210',
      dr: { k: 'X..xX..xX..xX.x.', s: '....X.......X.xx', h: 'xxxxxxxxxxxxxxxx', o: '..o...o...o...o.', c: '....x.......x...', d: 'x.....t.x.t.....' },
      A: [[0, 7, 2], [2, 8, 2], [4, 7, 2], [6, 5, 2], [8, 4, 4], [12, 5, 4], [16, 7, 2], [18, 8, 2], [20, 9, 2], [22, 8, 2], [24, 7, 6], [30, 5, 2]], B: [[0, 9, 2], [2, 11, 2], [4, 12, 4], [8, 11, 4], [12, 9, 4], [16, 8, 2], [18, 9, 2], [20, 11, 2], [22, 12, 2], [24, 14, 8]] },
  };

  let ctx = null, master, comp, revIn, dlyIn, noiseBuf, cur = null, muted = false, timer = null, pending = null, duck = null;
  const rng = (seed) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

  function impulse(dur, decay) { const n = ctx.sampleRate * dur | 0, b = ctx.createBuffer(2, n, ctx.sampleRate); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); } return b; }
  function build(c) {
    ctx = c;
    comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = 0.008; comp.release.value = 0.22;
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.5; master.connect(comp); comp.connect(ctx.destination);
    duck = ctx.createGain(); duck.gain.value = 1; duck.connect(master);
    const rev = ctx.createConvolver(); rev.buffer = impulse(1.2, 2.2); const rg = ctx.createGain(); rg.gain.value = 0.34; revIn = ctx.createGain(); revIn.connect(rev); rev.connect(rg); rg.connect(duck);
    const dl = ctx.createDelay(1.5), fb = ctx.createGain(), dlf = ctx.createBiquadFilter(), dg = ctx.createGain(); dl.delayTime.value = 0.36; fb.gain.value = 0.38; dlf.type = 'lowpass'; dlf.frequency.value = 2600; dg.gain.value = 0.3; dlyIn = ctx.createGain();
    dlyIn.connect(dl); dl.connect(dlf); dlf.connect(fb); fb.connect(dl); dlf.connect(dg); dg.connect(duck); dg.connect(revIn);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  }
  function mkBus(th) {
    const bus = ctx.createGain(); bus.gain.value = 0; const dry = ctx.createGain(), r = ctx.createGain(), d = ctx.createGain();
    dry.gain.value = 1; r.gain.value = th.rev ?? 0.5; d.gain.value = th.dly ?? 0.25; bus.connect(dry); dry.connect(duck); bus.connect(r); r.connect(revIn); bus.connect(d); d.connect(dlyIn); return bus;
  }

  /* ---------------- suara ---------------- */
  const adsr = (p, t, a, pk, d, s, hold, r) => { const sus = Math.max(pk * s, 0.0001); p.setValueAtTime(0.0001, t); p.exponentialRampToValueAtTime(Math.max(pk, 0.0002), t + a); p.exponentialRampToValueAtTime(sus, t + a + d); p.setValueAtTime(sus, Math.max(t + hold, t + a + d)); p.exponentialRampToValueAtTime(0.0001, Math.max(t + hold, t + a + d) + r); };
  function O(type, f, t, end, dest, vol, det = 0) { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = det; const g = ctx.createGain(); g.gain.value = vol; o.connect(g); g.connect(dest); o.start(t); o.stop(end); return { o, g }; }
  function LP(freq, q, dest) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq; f.Q.value = q; f.connect(dest); return f; }
  function noiseSrc(t, end, dest, type, freq, q, vol) { const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; const g = ctx.createGain(); g.gain.value = vol; s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random()); s.stop(end); return { g, f }; }
  const VOICE = {
    pad(t, f, dur, v, dest) { const g = ctx.createGain(), fl = LP(1500, 0.5, g); adsr(g.gain, t, 0.7, 0.085 * v, 0.5, 0.8, dur, 0.9); g.connect(dest); const e = t + dur + 1.1; [[-5, 'triangle', 1], [5, 'sine', 1.1]].forEach(([dt, ty, gv]) => { const o = ctx.createOscillator(), og = ctx.createGain(); og.gain.value = gv; o.type = ty; o.frequency.value = f; o.detune.value = dt; o.connect(og); og.connect(fl); o.start(t); o.stop(e); }); },
    str(t, f, dur, v, dest) { VOICE.pad(t, f, dur, v * 0.9, dest); },
    sub(t, f, dur, v, dest) { const g = ctx.createGain(); adsr(g.gain, t, 0.012, 0.34 * v, 0.25, 0.6, dur, 0.1); g.connect(dest); O('sine', f, t, t + dur + 0.2, g, 1); O('triangle', f * 2, t, t + dur + 0.2, g, 0.18); },
    pluckB(t, f, dur, v, dest) { const g = ctx.createGain(); adsr(g.gain, t, 0.004, 0.3 * v, 0.2, 0.35, dur, 0.08); g.connect(dest); const fl = LP(600, 4, g); fl.frequency.setValueAtTime(2200, t); fl.frequency.exponentialRampToValueAtTime(260, t + 0.18); O('sawtooth', f, t, t + dur + 0.2, fl, 1); O('sine', f / 2, t, t + dur + 0.2, g, 0.5); },
    pluck(t, f, dur, v, dest) { const g = ctx.createGain(); adsr(g.gain, t, 0.003, 0.16 * v, 0.5, 0.01, 0.05, 0.1); g.connect(dest); O('triangle', f, t, t + 0.9, g, 1); O('sine', f * 2, t, t + 0.5, g, 0.3); O('sine', f * 4.02, t, t + 0.12, g, 0.12); },
    bell(t, f, dur, v, dest) { const L = 0.7 + dur * 0.9, g = ctx.createGain(); adsr(g.gain, t, 0.003, 0.17 * v, L, 0.0001, 0.01, 0.3); g.connect(dest); const c = O('sine', f, t, t + L + 0.5, g, 1), m = O('sine', f * 3.51, t, t + L + 0.5, ctx.createGain(), 1); const mg = ctx.createGain(); m.g.disconnect(); m.g.connect(mg); mg.gain.setValueAtTime(f * 2.2 * v, t); mg.gain.exponentialRampToValueAtTime(1, t + L * 0.6); mg.connect(c.o.frequency); O('sine', f * 2.76, t, t + L * 0.6, g, 0.14); },
    flute(t, f, dur, v, dest) { const g = ctx.createGain(); adsr(g.gain, t, 0.07, 0.2 * v, 0.1, 0.85, dur, 0.18); g.connect(dest); const e = t + dur + 0.4, a = O('sine', f, t, e, g, 1); O('sine', f * 2, t, e, g, 0.12); const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 5.3; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.008, t + 0.35); lfo.connect(lg); lg.connect(a.o.frequency); lfo.start(t); lfo.stop(e); noiseSrc(t, e, g, 'bandpass', f * 2, 3, 0.05); },
    brass(t, f, dur, v, dest) { const g = ctx.createGain(); adsr(g.gain, t, 0.025, 0.1 * v, 0.1, 0.7, dur, 0.1); g.connect(dest); const fl = LP(500, 1.2, g), e = t + dur + 0.2; fl.frequency.setValueAtTime(450, t); fl.frequency.exponentialRampToValueAtTime(3200, t + 0.12); fl.frequency.exponentialRampToValueAtTime(1500, t + dur); O('sawtooth', f, t, e, fl, 1, -6); O('sawtooth', f, t, e, fl, 1, 6); },
    synth(t, f, dur, v, dest) { const g = ctx.createGain(); adsr(g.gain, t, 0.015, 0.09 * v, 0.15, 0.6, dur, 0.12); g.connect(dest); const fl = LP(2800, 1, g), e = t + dur + 0.2; O('square', f, t, e, fl, 0.6); O('sawtooth', f, t, e, fl, 0.5, 8); },
    kick(t, v, dest) { const g = ctx.createGain(); adsr(g.gain, t, 0.002, 0.95 * v, 0.16, 0.2, 0.2, 0.15); g.connect(dest); const o = O('sine', 150, t, t + 0.45, g, 1); o.o.frequency.setValueAtTime(150, t); o.o.frequency.exponentialRampToValueAtTime(42, t + 0.14); noiseSrc(t, t + 0.02, g, 'highpass', 2000, 0.7, 0.25); },
    snare(t, v, dest) { const g = ctx.createGain(); adsr(g.gain, t, 0.002, 0.42 * v, 0.14, 0.1, 0.12, 0.1); g.connect(dest); noiseSrc(t, t + 0.32, g, 'bandpass', 2000, 0.7, 1); O('triangle', 190, t, t + 0.12, g, 0.5); },
    hat(t, v, dest, open) { const L = open ? 0.24 : 0.05, g = ctx.createGain(); adsr(g.gain, t, 0.001, 0.2 * v, L, 0.01, 0.002, 0.03); g.connect(dest); noiseSrc(t, t + L + 0.08, g, 'highpass', 7000, 0.7, 1); },
    clap(t, v, dest) { const g = ctx.createGain(); g.connect(dest); for (let i = 0; i < 3; i++) { const tt = t + i * 0.011, gg = ctx.createGain(); adsr(gg.gain, tt, 0.001, 0.22 * v, 0.04, 0.01, 0.003, 0.03); gg.connect(g); noiseSrc(tt, tt + 0.1, gg, 'bandpass', 1300, 2, 1); } },
    dung(t, v, dest) { const g = ctx.createGain(); adsr(g.gain, t, 0.002, 0.5 * v, 0.22, 0.01, 0.05, 0.12); g.connect(dest); const o = O('sine', 210, t, t + 0.4, g, 1); o.o.frequency.setValueAtTime(210, t); o.o.frequency.exponentialRampToValueAtTime(115, t + 0.18); noiseSrc(t, t + 0.04, g, 'bandpass', 900, 1, 0.2); },
    tak(t, v, dest) { const g = ctx.createGain(); adsr(g.gain, t, 0.001, 0.3 * v, 0.07, 0.01, 0.01, 0.04); g.connect(dest); noiseSrc(t, t + 0.12, g, 'bandpass', 3200, 4, 1); O('sine', 340, t, t + 0.08, g, 0.3); },
    wood(t, v, dest) { const g = ctx.createGain(); adsr(g.gain, t, 0.001, 0.2 * v, 0.05, 0.01, 0.005, 0.03); g.connect(dest); O('sine', 880, t, t + 0.1, g, 1); O('sine', 1320, t, t + 0.06, g, 0.4); },
    shake(t, v, dest) { const g = ctx.createGain(); adsr(g.gain, t, 0.012, 0.11 * v, 0.06, 0.01, 0.01, 0.04); g.connect(dest); noiseSrc(t, t + 0.18, g, 'highpass', 5500, 0.5, 1); },
    timp(t, f, v, dest) { const g = ctx.createGain(); adsr(g.gain, t, 0.004, 0.9 * v, 0.5, 0.01, 0.05, 0.3); g.connect(dest); const o = O('sine', f * 1.35, t, t + 0.9, g, 1); o.o.frequency.setValueAtTime(f * 1.35, t); o.o.frequency.exponentialRampToValueAtTime(f, t + 0.12); O('triangle', f * 2, t, t + 0.3, g, 0.25); noiseSrc(t, t + 0.05, g, 'lowpass', 900, 0.7, 0.3); },
    riser(t, dur, v, dest) { const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16 * v, t + dur); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.25); g.connect(dest); const n = noiseSrc(t, t + dur + 0.3, g, 'bandpass', 700, 0.9, 1); n.f.frequency.setValueAtTime(600, t); n.f.frequency.exponentialRampToValueAtTime(7000, t + dur); },
    crash(t, v, dest) { const g = ctx.createGain(); adsr(g.gain, t, 0.002, 0.3 * v, 2.2, 0.0001, 0.05, 0.5); g.connect(dest); noiseSrc(t, t + 3, g, 'highpass', 4500, 0.6, 1); },
    gong(t, v, dest) { const g = ctx.createGain(); adsr(g.gain, t, 0.01, 0.28 * v, 4, 0.0001, 0.02, 1.5); g.connect(dest); [[1, 1], [1.51, 0.6], [2.43, 0.35], [3.2, 0.2]].forEach(([r, a]) => { const o = O('sine', 58 * r, t, t + 6, g, a); o.o.detune.setValueAtTime(18, t); o.o.detune.linearRampToValueAtTime(0, t + 1.5); }); noiseSrc(t, t + 0.3, g, 'lowpass', 600, 0.5, 0.3); },
  };
  const LEADV = { bell: 'bell', flute: 'flute', pluck: 'pluck', brass: 'brass', synth: 'synth' };

  /* ---------------- komposisi melodi dari motif ---------------- */
  function compose(th, seed) {
    const n = SC[th.sc].length, sc = SC[th.sc], L = th.ch.length, spb = th.spb, r = rng(seed), ev = {};
    const deg2m = (d) => th.root + 12 + 12 * Math.floor(d / n) + sc[((d % n) + n) % n];
    const chordAt = (bar) => { const [off, ty] = th.ch[bar % L]; return CH[ty].map((i) => (th.root + off + i) % 12); };
    const mot = {
      A: th.A, B: th.B,
      a: th.A.map((nn, i, ar) => (i >= ar.length - 2 ? [nn[0], nn[1] + (i === ar.length - 1 ? -1 : 1), nn[2]] : nn)),
      b: th.B.map((nn, i) => [nn[0], nn[1] + (i < 3 ? 2 : 0), nn[2]]),
      c: th.A.map((nn) => [nn[0], nn[1] - 2, nn[2]]),
      e: th.A.filter((nn) => nn[0] < spb).concat([[spb, 0, spb]]),
    };
    FORM.forEach((k, pi) => {
      mot[k].forEach(([st, d, len]) => {
        const abs = pi * 2 * spb + st, bar = Math.floor(abs / spb), cp = chordAt(bar);
        let dd = d;
        if (st % (spb / 2) === 0 && !cp.includes(deg2m(dd) % 12)) { for (const o of [1, -1, 2, -2]) if (cp.includes(deg2m(dd + o) % 12)) { dd += o; break; } }
        ev[abs] = { m: deg2m(dd), len };
      });
    });
    return ev;
  }

  /* ---------------- sequencer ---------------- */
  /* ---------------- intro sinematik: partitur satu kali (±25 dtk) ---------------- */
  function cine() {
    const th = { rev: 0.9, dly: 0.12 }, bus = mkBus(th), t0 = ctx.currentTime + 0.12, V = VOICE, T = (x) => t0 + x, m = mtof;
    const chord = (t, notes, dur, v) => notes.forEach((n, i) => V.pad(t, m(n), dur, v * (i === 0 ? 1.1 : 0.9), bus));
    // 1) Pulau Jawa: drone, detak timpani pelan, lonceng jarang
    chord(T(0), [38, 45], 6.4, 1.4); chord(T(0.4), [50, 57], 5.8, 0.8);
    for (let i = 0; i < 4; i++) { V.timp(T(1.4 + i * 1.15), 38, 0.35 + i * 0.12, bus); V.timp(T(1.4 + i * 1.15 + 0.3), 38, 0.22 + i * 0.1, bus); }
    [[1.0, 74], [2.6, 81], [4.1, 77], [5.3, 76]].forEach(([t, n]) => V.bell(T(t), m(n), 1.2, 0.9, bus)); V.riser(T(2.8), 3.4, 0.8, bus);
    // 2) kereta tiba: ostinato menanjak + gulungan timpani
    const arp = [50, 57, 62, 65, 69, 65, 62, 57]; let t = 6.0, k = 0; while (t < 10.45) { const st = 0.2 - 0.1 * ((t - 6) / 4.45); V.pluck(T(t), m(arp[k % 8] + (k > 14 ? 12 : 0)), st, 0.7 + 0.5 * ((t - 6) / 4.45), bus); if (k % 2 === 0) V.str(T(t), m(arp[k % 8] - 12), 0.35, 0.8, bus); t += st; k++; }
    [[6, [50, 57, 62, 65]], [7.4, [46, 58, 62, 65]], [8.8, [48, 55, 60, 64]], [9.6, [45, 57, 61, 64]]].forEach(([tt, c]) => chord(T(tt), c, 1.6, 1.1));
    for (let tt = 8.3; tt < 10.45; tt += 0.11) V.timp(T(tt), 38, 0.25 + 0.7 * ((tt - 8.3) / 2.15), bus); V.riser(T(7.0), 3.45, 1.1, bus);
    // 3) HANTAMAN + tema pahlawan (brass)
    V.gong(T(10.5), 1.4, bus); V.kick(T(10.5), 1.2, bus); V.crash(T(10.5), 0.9, bus); V.timp(T(10.5), 38, 1.2, bus); chord(T(10.5), [38, 50, 57, 62], 2.4, 1.3); [50, 57, 62].forEach((n) => V.brass(T(10.5), m(n), 1.5, 1.0, bus));
    [[0.0, 62, .5], [0.62, 69, .5], [1.25, 74, 1.3], [2.7, 72, .45], [3.15, 70, .45], [3.6, 69, .9], [4.6, 65, .4], [5.0, 67, .45]].forEach(([d, n, l]) => { V.brass(T(10.5 + d + (d ? 0 : 0.0)), m(n), l, 1.15, bus); V.brass(T(10.5 + d), m(n - 12), l, 0.55, bus); });
    chord(T(13.0), [34, 46, 53, 58], 1.6, 1.1); chord(T(14.6), [36, 48, 55, 60], 1.4, 1.1);
    for (let i = 0; i < 9; i++) { const tt = 11.1 + i * 0.625; V.kick(T(tt), 0.9, bus); V.timp(T(tt), 38, 0.6, bus); if (i % 2) V.snare(T(tt), 0.9, bus); }
    for (let i = 0; i < 20; i++) V.pluckB(T(10.5 + i * 0.3125), m([38, 38, 38, 38, 34, 34, 36, 36][i % 8]), 0.28, 0.9, bus);
    // 4) tema naik ke D mayor, penuh
    const b0 = 16.0; V.crash(T(b0), 0.6, bus); V.kick(T(b0), 1.1, bus);
    [[0.0, 66, .5], [0.55, 69, .5], [1.1, 74, .6], [1.8, 78, .6], [2.5, 81, 1.4], [4.0, 78, .5], [4.55, 76, .5], [5.1, 74, .4]].forEach(([d, n, l]) => { V.brass(T(b0 + d), m(n), l, 1.2, bus); V.bell(T(b0 + d), m(n + 12), l, 0.8, bus); V.brass(T(b0 + d), m(n - 12), l, 0.5, bus); });
    chord(T(16.0), [38, 50, 57, 62, 66], 2.6, 1.3); chord(T(18.5), [43, 55, 62, 67], 1.8, 1.2); chord(T(20.2), [45, 57, 61, 64], 1.6, 1.2);
    const ar2 = [50, 54, 57, 62, 57, 54]; for (let i = 0, tt = 16; tt < 21.4; tt += 0.156, i++) V.pluck(T(tt), m(ar2[i % 6] + 12), 0.156, 0.9, bus);
    for (let i = 0; i < 9; i++) { const tt = 16 + i * 0.625; V.kick(T(tt), 0.95, bus); V.timp(T(tt), 38, 0.5, bus); if (i % 2) V.snare(T(tt), 1, bus); }
    for (let tt = 19.6; tt < 21.55; tt += 0.104) V.snare(T(tt), 0.35 + 0.8 * ((tt - 19.6) / 1.95), bus); V.riser(T(19.0), 2.5, 1.2, bus);
    // 5) judul: akor besar + kilau lonceng
    const f0 = 21.6; V.gong(T(f0), 1.6, bus); V.kick(T(f0), 1.3, bus); V.snare(T(f0), 1, bus); V.crash(T(f0), 1.1, bus); V.timp(T(f0), 38, 1.3, bus); V.timp(T(f0 + 0.3), 43, 1.0, bus);
    [38, 50, 57, 62, 66, 69, 74].forEach((n) => V.brass(T(f0), m(n), 2.6, 1.1, bus)); chord(T(f0), [38, 50, 57, 62, 66], 3.4, 1.5);
    [[0.0, 86], [0.14, 81], [0.28, 78], [0.42, 74], [1.6, 93], [2.1, 88], [2.6, 86]].forEach(([d, n]) => V.bell(T(f0 + d), m(n), 1.6, 1.0, bus));
    bus.gain.setValueAtTime(0.0001, ctx.currentTime); bus.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.4);
    return { name: 'intro', th, bus, step: 0, nextT: Infinity, sd: 1, ev: [], song: 1, dead: false };
  }
  function start(name) {
    if (name === 'intro') return cine();
    const th = TH[name]; if (!th) return null;
    const bus = mkBus(th), st = { name, th, bus, step: 0, nextT: ctx.currentTime + 0.08, sd: 60 / th.bpm / 4 * (th.spb === 12 ? 1.33 : 1), ev: compose(th, name.length * 977 + th.bpm), song: th.ch.length * 2, dead: false };
    return st;
  }
  function playStep(st, t) {
    const th = st.th, spb = th.spb, bar = Math.floor(st.step / spb), si = st.step % spb, L = th.ch.length, song = L * 2, bs = bar % song, pass = bs >= L ? 1 : 0, bp = bs % L;
    const [off, ty] = th.ch[bp], rootM = th.root + off, tones = CH[ty], bus = st.bus, V = VOICE;
    const bd = st.sd * spb, tt = t + (si % 2 ? th.swing * st.sd : 0);
    if (si === 0) {
      if (th.padV !== 0) tones.slice(0, lite >= 2 ? 2 : 4).forEach((iv, i) => { if (i === 3 && th.ch[bp][1] === 'maj') return; V.pad(t, mtof(rootM + 12 + iv), bd * (th.padHold ?? 1), th.padV * (i === 0 ? 0.8 : 1), bus); });
      if (th.gong && bp % 4 === 0) V.gong(t, pass ? 1 : 0.8, bus);
    }
    const gp = (s, i) => (s && i < s.length ? s[i] : '.');
    // bass
    const bc = gp(th.bass, si);
    if (bc !== '.' && (bar >= 0)) {
      const iv = bc === 'r' ? 0 : bc === '5' ? 7 : bc === '8' ? 12 : bc === '3' ? tones[1] : 0;
      let nx = 1; while (si + nx < spb && gp(th.bass, si + nx) === '.') nx++;
      const f = mtof(rootM - 12 + iv), vv = bc === 'r' ? 1 : 0.8, dur = nx * st.sd * 0.9;
      (th.bassI === 'pluck' ? V.pluckB : V.sub)(tt, f, dur, vv, bus);
    }
    // arp
    const ac = gp(th.arp, si);
    if (lite < 1 && ac !== '.' && (bs >= 2 || pass || th.padV === 0)) { const d = +ac, iv = tones[d % 4] + 12 * Math.floor(d / 4) + (th.arpOct ? 12 : 0), f = mtof(rootM + 12 + iv); (th.arpI === 'bell' ? V.bell : V.pluck)(tt, f, st.sd * 1.5, 0.55 + 0.3 * pass, bus); }
    // drum
    const D = th.dr, hit = (k) => STR[gp(D[k], si)] ?? 0;
    if (!(bs === 0 && false)) {
      let v;
      if ((v = hit('k'))) V.kick(tt, v, bus);
      if ((v = hit('s'))) V.snare(tt, v, bus);
      if ((v = hit('c'))) V.clap(tt, v, bus);
      if ((v = hit('h')) && (bs >= 1) && (lite < 1 || si % 4 === 0)) V.hat(tt, v * (pass ? 1 : 0.8), bus, false);
      if (lite < 1 && (v = hit('o'))) V.hat(tt, v, bus, true);
      if ((v = hit('d'))) V.dung(tt, v, bus);
      if ((v = hit('t'))) V.tak(tt, v, bus);
      if ((v = hit('w'))) V.wood(tt, v, bus);
      if (lite < 1 && (v = hit('p'))) V.shake(tt, v, bus);
    }
    // melodi
    const e = st.ev[st.step % (song * spb)];
    if (e && (bs >= 2 || pass)) {
      const f = mtof(e.m), dur = e.len * st.sd * (th.lead === 'bell' || th.lead === 'pluck' ? 1.2 : 0.95);
      VOICE[LEADV[pass ? th.lead2 : th.lead]](tt, f, dur, pass ? 0.9 : 1, bus);
      if (lite < 1 && pass && th.lead !== th.lead2) VOICE[LEADV[th.lead]](tt, f * 2, dur, 0.35, bus);
    }
  }
  function sched(until) {
    if (!cur) return;
    while (cur.nextT < until) { playStep(cur, cur.nextT); cur.nextT += cur.sd; cur.step++; }
  }
  function tick() { if (!cur || !ctx) return; const now = ctx.currentTime; if (cur.nextT < now - 0.4) cur.nextT = now + 0.1; sched(now + 1.0); }
  function startTimer() { if (timer) return; try { const w = new Worker(URL.createObjectURL(new Blob(['setInterval(()=>postMessage(0),50)'], { type: 'text/javascript' }))); w.onmessage = tick; timer = w; } catch (e) { timer = setInterval(tick, 60); } setInterval(() => { if (ctx && !muted && ctx.state !== 'running') ctx.resume(); }, 2000); document.addEventListener('visibilitychange', () => { if (ctx && !document.hidden) ctx.resume(); }); }

  /* ---------------- API ---------------- */
  function ensure() { if (!ctx) { try { build(window.__bootCtx || new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'playback' })); } catch (e) { return false; } } if (ctx.state === 'suspended') ctx.resume(); startTimer(); return true; }
  function play(name) {
    if (!ctx || ctx.state === 'suspended') { pending = name; return; } pending = null; if (cur && cur.name === name) return;
    const old = cur, nw = start(name); if (!nw) return;
    const t = ctx.currentTime; nw.bus.gain.setValueAtTime(0.0001, t); nw.bus.gain.linearRampToValueAtTime(1, t + 0.9);
    if (old) { old.bus.gain.cancelScheduledValues(t); old.bus.gain.setValueAtTime(old.bus.gain.value, t); old.bus.gain.linearRampToValueAtTime(0.0001, t + 1.1); setTimeout(() => { try { old.bus.disconnect(); } catch (e) {} }, 4000); }
    cur = nw;
  }
  function jingle(kind) {
    if (!ctx) return; const t = ctx.currentTime + 0.05, bus = ctx.createGain(); bus.gain.value = 1; bus.connect(duck); const r = ctx.createGain(); r.gain.value = 0.5; bus.connect(r); r.connect(revIn);
    duck.gain.cancelScheduledValues(t); duck.gain.setValueAtTime(duck.gain.value, t); duck.gain.linearRampToValueAtTime(0.28, t + 0.08); duck.gain.setValueAtTime(0.28, t + 2.8); duck.gain.linearRampToValueAtTime(1, t + 3.6);
    const seq = kind === 'level' ? [[67, 0], [72, 0.1], [76, 0.2], [79, 0.3], [84, 0.42], [79, 0.58], [84, 0.7], [88, 0.82], [91, 0.98], [96, 1.18], [91, 1.32], [96, 1.5], [100, 1.7], [103, 1.9]] : kind === 'heal' ? [[72, 0], [76, 0.16], [79, 0.32], [84, 0.5], [79, 0.78], [84, 1.0], [88, 1.25], [91, 1.5]] : kind === 'win' ? [[60, 0], [64, 0.12], [67, 0.24], [72, 0.36], [76, 0.52], [79, 0.7], [84, 0.9]] : kind === 'catch' ? [[72, 0], [76, 0.1], [79, 0.2], [84, 0.3], [88, 0.46], [91, 0.62], [96, 0.8], [84, 1.15], [88, 1.15], [91, 1.15], [96, 1.15]] : [[67, 0], [64, 0.2], [60, 0.4], [55, 0.7]];
    seq.forEach(([m, dt]) => { (kind === 'lose' ? VOICE.flute : VOICE.bell)(t + dt, mtof(m), 0.5, 1, bus); }); if (kind !== 'lose') [48, 55, 64, 72].forEach((m) => VOICE.pad(t + 0.7, mtof(m), 1.6, 1.2, bus));
    setTimeout(() => { try { bus.disconnect(); } catch (e) {} }, 8000);
  }
  function blip(f) {
    if (!ctx || muted || ctx.state !== 'running') return; const t = ctx.currentTime, o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o2.type = 'triangle'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.12, t + 0.05); o2.frequency.setValueAtTime(f * 2, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    o.connect(g); o2.connect(g); g.connect(master); o.start(t); o2.start(t); o.stop(t + 0.08); o2.stop(t + 0.08);
  }
  function toggle() { muted = !muted; if (master) master.gain.linearRampToValueAtTime(muted ? 0 : 0.5, ctx.currentTime + 0.2); return !muted; }
  function unlock() { if (ensure() && pending) { const p = pending; pending = null; cur = null; play(p); } }
  // render offline (untuk uji kualitas)
  async function renderOffline(name, secs) {
    const sr = 22050, oc = new OfflineAudioContext(2, sr * secs, sr), saved = ctx; build(oc); const th = TH[name]; cur = start(name); cur.bus.gain.value = 1; cur.nextT = 0; sched(secs);
    const buf = await oc.startRendering(); ctx = saved; cur = null; return buf;
  }
  return { set lite(v) { lite = v; }, get lite() { return lite; }, TH, play, jingle, blip, toggle, unlock, ensure, renderOffline, get muted() { return muted; }, get name() { return cur && cur.name; } };
})();
