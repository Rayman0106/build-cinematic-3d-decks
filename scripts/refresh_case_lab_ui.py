"""Refresh Lab interface code without rebuilding unchanged native model profiles."""
from pathlib import Path
import argparse,json,re
from build_case_lab import render_host,digest

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('entry',type=Path);args=parser.parse_args()
    entry=args.entry.resolve();text=entry.read_text(encoding='utf-8')
    manifest=json.loads(re.search(r'<script id="case-manifest" type="application/json">(.*?)</script>',text,re.S).group(1))
    scenes=entry.parent/(entry.stem+'-Scenes');receipt_path=scenes/'build-receipt.json';receipt=json.loads(receipt_path.read_text(encoding='utf-8'))
    for item in receipt['sources']:
        if digest((scenes/item['runtimeFile']).read_bytes())!=item['runtimeSha256']:raise ValueError('Native profile changed; use the full builder')
    encoded=render_host(manifest).encode('utf-8');entry.write_bytes(encoded)
    receipt.update(entryBytes=len(encoded),entrySha256=digest(encoded),initialBytes=len(encoded)+receipt['profiles'][receipt['initialProfile']]['entryBytes'])
    receipt_path.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'entryBytes':len(encoded),'entrySha256':digest(encoded),'nativeProfilesUnchanged':True},indent=2))

if __name__=='__main__':main()
