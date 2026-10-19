/**
 * The red star of a required field, for a field the site draws itself. entrepta's Field has its
 * own (the same red, see globals.css). Only visual: the control says `aria-required`.
 */
export function RequiredMark() {
  return (
    <span aria-hidden className="st-required">
      *
    </span>
  )
}
