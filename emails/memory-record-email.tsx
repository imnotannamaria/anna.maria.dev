import { Button, Section } from "@react-email/components"
import { Em, Field, Fields, Letter, buttonStyle } from "./letter"

interface MemoryRecordEmailProps {
  name: string
  /** "0:42.3", the server's time. */
  time: string
  moves: number
  rank: number
  /** The admin list, where the name is approved. */
  reviewUrl: string
}

/**
 * A heads-up that a name is waiting for the memory board. Like the wall's, it links to the
 * admin instead of approving from the email: a link that publishes on open can be opened by a
 * mail scanner. The look is the shared one, in letter.tsx.
 */
export function MemoryRecordEmail({ name, time, moves, rank, reviewUrl }: MemoryRecordEmailProps) {
  return (
    <Letter
      preview={`${name} finished the memory game in ${time}: #${rank} on the board`}
      label="a name to review"
      heading={
        <>
          {name} made the <Em>board</Em>.
        </>
      }
      footer="the name is not public until you approve it in the admin"
    >
      <Fields>
        <Field label="name">{name}</Field>
        <Field label="place">#{rank}</Field>
      </Fields>
      <Fields>
        <Field label="time">{time}</Field>
        <Field label="moves">{String(moves)}</Field>
      </Fields>
      <Section style={{ marginTop: "24px" }}>
        <Button href={reviewUrl} style={buttonStyle}>
          review it
        </Button>
      </Section>
    </Letter>
  )
}
