# First prompt per sesi (tempel di sesi Claude Code yang sesuai)

Siapkan dulu: clone repo, 4 worktree (`git worktree add ../maimon-world -b world/main`, dst.), buka tiap worktree di sesi Claude Code sendiri.

---
## 1. World building
Kamu bekerja untuk San di game **Maimon · Edisi Jawa** (Three.js, satu file HTML, PWA). Sesi ini = **World building**. Baca berurutan: `CLAUDE.md`, `handover/00-README.md`, `handover/01-WORLD-BUILDING.md`, lalu dokumen Project "Game" `maimon/WORLD-MAP-v1.md` dan `maimon/CITY-IDENTITY.md` (kalau tidak bisa membaca Project, pakai `handover/docs/`; WORLD-MAP-v1 hanya di Project). Lihat juga `src/bogor.js` sebagai contoh kota dengan "rasa" sendiri, dan jalankan game lokal (`python3 build.py`, `python3 -m http.server 8765`, `?noboot&perf=2`) untuk melihat Depok/J1/Bogor.
Tugas pertama: polish Bogor (pohon besar di Jl. Pajajaran, toko/pasar kolonial, bendera, suara hujan), lalu rencanakan J4 Bogor–Bandung dan kota Bandung sesuai aturan 6 sumbu "rasa". Sebelum membangun apa pun, balas dengan: (1) ringkasan pemahamanmu tentang kondisi dunia sekarang dan aturan wajibnya, (2) rencana langkah + usulan rasa Bandung untuk kusetujui. Bekerja di cabang `world/...`, jangan edit `index.html` langsung, wajib `__g.npcRule()` ok sebelum commit. Bicara Indonesia (aku/kamu), panggil aku San.

---
## 2. Maimon development
Kamu bekerja untuk San di game **Maimon · Edisi Jawa**. Sesi ini = **Maimon development** (makhluk, tipe, sprite, evolusi, kelangkaan, Maimondex). Baca berurutan: `CLAUDE.md`, `handover/00-README.md`, `handover/02-MAIMON-DEVELOPMENT.md`, lalu `handover/docs/PROGRESSION.md` dan bagian 4–5 `handover/docs/GAME-SPECS.md`. Periksa kode `src/quad.js`, `src/evo.js`, `src/evolve.js`, dan data spesies/RARITY di `src/gameA.js`; buka Galeri Sprite (https://claude.ai/artifact/LLj8UxG8bYKXpjHuUSigD4) atau jalankan `tools/gallery.py` untuk melihat 15 bentuk yang ada.
Tugas pertama: usulkan Maimon Bayangan pertama (dan angka efek status Takut) serta 3–4 spesies baru untuk Bandung (tipe Suara) dengan kelangkaan Jarang/Epik; tiap usulan sertakan konsep siluet, tipe, habitat, rantai evolusi, dan kelangkaan. Jangan menulis kode dulu: balas dengan pemahamanmu + usulan bergambar teks, tunggu persetujuan San (aturan San: bentuk dasar harus berubah saat evolusi, evolusi ke-3 harus "wah", desain orisinal). Cabang `maimon/...`; perubahan di `gameA.js` kecil dan sering. Bahasa Indonesia (aku/kamu), panggil San.

---
## 3. Gameplay
Kamu bekerja untuk San di game **Maimon · Edisi Jawa**. Sesi ini = **Gameplay** (battle gym, uang, kereta, skill gerbang, keseimbangan, cerita). Baca berurutan: `CLAUDE.md`, `handover/00-README.md`, `handover/03-GAMEPLAY.md`, lalu `handover/docs/CHECKLIST.md`, `handover/docs/PROGRESSION.md`, dan bagian 2–3, 7, 12, 14–15 `handover/docs/GAME-SPECS.md`. Pelajari `src/gameA.js` (battle, XP, `gymReady`), `src/trainer.js` (pola battle pelatih, dipakai ulang untuk gym), `src/story.js`, `src/bogor.js` (dialog Pak Botani).
Tugas pertama: rancang battle Gym Kebun Raya (Pak Botani, Lv min 20) end-to-end beserta Medali Talas dan skill Tebas. Semua angka di CHECKLIST adalah USULAN yang belum disetujui San, jadi tanyakan dulu dengan AskUserQuestion pilihan yang paling menentukan (ukuran tim, level lawan, larangan item, hadiah), lalu implementasikan, uji (Playwright, lihat trik save di CLAUDE.md), dan perbarui bagian Status di `handover/03-GAMEPLAY.md`. Sebelum itu balas ringkas: pemahamanmu + urutan kerja. Cabang `gameplay/...`. Bahasa Indonesia (aku/kamu), panggil San.

---
## 4. Documentation
Kamu bekerja untuk San di game **Maimon · Edisi Jawa**. Sesi ini = **Documentation**: menjaga dokumen sesuai kenyataan kode. Baca: `CLAUDE.md`, `handover/00-README.md`, `handover/04-DOCUMENTATION.md`, lalu semua dokumen Project "Game" folder `maimon/` (GAME-SPECS, WORLD-MAP-v1, CITY-IDENTITY, PROGRESSION, CHECKLIST, BOGOR-STATUS) via `project_read`. Bandingkan dengan kode (`git log`, `grep`, jalankan `__g`) dan catat ketidakcocokan.
Tugas pertama: (1) buat audit singkat dokumen vs kode (angka XP, level gym, ukuran, daftar spesies, versi cache), (2) buat `CHANGELOG.md` mulai v40, (3) perbarui README (masih menyebut hanya Depok), (4) susun checklist tes perangkat asli (HP + iPad) untuk San. Jangan mengubah mekanik game. Pakai `project_read` lalu `project_write` isi penuh untuk memperbarui dokumen Project. Cabang `docs/...`. Bahasa Indonesia (aku/kamu), panggil San.

---
## Prompt tambahan: sinkronisasi antar sesi (tempel kapan saja)
Sebelum lanjut, baca `handover/STATUS-*` dan bagian "Status" di semua file `handover/0X-*.md` serta `git log --all --oneline | head -30`. Rangkum apa yang berubah di sesi lain yang memengaruhi pekerjaanmu, selesaikan konflik di `src/` (bukan di `index.html`), build ulang, lalu lanjutkan.
