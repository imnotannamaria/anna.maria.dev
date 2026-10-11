"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  EnvelopeSimpleIcon,
  HeartIcon,
  HouseLineIcon,
  InfoIcon,
  PaperPlaneTiltIcon,
  PencilLineIcon,
  SignatureIcon,
  TranslateIcon,
} from "@phosphor-icons/react"
import { Alert } from "@/app/components/entrepta/alert"
import { Avatar } from "@/app/components/entrepta/avatar"
import { Button } from "@/app/components/entrepta/button"
import { CardHeader, CardLabel, CardMeta } from "@/app/components/entrepta/card"
import { Field, FieldLabel } from "@/app/components/entrepta/field"
import { Input } from "@/app/components/entrepta/input"
import { SegmentedControl } from "@/app/components/entrepta/segmented-control"
import { Textarea } from "@/app/components/entrepta/textarea"
import { playSoundEffect } from "@/components/ui/sound-feedback"
import {
  AVATAR_EDGE,
  LANG_LABEL,
  MESSAGE_MAX,
  WALL_LANGS,
  type WallLang,
} from "@/lib/wall/constants"
import { COPY } from "@/lib/wall/copy"
import { submissionSchema, type SubmissionField } from "@/lib/wall/validation"
import { Flag } from "./flag"
import { Cat, CatAngry } from "@/components/site/abimaela/abimaela"
import { CatTrack } from "@/components/site/cat-track"
import { Hint } from "@/components/site/hint"
import { ScreenLink } from "@/components/site/screen-link"
import { tileClass } from "@/components/site/tile"
import { toLetter } from "@/components/site/wall/letters"
import { Mural } from "@/components/site/wall/mural"

/** What the server knows about the invite before anyone types: what I filled in. */
export interface InviteSeed {
  name: string
  company: string
  note: string | null
  formLang: WallLang
}

type Values = {
  lang: WallLang
  name: string
  company: string
  role: string
  linkedin: string
  message: string
}

type Phase = "form" | "sending" | "sent"

const STEP_IDS = ["lang", "message", "you"] as const

/** Which step holds a field, so a rejected submit lands where the problem is. */
const STEP_OF: Record<SubmissionField, number> = {
  lang: 0,
  message: 1,
  name: 2,
  company: 2,
  role: 2,
  linkedin: 2,
}

/**
 * The photo, shrunk to 512px on its longest side and re-encoded as JPEG before it leaves the
 * phone. A phone photo is several megabytes and is shown at 32px; this is tens of kilobytes,
 * well under the server's 1 MB cap and Vercel's 4.5 MB body limit. iOS hands a picked HEIC
 * over as JPEG already, so `createImageBitmap` can read what a phone gives it.
 */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, AVATAR_EDGE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("encode"))),
      "image/jpeg",
      0.86,
    ),
  )
}

/**
 * The invite, as the person invited sees it, on a phone first.
 *
 * Three steps, one thing per screen: the language (with my note above it), the testimonial,
 * then who signs it, with a preview of the card. The action stays under the thumb in a bar
 * stuck to the bottom of the screen. Name and company arrive filled in from the invite and
 * stay editable; role, LinkedIn and the photo are optional.
 *
 * The flag changes the whole form's language. It starts on the one I chose for the invite.
 */
