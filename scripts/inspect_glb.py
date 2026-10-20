"""Read-only GLB 2 structure report; not a renderer, decoder or full glTF validator."""
from pathlib import Path
import argparse, collections, hashlib, json, struct

def inspect(path):
    data = Path(path).read_bytes()
    if len(data) < 20:
        raise ValueError('GLB is too short')
    magic, version, declared = struct.unpack_from('<4sII', data)
    if magic != b'glTF' or version != 2 or declared != len(data):
        raise ValueError('Expected GLB 2 with an exact declared length')
    offset, chunks = 12, []
    while offset < len(data):
        if offset + 8 > len(data): raise ValueError('Truncated chunk header')
        length, kind = struct.unpack_from('<I4s', data, offset)
        offset += 8
        if length % 4 or offset + length > len(data): raise ValueError('Invalid chunk length/alignment')
        chunks.append((kind, data[offset:offset+length])); offset += length
    if not chunks or chunks[0][0] != b'JSON': raise ValueError('First GLB chunk must be JSON')
    gltf = json.loads(chunks[0][1].rstrip(b' \t\r\n\0'))
    if gltf.get('asset', {}).get('version') != '2.0': raise ValueError('Expected glTF asset.version 2.0')
    accessors, meshes, nodes = (gltf.get(k, []) for k in ('accessors', 'meshes', 'nodes'))
    def accessor(index):
        if not isinstance(index, int) or isinstance(index, bool) or not 0 <= index < len(accessors):
            raise ValueError('Primitive references missing accessor')
        return accessors[index]
    primitive_rows, shared = [], collections.defaultdict(list)
    for mi, mesh in enumerate(meshes):
        for pi, primitive in enumerate(mesh.get('primitives', [])):
            attrs = primitive.get('attributes', {})
            pos = accessor(attrs['POSITION']) if 'POSITION' in attrs else {}
            count = accessor(primitive['indices']).get('count', 0) if 'indices' in primitive else pos.get('count', 0)
            mode = primitive.get('mode', 4)
            triangles = count//3 if mode == 4 else max(0, count-2) if mode in (5,6) else 0
            row = {'mesh': mi, 'meshName': mesh.get('name', ''), 'primitive': pi, 'vertices': pos.get('count', 0),
                   'triangles': triangles, 'mode': mode, 'material': primitive.get('material'),
                   'attributes': sorted(attrs), 'localBounds': {'min': pos.get('min'), 'max': pos.get('max')},
                   'morphTargets': len(primitive.get('targets', [])), 'extensions': sorted(primitive.get('extensions', {}))}
            primitive_rows.append(row)
            signature = {k: primitive[k] for k in ('attributes','indices','targets','mode','extensions') if k in primitive}
            shared[hashlib.sha256(json.dumps(signature,sort_keys=True).encode()).hexdigest()].append([mi,pi])
    materials = [{'index': i, 'name': m.get('name',''), 'alphaMode': m.get('alphaMode','OPAQUE'),
                  'alphaCutoff': m.get('alphaCutoff',.5), 'doubleSided': m.get('doubleSided',False),
                  'hasBaseColorTexture': 'baseColorTexture' in m.get('pbrMetallicRoughness',{})}
                 for i,m in enumerate(gltf.get('materials',[]))]
    return {'file': Path(path).name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(),
            'gltfVersion': '2.0', 'meshCount':len(meshes), 'primitiveCount':len(primitive_rows),
            'trianglesPerMeshDefinition':sum(p['triangles'] for p in primitive_rows),
            'nodes':[{'index':i,'name':n.get('name',''),'mesh':n.get('mesh'),'skin':n.get('skin'),
                      'children':n.get('children',[]),'translation':n.get('translation',[0,0,0]),
                      'rotation':n.get('rotation',[0,0,0,1]),'scale':n.get('scale',[1,1,1]),
                      **({'matrix':n['matrix']} if 'matrix' in n else {})} for i,n in enumerate(nodes)],
            'primitives':primitive_rows,'materials':materials,
            'skinCount':len(gltf.get('skins',[])),
            'skins':[{'name':s.get('name',''),'jointCount':len(s.get('joints',[]))} for s in gltf.get('skins',[])],
            'animations':[{'name':a.get('name',''),'channels':len(a.get('channels',[]))} for a in gltf.get('animations',[])],
            'imageCount':len(gltf.get('images',[])),
            'externalUris':[x['uri'] for k in ('images','buffers') for x in gltf.get(k,[]) if 'uri' in x and not x['uri'].startswith('data:')],
            'extensionsUsed':gltf.get('extensionsUsed',[]),'extensionsRequired':gltf.get('extensionsRequired',[]),
            'sharedPrimitiveReferences':[v for v in shared.values() if len(v)>1],
            'limits':['Bounds are accessor-local, not transformed world bounds.',
                      'Counts are per mesh definition, not multiplied by scene instances.',
                      'Shared references may be intentional; this does not prove coplanar duplicates.',
                      'No image/geometry decoding, skin deformation, rendering or licensing inference.']}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('glb',type=Path);parser.add_argument('--out',type=Path);args=parser.parse_args()
    try: result=inspect(args.glb)
    except (OSError, ValueError, KeyError, TypeError, struct.error) as error:
        print(json.dumps({'status':'invalid','error':str(error)}));return 2
    text=json.dumps(result,ensure_ascii=False,indent=2)+'\n'
    if args.out: args.out.parent.mkdir(parents=True,exist_ok=True);args.out.write_text(text,encoding='utf-8')
    else: print(text,end='')
    return 0

if __name__=='__main__': raise SystemExit(main())
