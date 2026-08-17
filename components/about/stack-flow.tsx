"use client"

/**
 * The stack, drawn as a graph instead of eight rows of badges.
 *
 * Root → eight categories, always visible. Clicking a category opens its technologies and
 * pushes the ones below it down; clicking again closes it. Nothing is expanded on arrival,
 * because fifty-five nodes at once is a wall, not a diagram.
 *
 * Layout is computed here rather than by an auto-layout library. The shape is a two-level
 * tree with a known node size, so the positions are arithmetic — a dagre/elk dependency
 * would be a second graph library to keep in step for a `y +=` loop.
 *
 * `base.css`, not `style.css`: the second one ships React Flow's own light theme, which
 * would have to be undone token by token. The base sheet is only what the pane needs to
 * position itself.
 *
 * This renders on the client, so it is `hidden md:block` and the badge list beside it is
 * `md:hidden`. That is not a fallback bolted on — it is the accessible and crawlable copy
 * of the same data, it is what a 375px screen gets (a pan-and-zoom canvas at that width is
 * a worse list), and exactly one of the two is in the accessibility tree at any width.
 */

import { useCallback, useMemo, useState } from "react"
import {
  Background,
  BackgroundVariant,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react"
import "@xyflow/react/dist/base.css"
import { STACK_GROUPS, STACK_TOTAL, TECH_ICONS } from "@/lib/stack"
import { Diamond } from "@/components/ui/diamond"

// ─── Geometry ────────────────────────────────────────────────────────────────

const ROOT_W = 128
const ROOT_H = 40
const CAT_W = 188
const CAT_H = 40
const TECH_W = 170
const TECH_H = 32

const ROOT_X = 0
const CAT_X = 236
const TECH_X = 500

const CAT_GAP = 16
const TECH_GAP = 8

// ─── Node data ───────────────────────────────────────────────────────────────

type RootData = { count: number }
type CategoryData = { label: string; count: number; open: boolean; onToggle: () => void }
type TechData = { label: string }

type RootNode = Node<RootData, "root">
type CategoryNode = Node<CategoryData, "category">
type TechNode = Node<TechData, "tech">
type StackNode = RootNode | CategoryNode | TechNode

/** Invisible, but they have to exist or the edges have nothing to attach to. */
function Port({ type, position }: { type: "source" | "target"; position: Position }) {
  return (
    <Handle
      type={type}
      position={position}
      isConnectable={false}
      style={{ opacity: 0, width: 1, height: 1, minWidth: 1, minHeight: 1, border: "none" }}
    />
  )
}

function RootNodeView({ data }: NodeProps<RootNode>) {
  return (
    <div
      className="text-mono-sm flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] border font-mono"
      style={{
        width: ROOT_W,
        height: ROOT_H,
        borderColor: "var(--border-brand-strong)",
        background: "var(--bg-surface-brand)",
        color: "var(--fg-brand-hover)",
      }}
    >
      <Diamond size={10} />
      stack
      <span style={{ opacity: 0.6 }}>{data.count}</span>
      <Port type="source" position={Position.Right} />
    </div>
  )
}

function CategoryNodeView({ data }: NodeProps<CategoryNode>) {
  return (
    <>
      <Port type="target" position={Position.Left} />
      {/* `nodrag` keeps React Flow's drag handler off the button, `nopan` keeps the pane's
          d3-zoom from starting a pan on mousedown — pressing a button should not drag the
          canvas out from under it. A real <button> with aria-expanded, rather than React
          Flow's own node focus, so the graph answers to a keyboard and announces its state. */}
      <button
        type="button"
        onClick={data.onToggle}
        aria-expanded={data.open}
        className="nodrag nopan focus-ring text-mono-sm flex w-full cursor-pointer items-center justify-between gap-2 rounded-[var(--radius-md)] border px-3 font-mono transition-colors duration-150"
        style={{
          width: CAT_W,
          height: CAT_H,
          borderColor: data.open ? "var(--fg-brand)" : "var(--border-subtle)",
          background: data.open ? "var(--bg-surface-brand)" : "var(--bg-card)",
          color: data.open ? "var(--fg-brand-hover)" : "var(--fg-primary)",
        }}
      >
        <span className="truncate">{data.label}</span>
        <span className="inline-flex shrink-0 items-center gap-1.5" style={{ opacity: 0.7 }}>
          {data.count}
          <span
            aria-hidden
            style={{
              display: "inline-block",
              transition: "transform 160ms var(--ease-out)",
              transform: data.open ? "rotate(90deg)" : undefined,
              color: "var(--fg-brand)",
            }}
          >
            ›
          </span>
        </span>
      </button>
      <Port type="source" position={Position.Right} />
    </>
  )
}

function TechNodeView({ data }: NodeProps<TechNode>) {
  const icon = TECH_ICONS[data.label]
  return (
    <div
      className="text-mono-sm flex items-center gap-2 rounded-[var(--radius-sm)] border px-2.5 font-mono"
      style={{
        width: TECH_W,
        height: TECH_H,
        borderColor: "var(--border-subtle)",
        background: "var(--bg-surface)",
        color: "var(--fg-secondary)",
      }}
    >
      <Port type="target" position={Position.Left} />
      {icon ? (
        <svg
          viewBox="0 0 24 24"
          width={11}
          height={11}
          fill="currentColor"
          aria-hidden
          style={{ color: "var(--fg-brand)", flexShrink: 0 }}
        >
          <path d={icon} />
        </svg>
      ) : (
        <Diamond style={{ flexShrink: 0 }} />
      )}
      <span className="truncate">{data.label}</span>
    </div>
  )
}

/** Defined once, at module scope. A new object each render makes React Flow rebuild every node. */
const nodeTypes = {
  root: RootNodeView,
  category: CategoryNodeView,
  tech: TechNodeView,
}

// ─── Layout ──────────────────────────────────────────────────────────────────

function buildGraph(open: ReadonlySet<string>, toggle: (key: string) => void) {
  const nodes: StackNode[] = []
  const edges: Edge[] = []

  let y = 0

  for (const group of STACK_GROUPS) {
    const isOpen = open.has(group.key)
    const techCount = isOpen ? group.items.length : 0
    const techBlock = techCount > 0 ? techCount * (TECH_H + TECH_GAP) - TECH_GAP : 0
    const blockH = Math.max(CAT_H, techBlock)

    nodes.push({
      id: `cat-${group.key}`,
      type: "category",
      position: { x: CAT_X, y: y + (blockH - CAT_H) / 2 },
      // React Flow decides a node's pointer-events for it:
      //   hasPointerEvents = isSelectable || isDraggable || onClick || onMouseEnter || …
      // This pane turns all of those off, so every node wrapper gets
      // `pointer-events: none` and the button inside never sees the click. The wrapper
      // merges `node.style` *after* its own, so this is the one that lands.
      //
      // Only the categories get it. The root and the tech nodes stay transparent to the
      // pointer, which is what keeps drag-to-pan working across the whole pane instead of
      // dying wherever a node happens to be.
      style: { pointerEvents: "all" },
      data: {
        label: group.key,
        count: group.items.length,
        open: isOpen,
        onToggle: () => toggle(group.key),
      },
    })

    edges.push({
      id: `e-root-${group.key}`,
      source: "root",
      target: `cat-${group.key}`,
      type: "smoothstep",
      style: {
        stroke: isOpen ? "var(--fg-brand)" : "var(--border-strong)",
        strokeWidth: isOpen ? 1.5 : 1,
      },
    })

    if (isOpen) {
      let techY = y
      for (const item of group.items) {
        nodes.push({
          id: `tech-${group.key}-${item}`,
          type: "tech",
          position: { x: TECH_X, y: techY },
          data: { label: item },
        })
        edges.push({
          id: `e-${group.key}-${item}`,
          source: `cat-${group.key}`,
          target: `tech-${group.key}-${item}`,
          type: "smoothstep",
          style: { stroke: "var(--border-strong)", strokeWidth: 1 },
        })
        techY += TECH_H + TECH_GAP
      }
    }

    y += blockH + CAT_GAP
  }

  const totalH = Math.max(y - CAT_GAP, ROOT_H)
  nodes.push({
    id: "root",
    type: "root",
    position: { x: ROOT_X, y: (totalH - ROOT_H) / 2 },
    data: { count: STACK_TOTAL },
  })

  return { nodes, edges }
}

// ─── Pane ────────────────────────────────────────────────────────────────────

export function StackFlow() {
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set<string>())

  const toggle = useCallback((key: string) => {
    setOpen((prev) => {
      const next = new Set(prev)
      if (!next.delete(key)) next.add(key)
      return next
    })
  }, [])

  const { nodes, edges } = useMemo(() => buildGraph(open, toggle), [open, toggle])

  // `fitView` is the prop, which frames the diagram once on mount and never again. There
  // used to be an effect re-fitting it on every toggle, so that an opened category couldn't
  // grow past the pane — but the cure was worse: the whole diagram zoomed out a step each
  // time you opened something, so the thing you just asked to see got smaller. The view is
  // yours now; opening a category pushes the ones below it down, and you pan to them.
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.12, maxZoom: 1 }}
      minZoom={0.4}
      maxZoom={1.4}
      nodesDraggable={false}
      nodesConnectable={false}
      // React Flow's own node focus would put fifty-five divs in the tab order in front of
      // the eight buttons that actually do something.
      nodesFocusable={false}
      edgesFocusable={false}
      elementsSelectable={false}
      // The wheel pans the page, it does not zoom the diagram. A canvas that swallows scroll
      // in the middle of an article is the fastest way to trap someone on the way past it.
      zoomOnScroll={false}
      zoomOnDoubleClick={false}
      preventScrolling={false}
      panOnDrag
      proOptions={{ hideAttribution: false }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={22}
        size={1}
        color="var(--border-subtle)"
        bgColor="transparent"
      />
    </ReactFlow>
  )
}
