"""Check local documentation links and executable sample packaging. No network."""
from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parent.parent

def validate():
    issues=[];documents=list(ROOT.rglob('*.md'))
    for path in documents:
        text=path.read_text(encoding='utf-8')
        for target in re.findall(r'\]\(([^\s)]+)(?:\s+"[^"]*")?\)',text):
            if target.startswith(('https://','http://','mailto:','#')):continue
            target=target.split('#')[0]
            if target and not (path.parent/target).exists():issues.append(f'{path.relative_to(ROOT)}: missing link {target}')
        if re.search(r'C:[/\\]Users[/\\]',text):issues.append(f'{path.relative_to(ROOT)}: private absolute user path')
    skill=(ROOT/'SKILL.md').read_text(encoding='utf-8')
    if not re.match(r'---\nname: build-cinematic-3d-decks\ndescription:',skill):issues.append('Invalid skill identity/frontmatter')
    for name in ('animation-core.mjs','semantic-motion.mjs','transition-kernel.mjs'):
        code=(ROOT/'assets'/name).read_text(encoding='utf-8')
        for relative in re.findall(r"from ['\"](\.[^'\"]+)['\"]",code):
            if not (ROOT/'assets'/relative).is_file():issues.append(name+': missing import '+relative)
    demo=(ROOT/'examples/playground.html').read_text(encoding='utf-8')
    if re.search(r'@@[A-Z_]+@@',demo):issues.append('Unresolved HTML template token')
    if re.search(r'<(?:script|link|img)\b[^>]*(?:src|href)=[\"\']https?://',demo,re.I):issues.append('Demo has external runtime resources')
    if 'data:text/javascript;base64,' not in demo:issues.append('Offline Three.js not embedded')
    for path in ROOT.rglob('*'):
        if '.git' in path.parts:continue
        if path.is_file() and path.suffix.lower() in ('.glb','.gltf','.blend','.blend1','.fbx','.wav','.mp3'):
            issues.append('Unexpected source-model/motion/audio payload: '+path.relative_to(ROOT).as_posix())
    if not (ROOT/'vendor/THREE-LICENSE.txt').is_file():issues.append('Missing third-party licence')
    return {'status':'pass' if not issues else 'fail','documents':len(documents),
            'demoBytes':len(demo.encode()),'issues':issues,
            'limit':'Packaging and local links only, not browser or visual validation.'}

if __name__=='__main__':
    result=validate();print(json.dumps(result,ensure_ascii=False,indent=2));raise SystemExit(0 if result['status']=='pass' else 1)
