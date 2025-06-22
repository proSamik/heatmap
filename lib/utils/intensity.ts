import type { ContributionData } from "../types"

export function calculateIntensity(data: ContributionData[]): Map<string, number> {
  const intensityMap = new Map<string, number>()

  if (!data.length) return intensityMap

  // Find max count for normalization
  const maxCount = Math.max(...data.map((d) => d.count))

  if (maxCount === 0) {
    data.forEach((d) => intensityMap.set(d.date, 0))
    return intensityMap
  }

  // Calculate intensity levels (0-4 like GitHub)
  data.forEach((d) => {
    let intensity = 0
    if (d.count > 0) {
      const ratio = d.count / maxCount
      if (ratio <= 0.25) intensity = 1
      else if (ratio <= 0.5) intensity = 2
      else if (ratio <= 0.75) intensity = 3
      else intensity = 4
    }
    intensityMap.set(d.date, intensity)
  })

  return intensityMap
}

/**
 * Get the color class for a given intensity level and platform
 * @param intensity - Intensity level (0-4)
 * @param platform - Platform type (github or youtube)
 * @returns Tailwind CSS class string for background color
 */
export function getIntensityColor(intensity: number, platform: "github" | "youtube"): string {
  // GitHub-style green colors
  const githubColors = {
    0: "bg-gray-100 dark:bg-gray-800", // No activity
    1: "bg-green-100 dark:bg-green-900", // Light activity
    2: "bg-green-200 dark:bg-green-700", // Medium-light activity
    3: "bg-green-400 dark:bg-green-600", // Medium activity
    4: "bg-green-600 dark:bg-green-500", // High activity
  }

  // YouTube-style red colors
  const youtubeColors = {
    0: "bg-gray-100 dark:bg-gray-800", // No activity
    1: "bg-red-100 dark:bg-red-900", // Light activity
    2: "bg-red-200 dark:bg-red-700", // Medium-light activity
    3: "bg-red-400 dark:bg-red-600", // Medium activity
    4: "bg-red-600 dark:bg-red-500", // High activity
  }

  const colors = platform === "github" ? githubColors : youtubeColors
  const validIntensity = Math.max(0, Math.min(4, intensity)) as keyof typeof colors
  
  return colors[validIntensity] || colors[0]
}
