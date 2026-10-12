# Abimaela

Abimaela is the cat in the corner of the site. She is Anna's real cat, drawn as a set of sprite
sheets, and she reacts to what a visitor does: she says a line and, for some things, jumps or gets
angry. This file is the map of all of it, for anyone who wants to add a reaction, write a line or
draw a new sheet.

## Where things live

| What                                 | Where                                                            |
| ------------------------------------ | ---------------------------------------------------------------- |
| What she reacts to, and how          | `components/site/abimaela/events.ts`                             |
| What she says                        | `cat.lines.<event>` in `messages/en.json` and `messages/pt.json` |
| The component, and the event channel | `components/site/abimaela/abimaela.tsx`                          |
| The sprite sheets                    | `components/site/abimaela/*.png`                                 |
| How each sheet plays                 | `components/site/abimaela/abimaela.css`                          |

A page says something happened with one line, from anywhere on the client:

```ts
import { pet } from "@/components/site/abimaela/abimaela"

pet.notify("pin")
```

## Changing what she says

Edit the lines in `messages/en.json` and `messages/pt.json`, under `cat.lines`. An event can have as
many lines as you like, numbered from `"0"`: she says them in order and starts over. No code
involved.

## Adding a reaction

1. Add the event to `EVENTS` in `events.ts`: when it happens, whether it is `direct` or `ambient`,
   and a gesture, if it has one.
2. Add its lines to both message files.
3. Call `pet.notify("<event>")` where it happens.
4. Add its row to the table below. A test fails until the table and the code agree.

## Manners

She does not talk over people.

- A **`direct`** event is an answer: a click on her, a command in the terminal, a question in the
  chat, a sent postcard. She always answers.
- An **`ambient`** event is something that happened on the page: a page opened, a project got
  pinned, the mode changed. She only comments if nobody has typed in a field in the last 1.5
  seconds. A page opening is not dropped when she cannot speak yet: its line is kept for up to 6
  seconds and comes out as soon as she can.
- **The latest line always wins.** There is no gap between lines: when a new one comes, the one
  on screen goes away at once, and so does the gesture that came with it, to make room. Clicking
  through home, about and contact in a row shows the line for the page the visitor ended up on,
  not a pile of them. Only a line she cannot say yet is kept (see above), and only the latest.
- What happens while she is out of the corner (a postcard sent with the footer on screen) is kept
  too, and she reacts when she is back, if that happens within 6 seconds.
- A line stays on screen for 3.6 seconds.
- After 45 seconds with no click and no key, she dozes off and falls asleep. Anything wakes her, and
  she wakes up with a yawn and a stretch before going back to sitting.
- She looks toward the last place the pointer was pressed.
- When the footer comes on screen (she is in the game down there), she **walks out**: gets up,
  walks off the right edge, and walks back in and sits down when the footer is gone. While she is
  out she does not speak: the line is kept for her return.
- She also does not show up on an invite or in the admin, and on a phone she hides while the
  keyboard is open.
- With `prefers-reduced-motion`, no sheet animates: the site's global reset stops every CSS
  animation, and her sprites are CSS. She keeps talking.

## Everything she reacts to

The first line of each event, in English. `gesture` is the sheet that plays along with the line:
`jump` (jumps), `angry` (angry), `confused` (tilts her head, with a
question mark) or `happy` (eyes closed and hearts).

