import * as icons from "simple-icons"
import { STACK_GROUPS, TECH_ICONS } from "@/lib/stack"

export type Tech = { name: string; path?: string; color?: string }
export type Group = { id: string; techs: Tech[] }

const pathColor = new Map<string, string>()
for (const icon of Object.values(icons)) {
  if (typeof icon === "object" && icon !== null && "path" in icon && "hex" in icon) {
    pathColor.set(icon.path, icon.hex)
  }
}

export const STACK: Group[] = STACK_GROUPS.map((group) => ({
  id: group.key,
  techs: group.items.map((name) => {
    const path = TECH_ICONS[name]
    return { name, path, color: path ? pathColor.get(path) : undefined }
  }),
}))
