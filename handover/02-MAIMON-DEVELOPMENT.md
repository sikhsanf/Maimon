# Sesi 2 — Maimon Development

## Misi
Mengembangkan makhluk Maimon: spesies baru per kota/tipe, sprite & animasi, evolusi, kelangkaan, habitat, Maimondex, dan keseimbangan statistik. Anak 5 tahun harus bisa membedakan Maimon dari siluet dan warna.

## Sudah ada (6 keluarga, 15 bentuk)
| Keluarga | Tahap 1 | Tahap 2 (Lv 16) | Tahap 3 (Lv 33) |
|---|---|---|---|
| Kancik (starter) | Kancik Daun | Kancilon Daun | Kancilraja Daun+Batu |
| Cebongi (starter) | Cebongi Air | Kodi Air | Katakraya Air+Cahaya |
| Pioyo (starter) | Pioyo Api | Petokar Api | Jagoapi Api+Cahaya |
| Kucingko | Suara | Macanko Suara | — |
| Tikusil | Batu | Tikusgar Batu | — |
| Dombanyo | Daun | Gembulon Daun+Cahaya | — |
- Sprite terpilih San (opsi A/B): Kancilon B, Kancilraja B (Rusa Pohon), Kodi B, Katakraya A (Raja Katak berdiri), Petokar A, Jagoapi B (Feniks), Macanko A, Tikusgar B (Tikus Bor), Gembulon B (Domba Raja). Aturan San: bentuk dasar harus berubah, bukan aksesori; evolusi ke-3 harus "wah". Semua ada di artifact Galeri Sprite (`tools/gallery.py` membacanya dari `__g.MAI`).
- Tipe: Api, Air, Daun, Suara, Batu, Bayangan (+ Biasa untuk jurus dasar; Cahaya hanya tipe kedua evolusi, netral, chip emas). Segitiga: Air>Api>Daun>Air; Suara>Batu>Bayangan>Suara; ampuh ×1,6, kurang ×0,7; tipe ganda dikali, dibatasi 0,5–2,0; STAB 1,5. Status: Api Terbakar, Daun Keracunan, Suara Pusing, Bayangan Takut (ada di kode, belum ada Maimon Bayangan).
- Kelangkaan (`RARITY`, `RARITY_OF`): Umum 80%, Jarang 60%, Langka 40%, Epik 25%; berkilau (`st 2`) naik satu tingkat. Sekarang Kucingko/Tikusil/Dombanyo Umum; starter liar Langka. Belum ada Jarang/Epik. Setiap Maimon baru WAJIB diberi kelangkaan.
- Evolusi: Lv 16 dan 33 (Kucingko/Tikusil/Dombanyo hanya Lv 16); jurus baru Lv 18/20/26/34; animasi `evolve.js`; Maimondex mencatat rantai evolusi. HP: `hpMaxOf = HP dasar × (0,6+0,08·lv)`, HP dasar per tahap (Kancik 46→74→120).
- Beri nama panggilan (`nick`, maks 10 huruf).

## Backlog
1. **Maimon Bayangan pertama** (kemungkinan di Semarang/Lawang Sewu; status Takut perlu angka pasti — peluang gagal & durasi belum diputuskan).
2. **Maimon baru per kota/habitat** (Bandung: Suara; Cirebon: Air; dst.) — tiap kota punya spesies khas dengan kelangkaan Jarang/Epik untuk variasi. Wild per field: 3–10 spesies.
3. **Badak Jawa Ujung Kulon** (Epik, butuh Panjat, hadiah langka).
4. Maimon dengan tipe ganda sejak tahap 1 untuk gym 4–9 (gym tim tidak murni; ≥1 Maimon Biasa).
5. Tim gym leader: Maimon apa dan level berapa (koordinasi Gameplay — battle gym).
6. Turunkan lonjakan HP saat evolusi besar? (Kancik Lv 16 ≈ 86 → 139). Cek keseimbangan HP/serang di Lv 50–99.
7. Pengayaan Maimondex: habitat, deskripsi, tipe, rantai evolusi (sudah sebagian).
8. Sprite baru memakai rig `quad.js`/`evo.js`; sertakan siluet khas; uji di `portraitRig(key, build, rot, bust, px=160)` di `menus.js`.

## Jebakan
- `gameA.js` dipakai bersama sesi Gameplay: ubah data spesies dengan perubahan kecil dan sering di-merge.
- Siluet terlalu mirip = anak bingung; cek di galeri.
- Jangan reproduksi karakter/IP berhak cipta (Pokémon dll.); desain orisinal bertema fauna/budaya Indonesia.
- Top-level `const/let` TDZ lintas file (pakai `var`/fungsi).

## Status
- 21 Nov: 15 bentuk selesai; Galeri Sprite terbit (https://claude.ai/artifact/LLj8UxG8bYKXpjHuUSigD4). Sesi Maimon belum mulai.
