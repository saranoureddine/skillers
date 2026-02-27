"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { appointmentAnalytics, cancellationReasons } from "@/lib/mock-data"
import {
  CalendarCheck,
  XCircle,
  Clock,
  DollarSign,
  CheckCircle2,
  TrendingUp,
} from "lucide-react"

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--foreground)",
  fontSize: "12px",
}

const typeColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"]

export function AppointmentKPICards() {
  const a = appointmentAnalytics
  const kpis = [
    { label: "Completed", value: a.completedTotal.toLocaleString(), icon: CheckCircle2, color: "text-accent", bg: "bg-accent/10" },
    { label: "Canceled", value: a.canceledTotal.toLocaleString(), icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Upcoming", value: a.upcomingTotal.toLocaleString(), icon: CalendarCheck, color: "text-primary", bg: "bg-primary/10" },
    { label: "Completion Rate", value: `${a.completionRate}%`, icon: TrendingUp, color: "text-accent", bg: "bg-accent/10" },
    { label: "Avg Duration", value: `${a.avgDuration} min`, icon: Clock, color: "text-chart-3", bg: "bg-chart-3/10" },
    { label: "Avg Rev/Appt", value: `$${a.avgRevPerAppointment}`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi) => (
        <Card key={kpi.label}>
          <CardContent className="flex flex-col items-center p-4 text-center">
            <div className={`mb-2 flex size-9 items-center justify-center rounded-lg ${kpi.bg}`}>
              <kpi.icon className={`size-4 ${kpi.color}`} />
            </div>
            <p className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              {kpi.value}
            </p>
            <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function AppointmentsTrendChart() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          Appointments Over Time
        </CardTitle>
        <CardDescription className="text-xs">Completed vs canceled appointments monthly</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={appointmentAnalytics.byMonth}>
              <defs>
                <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradCanceled" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-5)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-5)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Area type="monotone" dataKey="completed" name="Completed" stroke="var(--chart-2)" fill="url(#gradCompleted)" strokeWidth={2} />
              <Area type="monotone" dataKey="canceled" name="Canceled" stroke="var(--chart-5)" fill="url(#gradCanceled)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function AppointmentsByTypeChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          By Appointment Type
        </CardTitle>
        <CardDescription className="text-xs">Distribution across service types</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4">
          <div className="h-[200px] w-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={appointmentAnalytics.byType}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="count"
                  nameKey="type"
                >
                  {appointmentAnalytics.byType.map((_, i) => (
                    <Cell key={i} fill={typeColors[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2.5">
            {appointmentAnalytics.byType.map((t, i) => (
              <div key={t.type} className="flex items-center gap-2">
                <div className="size-2.5 rounded-sm" style={{ backgroundColor: typeColors[i] }} />
                <div>
                  <p className="text-xs font-medium">{t.type}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {t.count.toLocaleString()} ({t.pct}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function CancellationReasonsChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          Cancellation Reasons
        </CardTitle>
        <CardDescription className="text-xs">Most common reasons for appointment cancellations</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-3">
          {cancellationReasons.map((r) => {
            const total = cancellationReasons.reduce((s, c) => s + c.count, 0)
            const pct = ((r.count / total) * 100).toFixed(0)
            return (
              <div key={r.reason} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{r.reason}</span>
                  <span className="text-xs text-muted-foreground">
                    {r.count} ({pct}%)
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-destructive/60"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export function AppointmentRevenueChart() {
  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          Appointment Revenue Trend
        </CardTitle>
        <CardDescription className="text-xs">Revenue from appointments over time</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={appointmentAnalytics.byMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]} />
              <Bar dataKey="revenue" name="Revenue" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
