"use client"

import { useMemo, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@heroui/react"
import {
  CalendarDate,
  getLocalTimeZone,
  today as getToday,
} from "@internationalized/date"
import { useExpense } from "@/contexts/expense-context"

const SELECTED_CELL_CLASS = "calendar-selected-by-date"

function toISO(date: { year: number; month: number; day: number }): string {
  const m = String(date.month).padStart(2, "0")
  const d = String(date.day).padStart(2, "0")
  return `${date.year}-${m}-${d}`
}

function fromISO(iso: string): CalendarDate {
  const [y, m, d] = iso.split("-").map(Number)
  return new CalendarDate(y, m, d)
}

export function WeekCalendar() {
  const { selectedDate, setSelectedDate } = useExpense()
  const todayDate = useMemo(() => getToday(getLocalTimeZone()), [])
  const rootRef = useRef<HTMLDivElement>(null)

  const value = selectedDate ? fromISO(selectedDate) : todayDate

  // Fallback: apply selected style to the cell matching selectedDate (in case the calendar doesn’t set data-selected)
  useEffect(() => {
    const root = rootRef.current
    if (!root || !selectedDate) return
    const [, , dayStr] = selectedDate.split("-")
    const dayNum = dayStr ? parseInt(dayStr, 10) : NaN
    if (Number.isNaN(dayNum)) return
    root.querySelectorAll(`.${SELECTED_CELL_CLASS}`).forEach((el) => el.classList.remove(SELECTED_CELL_CLASS))
    const cells = root.querySelectorAll('[data-slot="cellButton"]')
    for (const cell of cells) {
      if (cell.getAttribute("data-outside-month") === "true") continue
      const text = (cell.textContent ?? "").trim()
      const cellDay = parseInt(text, 10)
      if (cellDay === dayNum) {
        cell.classList.add(SELECTED_CELL_CLASS)
        break
      }
    }
  }, [selectedDate])

  const handleChange = (date: unknown) => {
    const d = date as { year: number; month: number; day: number } | null
    if (d && typeof d.year === "number" && typeof d.month === "number" && typeof d.day === "number") {
      setSelectedDate(toISO(d))
    }
  }

  return (
    <Card className="border-border week-calendar-root">
      <CardContent ref={rootRef} className="p-4 pt-0 sm:p-6 sm:pt-0 flex justify-center overflow-x-auto">
        <Calendar
          aria-label="Calendar (visible months)"
          visibleMonths={1}
          color="primary"
          value={value}
          onChange={handleChange as (date: CalendarDate) => void}
          classNames={{
            base: "w-full min-w-0",
            content: "w-full",
            grid: "w-full",
            gridHeader: "w-full",
            gridBody: "w-full",
          }}
        />
      </CardContent>
    </Card>
  )
}
