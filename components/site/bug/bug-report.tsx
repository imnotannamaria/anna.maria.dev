"use client"

import {
  BugBeetleIcon,
  ChatCircleDotsIcon,
  EnvelopeSimpleIcon,
  PaperclipIcon,
  PaperPlaneTiltIcon,
  TextAlignLeftIcon,
  UserIcon,
  XIcon,
} from "@phosphor-icons/react"
import { useTranslations } from "next-intl"
import { useId, useState, type FormEvent } from "react"
import { Alert } from "@/app/components/entrepta/alert"
import { Button } from "@/app/components/entrepta/button"
import { CardHeader, CardLabel } from "@/app/components/entrepta/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/app/components/entrepta/dialog"
import { Field } from "@/app/components/entrepta/field"
import { Input } from "@/app/components/entrepta/input"
import { Textarea } from "@/app/components/entrepta/textarea"
import { Cat, CatAngry, pet } from "@/components/site/abimaela/abimaela"
import { useSitePath } from "@/components/site/i18n"
import { ScreenLink } from "@/components/site/screen-link"
import { BUG_ATTACHMENT_MAX_BYTES, bugSchema } from "@/lib/bug-schema"
import "@/components/site/dialog.css"
import "./bug-report.css"

type Phase = "writing" | "sending" | "sent"
const FIELDS = ["name", "email", "description", "attachment"] as const
type Field = (typeof FIELDS)[number]
type Errors = Partial<Record<Field, string>>

/**
 * The bug report, opened from the header: Abimaela on the hunt and the note on one side, the
 * fields on the other. The dialog wears the surface of the site's cards, dashed over the
 * canvas, with the label and its icon at the head.
 *
 * It posts to /api/v1/bug, which emails it. A field the server refused goes back under that
 * field; a failure on my side and a failure of the network each get their own line, and what
 * was typed stays in the form either way.
 */
export function BugReport({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const id = useId()
  const pathname = useSitePath()
  const t = useTranslations("bug")
  const [phase, setPhase] = useState<Phase>("writing")
  const [errors, setErrors] = useState<Errors>({})
  const [problem, setProblem] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const change = (next: boolean) => {
    onOpenChange(next)
    // closed after a report went: the next one starts clean
    if (!next && phase === "sent") {
      setPhase("writing")
      setFile(null)
    }
  }

  const pick = (picked: File | null) => {
    if (picked && picked.size > BUG_ATTACHMENT_MAX_BYTES) {
      setErrors((before) => ({ ...before, attachment: t("tooBig") }))
      return setFile(null)
    }
    setErrors((before) => ({ ...before, attachment: undefined }))
    setFile(picked)
  }

  // The schema and the server say which field is wrong; the words for it come from here, so
  // they are in the page's language.
  const worded = (fields: string[]): Errors => {
    const found: Errors = {}
    for (const field of fields) {
      if (FIELDS.includes(field as Field)) found[field as Field] = t(`errors.${field as Field}`)
    }
    return found
  }

  const onSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (phase === "sending") return
    const form = new FormData(event.currentTarget)
    const parsed = bugSchema.safeParse({
      name: form.get("name"),
      email: form.get("email"),
      description: form.get("description"),
      page: pathname,
    })
    if (!parsed.success) {
      return setErrors(worded(parsed.error.issues.map((issue) => String(issue.path[0]))))
    }

    setErrors({})
    setProblem(null)
    setPhase("sending")
    form.set("page", pathname)
    if (file) form.set("attachment", file)
    else form.delete("attachment")
    try {
      const res = await fetch("/api/v1/bug", { method: "POST", body: form })
      if (res.ok) {
        pet.notify("bug")
        return setPhase("sent")
      }
      const body = (await res.json().catch(() => ({}))) as { fields?: Errors }
      // the server says which fields it refused; the words for them are the page's, in its language
      if (res.status === 400 && body.fields) setErrors(worded(Object.keys(body.fields)))
      else if (res.status === 429) setProblem(t("tooMany"))
      else setProblem(t("failed"))
    } catch {
      setProblem(t("offline"))
    }
    setPhase("writing")
  }

  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogContent className="st-dialog st-bug max-w-3xl">
        <CardHeader>
          <CardLabel icon={<BugBeetleIcon />}>{t("label")}</CardLabel>
        </CardHeader>

        {phase === "sent" ? (
          <div className="st-bug-sent" role="status">
            <Cat height={84} />
            <DialogTitle className="text-heading-lg font-serif">{t("sentTitle")}</DialogTitle>
            <DialogDescription className="text-body-md font-sans">
              {t("sentBody")}
            </DialogDescription>
            <Button variant="secondary" onClick={() => change(false)}>
              {t("back")}
            </Button>
          </div>
        ) : (
          <div className="st-bug-split">
            <div className="st-bug-cat">
              <CatAngry height={104} />
              <DialogTitle className="text-heading-lg font-serif">{t("title")}</DialogTitle>
              <DialogDescription className="text-body-md font-sans">{t("lede")}</DialogDescription>

              <p className="st-bug-note">
                <ChatCircleDotsIcon aria-hidden size={16} />
                <span className="text-mono-sm font-mono">
                  {t("elsewhere")}
                  <br />
                  {t.rich("elsewhereLink", {
                    link: (words) => (
                      <ScreenLink to="contact" className="focus-ring" onClick={() => change(false)}>
                        {words}
                      </ScreenLink>
                    ),
                  })}
                </span>
              </p>
            </div>

            <form className="flex flex-col gap-4" onSubmit={onSend} noValidate>
              <Field
                id={`${id}-name`}
                label={t("name")}
                required
                icon={<UserIcon />}
                error={errors.name}
              >
                <Input name="name" autoComplete="name" placeholder={t("namePlaceholder")} />
              </Field>
              <Field
                id={`${id}-email`}
                label={t("email")}
                icon={<EnvelopeSimpleIcon />}
                hint={t("emailHint")}
                error={errors.email}
              >
                <Input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t("emailPlaceholder")}
                />
              </Field>
              <Field
                id={`${id}-what`}
                label={t("what")}
                required
                icon={<TextAlignLeftIcon />}
                error={errors.description}
              >
                <Textarea name="description" rows={4} placeholder={t("whatPlaceholder")} />
              </Field>

              {/* the honeypot: off-screen and out of the tab order, so only a bot fills it */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="sr-only"
              />

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <label className="st-bug-attach">
                    <PaperclipIcon aria-hidden size={14} />
                    <span className="text-mono-sm truncate font-mono">
                      {file ? file.name : t("attach")}
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      onChange={(event) => pick(event.target.files?.[0] ?? null)}
                    />
                  </label>
                  {file ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("removeAttachment")}
                      onClick={() => setFile(null)}
                    >
                      <XIcon aria-hidden size={14} />
                    </Button>
                  ) : null}
                </div>
                {errors.attachment ? (
                  <p role="alert" className="text-mono-sm font-mono text-[var(--status-error-fg)]">
                    {errors.attachment}
                  </p>
                ) : null}
              </div>

              {problem ? <Alert tone="error" title={problem} /> : null}

              <Button type="submit" className="self-end" loading={phase === "sending"}>
                {t("send")}
                <PaperPlaneTiltIcon aria-hidden size={15} weight="bold" />
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
