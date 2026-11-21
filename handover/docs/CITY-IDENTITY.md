# Maimon — "Rasa" Tiap Kota (21 Nov 2026)

Permintaan San (21 Nov): tiap kota harus benar-benar terasa BEDA, bukan hanya layout. Dokumen ini mendefinisikan identitas tiap kota dan aturan membuat kota baru. Tangkapan layar ada di artifact **Maimon · Galeri Kota**.

## Aturan untuk SETIAP kota baru
Tiap kota wajib berbeda dari kota lain pada minimal 5 dari 6 sumbu ini, dan semuanya tercatat di tabel bawah:
1. **Cuaca/langit** (terang, kelabu, senja, kabut, berasap, dll). Diatur lewat `ATMO` (langit, kabut, cahaya matahari/hemisfer) dan overlay (gerimis dll).
2. **Tanah**: bahan jalan dan trotoar (aspal, paving, batu, tanah, pasir, keramik) dan warna rumput.
3. **Palet bangunan dan gaya** (genteng, kolonial, rumah adat, kawasan industri, dll).
4. **Ikon besar** (monumen/landmark yang terlihat dari jauh, lebih besar dari bangunan biasa).
5. **Dekor khas** (lampu, pagar, kendaraan, gerobak, flora yang unik kota itu).
6. **Musik sendiri** (tema per kota).
Kota baru juga wajib lolos `__g.npcRule()` (GAME-SPECS bagian 12) dan punya entri di `tools/gallery.py` (`PLACES`).

## Tabel identitas
| Kota | Julukan | Cuaca | Tanah | Bangunan | Ikon | Dekor khas | Musik |
|---|---|---|---|---|---|---|---|
| Depok | Kota Kampus & KRL | Cerah hangat | Aspal abu bergaris kuning, rumput kuning-hijau | Genteng merah/teal, rumah kampung | Lab Prof, kereta KRL di rel | Kebun jagung, kabel, van biru | Desa tenang 92 bpm |
| J1 | Lintas Raya Bogor | Makin kelabu ke selatan (transisi) | Jalan lanjutan Margonda | Warung pinggir jalan | Jembatan Cipakancilan | Hutan, situ, 3 pelatih | Tema jalur |
| **Bogor** | **Kota Hujan** | Langit kelabu kebiruan, kabut tipis, gerimis | Paving batu hangat, trotoar bata merah, rumput hijau lumut | Kolonial putih (Klinik, Gym), rumah kayu | **Tugu Kujang raksasa** (±7,5 petak, bilah emas melengkung) | Lampu jalan heritage, pagar putih Kebun Raya, angkot hijau, gerobak soto mie dan asinan | Lagu Bogor |
| Bandung (rencana) | Kota Kembang & Angklung | Sejuk, berawan putih, sore cerah | Aspal + trotoar warna-warni, rumput teh | Art deco pastel, atap pelana | Gedung Sate besar | Bunga di tiap pot, angkot, bambu angklung | (baru) |
| Cirebon (rencana) | Kota Udang & Ombak | Terik, angin laut | Batu karang, pasir | Keraton merah bata, batik Mega Mendung | Gapura Keraton | Perahu, jemuran terasi | (baru) |
| Semarang (rencana) | Kota Lawang Sewu | Senja jingga, lampion | Batu tua | Kolonial tua, lampion | Lawang Sewu / Tugu Muda | Lampion, trem | (baru) |
| Solo (rencana) | Kota Wayang | Teduh keemasan | Tanah liat, batik | Joglo | Keraton / wayang raksasa | Gamelan, becak | (baru) |
| Yogyakarta (rencana) | Kota Candi | Cerah lembut | Batu candi, taman | Candi, joglo | Candi besar | Andong, taman | (baru) |
| Surabaya (rencana) | Kota Pahlawan | Terik pelabuhan | Beton, besi | Galangan, kapal | Patung Suro-Boyo | Kapal, derek | (baru) |
| Malang (rencana) | Kota Apel | Sejuk berkabut gunung | Tanah vulkanik | Rumah kolonial | Bromo di cakrawala | Kebun apel | (baru) |
| Jakarta (rencana) | Kota Metropolitan | Senja kota, lampu neon | Beton, aspal lebar | Gedung tinggi | Monas | Bus kota, billboard | (baru) |
Baris "rencana" hanya usulan awal Zaya, belum disetujui San.

## Yang dikerjakan 21 Nov (Bogor vs Depok)
- Atmosfer per area (`bogorAtmo()` di src/bogor.js): makin ke selatan dari z=42 sampai kota, langit/kabut/cahaya bergeser mulus dari preset Depok ke preset Bogor; gerimis (overlay CSS `#rain`) mulai terlihat dekat kota dan mati di mode hemat (`perf=2`).
- Tanah Bogor (`bogorTile`): paving batu 3,4 sel per petak dengan nat gelap, trotoar bata merah, median hijau, plaza terakota, rumput campur hijau lumut, bunga ungu/pink kecil di Kebun Raya.
- **Tugu Kujang**: bundaran diperbesar (pulau 1,75, cincin jalan 3,6); tugu tiga undak, tiang meruncing 4,6 petak, cincin emas, Kujang melengkung ±2 petak; tinggi total ±7,5 petak (sebelumnya ±3).
- Dekor: 10 lampu jalan heritage, pagar putih ala Istana di sisi Kebun Raya (hanya terbuka di gerbang), dua angkot hijau parkir, gerobak SOTO MIE dan ASINAN.
- Lolos: `npcRule()` semua ok, jalur ke Pak Botani tetap ditemukan, tanpa error di konsol.
- Belum: pohon besar (kenari/beringin) menyusuri Jl. Pajajaran, toko dan Pasar dengan gaya kolonial penuh, bendera/umbul-umbul, suara hujan.
