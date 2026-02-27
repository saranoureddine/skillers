"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Clock,
  Activity,
  AlertTriangle,
  Wifi,
  Cpu,
  HardDrive,
  Network,
} from "lucide-react"
import { systemHealth } from "@/lib/mock-data"

interface MetricCardProps {
  label: string
  value: string
  icon: React.ElementType
  severity: "green" | "yellow" | "red"
  subtext?: string
  bar?: { value: number; max: number }
}

function severityColor(s: "green" | "yellow" | "red") {
  if (s === "red") return { text: "text-destructive", bg: "bg-destructive/10", bar: "bg-destructive" }
  if (s === "yellow") return { text: "text-chart-3", bg: "bg-chart-3/10", bar: "bg-chart-3" }
  return { text: "text-accent", bg: "bg-accent/10", bar: "bg-accent" }
}

function getSeverity(metric: string, value: number): "green" | "yellow" | "red" {
  if (metric === "latency") return value > 100 ? "red" : value > 60 ? "yellow" : "green"
  if (metric === "uptime") return value < 99.5 ? "red" : value < 99.9 ? "yellow" : "green"
  if (metric === "errorRate") return value > 1 ? "red" : value > 0.5 ? "yellow" : "green"
  if (metric === "cpu" || metric === "memory" || metric === "disk") return value > 80 ? "red" : value > 60 ? "yellow" : "green"
  return "green"
}

function MetricCard({ label, value, icon: Icon, severity, subtext, bar }: MetricCardProps) {
  const c = severityColor(severity)
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="overflow-hidden transition-colors hover:border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className={`flex size-7 items-center justify-center rounded-md ${c.bg}`}>
                  <Icon className={`size-3.5 ${c.text}`} />
                </div>
                <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
              </div>
              <p className="mt-2 text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>{value}</p>
              {bar && (
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full ${c.bar} transition-all`} style={{ width: `${Math.min(bar.value, bar.max) / bar.max * 100}%` }} />
                </div>
              )}
              {subtext && <p className="mt-1 text-[10px] text-muted-foreground">{subtext}</p>}
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{label}: {value}</p>
          <p className="text-[10px] text-muted-foreground">
            Status: {severity === "green" ? "Healthy" : severity === "yellow" ? "Warning" : "Critical"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function SystemKPIs() {
  const h = systemHealth
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
      <MetricCard label="API Latency" value={`${h.apiLatency}ms`} icon={Clock} severity={getSeverity("latency", h.apiLatency)} subtext="p95 response" />
      <MetricCard label="Uptime" value={`${h.uptime}%`} icon={Activity} severity={getSeverity("uptime", h.uptime)} subtext="Last 30 days" />
      <MetricCard label="Error Rate" value={`${h.errorRate}%`} icon={AlertTriangle} severity={getSeverity("errorRate", h.errorRate)} subtext="Last hour" />
      <MetricCard label="Sessions" value={h.activeSessions.toLocaleString()} icon={Wifi} severity="green" subtext="Active now" />
      <MetricCard label="CPU" value={`${h.cpuUsage}%`} icon={Cpu} severity={getSeverity("cpu", h.cpuUsage)} bar={{ value: h.cpuUsage, max: 100 }} />
      <MetricCard label="Memory" value={`${h.memoryUsage}%`} icon={HardDrive} severity={getSeverity("memory", h.memoryUsage)} bar={{ value: h.memoryUsage, max: 100 }} />
      <MetricCard label="Disk I/O" value={`${h.diskIO}%`} icon={HardDrive} severity={getSeverity("disk", h.diskIO)} bar={{ value: h.diskIO, max: 100 }} />
      <MetricCard label="Network" value={`${h.networkIn}/${h.networkOut}`} icon={Network} severity="green" subtext="In / Out MB/s" />
    </div>
  )
}
