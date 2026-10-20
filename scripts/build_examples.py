"""Build the procedural offline lab. Standard library; no network, model or npm dependency."""
from pathlib import Path
import base64, hashlib, json, re
ROOT=Path(__file__).resolve().parent.parent

def build():
    def read(name): return (ROOT/name).read_text(encoding='utf-8')
    three=read('vendor/three.module.min.js')
    module='import * as THREE from '+json.dumps('data:text/javascript;base64,'+base64.b64encode(three.encode()).decode())+';\n'
    for name in ('assets/animation-core.mjs','assets/semantic-motion.mjs'):
        code=read(name)
        code=re.sub(r'^import [^\n]+\n','',code,flags=re.M)
        code=re.sub(r'\bexport (?=(?:const|let|function|class)\b)','',code)
        module+=code+'\n'
    module+=read('examples/lab/main.mjs')
    module=module.replace('</script','<\\/script')
    html=read('examples/lab/template.html')
    for token,value in {'@@CSS@@':read('examples/lab/style.css'),'@@MODULE@@':module,
                        '@@THREE_LICENSE@@':read('vendor/THREE-LICENSE.txt')}.items():
        if html.count(token)!=1:raise ValueError('Expected exactly one '+token)
        html=html.replace(token,value)
    if re.search(r'@@[A-Z_]+@@',html):raise ValueError('Unreplaced build token')
    out=ROOT/'examples/playground.html';out.write_text(html,encoding='utf-8',newline='\n')
    return {'output':'examples/playground.html','bytes':out.stat().st_size,
            'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'engine':'Three.js r160',
            'externalModels':0,'externalRequests':0}

if __name__=='__main__':print(json.dumps(build(),indent=2))
