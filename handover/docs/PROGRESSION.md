# Maimon — Progresi: XP, Level, Evolusi, Pelatih, Syarat Gym (21 Nov 2026)

## Level dan XP
- Level maks **99** (keputusan San 21 Nov; sebelumnya 40). Konstanta `LVCAP` di src/gameA.js.
- XP untuk naik dari level L: `xpNeed(L) = round((2 + 0,00454·(L−1)²) × (10 + 4·L))` = jumlah battle per level × XP rata-rata per battle.
- XP battle: `xpFor(lawan) = (10 + 4·level lawan) × (2 kalau langka)`. Pemimpin tim dapat penuh, teman tim setengah. Penalti: dikali `max(0,25; 1 − 0,12 × (level Maimon − level lawan))` bila Maimon lebih tinggi dari lawan (cegah grinding lawan lemah). Pelatih: XP ×1,3.
- Alasan: San main 1,5 jam dan levelnya terlalu cepat naik (kurva lama kumulatif Lv 16 ≈ 1.590 XP, Lv 40 ≈ 11.270 XP). Kurva baru dihitung dengan asumsi ±20 battle/jam (dari main San, belum diukur di game) dan level lawan kira-kira sama dengan level pemain.

| Level | XP kumulatif | Estimasi jam main |
|---|---|---|
| 16 (evolusi 1) | ±1.500 | ±1,8 |
| 20 (gym 1 Bogor) | ±2.600 | ±2,4 |
| 30 (gym 2) | ±7.500 | ±4,7 |
| 33 (evolusi 2) | ±10.000 | ±5,5 |
| 40 (gym 3) | ±18.000 | ±8 |
| 50 (gym 4) | ±38.000 | ±13,5 |
| 60 (gym 5) | ±73.000 | ±21 |
| 70 (gym 6) | ±127.000 | ±31 |
| 80 (gym 7) | ±209.000 | ±44 |
| 90 (gym 8) | ±327.000 | ±61 |
| 99 (gym 9) | ±471.000 | ±80 |

Risiko yang diketahui: level lawan liar sekarang masih rendah (Bogor ±Lv 5-10). Kalau level liar tidak dinaikkan per area, penalti selisih level membuat XP kecil dan waktu ke Lv 20 jauh di atas tabel. San memutuskan "gpp gini aja" untuk sekarang; level liar dan pelatih per area perlu disetel waktu membangun kota/field berikutnya (aturan di WORLD-MAP bagian 4: level wild naik per area).
HP: `hpMaxOf = HP dasar tahap × (0,6 + 0,08·level)`, jadi di Lv 99 sekitar 2,2× HP di Lv 40. Keseimbangan damage di level tinggi belum dites.

## Evolusi
- Lv 16 dan Lv 33 (keputusan San). Kancik/Cebongi/Pioyo dua kali; Kucingko/Tikusil/Dombanyo sekali (Lv 16).
- Tipe kedua per tahap: Kancilraja +Batu; Katakraya +Cahaya; Jagoapi +Cahaya; Gembulon +Cahaya.
- Jurus baru: Lv 18/20/26/34 per keluarga. HP ikut tahap (Kancik: 46 → 74 → 120). Catatan: lonjakan HP saat evolusi besar (Kancik Lv 16 ≈ 86 → 139), bisa diturunkan kalau terasa kebanyakan.
- Alur: naik ke Lv syarat → "Evolusi! / Nanti"; kartu Tim punya tombol "✨ Evolusi → X" selama syarat terpenuhi. Animasi (src/evolve.js): siluet berkedip, kilatan, sprite baru, bintang. Maimondex mencatat rantai evolusi.

## Pelatih (trainer) di field
Lihat GAME-SPECS bagian 15. Data di `TRAINERS` (src/trainer.js). Hadiah makanan 2× per pelatih; belum ada uang (menunggu skema uang). Level J1: 5, 6+6, 7+8.

## Syarat level gym
- `GYM_MINLV = [20, 30, 40, 50, 60, 70, 80, 90, 99]`; `gymReady(n)` benar kalau Maimon tertinggi di tim ≥ nilai gym n.
- Bogor (gym 1) = 20 sesuai permintaan San. Selisih 15 antar gym tidak muat karena Jakarta harus ≤ 99 (20 + 8×15 = 140), jadi dibagi rata ±10. Alternatif yang ditawarkan: gym lebih sedikit, atau Jakarta tidak di Lv 99.
- Pak Botani: bila tim di bawah Lv 20 ia menyebut level minimal dan level terbaik tim sekarang; bila cukup, "Gym Kebun Raya masih kusiapkan, segera hadir". Battle gym belum dibuat (CHECKLIST).
