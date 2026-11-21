# Sesi 1 — World Building

## Misi
Membangun dunia Jawa kota demi kota dan field demi field, tiap tempat punya "rasa" sendiri, tanpa melanggar aturan layout/NPC. Dunia = Depok → Bogor → Bandung → Cirebon → Semarang → Solo → Yogyakarta → Surabaya → Malang → Jakarta (+ Ujung Kulon, Karimunjawa bonus). 12 kota, 16 rute, 58 field (WORLD-MAP-v1.md).

## Sudah ada
- Depok (Sedang 36×28, x -18..18, z -14..14), J1 (field Sedang 14×40, z 14..54, x -8..6), Bogor (Sedang 36×28, z 54..82).
- Tepi map natural (`outer.js`): Depok utara sungai+jembatan putus (Seberang + 8 Medali), timur semak (Tebas), barat gerbang kayu.
- Bogor identity (`bogor.js`): `bogorTile`, `ATMO0/ATMO1` + `bogorAtmo()` (lerp sky/haze/light menurut player.z 42–58), overlay `#rain` (mati di perf≥2), Tugu Kujang ±7,5 petak, lampu heritage, pagar putih z=73.4, angkot, gerobak soto mie/asinan, `ROUND` ring 3,6/pulau 1,75.
- Aturan sambungan zona tanpa portal (jalan yang sama, gapura bertulis tujuan, rintangan fisik per skill): WORLD-MAP bagian 5b.
- Galeri otomatis: `python3 tools/gallery.py /tmp/gallery` → kota.html, sprite.html (daftar `PLACES`; posisi kamera harus tidak terblokir).

## Aturan wajib tiap zona baru (CITY-IDENTITY.md)
Beda dari kota lain di ≥5 dari 6 sumbu: cuaca/langit (ATMO), tanah (jalan/trotoar/rumput), palet bangunan, ikon besar, dekor khas, musik sendiri. Lolos `__g.npcRule()` (NPC ≤1,5 petak dari jalan & gedung, pintu menghadap jalan), Maimon liar menjauh ≥5 petak dari NPC (`NPC_SAFE`), HUD tidak menimpa. Ukuran standar: Kota Kecil 26×20 / Sedang 36×28 / Besar 50×38; Field Kecil 12×24 / Sedang 14×40 / Besar 18×56. Tiap zona: tambah entri `PLACES` galeri.

## Backlog (urut usulan)
1. Penyempurnaan Bogor: pohon besar di Jl. Pajajaran, toko+pasar kolonial, bendera/umbul-umbul, suara hujan (Belum).
2. J4 Bogor–Bandung (Ciawi, Puncak Pass [gerbang Tebas], Cianjur) → Bandung (Besar 50×38, rencana: Kota Kembang, Gedung Sate, art deco pastel, sejuk berawan).
3. Layar peta dalam game (peta Jawa + peta lokal; rute bergembok menunjukkan skill; dipakai untuk tujuan kereta). Referensi: artifact "Maimon — Simulasi Peta Jawa".
4. Stasiun tiap kota (model + loket) — koordinasi dengan sesi Gameplay (logika kereta).
5. Gerbang skill sebagai rintangan fisik (semak/tebing/sungai/laut) — koordinasi Gameplay (logika skill).
6. Kota berikutnya sesuai urutan alur; rencana rasa awal tiap kota ada di tabel CITY-IDENTITY (usulan, belum disetujui San).
7. Konstanta `SIZE.kecil/sedang/besar`.
8. Memuat zona bergantian (maks 2 aktif) kalau performa menuntut — sekarang semua dimuat saat loading.

## Jebakan
- Posisi terblokir pada tes jatuh ke titik awal; periksa dulu.
- Gerimis & atmosfer berat di perangkat lemah: pantau FPS; perf≥2 harus mematikan efek.
- Koordinat dunia tunggal; zona baru menyambung dari z=82 (Bogor) dan seterusnya.
- Ukuran file index.html ±385 KB; waspadai ledakan ukuran dengan banyak kota (pertimbangkan pemisahan/lazy load).

## Status (perbarui saat selesai)
- 21 Nov: Depok, J1, Bogor selesai (v40). Sesi World belum mulai.
