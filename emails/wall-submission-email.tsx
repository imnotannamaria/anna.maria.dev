import { Button, Section } from "@react-email/components"
import { Em, Field, Fields, Letter, Message, buttonStyle } from "./letter"

interface WallSubmissionEmailProps {
  name: string
  company: string
  role?: string | null
  /** "Português (pt-BR)": in words, because flag emoji do not render on Windows. */
  language: string
  message: string
  /** The admin page for this testimonial. Approving happens there, behind the login. */
  reviewUrl: string
}

/**
 * A heads-up, not a control. Approving from an email was the first idea and it went: a link
 * that publishes on open can be opened by a mail scanner or a link preview, and approving
 * from a phone means being signed in to the admin there anyway. So the email says what
 * arrived and links to where the decision is made.
 *
 * The look is the shared one, in letter.tsx.
 */
export function WallSubmissionEmail({
  name,
  company,
  role,
  language,
  message,
  reviewUrl,
}: WallSubmissionEmailProps) {
  const firstName = name.split(" ")[0]

  return (
    <Letter
      preview={`${firstName} wrote for the wall: ${message.slice(0, 90)}`}
      label="a letter to review"
      heading={
        <>
          {firstName} wrote for the <Em>wall</Em>.
        </>
      }
      footer="nothing is public until you approve it in the admin"
    >
      <Fields>
        <Field label="from">{name}</Field>
        <Field label="company">{company}</Field>
      </Fields>
      <Fields>
        <Field label="role">{role || "not given"}</Field>
        <Field label="language">{language}</Field>
      </Fields>
      <Message label="letter">{message}</Message>
      <Section style={{ marginTop: "24px" }}>
        <Button href={reviewUrl} style={buttonStyle}>
          review it
        </Button>
      </Section>
    </Letter>
  )
}
