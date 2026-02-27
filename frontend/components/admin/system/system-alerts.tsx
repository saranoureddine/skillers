"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Cpu,
  HardDrive,
  Activity,
  AlertTriangle,
  Clock,
  Zap,
} from "lucide-react"

interface ThresholdAlert {
  id: string
  metric: string
  icon: React.ElementType
  warningThreshold: number
  criticalThreshold: number
  currentValue: number
  unit: string
  email: boolean
  sms: boolean
  push: boolean
  enabled: boolean
}

const initialAlerts: ThresholdAlert[] = [
  { id: "TH-001", metric: "CPU Usage", icon: Cpu, warningThreshold: 70, criticalThreshold: 90, currentValue: 42, unit: "%", email: true, sms: false, push: true, enabled: true },
  { id: "TH-002", metric: "Memory Usage", icon: HardDrive, warningThreshold: 75, criticalThreshold: 90, currentValue: 67, unit: "%", email: true, sms: false, push: true, enabled: true },
  { id: "TH-003", metric: "Disk Usage", icon: HardDrive, warningThreshold: 80, criticalThreshold: 95, currentValue: 54, unit: "%", email: true, sms: true, push: true, enabled: true },
  { id: "TH-004", metric: "API Latency", icon: Clock, warningThreshold: 80, criticalThreshold: 150, currentValue: 45, unit: "ms", email: true, sms: false, push: true, enabled: true },
  { id: "TH-005", metric: "Error Rate", icon: AlertTriangle, warningThreshold: 0.5, criticalThreshold: 1.0, currentValue: 0.3, unit: "%", email: true, sms: true, push: true, enabled: true },
  { id: "TH-006", metric: "Response Time", icon: Zap, warningThreshold: 200, criticalThreshold: 500, currentValue: 120, unit: "ms", email: true, sms: false, push: false, enabled: false },
]

function getStatus(current: number, warning: number, critical: number): "normal" | "warning" | "critical" {
  if (current >= critical) return "critical"
  if (current >= warning) return "warning"
  return "normal"
}

const statusColors = {
  normal: { bg: "bg-accent/10", text: "text-accent", label: "Normal" },
  warning: { bg: "bg-chart-3/10", text: "text-chart-3", label: "Warning" },
  critical: { bg: "bg-destructive/10", text: "text-destructive", label: "Critical" },
}

export function SystemAlerts() {
  const [alerts, setAlerts] = useState(initialAlerts)

  const toggleEnabled = (id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, enabled: !a.enabled } : a))
  }

  const toggleChannel = (id: string, channel: "email" | "sms" | "push") => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, [channel]: !a[channel] } : a))
  }

  const updateThreshold = (id: string, field: "warningThreshold" | "criticalThreshold", value: string) => {
    const num = parseFloat(value)
    if (isNaN(num)) return
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, [field]: num } : a))
  }

  const enabledCount = alerts.filter((a) => a.enabled).length
  const warningCount = alerts.filter((a) => a.enabled && getStatus(a.currentValue, a.warningThreshold, a.criticalThreshold) === "warning").length
  const criticalCount = alerts.filter((a) => a.enabled && getStatus(a.currentValue, a.warningThreshold, a.criticalThreshold) === "critical").length

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <Bell className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Alerts</p>
              <p className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>{enabledCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-chart-3/10">
              <AlertTriangle className="size-4 text-chart-3" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">In Warning</p>
              <p className="text-lg font-bold text-chart-3" style={{ fontFamily: "var(--font-heading)" }}>{warningCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="size-4 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">In Critical</p>
              <p className="text-lg font-bold text-destructive" style={{ fontFamily: "var(--font-heading)" }}>{criticalCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Threshold Cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {alerts.map((alert) => {
          const MetricIcon = alert.icon
          const status = getStatus(alert.currentValue, alert.warningThreshold, alert.criticalThreshold)
          const statusConf = statusColors[status]
          const progressPct = Math.min((alert.currentValue / alert.criticalThreshold) * 100, 100)

          return (
            <Card key={alert.id} className={`transition-all ${!alert.enabled ? "opacity-50" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex size-8 items-center justify-center rounded-md ${statusConf.bg}`}>
                      <MetricIcon className={`size-4 ${statusConf.text}`} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{alert.metric}</p>
                      <Badge variant="secondary" className={`mt-0.5 text-[9px] ${statusConf.bg} ${statusConf.text}`}>
                        {statusConf.label}
                      </Badge>
                    </div>
                  </div>
                  <Switch checked={alert.enabled} onCheckedChange={() => toggleEnabled(alert.id)} className="scale-75" />
                </div>

                {/* Current value + bar */}
                <div className="mt-3">
                  <div className="flex items-baseline justify-between">
                    <p className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                      {alert.currentValue}{alert.unit}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      of {alert.criticalThreshold}{alert.unit} critical
                    </p>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${status === "critical" ? "bg-destructive" : status === "warning" ? "bg-chart-3" : "bg-accent"}`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[9px] text-muted-foreground">
                    <span>0</span>
                    <span className="text-chart-3">Warning: {alert.warningThreshold}{alert.unit}</span>
                    <span className="text-destructive">Critical: {alert.criticalThreshold}{alert.unit}</span>
                  </div>
                </div>

                {/* Thresholds */}
                {alert.enabled && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[9px] text-muted-foreground">Warning Threshold</Label>
                      <Input
                        type="number"
                        value={alert.warningThreshold}
                        onChange={(e) => updateThreshold(alert.id, "warningThreshold", e.target.value)}
                        className="mt-0.5 h-7 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[9px] text-muted-foreground">Critical Threshold</Label>
                      <Input
                        type="number"
                        value={alert.criticalThreshold}
                        onChange={(e) => updateThreshold(alert.id, "criticalThreshold", e.target.value)}
                        className="mt-0.5 h-7 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Notification channels */}
                {alert.enabled && (
                  <div className="mt-3 flex items-center gap-3 border-t pt-3">
                    <span className="text-[9px] text-muted-foreground">Notify via:</span>
                    <button
                      onClick={() => toggleChannel(alert.id, "email")}
                      className={`flex items-center gap-1 rounded-md px-2 py-1 text-[9px] transition-colors ${alert.email ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                    >
                      <Mail className="size-2.5" />
                      Email
                    </button>
                    <button
                      onClick={() => toggleChannel(alert.id, "sms")}
                      className={`flex items-center gap-1 rounded-md px-2 py-1 text-[9px] transition-colors ${alert.sms ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                    >
                      <MessageSquare className="size-2.5" />
                      SMS
                    </button>
                    <button
                      onClick={() => toggleChannel(alert.id, "push")}
                      className={`flex items-center gap-1 rounded-md px-2 py-1 text-[9px] transition-colors ${alert.push ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                    >
                      <Smartphone className="size-2.5" />
                      Push
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
