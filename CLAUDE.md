# Maimon · Edisi Jawa — konteks bersama (dibaca otomatis oleh Claude Code)

San (pemilik) berbahasa Indonesia, register "aku/kamu", suka jawaban langsung dan praktis. Dia kadang memanggil Claude "Zaya". Panggil dia "San".
Game: petualangan menangkap/melatih **Maimon** (mirip Pokémon, tema Indonesia), diorama piksel 3D, Three.js, SATU file HTML, PWA. Untuk San main bersama anaknya (±5 tahun) dan orang tua → ramah anak, tanpa kekerasan eksplisit, teks mudah dibaca.
Repo: github.com/sikhsanf/Maimon (branch main), live: sikhsanf.github.io/Maimon/.

## Dokumen sumber kebenaran (ada di Project "Game" di claude.ai, folder `maimon/`)
GAME-SPECS.md (spek utama) · WORLD-MAP-v1.md (peta/rute) · CITY-IDENTITY.md ("rasa" kota) · PROGRESSION.md (XP/evolusi/pelatih/gym Lv) · CHECKLIST.md (uang, kereta, battle gym) · BOGOR-STATUS.md. Salinan ringkas ada di `handover/`. Kalau kode dan dokumen berbeda, kode yang benar; perbarui dokumennya.

## Build, tes, rilis
- `python3 build.py` menggabungkan `src/` → `index.html` (satu modul ES, ±385 KB). Urutan: head.html, engine, builders2, world1–4, field, outer, bogor, lab, quad, evo, camrender, music, npc, gameA, story, gather, menus, evolve, trainer, gameB. Edit `src/`, JANGAN edit `index.html` langsung.
- Top-level `const/let` TDZ sampai file-nya jalan → untuk pemakaian lintas file pakai `var`/deklarasi fungsi.
- Tes: Playwright + `/usr/bin/google-chrome` (swiftshader), `python3 -m http.server 8765` dari root repo, URL `?noboot&perf=2` (`perf=0` untuk lihat gerimis Bogor). `window.__g` mengekspor helper tes (TRAINERS, trainerStart, xpNeed, gymReady, npcRule, findPath, setCam, MAI, dll).
- Trik tes: set `localStorage['maimon_save_v1']` = `{pos:[x,z,0],S:{name,gender,stage,tut,tf,dex,bag},mates:[{sp,st,hp,lv,xp}],box:[]}` lewat `add_init_script` di context baru, lalu klik `#bCont` (autosave pagehide menimpa save palsu kalau reload). Posisi terblokir jatuh ke titik awal.
- Wajib sebelum commit kota/NPC baru: `__g.npcRule()` semua `ok: true`; tidak ada error konsol.
- Rilis: bump `const V = 'maimon-vNN'` di `sw.js` (sekarang v40) agar PWA ter-update, build, commit, push main (GitHub Pages).
- Commit message diakhiri:
  Co-Authored-By: Claude <noreply@anthropic.com>
  (tambahkan baris Claude-Session bila sesi menyediakannya)

## Aturan yang SUDAH diputuskan San (jangan dilanggar)
- Panah/jalur arah HANYA untuk misi utama.
- Gating cerita: tutorial membuka mancing+jagung; Klinik stage ≥2; Hotel stage ≥4; polisi membuka gerbang J1 hanya dengan surat Prof (6→7); surat ke Pak Botani 7→8; pelatih aktif stage ≥4.
- Evolusi di Lv 16 dan 33 dengan sprite yang sudah dipilih; bentuk dasar harus berubah, bukan hanya aksesori.
- Lv maks 99; syarat level gym `GYM_MINLV=[20,30,40,50,60,70,80,90,99]` (Bogor 20 permintaan San).
- 9 gym dengan nama pemimpin/medali yang sudah disetujui (lihat GAME-SPECS bagian 7).
- Tiap kota harus punya "rasa" sendiri (CITY-IDENTITY.md). Pelatih hanya di field, tidak di kota.
- NPC luar ruang: maks 1,5 petak dari jalan dan dari gedungnya; Maimon liar menjauh ≥5 petak dari NPC.
- Konten tanpa simbol agama; musik orisinal (jangan menyalin melodi lagu nyata); jangan reproduksi karakter/IP berhak cipta.

## Kerja paralel 4 sesi (World / Maimon / Gameplay / Docs)
- Satu cabang git per sesi (`world/...`, `maimon/...`, `gameplay/...`, `docs/...`), idealnya satu git worktree per sesi.
- `index.html` dan `sw.js` hasil build/bump → konflik pasti. Jangan selesaikan konflik di index.html: resolusi di `src/`, lalu `python3 build.py` ulang. Bump `sw.js` hanya oleh yang merge ke main.
- `src/gameA.js` dipakai bersama (spesies, XP, battle). Perubahan di sana: kecil, sering di-merge, beri tahu sesi lain lewat catatan di `handover/STATUS-<sesi>.md`.
- Sebelum mulai: baca `handover/<nomor>-<sesi>.md` milik sesimu. Sebelum selesai: perbarui bagian "Status" di file itu dan tulis apa yang berubah untuk sesi lain.
