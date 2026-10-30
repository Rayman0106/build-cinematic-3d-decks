# Interactive Lab

Six procedural studies for inspecting cinematic-deck mechanisms. Open the generated [offline HTML](../playground.html), wait for preparation, then choose **进入实验室**. This is a local mechanism demonstrator, not an online AI generator or a recording of either finished presentation.

## Experiments

| Study | Change | Observe |
| --- | --- | --- |
| 3D → outline | Background-fade duration; outline offset | Subject remains opaque; wheel-anchor misregistration is explicit |
| Screen entry | Push duration; vertical FOV | Continuous approach, no camera flip; shared image and projected corners |
| Particle typography | A, B or both sources; flight curvature | Each particle keeps a visible source identity and follows its own path |
| Letter strokes | Pause between letters; pen-tip visibility | Pixels belong to letter strokes; corners finish before the final frame |
| Points → chart | Reading hold; native-line crossfade | Geometry settles first, then slowly hands off to the same native chart |
| Joint chains | Wrist linkage; movement tempo | Hand follows forearm; head follows torso; foot contacts remain fixed |

Each mode has phase-jump buttons, time scrubbing, play/pause, 0.5×/1×/1.5× speed, ±1/60-second steps, reference guides, parameter reset and an implementation note. Selecting another mode after Start plays that mode unless the system requests reduced motion. Parameter changes pause at the current scene time and recalculate state; restoring defaults also returns to the start. The time axis updates with timing controls.

Keyboard: Space toggles playback; Left/Right step one frame; Shift + Left/Right move one second. Form controls retain their normal keyboard behavior. Tabs support arrow keys and Home/End. Opening with `#particles`, `#charts` or another mode ID selects that study without bypassing the Start gate.

## Implementation

- [template.html](template.html): semantic controls and accessible navigation.
- [style.css](style.css): responsive dark workspace and light experiment canvas.
- [lab-state.mjs](lab-state.mjs): bounded parameters, deterministic timeline and pose samplers.
- [lab-content.mjs](lab-content.mjs): experiment explanations, controls and code recipes.
- [main.mjs](main.mjs): procedural scenes, compositing, Canvas illustrations, preparation and input handling.

Preparation covers fonts, the shared screen image, geometry, particle targets, glyph-arrival maps, chart paths and representative GPU passes. No network request is needed at runtime. An idle paused experiment does not continuously request animation frames; a hidden tab pauses playback. If WebGL initialization fails, the four Canvas studies remain available.

Rebuild from the repository root:

```sh
python scripts/build_examples.py
python scripts/build_site.py
node scripts/test-lab-state.mjs
node scripts/test-lab-controls.mjs
python scripts/check_site.py
python scripts/validate_package.py
```

The site Lab is generated from the same source and must match the offline example byte for byte. Three.js remains pinned to r160 with its MIT notice.

## Validation boundary

Automated checks cover bounded controls, deterministic phase sampling, stationary handoff endpoints, continuous screen velocity, projected corner registration, chart hold/crossfade and opposing arm motion. They do not establish visual polish, runtime frame rate, native-font coverage or normal-speed playback. The local browser tool previously rejected this Lab's URL; no alternate protocol, browser or renderer is used to bypass that restriction. The October 28 interaction revision still needs manual browser review.
