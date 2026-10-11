import { WallInviteForm } from "@/components/admin/wall-invite-form"
import { requireAdmin } from "@/lib/auth/require-admin"

export default async function NewWallInvitePage() {
  await requireAdmin()

  return (
    <>
      <h1
        className="text-display-md mb-6 font-serif leading-none font-normal tracking-[-0.02em]"
        style={{ color: "var(--fg-primary)" }}
      >
        New invite
      </h1>
      <WallInviteForm />
    </>
  )
}
