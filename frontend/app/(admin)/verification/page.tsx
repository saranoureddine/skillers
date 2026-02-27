"use client"

import { useState, useMemo } from "react"
import { verificationRequests as initialRequests } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import type { VerificationRequest } from "@/lib/mock-data"

import { VerificationKPIs } from "@/components/admin/verification/verification-kpis"
import { VerificationFilters } from "@/components/admin/verification/verification-filters"
import { VerificationTable } from "@/components/admin/verification/verification-table"
import { VerificationReviewModal } from "@/components/admin/verification/verification-review-modal"
import { VerificationAuditLog } from "@/components/admin/verification/verification-audit-log"

export default function VerificationPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>(initialRequests)
  const [selectedReq, setSelectedReq] = useState<VerificationRequest | null>(null)

  // Filters
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [showFlagged, setShowFlagged] = useState(false)

  // Sorting
  const [sortField, setSortField] = useState("submittedDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const categories = useMemo(
    () => [...new Set(requests.map((r) => r.category))].sort(),
    [requests]
  )

  const hasActiveFilters =
    search !== "" ||
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    typeFilter !== "all" ||
    priorityFilter !== "all" ||
    showFlagged

  const filteredRequests = useMemo(() => {
    let result = [...requests]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (r) =>
          r.specialist.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.profession.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter)
    }
    if (categoryFilter !== "all") {
      result = result.filter((r) => r.category === categoryFilter)
    }
    if (typeFilter !== "all") {
      result = result.filter((r) => r.verificationType === typeFilter)
    }
    if (priorityFilter !== "all") {
      result = result.filter((r) => r.priority === priorityFilter)
    }
    if (showFlagged) {
      result = result.filter((r) => r.flagged)
    }

    // Sort
    result.sort((a, b) => {
      let valA: string | number = ""
      let valB: string | number = ""
      if (sortField === "submittedDate") {
        valA = new Date(a.submittedDate).getTime()
        valB = new Date(b.submittedDate).getTime()
      } else if (sortField === "specialist") {
        valA = a.specialist.toLowerCase()
        valB = b.specialist.toLowerCase()
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
  }, [requests, search, statusFilter, categoryFilter, typeFilter, priorityFilter, showFlagged, sortField, sortDirection])

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
    setCategoryFilter("all")
    setTypeFilter("all")
    setPriorityFilter("all")
    setShowFlagged(false)
  }

  const updateRequest = (id: string, updates: Partial<VerificationRequest>) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    )
  }

  const handleApprove = (id: string, note: string) => {
    const now = new Date().toISOString().slice(0, 16).replace("T", " ")
    updateRequest(id, {
      status: "approved",
      reviewNotes: note
        ? [...(requests.find((r) => r.id === id)?.reviewNotes || []), note]
        : requests.find((r) => r.id === id)?.reviewNotes || [],
      history: [
        ...(requests.find((r) => r.id === id)?.history || []),
        { action: "Approved", actor: "Admin (Super)", date: now, note: note || undefined },
      ],
    })
    setSelectedReq(null)
    toast.success("Verification approved", {
      description: `${requests.find((r) => r.id === id)?.specialist} has been notified.`,
    })
  }

  const handleReject = (id: string, reason: string, note: string) => {
    const now = new Date().toISOString().slice(0, 16).replace("T", " ")
    updateRequest(id, {
      status: "rejected",
      rejectionReason: reason,
      reviewNotes: note
        ? [...(requests.find((r) => r.id === id)?.reviewNotes || []), note]
        : requests.find((r) => r.id === id)?.reviewNotes || [],
      history: [
        ...(requests.find((r) => r.id === id)?.history || []),
        { action: "Rejected", actor: "Admin (Super)", date: now, note: reason },
      ],
    })
    setSelectedReq(null)
    toast.error("Verification rejected", {
      description: `${requests.find((r) => r.id === id)?.specialist} has been notified with the reason.`,
    })
  }

  const handleRequestInfo = (id: string, note: string) => {
    const now = new Date().toISOString().slice(0, 16).replace("T", " ")
    updateRequest(id, {
      status: "more_info",
      reviewNotes: [
        ...(requests.find((r) => r.id === id)?.reviewNotes || []),
        note,
      ],
      history: [
        ...(requests.find((r) => r.id === id)?.history || []),
        { action: "Requested More Info", actor: "Admin (Super)", date: now, note },
      ],
    })
    setSelectedReq(null)
    toast.info("Information requested", {
      description: `${requests.find((r) => r.id === id)?.specialist} has been notified to provide additional info.`,
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
          Verification & KYC
        </h1>
        <p className="text-sm text-muted-foreground">
          Review and approve specialist verification requests
        </p>
      </div>

      {/* KPIs */}
      <VerificationKPIs requests={requests} />

      {/* Filters */}
      <VerificationFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        showFlagged={showFlagged}
        onShowFlaggedChange={setShowFlagged}
        categories={categories}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Showing {filteredRequests.length} of {requests.length} requests
        </p>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <VerificationTable
            requests={filteredRequests}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onReview={setSelectedReq}
          />
        </CardContent>
      </Card>

      {/* Audit Log */}
      <VerificationAuditLog />

      {/* Review Modal */}
      <VerificationReviewModal
        request={selectedReq}
        open={!!selectedReq}
        onClose={() => setSelectedReq(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onRequestInfo={handleRequestInfo}
      />
    </div>
  )
}
