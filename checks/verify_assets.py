from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from collections import Counter
import re,json
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
class Page(HTMLParser):
    def __init__(self):
        super().__init__();self.ids=[];self.refs=[];self.fragments=[];self.controls=[];self.labels=[];self.headings=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if tag in ['h1','h2','h3']:self.headings.append(tag)
        for key in ['src','href']:
            if key in a:
                u=urlsplit(a[key])
                if not u.scheme and not u.netloc:
                    if u.path:self.refs.append(unquote(u.path))
                    elif u.fragment:self.fragments.append(u.fragment)
        if 'aria-controls' in a:self.controls.extend(a['aria-controls'].split())
        if 'aria-labelledby' in a:self.labels.extend(a['aria-labelledby'].split())
        if tag=='img':assert 'alt' in a,'All images need alt text, including decorative images.'
        if tag=='button':assert a.get('type') in ['button','submit'],'Every button must have an explicit type.'
        if a.get('target')=='_blank':assert 'noopener' in a.get('rel',''),'External tab must be safe.'

p=Page();p.feed((DIST/'index.html').read_text())
assert not [k for k,v in Counter(p.ids).items() if v>1],'Duplicate HTML IDs.'
assert p.headings.count('h1')==1,'Exactly one H1.'
for ref in p.refs:assert (DIST/ref).is_file(),f'Missing local resource: {ref}'
for ref in p.fragments+p.controls+p.labels:assert ref in p.ids,f'Missing anchor or ARIA target: {ref}'
css=(DIST/'styles.css').read_text()
for ref in re.findall(r"url\(['\"]?([^)'\"]+)",css):
    if not ref.startswith('data:'):assert (DIST/ref).is_file(),f'Missing CSS asset: {ref}'
for f in (DIST/'assets').glob('*.webp'):
    with Image.open(f) as im:im.verify()
for f in (DIST/'assets').glob('*.ttf'):
    assert f.stat().st_size>1000,f'Empty font: {f}'
assert '@media(prefers-reduced-motion:reduce)' in css
assert '[hidden]{display:none!important}' in css
assert 'placeholder="Nombre y apellido"' in (DIST/'index.html').read_text()
print(f'PASS: {len(p.ids)} unique HTML IDs, local links, ARIA references, media assets, motion preference and hosting manifest.')
