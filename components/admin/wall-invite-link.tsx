"use client"

import { ClockCountdownIcon, LinkSimpleIcon } from "@phosphor-icons/react"
import { CardHeader, CardLabel, CardMeta } from "@/app/components/entrepta/card"
import { SecretField } from "@/app/components/entrepta/secret-field"
import { Hint } from "@/components/site/hint"
import { tileClass } from "@/components/site/tile"

/**
 * A link that exists in plain text exactly once: here, right after it was made. Only its hash
 * is stored, so leaving this screen without copying it means renewing the invite.
 */
export function WallInviteLink({ url, expires }: { url: string; expires: string }) {
  return (
    <div className={tileClass({ size: "md" })} role="status">
      <CardHeader>
        <CardLabel icon={<LinkSimpleIcon />}>invite link</CardLabel>
        <CardMeta>expires {expires}</CardMeta>
      </CardHeader>
      <SecretField value={url} name="invite link" />
      <Hint icon={<ClockCountdownIcon aria-hidden size={13} />}>
        <span>shown once · good for 3 days · one letter</span>
      </Hint>
    </div>
  )
}
