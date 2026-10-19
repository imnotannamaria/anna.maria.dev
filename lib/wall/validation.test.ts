import { describe, expect, it } from "vitest"
import { inviteInputSchema, submissionSchema } from "./validation"

const valid = {
  name: "Marina Duarte",
  company: "Lumen Pay",
  role: "",
  linkedin: "",
  lang: "pt-BR",
  message: "A Anna entrou num projeto atrasado e em duas semanas tínhamos um plano.",
} as const

describe("submissionSchema", () => {
  it("accepts a testimonial with the optional fields empty", () => {
    expect(submissionSchema.safeParse(valid).success).toBe(true)
  })

  it("caps the message at LinkedIn's 3,000 characters", () => {
    expect(submissionSchema.safeParse({ ...valid, message: "a".repeat(3000) }).success).toBe(true)
    expect(submissionSchema.safeParse({ ...valid, message: "a".repeat(3001) }).success).toBe(false)
  })

  it("accepts a LinkedIn profile over https", () => {
    for (const linkedin of [
      "https://www.linkedin.com/in/someone",
      "https://linkedin.com/in/someone",
      "https://br.linkedin.com/in/someone",
    ]) {
      expect(submissionSchema.safeParse({ ...valid, linkedin }).success).toBe(true)
    }
  })

  /** The field becomes an href on the person's name. */
  it("rejects anything else in the LinkedIn field", () => {
    for (const linkedin of [
      "javascript:alert(1)",
      "http://www.linkedin.com/in/someone",
      "https://linkedin.com.evil.example/in/someone",
      "https://evil.example/?linkedin.com",
      "linkedin.com/in/someone",
    ]) {
      expect(submissionSchema.safeParse({ ...valid, linkedin }).success).toBe(false)
    }
  })

  it("only takes the two languages the wall knows", () => {
    expect(submissionSchema.safeParse({ ...valid, lang: "es" }).success).toBe(false)
  })

  it("reports a key per field, not a sentence, so the form can say it in its own language", () => {
    const result = submissionSchema.safeParse({ ...valid, name: "", message: "short" })
    expect(result.success).toBe(false)
    const messages = result.error?.issues.map((i) => i.message).sort()
    expect(messages).toEqual(["message", "name"])
  })
})

describe("inviteInputSchema", () => {
  it("needs a name and a company, and nothing else", () => {
    expect(
      inviteInputSchema.safeParse({ name: "Ana", company: "CESAR", note: "", formLang: "en" })
        .success,
    ).toBe(true)
    expect(
      inviteInputSchema.safeParse({ name: "", company: "CESAR", note: "", formLang: "en" }).success,
    ).toBe(false)
  })
})
