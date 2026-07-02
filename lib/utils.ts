import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper to calculate business days excluding weekends (using UTC to be timezone-independent)
export function calculateBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0
  const curDate = new Date(startDate.getTime())
  // Normalize time to UTC midnight to avoid timezone discrepancies
  curDate.setUTCHours(0, 0, 0, 0)
  const normalizedEnd = new Date(endDate.getTime())
  normalizedEnd.setUTCHours(0, 0, 0, 0)

  while (curDate <= normalizedEnd) {
    const dayOfWeek = curDate.getUTCDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++
    }
    curDate.setUTCDate(curDate.getUTCDate() + 1)
  }
  return count
}
