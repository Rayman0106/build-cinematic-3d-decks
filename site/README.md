# Published showcase — 30 October 2026

Live: https://rayman0106.github.io/build-cinematic-3d-decks/ · [Interactive Lab](https://rayman0106.github.io/build-cinematic-3d-decks/lab/)

The static production build and on-demand model assets are hosted in the `gh-pages` branch; the separate `site/` tree below is the local source/review build, not a standalone copy of the production asset bank. The public lab has six lessons. Its character data uses the CC0 public motion from the Reaction Time repository; the classroom-only Mixamo track is not distributed. The optional full-grid variant remains local. The public version retains Monza. The 55-second film is published; the rejected 25-second draft is not. Initial typography does not load 3D assets; selecting F1 or the student room does.

---

# Cinematic 3D Showcase · local review, 30 October 2026

The local review connects the real-model Interactive Lab, two cases, one silent **55-second technical film**, credits and installation instructions. The 25-second promo was withdrawn after owner review; its original master is archived locally. The technical revision retains complete actions and dissolves only after they settle. This description records the earlier local review. Monza and the approved full decks remain unchanged. Six Lab lesson groups use the original case renderers; the procedural mechanism example stays separate in `examples/playground.html`.

The homepage loads no models, native deck or video until selected. The Lab begins with the native Mean / Median dot plot. Its second lesson is the budget-bar car driving into the next page, replacing the outline/photo example. F1 lessons share the same two-car renderer; the full-team Cadillac inspection is optional. Student/room content loads only when selected. The review master is 2400 × 1350/60fps; site derivatives are 1280 × 720/30fps. The film includes the full camera-entry and target-page title animation, with a short editorial closing card. Native WebGL capture sizes are recorded separately from the composite output dimensions.

## Build and preview

From the repository root, after generating the owner-authorized case Lab:

```sh
python scripts/build_site.py --case-entry /path/to/Interactive-Lab.html --output /path/to/outputs/Cinematic-3D-Showcase
python scripts/check_site.py
node scripts/test-case-lab.mjs
node scripts/test-case-adapters.mjs
node scripts/test-case-loading.mjs
```

The review server lives with local capture/delivery records and serves this directory plus an exact list of the generated shared model dependencies. The Lab manifest uses `../../Interactive-Lab-Scenes/` relative to `lab/index.html`; the local review folder must remain beside that generated shared directory. Models are not copied into the lightweight homepage package. Opening the review folder locally is supported by the generated carrier fallbacks; browser HTTP review uses original GLBs directly.

Current review: `http://127.0.0.1:8174/`. This is a local service, not a public URL. Source/Release links remain public GitHub links. `sources.html` distinguishes approved F1 footage, fresh native handoff captures and editorial graphics.

## Publication boundary

The manual workflow verifies the review sources and does not deploy this local package as if its large case assets were already hosted. Before publishing, resolve the asset base and classroom motion/licensing scope, validate the production dependency paths, and review the actual public URL. The historical review was not deployed; the public build is now hosted separately on `gh-pages`.
