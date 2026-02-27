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
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  Eye,
} from "lucide-react"
import type { VerificationRequest } from "@/lib/mock-data"

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  pending: { color: "bg-chart-3/15 text-chart-3 border-chart-3/20", icon: Clock, label: "Pending" },
  approved: { color: "bg-accent/15 text-accent border-accent/20", icon: CheckCircle2, label: "Approved" },
  rejected: { color: "bg-destructive/15 text-destructive border-destructive/20", icon: XCircle, label: "Rejected" },
  more_info: { color: "bg-chart-1/15 text-chart-1 border-chart-1/20", icon: AlertCircle, label: "Needs Info" },
}

const priorityConfig: Record<string, { color: string; label: string }> = {
  high: { color: "bg-destructive/10 text-destructive border-destructive/20", label: "High" },
  medium: { color: "bg-chart-3/10 text-chart-3 border-chart-3/20", label: "Medium" },
  low: { color: "bg-muted text-muted-foreground border-border", label: "Low" },
}

const typeLabels: Record<string, string> = {
  identity: "Identity",
  license: "License",
  certification: "Certification",
}

interface VerificationTableProps {
  requests: VerificationRequest[]
  sortField: string
  sortDirection: "asc" | "desc"
  onSort: (field: string) => void
  onReview: (request: VerificationRequest) => void
}

export function VerificationTable({
  requests,
  sortField,
  sortDirection,
  onSort,
  onReview,
}: VerificationTableProps) {
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
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[90px]">
              <SortButton field="id">ID</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="specialist">Specialist</SortButton>
            </TableHead>
            <TableHead className="hidden md:table-cell">Category</TableHead>
            <TableHead className="hidden lg:table-cell">Type</TableHead>
            <TableHead>
              <SortButton field="submittedDate">Submitted</SortButton>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">
              <SortButton field="priority">Priority</SortButton>
            </TableHead>
            <TableHead className="hidden lg:table-cell">Docs</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                No verification requests match your filters.
              </TableCell>
            </TableRow>
          ) : (
            requests.map((req) => {
              const status = statusConfig[req.status]
              const priority = priorityConfig[req.priority]
              const StatusIcon = status.icon
              return (
                <TableRow
                  key={req.id}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => onReview(req)}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      {req.flagged && (
                        <AlertTriangle className="size-3 shrink-0 text-chart-3" />
                      )}
                      {req.id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{req.specialist}</span>
                      <span className="text-xs text-muted-foreground">{req.profession}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                    {req.category}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-xs capitalize text-muted-foreground">
                      {typeLabels[req.verificationType]}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{req.submittedDate}</TableCell>
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
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {req.documents.length} docs
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1.5 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        onReview(req)
                      }}
                    >
                      <Eye className="size-3" />
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
