"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeftIcon,
  ClockCountdownIcon,
  LinkSimpleIcon,
  PlusIcon,
  XIcon,
} from "@phosphor-icons/react"
import { motion } from "motion/react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Hint } from "@/components/site/hint"
import { Button } from "@/app/components/entrepta/button"
import { buttonVariants } from "@/app/components/entrepta/button-variants"
import { Field } from "@/app/components/entrepta/field"
import { Input } from "@/app/components/entrepta/input"
import { useReveal } from "@/app/components/entrepta/reveal"
import { SegmentedControl } from "@/app/components/entrepta/segmented-control"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/app/components/entrepta/select"
import { Textarea } from "@/app/components/entrepta/textarea"
import { toast } from "@/app/components/entrepta/toast"
import { playSoundEffect } from "@/components/ui/sound-feedback"
import { Flag } from "@/components/wall/flag"
import { EMPLOYERS } from "@/lib/career"
import { LANG_LABEL, WALL_LANGS } from "@/lib/wall/constants"
import { formatInstant } from "@/lib/wall/describe"
import { inviteInputSchema, type InviteInput } from "@/lib/wall/validation"
import { WallInviteLink } from "./wall-invite-link"

const OTHER = "other"

/**
 * A new invite: who it is for, where we worked together, a note they read first, and the
 * language the form opens in.
 *
 * The company is a Select of where I have worked — `EMPLOYERS`, kept in step with the about
 * page's timeline by a test — plus "other", which opens a field for anywhere else. Whatever
 * is picked here is only the starting value: the person can correct it on their side.
 *
 * Creating does not navigate away. The link exists in plain text once, in the response, so
 * this screen is where it is copied.
 */
export function WallInviteForm() {
  const [submitting, setSubmitting] = useState(false)
  const [choice, setChoice] = useState<string>(EMPLOYERS[0].org)
  const [created, setCreated] = useState<{ url: string; expires: string } | null>(null)
  const reveal = useReveal()

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<InviteInput>({
    resolver: zodResolver(inviteInputSchema),
    defaultValues: { name: "", company: EMPLOYERS[0].name, note: "", formLang: "pt-BR" },
  })

  function pickCompany(next: string) {
    setChoice(next)
    const employer = EMPLOYERS.find((e) => e.org === next)
    setValue("company", employer ? employer.name : "", { shouldValidate: false })
  }

  async function onSubmit(values: InviteInput) {
    setSubmitting(true)
    try {
      const res = await fetch("/api/v1/admin/wall", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        toast(body?.error ?? `request failed (${res.status})`)
        playSoundEffect("error")
        return
      }
      const body = (await res.json()) as { url: string; expiresAt: string }
      setCreated({ url: body.url, expires: formatInstant(body.expiresAt) })
      toast("invite created — copy the link now")
      playSoundEffect("success")
    } catch {
      toast("network error — nothing was created")
      playSoundEffect("error")
    } finally {
      setSubmitting(false)
    }
  }

  if (created) {
    return (
      <div className="flex flex-col gap-6">
        <WallInviteLink url={created.url} expires={created.expires} />
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={() => {
              reset()
              pickCompany(EMPLOYERS[0].org)
              setCreated(null)
            }}
          >
            <PlusIcon aria-hidden size={14} weight="bold" />
            another invite
          </Button>
          <Link href="/admin/wall" className={buttonVariants({ variant: "ghost" })}>
            <ArrowLeftIcon aria-hidden size={14} weight="bold" />
            back to the list
          </Link>
        </div>
      </div>
    )
  }

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-6"
      {...reveal}
    >
      <Field id="name" label="name" required error={errors.name?.message}>
        <Input
          id="name"
          state={errors.name ? "error" : "default"}
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="company-choice" label="company" required>
          <Select id="company-choice" value={choice} onValueChange={pickCompany}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYERS.map((e) => (
                <SelectItem key={e.org} value={e.org}>
                  {e.name}
                </SelectItem>
              ))}
              <SelectSeparator />
              <SelectItem value={OTHER}>other…</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        {/* Always registered, only visible for "other": picking an employer writes its name
            here, so the payload has one company field either way. */}
        {choice === OTHER && (
          <Field id="company" label="which company" required error={errors.company?.message}>
            <Input
              id="company"
              autoFocus
              state={errors.company ? "error" : "default"}
              aria-invalid={Boolean(errors.company)}
              {...register("company")}
            />
          </Field>
        )}
      </div>

      <Field id="formLang" label="the form opens in" required>
        <Controller
          control={control}
          name="formLang"
          render={({ field }) => (
            <SegmentedControl
              aria-label="the form opens in"
              className="w-full sm:w-auto"
              value={field.value}
              onValueChange={field.onChange}
              options={WALL_LANGS.map((lang) => ({
                value: lang,
                label: (
                  <span className="inline-flex items-center gap-2">
                    <Flag lang={lang} size={16} decorative />
                    {LANG_LABEL[lang]}
                  </span>
                ),
              }))}
            />
          )}
        />
      </Field>

      <Field
        id="note"
        label="note"
        error={errors.note?.message}
        hint="what they read first, above the form. write it in the language the form opens in."
      >
        <Textarea
          id="note"
          rows={5}
          state={errors.note ? "error" : "default"}
          aria-invalid={Boolean(errors.note)}
          {...register("note")}
        />
      </Field>

      <Hint icon={<ClockCountdownIcon aria-hidden size={13} />}>
        <span>
          the link is good for 3 days and one letter. only its hash is kept, so copy it on the next
          screen
        </span>
      </Hint>

      <div className="flex items-center gap-3 border-t border-dashed border-[var(--border-strong)] pt-5">
        <Button type="submit" loading={submitting}>
          <LinkSimpleIcon aria-hidden size={14} weight="bold" />
          create invite
        </Button>
        <Link href="/admin/wall" className={buttonVariants({ variant: "ghost" })}>
          <XIcon aria-hidden size={14} weight="bold" />
          cancel
        </Link>
      </div>
    </motion.form>
  )
}
