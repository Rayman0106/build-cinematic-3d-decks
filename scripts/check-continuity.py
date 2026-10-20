"""Read-only endpoint checks. No rendering, network, asset mutation or browser access."""
import argparse,json,math,sys
from pathlib import Path

def number(value):
    return isinstance(value,(int,float)) and not isinstance(value,bool) and math.isfinite(value)

def vector(value,length=None):
    return isinstance(value,list) and bool(value) and (length is None or len(value)==length) and all(number(v) for v in value)

def check(contract):
    if not isinstance(contract,dict) or contract.get('version')!=1 or not isinstance(contract.get('edges'),list) or not contract['edges']:
        raise ValueError('Expected version 1 with a nonempty edges array')
    results=[]
    for edge in contract['edges']:
        if not isinstance(edge,dict):raise ValueError('Each edge must be an object')
        mode=edge.get('mode','world')
        if mode not in ('world','screen'):raise ValueError('mode must be world or screen')
        world_tol=edge.get('world_tolerance',.001);screen_tol=edge.get('screen_tolerance',1.5)
        angle_tol=edge.get('angle_tolerance',.001);scale_tol=edge.get('scale_tolerance',.001);fov_tol=edge.get('fov_tolerance',.1)
        if not all(number(v) and v>=0 for v in [world_tol,screen_tol,angle_tol,scale_tol,fov_tol]):raise ValueError('Tolerances must be finite and nonnegative')
        a,b=edge.get('from'),edge.get('to')
        if not isinstance(a,dict) or not isinstance(b,dict):raise ValueError('Each edge needs from and to states')
        aa,bb=a.get('actors',{}),b.get('actors',{})
        if not isinstance(aa,dict) or not isinstance(bb,dict):raise ValueError('actors must be a map of stable IDs')
        ids=edge.get('actor_ids',sorted(set(aa)|set(bb)))
        if not isinstance(ids,list) or any(not isinstance(i,str) for i in ids) or len(ids)!=len(set(ids)):raise ValueError('actor_ids must be distinct strings')
        failures=[];measurements=[]
        def compare(label,left,right,tolerance,length=None,angular=False,scalar=False):
            if scalar:
                valid=number(left) and number(right)
                delta=abs(math.atan2(math.sin(left-right),math.cos(left-right))) if valid and angular else abs(left-right) if valid else None
            else:
                valid=vector(left,length) and vector(right,length) and len(left)==len(right)
                delta=math.sqrt(sum((x-y)**2 for x,y in zip(left,right))) if valid else None
            if not valid:failures.append({'field':label,'reason':'Missing, malformed or non-finite values'});return
            measurements.append({'field':label,'delta':delta,'tolerance':tolerance})
            if delta>tolerance:failures.append({'field':label,'delta':delta,'tolerance':tolerance})
        for actor_id in ids:
            left,right=aa.get(actor_id),bb.get(actor_id)
            if not isinstance(left,dict) or not isinstance(right,dict):failures.append({'actor':actor_id,'reason':'Actor missing from one endpoint'});continue
            prefix='actor.'+actor_id
            if mode=='world':
                for field,size in [('position',3),('scale',3)]:
                    if field in left or field in right:
                        scalar=field=='scale' and number(left.get(field)) and number(right.get(field))
                        compare(prefix+'.'+field,left.get(field),right.get(field),scale_tol if field=='scale' else world_tol,size,scalar=scalar)
                if 'heading' in left or 'heading' in right:compare(prefix+'.heading',left.get('heading'),right.get('heading'),angle_tol,angular=True,scalar=True)
            else:
                if 'bounds' in left or 'bounds' in right:compare(prefix+'.bounds',left.get('bounds'),right.get('bounds'),screen_tol,4)
                x,y=left.get('anchors',{}),right.get('anchors',{})
                if not isinstance(x,dict) or not isinstance(y,dict):failures.append({'field':prefix+'.anchors','reason':'anchors must be a map'});continue
                for key in sorted(set(x)|set(y)):compare(prefix+'.anchors.'+key,x.get(key),y.get(key),screen_tol,2)
        if mode=='world' and ('camera' in a or 'camera' in b):
            left,right=a.get('camera',{}),b.get('camera',{})
            if not isinstance(left,dict) or not isinstance(right,dict):raise ValueError('camera must be an object')
            for field,size,tolerance in [('position',3,world_tol),('target',3,world_tol),('principal',2,screen_tol)]:
                if field in left or field in right:compare('camera.'+field,left.get(field),right.get(field),tolerance,size)
            if 'fov' in left or 'fov' in right:compare('camera.fov',left.get('fov'),right.get('fov'),fov_tol,scalar=True)
        if not measurements:failures.append({'reason':'No comparable geometry fields; missing evidence cannot pass'})
        results.append({'name':edge.get('name','unnamed'),'mode':mode,'status':'fail' if failures else 'pass','measurements':measurements,'failures':failures})
    return {'status':'pass' if all(r['status']=='pass' for r in results) else 'fail','edges':results,
            'limit':'Endpoint geometry only. Does not establish silhouette match, readable typography, natural motion or sound quality.'}

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('contract',type=Path);args=parser.parse_args()
    try:
        result=check(json.loads(args.contract.read_text(encoding='utf-8')))
        print(json.dumps(result,ensure_ascii=False,indent=2));return 0 if result['status']=='pass' else 1
    except (ValueError,TypeError,OSError) as error:
        print(json.dumps({'status':'invalid','error':str(error)},ensure_ascii=False));return 2

if __name__=='__main__':sys.exit(main())
