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
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <HoverBorderGradient
          containerClassName="rounded-full"
          as="button"
          className={`dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 ${
            showLastYear ? "bg-blue-600 text-white" : ""
          }`}
          onClick={onToggleLastYear}
        >
          <span>Last Year</span>
        </HoverBorderGradient>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div>
              <HoverBorderGradient
                containerClassName="rounded-full"
                as="button"
                className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
              >
                <span>{selectedYear}</span>
                <ChevronDown className="h-4 w-4" />
              </HoverBorderGradient>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-60 overflow-y-auto">
            {availableYears.map((year) => (
              <DropdownMenuItem
                key={year}
                onClick={() => onYearChange(year)}
                className={selectedYear === year ? "bg-blue-100 dark:bg-blue-900" : ""}
              >
                {year}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="text-sm text-gray-600">Contribution settings</div>
    </div>
  )
}
