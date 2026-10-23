# Showcase preparation — 22 October 2026

Local branch: `showcase-20261022`, based on `72ad42417730aa433a00e02097b015609e145e82`. No public push, Pages activation, repository setting change, community post or purchase was performed.

## Delivered locally

- [Showcase home](../site/index.html): English editorial layout using real project frames, two case studies, concrete skill capabilities and installation instructions.
- [Interactive Lab copy](../site/lab/index.html): byte-identical to the generated original, SHA256 `74ca841c3d47b5c7c0ce4331b6c57420d10d8eca37ed260c3ec9d2e0b0abfd3c`. The core motion was not rewritten.
- [25-second silent web edit](../site/media/showcase-25s.mp4), [F1 excerpt](../site/media/f1-handoff.mp4), and [archived character motion](../site/media/reaction-motion.mp4). Native-resolution 2400 × 1350 / 60 fps masters and the 55-second technical **draft** are delivered separately from the skill/site repository.
- [Provenance](../site/sources.html), [media manifest](../site/media/manifest.json), font licence, optional image/video preparation scripts, static site checks and a manual-only Pages workflow.
- An English capability overview was added without removing the detailed Chinese README.

## Verification

Static packaging, local routes, media hashes, MP4 faststart and the existing skill/kernel/motion/continuity checks pass. The prepared site is approximately 6.73 MB; the conservative initial-home budget is approximately 366 kB uncompressed. This budget includes markup, CSS, JavaScript, font and both hero alternatives; it is **not a measured network transfer**. A fresh home request does not load a case deck, GLB, Lab or video data. The server request log confirmed only home resources before a video was chosen.

The new Showcase home was inspected in the in-app browser at the normal desktop viewport and a 390 × 844 override (375 px content width after the scrollbar), without horizontal overflow at the mobile width. The video dialog opened and the 25-second preview reached its end. The command-copy action provides a selection fallback when clipboard permission is unavailable; that fallback was exercised. Keyboard focus returns to the invoking video button on close. Responsive screenshots are included in the local delivery evidence.

Both video masters were fully decoded: exactly 1,500 frames / 25.0 seconds and 3,300 frames / 55.0 seconds, 2400 × 1350 / 60 fps, no audio track. The archived GIF's source frames are repeated rather than interpolated. The 55-second technical draft explicitly labels its workflow/Lab sections as editorial diagrams/storyboards. It is not a completed Lab recording.

## Limits and remaining work

The original local Lab and case HTML were rejected by the browser URL policy, including a retry after explicit user authorization. They were not served through another protocol or renderer to bypass that restriction. A **separate** preview server was used only for the newly authored home/credits/media and explicitly refused Lab/case routes. The prepared website contains the original Lab so the owner can independently review it, but this update does not establish that all six modes played correctly after migration.

Before launch, independently review current Math and Lab normal-speed playback, replace the technical storyboard slots with real footage if that film is to be advertised as a technical demonstration, review the model/motion credits, then run the manual Pages workflow only after owner approval. Verify the real public URL before adding it to GitHub metadata or promotional copy. The 25-second edit honestly uses historical Math motion; it does not require pretending that the new capture exists.

The parallel F1 work includes an asset/route audit, a licensed and geometry-verified prop subset, a standalone material viewer and an independent 27-prop F1 trial HTML. That derived F1 trial remains playback-unverified, and the formal background has **not** been replaced.
