const test = require("node:test")
const assert = require("node:assert")

function calculateBusinessDays(startDate, endDate) {
  let count = 0
  const curDate = new Date(startDate.getTime())
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

test("calculateBusinessDays - single weekday should be 1 day", () => {
  const start = new Date("2026-07-02T00:00:00Z") // Thursday
  const end = new Date("2026-07-02T00:00:00Z")
  assert.strictEqual(calculateBusinessDays(start, end), 1)
})

test("calculateBusinessDays - spanning weekend should exclude Saturday and Sunday", () => {
  const start = new Date("2026-07-03T00:00:00Z") // Friday
  const end = new Date("2026-07-06T00:00:00Z") // Monday
  assert.strictEqual(calculateBusinessDays(start, end), 2)
})

test("calculateBusinessDays - only weekend days should be 0 days", () => {
  const start = new Date("2026-07-04T00:00:00Z") // Saturday
  const end = new Date("2026-07-05T00:00:00Z") // Sunday
  assert.strictEqual(calculateBusinessDays(start, end), 0)
})

test("calculateBusinessDays - longer range spanning multiple weeks", () => {
  const start = new Date("2026-07-01T00:00:00Z") // Wednesday
  const end = new Date("2026-07-15T00:00:00Z") // Wednesday (two weeks later)
  // Wed(1), Thu(2), Fri(3) = 3
  // Sat(4), Sun(5) = 0
  // Mon(6) to Fri(10) = 5
  // Sat(11), Sun(12) = 0
  // Mon(13) to Wed(15) = 3
  // Total = 3 + 5 + 3 = 11 days
  assert.strictEqual(calculateBusinessDays(start, end), 11)
})
