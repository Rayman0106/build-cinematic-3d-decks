"""Connect the real-project Lab to the local Showcase, without copying models."""
from pathlib import Path
import argparse,hashlib,json,re,os,shutil
from build_case_lab import render_host

ROOT = Path(__file__).resolve().parent.parent

def build(entry,output=None):
    source=Path(entry).resolve()
    text=source.read_text(encoding='utf-8')
    manifest=json.loads(re.search(r'<script id="case-manifest" type="application/json">(.*?)</script>',text,re.S).group(1))
    manifest['showcaseHome']='../index.html'
    for profile in manifest['profiles'].values():profile['runtime']='../../'+profile['runtime']
    for project in manifest['projects'].values():project['original']=project['repository']
    target = ROOT / 'site/lab/index.html'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(render_host(manifest),encoding='utf-8')
    if output:
        output=Path(output).resolve();output.mkdir(parents=True,exist_ok=True)
        for path in (ROOT/'site').rglob('*'):
            if not path.is_file():continue
            relative=path.relative_to(ROOT/'site');destination=output/relative;destination.parent.mkdir(parents=True,exist_ok=True)
            if destination.exists() and destination.read_bytes()==path.read_bytes():continue
            temporary=destination.with_suffix(destination.suffix+'.tmp');shutil.copyfile(path,temporary);temporary.replace(destination)
    return {'labBytes': target.stat().st_size, 'sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
            'realProjectModels':True,'modelsCopiedIntoHomepage':False,'published':False,'reviewFolder':str(output) if output else None}

if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--case-entry',required=True,type=Path);parser.add_argument('--output',type=Path);args=parser.parse_args()
    print(json.dumps(build(args.case_entry,args.output), indent=2))
