# Sesi 4 — Documentation

## Misi
Menjaga dokumen = kenyataan: spek, peta, progresi, checklist, galeri artifact, README, changelog, dan checklist tes perangkat. Sesi ini tidak mengubah mekanik game; hanya membaca kode/hasil sesi lain lalu menulis ulang dokumen, kecuali perbaikan kecil pada `tools/` dan README.

## Dokumen & lokasinya
Project "Game" (claude.ai) folder `maimon/`: GAME-SPECS (spek utama, 16 bagian) · WORLD-MAP-v1 (peta, 58 field, status implementasi) · CITY-IDENTITY ("rasa" kota) · PROGRESSION (XP/evolusi/pelatih/gym Lv) · CHECKLIST (uang/kereta/gym) · BOGOR-STATUS. Juga `sky-patrol/` dan `arena-piksel/` (proyek lain, jangan diubah).
Di repo: `README.md`, `CLAUDE.md`, `handover/`. Salinan docs bisa diekspor ke `handover/docs/` bila sesi tidak terhubung Project.
Galeri artifact (hand-built HTML, bukan tipe artifact bawaan): Galeri Kota https://claude.ai/artifact/LK6DY1mwWePvwUqLDVshF8 · Galeri Sprite https://claude.ai/artifact/LLj8UxG8bYKXpjHuUSigD4. Dibuat `python3 tools/gallery.py /tmp/gallery` (butuh `python3 -m http.server 8765`, Playwright, Chrome); copy hasil ke luar /tmp sebelum publish; republish ke slug yang sama.

## Aturan menulis dokumen
- Bahasa Indonesia, register "aku/kamu" dalam obrolan; dokumen netral-ringkas. Tanggal absolut. Bedakan: SUDAH JALAN / SUDAH DIPUTUSKAN / USULAN (belum disetujui San).
- Setiap angka (XP, level, ukuran) harus cocok dengan kode: verifikasi dengan `grep`/menjalankan `__g`.
- Edit dokumen Project: `project_read` → ubah → `project_write` seluruh isi (tidak ada patch). Jangan hapus-dan-tulis ulang.
- Perbarui indeks dokumen di GAME-SPECS bagian atas bila menambah/mengganti dokumen.

## Backlog
1. Sinkronkan docs setiap sesi lain selesai (baca `handover/0X-*.md` bagian Status + `git log`).
2. Changelog `CHANGELOG.md` di repo (v19…v40 dari riwayat git/cache; mulai dari v40).
3. Checklist tes perangkat asli (HP + iPad): FPS dengan gerimis/atmosfer, loading 7 dtk, sentuh joystick/kamera, musik tidak menumpuk saat pindah aplikasi (bug iPad 21 Nov), save/lanjut, mode hemat otomatis.
4. Perbarui README (sekarang masih menyebut hanya Depok) + cara kerja paralel/worktree.
5. Jaga CITY-IDENTITY: tambah baris tiap kota nyata; ubah "rencana" jadi "dibuat" dan tambahkan entri galeri.
6. Jalankan ulang galeri + republish setiap ada kota/Maimon baru.
7. Rapikan keputusan terbuka (lihat 00-README) menjadi daftar yang bisa dijawab San dengan sekali klik.
8. Ringkasan cerita/dialog (naskah) untuk review San: nama NPC, dialog stage, nama pemimpin gym.

## Jebakan
- Dokumen Project lama bisa tertinggal (BOGOR-STATUS pernah menulis cache v25 saat sudah v39).
- Usulan Zaya jangan ditulis seolah keputusan San.
- Jangan menaruh hal sensitif/rahasia (token, kunci) di dokumen.

## Status
- 21 Nov: semua docs Maimon diperbarui ke v39/v40; galeri terbit. Sesi Docs belum mulai.
