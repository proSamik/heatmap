import type { ContributionData, StreakData } from "../types"

export function calculateStreak(data: ContributionData[]): StreakData {
  if (!data.length) {
    return { current: 0, longest: 0 }
  }

  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  let currentStreak = 0
  let longestStreak = 0
  let tempCurrentStreak = 0
  let currentStart: string | undefined
  let currentEnd: string | undefined
  let longestStart: string | undefined
  let longestEnd: string | undefined
  let tempStart: string | undefined

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Calculate streaks
  for (let i = 0; i < sortedData.length; i++) {
    const current = sortedData[i]
    const currentDate = new Date(current.date)
    currentDate.setHours(0, 0, 0, 0)

    if (current.count > 0) {
      if (tempCurrentStreak === 0) {
        tempStart = current.date
      }
      tempCurrentStreak++

      // Update longest streak if current temp streak is longer
      if (tempCurrentStreak > longestStreak) {
        longestStreak = tempCurrentStreak
        longestStart = tempStart
        longestEnd = current.date
      }
    } else {
      // Reset temp streak
      tempCurrentStreak = 0
      tempStart = undefined
    }
  }

  // Determine current active streak
  // Work backwards from today to find the current streak
  const todayStr = today.toISOString().split("T")[0]
  const checkDate = new Date(today)
  let foundToday = false

  // Check if today has contributions
  const todayData = sortedData.find((d) => d.date === todayStr)
  if (todayData && todayData.count > 0) {
    foundToday = true
    currentStreak = 1
    currentEnd = todayStr
    currentStart = todayStr
  }

  // If today doesn't have contributions, check yesterday
  if (!foundToday) {
    checkDate.setDate(checkDate.getDate() - 1)
    const yesterdayStr = checkDate.toISOString().split("T")[0]
    const yesterdayData = sortedData.find((d) => d.date === yesterdayStr)

    if (yesterdayData && yesterdayData.count > 0) {
      currentStreak = 1
      currentEnd = yesterdayStr
      currentStart = yesterdayStr
      checkDate.setDate(checkDate.getDate() - 1)
    }
  } else {
    checkDate.setDate(checkDate.getDate() - 1)
  }

  // Continue backwards to build the current streak
  if (currentStreak > 0) {
    while (checkDate >= new Date(sortedData[0].date)) {
      const checkDateStr = checkDate.toISOString().split("T")[0]
      const dayData = sortedData.find((d) => d.date === checkDateStr)

      if (dayData && dayData.count > 0) {
        currentStreak++
        currentStart = checkDateStr
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
  }

  return {
    current: currentStreak,
    longest: longestStreak,
    currentStart,
    currentEnd,
    longestStart,
    longestEnd,
  }
}