export function InviteForm({
  token,
  seed,
  photoUploads,
}: {
  token: string
  seed: InviteSeed
  /** False when no Blob store is configured: the photo field is not offered at all. */
  photoUploads: boolean
}) {
  const [values, setValues] = useState<Values>({
    lang: seed.formLang,
    name: seed.name,
    company: seed.company,
    role: "",
    linkedin: "",
    message: "",
  })
  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState<Phase>("form")
  const [errors, setErrors] = useState<Partial<Record<SubmissionField | "avatar", string>>>({})
  const [notice, setNotice] = useState<string | null>(null)
  const [photo, setPhoto] = useState<{ file: File; url: string } | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const photoUrl = useRef<string | null>(null)
  const top = useRef<HTMLDivElement>(null)

  const router = useRouter()
  const copy = COPY[values.lang]
  const last = step === STEP_IDS.length - 1

  // The preview URL is a blob that outlives nothing.
  useEffect(
    () => () => {
      if (photoUrl.current) URL.revokeObjectURL(photoUrl.current)
    },
    [],
  )

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  function pickPhoto(file: File | null) {
    if (photoUrl.current) URL.revokeObjectURL(photoUrl.current)
    photoUrl.current = file ? URL.createObjectURL(file) : null
    setPhoto(file && photoUrl.current ? { file, url: photoUrl.current } : null)
    setErrors((prev) => ({ ...prev, avatar: undefined }))
  }

  /** Back to the top of the form, so a new step starts where it is read from. */
  function goTo(next: number) {
    setStep(next)
    setNotice(null)
    top.current?.scrollIntoView({ block: "start" })
  }

  function fieldErrors(fields: string[]) {
    const next: Partial<Record<SubmissionField, string>> = {}
    for (const field of fields) {
      if (field in copy.fieldErrors) {
        next[field as SubmissionField] = copy.fieldErrors[field as SubmissionField]
      }
    }
    return next
  }

  function validate(): boolean {
    const result = submissionSchema.safeParse(values)
    if (result.success) return true
    const fields = result.error.issues.map((issue) => String(issue.path[0]))
    // Only what this step and the ones before it hold: the next step's empty fields are not
    // an error yet.
    const reached = fields.filter((field) => STEP_OF[field as SubmissionField] <= step)
    if (reached.length === 0) return true
    setErrors(fieldErrors(reached))
    const first = Math.min(...reached.map((field) => STEP_OF[field as SubmissionField]))
    if (first !== step) goTo(first)
    return false
  }

  async function send() {
    setPhase("sending")
    setNotice(null)

    const body = new FormData()
    for (const [key, value] of Object.entries(values)) body.set(key, value)
    body.set("website", (document.getElementById("invite-website") as HTMLInputElement).value)

    if (photo) {
      try {
        body.set("avatar", await shrink(photo.file), "avatar.jpg")
      } catch {
        setErrors((prev) => ({ ...prev, avatar: copy.errorPhoto }))
        setPhase("form")
        return
      }
    }

    try {
      const res = await fetch(`/api/v1/invite/${token}`, { method: "POST", body })
      if (res.ok) {
        setPhase("sent")
        playSoundEffect("success")
        top.current?.scrollIntoView({ block: "start" })
        return
      }

      const json = await res.json().catch(() => ({}))
      // Expired or used since the page opened: the page knows how to say that, so ask it
      // again instead of drawing the same screen in here.
      if (res.status === 410 || res.status === 409) {
        router.refresh()
        return
      }
      if (res.status === 400 && Array.isArray(json.fields)) {
        if (json.fields.includes("avatar"))
          setErrors((prev) => ({ ...prev, avatar: copy.errorPhoto }))
        const next = fieldErrors(json.fields)
        setErrors((prev) => ({ ...prev, ...next }))
        const steps = Object.keys(next).map((field) => STEP_OF[field as SubmissionField])
        if (steps.length > 0) goTo(Math.min(...steps))
      } else {
        setNotice(copy.errorServer)
      }
      setPhase("form")
      playSoundEffect("error")
    } catch {
      // A rejection came back with a status; this did not come back at all.
      setNotice(copy.errorNetwork)
      setPhase("form")
      playSoundEffect("error")
    }
  }

  function advance(event: React.FormEvent) {
    event.preventDefault()
    if (!validate()) return
    if (last) void send()
    else goTo(step + 1)
  }

  // the letter exactly as the wall will draw it
  const preview = toLetter({
    id: "preview",
    month: "",
    name: values.name,
    company: values.company,
    role: values.role.trim() || null,
    linkedinUrl: null,
    message: values.message,
    lang: values.lang,
    avatarUrl: photo?.url ?? null,
  })

  if (phase === "sent") {
    return (
      <div ref={top} role="status" lang={values.lang} className="st-iv-end scroll-mt-6">
        <Cat height={104} />
        <p className="text-display-md m-0 font-serif leading-none text-[var(--fg-primary)]">
          {copy.sentTitle}
        </p>
        <p className="text-body-md m-0 max-w-[46ch] font-sans leading-relaxed text-[var(--fg-secondary)]">
          {copy.sentBody}
        </p>
        <div className="st-iv-pinned">
          <Mural letters={[preview]} pinned={false} />
        </div>
        <Comment>{copy.review}</Comment>
        <div className="flex flex-wrap justify-center gap-2">
          <ScreenLink to="wall-of-love" className="focus-ring rounded-full">
            <Hint icon={<HeartIcon aria-hidden size={13} />}>
              <span>{copy.seeWall}</span>
            </Hint>
          </ScreenLink>
          <ScreenLink to="home" className="focus-ring rounded-full">
            <Hint icon={<HouseLineIcon aria-hidden size={13} />}>
              <span>{copy.lookAround}</span>
            </Hint>
          </ScreenLink>
        </div>
      </div>
    )
  }

  return (
    <form noValidate lang={values.lang} onSubmit={advance} className="st-iv-walk">
      <div ref={top} className="flex scroll-mt-6 flex-col gap-6 pb-6">
        <p className="text-mono-sm m-0 text-center font-mono text-[var(--fg-muted)]">
          {step + 1} {copy.stepOf} 3 · {[copy.stepLang, copy.stepMessage, copy.stepYou][step]}
        </p>
        <h1 key={step} className="st-iv-question st-enter m-0 font-serif text-[var(--fg-primary)]">
          {copy.questions[step]}
        </h1>

        {/* Honeypot: hidden from people, filled by bots, checked on the server. */}
        <input
          id="invite-website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="pointer-events-none absolute h-0 opacity-0"
        />

        {step === 0 && (
          <>
            {seed.note && (
              <div className={tileClass({ size: "sm" })}>
                <CardHeader>
                  <CardLabel icon={<EnvelopeSimpleIcon />}>{copy.noteLabel}</CardLabel>
                  <CardMeta>
                    {copy.noteFor} {seed.name.split(" ")[0].toLowerCase()}
                  </CardMeta>
                </CardHeader>
                {/* My note stays in the language I wrote it in, whatever the form switches to. */}
                <p
                  lang={seed.formLang}
                  className="text-body-md m-0 font-sans leading-relaxed whitespace-pre-line text-[var(--fg-secondary)]"
                >
                  {seed.note}
                </p>
                <span className="text-heading-md font-serif leading-none text-[var(--fg-brand-text)] italic">
                  anna
                </span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <FieldLabel id="invite-lang-label">{copy.langLegend}</FieldLabel>
              <SegmentedControl
                aria-labelledby="invite-lang-label"
                className="w-full"
                value={values.lang}
                onValueChange={(next) => set("lang", next as WallLang)}
                options={WALL_LANGS.map((lang) => ({
                  value: lang,
                  // Each language in itself, whatever the form is in: someone looking for
                  // English does not read "Inglês".
                  label: (
                    <span lang={lang} className="inline-flex items-center gap-2">
                      <Flag lang={lang} size={18} decorative />
                      {LANG_LABEL[lang]}
                    </span>
                  ),
                }))}
              />
            </div>
          </>
        )}

        {step === 1 && (
          <Field
            id="invite-message"
            label={copy.message}
            required
            error={errors.message}
            hint={
              // The hint wraps; the counter neither shrinks nor wraps.
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0">{copy.messageHint}</span>
                <Counter length={values.message.length} />
              </span>
            }
          >
            <Textarea
              rows={10}
              lang={values.lang}
              maxLength={MESSAGE_MAX}
              placeholder={copy.messagePlaceholder}
              value={values.message}
              onChange={(event) => set("message", event.target.value)}
            />
          </Field>
        )}

        {step === 2 && (
          <>
            <Field id="invite-name" label={copy.name} required error={errors.name}>
              <Input
                size="lg"
                autoComplete="name"
                value={values.name}
                onChange={(event) => set("name", event.target.value)}
              />
            </Field>
            <Field id="invite-company" label={copy.company} required error={errors.company}>
              <Input
                size="lg"
                autoComplete="organization"
                value={values.company}
                onChange={(event) => set("company", event.target.value)}
              />
            </Field>
            <Field id="invite-role" label={copy.role} error={errors.role}>
              <Input
                size="lg"
                autoComplete="organization-title"
                placeholder={copy.optional}
                value={values.role}
                onChange={(event) => set("role", event.target.value)}
              />
            </Field>
            <Field
              id="invite-linkedin"
              label={copy.linkedin}
              error={errors.linkedin}
              hint={copy.optional}
            >
              <Input
                size="lg"
                type="url"
                inputMode="url"
                autoComplete="url"
                placeholder={copy.linkedinPlaceholder}
                value={values.linkedin}
                onChange={(event) => set("linkedin", event.target.value)}
              />
            </Field>

            {photoUploads && (
              <div className="flex flex-col gap-1.5">
                <FieldLabel htmlFor="invite-photo">{copy.photo}</FieldLabel>
                <div className="flex items-center gap-3">
                  <Avatar aria-hidden name={values.name || "?"} src={photo?.url} size="lg" />
                  <div className="flex min-w-0 flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => fileInput.current?.click()}
                    >
                      {photo ? copy.photoChange : copy.photoAdd}
                    </Button>
                    {photo && (
                      <Button type="button" variant="ghost" onClick={() => pickPhoto(null)}>
                        {copy.photoRemove}
                      </Button>
                    )}
                  </div>
                </div>
                <input
                  ref={fileInput}
                  id="invite-photo"
                  type="file"
                  accept="image/*"
                  tabIndex={-1}
                  className="sr-only"
                  onChange={(event) => {
                    pickPhoto(event.target.files?.[0] ?? null)
                    // Cleared so the same photo can be picked again after removing it.
                    event.target.value = ""
                  }}
                />
                {errors.avatar ? (
                  <span
                    role="alert"
                    className="text-mono-sm font-mono text-[var(--status-error-fg)]"
                  >
                    {errors.avatar}
                  </span>
                ) : (
                  <span className="text-mono-sm font-mono text-[var(--fg-muted)]">
                    {copy.photoHint}
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <span className="text-mono-xs font-mono tracking-[0.08em] text-[var(--fg-muted)] uppercase">
                {copy.preview}
              </span>
              <Mural letters={[preview]} pinned={false} />
            </div>

            <Comment>{copy.review}</Comment>
          </>
        )}

        {notice && (
          <div className="st-iv-failed">
            <CatAngry height={72} />
            <Alert tone="error" title={notice} className="min-w-0 flex-1" />
          </div>
        )}
      </div>

      {/* Back on the left, forward on the right. On the first step there is no back, and the
          empty span keeps the one button on the right instead of letting it drift left. */}
      <div className="flex items-center justify-between gap-2">
        {step === 0 && <span aria-hidden />}
        {step > 0 && (
          <Button type="button" variant="ghost" onClick={() => goTo(step - 1)}>
            <ArrowLeftIcon aria-hidden size={14} weight="bold" />
            {copy.back}
          </Button>
        )}
        <Button type="submit" loading={phase === "sending"}>
          {(last ? copy.sendShort : copy.next).replace(" →", "")}
          {last ? (
            <PaperPlaneTiltIcon aria-hidden size={14} weight="bold" />
          ) : (
            <ArrowRightIcon aria-hidden size={14} weight="bold" />
          )}
        </Button>
      </div>

      {/* The steps, as the footer draws its pages: a sign each, and she walks to the one you
          are on. A step already done is a way back; the ones ahead are not buttons yet. */}
      <CatTrack
        stops={[
          { id: "lang", label: copy.stepLang, Icon: TranslateIcon },
          { id: "message", label: copy.stepMessage, Icon: PencilLineIcon },
          { id: "you", label: copy.stepYou, Icon: SignatureIcon },
        ]}
        value={step}
        current={step}
        canPick={(index) => index < step}
        onPick={goTo}
        pickLabel={(stop) => `${copy.back}: ${stop.label}`}
      />
    </form>
  )
}

/** `0 / 3000`. Warns at 90% and turns red at the ceiling. */
function Counter({ length }: { length: number }) {
  const tone =
    length >= MESSAGE_MAX
      ? "text-[var(--status-error-fg)]"
      : length >= MESSAGE_MAX * 0.9
        ? "text-[var(--status-warning-fg)]"
        : "text-[var(--fg-muted)]"
  return (
    <span className={`shrink-0 whitespace-nowrap tabular-nums ${tone}`}>
      {length} / {MESSAGE_MAX}
    </span>
  )
}

function Comment({ children }: { children: React.ReactNode }) {
  return (
    <Hint icon={<InfoIcon aria-hidden size={13} />}>
      <span>{children}</span>
    </Hint>
  )
}
