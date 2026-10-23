"""Reproducible editorial cuts from supplied, already-recorded project media.

Requires Pillow and FFmpeg. Never renders or captures a browser. The 55s cut is
explicitly a technical draft: explanatory cards stand in for unavailable Lab
capture. The low-fps archived GIF is not described as native 60fps footage.
"""
from pathlib import Path
import argparse, hashlib, json, shutil, subprocess
from PIL import Image, ImageDraw, ImageFont, ImageSequence

ROOT = Path(__file__).resolve().parent.parent
W, H = 2400, 1350
INK, MUTED, ACCENT, BG = '#f4f2ed', '#adb7c4', '#f3ab65', '#0b1017'

def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ffmpeg', required=True, type=Path)
    parser.add_argument('--f1-master', required=True, type=Path)
    parser.add_argument('--math-motion', required=True, type=Path)
    parser.add_argument('--font', required=True, type=Path)
    parser.add_argument('--output-dir', required=True, type=Path)
    parser.add_argument('--web-dir', required=True, type=Path)
    parser.add_argument('--web-motion-only', action='store_true', help='Repair only the archived GIF web derivative and its existing manifest.')
    args = parser.parse_args()
    stage = args.output_dir / 'edit-parts'
    stage.mkdir(parents=True, exist_ok=True)
    args.web_dir.mkdir(parents=True, exist_ok=True)
    def font(size):
        face = ImageFont.truetype(str(args.font), size)
        face.set_variation_by_axes([650 if size >= 50 else 500])
        return face
    def run(tail):
        subprocess.run([str(args.ffmpeg), '-hide_banner', '-loglevel', 'error', '-nostdin', '-y', *map(str, tail)], check=True)
    with Image.open(args.math_motion) as gif:
        gif_seconds=sum(frame.info.get('duration',0) for frame in ImageSequence.Iterator(gif))/1000
        gif_frames=gif.n_frames
    def export_math_web():
        # FFmpeg otherwise drops the GIF's final 1s hold at EOF. Pad, then
        # trim to the sum of the actual GIF frame delays, preserving that hold.
        run(['-i',args.math_motion,'-vf','scale=832:468:flags=lanczos,fps=30,tpad=stop_mode=clone:stop_duration=2','-t',gif_seconds,'-an','-c:v','libx264','-threads','4','-preset','slow','-crf','22','-pix_fmt','yuv420p','-movflags','+faststart',args.web_dir/'reaction-motion.mp4'])
    if args.web_motion_only:
        export_math_web()
        manifest_path=args.output_dir/'edit-manifest.json';manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
        path=args.web_dir/'reaction-motion.mp4';manifest['files'][path.name]={'bytes':path.stat().st_size,'sha256':digest(path)}
        for source in manifest['sources']:
            if source['id']=='math-motion':source.update(seconds=gif_seconds,frames=gif_frames)
        manifest_path.write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8');shutil.copyfile(manifest_path,args.web_dir/'video-manifest.json')
        print(json.dumps({'webMotionSeconds':gif_seconds,'frames':int(gif_seconds*30),'bytes':path.stat().st_size},indent=2));return
    encode = ['-an', '-map_metadata', '-1', '-map_chapters', '-1', '-c:v', 'libx264', '-threads', '4', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '60', '-video_track_timescale', '60000', '-movflags', '+faststart']
    def card(name, kicker, title, lines, footer='CINEMATIC 3D DECKS / EDITORIAL GRAPHIC'):
        image = Image.new('RGB', (W,H), BG)
        d = ImageDraw.Draw(image)
        d.rounded_rectangle((110,115,176,181), radius=15, fill=ACCENT)
        d.text((134,125), 'C', font=font(37), fill=BG)
        d.text((210,128), kicker, font=font(29), fill=ACCENT)
        y = 300
        for line in title.split('\n'):
            d.text((115,y), line, font=font(123), fill=INK)
            y += 146
        y += 52
        for line in lines:
            d.text((120,y), line, font=font(40), fill=MUTED)
            y += 68
        # Clearly labelled editorial diagrams, never a substitute browser capture.
        if name.startswith('plan-'):
            blue='#94bce4'
            if name=='plan-outline':
                for x,c,filled in [(350,ACCENT,True),(1550,blue,False)]:
                    d.rounded_rectangle((x,890,x+510,1025),radius=40,fill=c if filled else None,outline=c,width=5)
                    for dx in (40,350):d.rounded_rectangle((x+dx,855,x+dx+105,1060),radius=20,fill=BG,outline=c,width=5)
                    d.line((x+255,870,x+255,1050),fill=INK,width=2)
                    d.ellipse((x+247,950,x+263,966),fill=INK)
                d.line((980,958,1390,958),fill=MUTED,width=4);d.polygon([(1390,958),(1360,942),(1360,974)],fill=MUTED)
            elif name=='plan-screen':
                d.polygon([(320,850),(860,885),(860,1080),(320,1115)],outline=ACCENT,width=5)
                d.rectangle((1520,850,2120,1115),outline=blue,width=5)
                for a,b in [((320,850),(1520,850)),((860,885),(2120,850)),((860,1080),(2120,1115)),((320,1115),(1520,1115))]:
                    d.line((*a,*b),fill='#486078',width=2);d.ellipse((a[0]-6,a[1]-6,a[0]+6,a[1]+6),fill=ACCENT);d.ellipse((b[0]-6,b[1]-6,b[0]+6,b[1]+6),fill=blue)
            elif name=='plan-particles':
                for group,c in [(0,ACCENT),(1,blue)]:
                    for i in range(12):
                        x=200+(i%4)*55;y=875+group*135+(i//4)*28;d.ellipse((x,y,x+10,y+10),fill=c)
                    d.line((485,920+group*135,1050,980),fill=c,width=3)
                d.text((1110,910),'EVIDENCE',font=font(97),fill=INK)
            elif name=='plan-chart':
                for i in range(19):
                    x=230+i*40;y=1000+int(32*((i%5)-2)/2);d.ellipse((x,y,x+10,y+10),fill=ACCENT)
                d.line((1230,995,2160,995),fill=blue,width=5);d.rectangle((1480,905,1950,1085),outline=blue,width=5)
                d.line((1710,905,1710,1085),fill=ACCENT,width=7)
                for x in (1230,2160):d.line((x,950,x,1040),fill=blue,width=5)
        d.line((120,1170,2280,1170), fill='#35404c', width=2)
        d.text((120,1210), footer, font=font(24), fill=MUTED)
        path = stage / (name+'.png');image.save(path);return path
    def caption(name, title, note):
        image=Image.new('RGBA',(W,H),(0,0,0,0))
        d=ImageDraw.Draw(image)
        for yy in range(260):
            a = int(218 * max(0,1-yy/260)**.65)
            d.line((0,yy,W,yy),fill=(6,10,16,a))
        d.text((88,46), title, font=font(54), fill=INK)
        d.text((90,125), note, font=font(28), fill='#d4dae2')
        path=stage/(name+'-caption.png');image.save(path);return path
    def f1(name, start, seconds, title, note):
        overlay = caption(name,title,note)
        target=stage/(name+'.mp4')
        run(['-ss',start,'-i',args.f1_master,'-loop','1','-i',overlay,'-filter_complex','[0:v]setpts=PTS-STARTPTS,fps=60,setsar=1[base];[base][1:v]overlay=0:0:shortest=1[v]','-map','[v]','-t',seconds,*encode,target])
        return target
    def still(name, image, seconds):
        target=stage/(name+'.mp4')
        run(['-loop','1','-framerate','60','-i',image,'-t',seconds,*encode,target]);return target
    def math(name, seconds, source_start=0):
        image=Image.new('RGB',(W,H),BG);d=ImageDraw.Draw(image)
        d.text((100,160),'02 / REACTION TIME',font=font(29),fill=ACCENT)
        for i,line in enumerate(['Different subject.', 'Same through-line.']):
            d.text((100,290+i*85),line,font=font(63),fill=INK)
        for i,line in enumerate(['A student. A screen.', 'A question about evidence.']):
            d.text((104,530+i*56),line,font=font(32),fill=MUTED)
        d.text((970,265),'ARCHIVED DEVELOPMENT CAPTURE',font=font(23),fill=ACCENT)
        d.rounded_rectangle((948,318,2332,1100),radius=4,outline='#35404c',width=2)
        for i,line in enumerate(['Original 831 × 467 GIF · source frames repeated for video.', 'Motion is real; final typography and transitions are not shown.']):
            d.text((970,1130+i*46),line,font=font(24),fill=MUTED)
        d.text((104,1210),'SILENT / HISTORICAL PROJECT FOOTAGE',font=font(23),fill=MUTED)
        back=stage/(name+'.png');image.save(back)
        target=stage/(name+'.mp4')
        run(['-loop','1','-framerate','60','-i',back,'-ss',source_start,'-i',args.math_motion,'-filter_complex','[1:v]scale=1380:776:flags=lanczos,fps=60,setsar=1[motion];[0:v][motion]overlay=950:320:shortest=1[v]','-map','[v]','-t',seconds,*encode,target])
        return target
    def concat(name, parts):
        listing=stage/(name+'.txt')
        listing.write_text(''.join("file '"+p.resolve().as_posix().replace("'", "'\\''")+"'\n" for p in parts),encoding='utf-8')
        target=args.output_dir/(name+'-2400x1350-60fps.mp4')
        run(['-f','concat','-safe','0','-i',listing,'-map','0:v:0','-c','copy','-an','-movflags','+faststart',target]);return target
    end=card('closing','OPEN SOURCE / A REUSABLE CODEX SKILL','Cinematic\n3D Decks',['Stories told with readable slides and continuous 3D scenes.', 'github.com/Rayman0106/build-cinematic-3d-decks'])
    promo_parts=[f1('promo-grid',16,5,'22 cars. One opening question.','F1 ECONOMICS / SAVED FINAL-DECK RECORDING'), f1('promo-handoff',25,5,'From the track to the argument.','3D SCENE → READABLE SLIDE'), f1('promo-budget',69.8,5,'A repair can cost an upgrade.','ANIMATION THAT CARRIES THE IDEA FORWARD'), math('promo-math',5), still('promo-end',end,5)]
    print('Encoding 25-second master.',flush=True)
    promo=concat('Cinematic-3D-Showcase-25s',promo_parts)
    workflow=card('workflow','TECHNICAL OVERVIEW / EXPLANATORY GRAPHIC','Report → storyboard\n→ browser deck',['1   Connect the question, evidence and conclusion.', '2   Plan the stable slide and the handoff into the next one.', '3   Build, prepare, check, then let the reader press Start.'], 'TECHNICAL DRAFT / THIS IS A DIAGRAM, NOT BROWSER FOOTAGE')
    plans=[]
    specifications=[('outline','01 / MODEL → OUTLINE','Keep the projection.', ['Match the camera, subject and registration anchors.', 'Change the representation without moving the object.']),('screen','02 / SCREEN → SLIDE','Continue through the screen.', ['Approach along the screen normal.', 'Hand the same projected corners to the 2D content.']),('particles','03 / EVIDENCE → TITLE','Give particles a source.', ['Read both real data groups.', 'Move their points into the conclusion, then reveal native text.']),('chart','04 / POINTS → GEOMETRY','Preserve the evidence.', ['Keep point identity and actual chart coordinates.', 'Hold the assembled shape before slowly making it solid.'])]
    for key,kicker,title,lines in specifications:
        plans.append(still('tech-'+key,card('plan-'+key,kicker,title,lines,'LAB SEQUENCE / STORYBOARD ONLY · BROWSER CAPTURE PENDING'),5))
    endtech=card('install','TRY THE METHODS / KEEP THE SOURCE','Start with one\nmeaningful transition.',['Explore the six self-contained Lab studies.', 'Download the skill ZIP and open a new Codex conversation.', 'github.com/Rayman0106/build-cinematic-3d-decks'], 'TECHNICAL DRAFT / F1 RECORDING + ARCHIVE + EXPLANATORY GRAPHICS')
    tech_parts=[f1('tech-f1',22,8,'The scene becomes the slide.','F1 ECONOMICS / SAVED FINAL-DECK RECORDING'),still('tech-workflow',workflow,7),*plans,math('tech-math',10),still('tech-install',endtech,10)]
    print('Encoding 55-second technical draft.',flush=True)
    technical=concat('Cinematic-3D-Technical-Draft-55s',tech_parts)
    for src,name in [(promo,'showcase-25s.mp4')]:
        run(['-i',src,'-vf','scale=1280:720:flags=lanczos,fps=30','-an','-c:v','libx264','-threads','4','-preset','slow','-crf','25','-pix_fmt','yuv420p','-movflags','+faststart',args.web_dir/name])
    run(['-ss','22','-i',args.f1_master,'-t','9','-vf','scale=1280:720:flags=lanczos,fps=30','-an','-c:v','libx264','-threads','4','-preset','slow','-crf','25','-pix_fmt','yuv420p','-movflags','+faststart',args.web_dir/'f1-handoff.mp4'])
    export_math_web()
    run(['-i',technical,'-vf','scale=1280:720:flags=lanczos,fps=30','-an','-c:v','libx264','-threads','4','-preset','slow','-crf','24','-pix_fmt','yuv420p','-movflags','+faststart',args.output_dir/'Cinematic-3D-Technical-Draft-55s-720p.mp4'])
    manifest={'created':'2026-10-22','type':'editorial cuts, not new browser recordings','audio':False,'sources':[
        {'id':'f1-master','kind':'saved final-deck recording','sha256':digest(args.f1_master),'pixels':[2400,1350],'fps':60,'recorded':'2026-10-13'},
        {'id':'math-motion','kind':'archived development motion GIF','sha256':digest(args.math_motion),'pixels':[831,467],'frames':gif_frames,'seconds':gif_seconds,'note':'Low source frame rate; repeated, never interpolated. Final typography and transitions not shown.'}],
        'promo':{'duration':25,'cuts':[{'start':0,'length':5,'source':'f1-master','sourceStart':16},{'start':5,'length':5,'source':'f1-master','sourceStart':25},{'start':10,'length':5,'source':'f1-master','sourceStart':69.8},{'start':15,'length':5,'source':'math-motion','sourceStart':0},{'start':20,'length':5,'source':'original editorial closing graphic'}]},
        'technical':{'duration':55,'status':'draft; not final Lab capture','cuts':[{'start':0,'length':8,'source':'f1-master','sourceStart':22},{'start':8,'length':7,'source':'original workflow diagram'},{'start':15,'length':20,'source':'four original storyboard cards; Lab browser capture pending'},{'start':35,'length':10,'source':'math-motion','sourceStart':0},{'start':45,'length':10,'source':'original install graphic'}]},'files':{}}
    for path in [promo,technical,*args.web_dir.glob('*.mp4'),args.output_dir/'Cinematic-3D-Technical-Draft-55s-720p.mp4']:
        manifest['files'][path.name]={'bytes':path.stat().st_size,'sha256':digest(path)}
    (args.output_dir/'edit-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
    shutil.copyfile(args.output_dir/'edit-manifest.json',args.web_dir/'video-manifest.json')
    print(json.dumps(manifest['files'],indent=2),flush=True)

if __name__=='__main__':main()
