export function formatDate(date: Date): string {
  // Use local date components instead of UTC to respect user's timezone
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format date for display in tooltips (e.g., "21st June 25")
 */
export function formatDisplayDate(date: string): string {
  // Parse date string and create date in local timezone
  const [year, month, day] = date.split('-').map(Number)
  const d = new Date(year, month - 1, day) // Create date in local timezone
  
  const dayNum = d.getDate()
  const monthName = d.toLocaleDateString('en-US', { month: 'long' })
  const yearShort = d.getFullYear().toString().slice(-2)
  
  // Add ordinal suffix
  const ordinal = getOrdinalSuffix(dayNum)
  
  return `${dayNum}${ordinal} ${monthName} ${yearShort}`
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

export function getWeeksInYear(year: number, lastDataDate?: string): (Date | null)[][] {
  const weeks: (Date | null)[][] = []
  const startDate = new Date(year, 0, 1) // Use local timezone
  const endDate = new Date(year, 11, 31) // Use local timezone
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Determine the actual end date based on priority:
  // 1. Last data date if provided
  // 2. Today's date if in current year
  // 3. End of year for past years
  let actualEndDate = endDate
  if (lastDataDate) {
    // Parse the date string in local timezone
    const [y, m, d] = lastDataDate.split('-').map(Number)
    const lastDate = new Date(y, m - 1, d)
    lastDate.setHours(0, 0, 0, 0)
    actualEndDate = lastDate
  } else if (year === today.getFullYear()) {
    actualEndDate = today
  }

  // Find the first Sunday of the year or before year start
  const firstDay = new Date(startDate)
  while (firstDay.getDay() !== 0) {
    firstDay.setDate(firstDay.getDate() - 1)
  }

  let currentWeek: (Date | null)[] = []
  const currentDate = new Date(firstDay)

  // Continue until we have enough weeks to cover the data
  const weeksNeeded = Math.ceil((actualEndDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 4
  let weekCount = 0

  while (weekCount < weeksNeeded) {
    if (currentDate.getDay() === 0 && currentWeek.length > 0) {
      weeks.push([...currentWeek])
      currentWeek = []
      weekCount++
    }

    if (currentDate.getFullYear() === year && currentDate <= actualEndDate) {
      currentWeek.push(new Date(currentDate))
    } else if (currentDate.getFullYear() === year || currentWeek.length > 0) {
      currentWeek.push(null) // Empty cell for dates outside range
    }

    currentDate.setDate(currentDate.getDate() + 1)
    
    // Break if we've gone too far past the actual end date
    if (currentDate > new Date(actualEndDate.getTime() + 7 * 24 * 60 * 60 * 1000)) {
      break
    }
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  return weeks
}
