import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
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
      <Preview>New message from {name} via your portfolio</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Titlebar chrome */}
          <Section style={titlebar}>
            <span style={{ ...dot, backgroundColor: "#ef4444" }} />
            <span style={{ ...dot, backgroundColor: "#f59e0b" }} />
            <span style={{ ...dot, backgroundColor: "#22c55e" }} />
            <span style={tabLabel}>◆ contact.tsx</span>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={kicker}># new message</Text>
            <Heading style={heading}>
              A message via <span style={brandEm}>portfolio</span>.
            </Heading>

            <Row style={fieldRow}>
              <Column style={fieldCol}>
                <Text style={label}>{"// from"}</Text>
                <Text style={value}>{name}</Text>
              </Column>
              <Column style={fieldCol}>
                <Text style={label}>{"// email"}</Text>
                <Link href={`mailto:${email}`} style={emailLink}>
                  {email}
                </Link>
              </Column>
            </Row>

            <Hr style={divider} />

            <Text style={label}>{"// message"}</Text>
            <Text style={messageText}>{message}</Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <span style={{ color: "#7c6bff" }}>◆</span> annamaria.app
              <span style={footerSep}>·</span> reply directly to answer
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const MONO = "'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace"
const SERIF = "'Newsreader', Georgia, 'Times New Roman', serif"
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"

const body: React.CSSProperties = {
  backgroundColor: "#09090b",
  fontFamily: SANS,
  margin: 0,
  padding: "40px 0",
}

const container: React.CSSProperties = {
  backgroundColor: "#18181b",
  borderRadius: "12px",
  maxWidth: "560px",
  margin: "0 auto",
  overflow: "hidden",
  border: "1px solid #27272a",
}

const titlebar: React.CSSProperties = {
  backgroundColor: "#09090b",
  borderBottom: "1px solid #27272a",
  padding: "14px 20px",
}

const dot: React.CSSProperties = {
  display: "inline-block",
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  marginRight: "6px",
  verticalAlign: "middle",
}

const tabLabel: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: "12px",
  color: "#a1a1aa",
  marginLeft: "10px",
  verticalAlign: "middle",
}

const content: React.CSSProperties = {
  padding: "32px",
}

const kicker: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: "12px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#7c6bff",
  margin: "0 0 10px",
}

const heading: React.CSSProperties = {
  fontFamily: SERIF,
  fontSize: "28px",
  fontWeight: 400,
  letterSpacing: "-0.02em",
  color: "#fafafa",
  margin: "0 0 28px",
  lineHeight: 1.15,
}

const brandEm: React.CSSProperties = {
  fontStyle: "italic",
  color: "#7c6bff",
}

const fieldRow: React.CSSProperties = {
  marginBottom: "4px",
}

const fieldCol: React.CSSProperties = {
  paddingRight: "24px",
  verticalAlign: "top",
  width: "50%",
}

const label: React.CSSProperties = {
  fontFamily: MONO,
  color: "#71717a",
  fontSize: "11px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  margin: "0 0 6px",
}

const value: React.CSSProperties = {
  fontFamily: SANS,
  color: "#fafafa",
  fontSize: "15px",
  margin: 0,
}

const emailLink: React.CSSProperties = {
  fontFamily: MONO,
  color: "#9b8eff",
  fontSize: "14px",
  textDecoration: "underline",
}

const divider: React.CSSProperties = {
  borderColor: "#27272a",
  margin: "24px 0",
}

const messageText: React.CSSProperties = {
  fontFamily: SANS,
  color: "#a1a1aa",
  fontSize: "15px",
  lineHeight: 1.7,
  margin: 0,
  whiteSpace: "pre-wrap",
}

const footer: React.CSSProperties = {
  backgroundColor: "#131316",
  borderTop: "1px solid #27272a",
  padding: "18px 32px",
}

const footerText: React.CSSProperties = {
  fontFamily: MONO,
  color: "#71717a",
  fontSize: "12px",
  margin: 0,
}

const footerSep: React.CSSProperties = {
  color: "#3f3f46",
  margin: "0 8px",
}
