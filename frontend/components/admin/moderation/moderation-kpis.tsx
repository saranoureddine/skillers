"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  Flag,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Timer,
  ShieldAlert,
} from "lucide-react"
import type { Report } from "@/lib/mock-data"

interface ModerationKPIsProps {
  reports: Report[]
}

export function ModerationKPIs({ reports }: ModerationKPIsProps) {
  const open = reports.filter((r) => r.status === "open").length
  const resolved = reports.filter((r) => r.status === "resolved").length
  const dismissed = reports.filter((r) => r.status === "dismissed").length
  const highRisk = reports.filter(
    (r) => r.reason === "fraud" || r.reason === "harassment" || r.reason === "fake_profile"
  ).length

  const closedReports = reports.filter(
    (r) => r.status === "resolved" || r.status === "dismissed"
  )
  const avgDays = closedReports.length > 0 ? "1.8d" : "--"

  const kpis = [
    {
      label: "Open Reports",
      value: open,
      icon: AlertTriangle,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      label: "Resolved",
      value: resolved,
      icon: CheckCircle2,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Dismissed",
      value: dismissed,
      icon: XCircle,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
    {
      label: "High-Risk",
      value: highRisk,
      icon: ShieldAlert,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      label: "Avg. Resolution",
      value: avgDays,
      icon: Timer,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {kpis.map((kpi) => (
        <Card key={kpi.label}>
          <CardContent className="flex items-center gap-3 p-4">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${kpi.bgColor}`}
            >
              <kpi.icon className={`size-5 ${kpi.color}`} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-medium text-muted-foreground">
                {kpi.label}
              </span>
              <span
                className="text-xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {kpi.value}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
