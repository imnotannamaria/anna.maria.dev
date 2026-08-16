"use client"

import { useState } from "react"
import { z } from "zod"
import { motion } from "motion/react"
import { CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react"
import { Input } from "@/app/components/entrepta/input"
import { Button, buttonVariants } from "@/app/components/entrepta/button"
import { Badge, CardFoot, CardHead } from "@/components/ui/card-parts"
import { useReveal } from "@/components/ui/reveal"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"
import { contactSchema, type ContactFieldErrors } from "@/lib/contact-schema"
import { cn } from "@/lib/utils"

type FormState = "idle" | "loading" | "success" | "error"

function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-mono-xs flex items-center gap-1.5 font-mono tracking-[0.08em] uppercase"
      style={{ color: "var(--fg-muted)" }}
    >
      <span aria-hidden style={{ color: "var(--fg-brand)", fontSize: 9 }}>
        ◆
      </span>
      {children}
      {required && (
        <span aria-hidden style={{ color: "var(--fg-brand)" }}>
          *
        </span>
      )}
    </label>
  )
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <span
      id={id}
      role="alert"
      className="text-mono-sm flex items-center gap-1 font-mono"
      style={{ color: "var(--status-error-fg)" }}
    >
      <span aria-hidden style={{ opacity: 0.7 }}>
        {"// "}
      </span>
      {message}
    </span>
  )
}

/**
 * The card both states live in.
 *
 * It wraps the form rather than the page wrapping the form, because the success state
 * replaces the form entirely — nesting it inside a card owned by the page would have put a
 * card inside a card the moment someone hit send.
 *
 * `.bento-card` and `components/ui/card-parts`, not entrepta's `Card`. That component was
 * this file's alone: seventeen other files speak the first vocabulary and one spoke the
 * second, in a state that appears once and disappears. It has been deleted.
 *
 * Rendering the same component type in both branches is deliberate — React reconciles it, so
 * the entrance doesn't replay when the form turns into a receipt.
 */
function FormCard({
  meta,
  comment,
  footRight,
  children,
}: {
  meta?: React.ReactNode
  comment: string
  footRight?: React.ReactNode
  children: React.ReactNode
}) {
  const { onMouseMove, spotlight } = useSpotlight(520)
  const reveal = useReveal()

  return (
    <motion.div className="bento-card" onMouseMove={onMouseMove} {...reveal}>
      <Spotlight {...spotlight} />
      <CardHead label="send a message" meta={meta} />
      <div className="relative flex flex-col">{children}</div>
      <CardFoot comment={comment}>{footRight}</CardFoot>
    </motion.div>
  )
}

