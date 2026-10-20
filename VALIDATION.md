# Validation scope · 2026-10-20

This package distinguishes new mechanism examples from the two finished case-study decks.

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
