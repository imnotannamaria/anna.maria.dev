"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/app/components/entrepta/button"
import { Input } from "@/app/components/entrepta/input"
import { Textarea } from "@/app/components/entrepta/textarea"
import { toast } from "@/app/components/entrepta/toast"
import { Field } from "@/components/ui/form-field"
import { slugify } from "@/lib/slug"
import {
  roadmapItemInputSchema,
  type RoadmapItem,
  type RoadmapItemInput,
} from "@/lib/roadmap/validation"
import { StatusPicker } from "./status-picker"

function toDefaults(item?: RoadmapItem): RoadmapItemInput {
  return {
    title: item?.title ?? "",
    blurb: item?.blurb ?? "",
    // A new item starts raw. That is the holding pen ROADMAP.md used to be, and nothing
    // reaches the site until it is promoted out of it.
    status: item?.status ?? "raw",
    position: item?.position ?? 0,
    planUrl: item?.planUrl ?? "",
    slug: item?.slug ?? "",
  }
}

export function RoadmapItemForm({ item }: { item?: RoadmapItem }) {
  const router = useRouter()
  const editing = Boolean(item)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<RoadmapItemInput>({
    resolver: zodResolver(roadmapItemInputSchema),
    defaultValues: toDefaults(item),
  })

  const title = watch("title")

  async function onSubmit(values: RoadmapItemInput) {
    setSubmitting(true)
    try {
      const res = await fetch(
        editing ? `/api/v1/admin/roadmap/${item!.id}` : "/api/v1/admin/roadmap",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(values),
        },
      )

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        toast(body?.error ?? `request failed (${res.status})`)
        return
      }

      toast(editing ? "item updated" : "item created")
      router.push("/admin/roadmap")
      router.refresh()
    } catch {
      // A rejection came back with a status; this did not come back at all. Saying so is
      // the difference between "fix your input" and "try again".
      toast("network error — nothing was saved")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Field id="title" label="title" required error={errors.title?.message}>
        <Input
          id="title"
          state={errors.title ? "error" : "default"}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "title-error" : undefined}
          {...register("title")}
        />
      </Field>

      <Field
        id="blurb"
        label="blurb"
        error={errors.blurb?.message}
        // The rule that used to live in CLAUDE.md's ROADMAP.md section. It outlived the
        // file, so it moves to where the writing now happens.
        hint="two or three sentences: what the thing is, and at most one line on why. write it down, don't evaluate it."
      >
        <Textarea
          id="blurb"
          rows={4}
          state={errors.blurb ? "error" : "default"}
          aria-invalid={Boolean(errors.blurb)}
          {...register("blurb")}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
        <Field id="status" label="status" required error={errors.status?.message}>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <StatusPicker
                id="status"
                value={field.value}
                onChange={field.onChange}
                invalid={Boolean(errors.status)}
              />
            )}
          />
        </Field>

        <Field
          id="position"
          label="position"
          error={errors.position?.message}
          hint="low sorts first"
        >
          <Controller
            control={control}
            name="position"
            render={({ field }) => (
              <Input
                id="position"
                type="number"
                min={0}
                value={field.value ?? 0}
                // valueAsNumber on register would hand zod a NaN for an empty input. The
                // schema has no z.coerce on purpose, so the parsing happens here.
                onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                state={errors.position ? "error" : "default"}
                aria-invalid={Boolean(errors.position)}
              />
            )}
          />
        </Field>
      </div>

      <Field
        id="planUrl"
        label="plan"
        error={errors.planUrl?.message}
        hint="repo path, e.g. docs/tree-plan.md — shown as text, never linked"
      >
        <Input
          id="planUrl"
          placeholder="docs/…-plan.md"
          state={errors.planUrl ? "error" : "default"}
          aria-invalid={Boolean(errors.planUrl)}
          {...register("planUrl")}
        />
      </Field>

      <Field
        id="slug"
        label="slug"
        error={errors.slug?.message}
        hint={`leave empty to generate: ${slugify(title || "…") || "…"}`}
      >
        <Input
          id="slug"
          placeholder={slugify(title || "")}
          state={errors.slug ? "error" : "default"}
          aria-invalid={Boolean(errors.slug)}
          {...register("slug")}
        />
      </Field>

      <p className="text-mono-sm m-0 font-mono" style={{ color: "var(--fg-muted)" }}>
        <span style={{ opacity: 0.6 }}>{"// "}</span>
        shipped date is set by the server when status becomes shipped, and cleared when it leaves
      </p>

      <div
        className="flex items-center gap-3 border-t pt-5"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <Button type="submit" disabled={submitting}>
          {submitting ? "saving…" : editing ? "save changes" : "create item"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/roadmap")}>
          cancel
        </Button>
      </div>
    </form>
  )
}
