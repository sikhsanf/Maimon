# Maimon — Checklist Fitur Berikutnya (21 Nov 2026)

Tiga topik dari San: 1) skema uang, 2) kereta antar kota, 3) skema battle gym. Semua default di bawah adalah USULAN Zaya, belum disetujui San. Centang setelah dikerjakan.

## 1. Skema uang
Tujuan: ada alasan kuat untuk battle, belanja, dan bepergian; tidak membuat game jadi grinding.
- [ ] Nama mata uang + simbol (usul: Rupiah, tampil "Rp"; harga kecil agar angka tidak membengkak)
- [ ] Sumber uang: hadiah pelatih (usul: 40 + 15×level tim lawan tertinggi), jual barang temuan, bonus misi, hadiah gym
- [ ] Wild battle TIDAK memberi uang (usul) supaya grinding liar tidak dobel guna
- [ ] Penalti kalah: kehilangan 10% uang, maks Rp 500 (usul), pesan klinik tetap
- [ ] Pengeluaran: makanan (jagung/wortel/ikan), Bola Tangkap (perlu dibuat daftar item), obat, tiket kereta, penginapan hotel
- [ ] Toko: Warung/Mart per kota, stok dan harga di tabel (satu tabel `SHOP` di kode)
- [ ] Tampilan uang di HUD + tas, disimpan di save (`S.money`)
- [ ] Tabel harga tiap item dan hadiah pelatih J1 yang sudah ada (2 jagung dst) diganti/ditambah uang
- [ ] Keseimbangan: hitung uang masuk per jam vs harga tiket kereta antar kota

## 2. Kereta antar kota
Dasar: Depok sudah punya KRL dan rel di dunia. Kota lain akan punya stasiun sendiri.
- [ ] Peta rute: Depok → Bogor → … sesuai urutan WORLD-MAP (usul: tiap kota yang sudah dibuka punya stasiun)
- [ ] Aturan buka: stasiun kota X aktif setelah pemain pernah datang ke kota X secara jalan kaki/menang gym (usul: "fly point" ala Pokémon)
- [ ] Tiket: harga per rute (bergantung skema uang) atau tiket terusan hadiah gym
- [ ] Alur UI: masuk stasiun → loket → peta rute → pilih tujuan → layar naik kereta → tiba
- [ ] Animasi/transisi kereta (usul: layar lewat pemandangan 3–5 detik, bisa dilewati)
- [ ] Jadwal: tanpa jadwal tunggu (usul) supaya tidak membosankan
- [ ] Stasiun di tiap kota (model + loket + NPC penjaga) dan aturan `npcRule` untuk area stasiun
- [ ] Keamanan alur cerita: kereta tidak boleh melompati gating cerita (polisi/surat Prof ke Bogor harus tetap)
- [ ] Simpan daftar stasiun terbuka di save (`S.stations`)

## 3. Skema battle gym
Syarat level sudah ada (`GYM_MINLV`). Yang belum: battle-nya.
- [ ] Format: pemimpin gym memakai 3 Maimon (usul), naik per gym sampai 6 di gym 9
- [ ] Level lawan: ±2 di atas syarat level gym (usul; mis. gym 1 Lv 20 → lawan Lv 20–23)
- [ ] Tipe tiap gym (selaras GAME-SPECS bagian gym: tema tipe pemimpin)
- [ ] Pembukaan gym: pelatih perantara di dalam gym? (usul: 2 pelatih kecil sebelum pemimpin, memakai sistem pelatih yang sudah ada)
- [ ] AI pemimpin: lebih pintar dari liar (usul: memilih jurus efektif secara tipe 70% waktu)
- [ ] Larangan item di battle gym? (usul: boleh, maks 3 kali pakai agar seimbang)
- [ ] Hadiah: lencana, uang besar, TM/jurus, tiket kereta ke kota berikutnya
- [ ] Kalah: kembali ke klinik, boleh coba lagi tanpa batas
- [ ] Dialog sebelum/sesudah, pose lencana, animasi kemenangan
- [ ] Lencana tampil di Maimondex/Profil, simpan di save (`S.badges`)
- [ ] Setelah lencana 1, Pak Botani membuka jalan ke kota berikutnya (gating cerita)

## Sudah selesai (referensi)
- [x] Slow leveling + Lv maks 99 + syarat level gym
- [x] Pelatih di field J1 (3 pelatih)
- [x] Rasa kota Depok vs Bogor + Tugu Kujang besar
- [x] Galeri kota dan sprite (artifact)

## Pertanyaan yang menunggu San
1. Selisih 15 level antar gym tidak muat (20 + 8×15 = 140). Pilih: gym lebih sedikit, Jakarta tidak di Lv 99, atau tetap ±10.
2. Level liar dan pelatih di J1/Bogor masih rendah dibanding syarat Lv 20; mau dinaikkan?
