"use client"

import { ArrowLineDownIcon, ArrowsClockwiseIcon, CheckIcon, XIcon } from "@phosphor-icons/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/app/components/entrepta/button"
import { toast } from "@/app/components/entrepta/toast"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { playSoundEffect } from "@/components/ui/sound-feedback"
import type { WallStatus } from "@/lib/wall/constants"
import { formatInstant } from "@/lib/wall/describe"
import { WallInviteLink } from "./wall-invite-link"

/**
 * What can be done to one row, and only what makes sense for where it is:
 *
 * - waiting or expired: a new link (the old one stops working)
 * - to review: approve or reject
 * - on the wall: take it down
 * - rejected: approve after all
 *
 * Approving happens here and nowhere else — the email only says something arrived.
 */
export function WallEntryActions({
  id,
  name,
  status,
}: {
  id: string
  name: string
  status: WallStatus
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [link, setLink] = useState<{ url: string; expires: string } | null>(null)

  async function call(path: string, init: RequestInit, done: string) {
    setBusy(true)
    try {
      const res = await fetch(`/api/v1/admin/wall/${id}${path}`, init)
      if (!res.ok) {
        toast(`request failed (${res.status})`)
        playSoundEffect("error")
        return null
      }
      toast(done)
      playSoundEffect("success")
      return res
    } catch {
      toast("network error — nothing changed")
      playSoundEffect("error")
      return null
    } finally {
      setBusy(false)
    }
  }

  async function decide(next: "approved" | "rejected", done: string) {
    const res = await call(
      "",
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      },
      done,
    )
    if (res) router.refresh()
  }

  async function renew() {
    const res = await call("/renew", { method: "POST" }, "new link — copy it now")
    if (!res) return
    const body = (await res.json()) as { url: string; expiresAt: string }
    setLink({ url: body.url, expires: formatInstant(body.expiresAt) })
    router.refresh()
  }

  async function remove() {
    const res = await call("", { method: "DELETE" }, `deleted ${name}`)
    if (res) {
      router.push("/admin/wall")
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {link && <WallInviteLink url={link.url} expires={link.expires} />}

      <div
        className="flex flex-wrap items-center gap-3 border-t pt-5"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        {status === "invited" && (
          <Button type="button" variant="secondary" loading={busy} onClick={renew}>
            <ArrowsClockwiseIcon aria-hidden size={14} weight="bold" />
            new link
          </Button>
        )}
        {status === "submitted" && (
          <>
            <Button type="button" loading={busy} onClick={() => decide("approved", "on the wall")}>
              <CheckIcon aria-hidden size={14} weight="bold" />
              approve
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => decide("rejected", "rejected")}
            >
              <XIcon aria-hidden size={14} weight="bold" />
              reject
            </Button>
          </>
        )}
        {status === "approved" && (
          <Button
            type="button"
            variant="secondary"
            loading={busy}
            onClick={() => decide("rejected", "taken down")}
          >
            <ArrowLineDownIcon aria-hidden size={14} weight="bold" />
            take it down
          </Button>
        )}
        {status === "rejected" && (
          <Button type="button" loading={busy} onClick={() => decide("approved", "on the wall")}>
            <CheckIcon aria-hidden size={14} weight="bold" />
            approve after all
          </Button>
        )}

        <span className="flex-1" />
        <DeleteDialog noun="testimonial" title={name} onConfirm={remove} />
      </div>
    </div>
  )
}
