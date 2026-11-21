# Maimon · Edisi Jawa — Spesifikasi Game (diperbarui 21 Nov 2026)

Dokumen ini merangkum game Maimon: apa yang SUDAH jalan di versi sekarang (`index.html`, cache `maimon-v39`, repo sikhsanf/Maimon) dan apa yang SUDAH DIPUTUSKAN tapi belum dibuat. Dokumen lain:
- `maimon/WORLD-MAP-v1.md` — peta, kota, jalur, field.
- `maimon/BOGOR-STATUS.md` — status kota Bogor dan alur cerita Depok.
- `maimon/CITY-IDENTITY.md` — "rasa" tiap kota (palet, cuaca, ikon, musik) dan aturan membuat kota baru.
- `maimon/PROGRESSION.md` — kurva XP, level, evolusi, pelatih, syarat level gym.
- `maimon/CHECKLIST.md` — checklist pekerjaan berikutnya (uang, kereta, battle gym).
- Galeri (artifact): "Maimon · Galeri Kota" dan "Maimon · Galeri Sprite", dibuat otomatis oleh `tools/gallery.py` (lihat bagian 16).

## 1. Gambaran umum
- Game petualangan menangkap dan melatih **Maimon** (mirip Pokémon, tema Indonesia), untuk San bermain bersama anaknya (±5 tahun) dan orang tua.
- Diorama piksel 3D (Three.js), satu file HTML, PWA, kamera ortografis yang bisa diputar. Musik prosedural WebAudio (tema per kota + battle + musik sinematik pembuka).
- Edisi pertama: **Jawa** (12 kota, 16 rute). Cerita dimulai di Depok.
- Konten ramah anak: tanpa kekerasan eksplisit, tanpa simbol agama, Maimon "kalah" kabur atau dikasih makan.
- Kontrol (19 Nov): joystick melayang di separuh KIRI layar (muncul di titik sentuh), geser di separuh KANAN untuk memutar kamera (aktif setelah geser > 12 px), tombol ⟲ ⟳ memutar kamera 45°, WASD di desktop, `E`/Enter untuk bicara.
- Menu awal: kalau ada save, **▶ Lanjutkan** jadi tombol besar hijau (menampilkan nama dan jumlah teman), **Main Baru (hapus save)** kecil di bawahnya dan minta konfirmasi dulu. Save otomatis: tiap 5 detik saat main, setelah battle, dan saat aplikasi ditutup. Posisi terakhir ikut disimpan (`pos`); kalau sedang di dalam Lab, kembali di depan pintu Lab; kalau posisi terblokir, jatuh ke titik awal.
- **Beri nama (19 Nov)**: setiap Maimon yang didapat memunculkan kotak "Mau kasih nama untuk X?" (maks 10 huruf, Beri nama / Lewati). Nama panggilan disimpan di `nick` pada `mates` dan `box`.
- Hotel Maimon: Lv ditampilkan sebagai lencana gelap besar bertulisan kuning supaya terbaca anak.
- Teks game memakai font yang mudah dibaca anak (diganti 20 Nov setelah keluhan: label dan teks Maimon/Lv/HP font sistem tebal ukuran lebih besar; judul tetap Pixelify).
- Simpan: `maimon_save_v1` (localStorage). Build: `python3 build.py` menggabungkan `src/` menjadi `index.html`. Urutan file: head.html, engine, builders2, world1–4, field, outer, bogor, lab, quad, evo, camrender, music, npc, gameA, story, gather, menus, evolve, trainer, gameB.

## 2. Alur cerita yang sudah jalan (Depok → Bogor)
0. Cari Prof. Catherine di lab, lalu pilih starter (Kancik/Daun, Cebongi/Air, Pioyo/Api).
1. Tutorial: buka menu, memancing, menanam, tas (dengan sorotan layar dan petunjuk menutup menu).
2. Tangkap 3 Maimon biasa (Kucingko, Tikusil, Dombanyo).
3. Lapor ke Prof.
4. Istirahat di Hotel Maimon (Bu Wati).
5. Pagi berikutnya, Prof. Catherine memberi **surat untuk Pak Botani** (pemimpin Gym Kebun Raya). Stage 6: tujuan "Antar surat Prof ke Pak Botani".
6. Pak Polisi di gerbang J1 membuka palang kalau ada surat (stage 6→7). Tanpa surat: "ada acara besar".
7. Antar surat ke Pak Botani (stage 7→8). Stage 8+: jelajah Bogor; Gym Kebun Raya belum bisa dilawan (Botani menyebut level minimal gym, lihat bagian 14).
- Terkunci sebelum waktunya: sebelum bertemu Prof semuanya terkunci; tutorial membuka mancing + jagung; Klinik stage ≥2; Hotel stage ≥4.
- Panah/jalur arah HANYA untuk misi utama (keputusan San 20 Nov): hal lain (klinik, dll) tidak mengubah tujuan.
- Lab dalam ruangan, klinik dengan animasi penyembuhan, Pak Tani, layar buat karakter, kamera otomatis zoom ke kejadian penting.

