"use client"

import { useState, useMemo } from "react"
import { reports as initialReports } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import type { Report, ModerationAction } from "@/lib/mock-data"

import { ModerationKPIs } from "@/components/admin/moderation/moderation-kpis"
import { ModerationFilters } from "@/components/admin/moderation/moderation-filters"
import { ModerationTable } from "@/components/admin/moderation/moderation-table"
import { ModerationReviewModal } from "@/components/admin/moderation/moderation-review-modal"
import { ModerationAuditLog } from "@/components/admin/moderation/moderation-audit-log"

const actionLabels: Record<ModerationAction, string> = {
  remove_content: "Content Removed",
  warn_user: "User Warned",
  suspend_account: "Account Suspended",
  escalate: "Escalated",
  no_action: "No Action",
}

export default function ModerationPage() {
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  // Filters
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [reasonFilter, setReasonFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [showAnonymous, setShowAnonymous] = useState(false)
  const [showHighRisk, setShowHighRisk] = useState(false)

  // Sorting
  const [sortField, setSortField] = useState("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const hasActiveFilters =
    search !== "" ||
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    reasonFilter !== "all" ||
    priorityFilter !== "all" ||
    showAnonymous ||
    showHighRisk

  const filteredReports = useMemo(() => {
    let result = [...reports]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.reporter.toLowerCase().includes(q) ||
          r.reportedEntity.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.reasonLabel.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter)
    }
    if (typeFilter !== "all") {
      result = result.filter((r) => r.entityType === typeFilter)
    }
    if (reasonFilter !== "all") {
      result = result.filter((r) => r.reason === reasonFilter)
    }
    if (priorityFilter !== "all") {
      result = result.filter((r) => r.priority === priorityFilter)
    }
    if (showAnonymous) {
      result = result.filter((r) => r.isAnonymous)
    }
    if (showHighRisk) {
      const highRiskReasons = ["fraud", "harassment", "fake_profile"]
      result = result.filter((r) => highRiskReasons.includes(r.reason))
    }

    // Sort
    result.sort((a, b) => {
      let valA: string | number = ""
      let valB: string | number = ""
      if (sortField === "date") {
        valA = new Date(a.date).getTime()
        valB = new Date(b.date).getTime()
      } else if (sortField === "reporter") {
        valA = a.reporter.toLowerCase()
        valB = b.reporter.toLowerCase()
      } else if (sortField === "reportedEntity") {
        valA = a.reportedEntity.toLowerCase()
        valB = b.reportedEntity.toLowerCase()
      } else if (sortField === "priority") {
        const order = { high: 3, medium: 2, low: 1 }
        valA = order[a.priority]
        valB = order[b.priority]
      } else if (sortField === "id") {
        valA = a.id
        valB = b.id
      }
      if (valA < valB) return sortDirection === "asc" ? -1 : 1
      if (valA > valB) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return result
  }, [reports, search, statusFilter, typeFilter, reasonFilter, priorityFilter, showAnonymous, showHighRisk, sortField, sortDirection])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const clearFilters = () => {
    setSearch("")
    setStatusFilter("all")
    setTypeFilter("all")
    setReasonFilter("all")
    setPriorityFilter("all")
    setShowAnonymous(false)
    setShowHighRisk(false)
  }

  const updateReport = (id: string, updates: Partial<Report>) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    )
  }

  const handleResolve = (id: string, action: ModerationAction, note: string) => {
    const now = new Date().toISOString().slice(0, 16).replace("T", " ")
    const report = reports.find((r) => r.id === id)
    if (!report) return

    updateReport(id, {
      status: "resolved",
      actionTaken: action,
      resolution: note || `${actionLabels[action]} by admin.`,
      moderationNotes: note
        ? [...report.moderationNotes, note]
        : report.moderationNotes,
      history: [
        ...report.history,
        { action: "Under Review", actor: "Admin (Super)", date: now },
        { action: `Resolved - ${actionLabels[action]}`, actor: "Admin (Super)", date: now, note: note || undefined },
      ],
    })
    setSelectedReport(null)
    toast.success("Report resolved", {
      description: `${actionLabels[action]} for report ${id}.`,
    })
  }

  const handleDismiss = (id: string, reason: string) => {
    const now = new Date().toISOString().slice(0, 16).replace("T", " ")
    const report = reports.find((r) => r.id === id)
    if (!report) return

    updateReport(id, {
      status: "dismissed",
      actionTaken: "no_action",
      resolution: reason,
      moderationNotes: [...report.moderationNotes, reason],
      history: [
        ...report.history,
        { action: "Dismissed", actor: "Admin (Super)", date: now, note: reason },
      ],
    })
    setSelectedReport(null)
    toast.info("Report dismissed", {
      description: `Report ${id} dismissed with reason.`,
    })
  }

  const handleEscalate = (id: string, note: string) => {
    const now = new Date().toISOString().slice(0, 16).replace("T", " ")
    const report = reports.find((r) => r.id === id)
    if (!report) return

    updateReport(id, {
      moderationNotes: note
        ? [...report.moderationNotes, `[ESCALATED] ${note}`]
        : [...report.moderationNotes, "[ESCALATED] Report escalated to senior admin."],
      history: [
        ...report.history,
        { action: "Escalated", actor: "Admin (Super)", date: now, note: note || "Escalated to senior admin for review." },
      ],
    })
    setSelectedReport(null)
    toast.warning("Report escalated", {
      description: `Report ${id} has been escalated for senior review.`,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Moderation & Reports
        </h1>
        <p className="text-sm text-muted-foreground">
          Review and resolve user-submitted reports
        </p>
      </div>

      {/* KPIs */}
      <ModerationKPIs reports={reports} />

      {/* Filters */}
      <ModerationFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        reasonFilter={reasonFilter}
        onReasonChange={setReasonFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        showAnonymous={showAnonymous}
        onShowAnonymousChange={setShowAnonymous}
        showHighRisk={showHighRisk}
        onShowHighRiskChange={setShowHighRisk}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Showing {filteredReports.length} of {reports.length} reports
        </p>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <ModerationTable
            reports={filteredReports}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onReview={setSelectedReport}
          />
        </CardContent>
      </Card>

      {/* Audit Log */}
      <ModerationAuditLog />

      {/* Review Modal */}
      <ModerationReviewModal
        report={selectedReport}
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        onResolve={handleResolve}
        onDismiss={handleDismiss}
        onEscalate={handleEscalate}
      />
    </div>
  )
}