| Event          | When                                                                 | First line                                     | Gesture    | Urgency   |
| -------------- | -------------------------------------------------------------------- | ---------------------------------------------- | ---------- | --------- |
| `day`          | the first seconds of a visit, from 6h to 18h                         | morning. or whatever this is.                  |            | `direct`  |
| `night`        | the first seconds of a visit, the rest of the day                    | it's late. I'm only awake because you are.     |            | `direct`  |
| `click`        | a click on her                                                       | mrrp.                                          | `jump`     | `direct`  |
| `clickAgain`   | a second click within 2.5 seconds                                    | again?                                         | `angry`    | `direct`  |
| `meow`         | her name hovered in the bio, or `meow` in the terminal               | ...meow.                                       |            | `direct`  |
| `front`        | switching to Front                                                   | back to the part with the pictures.            |            | `ambient` |
| `back`         | switching to Back                                                    | this is where the terminal lives.              |            | `ambient` |
| `ia`           | switching to IA                                                      | ask. I'm listening. mostly.                    |            | `ambient` |
| `sidebar`      | the sidebar collapsed                                                | more room for me.                              |            | `ambient` |
| `light`        | the mode switched to light                                           | too bright. I will allow it.                   | `jump`     | `ambient` |
| `dark`         | the mode switched to dark                                            | better. I can see in this.                     |            | `ambient` |
| `mute`         | the site muted                                                       | finally, quiet.                                |            | `ambient` |
| `unmute`       | the sound turned back on                                             | and the clicking is back.                      | `jump`     | `ambient` |
| `home`         | the home opening                                                     | this is where it starts.                       |            | `ambient` |
| `person`       | Anna as a person opening                                             | this one is about her. I am in it.             |            | `ambient` |
| `professional` | Anna as a professional opening                                       | the serious page. she works a lot.             |            | `ambient` |
| `notes`        | the notes opening                                                    | she writes things down. I sit on them.         |            | `ambient` |
| `post`         | a note opening                                                       | a long one. I will wait.                       |            | `ambient` |
| `projects`     | the projects opening                                                 | she builds things. I supervise.                |            | `ambient` |
| `project`      | a case study opening                                                 | I watched her build this one.                  |            | `ambient` |
| `wall`         | the wall of love opening                                             | people being nice about her. suspicious.       |            | `ambient` |
| `contact`      | the contact page opening                                             | write to her. she answers.                     |            | `ambient` |
| `log`          | the log opening                                                      | everything she finished. I slept through most. |            | `ambient` |
| `page`         | any other page opening                                               | new page. I checked it first.                  |            | `ambient` |
| `pin`          | a project pinned                                                     | pinned. it stays.                              |            | `ambient` |
| `copy`         | a contact or an app copied from a dock                               | copied. use it well.                           |            | `ambient` |
| `sticker`      | a sticker dropped after a drag                                       | that is not where it goes.                     |            | `ambient` |
| `react`        | a reaction left on a letter                                          | I saw that. nice.                              | `happy`    | `ambient` |
| `sent`         | the postcard sent                                                    | off it goes.                                   | `happy`    | `direct`  |
| `mailFailed`   | the postcard coming back                                             | it came back. not my fault.                    | `confused` | `direct`  |
| `bug`          | a bug report sent                                                    | a bug. I will find it.                         | `jump`     | `direct`  |
| `secret`       | the hidden file read in the terminal                                 | you weren't supposed to find that.             |            | `direct`  |
| `snake`        | `snake` in the terminal                                              | no snake yet. I would have caught it.          |            | `direct`  |
| `sudo`         | `sudo` in the terminal                                               | you are not root here. I am.                   | `angry`    | `direct`  |
| `unknown`      | a command the terminal does not know                                 | that is not a command. try help.               | `confused` | `direct`  |
| `open`         | `open` sending the visitor to a page                                 | going. keep up.                                |            | `direct`  |
| `noAnswer`     | a question the scripted chat has no answer for                       | I do not have that one.                        | `confused` | `direct`  |
| `offTopic`     | a question that is not about Anna, or an attempt on the chat's rules | no. ask about Anna.                            | `angry`    | `direct`  |
| `limit`        | the chat's daily limit reached                                       | that is enough questions for today.            |            | `direct`  |

## The sprite sheets

One PNG per animation, with the frames side by side in a single row, played with CSS `steps()`.

| Sheet               | File                    | Frames  | Frame size | How it plays                                                        |
| ------------------- | ----------------------- | ------- | ---------- | ------------------------------------------------------------------- |
| Idle                | `abimaela-idle.png`     | 24      | 224 × 235  | 4s loop                                                             |
| Walking             | `abimaela-walking.png`  | 24      | 252 × 228  | 2.6s loop                                                           |
| Stopping            | `abimaela-stopping.png` | 2       | 260 × 229  | 220ms, once, when a walk ends                                       |
| Jumping             | `abimaela-jumping.png`  | 20      | 270 × 290  | 900ms, once                                                         |
| Angry               | `abimaela-angry.png`    | 20      | 254 × 229  | 1400ms, once, holding the last frame                                |
| Dozing and sleeping | `abimaela-sleeping.png` | 20 + 24 | 245 × 235  | two rows: the top one plays once, in 2s; the bottom one loops in 5s |
| Waking              | `abimaela-waking.png`   | 20      | 257 × 230  | 1.8s, once, when something wakes her                                |
| Leaving             | `abimaela-leaving.png`  | 12      | 249 × 234  | 600ms, once, before she walks out                                   |
| Confused            | `abimaela-confused.png` | 20      | 262 × 234  | 1.6s, once                                                          |
| Happy               | `abimaela-happy.png`    | 20      | 255 × 235  | 1.8s, once                                                          |

### Where and when each one shows

