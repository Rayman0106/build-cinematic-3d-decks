"""Build a LOCAL real-project Lab from the owner's existing standalone decks.

No download, renderer, browser, publication or model conversion is performed.
The original files are never changed. Selected startup profiles share one asset
bank beside the small host HTML; the initial profile requests no 3D models.
Third-party assets retain the original project licensing.
"""
from pathlib import Path
import argparse,base64,hashlib,json,os,re
from case_lab_profiles import PROFILES,specialize,head_plan

ROOT=Path(__file__).resolve().parent.parent
SOURCE=ROOT/'examples/case-lab'

def digest(data):return hashlib.sha256(data).hexdigest()
def data_uri(path,mime):return 'data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode('ascii')
def read(path):return path.read_bytes().decode('utf-8')

NATIVE_CSS='''<style id="cinematic-case-lab-chrome">
#controls,#boot-progress,#start-gate,#start-deck,#loading,#deck-controls,#deck-toolbar,.briefing-footer,#previous-slide,#next-slide,#slide-counter,#notes-dialog{display:none!important}
body{pointer-events:none!important}
html.case-lab-hide-text [data-copy],html.case-lab-hide-text #story-caption,html.case-lab-hide-text #race-status,html.case-lab-hide-text .type-title,html.case-lab-hide-text .slide h1,html.case-lab-hide-text .slide h2,html.case-lab-hide-text .slide h3,html.case-lab-hide-text .slide p,html.case-lab-hide-text #masthead,html.case-lab-hide-text #slide-footer{visibility:hidden!important}
</style>'''

def adapt(original,project):
    text=original.decode('utf-8');adapter=read(SOURCE/f'{project}-adapter.js')
    marker='window.F1Briefing=Object.freeze({' if project=='f1' else 'window.__DECK__={'
    if text.count(marker)!=1:raise ValueError('Expected one native API marker for '+project)
    replacement=adapter+'\n'+marker+'lab:caseLabApi,'
    head=NATIVE_CSS+'\n<script>window.CINEMATIC_CASE_PROJECT='+json.dumps(project)+';\n'+read(SOURCE/'native-bridge.js')+'\n</script>\n'
    result=text.replace(marker,replacement,1).replace('</head>',head+'</head>',1)
    restored=result.replace(head,'',1).replace(replacement,marker,1).encode('utf-8')
    if restored!=original:raise AssertionError('A change escaped the native Lab adapter')
    return result.encode('utf-8'),{'project':project,'sourceSha256':digest(original),'nonAdapterBytesIdentical':True,'nativeCameraAndActorCodeUnchanged':True,'modelMaterialFontPayloadsUnchanged':True}

