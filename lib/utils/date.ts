export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

/**
 * Format date for display in tooltips (e.g., "21st June 25")
 */
export function formatDisplayDate(date: string): string {
  const d = new Date(date)
  const day = d.getDate()
  const month = d.toLocaleDateString('en-US', { month: 'long' })
  const year = d.getFullYear().toString().slice(-2)
  
  // Add ordinal suffix
  const ordinal = getOrdinalSuffix(day)
  
  return `${day}${ordinal} ${month} ${year}`
}

function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return 'th'
  }
  switch (day % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
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
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Use today's date if it's in the current year, otherwise use the end of the year
  const actualEndDate = year === today.getFullYear() ? today : endDate

  // Find the first Sunday of the year or the year start
  const firstDay = new Date(startDate)
  while (firstDay.getDay() !== 0 && firstDay < actualEndDate) {
    firstDay.setDate(firstDay.getDate() - 1)
  }

  let currentWeek: Date[] = []
  const currentDate = new Date(firstDay)

  while (currentDate <= actualEndDate) {
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
