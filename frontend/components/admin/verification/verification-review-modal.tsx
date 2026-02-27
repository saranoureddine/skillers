"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  AlertTriangle,
  FileText,
  FileImage,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MessageSquare,
  History,
  Shield,
} from "lucide-react"
import type { VerificationRequest, VerificationDocument } from "@/lib/mock-data"

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  pending: { color: "bg-chart-3/15 text-chart-3", icon: Clock, label: "Pending" },
  approved: { color: "bg-accent/15 text-accent", icon: CheckCircle2, label: "Approved" },
  rejected: { color: "bg-destructive/15 text-destructive", icon: XCircle, label: "Rejected" },
  more_info: { color: "bg-chart-1/15 text-chart-1", icon: AlertCircle, label: "Needs Info" },
}

const qualityConfig: Record<string, { color: string; label: string }> = {
  clear: { color: "text-accent", label: "Clear" },
  blurry: { color: "text-chart-3", label: "Blurry" },
  unreadable: { color: "text-destructive", label: "Unreadable" },
}

interface VerificationReviewModalProps {
  request: VerificationRequest | null
  open: boolean
  onClose: () => void
  onApprove: (id: string, note: string) => void
  onReject: (id: string, reason: string, note: string) => void
  onRequestInfo: (id: string, note: string) => void
}

