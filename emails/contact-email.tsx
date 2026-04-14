import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components"

interface ContactEmailProps {
  name: string
  email: string
  message: string
}

export function ContactEmail({ name, email, message }: ContactEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New message from {name} via portfolio</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>am</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={heading}>New message via portfolio</Heading>

            <Row>
              <Column style={fieldCol}>
                <Text style={label}>From</Text>
                <Text style={value}>{name}</Text>
              </Column>
              <Column style={fieldCol}>
                <Text style={label}>Email</Text>
                <Text style={value}>{email}</Text>
              </Column>
            </Row>

            <Hr style={divider} />

            <Text style={label}>Message</Text>
            <Text style={messageText}>{message}</Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>anna-maria-dev.vercel.app</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const body: React.CSSProperties = {
  backgroundColor: "#f0f0f5",
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  margin: 0,
  padding: "40px 0",
}

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  maxWidth: "560px",
  margin: "0 auto",
  overflow: "hidden",
  border: "1px solid #e4e4f0",
}

const header: React.CSSProperties = {
  backgroundColor: "#0a0a0f",
  padding: "20px 32px",
}

const logo: React.CSSProperties = {
  color: "#818cf8",
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "22px",
  fontWeight: 700,
  margin: 0,
  letterSpacing: "-1px",
  lineHeight: 1,
}

const content: React.CSSProperties = {
  padding: "32px",
}

const heading: React.CSSProperties = {
  color: "#0a0a0f",
  fontSize: "20px",
  fontWeight: 600,
  margin: "0 0 28px",
  lineHeight: 1.3,
}

const fieldCol: React.CSSProperties = {
  paddingRight: "24px",
  verticalAlign: "top",
  width: "50%",
}

const label: React.CSSProperties = {
  color: "#8888aa",
  fontSize: "11px",
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  margin: "0 0 4px",
}

const value: React.CSSProperties = {
  color: "#0a0a0f",
  fontSize: "15px",
  margin: "0 0 4px",
}

const divider: React.CSSProperties = {
  borderColor: "#e4e4f0",
  margin: "24px 0",
}

const messageText: React.CSSProperties = {
  color: "#333355",
  fontSize: "15px",
  lineHeight: 1.7,
  margin: 0,
  whiteSpace: "pre-wrap",
}

const footer: React.CSSProperties = {
  backgroundColor: "#f8f8fc",
  borderTop: "1px solid #e4e4f0",
  padding: "20px 32px",
}

const footerText: React.CSSProperties = {
  color: "#8888aa",
  fontSize: "12px",
  margin: 0,
}
