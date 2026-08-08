"use client"

import Link from "next/link"
import { motion, type Variants } from "motion/react"
import {
  CaretRightIcon,
  FileTextIcon,
  FolderIcon,
  FolderOpenIcon,
  LockSimpleIcon,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import type { WorkbenchItem } from "@/lib/workbench"

type NodeProps = {
  item: WorkbenchItem
  isOpen: (path: string) => boolean
  onToggle: (path: string) => void
  listVariants: Variants
  rowVariants: Variants
}

/**
 * One row of the tree, plus its children. The caller owns the `<li>` — this
 * renders the row and the nested `<ul>` into it.
 *
 * Deliberately not `role="tree"`. A real ARIA tree owes the user arrow keys,
 * type-ahead and Home/End, and a half-built tree widget is worse for a screen
 * reader than none at all — it announces "tree, 7 items" and then the arrows do
 * nothing. This is a nested list of real buttons and links instead.
 */
export function WorkbenchNode({ item, isOpen, onToggle, listVariants, rowVariants }: NodeProps) {
  const open = item.kind === "folder" && isOpen(item.path)
  const panelId = `wb-${item.path.replace(/[^a-z0-9]+/gi, "-")}`
  const hasChildren = Boolean(item.children && item.children.length > 0)

  const count =
    item.count !== undefined ? (
      <span className="ml-auto flex-shrink-0 tabular-nums" style={{ color: "var(--fg-muted)" }}>
        {item.count}
        {item.countNoun && <span className="sr-only"> {item.countNoun}</span>}
      </span>
    ) : null

  // The filename is what's on screen; the real title is what a screen reader
  // gets, because "why-i-left-x.mdx" is a path, not a sentence.
  const label = (
    <>
      <span className="truncate">{item.name}</span>
      {item.hint && <span className="sr-only"> — {item.hint}</span>}
    </>
  )

  /** Keeps every row's text on the same left edge, folder or not. */
  const caretSlot = <span aria-hidden className="wb-caret" style={{ width: 10, height: 10 }} />

  return (
    <>
      {item.kind === "folder" && hasChildren ? (
        <button
          type="button"
          className="wb-row"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => onToggle(item.path)}
        >
          <CaretRightIcon
            aria-hidden
            size={10}
            weight="bold"
            className={cn("wb-caret", open && "wb-caret-open")}
            style={{ color: open ? "var(--fg-brand)" : "var(--fg-muted)" }}
          />
          {open ? (
            <FolderOpenIcon
              aria-hidden
              size={14}
              className="wb-glyph"
              style={{ color: "var(--fg-brand)" }}
            />
          ) : (
            <FolderIcon
              aria-hidden
              size={14}
              className="wb-glyph wb-glyph-shift"
              style={{ color: "var(--fg-brand)" }}
            />
          )}
          {label}
          {count}
        </button>
      ) : item.locked || !item.href ? (
        <span className="wb-row wb-row-locked">
          {caretSlot}
          <FileTextIcon aria-hidden size={14} className="wb-glyph" />
          {label}
          <span className="sr-only">not published yet</span>
          <LockSimpleIcon aria-hidden size={12} className="ml-auto flex-shrink-0" />
        </span>
      ) : (
        <Link href={item.href} className="wb-row" title={item.hint ?? item.name}>
          {caretSlot}
          {item.kind === "more" ? (
            <span aria-hidden className="wb-glyph" style={{ width: 14 }} />
          ) : (
            <FileTextIcon aria-hidden size={14} className="wb-glyph wb-glyph-shift" />
          )}
          {label}
          {count}
        </Link>
      )}

      {hasChildren && (
        /*
         * Children stay mounted when closed. Unmounting them would take every
         * href out of the server HTML and leave the height animation with
         * nothing to measure; `inert` is what keeps the collapsed rows out of
         * the tab order and away from a screen reader.
         */
        <motion.ul
          id={panelId}
          className="wb-children"
          initial={false}
          animate={open ? "open" : "closed"}
          variants={listVariants}
          custom={item.children!.length}
          inert={!open}
        >
          {item.children!.map((child) => (
            <motion.li key={child.path} variants={rowVariants}>
              <WorkbenchNode
                item={child}
                isOpen={isOpen}
                onToggle={onToggle}
                listVariants={listVariants}
                rowVariants={rowVariants}
              />
            </motion.li>
          ))}
        </motion.ul>
      )}
    </>
  )
}