## 3. Sistem pertarungan (sudah jalan)
- Giliran, tiap Maimon punya 4 jurus (belajar per level). Jurus bertipe Biasa atau tipe elemen.
- Kerusakan: dasar jurus × efektivitas tipe × STAB (1,5 kalau tipe jurus = tipe Maimon) × faktor level (0,55 + 0,09·level) / 7 × acak 0,9-1,1. Maimon liar menyerang dengan faktor 0,7; Maimon pelatih 0,9.
- Efektivitas: ampuh ×1,6, kurang ampuh ×0,7, lainnya ×1. Tipe Biasa selalu ×1.
- Status (peluang 30% oleh jurus bertipe tertentu): **Terbakar 🔥** (Api, 4 giliran, −8% HP per giliran), **Keracunan ☠️** (Daun, 4 giliran, −7% HP), **Pusing 💫** (Suara, 2 giliran, 40% gagal menyerang). Maimon pemain tidak turun di bawah 1 HP karena status.
- Menangkap: beri makan favorit ke Maimon yang sudah lemah. Peluang tergantung **kelangkaan** (bagian 3b). Tangkapan pertama selalu berhasil. Batas waktu 20 detik; kalau lewat, Maimon kabur.
- Kalah dan tidak diberi makan: langsung kabur.
- **Ganti Maimon**: tombol 🔄 Ganti membuka daftar teman yang masih kuat; memakan 1 giliran. Kalau Maimon bertarung pingsan dan masih ada teman kuat, WAJIB memilih pengganti. Batal ganti mengembalikan tombol jurus (bug 20 Nov sudah diperbaiki).
- Kamera battle: zoom ke arena, memilih sudut yang tidak terhalang; musik battle (biasa dan langka) dan jingle menang/kalah.

## 3b. Kelangkaan dan peluang tangkap
| Kelangkaan | Bintang | Peluang ikut |
|---|---|---|
| Umum | ★ | 80% |
| Jarang | ★★ | 60% |
| Langka | ★★★ | 40% |
| Epik | ★★★★ | 25% |

- Maimon berkilau (varian `st 2` liar) naik satu tingkat kelangkaan.
- Sekarang: Kucingko, Tikusil, Dombanyo = Umum; Kancik, Cebongi, Pioyo (versi liar) = Langka. Belum ada Jarang atau Epik.
- Tabel di kode: `RARITY`, `RARITY_OF`. Tiap Maimon baru wajib diberi kelangkaan.

## 4. Tipe Maimon (6 tipe)
Tipe: **Api, Air, Daun, Suara, Batu, Bayangan**, plus **Biasa** (hanya untuk jurus dasar).

- Segitiga 1: **Air > Api > Daun > Air**
- Segitiga 2: **Suara > Batu > Bayangan > Suara**
- Antar segitiga: netral (×1).

| Penyerang → Bertahan | Api | Air | Daun | Suara | Batu | Bayangan |
|---|---|---|---|---|---|---|
| **Api** | 1 | 0,7 | **1,6** | 1 | 1 | 1 |
| **Air** | **1,6** | 1 | 0,7 | 1 | 1 | 1 |
| **Daun** | 0,7 | **1,6** | 1 | 1 | 1 | 1 |
| **Suara** | 1 | 1 | 1 | 1 | **1,6** | 0,7 |
| **Batu** | 1 | 1 | 1 | 0,7 | 1 | **1,6** |
| **Bayangan** | 1 | 1 | 1 | **1,6** | 0,7 | 1 |

