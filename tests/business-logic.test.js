const test = require("node:test")
const assert = require("node:assert")

function calculateBusinessDays(startDate, endDate) {
  let count = 0
  const curDate = new Date(startDate.getTime())
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

test("calculateBusinessDays - single weekday should be 1 day", () => {
  const start = new Date("2026-07-02") // Thursday
  const end = new Date("2026-07-02")
  assert.strictEqual(calculateBusinessDays(start, end), 1)
})

test("calculateBusinessDays - spanning weekend should exclude Saturday and Sunday", () => {
  const start = new Date("2026-07-03") // Friday
  const end = new Date("2026-07-06") // Monday
  assert.strictEqual(calculateBusinessDays(start, end), 2)
})

test("calculateBusinessDays - only weekend days should be 0 days", () => {
  const start = new Date("2026-07-04") // Saturday
  const end = new Date("2026-07-05") // Sunday
  assert.strictEqual(calculateBusinessDays(start, end), 0)
})

test("calculateBusinessDays - longer range spanning multiple weeks", () => {
  const start = new Date("2026-07-01") // Wednesday
  const end = new Date("2026-07-15") // Wednesday (two weeks later)
  // Wed(1), Thu(2), Fri(3) = 3
  // Sat(4), Sun(5) = 0
  // Mon(6) to Fri(10) = 5
  // Sat(11), Sun(12) = 0
  // Mon(13) to Wed(15) = 3
  // Total = 3 + 5 + 3 = 11 days
  assert.strictEqual(calculateBusinessDays(start, end), 11)
})
