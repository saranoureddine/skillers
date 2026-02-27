"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
import { toast } from "sonner"
import { notificationRules as initialRules, type NotificationRule } from "@/lib/mock-data"
import {
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  Clock,
  FileText,
  Pencil,
} from "lucide-react"

export function SettingsNotifications() {
  const [rules, setRules] = useState<NotificationRule[]>(initialRules)
  const [digestMode, setDigestMode] = useState("daily")
  const [digestEnabled, setDigestEnabled] = useState(true)
  const [templateDialog, setTemplateDialog] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState("")
  const [templateContent, setTemplateContent] = useState("")

  const toggleChannel = (id: string, channel: "email" | "push" | "sms" | "digest") => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, [channel]: !r[channel] } : r
      )
    )
  }

  const priorityColor: Record<string, string> = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-chart-3/10 text-chart-3 border-chart-3/20",
    low: "bg-muted text-muted-foreground",
  }

  const openTemplateEditor = (event: string) => {
    setSelectedEvent(event)
    setTemplateContent(`Hello {{user_name}},\n\nThis is a notification regarding: ${event}.\n\n{{event_details}}\n\nBest regards,\nSkillers Team`)
    setTemplateDialog(true)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Granular Alert Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-primary" />
            <div>
              <CardTitle className="text-sm">Granular Alert Rules</CardTitle>
              <CardDescription className="text-xs">
                Choose which events trigger email, push, or SMS notifications
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-0">
          {/* Header row */}
          <div className="mb-2 hidden items-center border-b pb-2 md:flex">
            <div className="flex-1">
              <span className="text-[10px] font-medium text-muted-foreground">Event</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex w-14 flex-col items-center">
                <Mail className="size-3 text-muted-foreground" />
                <span className="text-[9px] text-muted-foreground">Email</span>
              </div>
              <div className="flex w-14 flex-col items-center">
                <Smartphone className="size-3 text-muted-foreground" />
                <span className="text-[9px] text-muted-foreground">Push</span>
              </div>
              <div className="flex w-14 flex-col items-center">
                <MessageSquare className="size-3 text-muted-foreground" />
                <span className="text-[9px] text-muted-foreground">SMS</span>
              </div>
              <div className="flex w-14 flex-col items-center">
                <Clock className="size-3 text-muted-foreground" />
                <span className="text-[9px] text-muted-foreground">Digest</span>
              </div>
              <div className="w-16" />
            </div>
          </div>

          {rules.map((rule, i) => (
            <div key={rule.id}>
              <div className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:gap-0">
                <div className="flex flex-1 items-center gap-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium">{rule.event}</p>
                      <Badge variant="outline" className={`text-[8px] ${priorityColor[rule.priority]}`}>
                        {rule.priority}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{rule.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex w-14 justify-center">
                    <Switch
                      checked={rule.email}
                      onCheckedChange={() => toggleChannel(rule.id, "email")}
                      className="scale-75"
                    />
                  </div>
                  <div className="flex w-14 justify-center">
                    <Switch
                      checked={rule.push}
                      onCheckedChange={() => toggleChannel(rule.id, "push")}
                      className="scale-75"
                    />
                  </div>
                  <div className="flex w-14 justify-center">
                    <Switch
                      checked={rule.sms}
                      onCheckedChange={() => toggleChannel(rule.id, "sms")}
                      className="scale-75"
                    />
                  </div>
                  <div className="flex w-14 justify-center">
                    <Switch
                      checked={rule.digest}
                      onCheckedChange={() => toggleChannel(rule.id, "digest")}
                      className="scale-75"
                    />
                  </div>
                  <div className="flex w-16 justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => openTemplateEditor(rule.event)}
                    >
                      <Pencil className="size-3" />
                    </Button>
                  </div>
                </div>
              </div>
              {i < rules.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Digest Mode */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            <div>
              <CardTitle className="text-sm">Digest Mode</CardTitle>
              <CardDescription className="text-xs">
                Send summaries instead of immediate alerts for low-priority events
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium">Enable Digest Mode</p>
              <p className="text-[10px] text-muted-foreground">Bundle low-priority notifications into periodic summaries</p>
            </div>
            <Switch checked={digestEnabled} onCheckedChange={setDigestEnabled} />
          </div>
          {digestEnabled && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Digest Frequency</Label>
              <Select value={digestMode} onValueChange={setDigestMode}>
                <SelectTrigger className="max-w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Summary</SelectItem>
                  <SelectItem value="weekly">Weekly Summary</SelectItem>
                  <SelectItem value="biweekly">Bi-Weekly Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Editor Dialog */}
      <Dialog open={templateDialog} onOpenChange={setTemplateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <FileText className="size-4" />
              Edit Notification Template
            </DialogTitle>
            <DialogDescription className="text-xs">
              Customize the template for: {selectedEvent}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Template Content</Label>
              <Textarea
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
                rows={8}
                className="font-mono text-xs"
              />
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-[10px] font-medium text-muted-foreground mb-1">Available Variables:</p>
              <div className="flex flex-wrap gap-1.5">
                {["{{user_name}}", "{{event_details}}", "{{timestamp}}", "{{action_url}}"].map((v) => (
                  <Badge key={v} variant="outline" className="font-mono text-[9px]">{v}</Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setTemplateDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={() => {
              setTemplateDialog(false)
              toast.success("Template saved")
            }}>
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
