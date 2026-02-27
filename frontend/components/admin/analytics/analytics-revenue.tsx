"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
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
import {
  revenueGrowthOverTime,
  revenueByCategory,
  revenueByPlanType,
  monthlyRevenueBreakdown,
  topRevSpecialists,
  topRevClients,
  financialSummary,
  subscriptionsByPlanOverTime,
  churnAnalytics,
  churnReasons,
} from "@/lib/mock-data"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--foreground)",
  fontSize: "12px",
}

export function RevenueKPICards() {
  const kpis = [
    { label: "Total Revenue", value: `$${(financialSummary.totalRevenue / 1000000).toFixed(2)}M`, change: 22.4 },
    { label: "MRR", value: `$${financialSummary.mrr.toLocaleString()}`, change: 18.7 },
    { label: "ARR", value: `$${(financialSummary.arr / 1000000).toFixed(2)}M`, change: 24.1 },
    { label: "Churn Rate", value: `${financialSummary.churnRate}%`, change: -0.2, inverted: true },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const isPositive = kpi.inverted ? kpi.change <= 0 : kpi.change >= 0
        return (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
              <p className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                {kpi.value}
              </p>
              <div className="mt-1 flex items-center gap-1">
                {isPositive ? (
                  <ArrowUpRight className="size-3 text-accent" />
                ) : (
                  <ArrowDownRight className="size-3 text-destructive" />
                )}
                <span className={`text-[10px] font-medium ${isPositive ? "text-accent" : "text-destructive"}`}>
                  {kpi.change >= 0 ? "+" : ""}{kpi.change}%
                </span>
                <span className="text-[10px] text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export function RevenueGrowthChart() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          Revenue Growth Over Time
        </CardTitle>
        <CardDescription className="text-xs">Client vs Specialist revenue contribution</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueGrowthOverTime}>
              <defs>
                <linearGradient id="revClient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="revSpecialist" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Area type="monotone" dataKey="clients" name="Client Revenue" stroke="var(--chart-1)" fill="url(#revClient)" strokeWidth={2} />
              <Area type="monotone" dataKey="specialists" name="Specialist Revenue" stroke="var(--chart-2)" fill="url(#revSpecialist)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function RevenueByCategoryChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          Revenue by Category
        </CardTitle>
        <CardDescription className="text-xs">Top earning categories</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByCategory} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" width={80} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]} />
              <Bar dataKey="revenue" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function RevenueByPlanChart() {
  const filtered = revenueByPlanType.filter((r) => r.value > 0)
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          Revenue by Plan Type
        </CardTitle>
        <CardDescription className="text-xs">Breakdown by subscription plan</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4">
          <div className="h-[200px] w-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filtered}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                >
                  {filtered.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2">
            {filtered.map((plan) => (
              <div key={plan.name} className="flex items-center gap-2">
                <div className="size-2.5 rounded-sm" style={{ backgroundColor: plan.color }} />
                <div>
                  <p className="text-xs font-medium">{plan.name}</p>
                  <p className="text-[10px] text-muted-foreground">${plan.value.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TopRevenueSpecialistsTable({ onDrillDown }: { onDrillDown?: (name: string, type: string) => void }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          Top Revenue Specialists
        </CardTitle>
        <CardDescription className="text-xs">Ranked by total revenue</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Specialist</TableHead>
              <TableHead className="text-xs text-right">Revenue</TableHead>
              <TableHead className="text-xs text-right">Orders</TableHead>
              <TableHead className="text-xs text-right">Avg Order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topRevSpecialists.map((spec, i) => (
              <TableRow
                key={spec.name}
                className={onDrillDown ? "cursor-pointer hover:bg-muted/50" : ""}
                onClick={() => onDrillDown?.(spec.name, "specialist")}
              >
                <TableCell className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded bg-muted text-[10px] font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-medium">{spec.name}</span>
                      <span className="text-[10px] text-muted-foreground">{spec.profession}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right text-xs font-bold tabular-nums text-accent">
                  ${spec.revenue.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-xs tabular-nums">
                  {spec.orders}
                </TableCell>
                <TableCell className="text-right text-xs tabular-nums">
                  ${spec.avgOrder}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export function ChurnRateChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          Churn Rate Trend
        </CardTitle>
        <CardDescription className="text-xs">Monthly subscription churn rate</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={churnAnalytics}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" domain={[0, 5]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}%`, "Churn Rate"]} />
              <Line type="monotone" dataKey="churnRate" stroke="var(--chart-5)" strokeWidth={2} dot={{ r: 4, fill: "var(--card)", stroke: "var(--chart-5)", strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function ChurnReasonsChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          Churn Reasons
        </CardTitle>
        <CardDescription className="text-xs">Why users cancel subscriptions</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-3">
          {churnReasons.map((reason) => (
            <div key={reason.reason} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{reason.reason}</span>
                <span className="text-xs text-muted-foreground">{reason.count} ({reason.pct}%)</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-chart-5/70"
                  style={{ width: `${reason.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