export function ContactForm({ email }: { email: string }) {
  const [state, setState] = useState<FormState>("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [errors, setErrors] = useState<ContactFieldErrors>({})

  function clearField(field: keyof ContactFieldErrors) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const form = e.currentTarget
    const values = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    }
    const website = (form.elements.namedItem("website") as HTMLInputElement).value

    // Validate on the client first for instant feedback.
    const parsed = contactSchema.safeParse(values)
    if (!parsed.success) {
      const fe = z.flattenError(parsed.error).fieldErrors
      setErrors({ name: fe.name?.[0], email: fe.email?.[0], message: fe.message?.[0] })
      setErrorMessage("")
      setState("idle")
      return
    }

    setErrors({})
    setErrorMessage("")
    setState("loading")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, website }),
      })

      if (res.ok) {
        setState("success")
        return
      }

      const json = await res.json().catch(() => ({}))
      if (json.fieldErrors) {
        setErrors({
          name: json.fieldErrors.name?.[0],
          email: json.fieldErrors.email?.[0],
          message: json.fieldErrors.message?.[0],
        })
      }
      setErrorMessage(json.error ?? "Something went wrong. Please try again.")
      setState("error")
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.")
      setState("error")
    }
  }

  if (state === "success") {
    return (
      <FormCard
        meta={<Badge variant="success-soft">delivered</Badge>}
        comment="replies within a day"
        footRight={
          <button
            type="button"
            onClick={() => {
              setErrors({})
              setErrorMessage("")
              setState("idle")
            }}
            className="focus-ring group inline-flex cursor-pointer items-center gap-2 font-mono transition-colors hover:text-[color:var(--fg-brand)]"
          >
            <span
              aria-hidden
              className="transition-transform duration-150 group-hover:-translate-x-0.5"
              style={{ color: "var(--fg-brand)" }}
            >
              ←
            </span>
            send another
          </button>
        }
      >
        {/* `role="status"`, because this state *replaces* the form: the button that was
            focused is unmounted, focus falls to <body>, and without a live region a screen
            reader gets silence where everyone else gets "Message sent." The error path has
            said `role="alert"` all along — only the good news was going unannounced.

            status rather than alert: it is polite, and nothing here needs to interrupt. */}
        <div role="status" className="flex flex-col gap-3">
          <CheckCircleIcon size={28} weight="fill" style={{ color: "var(--fg-brand)" }} />
          <p
            className="m-0"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 26,
              lineHeight: 1.2,
              color: "var(--fg-primary)",
            }}
          >
            Message <em style={{ fontStyle: "italic", color: "var(--fg-brand)" }}>sent.</em>
          </p>
          <p
            className="m-0 text-sm leading-relaxed"
            style={{ fontFamily: "var(--font-sans)", color: "var(--fg-secondary)" }}
          >
            Thanks for reaching out. It landed in my inbox and I&apos;ll get back to you within a
            day.
          </p>
        </div>
      </FormCard>
    )
  }

  const disabled = state === "loading"

  return (
    <FormCard
      meta="resend"
      comment="honeypot on the server · no redirect"
      footRight={
        <span style={{ color: "var(--fg-muted)" }}>
          replies within <span style={{ color: "var(--fg-primary)" }}>a day</span>
        </span>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Honeypot — hidden from users, catches bots */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0 }}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="name" required>
              name
            </FieldLabel>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="anna maria"
              disabled={disabled}
              state={errors.name ? "error" : "default"}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "name-error" : undefined}
              onChange={() => clearField("name")}
            />
            <FieldError id="name-error" message={errors.name} />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="email" required>
              email
            </FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@yourdomain.com"
              disabled={disabled}
              state={errors.email ? "error" : "default"}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "email-error" : undefined}
              onChange={() => clearField("email")}
            />
            <FieldError id="email-error" message={errors.email} />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <FieldLabel htmlFor="message" required>
              message
            </FieldLabel>
            <div
              className={cn(
                "rounded-[var(--radius-md)] border p-3 transition-all duration-150 ease-out",
                errors.message
                  ? "border-[var(--status-error)] focus-within:border-[var(--status-error)] focus-within:shadow-[0_0_0_3px_var(--status-error-soft)]"
                  : "border-[var(--border-strong)] focus-within:border-[var(--fg-brand)] focus-within:shadow-[0_0_0_3px_var(--bg-surface-brand)] hover:border-[var(--fg-muted)]",
                disabled && "pointer-events-none opacity-40",
              )}
              style={{ background: "var(--bg-surface)" }}
            >
              <textarea
                id="message"
                name="message"
                rows={6}
                placeholder="your message…"
                disabled={disabled}
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={errors.message ? "message-error" : undefined}
                onChange={() => clearField("message")}
                className="text-mono-md min-h-[140px] w-full resize-y border-0 bg-transparent font-mono leading-[1.6] outline-none placeholder:text-[var(--fg-muted)]"
                style={{ color: "var(--fg-primary)" }}
              />
            </div>
            <FieldError id="message-error" message={errors.message} />
          </div>
        </div>

        {state === "error" && errorMessage && (
          <div
            role="alert"
            className="text-mono-sm mt-5 flex items-start gap-2.5 rounded-[var(--radius-md)] border px-4 py-3 font-mono"
            style={{
              borderColor: "var(--status-error)",
              background: "var(--status-error-soft)",
              color: "var(--status-error-fg)",
            }}
          >
            <WarningCircleIcon size={16} weight="fill" className="mt-px shrink-0" />
            <span>
              <span aria-hidden style={{ opacity: 0.7 }}>
                {"// "}
              </span>
              {errorMessage}
            </span>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button type="submit" variant="primary" loading={disabled} className="w-full sm:w-auto">
            send message →
          </Button>
          <a
            href={`mailto:${email}`}
            className={cn(buttonVariants({ variant: "command" }), "w-full sm:w-auto")}
          >
            open in mail app
          </a>
        </div>
      </form>
    </FormCard>
  )
}
