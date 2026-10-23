"""Prepare web derivatives of supplied case media. Requires Pillow."""
from pathlib import Path
import argparse, hashlib, json, shutil
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT=Path(__file__).resolve().parent.parent

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--f1-media',required=True,type=Path)
    parser.add_argument('--math-media',required=True,type=Path)
    parser.add_argument('--font-dir',required=True,type=Path)
    args=parser.parse_args()
    media=ROOT/'site/media';media.mkdir(parents=True,exist_ok=True)
    fonts=ROOT/'site/fonts';fonts.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(args.font_dir/'Manrope.ttf',fonts/'Manrope.ttf')
    # Preserve the notice wording; normalise only whitespace in this new copy.
    notice=(args.font_dir/'Manrope-OFL.txt').read_text(encoding='utf-8')
    (fonts/'Manrope-OFL.txt').write_text('\n'.join(line.rstrip() for line in notice.splitlines())+'\n',encoding='utf-8',newline='\n')
    records=[]
    sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
    for source,name,size,project in [(args.f1_media/'grid.jpg','f1-grid.webp',(1600,900),'f1-economics-3d-deck'),(args.f1_media/'grid.jpg','f1-grid-small.webp',(900,900),'f1-economics-3d-deck'),(args.f1_media/'cover.jpg','f1-cover.webp',(1600,900),'f1-economics-3d-deck'),(args.math_media/'study-room.jpg','reaction-cover.webp',(1600,900),'reaction-time-math-3d-deck')]:
        im=Image.open(source).convert('RGB')
        if name=='f1-grid-small.webp':im=ImageOps.fit(im,size,method=Image.Resampling.LANCZOS,centering=(.65,.5))
        else:im=ImageOps.pad(im,size,method=Image.Resampling.LANCZOS,color='#0b1017')
        path=media/name;im.save(path,quality=84,method=6)
        records.append({'file':name,'kind':'saved case frame derivative','source':f'{project}/docs/media/{source.name}','sourceSha256':sha(source),'pixels':size,'sha256':sha(path),'bytes':path.stat().st_size})
    social=ImageOps.fit(Image.open(args.f1_media/'grid.jpg').convert('RGB'),(1200,630),method=Image.Resampling.LANCZOS).convert('RGBA')
    shade=Image.new('RGBA',(1200,630),(0,0,0,0));d=ImageDraw.Draw(shade)
    for x in range(1200):d.line((x,0,x,630),fill=(5,9,15,int(242-100*x/1200)))
    social=Image.alpha_composite(social,shade);d=ImageDraw.Draw(social)
    def f(size):
        font=ImageFont.truetype(str(fonts/'Manrope.ttf'),size)
        font.set_variation_by_axes([650]);return font
    d.text((62,65),'TWO REAL PROJECTS / ONE REUSABLE SKILL',font=f(17),fill='#f3ab65')
    d.text((58,158),'Give the next slide',font=f(65),fill='#f4f2ed')
    d.text((58,240),'a reason.',font=f(79),fill='#f3ab65')
    d.text((63,396),'Readable 2D slides. Continuous 3D stories.',font=f(24),fill='#d1d7df')
    d.line((63,505,1137,505),fill='#aeb8c366')
    d.text((63,539),'CINEMATIC 3D DECKS',font=f(21),fill='#f4f2ed')
    d.text((839,543),'Rayman0106 / GitHub',font=f(17),fill='#d1d7df')
    path=media/'social-preview.jpg';social.convert('RGB').save(path,quality=91)
    records.append({'file':path.name,'kind':'editorial social card over saved F1 frame','source':'f1-economics-3d-deck/docs/media/grid.jpg','sourceSha256':sha(args.f1_media/'grid.jpg'),'pixels':[1200,630],'sha256':sha(path),'bytes':path.stat().st_size})
    manifest={'created':'2026-10-22','images':records,'font':{'name':'Manrope','license':'SIL OFL 1.1','source':'reaction-time-math-3d-deck/assets/fonts/Manrope.ttf','sha256':sha(fonts/'Manrope.ttf')},'videos':json.loads((media/'video-manifest.json').read_text(encoding='utf-8')),'notes':'New site derivatives of existing case media. No newly recorded project/Lab footage. Case asset credits still apply.'}
    (media/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'images':len(records),'totalImageBytes':sum(r['bytes'] for r in records)},indent=2))

if __name__=='__main__':main()
