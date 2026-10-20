"""Validate a small deterministic storyboard; no browser or project mutations."""
from pathlib import Path
import argparse, json, math

def validate(data):
    def scalar(v): return isinstance(v,(int,float)) and not isinstance(v,bool) and math.isfinite(v)
    def vec3(v): return isinstance(v,list) and len(v)==3 and all(scalar(x) for x in v)
    if data.get('version') != 1 or not data.get('episodes'): raise ValueError('Nonempty version 1 storyboard required')
    ids=set();checks=[];previous=None
    for episode in data['episodes']:
        name=episode.get('id')
        if not isinstance(name,str) or not name or name in ids: raise ValueError('Unique nonempty episode IDs required')
        ids.add(name);duration=episode.get('duration')
        if isinstance(duration,bool) or not isinstance(duration,(int,float)) or not math.isfinite(duration) or duration<=0:
            raise ValueError(name+': positive finite duration required')
        if not episode.get('claim'): raise ValueError(name+': viewer-facing claim required')
        beats=episode.get('beats',[])
        if not beats: raise ValueError(name+': beats required')
        for beat in beats:
            a,b=beat.get('start'),beat.get('end')
            if not all(isinstance(v,(int,float)) and not isinstance(v,bool) and math.isfinite(v) for v in (a,b)) or not 0<=a<b<=duration:
                raise ValueError(name+': beat must fit in episode')
            if not beat.get('action'): raise ValueError(name+': meaningful action required')
        for end in ('startState','endState'):
            state=episode.get(end,{})
            if not state.get('actors') or not state.get('camera'): raise ValueError(name+': complete endpoint evidence required')
            for actor_id,actor in state['actors'].items():
                pos=actor.get('position')
                if not vec3(pos):
                    raise ValueError(name+': actor '+actor_id+' has invalid position')
                if 'heading' in actor and not scalar(actor['heading']):raise ValueError(name+': invalid heading')
                if 'scale' in actor and not (scalar(actor['scale']) and actor['scale']>0):raise ValueError(name+': invalid scalar scale')
            camera=state['camera']
            if not vec3(camera.get('position')) or not vec3(camera.get('target')) or not scalar(camera.get('fov')) or not 0<camera['fov']<180:
                raise ValueError(name+': camera position/target/FOV required')
            for field in ('worldAmount','outlineAmount'):
                if field in state and not (scalar(state[field]) and 0<=state[field]<=1):raise ValueError(name+': invalid '+field)
        # Example contracts intentionally require identical serialized boundary states.
        # Production approximate tolerance contracts use check-continuity.py instead.
        if previous is not None and previous!=episode['startState']:
            raise ValueError(name+': previous endState != startState; author an explicit connecting episode')
        previous=episode['endState'];checks.append({'id':name,'duration':duration,'beats':len(beats)})
    return {'status':'pass','episodes':checks,'limit':'Contract structure and exact shared boundaries only; not a visual review.'}

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('storyboard',type=Path);args=p.parse_args()
    try: result=validate(json.loads(args.storyboard.read_text(encoding='utf-8')))
    except (OSError,ValueError,TypeError,KeyError) as e: print(json.dumps({'status':'invalid','error':str(e)}));raise SystemExit(1)
    print(json.dumps(result,ensure_ascii=False,indent=2))