def render_host(manifest):
    font='@font-face{font-family:Manrope;font-style:normal;font-weight:200 800;font-display:block;src:url("'+data_uri(ROOT/'site/fonts/Manrope.ttf','font/ttf')+'") format("truetype");}'
    css=read(SOURCE/'style.css').replace('@@FONT@@',font).replace('body:fullscreen',':root:fullscreen')
    script=re.sub(r'\bexport (?=(?:const|let|function|class)\b)','',read(SOURCE/'state.mjs'))+'\n'+read(SOURCE/'main.js')
    script=script.replace('</script','<\\/script')
    html=read(SOURCE/'template.html')
    for token,value in {'@@CSS@@':css,'@@MANIFEST@@':json.dumps(manifest,ensure_ascii=False).replace('<','\\u003c'),'@@SCRIPT@@':script}.items():
        if html.count(token)!=1:raise ValueError('Missing or repeated Lab token: '+token)
        html=html.replace(token,value)
    if re.search(r'@@[A-Z_]+@@',html):raise ValueError('Unresolved Lab token')
    return html

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--f1-deck',required=True,type=Path)
    parser.add_argument('--math-deck',required=True,type=Path)
    parser.add_argument('--output',required=True,type=Path)
    parser.add_argument('--expect-f1',help='Optional expected SHA256 for the approved formal source')
    parser.add_argument('--expect-math',help='Optional expected SHA256 for the approved formal source')
    parser.add_argument('--f1-media',type=Path,help='Optional original F1 gallery directory')
    parser.add_argument('--math-media',type=Path,help='Optional original Math gallery directory')
    parser.add_argument('--asset-root',type=Path,help='Optional immutable F1 asset directory; matching GLBs are shared with hard links')
    parser.add_argument('--budget-poster',type=Path,help='Optional capture of the original budget/car handoff')
    parser.add_argument('--dotplot-poster',type=Path,help='Optional capture of the original Mean/Median dot plot')
    args=parser.parse_args();out=args.output.resolve();out.parent.mkdir(parents=True,exist_ok=True)
    runtime=out.parent/(out.stem+'-Scenes');runtime.mkdir(parents=True,exist_ok=True)
    bank_directory=runtime/'assets';bank_directory.mkdir(exist_ok=True)
    reports=[];projects={};originals={};asset_urls={};asset_stats={}
    for project,path,expected in [('f1',args.f1_deck,args.expect_f1),('math',args.math_deck,args.expect_math)]:
        path=path.resolve();original=path.read_bytes()
        if expected and digest(original)!=expected:raise ValueError('Approved source hash mismatch: '+project)
        originals[project]=(original,path)
        projects[project]={'name':'F1 Economics' if project=='f1' else 'Reaction Time Mathematics',
            'coverKicker':'F1 ECONOMICS / ORIGINAL MONZA OPENING' if project=='f1' else 'REACTION TIME / ORIGINAL STUDY ROOM',
            'repository':'https://github.com/Rayman0106/'+('f1-economics-3d-deck' if project=='f1' else 'reaction-time-math-3d-deck'),
            'original':os.path.relpath(path,out.parent).replace(os.sep,'/')}
    f1_text=originals['f1'][0].decode('utf-8')
    candidates={}
    if args.asset_root:
        for path in args.asset_root.resolve().rglob('*.glb'):candidates.setdefault(path.stat().st_size,[]).append(path)
    for match in re.finditer(r'<script\b[^>]*\bid="asset-([^"]+)"[^>]*>(.*?)</script>',f1_text,re.S):
        key,payload=match.groups();filename='f1-'+key+'.js';target=bank_directory/filename
        carrier='(()=>{const n=document.getElementById('+json.dumps('asset-'+key)+')||document.createElement("script");n.type="application/octet-stream";n.id='+json.dumps('asset-'+key)+';delete n.dataset.src;n.textContent='+json.dumps(payload)+';if(!n.isConnected)document.head.appendChild(n);})();\n'
        encoded=carrier.encode('utf-8')
        if not target.exists() or digest(target.read_bytes())!=digest(encoded):target.write_bytes(encoded)
        binary=base64.b64decode(payload.strip(),validate=True);binary_hash=digest(binary)
        if binary[:4]!=b'glTF':raise ValueError('Not a GLB: '+key)
        binary_target=target.with_suffix('.glb');shared=None
        if not binary_target.exists():
            for candidate in candidates.get(len(binary),[]):
                if digest(candidate.read_bytes())==binary_hash:
                    try:binary_target.hardlink_to(candidate);shared=str(candidate);break
                    except OSError:pass
        if not binary_target.exists() or digest(binary_target.read_bytes())!=binary_hash:
            temporary=binary_target.with_suffix('.tmp.glb');temporary.write_bytes(binary);temporary.replace(binary_target)
        asset_urls[key]='assets/'+filename;asset_stats[key]={'bytes':len(encoded),'sha256':digest(encoded),'payloadSha256':digest(payload.encode('utf-8')),'binaryBytes':len(binary),'binarySha256':binary_hash,'binarySharedSource':shared}
    math_text=originals['math'][0].decode('utf-8');models=re.search(r'<script>(window\.DECK_MODEL_DATA=.*?;)</script>',math_text,re.S)
    if not models:raise ValueError('No native Math models')
    target=bank_directory/'math-models.js';encoded=models.group(1).encode('utf-8')
    if not target.exists() or digest(target.read_bytes())!=digest(encoded):target.write_bytes(encoded)
    asset_urls['math-models']='assets/math-models.js';asset_stats['math-models']={'bytes':len(encoded),'sha256':digest(encoded)}
    profiles={};routes={}
    for name,plan in PROFILES.items():
        project=plan['project'];original,path=originals[project];adapted,report=adapt(original,project)
        text,edits=specialize(adapted.decode('utf-8'),name,asset_urls);text=text.replace('</head>',head_plan(name)+'</head>',1);native=text.encode('utf-8')
        filename=project+'-native.html' if name in ('f1-grid','math-scene') else name+'.html';target=runtime/filename
        if not target.exists() or digest(target.read_bytes())!=digest(native):
            temporary=target.with_suffix('.tmp.html');temporary.write_bytes(native);temporary.replace(target)
        keys=plan.get('assets',[]) if project=='f1' else ['math-models'] if plan['three'] else []
        profiles[name]={'project':project,'runtime':runtime.name+'/'+filename,'entryBytes':len(native),'assetBytes':sum(asset_stats[key].get('binaryBytes',asset_stats[key]['bytes']) for key in keys),'assetKeys':keys,'clips':plan['clips'],'manualLoad':name=='f1-grid','carCount':len(plan.get('gridIndices',[]))}
        for clip in plan['clips']:routes[clip]=name
        report.pop('nonAdapterBytesIdentical',None);report.update(profile=name,runtimeFile=filename,runtimeBytes=len(native),runtimeSha256=digest(native),sourcePreserved=digest(path.read_bytes())==digest(original),recordedStartupChanges=edits,unrecordedSourceChanges=False)
        reports.append(report)
    manifest={'version':'real-project-two-car-3','projects':projects,'profiles':profiles,'routes':routes,'defaultLesson':'math-type','posters':{
        'grid':data_uri(ROOT/'site/media/f1-grid.webp','image/webp'),
        'redbull':data_uri(ROOT/'site/media/f1-cover.webp','image/webp'),
        'room':data_uri(ROOT/'site/media/reaction-cover.webp','image/webp')}}
    manifest['posters']['upgrade']=data_uri(args.f1_media/'development.jpg','image/jpeg') if args.f1_media else manifest['posters']['redbull']
    manifest['posters']['type']=data_uri(args.math_media/'distribution.jpg','image/jpeg') if args.math_media else manifest['posters']['room']
    manifest['posters']['budget']=data_uri(args.budget_poster,'image/jpeg') if args.budget_poster else manifest['posters']['upgrade']
    manifest['posters']['dotplot']=data_uri(args.dotplot_poster,'image/jpeg') if args.dotplot_poster else manifest['posters']['type']
    manifest['profiles']['math-type']['inlineHtml']=(runtime/'math-type.html').read_text(encoding='utf-8')
    html=render_host(manifest)
    out.write_bytes(html.encode('utf-8'))
    receipt={'entry':out.name,'entryBytes':out.stat().st_size,'entrySha256':digest(out.read_bytes()),'runtimeDirectory':runtime.name,
        'sources':reports,'profiles':profiles,'assetBank':asset_stats,'realProjectRuntimes':True,'standInModels':False,'oneActive3DProject':True,'audioEnabled':False,
        'initialProfile':'math-type','initialBytes':len(html.encode('utf-8'))+profiles['math-type']['entryBytes'],'initialModelBytes':0,
        'browserPlaybackVerified':False,'published':False,'note':'On-demand experiment profiles; native visible asset quality, camera and animation samplers retained. No timing claim without browser measurement.'}
    (runtime/'build-receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(receipt,ensure_ascii=False,indent=2))

if __name__=='__main__':main()