**Tipe ganda**: efektivitas = perkalian dua tipe pembela, dibatasi **0,5 sampai 2,0**; STAB 1,5 kalau jurus sama dengan salah satu tipe penyerang; chip tipe di layar ditampilkan dua.

**Tipe Cahaya (BARU 21 Nov)**: dipakai hanya sebagai tipe kedua bentuk evolusi tertentu (Katakraya, Jagoapi, Gembulon). Netral di tabel (tidak kuat/lemah terhadap siapa pun). Warna chip emas.

Status per tipe: Api → Terbakar, Daun → Keracunan, Suara → Pusing, Bayangan → Takut (sudah di kode, belum ada Maimon Bayangan). Air, Batu tanpa status.

Warna chip tipe: Api `#e8582a`, Air `#3b8fd6`, Daun `#4fae4f`, Suara `#b07ad8`, Batu `#9a8a70`, Bayangan `#4a4466`, Cahaya `#e0b830`.

Faktor efektivitas 1,6 / 0,7 dipertahankan.

**Aturan tim gym leader:** tim tidak murni satu tipe. Tema gym menentukan tipe utama, tapi minimal satu Maimon di tim bertipe **Biasa**.

## 5. Maimon yang ada sekarang (6 keluarga, 15 bentuk)
| Keluarga | Tahap 1 (tipe) | Tahap 2 (Lv 16) | Tahap 3 (Lv 33) |
|---|---|---|---|
| Kancik (starter) | Kancik (Daun) | Kancilon (Daun) | Kancilraja (Daun + Batu) |
| Cebongi (starter) | Cebongi (Air) | Kodi (Air) | Katakraya (Air + Cahaya) |
| Pioyo (starter) | Pioyo (Api) | Petokar (Api) | Jagoapi (Api + Cahaya) |
| Kucingko | Kucingko (Suara) | Macanko (Suara) | — |
| Tikusil | Tikusil (Batu) | Tikusgar (Batu) | — |
| Dombanyo | Dombanyo (Daun) | Gembulon (Daun + Cahaya) | — |

Sprite terpilih (21 Nov, setelah San memilih dari opsi A/B): Kancilon B, Kancilraja B (Rusa Pohon), Kodi B, Katakraya A (Raja Katak berdiri), Petokar A, Jagoapi B (Feniks), Macanko A, Tikusgar B (Tikus Bor), Gembulon B (Domba Raja). Catatan San: bentuk dasar harus berubah, bukan hanya aksesori; evolusi ke-3 harus "wah". Semua sprite ada di artifact **Galeri Sprite**.

## 6. Dunia dan jalur (ringkas, detail di WORLD-MAP-v1)
- 12 kota: 9 kota gym (Bogor, Bandung, Cirebon, Semarang, Solo, Yogyakarta, Surabaya, Malang, Jakarta) + 3 non-gym (Depok awal, Ujung Kulon, Karimunjawa).
- Ukuran: Kota Kecil 26×20, Sedang 36×28 (Depok), Besar 50×38. Field Kecil 12×24, Sedang 14×40, Besar 18×56. 16 rute, 58 field.
- Alur utama: Depok → Bogor → Bandung → Cirebon → Semarang → Solo → Yogyakarta → Surabaya → Malang → Jakarta. Boleh melompat selama punya skill dan level wild di field naik per area.
- Gerbang skill: **Tebas** (gym 1), **Panjat** (gym 2), **Seberang** (gym 3), **Kapal** (gym 4), **Terbang** (gym 7; pindah instan ke kota yang pernah dikunjungi).
- Jakarta (gym 9) dijaga gerbang Pasar Minggu: butuh Seberang DAN **8 Medali**.
- Ujung Kulon: masuk lewat J16 dengan Tebas; Maimon badak di balik tebing Gunung Honje (butuh Panjat).

## 7. Gym, tipe, Medali, dan level minimal
Hadiah gym = **Medali** (9 total). Depok tidak punya gym.

