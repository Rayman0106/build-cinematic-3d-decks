# Public source checks and separately supplied case assets

The automatic source workflow previously called `build_site.py` without its required `--case-entry`. A fresh public clone should validate the Skill and host source without the owner's classroom decks or large model bank.

```sh
python scripts/build_site.py --check-source
```

This compiles the checked-in Lab manifest and host template in memory. It does not read the native classroom decks, rewrite `site/lab/index.html`, download models or deploy a website. Existing package, geometry, continuity and host-control checks still run. The deterministic mechanism playground is rebuilt and checked for byte changes.

To generate a real-project Lab locally, supply standalone decks and assets you are permitted to use:

```sh
python scripts/build_case_lab.py --f1-deck /owned/F1-Economics-Final.html --math-deck /owned/reaction-time/index.html --output /owned/Interactive-Lab.html
python scripts/build_site.py --case-entry /owned/Interactive-Lab.html --output /owned/Showcase-Review
```

The separate production asset bank is hosted on `gh-pages`. The checked-in `site/` review sources are not a standalone copy of it. This CI repair adds no self-hosted runner, background task, model upload or deployment. See [current entry points and verification limits](current-status.md). A green source workflow is not a browser playback test.
