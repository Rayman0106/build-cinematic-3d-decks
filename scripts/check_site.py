"""Offline checks for site routes, source provenance and download budgets.

These checks do not replace browser playback or responsive visual inspection.
"""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import hashlib, json, re, struct

ROOT=Path(__file__).resolve().parent.parent
SITE=ROOT/'site'

class Page(HTMLParser):
    def __init__(self):
        super().__init__();self.references=[];self.images=[];self.scripts=[];self.video=[];self.tags=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs);self.tags.append((tag,a))
        for key in ('src','href','poster'):
            if a.get(key):self.references.append(a[key])
        for part in a.get('srcset','').split(','):
            if part.strip():self.references.append(part.strip().split()[0])
        if tag=='img':self.images.append(a)
        if tag=='script':self.scripts.append(a)
        if tag=='video':self.video.append(a)

def resolve(path,reference):
    url=urlsplit(reference)
    if url.scheme or url.netloc or not url.path:return None
    target=(path.parent/unquote(url.path)).resolve()
    if not target.is_relative_to(SITE.resolve()):raise ValueError('Site route escapes package: '+reference)
    if target.is_dir():target=target/'index.html'
    return target

def faststart(path):
    atoms=[]
    with path.open('rb') as f:
        while (head:=f.read(8)):
            if len(head)!=8:raise ValueError('Truncated MP4: '+path.name)
            length,kind=struct.unpack('>I4s',head)
            if length==1:length=struct.unpack('>Q',f.read(8))[0];header=16
            else:header=8
            atoms.append(kind.decode('ascii','replace'))
            if length==0:break
            if length<header:raise ValueError('Invalid MP4 atom: '+path.name)
            f.seek(length-header,1)
    return 'moov' in atoms and 'mdat' in atoms and atoms.index('moov')<atoms.index('mdat')

def check():
    issues=[];initial=[]
    for path in [SITE/'index.html',SITE/'sources.html']:
        page=Page();text=path.read_text(encoding='utf-8');page.feed(text)
        for reference in page.references:
            target=resolve(path,reference)
            if target and not target.is_file():issues.append(f'Missing {path.name} target: {reference}')
        for im in page.images:
            if 'alt' not in im:issues.append('Image without alt: '+str(im))
            if not im.get('width') or not im.get('height'):issues.append('Image without stable dimensions: '+str(im))
            if path.name=='index.html' and im.get('loading')!='lazy':
                target=resolve(path,im.get('src',''))
                if target:initial.append(target)
        if any(a.get('src','').startswith(('http:','https:','//')) for a in page.scripts):issues.append('External runtime script')
        if any(a.get('src') or a.get('autoplay') is not None for a in page.video):issues.append('Home video loads/plays before user action')
        if any(tag in ('iframe','canvas') for tag,a in page.tags):issues.append('Home/credits unexpectedly embeds WebGL or case deck')
    css=(SITE/'styles.css').read_text(encoding='utf-8')
    for reference in re.findall(r"url\(['\"]?([^'\")]+)",css):
        target=resolve(SITE/'styles.css',reference)
        if target and not target.is_file():issues.append('Missing CSS asset: '+reference)
    if 'prefers-reduced-motion' not in css:issues.append('Missing reduced-motion support')
    if (SITE/'lab/index.html').read_bytes()!=(ROOT/'examples/playground.html').read_bytes():issues.append('Lab copy differs from generated original')
    manifest=json.loads((SITE/'media/manifest.json').read_text(encoding='utf-8'))
    for entry in manifest['images']:
        path=SITE/'media'/entry['file']
        if hashlib.sha256(path.read_bytes()).hexdigest()!=entry['sha256']:issues.append('Stale image manifest: '+path.name)
    for path in (SITE/'media').glob('*.mp4'):
        if path.stat().st_size>8_000_000:issues.append('Web video exceeds 8 MB: '+path.name)
        if not faststart(path):issues.append('MP4 lacks faststart: '+path.name)
        record=manifest['videos']['files'].get(path.name)
        if not record or hashlib.sha256(path.read_bytes()).hexdigest()!=record['sha256']:issues.append('Stale video manifest: '+path.name)
    for path in SITE.rglob('*'):
        if path.is_file() and path.suffix.lower() in ('.glb','.gltf','.fbx','.blend'):issues.append('Source model accidentally included')
    total=sum(p.stat().st_size for p in SITE.rglob('*') if p.is_file())
    if total>12_000_000:issues.append('Site exceeds 12 MB prepared-package budget')
    conservative=sum(p.stat().st_size for p in initial)+(SITE/'index.html').stat().st_size+(SITE/'styles.css').stat().st_size+(SITE/'main.js').stat().st_size+(SITE/'fonts/Manrope.ttf').stat().st_size+(SITE/'media/f1-grid-small.webp').stat().st_size
    if conservative>650_000:issues.append('Initial homepage budget exceeds 650 kB (uncompressed)')
    return {'status':'pass' if not issues else 'fail','preparedSiteBytes':total,'conservativeInitialHomeBytes':conservative,'labBytes':(SITE/'lab/index.html').stat().st_size,'webVideosFaststart':True if not issues else 'see issues','issues':issues,'limit':'Static/package checks only. Lab and full case playback were not browser-verified in this update.'}

if __name__=='__main__':
    result=check();print(json.dumps(result,indent=2));raise SystemExit(0 if result['status']=='pass' else 1)
