"use client"

import { useState, useMemo } from "react"
import { notifications as initialNotifications, type Notification, type NotificationType, type NotificationStatus, type NotificationTarget, users } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Bell,
  Plus,
  Send,
  Clock,
  FileEdit,
  Users as UsersIcon,
  BarChart2,
  Search,
  Info,
  AlertTriangle,
  ShieldAlert,
  Bot,
  Crown,
  Eye,
  Trash2,
  Pencil,
  ExternalLink,
  XCircle,
  CheckCircle,
  Link2,
  Calendar,
  Mail,
} from "lucide-react"
import { toast } from "sonner"

// ---- Color maps ----

const typeConfig: Record<NotificationType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  info: { label: "Info", icon: Info, color: "text-primary", bg: "bg-primary/10 text-primary" },
  warning: { label: "Warning", icon: AlertTriangle, color: "text-chart-3", bg: "bg-chart-3/10 text-chart-3" },
  important: { label: "Important", icon: ShieldAlert, color: "text-destructive", bg: "bg-destructive/10 text-destructive" },
}

const statusConfig: Record<NotificationStatus, { label: string; icon: React.ElementType; color: string }> = {
  sent: { label: "Sent", icon: CheckCircle, color: "bg-accent/20 text-accent" },
  scheduled: { label: "Scheduled", icon: Clock, color: "bg-chart-1/20 text-chart-1" },
  draft: { label: "Draft", icon: FileEdit, color: "bg-muted text-muted-foreground" },
  canceled: { label: "Canceled", icon: XCircle, color: "bg-destructive/10 text-destructive" },
}

const targetLabels: Record<NotificationTarget, string> = {
  all: "All Users",
  clients: "Clients Only",
  specialists: "Specialists Only",
  specific: "Specific Users",
}

// ---- Compose Dialog ----

