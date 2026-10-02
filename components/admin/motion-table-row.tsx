"use client"

import { motion } from "motion/react"
import { TableRow } from "@/app/components/entrepta/table"

/**
 * entrepta's `TableRow` as a Motion component, for the two admin lists whose rows fade in and
 * fade out on delete. The row keeps the Table's border and hover; Motion only ever touches its
 * opacity, which is the one property a `display: table-row` animates honestly.
 */
export const MotionTableRow = motion.create(TableRow)
