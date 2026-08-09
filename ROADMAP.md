# Roadmap

> **Retired, pending migration.** These items now live in Postgres and are edited at
> `/admin/roadmap`. This file is the source `npm run seed:roadmap` reads from and the
> backup until that has run against production — then it gets deleted. Add new ideas in the
> admin, not here. See [docs/roadmap-component-plan.md](docs/roadmap-component-plan.md).

Raw ideas for this site, written down so I don't lose them. Nothing here has a date, nothing here has been validated, and not all of it will get built — some of these I'll sit with and decide I don't want. An item is a thought I had, not a promise.

Once something is actually going to happen it leaves this file and becomes a plan in `docs/`.

---

## Animations

I want to add animations to the home page widgets so the site feels more alive. Something with a wow effect.

## A cursor of my own

Replace the system arrow with something that belongs to the site — a small mark that reacts to what it's over, grows on a link, maybe leaves a short trail. I don't know how it's built yet.

## Home components

Some of the components are dull. I want to make them better. First one up: the experience
card becomes a browsable file tree of the site — [docs/tree-plan.md](docs/tree-plan.md).

## A state for every card

Some of the cards read the database, so the page can be fine while one card has nothing. Each of those wants its own skeleton while it loads and its own error state when the query fails — a card that broke should say it broke, not sit there looking empty. Right now the home page has neither.

## Posts and (or) projects as a feed

List them the way a social feed does, instead of as a list of links. One item per card, in one column, newest first. Maybe both in the same feed.

## Roadmap component

A card that reads this file and shows the items as a checklist, ticking off what's done. I don't know yet where it goes — home, about, or its own page.

## Rewrite the contributions graph

It's `react-github-calendar` today. I want to drop the library and build it from the GitHub API myself, so the squares are mine to style and animate.

## Contributions page

A page for my open source work, built after I start contributing to projects that aren't mine. An empty page would be worse than no page at all.

## Give the sidebar a job

Right now it repeats the titlebar tabs, so it's two navigations for one set of pages. I'd rather it held the things that don't belong in a page: comments, the roadmap. Something like tabs sticking out of the edge — hover one and a panel slides out with what's inside.

## Comments

Let anyone leave a comment about the site without signing in, and show them somewhere. Every new one emails me. Same open-form problem as tipfy, so it needs the same protection.

What I want is the Figma version of it: point at a card or a section, drop a pin on it, write there. The comment belongs to that thing instead of to a form at the bottom of the page, and the pins stay on screen as a trace of what people stopped on.

## tipfy

[tipfy](https://tipfy.vercel.app/) is where people recommend music to me. It needs a refactor: email me on each recommendation, move it to Supabase, and protect the form.

## Link tipfy from /log

One line in the `/log` header. Blocked on the refactor above.

## Make the easter egg do something

`showEasterEgg` in the titlebar fires a toast and that's it. Whatever it turns into, a toast isn't a reward. I don't know what the feature is yet.

## Better favicon

The current one is too simple. I want to sit down, study a bit, and make a better one.
