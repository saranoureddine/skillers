"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  AlertTriangle,
  Flag,
  User,
  Mail,
  FileText,
  Star,
  UserCog,
  MessageSquare,
  History,
  Shield,
  Ban,
  Trash2,
  ArrowUpCircle,
  EyeOff,
  Image,
  Link,
  Repeat,
} from "lucide-react"
import type { Report, ReportEvidence, ModerationAction } from "@/lib/mock-data"

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  open: { color: "bg-chart-3/15 text-chart-3", icon: Clock, label: "Open" },
  resolved: { color: "bg-accent/15 text-accent", icon: CheckCircle2, label: "Resolved" },
  dismissed: { color: "bg-muted text-muted-foreground", icon: XCircle, label: "Dismissed" },
}

const entityIcons: Record<string, React.ElementType> = {
  user: User,
  specialist: UserCog,
  post: FileText,
  review: Star,
}

const evidenceIcons: Record<string, React.ElementType> = {
  screenshot: Image,
  link: Link,
  text: FileText,
}

const actionLabels: Record<ModerationAction, string> = {
  remove_content: "Remove Content",
  warn_user: "Warn User",
  suspend_account: "Suspend Account",
  escalate: "Escalate",
  no_action: "No Action",
}

interface ModerationReviewModalProps {
  report: Report | null
  open: boolean
  onClose: () => void
  onResolve: (id: string, action: ModerationAction, note: string) => void
  onDismiss: (id: string, reason: string) => void
  onEscalate: (id: string, note: string) => void
}

