# Maimon · Edisi Jawa

Game petualangan menangkap & melatih **Maimon** di diorama piksel 3D (Three.js, satu file HTML, PWA).
Edisi pertama: **Depok** — kamu baru pindah untuk persiapan kuliah di UI, bertemu Prof. Catherine, dan memulai jalan jadi Pelatih Maimon terbaik di dunia.

- Main: buka `index.html` lewat server statis (mis. GitHub Pages) lalu "Add to Home Screen" untuk PWA.
- Kontrol: joystick / WASD, geser layar untuk memutar kamera, `E`/Enter untuk bicara.
- Musik prosedural (WebAudio): tema tiap kota + battle.
- Build: `python3 build.py` menggabungkan `src/` menjadi `index.html`.
- Lokal: `python3 -m http.server` lalu buka http://localhost:8000
