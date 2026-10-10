import { Contact } from "@/components/site/contact/contact"
import { createMetadata } from "@/lib/metadata"

export const metadata = createMetadata({
  title: "Contact",
  description: "Write me a postcard, or find me where I already am.",
  path: "/contact",
})

export default function Page() {
  return <Contact />
}
