import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper to calculate business days excluding weekends
export function calculateBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0
  const curDate = new Date(startDate.getTime())
  // Normalize time to midnight to avoid hours-offset discrepancies
  curDate.setHours(0, 0, 0, 0)
  const normalizedEnd = new Date(endDate.getTime())
  normalizedEnd.setHours(0, 0, 0, 0)

  while (curDate <= normalizedEnd) {
    const dayOfWeek = curDate.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++
    }
    curDate.setDate(curDate.getDate() + 1)
  }
  return count
}