export function ModerationReviewModal({
  report,
  open,
  onClose,
  onResolve,
  onDismiss,
  onEscalate,
}: ModerationReviewModalProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [adminNote, setAdminNote] = useState("")
  const [dismissReason, setDismissReason] = useState("")
  const [selectedAction, setSelectedAction] = useState<ModerationAction>("warn_user")
  const [showDismissForm, setShowDismissForm] = useState(false)
  const [showResolveForm, setShowResolveForm] = useState(false)
  const [showEscalateForm, setShowEscalateForm] = useState(false)

  if (!report) return null

  const status = statusConfig[report.status]
  const StatusIcon = status.icon
  const EntityIcon = entityIcons[report.entityType] || User
  const isOpen = report.status === "open"
  const isHighRisk = report.reason === "fraud" || report.reason === "harassment" || report.reason === "fake_profile"

  const handleResolve = () => {
    onResolve(report.id, selectedAction, adminNote)
    resetForms()
  }

  const handleDismiss = () => {
    if (!dismissReason.trim()) return
    onDismiss(report.id, dismissReason)
    resetForms()
  }

  const handleEscalate = () => {
    onEscalate(report.id, adminNote)
    resetForms()
  }

  const resetForms = () => {
    setAdminNote("")
    setDismissReason("")
    setSelectedAction("warn_user")
    setShowDismissForm(false)
    setShowResolveForm(false)
    setShowEscalateForm(false)
    setActiveTab("details")
  }

  const handleClose = () => {
    resetForms()
    onClose()
  }

  const EvidenceItem = ({ evidence }: { evidence: ReportEvidence }) => {
    const Icon = evidenceIcons[evidence.type] || FileText
    return (
      <div className="flex items-start gap-3 rounded-lg border p-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <Icon className="size-4 text-primary" />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{evidence.name}</span>
            <Badge variant="outline" className="text-[9px] capitalize">
              {evidence.type}
            </Badge>
          </div>
          <span className="text-[10px] text-muted-foreground">{evidence.description}</span>
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
              <Flag className="size-5 text-primary" />
            </div>
            <div className="flex flex-col gap-0.5">
              <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>
                Report Review
              </DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs">{report.id}</span>
                <Badge variant="secondary" className={`gap-1 text-[10px] ${status.color}`}>
                  <StatusIcon className="size-2.5" />
                  {status.label}
                </Badge>
                {isHighRisk && (
                  <Badge variant="outline" className="gap-1 border-destructive/30 bg-destructive/10 text-[10px] text-destructive">
                    <AlertTriangle className="size-2.5" />
                    High Risk
                  </Badge>
                )}
                {report.previousReports > 0 && (
                  <Badge variant="outline" className="gap-1 border-chart-3/30 bg-chart-3/10 text-[10px] text-chart-3">
                    <Repeat className="size-2.5" />
                    {report.previousReports} prior reports
                  </Badge>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col">
          <TabsList className="mx-6 w-fit">
            <TabsTrigger value="details" className="gap-1.5 text-xs">
              <Flag className="size-3" />
              Details
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-1.5 text-xs">
              <EntityIcon className="size-3" />
              Content
            </TabsTrigger>
            <TabsTrigger value="evidence" className="gap-1.5 text-xs">
              <FileText className="size-3" />
              Evidence ({report.evidence.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5 text-xs">
              <History className="size-3" />
              History
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] px-6 py-4">
            {/* Details Tab */}
            <TabsContent value="details" className="m-0 flex flex-col gap-4">
              <div>
                <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Report Information
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <InfoCard
                    icon={report.isAnonymous ? EyeOff : User}
                    label="Reporter"
                    value={report.reporter}
                  />
                  {report.reporterEmail && !report.isAnonymous && (
                    <InfoCard icon={Mail} label="Reporter Email" value={report.reporterEmail} />
                  )}
                  <InfoCard icon={EntityIcon} label="Entity Type" value={report.entityType} />
                  <InfoCard icon={AlertTriangle} label="Reason" value={report.reasonLabel} />
                  <InfoCard icon={Clock} label="Date Submitted" value={report.date} />
                  <InfoCard icon={Shield} label="Priority" value={report.priority} />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Description
                </h4>
                <p className="rounded-lg bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
                  {report.description}
                </p>
              </div>

              {/* High Risk Warning */}
              {isHighRisk && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-destructive">High-Risk Report</span>
                      <span className="text-xs text-muted-foreground">
                        This report involves {report.reasonLabel.toLowerCase()}. Immediate review and action recommended.
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Resolution Info */}
              {report.resolution && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/5 p-3">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-accent">Resolution</span>
                      <span className="text-xs text-muted-foreground">{report.resolution}</span>
                      {report.actionTaken && (
                        <Badge variant="outline" className="mt-1 w-fit text-[10px]">
                          Action: {actionLabels[report.actionTaken]}
                        </Badge>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Moderation Notes */}
              {report.moderationNotes.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Internal Admin Notes
                    </h4>
                    <div className="flex flex-col gap-2">
                      {report.moderationNotes.map((note, idx) => (
                        <div key={idx} className="flex items-start gap-2 rounded-lg bg-muted/50 p-2.5">
                          <MessageSquare className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="m-0 flex flex-col gap-4">
              <div>
                <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Reported Entity
                </h4>
                <div className="flex items-center gap-2 rounded-lg border p-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <EntityIcon className="size-4 text-primary" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{report.reportedEntity}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px] capitalize">
                        {report.entityType}
                      </Badge>
                      {report.reportedEntityId && (
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {report.reportedEntityId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {report.contentPreview && (
                <>
                  <Separator />
                  <div>
                    <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Content Preview
                    </h4>
                    <div className="rounded-lg border border-chart-3/20 bg-chart-3/5 p-3">
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {report.contentPreview}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {report.previousReports > 0 && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3 rounded-lg border border-chart-3/30 bg-chart-3/5 p-3">
                    <Repeat className="mt-0.5 size-4 shrink-0 text-chart-3" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-chart-3">Repeated Offender</span>
                      <span className="text-xs text-muted-foreground">
                        This entity has been reported {report.previousReports} time{report.previousReports > 1 ? "s" : ""} previously. Consider escalating.
                      </span>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Evidence Tab */}
            <TabsContent value="evidence" className="m-0 flex flex-col gap-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Submitted Evidence
              </h4>
              {report.evidence.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center">
                  <FileText className="size-8 text-muted-foreground/50" />
                  <p className="text-xs text-muted-foreground">No evidence submitted with this report.</p>
                </div>
              ) : (
                report.evidence.map((ev, idx) => (
                  <EvidenceItem key={idx} evidence={ev} />
                ))
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="m-0 flex flex-col gap-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Report Timeline
              </h4>
              <div className="relative flex flex-col gap-0 pl-4">
                {report.history.map((entry, idx) => (
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
        {isOpen && (
          <div className="border-t px-6 py-4">
            {!showDismissForm && !showResolveForm && !showEscalateForm && (
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
                    onClick={() => setShowEscalateForm(true)}
                    className="gap-1.5 text-xs"
                  >
                    <ArrowUpCircle className="size-3" />
                    Escalate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDismissForm(true)}
                    className="gap-1.5 text-xs"
                  >
                    <XCircle className="size-3" />
                    Dismiss
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowResolveForm(true)}
                    className="gap-1.5 text-xs"
                  >
                    <CheckCircle2 className="size-3" />
                    Resolve
                  </Button>
                </div>
              </div>
            )}

            {/* Resolve Form */}
            {showResolveForm && (
              <div className="flex flex-col gap-3">
                <div>
                  <Label className="text-xs font-semibold text-accent">
                    Select Action
                  </Label>
                  <Select
                    value={selectedAction}
                    onValueChange={(v) => setSelectedAction(v as ModerationAction)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remove_content">
                        <span className="flex items-center gap-2">
                          <Trash2 className="size-3" />
                          Remove Post / Review
                        </span>
                      </SelectItem>
                      <SelectItem value="warn_user">
                        <span className="flex items-center gap-2">
                          <AlertTriangle className="size-3" />
                          Warn User
                        </span>
                      </SelectItem>
                      <SelectItem value="suspend_account">
                        <span className="flex items-center gap-2">
                          <Ban className="size-3" />
                          Suspend / Ban Account
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="resolve-note" className="text-xs text-muted-foreground">
                    Resolution Note
                  </Label>
                  <Textarea
                    id="resolve-note"
                    placeholder="Describe the action taken..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="mt-1 h-16 resize-none text-xs"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowResolveForm(false)
                      setAdminNote("")
                    }}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleResolve}
                    className="gap-1.5 text-xs"
                  >
                    <CheckCircle2 className="size-3" />
                    Confirm Resolution
                  </Button>
                </div>
              </div>
            )}

            {/* Dismiss Form */}
            {showDismissForm && (
              <div className="flex flex-col gap-3">
                <div>
                  <Label htmlFor="dismiss-reason" className="text-xs font-semibold text-muted-foreground">
                    Dismissal Reason (required)
                  </Label>
                  <Textarea
                    id="dismiss-reason"
                    placeholder="Provide a clear reason for dismissal..."
                    value={dismissReason}
                    onChange={(e) => setDismissReason(e.target.value)}
                    className="mt-1 h-20 resize-none text-xs"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowDismissForm(false)
                      setDismissReason("")
                    }}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDismiss}
                    disabled={!dismissReason.trim()}
                    className="gap-1.5 text-xs"
                  >
                    <XCircle className="size-3" />
                    Confirm Dismiss
                  </Button>
                </div>
              </div>
            )}

            {/* Escalate Form */}
            {showEscalateForm && (
              <div className="flex flex-col gap-3">
                <div>
                  <Label htmlFor="escalate-note" className="text-xs font-semibold text-chart-3">
                    Escalation Note
                  </Label>
                  <Textarea
                    id="escalate-note"
                    placeholder="Describe why this report needs escalation..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="mt-1 h-20 resize-none border-chart-3/30 text-xs focus-visible:ring-chart-3"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowEscalateForm(false)
                      setAdminNote("")
                    }}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEscalate}
                    className="gap-1.5 border-chart-3/30 text-xs text-chart-3 hover:bg-chart-3/10"
                  >
                    <ArrowUpCircle className="size-3" />
                    Confirm Escalation
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
        <span className="text-xs font-medium capitalize">{value}</span>
      </div>
    </div>
  )
}
