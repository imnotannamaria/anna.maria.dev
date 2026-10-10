import { LockKeyIcon, PencilSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr"
import { Badge } from "@/app/components/entrepta/badge"
import { Button } from "@/app/components/entrepta/button"
import { CardComment, CardFooter } from "@/app/components/entrepta/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/entrepta/table"
import { StarRating } from "@/components/log/star-rating"
import { TYPE_LABEL } from "@/lib/log/constants"
import type { LogEntry } from "@/lib/log/validation"
import { Tile } from "../tile"
import { PageHeader } from "../page-header"
import "./admin.css"

/** The admin with the new skin. Read-only here: the real one sits behind `requireAdmin()`. */
export function Admin({ entries }: { entries: LogEntry[] | null }) {
  const lines = (entries ?? []).slice(0, 12)

  return (
    <article className="st-room st-screen">
      <PageHeader icon={<LockKeyIcon aria-hidden size={13} weight="bold" />} label="admin / log">
        The part of the site <span className="text-[var(--fg-primary)]">only I can open</span>.
      </PageHeader>
      <Tile
        label="log entries"
        icon={<LockKeyIcon />}
        note={entries ? `${entries.length} published` : "offline"}
        size="md"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-body-md font-sans text-[var(--fg-secondary)]">
            Films, series, books, albums, podcasts and games. Drafts live here too.
          </p>
          <Button size="sm" disabled>
            <PlusIcon aria-hidden size={14} weight="bold" />
            new entry
          </Button>
        </div>

        <div className="st-ad-roll">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>title</TableHead>
                <TableHead>type</TableHead>
                <TableHead>by</TableHead>
                <TableHead>year</TableHead>
                <TableHead>rating</TableHead>
                <TableHead>
                  <span className="sr-only">actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-[var(--fg-primary)]">
                    {entry.title}
                    {entry.favorite ? (
                      <span className="ml-2 text-[var(--fg-brand)]">
                        <span aria-hidden>♥</span>
                        <span className="sr-only">favourite</span>
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge color="brand">{TYPE_LABEL[entry.type]}</Badge>
                  </TableCell>
                  <TableCell>{entry.creator ?? "—"}</TableCell>
                  <TableCell>{entry.year ?? "—"}</TableCell>
                  <TableCell>
                    <StarRating rating={entry.rating} size={13} />
                  </TableCell>
                  <TableCell>
                    <span className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${entry.title}`}
                        disabled
                      >
                        <PencilSimpleIcon aria-hidden size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${entry.title}`}
                        disabled
                      >
                        <TrashIcon aria-hidden size={14} />
                      </Button>
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <CardFooter>
          <CardComment>
            {entries === null
              ? "the database did not answer"
              : `showing ${lines.length} of ${entries.length}. nothing here is wired`}
          </CardComment>
        </CardFooter>
      </Tile>
    </article>
  )
}
