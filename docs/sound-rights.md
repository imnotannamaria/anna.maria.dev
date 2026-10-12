# Sound rights

What the ElevenLabs terms say about the three sound files in `public/sounds/`, and what that means for
a public repository that other people fork. **This is a reading of the published terms, not legal
advice.** Where the terms do not say, this file says they do not.

## What was read

All read on **12 October 2026**. Each page showed "Last updated: 09 October 2026", except the help
center article, which has no date.

| Document                           | Link                                                                                                |
| ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| Terms of Service (non-EEA)         | <https://elevenlabs.io/terms-of-use>                                                                |
| Prohibited Use Policy              | <https://elevenlabs.io/use-policy>                                                                  |
| Service-Specific Terms (the index) | <https://elevenlabs.io/service-specific-terms>                                                      |
| ElevenAPI Terms                    | <https://elevenlabs.io/elevenapi-terms>                                                             |
| Help center: publishing content    | <https://elevenlabs.io/docs/help-center/legal/can-i-publish-the-content-i-generate-on-the-platform> |

The sounds were made through the API (`scripts/generate-elevenlabs-sounds.ts`), so the ElevenAPI
Terms apply on top of the Terms of Service. A separate set of terms covers residents of the EEA,
Switzerland and the UK; it was not read, since the account is in Brazil.

## What the terms say

- **Who owns the sound.** Between the user and ElevenLabs, the user keeps the rights in the Output
  (Terms of Service, 4(c)). The API terms say Output made through the API is used as the main
  agreement provides (ElevenAPI Terms, 4.1).
- **Not exclusive.** Output may not be unique: another user can be given the same or a similar sound
  (Terms of Service, 10).
- **Free plan: non-commercial only.** A free account may use the service only for non-commercial
  purposes; a paid one may use it commercially (Terms of Service, 1(c); Prohibited Use Policy, 12).
- **Free plan: credit when published.** The help center says content published from a free plan has
  to carry "elevenlabs.io" or "11.ai" in its title. The Terms of Service themselves do not mention
  attribution.
- **Paid plan: the license stays.** The help center says content generated during a paid
  subscription can be used commercially, and keeps that after the subscription ends. Content
  generated outside a paid subscription, before or after, cannot be used commercially.
- **Beta features are excluded** from the commercial license even on a paid plan. The sound effects
  endpoint used here is the documented one; nothing read marks it as beta, and nothing read says it
  is not.
- **Not for training.** Output may not be used to train or improve an AI model, or be put in a
  dataset for that (Prohibited Use Policy, 12).
- **Passing it on.** Output may not be made available to third parties on more permissive terms
  than the ones that apply to the account that made it (Prohibited Use Policy, 12).
- **ElevenLabs' name.** Its name and trademarks may not be used as branding without written consent
  (Prohibited Use Policy, 12). Saying where a file came from is a statement of fact, not branding;
  the terms do not draw that line themselves.

## What the terms do not say

- Nothing about a **public repository**, **open source**, or **forks**.
- Nothing specific to **sound effects**: no rule on distributing them as files, or as a library.
- No definition of **"commercial"** that settles whether a personal portfolio counts. A portfolio
  sells nothing, and it is also how its author gets hired.

## What this means for this repository

The three files (`click`, `success`, `error`) were generated on 10 September 2026 **on a free
plan**, as the account owner confirmed on 12 October 2026. `public/sounds/manifest.json` records it.

1. **They are for non-commercial use, with a credit.** That is what a free plan gives. The credit
   is in `public/sounds/NOTICE.md` and in the README.
2. **They are not under the repository's MIT license.** MIT lets anyone use, sell and sublicense
   what it covers, and the policy forbids passing Output on under more permissive terms than the
   account's own. `LICENSE` is left as the plain MIT text, so the tools that read it still
   recognise it; the notice beside the files and the README say the sounds are outside it.
3. **A fork should generate its own sounds.** The script, the prompts and the manifest are all in
   the repository. `npm run generate:sounds -- --force` with the fork's own key replaces the three
   files with ones made under the fork's own account and plan.
4. **The files are not a dataset.** Nothing in the repository uses them for training, and the
   notice says they may not be.

## The question that is left

Whether this site is a **commercial** use. The terms do not define the word. A portfolio sells
nothing; it is also how its author is found for work. If it counts as commercial, a free plan does
not cover it, and there are three ways out, cheapest first:

- **Regenerate the three on a paid plan.** One month of the smallest paid plan, the same command,
  and the files carry a commercial license that stays after the subscription ends.
- **Replace them with sounds that belong to nobody else:** recorded, or made in code with Web
  Audio, which is how the site's piano already works.
- **Remove them.** The site works in silence; sound was always a supplement.

Other sounds were generated on 12 October 2026 while trying things out (a key press, a meow, a
blip). None is in the repository: they were removed the same day.
