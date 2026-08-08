# Roadmap

What's next for this site. Nothing here has a date. Some of it is blocked on things that haven't happened yet.

---

## Motion on the home page

The cards just appear. Motion v12 and `BlurFade` are already here, so the parts exist.

I want the page to assemble itself: cards on a stagger, the wristkit rings drawing instead of jumping to their final value, numbers counting up.

Rules for this:

- Animate on scroll into view, not on mount.
- Keep it under 400ms. The home page is dynamic now, so every visit replays it.
- Respect `useReducedMotion`. `components/log/log-card.tsx` already shows the pattern.
- Transform and opacity only.

## Better home components

The bento grid works but the cards are plain. The editor metaphor is the best idea on this site and the home page barely uses it.

Ideas, best first:

1. A terminal card that takes real input (`whoami`, `ls projects/`).
2. A git graph built from this repo's own commits.
3. An editor minimap that tracks scroll.
4. The career timeline redrawn as a diff.

Pick two. Four half-built cards would be worse than none.

## Contributions page

Blocked on purpose. This gets built after I contribute to open source that isn't mine.

An empty contributions page is worse than no page at all. When there's something to show, GitHub's search API can build it: `is:pr author:imnotannamaria -user:imnotannamaria`. The `/about` calendar already talks to GitHub.

## tipfy refactor

[tipfy](https://tipfy.vercel.app/) is where people recommend music to me. It still works but needs three changes:

- **Email me on each recommendation.** Right now they sit there until I check. Copy the Resend setup and the templates in `emails/`.
- **Move it to Supabase.** Same database this site uses. `lib/db/client.ts` handles the pooler detail (`prepare: false` on port 6543).
- **Protect the form.** It's a public input that sends email. Reuse the honeypot from `/api/contact` and the rate limit in `lib/api/middleware/`.

## Link tipfy from /log

Small, and blocked on the refactor above.

`/log` lists albums I finished. tipfy is where people tell me what to hear next. One line in the page header, same `$ command` voice.

## Better favicon

`app/icon.svg` is a violet square with a serif `a`. It's fine. It's also the most generic thing here.

Two real problems:

The violet is hardcoded while the site has six themes. A favicon can't follow `data-theme`, but an SVG one can respond to `prefers-color-scheme`, and this one doesn't.

It has to survive 16x16. Test it in a browser tab with fifteen tabs open, not at 512px.

Worth trying: the `◆` brand mark. It holds up small better than a serif letter.

---

## What to do first

The favicon and the motion pass need nothing else. Both change how the site feels right away.

The tipfy refactor is the real work, and it unblocks the `/log` link.

The contributions page waits.
