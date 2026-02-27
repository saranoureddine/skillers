"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
import { featureToggles as initialToggles, type FeatureToggle } from "@/lib/mock-data"
import {
  Settings,
  Globe,
  Calendar,
  FlaskConical,
  HelpCircle,
  Wrench,
  SlidersHorizontal,
} from "lucide-react"

export function SettingsGeneral() {
  const [appName, setAppName] = useState("Skillers")
  const [supportEmail, setSupportEmail] = useState("support@skillers.app")
  const [defaultLang, setDefaultLang] = useState("en")
  const [timezone, setTimezone] = useState("Asia/Beirut")
  const [maxFileSize, setMaxFileSize] = useState("10")
  const [maintenance, setMaintenance] = useState(false)
  const [maintenanceStart, setMaintenanceStart] = useState("2026-02-25T02:00")
  const [maintenanceEnd, setMaintenanceEnd] = useState("2026-02-25T05:00")
  const [maintenanceNotify, setMaintenanceNotify] = useState(true)
  const [scheduleDialog, setScheduleDialog] = useState(false)
  const [features, setFeatures] = useState<FeatureToggle[]>(initialToggles)

  const toggleFeature = (id: string) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    )
    const feature = features.find((f) => f.id === id)
    toast.success(`${feature?.name} ${feature?.enabled ? "disabled" : "enabled"}`)
  }

  const categoryColor: Record<string, string> = {
    experimental: "bg-chart-5/15 text-chart-5 border-chart-5/30",
    beta: "bg-chart-3/15 text-chart-3 border-chart-3/30",
    stable: "bg-accent/15 text-accent border-accent/30",
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Core Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="size-4 text-primary" />
            <CardTitle className="text-sm">Core Configuration</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Platform name, email, and upload limits
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">App Name</Label>
              <Input value={appName} onChange={(e) => setAppName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Support Email</Label>
              <Input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Max Upload Size (MB)</Label>
            <Input
              type="number"
              value={maxFileSize}
              onChange={(e) => setMaxFileSize(e.target.value)}
              className="max-w-[200px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Language & Region */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-primary" />
            <CardTitle className="text-sm">Language & Region</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Multi-language support with automatic region detection
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Default Language</Label>
              <Select value={defaultLang} onValueChange={setDefaultLang}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Beirut">Asia/Beirut (GMT+2)</SelectItem>
                  <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                  <SelectItem value="Asia/Dubai">Asia/Dubai (GMT+4)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
            <Globe className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Auto region detection is enabled. Users will be presented with the language closest to their browser locale.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Mode */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wrench className="size-4 text-primary" />
            <CardTitle className="text-sm">Maintenance Mode</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Schedule downtime and notify users in advance
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium">Enable Maintenance Mode</p>
              <p className="text-[10px] text-muted-foreground">Disable access for all non-admin users</p>
            </div>
            <Switch checked={maintenance} onCheckedChange={setMaintenance} />
          </div>
          {maintenance && (
            <div className="rounded-lg border border-chart-3/30 bg-chart-3/5 p-3">
              <div className="flex items-center gap-2">
                <div className="size-2 animate-pulse rounded-full bg-chart-3" />
                <span className="text-xs font-medium text-chart-3">Maintenance mode is active</span>
              </div>
            </div>
          )}
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium">Scheduled Maintenance</p>
              <p className="text-[10px] text-muted-foreground">Set a future maintenance window</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setScheduleDialog(true)}>
              <Calendar className="mr-1.5 size-3" />
              Schedule
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium">Notify Users Before Maintenance</p>
              <p className="text-[10px] text-muted-foreground">Send notification 24h before scheduled downtime</p>
            </div>
            <Switch checked={maintenanceNotify} onCheckedChange={setMaintenanceNotify} />
          </div>
        </CardContent>
      </Card>

      {/* Feature Toggles */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FlaskConical className="size-4 text-primary" />
            <CardTitle className="text-sm">Feature Toggles / A/B Testing</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Enable or disable experimental features without deploying new code
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <TooltipProvider>
            {features.map((feature) => (
              <div key={feature.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium">{feature.name}</p>
                    <Badge variant="outline" className={`text-[9px] ${categoryColor[feature.category]}`}>
                      {feature.category}
                    </Badge>
                    {feature.rollout > 0 && feature.rollout < 100 && (
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-1">
                            <SlidersHorizontal className="size-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">{feature.rollout}%</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Rollout percentage: {feature.rollout}% of users</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{feature.description}</p>
                  {feature.enabled && feature.rollout > 0 && (
                    <Progress value={feature.rollout} className="mt-1 h-1" />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="size-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Last modified: {feature.lastModified} by {feature.modifiedBy}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Switch checked={feature.enabled} onCheckedChange={() => toggleFeature(feature.id)} />
                </div>
              </div>
            ))}
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Schedule Maintenance Dialog */}
      <Dialog open={scheduleDialog} onOpenChange={setScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">Schedule Maintenance Window</DialogTitle>
            <DialogDescription className="text-xs">
              Set a start and end time for the maintenance window. Users will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Start Time</Label>
              <Input
                type="datetime-local"
                value={maintenanceStart}
                onChange={(e) => setMaintenanceStart(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">End Time</Label>
              <Input
                type="datetime-local"
                value={maintenanceEnd}
                onChange={(e) => setMaintenanceEnd(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setScheduleDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={() => {
              setScheduleDialog(false)
              toast.success("Maintenance window scheduled")
            }}>
              Confirm Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
