export interface ContributionData {
  date: string
  count: number
}

export interface HeatmapData {
  github: ContributionData[]
  youtube: ContributionData[]
}

export interface StreakData {
  current: number
  longest: number
  currentStart?: string
  currentEnd?: string
  longestStart?: string
  longestEnd?: string
}

export interface MetricsData {
  github: {
    total: number
    streak: StreakData
  }
  youtube: {
    total: number
    streak: StreakData
  }
}

export interface YearData {
  year: number
  github: ContributionData[]
  youtube: ContributionData[]
}
