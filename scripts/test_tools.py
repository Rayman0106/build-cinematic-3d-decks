"""Meaningful failure cases for read-only tools. Fixtures live only in a temporary directory."""
import copy, importlib.util, json, struct, tempfile
from pathlib import Path
from inspect_glb import inspect
from validate_storyboard import validate
ROOT=Path(__file__).resolve().parent.parent
spec=importlib.util.spec_from_file_location('continuity',Path(__file__).with_name('check-continuity.py'))
continuity=importlib.util.module_from_spec(spec);spec.loader.exec_module(continuity)

def test():
    storyboard=json.loads((ROOT/'examples/storyboard.json').read_text(encoding='utf-8'));validate(storyboard)
    broken=copy.deepcopy(storyboard);broken['episodes'][1]['startState']['actors']['hero']['position'][0]+=2
    try:validate(broken)
    except ValueError:pass
    else:raise AssertionError('Discontinuous state passed')
    contract=json.loads((ROOT/'examples/fixtures/handoffs.json').read_text(encoding='utf-8'))
    assert continuity.check(contract)['status']=='pass'
    broken=copy.deepcopy(contract);broken['edges'][0]['to']['actors']['hero']['anchors']['nose'][0]+=10
    assert continuity.check(broken)['status']=='fail'
    assert continuity.check({'version':1,'edges':[{'from':{},'to':{}}]})['status']=='fail'
    gltf={'asset':{'version':'2.0'},'accessors':[{'count':3,'type':'VEC3','componentType':5126,'min':[0,0,0],'max':[1,1,0]}],
          'meshes':[{'primitives':[{'attributes':{'POSITION':0}}]}], 'nodes':[{'mesh':0}], 'materials':[{'alphaMode':'MASK'}]}
    encoded=json.dumps(gltf).encode();encoded+=b' '*((-len(encoded))%4)
    blob=struct.pack('<4sII',b'glTF',2,20+len(encoded))+struct.pack('<I4s',len(encoded),b'JSON')+encoded
    with tempfile.TemporaryDirectory(prefix='.tool-test-', dir=ROOT) as temporary:
        source=Path(temporary)/'fixture.glb';source.write_bytes(blob)
        report=inspect(source);assert report['trianglesPerMeshDefinition']==1 and report['materials'][0]['alphaMode']=='MASK'
        assert source.read_bytes()==blob
        source.write_bytes(blob[:-1])
        try:inspect(source)
        except ValueError:pass
        else:raise AssertionError('Truncated GLB passed')
    return {'status':'pass','discontinuityRejected':True,'missingEvidenceRejected':True,
            'glbMetadataReadOnly':True,'truncatedContainerRejected':True}

if __name__=='__main__':print(json.dumps(test(),indent=2))
