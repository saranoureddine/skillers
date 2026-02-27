"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Timer,
} from "lucide-react"
import type { VerificationRequest } from "@/lib/mock-data"

interface VerificationKPIsProps {
  requests: VerificationRequest[]
}

export function VerificationKPIs({ requests }: VerificationKPIsProps) {
  const total = requests.length
  const pending = requests.filter((r) => r.status === "pending").length
  const approved = requests.filter((r) => r.status === "approved").length
  const rejected = requests.filter((r) => r.status === "rejected").length

  const reviewTimes = requests
    .filter((r) => r.avgReviewTime)
    .map((r) => {
      const match = r.avgReviewTime!.match(/(\d+)h\s*(\d+)m/)
      if (match) return parseInt(match[1]) * 60 + parseInt(match[2])
      return 0
    })
    .filter((t) => t > 0)
  const avgMinutes = reviewTimes.length > 0 ? Math.round(reviewTimes.reduce((a, b) => a + b, 0) / reviewTimes.length) : 0
  const avgHours = Math.floor(avgMinutes / 60)
  const avgMins = avgMinutes % 60

  const kpis = [
    {
      label: "Total Requests",
      value: total,
      icon: ShieldCheck,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Pending Reviews",
      value: pending,
      icon: Clock,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      label: "Approved",
      value: approved,
      icon: CheckCircle2,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Rejected",
      value: rejected,
      icon: XCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      label: "Avg. Review Time",
      value: `${avgHours}h ${avgMins}m`,
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
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${kpi.bgColor}`}>
              <kpi.icon className={`size-5 ${kpi.color}`} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-medium text-muted-foreground">{kpi.label}</span>
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
