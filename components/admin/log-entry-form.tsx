"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/app/components/entrepta/button"
import { Input } from "@/app/components/entrepta/input"
import { Switch } from "@/app/components/entrepta/switch"
import { Textarea } from "@/app/components/entrepta/textarea"
import { toast } from "@/app/components/entrepta/toast"
import { Field } from "@/components/ui/form-field"
import { slugify } from "@/lib/slug"
import { logEntryInputSchema, type LogEntry, type LogEntryInput } from "@/lib/log/validation"
import { RatingInput } from "./rating-input"
import { TypePicker } from "./type-picker"

function toDefaults(entry?: LogEntry): LogEntryInput {
  return {
    type: entry?.type ?? "film",
    title: entry?.title ?? "",
    creator: entry?.creator ?? "",
    year: entry?.year ?? null,
    rating: entry?.rating ?? null,
    favorite: entry?.favorite ?? false,
    note: entry?.note ?? "",
    posterUrl: entry?.posterUrl ?? "",
    externalUrl: entry?.externalUrl ?? "",
    loggedAt: entry?.loggedAt ?? new Date().toISOString().slice(0, 10),
    published: entry?.published ?? true,
    slug: entry?.slug ?? "",
  }
}

export function LogEntryForm({ entry }: { entry?: LogEntry }) {
  const router = useRouter()
  const editing = Boolean(entry)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<LogEntryInput>({
    resolver: zodResolver(logEntryInputSchema),
    defaultValues: toDefaults(entry),
  })

  const title = watch("title")
  const year = watch("year")
  const posterUrl = watch("posterUrl")

  async function onSubmit(values: LogEntryInput) {
    setSubmitting(true)
    try {
      const res = await fetch(editing ? `/api/v1/admin/log/${entry!.id}` : "/api/v1/admin/log", {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        toast(body?.error ?? `request failed (${res.status})`)
        return
      }

      toast(editing ? "entry updated" : "entry created")
      router.push("/admin/log")
      router.refresh()
    } catch {
      toast("network error — nothing was saved")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="type" label="type" required error={errors.type?.message}>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <TypePicker
                id="type"
                value={field.value}
                onChange={field.onChange}
                invalid={Boolean(errors.type)}
              />
            )}
          />
        </Field>

        <Field id="loggedAt" label="logged on" required error={errors.loggedAt?.message}>
          <Input
            id="loggedAt"
            type="date"
            state={errors.loggedAt ? "error" : "default"}
            aria-invalid={Boolean(errors.loggedAt)}
            aria-describedby={errors.loggedAt ? "loggedAt-error" : undefined}
            {...register("loggedAt")}
          />
        </Field>
      </div>

      <Field id="title" label="title" required error={errors.title?.message}>
        <Input
          id="title"
          state={errors.title ? "error" : "default"}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "title-error" : undefined}
          {...register("title")}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
        <Field
          id="creator"
          label="creator"
          error={errors.creator?.message}
          hint="director, author, artist, studio"
        >
          <Input id="creator" {...register("creator")} />
        </Field>

        <Field id="year" label="year" error={errors.year?.message}>
          <Input
            id="year"
            type="number"
            inputMode="numeric"
            placeholder="2024"
            state={errors.year ? "error" : "default"}
            aria-invalid={Boolean(errors.year)}
            {...register("year", { setValueAs: (v) => (v === "" ? null : Number(v)) })}
          />
        </Field>
      </div>

      <Field id="rating" label="rating" error={errors.rating?.message}>
        <Controller
          control={control}
          name="rating"
          render={({ field }) => (
            <RatingInput id="rating" value={field.value ?? null} onChange={field.onChange} />
          )}
        />
      </Field>

      <Field
        id="posterUrl"
        label="poster url"
        error={errors.posterUrl?.message}
        hint="any https image url — it falls back to the type label if it doesn't load"
      >
        <div className="flex items-start gap-3">
          {/* min-w-0 so a long URL shrinks the field instead of pushing the preview out. */}
          <Input
            id="posterUrl"
            className="min-w-0 flex-1"
            placeholder="https://image.tmdb.org/..."
            state={errors.posterUrl ? "error" : "default"}
            aria-invalid={Boolean(errors.posterUrl)}
            aria-describedby={errors.posterUrl ? "posterUrl-error" : undefined}
            {...register("posterUrl")}
          />
          <PosterPreview url={posterUrl} />
        </div>
      </Field>

      <Field id="externalUrl" label="external link" error={errors.externalUrl?.message}>
        <Input
          id="externalUrl"
          placeholder="https://letterboxd.com/..."
          state={errors.externalUrl ? "error" : "default"}
          aria-invalid={Boolean(errors.externalUrl)}
          {...register("externalUrl")}
        />
      </Field>

      <Field
        id="note"
        label="note"
        error={errors.note?.message}
        hint="optional — entries with a note get an expand on the public page"
      >
        <Textarea
          id="note"
          rows={4}
          state={errors.note ? "error" : "default"}
          aria-invalid={Boolean(errors.note)}
          {...register("note")}
        />
      </Field>

      <Field
        id="slug"
        label="slug"
        error={errors.slug?.message}
        hint={`leave empty to generate: ${slugify(title || "…", year) || "…"}`}
      >
        <Input
          id="slug"
          placeholder={slugify(title || "", year)}
          state={errors.slug ? "error" : "default"}
          aria-invalid={Boolean(errors.slug)}
          {...register("slug")}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-6">
        <Controller
          control={control}
          name="favorite"
          render={({ field }) => (
            <Switch
              id="favorite"
              label="favorite"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          )}
        />
        <Controller
          control={control}
          name="published"
          render={({ field }) => (
            <Switch
              id="published"
              label="published"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          )}
        />
      </div>

      <div
        className="flex items-center gap-3 border-t pt-5"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <Button type="submit" disabled={submitting}>
          {submitting ? "saving…" : editing ? "save changes" : "create entry"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/log")}>
          cancel
        </Button>
      </div>
    </form>
  )
}

/**
 * A broken URL is the most likely mistake with poster-by-URL, and seeing it here beats
 * finding out on the live page.
 */
function PosterPreview({ url }: { url?: string }) {
  const [failed, setFailed] = useState(false)

  // Nothing typed yet means no box. An empty 52x78 placeholder next to a 40px-tall input
  // is just a hole in the layout, and it says nothing the label hasn't already said.
  if (!url?.trim()) return null

  const valid = /^https:\/\//.test(url)

  return (
    <div
      className="relative aspect-2/3 w-13 shrink-0 overflow-hidden rounded-[5px] border"
      style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
    >
      {valid && !failed ? (
        // Plain <img>, matching the public card. next/image would need every poster host
        // in remotePatterns, and Spotify alone uses four.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={url}
          src={url}
          alt="Poster preview"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          aria-hidden
          className="absolute inset-0 grid place-items-center px-1 text-center font-mono text-[8px] leading-tight uppercase"
          style={{ color: "var(--status-error-fg)" }}
        >
          {failed ? "broken" : "bad url"}
        </span>
      )}
    </div>
  )
}
