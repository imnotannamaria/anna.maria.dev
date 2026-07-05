import { z } from "zod"

export const MetricSchema = z.enum(["kcal", "exercise_minutes", "steps"])
export type Metric = z.infer<typeof MetricSchema>

const MetricValue = z.number().finite().min(0).max(1_000_000)

export const IngestPayloadSchema = z
  .object({
    steps: MetricValue,
    moveKcal: MetricValue,
    exerciseMin: MetricValue,
  })
  .strict()
export type IngestPayload = z.infer<typeof IngestPayloadSchema>
