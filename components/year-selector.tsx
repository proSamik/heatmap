"use client"

import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"

interface YearSelectorProps {
  selectedYear: number
  availableYears: number[]
  onYearChange: (year: number) => void
  showLastYear: boolean
  onToggleLastYear: () => void
}

export function YearSelector({
  selectedYear,
  availableYears,
  onYearChange,
  showLastYear,
  onToggleLastYear,
}: YearSelectorProps) {
  const currentSelection = showLastYear ? "Last Year" : selectedYear.toString()
  
  const handleSelection = (value: string) => {
    if (value === "Last Year") {
      if (!showLastYear) onToggleLastYear()
    } else {
      const year = parseInt(value)
      if (showLastYear) onToggleLastYear()
      onYearChange(year)
    }
  }
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div>
              <HoverBorderGradient
                containerClassName="rounded-full"
                as="button"
                className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
              >
                <span>{currentSelection}</span>
                <ChevronDown className="h-4 w-4" />
              </HoverBorderGradient>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => handleSelection("Last Year")}
              className={showLastYear ? "bg-blue-100 dark:bg-blue-900" : ""}
            >
              Last Year
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSelection("2025")}
              className={!showLastYear && selectedYear === 2025 ? "bg-blue-100 dark:bg-blue-900" : ""}
            >
              2025
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSelection("2024")}
              className={!showLastYear && selectedYear === 2024 ? "bg-blue-100 dark:bg-blue-900" : ""}
            >
              2024
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="text-sm text-gray-600">Contribution settings</div>
    </div>
  )
}
