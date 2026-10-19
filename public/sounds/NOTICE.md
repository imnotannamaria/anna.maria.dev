# The sound files in this folder

`click.mp3`, `success.mp3` and `error.mp3` were generated with the ElevenLabs Sound Effects API
(elevenlabs.io) on 10 September 2026, on a free plan. `manifest.json` has the prompt of each.

**They are not covered by the MIT license of this repository.** The license in `LICENSE` covers the
code. These three files are ElevenLabs output, and the terms they were made under apply to them:

- **Non-commercial use only.** A free plan does not come with a commercial license.
- **Credit ElevenLabs** (elevenlabs.io) where they are published.
- **Not for training** an AI model, and not to be put in a dataset for that.
- **Not to be passed on under more permissive terms** than these.

**If you fork this repository, generate your own.** The script and the prompts are here:

```bash
ELEVENLABS_API_KEY=... ELEVENLABS_PLAN=paid npm run generate:sounds -- --force
```

That replaces the three files with ones made under your own account and plan, which is the only
license that is yours. Or delete them: the site works in silence.

What was read to write this, with the links and the date, is in `docs/sound-rights.md`. It is a
reading of the published terms, not legal advice.
