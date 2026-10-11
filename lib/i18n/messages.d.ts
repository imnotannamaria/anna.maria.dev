import type en from "../../messages/en.json"
import type { Locale } from "./locales"

/** Types every `useTranslations` call against messages/en.json: a missing key does not compile. */
declare module "next-intl" {
  interface AppConfig {
    Locale: Locale
    Messages: typeof en
  }
}
