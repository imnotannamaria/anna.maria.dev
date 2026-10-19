import { Table, TableHead, TableHeader, TableRow } from "@/app/components/entrepta/table"
import { MemoryScoreRows } from "@/components/admin/memory-score-rows"
import { requireAdmin } from "@/lib/auth/require-admin"
import { getNamedScores } from "@/lib/memory/scores"

/** The memory game's board: the names waiting, the names on it, and the ones turned away. */
export const dynamic = "force-dynamic"

const COLUMNS = ["status", "name", "time", "moves", ""]

export default async function AdminMemoryPage() {
  // the layout guards this too; both, deliberately
  await requireAdmin()
  const scores = await getNamedScores()
  const waiting = scores.filter((score) => score.status === "submitted").length
  const onBoard = scores.filter((score) => score.status === "approved").length

  return (
    <>
      <div className="mb-6">
        <h1
          className="text-display-md font-serif leading-none font-normal tracking-[-0.02em]"
          style={{ color: "var(--fg-primary)" }}
        >
          Memory
        </h1>
        <p className="text-mono-sm mt-2 font-mono" style={{ color: "var(--fg-muted)" }}>
          {waiting} to review · {onBoard} approved · the board shows the ten fastest
        </p>
      </div>

      {scores.length === 0 ? (
        <p
          className="text-mono-md mt-12 text-center font-mono"
          style={{ color: "var(--fg-muted)" }}
        >
          no names yet.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {COLUMNS.map((h) => (
                <TableHead key={h}>{h || <span className="sr-only">actions</span>}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <MemoryScoreRows rows={scores} />
        </Table>
      )}
    </>
  )
}
