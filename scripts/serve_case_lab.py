"""Serve the explicitly built two-car Lab on loopback; no directory access."""
from pathlib import Path
from http.server import ThreadingHTTPServer,BaseHTTPRequestHandler
from urllib.parse import urlsplit,unquote
import argparse,json,mimetypes,shutil

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--entry',required=True,type=Path)
    parser.add_argument('--port',type=int,default=8169)
    args=parser.parse_args();entry=args.entry.resolve();root=entry.parent
    scenes=root/(entry.stem+'-Scenes');receipt=json.loads((scenes/'build-receipt.json').read_text(encoding='utf-8'))
    if receipt['profiles'].get('f1-launch',{}).get('carCount')!=2:raise ValueError('Build the authorized two-car version first')
    allowed={'/':entry,'/'+entry.name:entry}
    for profile in receipt['profiles'].values():allowed['/'+profile['runtime']]=root/profile['runtime']
    for key in receipt['assetBank']:
        name='math-models.js' if key=='math-models' else 'f1-'+key+'.js'
        allowed['/'+scenes.name+'/assets/'+name]=scenes/'assets'/name
        if key!='math-models':allowed['/'+scenes.name+'/assets/'+name.replace('.js','.glb')]=scenes/'assets'/name.replace('.js','.glb')
    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            path=allowed.get(unquote(urlsplit(self.path).path))
            if not path or not path.is_file():self.send_error(404);return
            path=path.resolve();path.relative_to(root)
            self.send_response(200)
            self.send_header('Content-Type','model/gltf-binary' if path.suffix=='.glb' else mimetypes.guess_type(path.name)[0] or 'application/octet-stream')
            self.send_header('Content-Length',str(path.stat().st_size))
            self.send_header('Cache-Control','no-store' if path.suffix=='.html' else 'private, max-age=3600')
            self.send_header('X-Content-Type-Options','nosniff');self.end_headers()
            try:
                with path.open('rb') as src:shutil.copyfileobj(src,self.wfile,262144)
            except (BrokenPipeError,ConnectionResetError):pass
    server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler)
    print('Two-car Lab: http://127.0.0.1:'+str(args.port)+'/',flush=True)
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    finally:server.server_close()

if __name__=='__main__':main()
