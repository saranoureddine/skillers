"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { systemHealth, backupHistory } from "@/lib/mock-data"
import {
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Clock,
  Server,
  Database,
  Download,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
  Zap,
} from "lucide-react"

export function SettingsSystem() {
  const [autoBackup, setAutoBackup] = useState(true)
  const [backupFreq, setBackupFreq] = useState("daily")
  const [backupRetention, setBackupRetention] = useState("30")

  const healthIndicator = (value: number, warning: number, critical: number) => {
    if (value >= critical) return "text-destructive"
    if (value >= warning) return "text-chart-3"
    return "text-accent"
  }

  const progressColor = (value: number, warning: number, critical: number) => {
    if (value >= critical) return "bg-destructive"
    if (value >= warning) return "bg-chart-3"
    return "bg-accent"
  }

  const versionChanges = [
    { version: "2.4.1", date: "2026-02-18", type: "patch", changes: ["Fixed push notification delays", "Improved search indexing performance"] },
    { version: "2.4.0", date: "2026-02-10", type: "minor", changes: ["Added video consultation feature", "New analytics drill-down"] },
    { version: "2.3.0", date: "2026-01-25", type: "minor", changes: ["In-app wallet beta launch", "AI-powered matching (60% rollout)"] },
  ]

  const predictions = [
    { metric: "CPU Usage", current: systemHealth.cpuUsage, predicted: 68, trend: "increasing", risk: "medium" as const, timeframe: "Next 7 days" },
    { metric: "Memory Usage", current: systemHealth.memoryUsage, predicted: 78, trend: "increasing", risk: "high" as const, timeframe: "Next 7 days" },
    { metric: "Disk Usage", current: systemHealth.diskUsage, predicted: 58, trend: "stable", risk: "low" as const, timeframe: "Next 30 days" },
    { metric: "API Latency", current: systemHealth.apiLatency, predicted: 52, trend: "increasing", risk: "low" as const, timeframe: "Next 7 days" },
  ]

  const riskColor: Record<string, string> = {
    low: "bg-accent/10 text-accent border-accent/20",
    medium: "bg-chart-3/10 text-chart-3 border-chart-3/20",
    high: "bg-destructive/10 text-destructive border-destructive/20",
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Live Metrics */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            <div>
              <CardTitle className="text-sm">Live Metrics</CardTitle>
              <CardDescription className="text-xs">
                Current system performance and resource usage
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="flex flex-col gap-2 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Clock className="size-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Uptime</span>
              </div>
              <p className={`text-lg font-bold ${healthIndicator(100 - systemHealth.uptime, 1, 5)}`}>
                {systemHealth.uptime}%
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Zap className="size-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">API Latency</span>
              </div>
              <p className={`text-lg font-bold ${healthIndicator(systemHealth.apiLatency, 100, 300)}`}>
                {systemHealth.apiLatency}ms
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Wifi className="size-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Active Sessions</span>
              </div>
              <p className="text-lg font-bold">{systemHealth.activeSessions.toLocaleString()}</p>
            </div>
            <div className="flex flex-col gap-2 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Error Rate</span>
              </div>
              <p className={`text-lg font-bold ${healthIndicator(systemHealth.errorRate, 1, 5)}`}>
                {systemHealth.errorRate}%
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="flex flex-col gap-2 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="size-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">CPU</span>
                </div>
                <span className={`text-xs font-bold ${healthIndicator(systemHealth.cpuUsage, 70, 90)}`}>
                  {systemHealth.cpuUsage}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${progressColor(systemHealth.cpuUsage, 70, 90)}`}
                  style={{ width: `${systemHealth.cpuUsage}%` }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="size-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Memory</span>
                </div>
                <span className={`text-xs font-bold ${healthIndicator(systemHealth.memoryUsage, 70, 90)}`}>
                  {systemHealth.memoryUsage}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${progressColor(systemHealth.memoryUsage, 70, 90)}`}
                  style={{ width: `${systemHealth.memoryUsage}%` }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="size-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Disk</span>
                </div>
                <span className={`text-xs font-bold ${healthIndicator(systemHealth.diskUsage, 70, 90)}`}>
                  {systemHealth.diskUsage}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${progressColor(systemHealth.diskUsage, 70, 90)}`}
                  style={{ width: `${systemHealth.diskUsage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Service Status */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium">Service Status</p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {systemHealth.services.map((service) => (
                <div key={service.name} className="flex items-center gap-2 rounded-lg border p-2.5">
                  {service.status === "healthy" ? (
                    <CheckCircle2 className="size-3.5 shrink-0 text-accent" />
                  ) : (
                    <AlertTriangle className="size-3.5 shrink-0 text-chart-3" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-medium">{service.name}</p>
                    <p className="text-[9px] text-muted-foreground">{service.responseTime}ms</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predictive Health Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            <div>
              <CardTitle className="text-sm">Predictive Health Alerts</CardTitle>
              <CardDescription className="text-xs">
                Forecasted system performance based on historical data
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {predictions.map((pred) => (
            <div key={pred.metric} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium">{pred.metric}</p>
                  <Badge variant="outline" className={`text-[8px] ${riskColor[pred.risk]}`}>
                    {pred.risk} risk
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">{pred.timeframe}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    Current: <span className="font-medium text-foreground">{pred.current}{pred.metric === "API Latency" ? "ms" : "%"}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Predicted: <span className={`font-medium ${pred.predicted > pred.current ? "text-chart-3" : "text-accent"}`}>
                      {pred.predicted}{pred.metric === "API Latency" ? "ms" : "%"}
                    </span>
                  </p>
                </div>
                {pred.trend === "increasing" ? (
                  <ArrowUpRight className="size-4 text-chart-3" />
                ) : (
                  <div className="size-4 flex items-center justify-center">
                    <div className="h-0.5 w-3 bg-muted-foreground rounded" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Backup & Recovery */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="size-4 text-primary" />
              <div>
                <CardTitle className="text-sm">Backup & Recovery</CardTitle>
                <CardDescription className="text-xs">
                  Manage automated backups and restore options
                </CardDescription>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => toast.success("Manual backup initiated")}>
              <Download className="mr-1.5 size-3" />
              Backup Now
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium">Automated Backups</p>
              <p className="text-[10px] text-muted-foreground">Automatically backup data on a schedule</p>
            </div>
            <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
          </div>
          {autoBackup && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Backup Frequency</Label>
                <Select value={backupFreq} onValueChange={setBackupFreq}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Every Hour</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Retention (days)</Label>
                <Select value={backupRetention} onValueChange={setBackupRetention}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Separator />

          <p className="text-xs font-medium">Recent Backups</p>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Size</TableHead>
                  <TableHead className="hidden text-xs md:table-cell">Duration</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {backupHistory.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell className="text-xs">{backup.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px]">{backup.type}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">{backup.size}</TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground md:table-cell">{backup.duration}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-[9px] ${
                          backup.status === "completed"
                            ? "bg-accent/10 text-accent"
                            : backup.status === "failed"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-chart-3/10 text-chart-3"
                        }`}
                      >
                        {backup.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {backup.status === "completed" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => toast.info(`Restoring backup from ${backup.date}...`)}
                        >
                          <RotateCcw className="size-3" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
                </Table>
          </div>
        </CardContent>
      </Card>

      {/* Version & Changelog */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="size-4 text-primary" />
            <div>
              <CardTitle className="text-sm">Version & Changelog</CardTitle>
              <CardDescription className="text-xs">
                Platform and API version history with recent changes
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "Platform Version", value: "2.4.1" },
              { label: "API Version", value: "v3" },
              { label: "Database", value: "PostgreSQL 16" },
              { label: "Region", value: "me-south-1" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-muted/50 p-2.5">
                <span className="text-[10px] text-muted-foreground">{item.label}</span>
                <p className="text-xs font-medium">{item.value}</p>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            {versionChanges.map((ver, i) => (
              <div key={ver.version} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`size-2.5 rounded-full ${i === 0 ? "bg-primary" : "bg-muted-foreground/30"}`} />
                  {i < versionChanges.length - 1 && <div className="w-px flex-1 bg-border" />}
                </div>
                <div className="flex-1 pb-3">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium">v{ver.version}</p>
                    <Badge
                      variant="outline"
                      className={`text-[8px] ${
                        ver.type === "patch" ? "bg-muted" : "bg-primary/10 text-primary"
                      }`}
                    >
                      {ver.type}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{ver.date}</span>
                  </div>
                  <ul className="mt-1 flex flex-col gap-0.5">
                    {ver.changes.map((change) => (
                      <li key={change} className="text-[10px] text-muted-foreground">
                        - {change}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