function ComposeNotificationDialog({
  open,
  onClose,
  editNotif,
  onSave,
}: {
  open: boolean
  onClose: () => void
  editNotif: Notification | null
  onSave: (n: Notification) => void
}) {
  const isEdit = !!editNotif
  const [title, setTitle] = useState(editNotif?.title ?? "")
  const [body, setBody] = useState(editNotif?.body ?? "")
  const [type, setType] = useState<NotificationType>(editNotif?.type ?? "info")
  const [target, setTarget] = useState<NotificationTarget>(editNotif?.target ?? "all")
  const [specificUsers, setSpecificUsers] = useState<string[]>(editNotif?.specificUsers ?? [])
  const [scheduleLater, setScheduleLater] = useState(!!editNotif?.scheduledDate)
  const [scheduledDate, setScheduledDate] = useState(editNotif?.scheduledDate ?? "")
  const [actionLink, setActionLink] = useState(editNotif?.actionLink ?? "")
  const [actionLabel, setActionLabel] = useState(editNotif?.actionLabel ?? "")

  const handleSubmit = (asDraft: boolean) => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and message are required")
      return
    }
    const now = new Date().toISOString().slice(0, 16).replace("T", " ")
    const status: NotificationStatus = asDraft ? "draft" : scheduleLater ? "scheduled" : "sent"
    const n: Notification = {
      id: editNotif?.id ?? `NOT-${Date.now()}`,
      title: title.trim(),
      body: body.trim(),
      type,
      source: "admin",
      target,
      specificUsers: target === "specific" ? specificUsers : undefined,
      sentCount: status === "sent" ? (target === "specific" ? specificUsers.length : target === "clients" ? 18620 : target === "specialists" ? 5433 : 24053) : 0,
      readCount: 0,
      openRate: 0,
      date: status === "sent" ? "2026-02-20" : "",
      scheduledDate: scheduleLater ? scheduledDate : undefined,
      status,
      actionLink: actionLink.trim() || undefined,
      actionLabel: actionLabel.trim() || undefined,
      createdBy: "Admin",
      createdAt: now,
    }
    onSave(n)
    onClose()
    if (asDraft) toast.info("Notification saved as draft")
    else if (scheduleLater) toast.success(`Notification scheduled for ${scheduledDate}`)
    else toast.success("Notification sent successfully!")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>
            {isEdit ? "Edit Notification" : "Compose Notification"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Update and resend or reschedule this notification" : "Create and send a notification to your users"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold">Title</Label>
            <Input placeholder="Notification title..." value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          {/* Message */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold">Message</Label>
            <Textarea placeholder="Write your notification message..." value={body} onChange={(e) => setBody(e.target.value)} rows={3} />
          </div>

          {/* Type + Target Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold">Notification Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as NotificationType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="info"><span className="flex items-center gap-1.5"><Info className="size-3 text-primary" /> Info</span></SelectItem>
                  <SelectItem value="warning"><span className="flex items-center gap-1.5"><AlertTriangle className="size-3 text-chart-3" /> Warning</span></SelectItem>
                  <SelectItem value="important"><span className="flex items-center gap-1.5"><ShieldAlert className="size-3 text-destructive" /> Important</span></SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold">Target Audience</Label>
              <Select value={target} onValueChange={(v) => setTarget(v as NotificationTarget)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="clients">Clients Only</SelectItem>
                  <SelectItem value="specialists">Specialists Only</SelectItem>
                  <SelectItem value="specific">Specific Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Specific Users Selection */}
          {target === "specific" && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold">Select Users</Label>
              <div className="flex max-h-32 flex-col gap-1 overflow-y-auto rounded-lg border p-2">
                {users.map((u) => (
                  <label key={u.id} className="flex cursor-pointer items-center gap-2 rounded-md p-1.5 transition-colors hover:bg-muted/50">
                    <input
                      type="checkbox"
                      checked={specificUsers.includes(u.name)}
                      onChange={(e) => {
                        if (e.target.checked) setSpecificUsers([...specificUsers, u.name])
                        else setSpecificUsers(specificUsers.filter((n) => n !== u.name))
                      }}
                      className="size-3.5 rounded border-border"
                    />
                    <span className="text-xs">{u.name}</span>
                    <Badge variant="outline" className="ml-auto text-[9px]">{u.role}</Badge>
                  </label>
                ))}
              </div>
              {specificUsers.length > 0 && (
                <p className="text-[11px] text-muted-foreground">{specificUsers.length} user(s) selected</p>
              )}
            </div>
          )}

          <Separator />

          {/* Schedule */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <Label className="text-xs font-semibold">Schedule for later</Label>
              <p className="text-[11px] text-muted-foreground">Send at a specific date instead of now</p>
            </div>
            <Switch checked={scheduleLater} onCheckedChange={setScheduleLater} />
          </div>
          {scheduleLater && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold">Scheduled Date</Label>
              <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
            </div>
          )}

          <Separator />

          {/* Action Link */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold">Action Link (optional)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="/subscriptions" value={actionLink} onChange={(e) => setActionLink(e.target.value)} />
              <Input placeholder="View Details" value={actionLabel} onChange={(e) => setActionLabel(e.target.value)} />
            </div>
            <p className="text-[11px] text-muted-foreground">Add a link users can tap to take action</p>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => handleSubmit(true)}>
            <FileEdit className="mr-1 size-3" /> Save as Draft
          </Button>
          <Button onClick={() => handleSubmit(false)}>
            {scheduleLater ? <><Clock className="mr-1 size-3" /> Schedule</> : <><Send className="mr-1 size-3" /> Send Now</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---- Notification Detail Dialog ----

function NotificationDetailDialog({
  notif,
  open,
  onClose,
}: {
  notif: Notification | null
  open: boolean
  onClose: () => void
}) {
  if (!notif) return null
  const tCfg = typeConfig[notif.type]
  const sCfg = statusConfig[notif.status]
  const TypeIcon = tCfg.icon
  const StatusIcon = sCfg.icon
  const isAdmin = notif.source === "admin"

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {isAdmin ? <Crown className="size-4 text-chart-3" /> : <Bot className="size-4 text-muted-foreground" />}
            <Badge variant="secondary" className={`text-[10px] ${tCfg.bg}`}>
              <TypeIcon className="mr-0.5 size-2.5" /> {tCfg.label}
            </Badge>
            <Badge variant="secondary" className={`text-[10px] ${sCfg.color}`}>
              <StatusIcon className="mr-0.5 size-2.5" /> {sCfg.label}
            </Badge>
          </div>
          <DialogTitle className="pt-2" style={{ fontFamily: "var(--font-heading)" }}>{notif.title}</DialogTitle>
          <DialogDescription className="sr-only">Notification details</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-foreground/90">{notif.body}</p>

          {notif.actionLink && (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3">
              <Link2 className="size-4 text-primary" />
              <div>
                <p className="text-xs font-medium">{notif.actionLabel || "View Details"}</p>
                <p className="text-[11px] text-muted-foreground">{notif.actionLink}</p>
              </div>
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-[10px] text-muted-foreground">Target</p>
              <p className="text-xs font-medium">{targetLabels[notif.target]}</p>
              {notif.specificUsers && notif.specificUsers.length > 0 && (
                <p className="mt-0.5 text-[10px] text-muted-foreground">{notif.specificUsers.join(", ")}</p>
              )}
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-[10px] text-muted-foreground">Source</p>
              <p className="text-xs font-medium capitalize">{notif.source}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-[10px] text-muted-foreground">Sent To</p>
              <p className="text-xs font-medium">{notif.sentCount > 0 ? notif.sentCount.toLocaleString() : "--"}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-[10px] text-muted-foreground">Read</p>
              <p className="text-xs font-medium">{notif.readCount > 0 ? notif.readCount.toLocaleString() : "--"}</p>
            </div>
          </div>

          {notif.status === "sent" && notif.sentCount > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Open Rate</span>
                <span className="font-bold">{notif.openRate}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${notif.openRate}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground">
                {notif.readCount.toLocaleString()} of {notif.sentCount.toLocaleString()} recipients opened this notification
              </p>
            </div>
          )}

          {notif.scheduledDate && (
            <div className="flex items-center gap-2 rounded-lg border border-chart-1/30 bg-chart-1/5 p-3">
              <Calendar className="size-4 text-chart-1" />
              <div>
                <p className="text-xs font-medium">Scheduled for {notif.scheduledDate}</p>
                <p className="text-[10px] text-muted-foreground">Created {notif.createdAt}</p>
              </div>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground">
            Created by {notif.createdBy} on {notif.createdAt}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ---- Notification Row ----

function NotificationRow({
  notif,
  onView,
  onEdit,
  onDelete,
  onCancel,
}: {
  notif: Notification
  onView: () => void
  onEdit: () => void
  onDelete: () => void
  onCancel: () => void
}) {
  const tCfg = typeConfig[notif.type]
  const sCfg = statusConfig[notif.status]
  const TypeIcon = tCfg.icon
  const StatusIcon = sCfg.icon
  const isAdmin = notif.source === "admin"

  return (
    <TableRow className="cursor-pointer hover:bg-muted/30" onClick={onView}>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${isAdmin ? "bg-chart-3/10" : "bg-muted"}`}>
            {isAdmin ? <Crown className="size-3.5 text-chart-3" /> : <Bot className="size-3.5 text-muted-foreground" />}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium leading-tight">{notif.title}</span>
            <span className="max-w-[280px] truncate text-[11px] text-muted-foreground">{notif.body}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className={`gap-1 text-[10px] ${tCfg.bg}`}>
          <TypeIcon className="size-2.5" /> {tCfg.label}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-[10px]">
          <UsersIcon className="mr-0.5 size-2.5" /> {targetLabels[notif.target]}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className={`gap-1 text-[10px] ${sCfg.color}`}>
          <StatusIcon className="size-2.5" /> {sCfg.label}
        </Badge>
      </TableCell>
      <TableCell className="hidden text-xs tabular-nums md:table-cell">
        {notif.sentCount > 0 ? notif.sentCount.toLocaleString() : "--"}
      </TableCell>
      <TableCell className="hidden text-xs tabular-nums md:table-cell">
        {notif.readCount > 0 ? notif.readCount.toLocaleString() : "--"}
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        {notif.openRate > 0 ? (
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-accent" style={{ width: `${notif.openRate}%` }} />
            </div>
            <span className="text-xs tabular-nums">{notif.openRate}%</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">--</span>
        )}
      </TableCell>
      <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
        {notif.date || notif.scheduledDate || "--"}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="size-7" onClick={onView}>
            <Eye className="size-3.5" />
          </Button>
          {isAdmin && (notif.status === "draft" || notif.status === "scheduled") && (
            <Button variant="ghost" size="icon" className="size-7" onClick={onEdit}>
              <Pencil className="size-3.5" />
            </Button>
          )}
          {notif.status === "scheduled" && (
            <Button variant="ghost" size="icon" className="size-7 text-chart-3 hover:text-chart-3" onClick={onCancel}>
              <XCircle className="size-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

// ---- Main Page ----

export default function NotificationsPage() {
  const [allNotifs, setAllNotifs] = useState<Notification[]>(initialNotifications)
  const [showCompose, setShowCompose] = useState(false)
  const [editingNotif, setEditingNotif] = useState<Notification | null>(null)
  const [viewingNotif, setViewingNotif] = useState<Notification | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Notification | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Notification | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sourceFilter, setSourceFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("all")

  // Stats
  const adminNotifs = allNotifs.filter((n) => n.source === "admin")
  const systemNotifs = allNotifs.filter((n) => n.source === "system")
  const sentNotifs = allNotifs.filter((n) => n.status === "sent")
  const scheduledNotifs = allNotifs.filter((n) => n.status === "scheduled")
  const draftNotifs = allNotifs.filter((n) => n.status === "draft")
  const avgOpenRate = sentNotifs.length > 0 ? Math.round(sentNotifs.reduce((s, n) => s + n.openRate, 0) / sentNotifs.length) : 0
  const totalRead = sentNotifs.reduce((s, n) => s + n.readCount, 0)
  const totalSent = sentNotifs.reduce((s, n) => s + n.sentCount, 0)

  // Filter notifications
  const filtered = useMemo(() => {
    let list = activeTab === "admin" ? adminNotifs : activeTab === "system" ? systemNotifs : allNotifs
    if (statusFilter !== "all") list = list.filter((n) => n.status === statusFilter)
    if (sourceFilter !== "all") list = list.filter((n) => n.source === sourceFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q))
    }
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [allNotifs, adminNotifs, systemNotifs, activeTab, statusFilter, sourceFilter, search])

  const handleSave = (n: Notification) => {
    setAllNotifs((prev) => {
      const idx = prev.findIndex((x) => x.id === n.id)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = n
        return copy
      }
      return [n, ...prev]
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setAllNotifs((prev) => prev.filter((n) => n.id !== deleteTarget.id))
    setDeleteTarget(null)
    toast.success("Notification deleted")
  }

  const handleCancel = () => {
    if (!cancelTarget) return
    setAllNotifs((prev) => prev.map((n) => n.id === cancelTarget.id ? { ...n, status: "canceled" as NotificationStatus } : n))
    setCancelTarget(null)
    toast.success("Scheduled notification canceled")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage system alerts and send notifications to users
          </p>
        </div>
        <Button onClick={() => { setEditingNotif(null); setShowCompose(true) }}>
          <Plus className="mr-1 size-4" />
          New Notification
        </Button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-primary" />
              <p className="text-[11px] text-muted-foreground">Total</p>
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums">{allNotifs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Crown className="size-4 text-chart-3" />
              <p className="text-[11px] text-muted-foreground">Admin Sent</p>
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums">{adminNotifs.filter((n) => n.status === "sent").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bot className="size-4 text-muted-foreground" />
              <p className="text-[11px] text-muted-foreground">System</p>
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums">{systemNotifs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-chart-1" />
              <p className="text-[11px] text-muted-foreground">Scheduled</p>
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums">{scheduledNotifs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileEdit className="size-4 text-muted-foreground" />
              <p className="text-[11px] text-muted-foreground">Drafts</p>
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums">{draftNotifs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="size-4 text-accent" />
              <p className="text-[11px] text-muted-foreground">Avg Open Rate</p>
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums">{avgOpenRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Summary */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Delivery Overview</CardTitle>
            <CardDescription className="text-xs">Read and open rates across all sent notifications</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Sent</span>
                <span className="text-2xl font-bold tabular-nums">{totalSent.toLocaleString()}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Read</span>
                <span className="text-2xl font-bold tabular-nums text-accent">{totalRead.toLocaleString()}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Overall Read Rate</span>
                <span className="text-2xl font-bold tabular-nums text-primary">{totalSent > 0 ? Math.round((totalRead / totalSent) * 100) : 0}%</span>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {sentNotifs.filter((n) => n.sentCount > 0).map((n) => (
                <div key={n.id} className="flex items-center gap-3">
                  <span className="w-40 truncate text-xs">{n.title}</span>
                  <div className="flex flex-1 items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${n.openRate}%` }} />
                    </div>
                    <span className="w-10 text-right text-xs font-medium tabular-nums">{n.openRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Scheduled */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Scheduled Queue</CardTitle>
            <CardDescription className="text-xs">{scheduledNotifs.length} upcoming notifications</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {scheduledNotifs.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">No scheduled notifications</p>
            ) : (
              <div className="flex flex-col gap-3">
                {scheduledNotifs.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 rounded-lg border p-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-chart-1/10">
                      <Clock className="size-3.5 text-chart-1" />
                    </div>
                    <div className="flex flex-1 flex-col gap-0.5">
                      <span className="text-xs font-medium">{n.title}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {n.scheduledDate} &middot; {targetLabels[n.target]}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:text-destructive"
                      onClick={() => setCancelTarget(n)}
                    >
                      <XCircle className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs + Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <TabsList>
            <TabsTrigger value="all">
              All ({allNotifs.length})
            </TabsTrigger>
            <TabsTrigger value="admin">
              Admin ({adminNotifs.length})
            </TabsTrigger>
            <TabsTrigger value="system">
              System ({systemNotifs.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search notifications..." className="h-8 w-56 pl-8 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[250px]">Notification</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Sent</TableHead>
                    <TableHead className="hidden md:table-cell">Read</TableHead>
                    <TableHead className="hidden lg:table-cell">Open Rate</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-12 text-center text-sm text-muted-foreground">
                        No notifications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((notif) => (
                      <NotificationRow
                        key={notif.id}
                        notif={notif}
                        onView={() => setViewingNotif(notif)}
                        onEdit={() => { setEditingNotif(notif); setShowCompose(true) }}
                        onDelete={() => setDeleteTarget(notif)}
                        onCancel={() => setCancelTarget(notif)}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compose / Edit Dialog */}
      {showCompose && (
        <ComposeNotificationDialog
          open={showCompose}
          onClose={() => { setShowCompose(false); setEditingNotif(null) }}
          editNotif={editingNotif}
          onSave={handleSave}
        />
      )}

      {/* Detail Dialog */}
      <NotificationDetailDialog
        notif={viewingNotif}
        open={!!viewingNotif}
        onClose={() => setViewingNotif(null)}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.title}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation */}
      <AlertDialog open={!!cancelTarget} onOpenChange={() => setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Scheduled Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel &ldquo;{cancelTarget?.title}&rdquo; scheduled for {cancelTarget?.scheduledDate}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Scheduled</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-chart-3 text-chart-3-foreground hover:bg-chart-3/90">
              Cancel Notification
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
