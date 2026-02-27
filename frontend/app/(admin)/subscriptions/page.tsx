"use client"

import { useState } from "react"
import {
  financialSummary,
  transactions,
  subscriptionPlans,
  clientPlans,
  specialistPlans,
  subscriptionGrowthData,
  renewalData,
  clientPlanAnalytics,
  specialistPlanPerformance,
  monthlyRevenueBreakdown,
  revenueByPlanType,
} from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import {
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Eye,
  Crown,
  Star,
  RefreshCw,
  Clock,
  AlertTriangle,
  Shield,
  Zap,
  BarChart3,
  Edit,
} from "lucide-react"
import { toast } from "sonner"

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--foreground)",
  fontSize: "12px",
}

// ==============================
// TAB 1: Revenue Overview
// ==============================
function RevenueOverviewTab() {
  const totalAllTime = financialSummary.totalRevenue
  const monthly = financialSummary.monthlyRevenue
  const clientRev = monthlyRevenueBreakdown[5].clientRev
  const specialistRev = monthlyRevenueBreakdown[5].specialistRev
  const prevTotal = monthlyRevenueBreakdown[4].total
  const growthPct = (((monthlyRevenueBreakdown[5].total - prevTotal) / prevTotal) * 100).toFixed(1)

  return (
    <div className="flex flex-col gap-6">
      {/* Revenue KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="size-4 text-accent" />
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </div>
            <p className="text-xl font-bold">${(totalAllTime / 1000).toFixed(0)}K</p>
            <span className="text-[10px] text-muted-foreground">All time</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              <p className="text-xs text-muted-foreground">This Month</p>
            </div>
            <p className="text-xl font-bold">${monthly.toLocaleString()}</p>
            <div className="mt-0.5 flex items-center gap-1 text-accent">
              <ArrowUpRight className="size-3" />
              <span className="text-[10px]">+{growthPct}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-chart-1" />
              <p className="text-xs text-muted-foreground">Client Subs</p>
            </div>
            <p className="text-xl font-bold">${clientRev.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground">This month</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-chart-2" />
              <p className="text-xs text-muted-foreground">Specialist Subs</p>
            </div>
            <p className="text-xl font-bold">${specialistRev.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground">This month</span>
          </CardContent>
        </Card>
      </div>

      {/* Revenue over time line chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Revenue Over Time</CardTitle>
          <CardDescription className="text-xs">Client vs Specialist subscription revenue (6 months)</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenueBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`$${v.toLocaleString()}`, undefined]} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Line type="monotone" dataKey="clientRev" name="Client Revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="specialistRev" name="Specialist Revenue" stroke="#14b8a6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="total" name="Total" stroke="var(--foreground)" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue by plan pie + Transactions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Revenue by Plan Type</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={revenueByPlanType.filter((d) => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {revenueByPlanType.filter((d) => d.value > 0).map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`$${v.toLocaleString()}`, undefined]} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="text-sm">{txn.user}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] capitalize">
                        {txn.type.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {txn.type === "payout" ? "-" : "+"}${txn.amount}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{txn.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ==============================
// TAB 2: Subscription Plans
// ==============================
function SubscriptionPlansTab() {
  return (
    <div className="flex flex-col gap-6">
      {/* Client Plans */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Client Plans</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {clientPlans.map((plan) => (
            <Card key={plan.id} className="relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: plan.color }} />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg" style={{ fontFamily: "var(--font-heading)" }}>{plan.name}</CardTitle>
                  <Button variant="ghost" size="icon" className="size-7" onClick={() => toast.info(`Edit ${plan.name} plan`)}>
                    <Edit className="size-3" />
                  </Button>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price === 0 ? "Free" : `$${plan.price}`}</span>
                  {plan.price > 0 && <span className="text-xs text-muted-foreground">/{plan.interval}</span>}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2.5">
                  <Users className="size-4 text-muted-foreground" />
                  <span className="text-xs font-medium">{plan.activeClients.toLocaleString()} active clients</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="size-3 text-accent shrink-0" />
                      <span className="text-xs">{f}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Specialist Plans */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Specialist Plans</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {specialistPlans.map((plan) => (
            <Card key={plan.id} className="relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: plan.color }} />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg" style={{ fontFamily: "var(--font-heading)" }}>{plan.name}</CardTitle>
                    {plan.badge && (
                      <Badge variant="secondary" className="text-[10px] bg-chart-3/15 text-chart-3">
                        {plan.badge}
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="size-7" onClick={() => toast.info(`Edit ${plan.name} plan`)}>
                    <Edit className="size-3" />
                  </Button>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price === 0 ? "Free" : `$${plan.price}`}</span>
                  {plan.price > 0 && <span className="text-xs text-muted-foreground">/{plan.interval}</span>}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2.5">
                  <Users className="size-4 text-muted-foreground" />
                  <span className="text-xs font-medium">{plan.activeSpecialists.toLocaleString()} active specialists</span>
                </div>
                {plan.visibility !== "Standard" && (
                  <div className="flex items-center gap-2 rounded-lg bg-chart-3/10 p-2.5">
                    <Eye className="size-4 text-chart-3" />
                    <span className="text-xs font-medium text-chart-3">{plan.visibility}</span>
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="size-3 text-accent shrink-0" />
                      <span className="text-xs">{f}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// ==============================
// TAB 3: Subscription Growth
// ==============================
function SubscriptionGrowthTab() {
  const latestMonth = subscriptionGrowthData[subscriptionGrowthData.length - 1]
  const prevMonth = subscriptionGrowthData[subscriptionGrowthData.length - 2]
  const growthPct = (((latestMonth.activeSubs - prevMonth.activeSubs) / prevMonth.activeSubs) * 100).toFixed(1)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">New This Month</p>
            <p className="text-xl font-bold">{latestMonth.newSubs.toLocaleString()}</p>
            <div className="mt-0.5 flex items-center gap-1 text-accent">
              <ArrowUpRight className="size-3" />
              <span className="text-[10px]">+{(((latestMonth.newSubs - prevMonth.newSubs) / prevMonth.newSubs) * 100).toFixed(0)}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Active</p>
            <p className="text-xl font-bold">{latestMonth.activeSubs.toLocaleString()}</p>
            <div className="mt-0.5 flex items-center gap-1 text-accent">
              <ArrowUpRight className="size-3" />
              <span className="text-[10px]">+{growthPct}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Canceled</p>
            <p className="text-xl font-bold">{latestMonth.canceled}</p>
            <div className="mt-0.5 flex items-center gap-1 text-accent">
              <ArrowDownRight className="size-3" />
              <span className="text-[10px]">-{(((prevMonth.canceled - latestMonth.canceled) / prevMonth.canceled) * 100).toFixed(0)}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Net Growth</p>
            <p className="text-xl font-bold">+{(latestMonth.newSubs - latestMonth.canceled).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Active subscriptions over time */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Subscription Growth Over Time</CardTitle>
          <CardDescription className="text-xs">New subscriptions, active total, and cancellations</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={subscriptionGrowthData}>
              <defs>
                <linearGradient id="gradActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v.toLocaleString(), undefined]} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Area type="monotone" dataKey="activeSubs" name="Active Subscriptions" stroke="#3b82f6" fill="url(#gradActive)" strokeWidth={2} />
              <Bar dataKey="newSubs" name="New" fill="#14b8a6" barSize={20} />
              <Bar dataKey="canceled" name="Canceled" fill="#ef4444" barSize={20} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Client vs Specialist growth */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Client vs Specialist Growth</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={subscriptionGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v.toLocaleString(), undefined]} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Line type="monotone" dataKey="clientSubs" name="Client Subscriptions" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="specialistSubs" name="Specialist Subscriptions" stroke="#14b8a6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

// ==============================
// TAB 4: Activity & Renewal
// ==============================
function ActivityRenewalTab() {
  const r = renewalData
  const autoPercent = Math.round((r.autoRenewal / r.activeSubscriptions) * 100)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-lg font-bold">{r.activeSubscriptions.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Upcoming Renewals</p>
            <p className="text-lg font-bold">{r.upcomingRenewals.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Expired This Month</p>
            <p className="text-lg font-bold text-destructive">{r.expiredThisMonth}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Auto-Renewal</p>
            <p className="text-lg font-bold">{autoPercent}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Manual Renewal</p>
            <p className="text-lg font-bold">{r.manualRenewal.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Success Rate</p>
            <p className="text-lg font-bold text-accent">{r.renewalSuccessRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Renewal progress */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Renewal Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-0">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Auto-Renewal</span>
                <span className="text-xs font-bold">{r.autoRenewal.toLocaleString()}</span>
              </div>
              <Progress value={autoPercent} className="h-2" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Manual Renewal</span>
                <span className="text-xs font-bold">{r.manualRenewal.toLocaleString()}</span>
              </div>
              <Progress value={100 - autoPercent} className="h-2" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Renewal Success Rate</span>
                <span className="text-xs font-bold text-accent">{r.renewalSuccessRate}%</span>
              </div>
              <Progress value={r.renewalSuccessRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-chart-3" />
              <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Expiring Soon</CardTitle>
            </div>
            <CardDescription className="text-xs">Subscriptions expiring within the next 10 days</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 pt-0">
            {r.expiringSoon.map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{item.user}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">{item.plan}</Badge>
                    <Badge variant="outline" className="text-[10px] capitalize">{item.type}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-chart-3">{item.expiresIn}</span>
                  <Button variant="ghost" size="icon" className="size-7" onClick={() => toast.info(`Reminder sent to ${item.user}`)}>
                    <RefreshCw className="size-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ==============================
// TAB 5: Client Plans Analytics
// ==============================
function ClientPlansAnalyticsTab() {
  const totalClients = clientPlanAnalytics.reduce((s, p) => s + p.active, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {clientPlanAnalytics.map((plan) => {
          const pct = ((plan.active / totalClients) * 100).toFixed(1)
          const planColor = clientPlans.find((p) => p.name === plan.plan)?.color || "#94a3b8"
          return (
            <Card key={plan.plan} className="relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: planColor }} />
              <CardHeader className="pb-2">
                <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>{plan.plan}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Active clients</span>
                  <span className="text-sm font-bold">{plan.active.toLocaleString()} ({pct}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Avg. activity/week</span>
                  <span className="text-sm font-bold">{plan.avgActivity} sessions</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Top feature used</span>
                  <Badge variant="secondary" className="text-[10px]">{plan.topFeature}</Badge>
                </div>
                {plan.upgrades > 0 && (
                  <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-2.5">
                    <div className="flex items-center gap-1">
                      <ArrowUpRight className="size-3 text-accent" />
                      <span className="text-xs">{plan.upgrades} upgrades</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ArrowDownRight className="size-3 text-destructive" />
                      <span className="text-xs">{plan.downgrades} downgrades</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Activity level comparison bar chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Activity Level by Plan</CardTitle>
          <CardDescription className="text-xs">Average weekly sessions per client plan</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={clientPlanAnalytics}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="plan" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="avgActivity" name="Avg. Sessions/Week" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Upgrade/downgrade trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Upgrade / Downgrade Trends</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Active Clients</TableHead>
                <TableHead>Upgrades</TableHead>
                <TableHead>Downgrades</TableHead>
                <TableHead>Net Movement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientPlanAnalytics.map((p) => (
                <TableRow key={p.plan}>
                  <TableCell className="font-medium">{p.plan}</TableCell>
                  <TableCell>{p.active.toLocaleString()}</TableCell>
                  <TableCell className="text-accent">{p.upgrades > 0 ? `+${p.upgrades}` : "-"}</TableCell>
                  <TableCell className="text-destructive">{p.downgrades > 0 ? `-${p.downgrades}` : "-"}</TableCell>
                  <TableCell className="font-bold">
                    {p.upgrades - p.downgrades > 0 ? (
                      <span className="text-accent">+{p.upgrades - p.downgrades}</span>
                    ) : p.upgrades - p.downgrades < 0 ? (
                      <span className="text-destructive">{p.upgrades - p.downgrades}</span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ==============================
// TAB 6: Specialist Plans & Visibility
// ==============================
function SpecialistPlansVisibilityTab() {
  return (
    <div className="flex flex-col gap-6">
      {/* Performance cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {specialistPlanPerformance.map((plan) => {
          const planData = specialistPlans.find((p) => p.name === plan.plan)
          return (
            <Card key={plan.plan} className="relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: planData?.color || "#94a3b8" }} />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>{plan.plan}</CardTitle>
                  {planData?.badge && (
                    <Badge variant="secondary" className="text-[10px] bg-chart-3/15 text-chart-3">{planData.badge}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Active specialists</span>
                  <span className="text-sm font-bold">{plan.active.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Avg. bookings/month</span>
                  <span className="text-sm font-bold">{plan.avgBookings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Revenue generated</span>
                  <span className="text-sm font-bold">${plan.revenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Avg. rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="size-3 fill-chart-3 text-chart-3" />
                    <span className="text-sm font-bold">{plan.avgRating}</span>
                  </div>
                </div>
                {planData?.visibility !== "Standard" && (
                  <div className="flex items-center gap-2 rounded-lg bg-chart-3/10 p-2.5">
                    <Eye className="size-4 text-chart-3" />
                    <span className="text-xs font-medium text-chart-3">{planData?.visibility}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Visibility benefits explanation */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Crown className="size-4 text-chart-3" />
            <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Visibility & Ranking Benefits</CardTitle>
          </div>
          <CardDescription className="text-xs">How paid plans improve specialist visibility and bookings</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col gap-3">
            {specialistPlans.map((plan) => (
              <div key={plan.id} className="flex items-start gap-3 rounded-lg border p-4">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${plan.color}20` }}>
                  {plan.name === "Starter" ? <Users className="size-4" style={{ color: plan.color }} /> :
                   plan.name === "Professional" ? <Shield className="size-4" style={{ color: plan.color }} /> :
                   <Crown className="size-4" style={{ color: plan.color }} />}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{plan.name}</span>
                    {plan.badge && (
                      <Badge variant="secondary" className="text-[10px] bg-chart-3/15 text-chart-3">{plan.badge}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {plan.name === "Starter" && "Standard search ranking with basic profile visibility. Appears in normal search order."}
                    {plan.name === "Professional" && "Priority ranking in client search results. Verified badge builds trust. Higher in listings."}
                    {plan.name === "Top Recommended" && "Featured placement on homepage and category pages. \"Top Recommended\" badge. First in all search results. Maximum visibility and bookings."}
                  </p>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground">
                      Avg. bookings: <span className="font-bold text-foreground">{specialistPlanPerformance.find((p) => p.plan === plan.name)?.avgBookings}/mo</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Avg. rating: <span className="font-bold text-foreground">{specialistPlanPerformance.find((p) => p.plan === plan.name)?.avgRating}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Specialist performance bar chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Performance Comparison by Plan</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={specialistPlanPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="plan" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="avgBookings" name="Avg. Bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
              <Bar dataKey="active" name="Active Specialists" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

// ==============================
// MAIN PAGE
// ==============================
export default function SubscriptionsRevenuePage() {
  const totalActiveUsers = clientPlans.reduce((s, p) => s + p.activeClients, 0) + specialistPlans.reduce((s, p) => s + p.activeSpecialists, 0)
  const activeSubs = subscriptionGrowthData[subscriptionGrowthData.length - 1].activeSubs
  const mrr = financialSummary.mrr
  const arpu = (mrr / activeSubs).toFixed(2)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          Subscriptions & Revenue
        </h1>
        <p className="text-sm text-muted-foreground">
          Complete business view of plans, revenue, growth, and activity
        </p>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <p className="text-xs text-muted-foreground">Total Active Users</p>
            </div>
            <p className="text-xl font-bold">{totalActiveUsers.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-accent/20 bg-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="size-4 text-accent" />
              <p className="text-xs text-muted-foreground">Active Subscriptions</p>
            </div>
            <p className="text-xl font-bold">{activeSubs.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-chart-3/20 bg-chart-3/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="size-4 text-chart-3" />
              <p className="text-xs text-muted-foreground">MRR</p>
            </div>
            <p className="text-xl font-bold">${mrr.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-chart-4/20 bg-chart-4/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-chart-4" />
              <p className="text-xs text-muted-foreground">ARPU</p>
            </div>
            <p className="text-xl font-bold">${arpu}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sub-tabs */}
      <Tabs defaultValue="revenue" className="flex flex-col gap-4">
        <TabsList className="h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
          <TabsTrigger value="revenue" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <DollarSign className="mr-1.5 size-3.5" /> Revenue Overview
          </TabsTrigger>
          <TabsTrigger value="plans" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <CreditCard className="mr-1.5 size-3.5" /> Subscription Plans
          </TabsTrigger>
          <TabsTrigger value="growth" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <TrendingUp className="mr-1.5 size-3.5" /> Growth
          </TabsTrigger>
          <TabsTrigger value="renewal" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <RefreshCw className="mr-1.5 size-3.5" /> Activity & Renewal
          </TabsTrigger>
          <TabsTrigger value="client-analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="mr-1.5 size-3.5" /> Client Analytics
          </TabsTrigger>
          <TabsTrigger value="specialist-visibility" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Eye className="mr-1.5 size-3.5" /> Specialist Visibility
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue"><RevenueOverviewTab /></TabsContent>
        <TabsContent value="plans"><SubscriptionPlansTab /></TabsContent>
        <TabsContent value="growth"><SubscriptionGrowthTab /></TabsContent>
        <TabsContent value="renewal"><ActivityRenewalTab /></TabsContent>
        <TabsContent value="client-analytics"><ClientPlansAnalyticsTab /></TabsContent>
        <TabsContent value="specialist-visibility"><SpecialistPlansVisibilityTab /></TabsContent>
      </Tabs>
    </div>
  )
}
