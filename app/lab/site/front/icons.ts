import {
  ArticleIcon,
  BooksIcon,
  BriefcaseIcon,
  EnvelopeSimpleIcon,
  FolderOpenIcon,
  FolderIcon,
  HeartIcon,
  HouseLineIcon,
  LockKeyIcon,
  NotePencilIcon,
  UserIcon,
  type Icon,
} from "@phosphor-icons/react"
import { PAGES, type InnerPageId, type PageId } from "./pages"

export const ICON: Record<PageId, Icon> = {
  home: HouseLineIcon,
  person: UserIcon,
  professional: BriefcaseIcon,
  notes: NotePencilIcon,
  projects: FolderIcon,
  "wall-of-love": HeartIcon,
  contact: EnvelopeSimpleIcon,
}

export const INNER_ICON: Record<InnerPageId, Icon> = {
  log: BooksIcon,
  post: ArticleIcon,
  project: FolderOpenIcon,
  admin: LockKeyIcon,
}

export type Destination = { id: PageId; label: string; tagline: string; Icon: Icon }

export const DESTINATIONS: Destination[] = PAGES.map((page) => ({
  id: page.id,
  label: page.label,
  tagline: page.tagline,
  Icon: ICON[page.id],
}))