| # | Kota | Tipe | Gym | Pemimpin | Medali | Skill | Lv min tantang |
|---|---|---|---|---|---|---|---|
| 1 | Bogor | Daun | Gym Kebun Raya | Pak Botani | Talas | Tebas | **20** |
| 2 | Bandung | Suara | Gym Angklung | Teh Angklung | Angklung | Panjat | 30 |
| 3 | Cirebon | Air | Gym Udang & Ombak | Nyi Ombak | Mega Mendung | Seberang | 40 |
| 4 | Semarang | Bayangan + Api | Gym Lawang Sewu | Nona Lampion | Lampion | Kapal | 50 |
| 5 | Solo | Bayangan + Suara | Gym Wayang | Ki Dalang | Wayang | | 60 |
| 6 | Yogyakarta | Batu + Daun | Gym Candi | Mbah Candi | Candi | | 70 |
| 7 | Surabaya | Batu + Air | Gym Galangan Kapal | Cak Kapten | Jangkar | Terbang | 80 |
| 8 | Malang | Batu + Api | Gym Bromo | Pak Bromo | Apel | | 90 |
| 9 | Jakarta | Campur semua tipe | Gym Monas | Bang Jawara | Monas | | 99 |

Lv min = level Maimon TERTINGGI di tim (konstanta `GYM_MINLV`, fungsi `gymReady(n)`). Bogor 20 permintaan San; sisanya dibagi rata ±10 level karena selisih 15 tidak muat (Lv maks 99). Pak Botani sudah memakai pengecekan ini di dialog; battle gym-nya sendiri belum dibuat.

## 8. Peta di dalam game (rencana)
- Layar peta dua mode: peta Jawa (kota + rute) dan peta lokal.
- Kota yang sudah dikunjungi menyala; rute bergembok menampilkan skill yang dibutuhkan. Dipakai juga untuk memilih tujuan kereta (lihat CHECKLIST).
- Referensi tampilan: artifact "Maimon — Simulasi Peta Jawa".

## 9. Daftar pekerjaan (belum dibuat)
Prioritas ada di `maimon/CHECKLIST.md`:
1. Skema uang (belum ada mata uang, toko Bogor belum berfungsi).
2. Kereta antar kota.
3. Skema battle gym (tim, level, interior, hadiah Medali + skill).
4. Konstanta ukuran `SIZE.kecil/sedang/besar`.
5. Sistem skill/gerbang (Tebas, Seberang, Panjat, Kapal, Terbang) + Medali + gerbang Jakarta.
6. Kota dan field berikutnya (J4 Bogor–Bandung, Bandung, dst.), masing-masing dengan "rasa" sendiri (lihat maimon/CITY-IDENTITY.md).
7. Layar peta dalam game.
8. Maimon baru per kota/tipe (Bayangan pertama, badak Ujung Kulon).
9. Cek di perangkat asli (FPS, loading, sentuh, musik saat pindah aplikasi di iPad).
Selesai: refactor 6 tipe (18 Nov), J1 dan Bogor, evolusi, kurva XP Lv 99, pelatih di field, level minimal gym, galeri.

## 10. Keputusan 18 Nov 2026
- 12 kota dikonfirmasi benar. Ukuran tim gym: 2 Maimon di gym 1, naik sampai 4 di gym 5, 5-6 di Jakarta; selalu ada minimal satu Maimon Biasa.
- Nama pemimpin gym dan Medali disetujui. Status Bayangan = **Takut**. Karimunjawa pulau bonus lewat Jepara. Ujung Kulon sulit dengan hadiah langka. Faktor 1,6 / 0,7 dipertahankan.

## 11. Belum diputuskan
- Tim dan susunan tipe tiap gym leader (level leader relatif terhadap Lv min).
- Angka pasti efek Takut.
- Maimon baru per kota dan Maimon Bayangan pertama.
- Skema uang, harga, dan aturan kereta (lihat CHECKLIST).

## 12. Aturan layout dan keamanan (WAJIB untuk semua kota)
1. NPC luar-ruang berdiri di pinggir jalan raya (maks 1,5 petak dari tepi jalan) dan dekat gedungnya (maks 1,5 petak). Kalau tidak bisa, layout kota yang diubah. (Pelatih di field dikecualikan: mereka berdiri di pinggir jalan field menghadap jalan.)
2. Pintu gedung NPC menghadap jalan.
3. Maimon liar tidak mendekati NPC luar-ruang dalam radius 5 petak (`NPC_SAFE = 5`).
4. Battle liar tidak mulai tepat setelah dialog, menu, klinik, panen/mancing atau keluar lab (jeda 1,5-3 dtk).
5. Kotak HUD tidak saling menimpa.
6. Cek otomatis: `__g.npcRule()` semua `ok: true` sebelum commit kota baru.

