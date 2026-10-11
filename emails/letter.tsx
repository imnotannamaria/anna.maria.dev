import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components"
import type { CSSProperties, ReactNode } from "react"

/**
 * The shape every email from the site shares, in the v3 brand: the mark, a small-caps label, a
 * serif heading, and a dashed, unfilled card like the ones on the site. One file, so the two
 * emails cannot drift apart again: they used to carry a copy each of the same forty styles.
 *
 * Hex colours, because no mail client resolves a custom property: these mirror the dark tokens
 * in app/entrepta.css. Web fonts do not load in most clients either, so each stack ends in one
 * that is there.
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://annamaria.app"

const MONO = "'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace"
const SERIF = "'Newsreader', Georgia, 'Times New Roman', serif"
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"

const CANVAS = "#09090b"
const INK = "#fafafa"
const SECONDARY = "#a1a1aa"
const MUTED = "#8a8a92"
const LINE = "#3f3f46"
const LINE_SOFT = "#27272a"
export const BRAND = "#7c6bff"
export const BRAND_SOFT = "#9b8eff"

export function Letter({
  preview,
  label,
  heading,
  footer,
  children,
}: {
  /** The line a mail client shows beside the subject. */
  preview: string
  /** Small caps over the heading: what kind of email this is. */
  label: string
  heading: ReactNode
  /** One line under the card: what to do with this email. */
  footer: string
  children: ReactNode
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={{ padding: "0 4px 20px" }}>
            <Row>
              <Column style={{ width: "52px", verticalAlign: "middle" }}>
                <Img
                  src={`${BASE_URL}/brand/mark.png`}
                  width="40"
                  height="40"
                  alt="Abimaela, the cat on annamaria.app"
                  style={{ display: "block", borderRadius: "10px" }}
                />
              </Column>
              <Column style={{ verticalAlign: "middle" }}>
                <Text style={smallCaps}>{label}</Text>
              </Column>
            </Row>
          </Section>

          <Section style={card}>
            <Heading style={headingStyle}>{heading}</Heading>
            {children}
          </Section>

          <Text style={footerStyle}>
            <span style={{ color: SECONDARY }}>annamaria.app</span>
            <span style={{ margin: "0 8px" }}>·</span>
            {footer}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

/** Two fields side by side. */
export function Fields({ children }: { children: ReactNode }) {
  return <Row style={{ marginBottom: "16px" }}>{children}</Row>
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Column style={{ width: "50%", paddingRight: "20px", verticalAlign: "top" }}>
      <Text style={fieldLabel}>{label}</Text>
      <Text style={fieldValue}>{children}</Text>
    </Column>
  )
}

/** The text someone wrote, under a dashed rule, with its line breaks kept. */
export function Message({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <Hr style={rule} />
      <Text style={fieldLabel}>{label}</Text>
      <Text style={message}>{children}</Text>
    </>
  )
}

/** The brand word in a heading, in italic. */
export function Em({ children }: { children: ReactNode }) {
  return <span style={{ fontStyle: "italic", color: BRAND_SOFT }}>{children}</span>
}

export const linkStyle: CSSProperties = {
  fontFamily: MONO,
  fontSize: "14px",
  color: BRAND_SOFT,
  textDecoration: "underline",
}

export const buttonStyle: CSSProperties = {
  display: "inline-block",
  padding: "10px 18px",
  borderRadius: "8px",
  backgroundColor: BRAND,
  // on-brand ink for the default theme: white fails AA on this violet, near-black passes
  color: "#09090b",
  fontFamily: MONO,
  fontSize: "14px",
  fontWeight: 600,
  textDecoration: "none",
}

const body: CSSProperties = {
  margin: 0,
  padding: "36px 12px",
  backgroundColor: CANVAS,
  fontFamily: SANS,
}

const container: CSSProperties = { maxWidth: "560px", margin: "0 auto" }

const card: CSSProperties = {
  padding: "28px",
  border: `1px dashed ${LINE}`,
  borderRadius: "14px",
}

const smallCaps: CSSProperties = {
  margin: 0,
  fontFamily: MONO,
  fontSize: "12px",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: SECONDARY,
}

const headingStyle: CSSProperties = {
  margin: "0 0 24px",
  fontFamily: SERIF,
  fontSize: "28px",
  fontWeight: 500,
  lineHeight: 1.15,
  letterSpacing: "-0.02em",
  color: INK,
}

const fieldLabel: CSSProperties = {
  margin: "0 0 4px",
  fontFamily: MONO,
  fontSize: "11px",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: MUTED,
}

const fieldValue: CSSProperties = { margin: 0, fontFamily: SANS, fontSize: "15px", color: INK }

const rule: CSSProperties = {
  margin: "8px 0 20px",
  border: "none",
  borderTop: `1px dashed ${LINE_SOFT}`,
}

const message: CSSProperties = {
  margin: 0,
  fontFamily: SANS,
  fontSize: "15px",
  lineHeight: 1.7,
  color: SECONDARY,
  whiteSpace: "pre-wrap",
}

const footerStyle: CSSProperties = {
  margin: "16px 4px 0",
  fontFamily: MONO,
  fontSize: "12px",
  color: MUTED,
}
