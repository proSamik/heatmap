"use client"

import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Button
          variant={showLastYear ? "default" : "outline"}
          onClick={onToggleLastYear}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Last Year
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              {selectedYear}
              <ChevronDown className="h-4 w-4" />
            </Button>
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

      <div className="text-sm text-muted-foreground">Contribution settings</div>
    </div>
  )
}