export function VerificationReviewModal({
  request,
  open,
  onClose,
  onApprove,
  onReject,
  onRequestInfo,
}: VerificationReviewModalProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [adminNote, setAdminNote] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [showInfoForm, setShowInfoForm] = useState(false)

  if (!request) return null

  const status = statusConfig[request.status]
  const StatusIcon = status.icon
  const isPending = request.status === "pending"
  const isMoreInfo = request.status === "more_info"
  const canAct = isPending || isMoreInfo

  const handleApprove = () => {
    onApprove(request.id, adminNote)
    resetForms()
  }

  const handleReject = () => {
    if (!rejectionReason.trim()) return
    onReject(request.id, rejectionReason, adminNote)
    resetForms()
  }

  const handleRequestInfo = () => {
    if (!adminNote.trim()) return
    onRequestInfo(request.id, adminNote)
    resetForms()
  }

  const resetForms = () => {
    setAdminNote("")
    setRejectionReason("")
    setShowRejectForm(false)
    setShowInfoForm(false)
    setActiveTab("details")
  }

  const handleClose = () => {
    resetForms()
    onClose()
  }

  const DocumentItem = ({ doc }: { doc: VerificationDocument }) => {
    const quality = qualityConfig[doc.quality]
    const isExpired = doc.expiresAt && new Date(doc.expiresAt) < new Date()
    return (
      <div className="flex items-start gap-3 rounded-lg border p-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
          {doc.fileType === "pdf" ? (
            <FileText className="size-4 text-primary" />
          ) : (
            <FileImage className="size-4 text-primary" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{doc.name}</span>
            <Badge variant="outline" className="text-[9px] capitalize">
              {doc.type}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] font-medium ${quality.color}`}>
              Quality: {quality.label}
            </span>
            {doc.quality !== "clear" && (
              <AlertTriangle className="size-2.5 text-chart-3" />
            )}
            <span className="text-[10px] text-muted-foreground">
              {doc.fileType.toUpperCase()}
            </span>
            <span className="text-[10px] text-muted-foreground">
              Uploaded: {doc.uploadedAt}
            </span>
          </div>
          {doc.expiresAt && (
            <span className={`text-[10px] font-medium ${isExpired ? "text-destructive" : "text-muted-foreground"}`}>
              {isExpired ? "EXPIRED: " : "Expires: "}{doc.expiresAt}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl p-0">
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="size-5 text-primary" />
            </div>
            <div className="flex flex-col gap-0.5">
              <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>
                Verification Review
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <span className="font-mono text-xs">{request.id}</span>
                <Badge variant="secondary" className={`gap-1 text-[10px] ${status.color}`}>
                  <StatusIcon className="size-2.5" />
                  {status.label}
                </Badge>
                {request.flagged && (
                  <Badge variant="outline" className="gap-1 border-chart-3/30 bg-chart-3/10 text-[10px] text-chart-3">
                    <AlertTriangle className="size-2.5" />
                    Flagged
                  </Badge>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col">
          <TabsList className="mx-6 w-fit">
            <TabsTrigger value="details" className="gap-1.5 text-xs">
              <User className="size-3" />
              Details
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-1.5 text-xs">
              <FileText className="size-3" />
              Documents ({request.documents.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5 text-xs">
              <History className="size-3" />
              History
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] px-6 py-4">
            <TabsContent value="details" className="m-0 flex flex-col gap-4">
              {/* Specialist Profile */}
              <div>
                <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Specialist Profile
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <InfoCard icon={User} label="Name" value={request.specialist} />
                  <InfoCard icon={Mail} label="Email" value={request.specialistEmail} />
                  <InfoCard icon={Phone} label="Phone" value={request.specialistPhone} />
                  <InfoCard icon={MapPin} label="Location" value={request.specialistLocation} />
                  <InfoCard icon={Shield} label="Category" value={request.category} />
                  <InfoCard icon={Calendar} label="Submitted" value={request.submittedDate} />
                </div>
              </div>

              <Separator />

              {/* Flag Warning */}
              {request.flagged && request.flagReason && (
                <>
                  <div className="flex items-start gap-3 rounded-lg border border-chart-3/30 bg-chart-3/5 p-3">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-chart-3" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-chart-3">Flagged Submission</span>
                      <span className="text-xs text-muted-foreground">{request.flagReason}</span>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Rejection Reason */}
              {request.rejectionReason && (
                <>
                  <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-destructive">Rejection Reason</span>
                      <span className="text-xs text-muted-foreground">{request.rejectionReason}</span>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Review Notes */}
              {request.reviewNotes.length > 0 && (
                <div>
                  <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Internal Review Notes
                  </h4>
                  <div className="flex flex-col gap-2">
                    {request.reviewNotes.map((note, idx) => (
                      <div key={idx} className="flex items-start gap-2 rounded-lg bg-muted/50 p-2.5">
                        <MessageSquare className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents" className="m-0 flex flex-col gap-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Submitted Documents
              </h4>
              {request.documents.map((doc, idx) => (
                <DocumentItem key={idx} doc={doc} />
              ))}
            </TabsContent>

            <TabsContent value="history" className="m-0 flex flex-col gap-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Verification History
              </h4>
              <div className="relative flex flex-col gap-0 pl-4">
                {request.history.map((entry, idx) => (
                  <div key={idx} className="relative flex gap-3 pb-4">
                    <div className="absolute -left-4 top-1 h-full w-px bg-border" />
                    <div className="absolute -left-[19px] top-1 size-2.5 rounded-full border-2 border-primary bg-background" />
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{entry.action}</span>
                        <span className="text-[10px] text-muted-foreground">by {entry.actor}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{entry.date}</span>
                      {entry.note && (
                        <span className="mt-1 text-xs text-muted-foreground">{entry.note}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Action Footer */}
        {canAct && (
          <div className="border-t px-6 py-4">
            {!showRejectForm && !showInfoForm && (
              <div className="flex flex-col gap-3">
                <div>
                  <Label htmlFor="admin-note" className="text-xs text-muted-foreground">
                    Admin Note (optional)
                  </Label>
                  <Textarea
                    id="admin-note"
                    placeholder="Add an internal note..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="mt-1 h-16 resize-none text-xs"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowInfoForm(true)}
                    className="text-xs"
                  >
                    <AlertCircle className="mr-1.5 size-3" />
                    Request Info
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowRejectForm(true)}
                    className="text-xs"
                  >
                    <XCircle className="mr-1.5 size-3" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleApprove}
                    className="text-xs"
                  >
                    <CheckCircle2 className="mr-1.5 size-3" />
                    Approve
                  </Button>
                </div>
              </div>
            )}

            {showRejectForm && (
              <div className="flex flex-col gap-3">
                <div>
                  <Label htmlFor="reject-reason" className="text-xs font-semibold text-destructive">
                    Rejection Reason (required)
                  </Label>
                  <Textarea
                    id="reject-reason"
                    placeholder="Provide a clear reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mt-1 h-20 resize-none border-destructive/30 text-xs focus-visible:ring-destructive"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowRejectForm(false)
                      setRejectionReason("")
                    }}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleReject}
                    disabled={!rejectionReason.trim()}
                    className="text-xs"
                  >
                    Confirm Rejection
                  </Button>
                </div>
              </div>
            )}

            {showInfoForm && (
              <div className="flex flex-col gap-3">
                <div>
                  <Label htmlFor="info-request" className="text-xs font-semibold text-chart-1">
                    Information Request (required)
                  </Label>
                  <Textarea
                    id="info-request"
                    placeholder="Describe what additional information or documents are needed..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="mt-1 h-20 resize-none border-chart-1/30 text-xs focus-visible:ring-chart-1"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowInfoForm(false)
                      setAdminNote("")
                    }}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleRequestInfo}
                    disabled={!adminNote.trim()}
                    className="text-xs"
                  >
                    Send Request
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function InfoCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-muted/50 p-2.5">
      <Icon className="size-3.5 shrink-0 text-muted-foreground" />
      <div className="flex flex-col">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className="text-xs font-medium">{value}</span>
      </div>
    </div>
  )
}
