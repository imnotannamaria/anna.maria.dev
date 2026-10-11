# Wall of love: plan

What the discovery on `/discovery/wall-of-love` settled, and what was built from it. The
discovery route is gone; this is what is left of it.

## The flow

1. **I invite.** `/admin/wall/new`: name, a company from `EMPLOYERS` (the about page's
   timeline) or "other", a note, and the language the form opens in. The response carries the
   link, shown once in a `SecretField`.
2. **They write.** `/invite/[token]`, inside the site chrome, phone first. Three steps on
   entrepta's `Stepper`. Name and company prefilled and editable; role, LinkedIn and photo
   optional; 3,000 characters at most.
3. **I'm told.** An email via Resend with the testimonial and a link to its admin page.
4. **I decide.** `/admin/wall/[id]`: the card exactly as the wall will draw it, then approve or
   reject. Approved can be taken down; rejected can be approved after all.
5. **It's up.** `/wall-of-love`, a mural.

## Decisions

| Question                   | Decision                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------ |
| How the invite form flows  | In steps (B2), on entrepta's components                                                                      |
| Wall layout                | Mural (D1): CSS columns, each card its own height                                                            |
| Card anatomy               | Not chosen in the discovery. The site's fixed card shape (E1): `◆ company`, flag as meta                     |
| Where the wall lives       | Its own page, `/wall-of-love`, unlisted until it has about three testimonials                                |
| Inside the site chrome?    | Yes, the invite page too                                                                                     |
| Message length             | 3,000 characters, LinkedIn's limit; the card clamps at about 320 with "read more"                            |
| English flag               | The US flag                                                                                                  |
| Language the form opens in | Mine to set on the invite; the person can still switch it with the flag                                      |
| Approving                  | Only in the admin. The email is a notice, because a link that publishes on open gets opened by mail scanners |
| Extra fields               | LinkedIn (optional, https, a linkedin.com host) and a photo (optional)                                       |
| Photo storage              | Vercel Blob, see below                                                                                       |

## The link

32 random bytes, base64url. Only the sha256 is stored, so a leaked table hands out no working
link, and the link is shown once. Good for 24 hours from creation or renewal and for one
submission. Renewing replaces the hash, so the old link stops working at once.

The submit is one conditional `UPDATE … WHERE token_hash = ? AND status = 'invited' AND
expires_at > now()`: two tabs racing cannot both land, and a link that expired between opening
the page and pressing send is refused there, not only by the earlier lookup.

## Photos on Vercel Blob

Why Blob: the site runs on Vercel and keeps no files of its own. A Blob store connected to the
project is one click, and Vercel sets `BLOB_READ_WRITE_TOKEN` itself. The free tier's storage
is several orders of magnitude more than a wall of 48px avatars needs.

How it is used:

- **Upload through the function, not from the browser.** The phone shrinks the photo to 512px
  and re-encodes it as JPEG (tens of kilobytes), and it travels with the form. That keeps it
  under Vercel's 4.5 MB request limit with room to spare and means there is no client upload
  token to hand out. A direct browser upload (`@vercel/blob/client`) is the move if photos
  ever need to be large.
- **Checked by bytes.** The server reads the first bytes and accepts JPEG, PNG and WebP only,
  whatever the name or the header claim, and caps the file at 1 MB.
- **Public, under a random name.** A photo sent with a testimonial that is still waiting can be
  fetched by anyone with its URL, and its URL is on no page until the testimonial is approved.
  If that ever matters more, a private store and a proxy route (the poster route is the model)
  close it.
- **Lifecycle.** Rejecting keeps the photo, so approving later still has it. Deleting the row
  deletes the file. A submit that loses the race deletes the photo it just uploaded.
- **Optional.** Without the token the form has no photo step and every card shows initials.

## Not done

- **Listing the page.** Four nav lists, the `robots` line and the sitemap; the steps are in
  CLAUDE.md under `/wall-of-love`.
- **Editing a testimonial.** Typos are fixed by asking the person to write again with a new
  invite, or by deleting. An edit form is the next thing if that gets old.
- **A language filter on the wall.** Not worth it below a dozen cards.
