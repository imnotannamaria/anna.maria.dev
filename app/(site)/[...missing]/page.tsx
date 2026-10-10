import { notFound } from "next/navigation"

/**
 * Catches every address no other route answers, so the 404 is drawn inside the frame. Without
 * it an unknown URL falls to the root not-found, which has no sidebar and no way back.
 */
export default function Missing() {
  notFound()
}
