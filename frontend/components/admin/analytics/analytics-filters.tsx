"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Download, RefreshCw } from "lucide-react"

interface AnalyticsFiltersProps {
  dateRange: string
  setDateRange: (v: string) => void
  userType: string
  setUserType: (v: string) => void
}

export function AnalyticsFilters({
  dateRange,
  setDateRange,
  userType,
  setUserType,
}: AnalyticsFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={dateRange} onValueChange={setDateRange}>
        <SelectTrigger className="h-8 w-[140px] text-xs">
          <SelectValue placeholder="Date range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="yearly">Yearly</SelectItem>
        </SelectContent>
      </Select>

      <Select value={userType} onValueChange={setUserType}>
        <SelectTrigger className="h-8 w-[140px] text-xs">
          <SelectValue placeholder="User type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Users</SelectItem>
          <SelectItem value="client">Clients</SelectItem>
          <SelectItem value="specialist">Specialists</SelectItem>
        </SelectContent>
      </Select>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <RefreshCw className="size-3" />
          Refresh
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Download className="size-3" />
          Export CSV
        </Button>
      </div>
    </div>
  )
}
