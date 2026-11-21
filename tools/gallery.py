#!/usr/bin/env python3
"""Bikin galeri artifact Maimon: (1) kota/field, (2) sprite Maimon.
Pakai: jalankan `python3 -m http.server 8765` dari root repo, lalu `python3 tools/gallery.py /tmp/gallery`.
Hasil: /tmp/gallery/kota.html dan /tmp/gallery/sprite.html (satu file, gambar tertanam).
Tambah kota baru = tambah entri di PLACES. Tambah Maimon baru = otomatis (dibaca dari MAI)."""
import sys, json, base64, os, html
from playwright.sync_api import sync_playwright
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/gallery'; os.makedirs(OUT, exist_ok=True)
URL = 'http://localhost:8765/index.html?noboot&perf=0'
b64 = lambda raw, mime: f'data:{mime};base64,' + base64.b64encode(raw).decode()
# (id, judul, julukan, deskripsi, palet, daftar [x, z, yaw, caption])
PLACES = [
 ('depok', 'Depok', 'Kota Kampus & KRL', 'Terang dan hangat. Rumput kuning-hijau, aspal abu bergaris kuning, genteng merah, kabel dan rel KRL. Titik awal cerita: Lab Prof. Catherine, Hotel Maimon, Klinik, dan kebun jagung Pak Tani.',
  ['#72b146', '#585b64', '#c04a36', '#8cc6ea', '#f2c230'],
  [(-6.6, 10.4, -1.3, 'Taman Maimon, titik awal'), (-12.2, 5.5, 0.4, 'Hotel Maimon & Klinik'), (2.8, 3.8, -1.3, 'Kebun jagung Pak Tani'), (0, -6, 0.4, 'Jl. Margonda')]),
 ('j1', 'J1 · Jalur Depok–Bogor', 'Lintas Raya Bogor', 'Field penghubung 14×40 petak. Sungai Cipakancilan dengan jembatan, Situ Kecil, warung pinggir jalan, hutan di dua ujung, dan tiga pelatih di pinggir jalan. Makin ke selatan langit makin kelabu: pemanasan menuju Bogor.',
  ['#66a63f', '#3d7f8a', '#43782f', '#c9b88a', '#6f8aa0'],
  [(-1.0, 24, -1.3, 'Awal jalur, Dodi si Pramuka'), (-1.0, 34, 0.4, 'Jembatan Sungai Cipakancilan'), (-1.0, 46, -1.3, 'Hutan sebelum gerbang Bogor')]),
 ('bogor', 'Bogor', 'Kota Hujan', 'Beda total dari Depok: langit kelabu kebiruan, kabut tipis, gerimis, cahaya sejuk. Jalan paving batu, trotoar bata merah, rumput hijau lumut. Tugu Kujang raksasa di bundaran, lampu jalan heritage, pagar putih Kebun Raya, angkot hijau, dan gerobak soto mie dan asinan.',
  ['#2f9a68', '#9d9686', '#b8654a', '#6f93a8', '#e8b830'],
  [(-1.0, 62, -1.3, 'Bundaran Tugu Kujang dari utara'), (-9.2, 67.2, 0.4, 'Jl. Suryakencana, angkot dan pagar'), (-1.0, 75.0, -1.3, 'Gerbang Kebun Raya & Gym'), (3.2, 76.4, 0.4, 'Kolam Kebun Raya')]),
]
TYPECOL = {'Api': '#e8582a', 'Air': '#3b8fd6', 'Daun': '#4fae4f', 'Suara': '#b07ad8', 'Batu': '#9a8a70', 'Bayangan': '#4a4466', 'Cahaya': '#e0b830', 'Biasa': '#8a8a8a'}
CSS = """*{box-sizing:border-box}body{margin:0;background:#f5ecd6;color:#2b2118;font-family:ui-rounded,'Trebuchet MS',system-ui,sans-serif}
header{padding:28px 20px 10px;max-width:1100px;margin:0 auto}h1{margin:0;font-size:30px;letter-spacing:.5px}header p{margin:6px 0 0;color:#6a5a44}
main{max-width:1100px;margin:0 auto;padding:10px 20px 50px}section{margin:26px 0}h2{margin:0 0 2px;font-size:24px}.nick{color:#a8602a;font-weight:700;margin-bottom:6px}
.sw{display:flex;gap:6px;margin:10px 0}.sw i{width:34px;height:20px;border:2px solid #2b2118;border-radius:4px;display:block}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;margin-top:12px}
figure{margin:0;background:#fffaf0;border:3px solid #2b2118;border-radius:10px;overflow:hidden;box-shadow:4px 4px 0 #2b2118}
figure img{width:100%;display:block}figcaption{padding:8px 12px;font-size:14px;font-weight:700}
.fam{background:#fffaf0;border:3px solid #2b2118;border-radius:12px;padding:14px;box-shadow:4px 4px 0 #2b2118;margin:18px 0}.chain{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.st{text-align:center;flex:1;min-width:150px}.st img{width:100%;max-width:230px;image-rendering:pixelated;background:radial-gradient(#fff6,#0000 70%)}.st b{display:block;font-size:17px}
.arr{font-size:22px;color:#a8602a;text-align:center}.arr small{display:block;font-size:12px;font-weight:700}.chip{display:inline-block;color:#fff;font-size:12px;font-weight:700;padding:2px 8px;border-radius:99px;margin:2px 2px 0;border:2px solid #2b2118}
.fam p{margin:8px 2px 0;color:#5a4a36;font-size:14px}.meta{font-size:13px;color:#6a5a44;margin-top:4px}footer{text-align:center;color:#8a7a62;padding:20px;font-size:13px}"""
def page(title, sub, body, stamp):
    return f'<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title}</title><style>{CSS}</style></head><body><header><h1>{title}</h1><p>{sub}</p></header><main>{body}</main><footer>Dibuat otomatis dari game · {stamp}</footer></body></html>'
