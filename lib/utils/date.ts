export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

export function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(formatDate(new Date(d)))
  }

  return dates
}

export function getLastYearRange(): { start: string; end: string } {
  const today = new Date()
  const oneYearAgo = new Date(today)
  oneYearAgo.setFullYear(today.getFullYear() - 1)

  return {
    start: formatDate(oneYearAgo),
    end: formatDate(today),
  }
}

export function getYearRange(year: number): { start: string; end: string } {
  return {
    start: `${year}-01-01`,
    end: `${year}-12-31`,
  }
}

export function getWeeksInYear(year: number): Date[][] {
  const weeks: Date[][] = []
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31)

  // Find the first Sunday of the year or the year start
  const firstDay = new Date(startDate)
  while (firstDay.getDay() !== 0 && firstDay < endDate) {
    firstDay.setDate(firstDay.getDate() - 1)
  }

  let currentWeek: Date[] = []
  const currentDate = new Date(firstDay)

  while (currentDate <= endDate) {
    if (currentDate.getDay() === 0 && currentWeek.length > 0) {
      weeks.push([...currentWeek])
      currentWeek = []
    }

    if (currentDate.getFullYear() === year) {
      currentWeek.push(new Date(currentDate))
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  return weeks
}
