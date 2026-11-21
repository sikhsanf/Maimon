# Handover Maimon → Claude Code (21 Nov 2026, build v40)

Dipecah jadi 4 sesi kerja. Tiap sesi punya file handover sendiri + first prompt (`FIRST-PROMPTS.md`). Konteks bersama ada di `../CLAUDE.md` (dibaca otomatis).

| # | Sesi | Fokus | File |
|---|---|---|---|
| 1 | World building | Kota, field, atmosfer, ikon, sambungan zona, peta dalam game | 01-WORLD-BUILDING.md |
| 2 | Maimon development | Spesies, sprite, tipe, evolusi, kelangkaan, Maimondex, habitat | 02-MAIMON-DEVELOPMENT.md |
| 3 | Gameplay | Battle gym, uang/toko, kereta, skill gerbang, XP/keseimbangan, cerita | 03-GAMEPLAY.md |
| 4 | Documentation | Spek, galeri, changelog, checklist tes perangkat, README | 04-DOCUMENTATION.md |

## Keadaan sekarang (v40, live di GitHub Pages)
- Sudah jalan: Depok (kota awal, Lab, Klinik, Hotel, KRL), J1 Depok–Bogor (1 field Sedang, 3 pelatih, polisi), Bogor (Kota Hujan, Tugu Kujang raksasa, Klinik, Hotel, Kebun Raya, gerbang Gym), alur cerita stage 0→8, battle (6 tipe + Cahaya, status, ganti Maimon, tangkap dengan kelangkaan), 6 keluarga/15 bentuk dengan evolusi Lv 16/33, XP Lv 99, syarat level gym, sistem pelatih, nama panggilan, save otomatis, musik prosedural per area, mode hemat performa.
- Belum ada: battle gym Pak Botani + interior gym, Medali, skill (Tebas dkk), uang/toko, kereta, peta dalam game, kota/field selain J1+Bogor, Maimon Bayangan, badak Ujung Kulon.
- Belum dicek di perangkat asli: FPS (gerimis/atmosfer), loading, sentuh, musik iPad.

## Keputusan terbuka yang butuh San
1. Selisih Lv antar gym: 15 tidak muat (20+8×15=140 > 99). Sekarang ±10. Opsi: gym lebih sedikit / Jakarta tidak di Lv 99 / tetap ±10.
2. Level Maimon liar & pelatih di J1/Bogor (Lv 5–10) terlalu rendah vs syarat gym Lv 20 → naikkan?
3. Semua default di CHECKLIST.md (uang, kereta, gym) adalah usulan, belum disetujui.
4. Lonjakan HP saat evolusi besar (Kancik Lv 16 ≈ 86 → 139): turunkan?
5. Keseimbangan damage di level tinggi (Lv 50–99) belum dites.

## Cara memulai (San)
1. Di aplikasi Claude → Claude Code → buka folder repo Maimon (clone `github.com/sikhsanf/Maimon`).
2. Buat 4 sesi/worktree: `git worktree add ../maimon-world -b world/main` (ulangi: `maimon-maimon`, `maimon-gameplay`, `maimon-docs`).
3. Tempel first prompt yang sesuai (`FIRST-PROMPTS.md`) di tiap sesi.
4. Dokumen lengkap dibaca dari Project "Game" (folder `maimon/`); Claude Code di sesi terhubung Project bisa `project_read`. Kalau tidak terhubung, salinan ada di `handover/docs/` (diekspor).

## Peta file kode (src/) → sesi pemilik
| File | Isi | Sesi utama |
|---|---|---|
| engine, camrender, builders2 | renderer, kamera, builder bangunan/prop | World |
| world1–4, field, outer, bogor, lab | Depok, J1, Bogor, tepi map, lab | World |
| music | lagu per area, battle, jingle | World (lagu kota), Gameplay (battle) |
| quad, evo, evolve | sprite/rig Maimon, data evolusi, animasi evolusi | Maimon |
| gameA | spesies, tipe, jurus, XP, battle, tangkap, RARITY | Maimon (data) + Gameplay (battle) — dipakai bersama |
| story, gather, trainer, gameB | cerita/NPC dialog, mancing/panen, pelatih, loop utama + ekspor `__g` | Gameplay |
| menus, npc | Maimondex/Tim/Tas, NPC | Maimon (dex) / Gameplay (tas) |
Catatan: pemetaan dari ringkasan; verifikasi dengan `grep` sebelum mengubah.
