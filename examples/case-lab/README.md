# Real Project Lab — public viewer and local owner build

## Public viewer vs local build

- **Public viewer** — the deployed [Lab](https://rayman0106.github.io/build-cinematic-3d-decks/lab/) serves the public profiles `math-type`, `math-scene` and `f1-launch` with two real cars. It does not offer the full-team Cadillac grid.
- **Local owner-only builder** — the build steps below assemble `Interactive-Lab.html` from the owner's standalone decks. This local output adds the optional `f1-grid` inspection; it is not part of the public deployment.

The local build uses the owner's approved F1 Economics and Reaction Time assets and native animation functions: real cars and students, original materials, room, Monza track, camera choreography, photo registration, charts and typography. It replaces the simplified geometric demonstrator as the local visual showcase. The [mechanism studies](../lab/README.md) remain separate teaching code.

Six scene groups expose original clips. The October 30 review replaces the outline/photo lesson with the **car driving out of a budget bar** (original pages 3→4), and replaces the typography lesson with the **dot plot writing Mean / Median**. Playback rate, scrubbing, ±1/60-second stepping, looping and a text-layer toggle control native frames. They do not substitute new actor or camera trajectories.

## Open and use

Keep `Interactive-Lab.html` beside `Interactive-Lab-Scenes/` and open the HTML directly. The first experiment is the original Mean / Median dot plot: no car, character, room or Three.js model module is requested. Press Start when ready. Choose a car or character lesson to prepare its required assets. The full Cadillac inspection is **LOCAL OPTIONAL ONLY** and is not in the public deployment; it requires an explicit **Load 11-car-model experiment** click before its heavy assets are read.

| Startup profile | Original clips | Requested 3D content |
|---|---|---|
| `math-type` | Mean / Median dot plot (visible default); other native title samplers retained internally | None; selected original title masks only |
| `math-scene` | Screen entry/exit, 67, closing | Original student, props, room and monitor assets |
| `f1-launch` | Two-car start, budget-bar/car handoff, racing and wing iteration | Shared McLaren, Red Bull, Monza and light gantry |
| `f1-grid` | Optional full-team Cadillac inspection — **LOCAL OPTIONAL ONLY** | Eleven car models, Monza and light gantry; manual load; not in the public deployment |

On HTTP, F1 models are fetched directly as original binary GLB files, without large JavaScript/base64 carriers. Direct-file opening retains a local carrier fallback. Payload hashes match the approved model files; hard links share immutable local originals where available. Launch skips unused photo solving and outline readbacks, and begins at original time 10.5 s so two cars are not preceded by an empty back-grid tour. Startup yields use a bounded work budget.

Model and texture payloads are shared once in `Interactive-Lab-Scenes/assets/`, not copied for each experiment. At most one 3D project frame is retained; the prepared typography frame remains available too. F1 launch, budget and wing lessons reuse the same renderer and parsed models. Visiting typography also retains the paused F1 frame. Switching to the 3D student room releases it. Native precomputation and GPU warmup cover the selected clip rather than the entire deck. Clips in one profile reuse their parsed models and cached preparation. Only a switch to another 3D project releases the old 3D frame. Large optional scenes still need substantial parsing/upload work; this is not a claim of instant loading or a production network package.

The host shows preparation progress and waits for Start. Playback and seeking remain disabled until the requested clip is prepared and its first frame is acknowledged. Rapid selections invalidate stale acknowledgements. Sound is off; fullscreen belongs to the outer Lab interface.

## Rebuild

Use existing standalone decks owned by the user:

```sh
python scripts/build_case_lab.py --f1-deck /path/to/F1-Economics-Final.html --math-deck /path/to/reaction-time/index.html --output /path/to/Interactive-Lab.html
node scripts/test-case-lab.mjs
node scripts/test-case-adapters.mjs
node scripts/test-case-loading.mjs
```

The builder accepts expected source hashes and original gallery directories. Generated profiles and large payloads stay local; do not commit them to this skill repository or assume they fit the lightweight site's budget.

## Preservation and verification

- [f1-adapter.js](f1-adapter.js) calls native opening and transition functions inside their existing closure; [math-adapter.js](math-adapter.js) samples native episodes and transitions.
- [native-bridge.js](native-bridge.js) checks source and channel and serializes preparation. File documents need no cross-frame DOM access.
- [state.mjs](state.mjs) and [main.js](main.js) use one clock and one frame request in flight, coalescing intermediate seeks.
- [case_lab_profiles.py](../../scripts/case_lab_profiles.py) changes only selected asset inclusion, object construction and startup work. Every startup edit is recorded and reversed by the builder to audit its scope. Camera/actor samplers and original model, texture and material payloads are retained.
- Both formal source files are hash-checked before and after building. `build-receipt.json` records profile bytes, asset hashes and startup edits. It does not claim that every non-adapter byte of a specialized profile is unchanged.

Clock, call-contract and loading tests use inert doubles and render no pixels. Byte sizes describe encoded file reads, not measured seconds, memory use or GPU performance. The rebuilt two-car version has a scoped loopback development server (`scripts/serve_case_lab.py`). It serves only generated profiles and their listed assets, verifies the two-car build, and exposes no directory listing or original standalone files. The earlier file-URL failure does not establish that all local HTTP development is unavailable. Browser checks and measured results for this revision are recorded separately in the local maintenance report.

## Scope and licensing

The builder and its generated `Interactive-Lab.html` are a local, owner-only build; this document and the repository do not grant publication rights to any asset payload, and the public Lab does not imply such rights. Original project credits and asset terms still apply. The public deployment uses its published profiles with two real cars and CC0 public Math motion; it excludes the local `f1-grid` payload and any separately licensed classroom motion, such as classroom Mixamo tracks. The classroom Math deck can contain separately licensed motion absent from its public source version. Check project notices and authorization before publishing any derived asset payload. A link to the public case does not relicense its models or motion.
