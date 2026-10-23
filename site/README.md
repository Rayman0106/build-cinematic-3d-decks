# Cinematic 3D Showcase — local preparation

This buildless site introduces two real presentations and the reusable skill. It is **not deployed** by this change. The home page does not load WebGL, a case deck, a model or video data before the reader chooses an action. The full decks stay on GitHub Releases.

## Contents

- Home: responsive dark editorial layout, real case imagery, accessible video dialog, installation copy action, source/Release links.
- Media: a silent 25-second edit, a 9-second F1 handoff excerpt, and the archived 11.2-second character motion preview. Each has provenance and hashes.
- Lab: byte-identical copy of [the existing self-contained example](../examples/playground.html), approximately 0.93 MB. All six studies and their controls are retained.
- [Credits](sources.html): case media boundaries, font licence and project attribution links. The website does not relicense third-party models.

## Rebuild and review

From the repository root:

```sh
python scripts/build_examples.py
python scripts/build_site.py
python scripts/check_site.py
python scripts/validate_package.py
```

Images and videos are already prepared. Optional regeneration uses Pillow and FFmpeg; `scripts/prepare_site_images.py --help` and `scripts/build_promotion.py --help` list the required source paths. No source recording, case model or machine-specific path is bundled in the skill.

Open `index.html` yourself or serve this directory with a normal local static server. Browser policies vary. During this preparation, the browser tool rejected the original local Lab/case HTML; no alternate protocol, renderer or browser was used to bypass that restriction. This is not a claim that the migrated Lab or current decks passed normal-speed playback.

Before deployment, review the home page at desktop and mobile widths, play each video, and independently test all six Lab modes and their Start/play/reset/seek controls. The lab copy hash is checked, but that is not a playback test.

## GitHub Pages — manual only

The [Pages workflow](../.github/workflows/pages.yml) packages only `site/` and is triggered only through `workflow_dispatch`. No push or pull request deploys the site automatically. It has not been run, and repository Pages settings have not been changed.

After owner approval:

1. Review and merge the site branch and its prepared media.
2. In repository Settings → Pages, choose GitHub Actions as the publishing source.
3. Run **Publish reviewed showcase (manual)** on the reviewed branch. Check the Pages artifact and published URL.
4. Test that URL, all media, the Lab and case Release links. Add the verified URL to the repository homepage/README. Set an absolute `og:image` URL once the real site address is verified.

The configuration follows [GitHub's custom-workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). No hosting account, token or private project is included.
