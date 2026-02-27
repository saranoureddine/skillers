"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
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
} from "recharts"
import { contentModerationAnalytics, usersByLocation } from "@/lib/mock-data"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Flag, CheckCircle2, Clock, AlertTriangle, MapPin, Users, DollarSign } from "lucide-react"

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--foreground)",
  fontSize: "12px",
}

const typeColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"]

export function ModerationKPICards() {
  const m = contentModerationAnalytics
  const kpis = [
    { label: "Total Reports", value: m.totalReports, icon: Flag, color: "text-chart-3", bg: "bg-chart-3/10" },
    { label: "Open", value: m.openReports, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Resolved", value: m.resolvedReports, icon: CheckCircle2, color: "text-accent", bg: "bg-accent/10" },
    { label: "Avg Resolution", value: m.avgResolutionTime, icon: Clock, color: "text-primary", bg: "bg-primary/10" },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${kpi.bg}`}>
              <kpi.icon className={`size-4 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                {kpi.value}
              </p>
              <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function ReportsByTypeChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          Top Reported Content Types
        </CardTitle>
        <CardDescription className="text-xs">Most frequently reported entity types</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4">
          <div className="h-[180px] w-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contentModerationAnalytics.topReportedTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  dataKey="count"
                  nameKey="type"
                >
                  {contentModerationAnalytics.topReportedTypes.map((_, i) => (
                    <Cell key={i} fill={typeColors[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2.5">
            {contentModerationAnalytics.topReportedTypes.map((t, i) => (
              <div key={t.type} className="flex items-center gap-2">
                <div className="size-2.5 rounded-sm" style={{ backgroundColor: typeColors[i] }} />
                <div>
                  <p className="text-xs font-medium">{t.type}</p>
                  <p className="text-[10px] text-muted-foreground">{t.count} reports</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ReportsByReasonChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          Reports by Reason
        </CardTitle>
        <CardDescription className="text-xs">Distribution of report reasons</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={contentModerationAnalytics.reportsByReason} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
              <YAxis dataKey="reason" type="category" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" width={100} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" name="Reports" fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function LocationAnalyticsTable({ onDrillDown }: { onDrillDown?: (location: string) => void }) {
  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          User Distribution by Location
        </CardTitle>
        <CardDescription className="text-xs">Most active locations on the platform</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Location</TableHead>
              <TableHead className="text-xs text-right">Total Users</TableHead>
              <TableHead className="text-xs text-right">Specialists</TableHead>
              <TableHead className="text-xs text-right">Revenue</TableHead>
              <TableHead className="text-xs text-right">Share</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersByLocation.map((loc) => (
              <TableRow
                key={loc.location}
                className={onDrillDown ? "cursor-pointer hover:bg-muted/50" : ""}
                onClick={() => onDrillDown?.(loc.location)}
              >
                <TableCell className="text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-3 text-muted-foreground" />
                    <span className="font-medium">{loc.location}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-xs font-bold tabular-nums">
                  {loc.users.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-xs tabular-nums">
                  {loc.specialists.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-xs tabular-nums text-accent">
                  ${loc.revenue.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${loc.pct}%` }} />
                    </div>
                    <span className="w-10 text-right text-[10px] text-muted-foreground">{loc.pct}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export function LocationBarChart() {
  const data = usersByLocation.slice(0, 8)
  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          Geographic Distribution
        </CardTitle>
        <CardDescription className="text-xs">Users and revenue by location</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="location" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar yAxisId="left" dataKey="users" name="Users" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="revenue" name="Revenue" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
