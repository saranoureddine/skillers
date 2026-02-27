"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, X, AlertTriangle, EyeOff } from "lucide-react"

interface ModerationFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  typeFilter: string
  onTypeChange: (value: string) => void
  reasonFilter: string
  onReasonChange: (value: string) => void
  priorityFilter: string
  onPriorityChange: (value: string) => void
  showAnonymous: boolean
  onShowAnonymousChange: (value: boolean) => void
  showHighRisk: boolean
  onShowHighRiskChange: (value: boolean) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
}

export function ModerationFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  reasonFilter,
  onReasonChange,
  priorityFilter,
  onPriorityChange,
  showAnonymous,
  onShowAnonymousChange,
  showHighRisk,
  onShowHighRiskChange,
  onClearFilters,
  hasActiveFilters,
}: ModerationFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by report ID, reporter, reported entity, or keywords..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={onTypeChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="specialist">Specialist</SelectItem>
              <SelectItem value="post">Post</SelectItem>
              <SelectItem value="review">Review</SelectItem>
            </SelectContent>
          </Select>

          <Select value={reasonFilter} onValueChange={onReasonChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reasons</SelectItem>
              <SelectItem value="fraud">Fraud</SelectItem>
              <SelectItem value="harassment">Harassment</SelectItem>
              <SelectItem value="spam">Spam</SelectItem>
              <SelectItem value="inappropriate">Inappropriate</SelectItem>
              <SelectItem value="fake_profile">Fake Profile</SelectItem>
              <SelectItem value="poor_quality">Poor Quality</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={onPriorityChange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={showHighRisk ? "default" : "outline"}
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={() => onShowHighRiskChange(!showHighRisk)}
        >
          <AlertTriangle className="size-3" />
          High-Risk Only
        </Button>
        <Button
          variant={showAnonymous ? "default" : "outline"}
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={() => onShowAnonymousChange(!showAnonymous)}
        >
          <EyeOff className="size-3" />
          Anonymous Only
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-muted-foreground"
            onClick={onClearFilters}
          >
            <X className="size-3" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  )
}
