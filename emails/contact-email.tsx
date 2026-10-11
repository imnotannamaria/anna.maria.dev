import { Link } from "@react-email/components"
import { Em, Field, Fields, Letter, Message, linkStyle } from "./letter"

interface ContactEmailProps {
  name: string
  email: string
  message: string
}

/** What arrives when someone posts the card on /contact. Replying answers them directly. */
export function ContactEmail({ name, email, message }: ContactEmailProps) {
  return (
    <Letter
      preview={`${name} sent you a postcard: ${message.slice(0, 90)}`}
      label="a postcard arrived"
      heading={
        <>
          {name.split(" ")[0]} wrote you a <Em>postcard</Em>.
        </>
      }
      footer="reply to this email to answer"
    >
      <Fields>
        <Field label="from">{name}</Field>
        <Field label="email">
          <Link href={`mailto:${email}`} style={linkStyle}>
            {email}
          </Link>
        </Field>
      </Fields>
      <Message label="message">{message}</Message>
    </Letter>
  )
}

ContactEmail.PreviewProps = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "Hi Anna,\n\nI read your notes on accessibility and wanted to say thank you.\n\nAda",
} satisfies ContactEmailProps

export default ContactEmail
