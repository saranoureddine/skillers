"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpDown,
  Eye,
  AlertTriangle,
  User,
  UserCog,
  FileText,
  Star,
  EyeOff,
  Repeat,
} from "lucide-react"
import type { Report } from "@/lib/mock-data"

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  open: { color: "bg-chart-3/15 text-chart-3 border-chart-3/20", icon: Clock, label: "Open" },
  resolved: { color: "bg-accent/15 text-accent border-accent/20", icon: CheckCircle2, label: "Resolved" },
  dismissed: { color: "bg-muted text-muted-foreground border-border", icon: XCircle, label: "Dismissed" },
}

const priorityConfig: Record<string, { color: string; label: string }> = {
  high: { color: "bg-destructive/10 text-destructive border-destructive/20", label: "High" },
  medium: { color: "bg-chart-3/10 text-chart-3 border-chart-3/20", label: "Medium" },
  low: { color: "bg-muted text-muted-foreground border-border", label: "Low" },
}

const entityIcons: Record<string, React.ElementType> = {
  user: User,
  specialist: UserCog,
  post: FileText,
  review: Star,
}

interface ModerationTableProps {
  reports: Report[]
  sortField: string
  sortDirection: "asc" | "desc"
  onSort: (field: string) => void
  onReview: (report: Report) => void
}

export function ModerationTable({
  reports,
  sortField,
  sortDirection,
  onSort,
  onReview,
}: ModerationTableProps) {
  const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <button
      className="flex items-center gap-1 hover:text-foreground"
      onClick={() => onSort(field)}
    >
      {children}
      <ArrowUpDown className={`size-3 ${sortField === field ? "text-primary" : "text-muted-foreground/50"}`} />
    </button>
  )

  return (
    <TooltipProvider>
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[90px]">
                <SortButton field="id">ID</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="reporter">Reporter</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="reportedEntity">Reported</SortButton>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="hidden md:table-cell">Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">
                <SortButton field="priority">Priority</SortButton>
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                <SortButton field="date">Date</SortButton>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No reports match your filters.
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => {
                const status = statusConfig[report.status]
                const priority = priorityConfig[report.priority]
                const StatusIcon = status.icon
                const EntityIcon = entityIcons[report.entityType] || User
                const isHighRisk = report.reason === "fraud" || report.reason === "harassment" || report.reason === "fake_profile"

                return (
                  <TableRow
                    key={report.id}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                    onClick={() => onReview(report)}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        {isHighRisk && (
                          <AlertTriangle className="size-3 shrink-0 text-destructive" />
                        )}
                        {report.id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {report.isAnonymous && (
                          <EyeOff className="size-3 shrink-0 text-muted-foreground" />
                        )}
                        <span className="text-sm font-medium">
                          {report.reporter}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="max-w-[180px] truncate text-sm font-medium">
                              {report.reportedEntity}
                            </span>
                          </TooltipTrigger>
                          {report.contentPreview && (
                            <TooltipContent side="bottom" className="max-w-xs">
                              <p className="text-xs">{report.contentPreview}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                        {report.previousReports > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-chart-3">
                            <Repeat className="size-2.5" />
                            Reported {report.previousReports}x before
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1 text-[10px] capitalize">
                        <EntityIcon className="size-2.5" />
                        {report.entityType}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden max-w-[140px] truncate text-xs text-muted-foreground md:table-cell">
                      {report.reasonLabel}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`gap-1 text-[10px] ${status.color}`}>
                        <StatusIcon className="size-2.5" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className={`text-[10px] ${priority.color}`}>
                        {priority.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                      {report.date}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          onReview(report)
                        }}
                      >
                        <Eye className="size-3" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  )
}
