import { Link } from "@react-email/components"
import { Em, Field, Fields, Letter, Message, linkStyle } from "./letter"

interface BugReportEmailProps {
  name: string
  email: string
  description: string
  page: string
  attachment: string | null
}

/** What arrives when someone reports a bug from the header. Replying answers them, if they left an email. */
export function BugReportEmail({
  name,
  email,
  description,
  page,
  attachment,
}: BugReportEmailProps) {
  return (
    <Letter
      preview={`${name} found a bug: ${description.slice(0, 90)}`}
      label="a bug was reported"
      heading={
        <>
          {name.split(" ")[0]} found a <Em>bug</Em>.
        </>
      }
      footer={
        email ? "reply to this email to answer" : "no email was left, so there is no one to answer"
      }
    >
      <Fields>
        <Field label="from">{name}</Field>
        {email ? (
          <Field label="email">
            <Link href={`mailto:${email}`} style={linkStyle}>
              {email}
            </Link>
          </Field>
        ) : null}
        {page ? <Field label="page">{page}</Field> : null}
        {attachment ? (
          <Field label="screenshot">
            <Link href={attachment} style={linkStyle}>
              open the image
            </Link>
          </Field>
        ) : null}
      </Fields>
      <Message label="what happened">{description}</Message>
    </Letter>
  )
}

BugReportEmail.PreviewProps = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  description: "On the projects page, pinning a folder does nothing on my phone.",
  page: "/projects",
  attachment: null,
} satisfies BugReportEmailProps

export default BugReportEmail
