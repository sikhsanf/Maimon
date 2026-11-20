#!/usr/bin/env python3
"""Gabungkan src/*.js + head.html menjadi index.html (satu file)."""
import pathlib
s = pathlib.Path(__file__).parent / 'src'
order = ['head.html', 'engine.js', 'builders2.js', 'world1.js', 'world2.js', 'world3.js', 'world4.js', 'field.js', 'outer.js', 'bogor.js', 'lab.js', 'quad.js','evo.js', 'camrender.js', 'music.js', 'npc.js', 'gameA.js', 'story.js', 'gather.js', 'menus.js','evolve.js', 'gameB.js']
head = (s / 'head.html').read_text()
head = head.replace('</style>', (s / 'boot.css').read_text() + '</style>', 1).replace('<head>', '<head>\n' + (s / 'bootpre.html').read_text(), 1).replace('<body>', '<body>\n' + (s / 'boot.html').read_text(), 1)
parts = [head]; rest = order[1:]
for i, f in enumerate(rest):
    t = (s / f).read_text()
    if f != 'gameB.js': t += f'\nawait __boot.step({i + 1}, {len(rest) + 1});\n'
    parts.append(t)
out = ''.join(parts)
pathlib.Path(__file__).parent.joinpath('index.html').write_text(out)
print('index.html', len(out), 'bytes')
