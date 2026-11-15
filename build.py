#!/usr/bin/env python3
"""Gabungkan src/*.js + head.html menjadi index.html (satu file)."""
import pathlib
s = pathlib.Path(__file__).parent / 'src'
order = ['head.html', 'engine.js', 'builders2.js', 'world1.js', 'world2.js', 'world3.js', 'world4.js', 'quad.js', 'camrender.js', 'music.js', 'npc.js', 'gameA.js', 'story.js', 'gameB.js']
out = ''.join((s / f).read_text() for f in order)
pathlib.Path(__file__).parent.joinpath('index.html').write_text(out)
print('index.html', len(out), 'bytes')