The corner cat is `Abimaela` in `abimaela.tsx`, in the frame of every page. The same sheets are
also drawn elsewhere as small components (`Cat`, `CatWalking`, `CatStopping`, `CatAngry`,
`CatSleeping`), at a size that fits the place.

| Sheet               | Where                                                                                                                                                                                                                                                                  | When                                                                                                                                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Idle                | The corner cat. The footer's door game and the invite's walk (`cat-track.tsx`). The pop-up over her name in the bio. The stamp on the home and contact postcards. The invite's "sent" screen and the bug report's "sent" screen. The chat's "slow" and "long" notices. | The corner cat: whenever nothing else is playing. Elsewhere: the cat standing still, before a walk starts or after it ends, or the cat of a finished form.                                              |
| Walking             | The loading screen of a page that reads the database (`ScreenLoading`). The footer's door game and the invite's walk. The corner cat, on the way out and back.                                                                                                         | While a page loads. In the footer, when the pointer or the focus lands on a sign: she walks to it. In the invite, when the step changes: she walks to the step. When the footer comes on or off screen. |
| Stopping            | The footer's door game and the invite's walk. The corner cat, when she sits back down.                                                                                                                                                                                 | The last 220ms of a walk: she plants her feet and sits.                                                                                                                                                 |
| Leaving             | The corner cat.                                                                                                                                                                                                                                                        | The footer comes on screen: she gets up and turns right, then walks out.                                                                                                                                |
| Jumping             | The corner cat.                                                                                                                                                                                                                                                        | A click on her (`click`), and with the lines for `light`, `unmute` and `bug`.                                                                                                                           |
| Angry               | The corner cat. The 404 and the error screens. The invite's "closed" screen when the link expired, and its failure notice. The chat's `scope` and `blocked` notices. The bug report's header.                                                                          | A second click within 2.5 seconds (`clickAgain`), with the lines for `sudo` and `offTopic`. On the 404 and error screens, as long as they are shown.                                                    |
| Confused            | The corner cat.                                                                                                                                                                                                                                                        | With the lines for `mailFailed`, `unknown` and `noAnswer`.                                                                                                                                              |
| Happy               | The corner cat.                                                                                                                                                                                                                                                        | With the lines for `react` and `sent`.                                                                                                                                                                  |
| Dozing and sleeping | The corner cat. A removed page (the roadmap). The empty wall. The invite's "closed" screen when the link was already used. The chat's `budget` and `visitor` notices.                                                                                                  | The corner cat: after 45 seconds with no click and no key, she dozes (2s) and then sleeps in a loop until anything wakes her. Elsewhere: as long as the screen is shown.                                |
| Waking              | The corner cat.                                                                                                                                                                                                                                                        | The first thing that happens after she fell asleep (a line, a click, a key, a press): she yawns and stretches for 1.8s, unless the line brings a gesture of its own.                                    |

### The format of a new sheet

- One row of frames, all the same size, with a transparent background.
- **The ground line is the bottom edge of the frame.** Her feet touch it in every frame, so she does
  not go up and down when sheets swap.
- She faces **right**. The code mirrors her to face left.
- Do not leave an empty margin around her that the other sheets do not have, or she changes size
  when the sheet swaps.
- A sheet should weigh under 150 KB. Of the eleven, only the stopping one does (22 KB). The others,
  with 12 to 24 frames each, weigh from 111 KB to 219 KB; the dozing and sleeping one, with 44
  frames in two rows, weighs 350 KB. Together they come to about 2 MB. To fit the limit there
  would have to be fewer frames or smaller ones.
- **The redone sheets share one scale:** the cat is the same size in pixels in all of them, so they
  are drawn at heights proportional to the frame height (235 for idle, 228 for walking, 229 for
  stopping, 290 for jumping, 229 for angry, 235 for dozing and sleeping, 230 for waking, 234 for leaving and confused, 235 for happy).
- **In the jumping sheet, the height of the jump is set when the sheet is cut.** The generator
  draws every pose resting on the same line, the airborne ones included; the script that builds the
  sheet is what lifts each frame off the ground.
- **A cat drawn around the main one (a question mark, hearts) is part of the frame**, so it is cut
  together with her and counts toward the frame size.

## Sheets that do not exist yet

- **Looking around.** So she is not just sitting when nobody is doing anything.
- **Seasonal ones.** A sitting version for the time of year: a Santa hat in December, a witch hat at
  Halloween, a straw hat and a little bonfire for São João, a party hat for Anna's birthday.

## Ideas for later

- Following the pointer with her head.
- Bringing a "gift" now and then and leaving it on the page.
- Sitting on top of the card a visitor has been reading for a while.
- Reacting to the language switch, which she cannot do today: the page reloads.
