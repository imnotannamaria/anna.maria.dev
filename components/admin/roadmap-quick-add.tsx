"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlusIcon } from "@phosphor-icons/react"
import { Button } from "@/app/components/entrepta/button"
import { Input } from "@/app/components/entrepta/input"
import { toast } from "@/app/components/entrepta/toast"

/**
 * One field, because this is what has to replace typing a line into ROADMAP.md.
 *
 * It creates a `raw` item and nothing else — no status, no blurb, no decisions. Those are
 * what the edit screen is for, later, if the idea survives. If capture costs more than the
 * file did, the file was the better tool and this whole move was a mistake.
 */
export function RoadmapQuickAdd() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed || saving) return

    setSaving(true)
    try {
      const res = await fetch("/api/v1/admin/roadmap", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: trimmed, status: "raw" }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        toast(body?.error ?? `request failed (${res.status})`)
        return
      }

      setTitle("")
      toast("captured")
      router.refresh()
    } catch {
      toast("network error — nothing was saved")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="mb-8 flex flex-col gap-2">
      <label
        htmlFor="quick-add"
        className="text-mono-xs flex items-center gap-1.5 font-mono tracking-[0.08em] uppercase"
        style={{ color: "var(--fg-muted)" }}
      >
        <span aria-hidden style={{ color: "var(--fg-brand)", fontSize: 9 }}>
          ◆
        </span>
        capture
      </label>

      <div className="flex gap-2">
        <Input
          id="quick-add"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="an idea, in as many words as it needs"
          disabled={saving}
          className="flex-1"
        />
        <Button type="submit" disabled={saving || !title.trim()}>
          <PlusIcon size={14} weight="bold" aria-hidden />
          {saving ? "saving…" : "add"}
        </Button>
      </div>

      <span className="text-mono-sm font-mono" style={{ color: "var(--fg-muted)" }}>
        <span style={{ opacity: 0.6 }}>{"// "}</span>
        lands as raw. nothing raw ever renders on the site.
      </span>
    </form>
  )
}
