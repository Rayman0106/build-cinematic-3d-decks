# Current public status — 3 November 2026

This page is the current public entry point. The dated [showcase delivery record](showcase-delivery.md) is history and does not describe the present deployment.

## Three distinct deliverables

- **Live real-project Lab** — [rayman0106.github.io/build-cinematic-3d-decks/lab/](https://rayman0106.github.io/build-cinematic-3d-decks/lab/). The `gh-pages` deployment (production SHA `9710d910`) runs the real F1 Economics and Reaction Time models with original choreography. Public profiles are `math-type`, `math-scene` and `f1-launch`; the default is the Mean / Median dot plot, and no 3D asset is requested before a 3D lesson is selected. The F1 launch uses two cars, McLaren and Red Bull. The full-team Cadillac grid is **not** in the public deployment. Public Math motion is CC0; separately licensed classroom motion is excluded, and no classroom Mixamo track is distributed. Monza, the original full decks and the choreography are unchanged.
- **Offline mechanism playground** — [examples/playground.html](../examples/playground.html). Six small procedural studies for wireframe handoff, screen entry, two-source particles, stroke writing, chart handoff and joint chains. This is a teaching tool, not the real-project Lab, and it does not contain the case models.
- **Complete case decks** — [F1 Economics](https://github.com/Rayman0106/f1-economics-3d-deck) and [Reaction Time](https://github.com/Rayman0106/reaction-time-math-3d-deck). Full standalone project decks under their own asset terms; they are not bundled in the skill ZIP.

The [public Showcase](https://rayman0106.github.io/build-cinematic-3d-decks/) is the entry page for the 55-second technical film and the Lab. The withdrawn 25-second draft is not a current web preview. The Showcase is not an online prompt-to-deck service.

## ZIP scope

The skill ZIP contains skill instructions, source, references and the offline mechanism playground. Native classroom decks and the large real-model asset bank are **not** included.

## Public-source check

```sh
python scripts/build_site.py --check-source
```

This checks the public site source. It is not a playback or visual test.

## Verification limits

Public GET requests returned 200 for the home page and Lab, and selected runtime and asset HEAD requests returned 200. These are transport checks, not playback tests. This maintenance release does not add a new normal-speed browser or cross-device acceptance claim.

The source workflow previously failed because it called `build_site.py` without the required case input. Version 1.0.3 adds `--check-source`, which validates the public host without classroom assets or rewriting the generated site. See the latest [Actions result](https://github.com/Rayman0106/build-cinematic-3d-decks/actions/workflows/check.yml) and [build-scope explanation](ci-source-and-assets.md). Source checks, HTTP availability and visual acceptance are separate evidence.

The local case builder and optional `f1-grid` are documented in the [case Lab README](../examples/case-lab/README.md). Public deployment uses its separate approved asset bank; building a local variant does not automatically publish it. For installation and your first project, use the [Chinese quick start](START-HERE.zh-CN.md).
