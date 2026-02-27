"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  Users,
  UserPlus,
  CreditCard,
  DollarSign,
  CalendarCheck,
  Activity,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { analyticsKPIs } from "@/lib/mock-data"
import type { LucideIcon } from "lucide-react"

interface KPI {
  label: string
  value: string
  change: number
  icon: LucideIcon
  color: string
  bgColor: string
}

export function AnalyticsKPIs() {
  const k = analyticsKPIs

  const kpis: KPI[] = [
    {
      label: "Total Users",
      value: k.totalUsers.value.toLocaleString(),
      change: k.totalUsers.change,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "New Users (Month)",
      value: k.newUsersMonth.value.toLocaleString(),
      change: k.newUsersMonth.change,
      icon: UserPlus,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Active Subscriptions",
      value: k.activeSubscriptions.value.toLocaleString(),
      change: k.activeSubscriptions.change,
      icon: CreditCard,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
    {
      label: "Monthly Revenue",
      value: `$${k.monthlyRevenue.value.toLocaleString()}`,
      change: k.monthlyRevenue.change,
      icon: DollarSign,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Completed Appts",
      value: k.completedAppointments.value.toLocaleString(),
      change: k.completedAppointments.change,
      icon: CalendarCheck,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Avg. Engagement",
      value: k.avgEngagement.value.toFixed(1),
      change: k.avgEngagement.change,
      icon: Activity,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi) => {
        const isPositive = kpi.change >= 0
        return (
          <Card key={kpi.label} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {kpi.label}
                  </span>
                  <span
                    className="text-xl font-bold tracking-tight"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {kpi.value}
                  </span>
                  <div className="flex items-center gap-1">
                    {isPositive ? (
                      <TrendingUp className="size-3 text-accent" />
                    ) : (
                      <TrendingDown className="size-3 text-destructive" />
                    )}
                    <span
                      className={`text-[10px] font-medium ${isPositive ? "text-accent" : "text-destructive"}`}
                    >
                      {isPositive ? "+" : ""}
                      {kpi.change}%
                    </span>
                    <span className="text-[10px] text-muted-foreground">vs last</span>
                  </div>
                </div>
                <div className={`flex size-9 items-center justify-center rounded-lg ${kpi.bgColor}`}>
                  <kpi.icon className={`size-4 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
