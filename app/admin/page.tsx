import { redirect } from "next/navigation"

/** /admin/log is the only thing here so far. */
export default function AdminIndexPage() {
  redirect("/admin/log")
}
