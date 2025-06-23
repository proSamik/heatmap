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

export function getLast365DaysRange(): { start: string; end: string } {
  const today = new Date()
  const days365Ago = new Date(today)
  days365Ago.setDate(today.getDate() - 365)

  return {
    start: formatDate(days365Ago),
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

  // Generate weeks until we've covered all data up to the actual end date
  while (currentDate <= actualEndDate || currentWeek.length > 0) {
    if (currentDate.getDay() === 0 && currentWeek.length > 0) {
      weeks.push([...currentWeek])
      currentWeek = []
      
      // If we've passed the actual end date and the week is complete, break
      if (currentDate > actualEndDate) {
        break
      }
    }

    if (currentDate.getFullYear() === year && currentDate <= actualEndDate) {
      currentWeek.push(new Date(currentDate))
    } else if (currentWeek.length > 0) {
      // Only add null cells if we're in the middle of a week
      currentWeek.push(null)
    }

    currentDate.setDate(currentDate.getDate() + 1)
    
    // Break if we've gone too far past the actual end date
    if (currentDate > new Date(actualEndDate.getTime() + 7 * 24 * 60 * 60 * 1000)) {
      break
    }
  }

  // Add the last week if it has content
  if (currentWeek.length > 0) {
    // Only include if it has at least one valid date
    const hasValidDate = currentWeek.some(date => date !== null && date <= actualEndDate)
    if (hasValidDate) {
      weeks.push(currentWeek)
    }
  }

  return weeks
}

export function getWeeksForLast365Days(): (Date | null)[][] {
  const weeks: (Date | null)[][] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days365Ago = new Date(today)
  days365Ago.setDate(today.getDate() - 365)

  // Find the first Sunday of the range or before start date
  const firstDay = new Date(days365Ago)
  while (firstDay.getDay() !== 0) {
    firstDay.setDate(firstDay.getDate() - 1)
  }

  let currentWeek: (Date | null)[] = []
  const currentDate = new Date(firstDay)

  // Generate weeks until we've covered all data up to today
  while (currentDate <= today || currentWeek.length > 0) {
    if (currentDate.getDay() === 0 && currentWeek.length > 0) {
      weeks.push([...currentWeek])
      currentWeek = []
      
      // If we've passed today and the week is complete, break
      if (currentDate > today) {
        break
      }
    }

    if (currentDate >= days365Ago && currentDate <= today) {
      currentWeek.push(new Date(currentDate))
    } else if (currentWeek.length > 0) {
      // Only add null cells if we're in the middle of a week
      currentWeek.push(null)
    }

    currentDate.setDate(currentDate.getDate() + 1)
    
    // Break if we've gone too far past today
    if (currentDate > new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) {
      break
    }
  }

  // Add the last week if it has content
  if (currentWeek.length > 0) {
    // Only include if it has at least one valid date
    const hasValidDate = currentWeek.some(date => date !== null && date <= today)
    if (hasValidDate) {
      weeks.push(currentWeek)
    }
  }

  return weeks
}