## 13. Performa dan suara
- Auto-hemat bertahap kalau rata-rata frame > 34 ms: level 1 (bayangan 1024px, update tiap 2 frame, musik tanpa arp), level 2 (resolusi retro, musik tanpa pad atas, gerimis Bogor dimatikan). Paksa lewat `?perf=0/1/2`.
- AudioContext `latencyHint: playback`, reverb 1,2 detik. Musik dihentikan saat aplikasi di latar belakang/ditutup (visibility, pagehide, freeze, blur) dan lagu lama dibersihkan sebelum lagu baru supaya tidak menumpuk (21 Nov, dari bug iPad; perlu dicek di perangkat).
- Lagu per area: Depok (desa tenang, 92 bpm), jalur J1, **Bogor** (lagu sendiri, 20 Nov), battle biasa dan langka.
- Splash Learnersfam lalu loading 7 detik dengan mini game lompat; `?noboot` melewatinya (untuk tes).
- Film pembuka: bar sinematik, subtitle, tombol Lewati.
- Efek naik level: kilat emas, banner LEVEL UP, bintang, Maimon melompat, fanfare.
- Kecepatan jalan 3,6 petak/detik. Panah jalan: jalur A* dirapikan jadi garis lurus (tidak berputar); untuk misi utama saja.

## 14. XP, level, dan evolusi (ringkas; detail di PROGRESSION.md)
- Level maks **99**. XP per level: `(2 + 0,00454·(lv−1)²) × (10 + 4·lv)`. XP battle: `(10 + 4·level lawan) × 2 kalau langka`; Maimon pemimpin penuh, teman setengah; penalti 12% per selisih level di atas lawan (min 25%).
- Kurva sengaja dibuat: Lv 20 ±2,4 jam main, Lv 99 ±80 jam (asumsi ±20 battle/jam, belum diukur di perangkat).
- Evolusi di **Lv 16 dan Lv 33** (Kucingko/Tikusil/Dombanyo hanya Lv 16). Saat naik ke Lv itu muncul "Evolusi! / Nanti"; juga tombol di kartu Tim. Animasi: siluet berkedip, kilatan putih, sprite baru, bintang. HP, jurus baru (Lv 18/20/26/34), tipe kedua ikut tahap. Maimondex menampilkan rantai evolusi (belum ditemukan = ???).

## 15. Pelatih (trainer) di field (BARU 21 Nov)
- Hanya di field, TIDAK di kota. Berdiri di pinggir jalan menghadap jalan; kalau pemain lewat di depan matanya (≤6 petak, kerucut ±35°) muncul "❗ melihatmu!", dialog, lalu battle. Bisa juga diajak bicara. Aktif mulai stage 4.
- Battle: tidak bisa kabur, Maimon pelatih tidak bisa ditangkap, urut satu per satu. Menang: XP ×1,3 + hadiah makanan (2×) dan tidak menantang lagi. Kalah: ke Klinik, pelatih menunggu 60 dtk, boleh menantang ulang.
- J1: Dodi si Pramuka (Kucingko Lv 5; hadiah jagung), Bu Ratna (Tikusil 6 + Dombanyo 6; wortel), Bang Jalu Sopir (Kancik 7 + Cebongi 8; ikan). Data di `TRAINERS` (src/trainer.js); tambah pelatih = tambah entri.
- Aturan ke depan: field standar 1-3 pelatih; level pelatih ≈ level wild area +1..3; field gerbang/Sedang boleh lebih.

## 16. Galeri artifact (BARU 21 Nov)
- **Maimon · Galeri Kota**: tiap kota/field dengan julukan, deskripsi "rasa", palet warna, dan 3-4 tangkapan layar dari game.
- **Maimon · Galeri Sprite**: semua keluarga Maimon, tiap tahap evolusi, tipe, level evolusi, deskripsi dan habitat (dibaca otomatis dari data game).
- Dibuat oleh `tools/gallery.py` (butuh `python3 -m http.server 8765` di root repo, Playwright + Chrome). Kota baru: tambah entri di daftar `PLACES` (posisi kamera harus di titik yang tidak terblokir; skrip memberi peringatan). Maimon baru otomatis masuk. Jalankan ulang tiap selesai bikin kota atau Maimon baru, lalu publikasi ulang artifact (slug sama).
