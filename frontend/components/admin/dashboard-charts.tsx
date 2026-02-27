"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  revenueByCategory,
  weeklyUsers,
  topProfessions,
  recentActivity,
  systemHealth,
  subscriptionOverview,
  monthlyClientsByPlan,
  appointments,
} from "@/lib/mock-data"
import Link from "next/link"
import {
  UserPlus,
  CheckCircle,
  Shield,
  Star,
  Briefcase,
  Flag,
  XCircle,
  Activity,
  CalendarCheck,
  Clock,
  Phone,
  Video,
  DollarSign,
  ArrowRight,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

const activityIcons: Record<string, React.ElementType> = {
  "user-plus": UserPlus,
  "check-circle": CheckCircle,
  "shield": Shield,
  "star": Star,
  "briefcase": Briefcase,
  "flag": Flag,
  "x-circle": XCircle,
}

const activityColors: Record<string, string> = {
  signup: "text-primary",
  order: "text-accent",
  verification: "text-chart-3",
  review: "text-chart-3",
  report: "text-destructive",
}

export function RevenueByCategoryChart() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Revenue by Category</CardTitle>
        <CardDescription className="text-xs">Top earning categories this month</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={revenueByCategory} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <YAxis dataKey="category" type="category" width={80} stroke="var(--muted-foreground)" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--foreground)",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
            />
            <Bar dataKey="revenue" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function WeeklyUsersChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>This Week</CardTitle>
        <CardDescription className="text-xs">New Users vs New Specialists</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={weeklyUsers}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
            <YAxis stroke="var(--muted-foreground)" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--foreground)",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Bar dataKey="users" fill="var(--chart-1)" radius={[4, 4, 0, 0]} name="Users" />
            <Bar dataKey="specialists" fill="var(--chart-2)" radius={[4, 4, 0, 0]} name="Specialists" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function TopProfessionsList() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Top Professions</CardTitle>
        <CardDescription className="text-xs">Ranked by orders this month</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-3">
          {topProfessions.map((prof, i) => (
            <div key={prof.name} className="flex items-center gap-3">
              <span className="flex size-6 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                {i + 1}
              </span>
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-medium">{prof.name}</span>
                <span className="text-xs text-muted-foreground">{prof.orders} orders</span>
              </div>
              <div className="flex gap-[2px]">
                {prof.trend.map((v, j) => (
                  <div
                    key={j}
                    className="w-[4px] rounded-full bg-primary/60"
                    style={{ height: `${(v / 50) * 24}px` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function RecentActivityFeed() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Recent Activity</CardTitle>
        <CardDescription className="text-xs">Live platform feed</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[320px]">
          <div className="flex flex-col gap-3">
            {recentActivity.map((activity) => {
              const IconComp = activityIcons[activity.icon] || Activity
              const colorClass = activityColors[activity.type] || "text-foreground"
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted ${colorClass}`}>
                    <IconComp className="size-3.5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium leading-tight">{activity.message}</span>
                    <span className="text-[10px] text-muted-foreground">{activity.time}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export function PlanSubscriptionOverview() {
  const total = subscriptionOverview.totalActive
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Plan Subscription Overview</CardTitle>
        <CardDescription className="text-xs">
          {total.toLocaleString()} total active subscriptions
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-4">
          {/* Stacked progress bar */}
          <div className="flex h-3 w-full overflow-hidden rounded-full">
            {subscriptionOverview.plans.map((plan) => (
              <div
                key={plan.name}
                className="h-full transition-all"
                style={{
                  width: `${((plan.count / total) * 100).toFixed(1)}%`,
                  backgroundColor: plan.color,
                }}
              />
            ))}
          </div>

          {/* Plan breakdown */}
          <div className="flex flex-col gap-3">
            {subscriptionOverview.plans.map((plan) => {
              const pct = ((plan.count / total) * 100).toFixed(1)
              return (
                <div key={plan.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block size-2.5 rounded-full"
                      style={{ backgroundColor: plan.color }}
                    />
                    <span className="text-sm font-medium">{plan.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm tabular-nums font-bold">
                      {plan.count.toLocaleString()}
                    </span>
                    <Badge variant="secondary" className="text-[10px] tabular-nums font-medium">
                      {pct}%
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function MonthlyClientsByPlanChart() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Monthly Clients by Plan</CardTitle>
        <CardDescription className="text-xs">Client count grouped by subscription plan over time</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={monthlyClientsByPlan}>
            <defs>
              <linearGradient id="gradBasic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPremium" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
            <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--foreground)",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => [value.toLocaleString(), name]}
            />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Area type="monotone" dataKey="Basic" stroke="#94a3b8" fill="url(#gradBasic)" strokeWidth={2} />
            <Area type="monotone" dataKey="Pro" stroke="#3b82f6" fill="url(#gradPro)" strokeWidth={2} />
            <Area type="monotone" dataKey="Premium" stroke="#14b8a6" fill="url(#gradPremium)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

const packageIcons: Record<string, React.ElementType> = {
  voice_call: Phone,
  video_call: Video,
  home_visit: Briefcase,
  at_clinic: CalendarCheck,
}

const packageLabels: Record<string, string> = {
  voice_call: "Voice Call",
  video_call: "Video Call",
  home_visit: "Home Visit",
  at_clinic: "At Clinic",
}

const statusConfig: Record<string, { label: string; dot: string; bg: string }> = {
  upcoming: { label: "Upcoming", dot: "bg-primary", bg: "bg-primary/10 text-primary" },
  completed: { label: "Completed", dot: "bg-accent", bg: "bg-accent/10 text-accent" },
  canceled: { label: "Canceled", dot: "bg-destructive", bg: "bg-destructive/10 text-destructive" },
}

export function AppointmentsSummaryWidget() {
  const today = "2026-02-20"
  const todayAppts = appointments.filter((a) => a.date === today)
  const upcoming = appointments.filter((a) => a.status === "upcoming")
  const completedToday = todayAppts.filter((a) => a.status === "completed")
  const canceledToday = todayAppts.filter((a) => a.status === "canceled")
  const todayRevenue = completedToday.reduce((s, a) => s + a.amount, 0)

  // next 3 upcoming appointments
  const nextUpcoming = upcoming
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 3)

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
            {"Today's Appointments"}
          </CardTitle>
          <CardDescription className="text-xs">
            {todayAppts.length} appointments scheduled for today
          </CardDescription>
        </div>
        <Link
          href="/appointments"
          className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
        >
          View All <ArrowRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-4">
          {/* Mini KPI row */}
          <div className="grid grid-cols-4 gap-2">
            <div className="flex flex-col items-center rounded-lg bg-muted/50 p-2.5">
              <CalendarCheck className="mb-1 size-4 text-primary" />
              <span className="text-lg font-bold tabular-nums">{todayAppts.length}</span>
              <span className="text-[10px] text-muted-foreground">Total</span>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-accent/10 p-2.5">
              <CheckCircle className="mb-1 size-4 text-accent" />
              <span className="text-lg font-bold tabular-nums">{completedToday.length}</span>
              <span className="text-[10px] text-muted-foreground">Completed</span>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-destructive/10 p-2.5">
              <XCircle className="mb-1 size-4 text-destructive" />
              <span className="text-lg font-bold tabular-nums">{canceledToday.length}</span>
              <span className="text-[10px] text-muted-foreground">Canceled</span>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-chart-3/10 p-2.5">
              <DollarSign className="mb-1 size-4 text-chart-3" />
              <span className="text-lg font-bold tabular-nums">${todayRevenue}</span>
              <span className="text-[10px] text-muted-foreground">Revenue</span>
            </div>
          </div>

          {/* Upcoming appointments list */}
          {nextUpcoming.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Next Upcoming</h4>
              {nextUpcoming.map((appt) => {
                const PkgIcon = packageIcons[appt.packageType] || CalendarCheck
                return (
                  <div key={appt.id} className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/30">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <PkgIcon className="size-4 text-primary" />
                    </div>
                    <div className="flex flex-1 flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{appt.client}</span>
                        <ArrowRight className="size-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{appt.specialist}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Clock className="size-3" />
                        <span>{appt.date} at {appt.time}</span>
                        <span className="text-muted-foreground/40">|</span>
                        <span>{packageLabels[appt.packageType]}</span>
                        <span className="text-muted-foreground/40">|</span>
                        <span>{appt.duration}min</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold tabular-nums text-primary">${appt.amount}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Status bar */}
          <div className="flex items-center gap-3">
            {(["upcoming", "completed", "canceled"] as const).map((s) => {
              const count = appointments.filter((a) => a.status === s).length
              const cfg = statusConfig[s]
              return (
                <div key={s} className="flex items-center gap-1.5">
                  <span className={`size-2 rounded-full ${cfg.dot}`} />
                  <span className="text-[11px] text-muted-foreground">
                    {cfg.label}: <span className="font-semibold text-foreground">{count}</span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function SystemHealthWidget() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>System Health</CardTitle>
        <CardDescription className="text-xs">Real-time service status</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-muted/50 p-2">
              <span className="text-[10px] text-muted-foreground">API Latency</span>
              <p className="text-sm font-bold">{systemHealth.apiLatency}ms</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2">
              <span className="text-[10px] text-muted-foreground">Uptime</span>
              <p className="text-sm font-bold">{systemHealth.uptime}%</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2">
              <span className="text-[10px] text-muted-foreground">Error Rate</span>
              <p className="text-sm font-bold">{systemHealth.errorRate}%</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2">
              <span className="text-[10px] text-muted-foreground">Sessions</span>
              <p className="text-sm font-bold">{systemHealth.activeSessions.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            {systemHealth.services.map((service) => (
              <div key={service.name} className="flex items-center justify-between">
                <span className="text-xs">{service.name}</span>
                <Badge
                  variant={service.status === "healthy" ? "default" : "secondary"}
                  className={`text-[10px] ${service.status === "healthy" ? "bg-accent text-accent-foreground" : "bg-chart-3/20 text-chart-3"}`}
                >
                  {service.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
