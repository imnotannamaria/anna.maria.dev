import "server-only"
import { randomUUID } from "node:crypto"
import { del, put } from "@vercel/blob"
import { AVATAR_MAX_BYTES } from "./constants"

/**
 * Photos live in Vercel Blob. The site keeps no files of its own and runs on Vercel, so a Blob
 * store connected to the project is one click and one environment variable,
 * `BLOB_READ_WRITE_TOKEN`, which Vercel sets when the store is connected. Without it the invite
 * form simply has no photo step, and everyone gets initials.
 *
 * The files are public, under a random name. A photo uploaded with a testimonial that is still
 * waiting for review can be fetched by anyone who has its URL, and nobody has its URL: it is
 * not on any page until the testimonial is approved. Rejecting keeps the file, so approving
 * later still has its photo; deleting the row deletes the file.
 */
export function avatarUploadsEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim())
}

type ImageKind = { type: "image/jpeg" | "image/png" | "image/webp"; ext: string }

/**
 * What the bytes are, read from their first few rather than from the name or the header the
 * client sent, both of which say whatever the client wants.
 */
export function sniffImage(bytes: Uint8Array): ImageKind | null {
  const at = (i: number) => bytes[i]
  if (at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff) return { type: "image/jpeg", ext: "jpg" }
  if (at(0) === 0x89 && at(1) === 0x50 && at(2) === 0x4e && at(3) === 0x47) {
    return { type: "image/png", ext: "png" }
  }
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to))
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return { type: "image/webp", ext: "webp" }
  return null
}

export type AvatarResult = { ok: true; url: string } | { ok: false; reason: "type" | "size" }

/** Checks the file, then stores it. Throws only when Blob itself fails. */
export async function storeAvatar(file: File): Promise<AvatarResult> {
  if (file.size > AVATAR_MAX_BYTES) return { ok: false, reason: "size" }
  const bytes = new Uint8Array(await file.arrayBuffer())
  const kind = sniffImage(bytes)
  if (!kind) return { ok: false, reason: "type" }

  const blob = await put(`wall/avatars/${randomUUID()}.${kind.ext}`, Buffer.from(bytes), {
    access: "public",
    contentType: kind.type,
    addRandomSuffix: false,
  })
  return { ok: true, url: blob.url }
}

/** Best effort: a file left behind costs a few kilobytes, a thrown error would cost the request. */
export async function removeAvatar(url: string | null): Promise<void> {
  if (!url || !avatarUploadsEnabled()) return
  try {
    await del(url)
  } catch (err) {
    console.error("[wall] could not delete avatar:", err instanceof Error ? err.message : err)
  }
}
