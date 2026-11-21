# Sesi 3 — Gameplay

## Misi
Sistem yang membuat game "main-able": battle gym, uang & toko, kereta antar kota, skill gerbang, keseimbangan XP/level, dan alur cerita lanjut. Ramah anak 5 tahun: sederhana, tidak menghukum.

## Sudah ada
- Battle bergiliran, 4 jurus, damage = dasar × efektivitas × STAB × (0,55+0,09·lv)/7 × acak 0,9–1,1 (liar ×0,7, pelatih ×0,9); status; tangkap dengan makanan favorit + peluang kelangkaan + batas 20 dtk; ganti Maimon (1 giliran; wajib ganti kalau pingsan); kabur diblokir untuk pelatih.
- XP: `LVCAP=99`; `xpNeed(L)=round((2+0.00454·(L−1)²)·(10+4L))`; `xpFor(w)=round((10+4·w.lv)·(rare?2:1))`; `xpShare` penalti 12%/selisih level (min 25%); leader penuh, teman setengah; pelatih ×1,3. Kumulatif (≈20 battle/jam, asumsi): Lv20 ≈2,6k (2,4 j) · Lv30 ≈7,5k (4,7 j) · Lv40 ≈18k (8 j) · Lv50 ≈38k (13,5 j) · Lv60 ≈73k (21 j) · Lv70 ≈127k (31 j) · Lv80 ≈209k (44 j) · Lv90 ≈327k (61 j) · Lv99 ≈471k (80 j).
- Syarat level gym: `GYM_MINLV=[20,30,40,50,60,70,80,90,99]`, `gymTopLv()`, `gymReady(n)`; Pak Botani sudah memakainya di dialog.
- Pelatih (`trainer.js`): `TRAINERS` (id/name/look/pos/ang/sight/team/reward/pre/win/lose/again), kerucut pandang (≤6 petak, ±0,62 rad), aktif stage ≥4, XP×1,3, hadiah via `addBag`, kalah → klinik + cooldown 60 dtk. J1: Dodi (Kucingko 5), Bu Ratna (Tikusil 6 + Dombanyo 6), Bang Jalu (Kancik 7 + Cebongi 8).
- Cerita stage 0→8 (surat Prof → polisi → Pak Botani), tutorial, klinik, hotel, mancing/panen, save otomatis.
- Kontrol: joystick melayang kiri, geser kanan memutar kamera, ⟲⟳ 45°, WASD, E/Enter.

## Backlog (urutan usulan; default di CHECKLIST.md adalah usulan, belum disetujui San — konfirmasi dulu)
1. **Battle gym 1 (Pak Botani, Daun, Lv min 20)**: 3 Maimon (usul), lawan Lv 20–23, ≥1 Biasa; 2 pelatih kecil sebelum pemimpin; interior gym (koordinasi World); Medali Talas; membuka skill **Tebas**; dialog sebelum/sesudah; kalah → klinik, coba lagi tanpa batas. Hook: `gymReady(1)`. Lalu generalisasi untuk 9 gym (data tim per gym).
2. **Skema uang**: Rp; sumber = hadiah pelatih (usul 40+15×lv tertinggi tim lawan), jual barang, bonus misi; wild tidak memberi uang; kalah −10% maks Rp 500; `S.money`, HUD, Toko per kota (`SHOP`), daftar item (Bola/makanan/obat) dan harga.
3. **Kereta antar kota**: stasiun aktif setelah pernah datang, tiket berbayar, tanpa jadwal tunggu, layar transisi 3–5 dtk (bisa dilewati), peta rute (butuh layar peta — World), tidak melompati gating cerita; `S.stations`.
4. **Sistem skill/gerbang**: Tebas (gym1), Panjat (gym2), Seberang (gym3), Kapal (gym4), Terbang (gym7, pindah instan); Medali `S.badges`; gerbang Jakarta butuh Seberang + 8 Medali.
5. **Penyetelan level**: naikkan level liar & pelatih per area (usul: pelatih ≈ wild+1..3); uji kurva XP nyata di perangkat (asumsi 20 battle/jam belum diukur); cek damage/HP di level tinggi.
6. Pelatih di field berikutnya (1–3 per field; hadiah uang setelah ada skema uang).
7. Cerita bab berikut (setelah Tebas: Bandung via J4).
8. Cek perangkat asli: sentuh, FPS, musik iPad.

## Keputusan terbuka (tanya San)
Selisih Lv gym (15 tidak muat; sekarang ±10), level liar J1/Bogor, angka efek Takut, ukuran tim per gym (18 Nov: 2 di gym 1 → 4 di gym 5 → 5–6 di Jakarta).

## Jebakan
- Save `maimon_save_v1`: tambah field baru dengan default aman agar save lama tetap terbaca.
- `endBattle` → `trainerEnd` untuk lawan `w.tr`; battle gym sebaiknya memakai pola yang sama.
- Cooldown wild setelah dialog/menu/klinik (1,5–3 dtk).
- Kerusakan HP status tidak boleh membunuh Maimon pemain (min 1).

## Status
- 21 Nov: Lv 99 + syarat gym + pelatih J1 selesai. Sesi Gameplay belum mulai.
