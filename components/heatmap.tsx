"use client"

import type React from "react"
import { useState, useMemo, useEffect, useRef } from "react"
import { createPortal } from "react-dom" // Add this import
import type { ContributionData } from "@/lib/types"
import { getWeeksInYear, getWeeksForLast365Days, formatDate, formatDisplayDate } from "@/lib/utils/date"
import { calculateIntensity, getIntensityColor } from "@/lib/utils/intensity"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BackgroundGradient } from "@/components/ui/background-gradient"

interface HeatmapProps {
  data: ContributionData[]
  year: number
  platform: "github" | "youtube"
  title: string
  showLastYear?: boolean
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function Heatmap({ data, year, platform, title, showLastYear = false }: HeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<{
    date: string
    count: number
    details: any
    x: number
    y: number
  } | null>(null)
  const [tooltipTimeout, setTooltipTimeout] = useState<NodeJS.Timeout | null>(null)
  const [showExpanded, setShowExpanded] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // ... (keeping all your existing useMemo and useEffect logic) ...
  const { weeks, intensityMap, dataMap, monthLabels } = useMemo(() => {
    const lastDataDate = data.length > 0 
      ? data.reduce((latest, current) => current.date > latest ? current.date : latest, data[0].date)
      : undefined
    
    const now = new Date()
    const localDateString = now.getFullYear() + '-' + 
      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
      String(now.getDate()).padStart(2, '0')
    
    const weeks = showLastYear 
      ? getWeeksForLast365Days()
      : getWeeksInYear(year, lastDataDate || localDateString)
    const intensityMap = calculateIntensity(data)
    const dataMap = new Map(data.map((d) => [d.date, { count: d.count, details: d.details }]))

    let monthLabels: { month: number, position: number, width: number }[] = []
    
    if (showLastYear) {
      const monthPositions = new Map<string, { month: number, firstWeek: number, lastWeek: number }>()
      
      weeks.forEach((week, weekIndex) => {
        week.forEach(date => {
          if (date) {
            const month = date.getMonth()
            const year = date.getFullYear()
            const key = `${year}-${month}`
            
            if (!monthPositions.has(key)) {
              monthPositions.set(key, {
                month,
                firstWeek: weekIndex,
                lastWeek: weekIndex
              })
            } else {
              monthPositions.get(key)!.lastWeek = weekIndex
            }
          }
        })
      })
      
      const sortedEntries = Array.from(monthPositions.entries()).sort(([, a], [, b]) => a.firstWeek - b.firstWeek)
      
      const allLabels = sortedEntries.map(([key, data]) => ({
        month: data.month,
        position: ((data.firstWeek + data.lastWeek) / 2) * 16,
        width: 50
      }))
      
      monthLabels = allLabels
    } else {
      const monthsToShow = Array.from({ length: 12 }, (_, i) => i)
      const totalWidth = weeks.length * 16
      const monthWidth = totalWidth / 12
      
      monthLabels = monthsToShow.map((month, index) => ({
        month,
        position: index * monthWidth,
        width: monthWidth
      }))
    }

    return { weeks, intensityMap, dataMap, monthLabels }
  }, [data, year, showLastYear])

  const totalContributions = useMemo(() => {
    return data.reduce((sum, d) => sum + d.count, 0)
  }, [data])

  const handleMouseEnter = (event: React.MouseEvent, date: string, count: number, details: any) => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout)
      setTooltipTimeout(null)
    }
    
    // Calculate viewport coordinates instead of relative coordinates
    const element = event.currentTarget as HTMLElement
    const rect = element.getBoundingClientRect()
    
    setHoveredDay({
      date,
      count,
      details,
      x: rect.left + rect.width / 2, // Center of the element in viewport
      y: rect.top, // Top of the element in viewport
    })
  }

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setHoveredDay(null)
      setShowExpanded(false)
    }, 1500)
    setTooltipTimeout(timeout)
  }

  const handleTooltipMouseEnter = () => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout)
      setTooltipTimeout(null)
    }
  }

  const handleTooltipMouseLeave = () => {
    const timeout = setTimeout(() => {
      setHoveredDay(null)
      setShowExpanded(false)
    }, 300)
    setTooltipTimeout(timeout)
  }

  // ... (keeping your existing useEffect hooks) ...
  useEffect(() => {
    const scrollToCurrentDate = () => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current
        const isMobile = window.innerWidth < 768
        const hasOverflow = container.scrollWidth > container.clientWidth
        
        if (isMobile || hasOverflow) {
          const today = formatDate(new Date())
          const lastDataDate = data.length > 0 
            ? data.reduce((latest, current) => current.date > latest ? current.date : latest, data[0].date)
            : today
          
          let targetWeekIndex = -1
          const targetDate = lastDataDate > today ? today : lastDataDate
          
          for (let weekIndex = 0; weekIndex < weeks.length; weekIndex++) {
            const week = weeks[weekIndex]
            for (const date of week) {
              if (date && formatDate(date) === targetDate) {
                targetWeekIndex = weekIndex
                break
              }
            }
            if (targetWeekIndex !== -1) break
          }
          
          if (targetWeekIndex !== -1) {
            const weekWidth = 16
            const targetScrollPosition = Math.max(0, (targetWeekIndex - 10) * weekWidth)
            const maxScroll = container.scrollWidth - container.clientWidth
            
            container.scrollLeft = Math.min(targetScrollPosition, maxScroll)
          } else {
            container.scrollLeft = container.scrollWidth - container.clientWidth
          }
        }
      }
    }

    const timer = setTimeout(scrollToCurrentDate, 100)
    window.addEventListener('resize', scrollToCurrentDate)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', scrollToCurrentDate)
    }
  }, [weeks, data, monthLabels])

  useEffect(() => {
    return () => {
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout)
      }
    }
  }, [tooltipTimeout])

  const renderTooltipContent = () => {
    if (!hoveredDay) return null

    const { date, count, details } = hoveredDay

    return (
      <div 
        className={cn(
          "bg-gray-900 text-white text-sm p-4 rounded-lg shadow-2xl pointer-events-auto relative",
          "border border-gray-700 backdrop-blur-sm",
          showExpanded ? "min-w-80 max-w-xl max-h-96" : "min-w-64 max-w-sm"
        )}
        onMouseEnter={handleTooltipMouseEnter}
        onMouseLeave={handleTooltipMouseLeave}
      >
        <div className="font-semibold mb-2">
          {count} {platform === "github" ? "contributions" : "uploads"} on {formatDisplayDate(date)}
        </div>

        {platform === "github" && details?.repos?.length > 0 && count > 0 && (
          <div>
            <div className="text-gray-300 mb-1">Repositories:</div>
            <div className={cn("space-y-1", showExpanded && "max-h-60 overflow-y-auto pr-2")}>
              {(showExpanded ? details.repos : details.repos.slice(0, 3)).map((repo: string, index: number) => (
                <div 
                  key={index} 
                  className="text-blue-300 cursor-pointer hover:text-blue-200 hover:underline break-all"
                  onClick={() => window.open(`https://github.com/${repo}`, '_blank')}
                >
                  {repo}
                </div>
              ))}
              {!showExpanded && details.repos.length > 3 && (
                <div 
                  className="text-gray-400 cursor-pointer hover:text-gray-200 underline"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowExpanded(true)
                  }}
                >
                  +{details.repos.length - 3} more (click to expand)
                </div>
              )}
              {showExpanded && (
                <div 
                  className="text-gray-400 cursor-pointer hover:text-gray-200 underline mt-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowExpanded(false)
                  }}
                >
                  Show less
                </div>
              )}
            </div>
          </div>
        )}

        {platform === "youtube" && details?.videos?.length > 0 && count > 0 && (
          <div>
            <div className="text-gray-300 mb-1">Videos:</div>
            <div className={cn("space-y-1", showExpanded && "max-h-60 overflow-y-auto pr-2")}>
              {(showExpanded ? details.videos : details.videos.slice(0, 2)).map((video: any, index: number) => (
                <div 
                  key={index} 
                  className="relative group text-red-300 cursor-pointer hover:text-red-200 hover:underline break-all" 
                  onClick={(e) => {
                    e.stopPropagation()
                    const url = video.url || (video.id ? `https://youtu.be/${video.id}` : null)
                    if (url) {
                      window.open(url, '_blank')
                    }
                  }}
                >
                  {video.title}
                  
                  {video.thumbnail && (
                    <div className="fixed left-0 bottom-full mb-2 hidden group-hover:block bg-gray-900 border border-gray-700 rounded p-2 shadow-lg pointer-events-none" style={{ zIndex: 2147483647 }}>
                      <img 
                        src={video.thumbnail || (video.id ? `https://img.youtube.com/vi/${video.id}/mqdefault.jpg` : '')} 
                        alt={video.title}
                        className="w-32 h-18 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <div className="text-xs text-gray-300 mt-1 max-w-32 truncate">
                        {video.title}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {!showExpanded && details.videos.length > 2 && (
                <div 
                  className="text-gray-400 cursor-pointer hover:text-gray-200 underline"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowExpanded(true)
                  }}
                >
                  +{details.videos.length - 2} more (click to expand)
                </div>
              )}
              {showExpanded && (
                <div 
                  className="text-gray-400 cursor-pointer hover:text-gray-200 underline mt-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowExpanded(false)
                  }}
                >
                  Show less
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <BackgroundGradient className="rounded-[22px] p-1" containerClassName="max-w-[60vw]">
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-none rounded-[20px] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
            <div className="text-sm text-gray-700">
              {totalContributions} {platform === "github" ? "contributions" : "uploads"} in {year}
            </div>
          </div>
        </CardHeader>
      
        <CardContent className="pt-0">
          <div className="relative heatmap-container">
            <div ref={scrollContainerRef} className="overflow-x-auto pb-2">
              <div style={{ width: `${weeks.length * 16 + 32}px`, minWidth: "700px" }}>
                <div 
                  className="relative mb-2 ml-8"
                  style={{ width: `${Math.max(weeks.length * 16, monthLabels.length > 0 ? Math.max(...monthLabels.map(m => m.position + 50)) : 0)}px`, height: '16px' }}
                >
                  {monthLabels.map((monthLabel, index) => (
                    <div
                      key={`${monthLabel.month}-${index}`}
                      className="absolute text-xs text-gray-600 text-center"
                      style={{ 
                        left: `${monthLabel.position}px`,
                        width: `${monthLabel.width}px`,
                        top: 0
                      }}
                    >
                      {MONTHS[monthLabel.month]}
                    </div>
                  ))}
                </div>

                <div className="flex">
                  <div className="flex flex-col mr-2 text-xs text-gray-600 w-6">
                    {DAYS.map((day, index) => (
                      <div key={day} className="h-3 flex items-center" style={{ marginBottom: "2px" }}>
                        {index % 2 === 1 ? day : ""}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-1">
                    {weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-1">
                        {week.map((date, dayIndex) => {
                          const dateStr = date ? formatDate(date) : ""
                          const dayData = dateStr ? dataMap.get(dateStr) : null
                          const count = dayData?.count || 0
                          const details = dayData?.details
                          const intensity = dateStr ? intensityMap.get(dateStr) || 0 : 0

                          return (
                            <div
                              key={dayIndex}
                              className={cn(
                                "w-3 h-3 rounded-sm border border-gray-400 cursor-pointer transition-all duration-300",
                                date ? "hover:animate-pulse hover:shadow-lg hover:scale-110" : "",
                                date ? getIntensityColor(intensity, platform) : "bg-transparent border-transparent",
                                intensity > 0 && "hover:shadow-blue-500/80 hover:shadow-lg"
                              )}
                              style={{
                                animation: hoveredDay?.date === dateStr ? "heatmap-glow 0.5s ease-in-out infinite alternate" : undefined,
                                boxShadow: hoveredDay?.date === dateStr ? "0 0 10px rgba(59, 130, 246, 0.8)" : undefined
                              }}
                              onMouseEnter={(e) => {
                                if (date) {
                                  handleMouseEnter(e, dateStr, count, details)
                                }
                              }}
                              onMouseLeave={handleMouseLeave}
                            />
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 text-xs text-gray-600 gap-2">
              <span>Learn how we count {platform === "github" ? "contributions" : "uploads"}</span>
              <div className="flex items-center gap-1">
                <span>Less</span>
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={cn("w-3 h-3 rounded-sm border border-gray-400", getIntensityColor(level, platform))}
                  />
                ))}
                <span>More</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portal Tooltip - Renders outside component hierarchy */}
      {hoveredDay && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[2147483647]" // Maximum z-index for guaranteed top layer
          style={{
            left: `${hoveredDay.x}px`,
            top: `${hoveredDay.y}px`,
            transform: "translate(-50%, calc(-100% - 8px))", // Position above with gap
            pointerEvents: 'auto',
          }}
        >
          {renderTooltipContent()}
        </div>,
        document.body // Render directly in body, escaping all parent containers
      )}
    </BackgroundGradient>
  )
}