with sync_playwright() as p:
    br = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-gl=swiftshader', '--no-sandbox'])
    SAVE = "localStorage.setItem('maimon_save_v1', JSON.stringify({pos:[%s,%s,0],S:{name:'San',gender:'boy',stage:8,tut:9,tf:{},dex:{},bag:{}},mates:[{sp:'kancik',st:1,hp:999,lv:12,xp:0}],box:[]}))"
    pg = None
    def goto(x, z):  # konteks baru tiap sudut: posisi dan kamera pasti benar (save lama tidak menimpa)
        global pg
        if pg: pg.context.close()
        ctx = br.new_context(viewport={'width': 1000, 'height': 560}); ctx.add_init_script(SAVE % (x, z)); pg = ctx.new_page(); pg.goto(URL); pg.wait_for_timeout(2500)
        pg.evaluate("()=>document.getElementById('bCont').click()"); pg.wait_for_timeout(3000)
        pg.add_style_tag(content='body>*:not(#rain):not(#app):not(script){visibility:hidden!important}')
    goto(-6.6, 10.4)
    import datetime; stamp = datetime.date.today().strftime('%d %b %Y')
    # ---- kota ----
    secs = []
    for pid, name, nick, desc, pal, views in PLACES:
        figs = []
        for (x, z, yaw, cap) in views:
            goto(x, z); real = pg.evaluate("([x,z,y])=>{const g=window.__g; g.setCam(x,z,0.85,y); g.setPitch(0.66,y); return [g.player.x,g.player.z]}", [x, z, yaw]); pg.wait_for_timeout(1800)
            if abs(real[0] - x) > 1 or abs(real[1] - z) > 1: print('PERINGATAN: posisi terblokir', cap, real)
            figs.append(f'<figure><img alt="{html.escape(cap)}" src="{b64(pg.screenshot(type="jpeg", quality=82), "image/jpeg")}"><figcaption>{html.escape(cap)}</figcaption></figure>')
        sw = ''.join(f'<i style="background:{c}"></i>' for c in pal)
        secs.append(f'<section><h2>{html.escape(name)}</h2><div class="nick">{html.escape(nick)}</div><p>{html.escape(desc)}</p><div class="sw">{sw}</div><div class="grid">{"".join(figs)}</div></section>')
    open(f'{OUT}/kota.html', 'w').write(page('Maimon · Galeri Kota', 'Tiap kota harus punya "rasa" sendiri: palet, cuaca, bangunan, ikon, dan musik berbeda.', ''.join(secs), stamp))
    # ---- sprite ----
    pg.evaluate("()=>{window.__g.setPitch(0.66,-1.3)}")
    fams = pg.evaluate("()=>Object.entries(window.__g.MAI).map(([k,d])=>({k,n:d.n,type:d.type,t2:d.t2||{},evo:d.evo||[],cat:d.info.cat,desc:d.info.desc,hab:d.info.hab}))")
    secs = []
    for f in fams:
        cells = []
        for i, nm in enumerate(f['n']):
            st = i + 1
            url = pg.evaluate("([k,s])=>window.__g.portraitRig('gal_'+k+s,()=>window.__g.MAI[k].build(s),0.75,false,320)", [f['k'], st])
            t2 = f['t2'].get(str(st)) or f['t2'].get(str(st))  # tipe kedua mulai tahap ini
            types = [f['type']] if isinstance(f['type'], str) else list(f['type'])
            for sk, tv in f['t2'].items():
                if st >= int(sk): types = types[:1] + [tv]
            chips = ''.join(f'<span class="chip" style="background:{TYPECOL.get(t, "#888")}">{t}</span>' for t in types)
            cells.append(f'<div class="st"><img alt="{nm}" src="{url}"><b>{nm}</b>{chips}</div>')
            if i < len(f['n']) - 1: cells.append(f'<div class="arr">➜<small>Lv {f["evo"][i]}</small></div>')
        secs.append(f'<div class="fam"><div class="chain">{"".join(cells)}</div><p><b>{html.escape(f["cat"])}</b> · {html.escape(f["desc"])}</p><div class="meta">Habitat: {html.escape(f["hab"])}</div></div>')
    open(f'{OUT}/sprite.html', 'w').write(page('Maimon · Galeri Sprite', f'{len(fams)} keluarga Maimon, semua tahap evolusi, tipe, dan level evolusi.', ''.join(secs), stamp))
    br.close()
print('ok', OUT)
