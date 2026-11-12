# Validation scope

## Rendering guide 1.1.0 · 12 November 2026

Documents the accepted F1 Final J revision: scenery continuity, material and HDR
sources, alpha-mip foliage, stable shadow focus/LOD, static CPU caches, bounded
startup Workers, viewport warming and wall-clock frame pacing. Includes links to
the production source and measured limits. It does not replace the online Lab's
asset bank, record a new film or modify the mathematics case. Package/link checks
are rerun for this guide; prior runtime measurements remain explicitly dated.

## Maintenance release 1.0.3 · 2026-11-03

This revision separates public source checks from native case-asset builds and clarifies the installation, complete-deck and live-Lab entry points. `build_site.py --check-source` compiles the host and manifest in memory without classroom assets or a generated-site rewrite. The source workflow retains numerical, packaging, continuity and inert host-control checks.

The production real-project Lab remains on the separate `gh-pages` asset bank. No car model, actor motion, camera sampler, formal deck or live Lab runtime is changed by this maintenance release. No new normal-speed playback or cross-device verification is claimed. Check the current [source workflow](https://github.com/Rayman0106/build-cinematic-3d-decks/actions/workflows/check.yml) separately from the dated observations below. Installation and payload scope are in [current status](docs/current-status.md) and the [Chinese quick start](docs/START-HERE.zh-CN.md).

The remaining entries preserve earlier release and review evidence. Their historical "not published" and access-limit statements describe those dated revisions.

## Owner revision 2 · 2026-10-30

The 25-second promo is withdrawn. The retained 55-second technical film has been recut around complete native actions, with 0.6-second dissolves within held endpoints. The budget→car and development scenes run consecutively. Screen footage includes the target-page title after camera arrival; that title is not frozen halfway. The Lab replaces its outline/photo lesson with the native 5.8-second regulation/budget-car handoff, and its type lesson with the Mean / Median dot plot. Startup remains typography-only with manual Start, shared original models and unchanged formal deck hashes. Per-file decode, cut ranges and current browser evidence live with the local revision receipt. The entries below are historical records, not acceptance claims for this revision.

## Owner review v1 · 2026-10-28

The current Showcase links to the **real-project** Lab, not the earlier geometric teaching example. The local HTTP review now supports its generated dependencies. Browser review has covered the typography variants, room/screen handoff, articulated student and closing, and the two-car Monza scene. Loading requires an explicit Start; preparing another lesson does not start the original formal deck. Static checks and inert input tests remain separate from visual observations; no cross-device or sustained-frame-rate claim is made.

The new 25-second and 55-second silent masters contain exactly 1,500 and 3,300 frames, respectively, at 2400 × 1350/60 fps. Both passed complete decode. The edits use the approved Monza recording and new native Math captures. Math WebGL was sampled at 1920 × 1080 inside the 2400 × 1350 composite; the output size does not imply a higher native model-render resolution. The 55-second cut ends with two short editorial cards rather than presenting them as recorded Lab operation. Sources and cut ranges are in the local edit manifest.

Obsolete track-replacement generated files were removed after recording their paths, sizes and hashes. The approved Monza/F1 and Math standalone sources are protected by hashes. This local review has not been pushed, published or deployed. Sections below preserve the scope and limitations of earlier iterations; their access restrictions do not describe the rebuilt current HTTP review.

## Real-project Lab correction · 2026-10-28

The geometric demonstrator was rejected as the showcase. The local [Real Project Lab](examples/case-lab/README.md) uses approved assets and native camera/actor samplers. The revised launch now loads **two cars**, McLaren and Red Bull, with Monza and the light gantry. It starts at original time 10.5 s and lasts 20.5 s, removing an empty back-grid tour. The formal deck remains unchanged. Optional full-team Cadillac inspection is separate and explicitly opt-in. Launch, overtaking, outline/photo and wing iteration now share one parsed two-car renderer. A visit to the lightweight typography view retains that paused renderer; entering the student room releases it. A previous missing-gantry dependency could leave isolated F1 profiles at 74%; the shared scene includes the required gantry, and obsolete isolated profiles were archived.

F1 HTTP loading uses original binary GLB files instead of JavaScript/base64 carriers. Payloads match source hashes; matching local originals are shared with hard links. Launch skips unrelated photo calibration, silhouette readbacks and background-model LOD construction. Preparation yields do not depend on suspended background animation frames. Model quality, materials, the chosen native camera path and vehicle motion are retained.

`test-case-lab.mjs` covers clock/queue behavior; `test-case-adapters.mjs` covers native calls and the launch time offset; `test-case-loading.mjs` covers two-car routing, the initial typography-only view, cached returns, opt-in team inspection and stale-message/preparation gating. These use inert doubles. Builder scope edits are recorded and reversible; formal files and payloads are hash-checked. The scoped `serve_case_lab.py` serves only the generated two-car build and listed dependencies over loopback, not source directories or original standalone files.

Browser tests of the rebuilt two-car HTTP version are now possible: first view, actual two-car rendering and asset requests have been inspected. This does not certify every other clip or every device. Final run measurements and screenshots are recorded locally under the October 28 maintenance folder. The current generated asset payloads are not published.

## Local Interactive Lab revision · 2026-10-28

Six studies now expose bounded controls, phase navigation, reference guides, playback rates and frame stepping. New checks are `node scripts/test-lab-state.mjs` (timeline/projection mathematics) and `node scripts/test-lab-controls.mjs` (inert DOM/Canvas doubles for the real input handlers). The latter deliberately disables WebGL and uses tiny synthetic glyph masks; it does not render, record or replace a browser test. It covers preparation and Start gating, mode links, source switching, glyph-cache reuse, speed changes, pause/reset, frame stepping and background-tab pause.

The source, standalone HTML and website Lab have changed in this local revision. The v1.0.2 paragraph below is a historical release record. Normal-speed playback and responsive visual review of this revision remain unverified because local Lab access was rejected by browser policy. No alternate protocol, renderer or browser was used to bypass that rejection. No publication is part of this local update.

## Published release record

This package distinguishes new mechanism examples from the two finished case-study decks.

Version 1.0.2 expands the README into nine concrete capabilities, each with project examples, specific deliverables and links to its implementation guidance. The skill entry point uses the same task breakdown. The lab and reusable runtime code are unchanged from v1.0.0. Documentation links, package structure and skill metadata are rechecked for this revision; numerical tests remain covered by the automated workflow.

## Executable checks

The release is checked with the following commands:

```sh
python scripts/build_examples.py
python scripts/validate_package.py
python scripts/validate_storyboard.py examples/storyboard.json
python scripts/test_tools.py
python scripts/check-continuity.py examples/fixtures/handoffs.json
node scripts/test-kernel.mjs
node scripts/test-motion.mjs
node --check examples/lab/main.mjs
```

The geometry tests cover photo crop/affine mapping, contour winding/cyclic correspondence, morph endpoints, Hermite endpoint velocities, numerically integrated nonnegative relative speed, deterministic handoff state, contributions from both particle sources, reverse motion along the actual polyline, coverage of all provided glyph-mask pixels, and IK segment length/reach.

The Python tool tests verify rejection of discontinuous/missing endpoint evidence and truncated GLB containers, and preservation of input bytes during inspection. A real model from the public project is also inspected read-only during packaging; its source file is not bundled.

The generated HTML is parsed for JavaScript syntax, local resources are embedded, and a second build is compared for byte reproducibility. Standard Skill frontmatter validation is run during release preparation.

## Limits

- The tests exercise numerical and packaging behavior. They do **not** certify visual polish, frame-time stability, natural character movement, audio quality or exact photo alignment.
- The offline lab has not been verified here through normal-speed browser playback. Local-file browser access was restricted in the working environment; no alternate browser/control route was used to bypass that restriction.
- The case-study preview media are saved project recordings/captures, not proof that every device was tested. Their repositories retain the corresponding media provenance.
- The lab's edge rendering is a same-projection wireframe study, not a silhouette/photo registration algorithm. Its planar IK is a mechanism study, not a full retargeting system.
- System-font glyph appearance varies by platform; complex-script shaping and production photo/character assets require project-specific validation.

Publication verifies repository visibility, release asset digests and reciprocal project links separately from the visual checks above.
