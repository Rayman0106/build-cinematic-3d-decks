"""Copy the existing self-contained Lab. No network, model or render step."""
from pathlib import Path
import hashlib, json

ROOT = Path(__file__).resolve().parent.parent

def build():
    source = ROOT / 'examples/playground.html'
    target = ROOT / 'site/lab/index.html'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(source.read_bytes())
    return {'labBytes': target.stat().st_size, 'sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
            'byteIdentical': target.read_bytes() == source.read_bytes()}

if __name__ == '__main__':
    print(json.dumps(build(), indent=2))
