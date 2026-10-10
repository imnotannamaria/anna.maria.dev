import { redirect } from "next/navigation"

/** The lab has one thing in it: the prototype of the new site. */
export default function Lab() {
  redirect("/lab/site")
}
