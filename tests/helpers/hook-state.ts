/** A Node-only harness for event callbacks. It retains state and refs between explicit
 * renders, without a DOM, effects, layout or any claim to test browser behaviour. */
export function hookState() {
  let cursor = 0
  const cells: unknown[] = []
  return {
    cells,
    render<T>(component: () => T): T {
      cursor = 0
      return component()
    },
    clear() {
      cursor = 0
      cells.length = 0
    },
    useState<T>(initial: T | (() => T)) {
      const index = cursor++
      if (!(index in cells))
        cells[index] = typeof initial === "function" ? (initial as () => T)() : initial
      return [
        cells[index] as T,
        (next: T | ((before: T) => T)) => {
          cells[index] =
            typeof next === "function" ? (next as (before: T) => T)(cells[index] as T) : next
        },
      ] as const
    },
    useRef<T>(initial: T) {
      const index = cursor++
      if (!(index in cells)) cells[index] = { current: initial }
      return cells[index] as { current: T }
    },
  }
}
