"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  DollarSign,
  PhoneCall,
  Video,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  AlertTriangle,
  Eye,
} from "lucide-react"
import {
  appointments,
  cancellationReasons,
  appointmentsOverTime,
  revenueOverTime,
  users,
  type Appointment,
} from "@/lib/mock-data"

// -- Helpers --
const packageLabels: Record<string, string> = {
  voice_call: "Voice Call",
  video_call: "Video Call",
  home_visit: "Home Visit",
  at_clinic: "At Clinic",
}

const statusColors: Record<string, string> = {
  completed: "bg-[#14b8a6]/15 text-[#14b8a6]",
  canceled: "bg-destructive/15 text-destructive",
  upcoming: "bg-primary/15 text-primary",
}

const packageColors: Record<string, string> = {
  voice_call: "#3b82f6",
  video_call: "#14b8a6",
  home_visit: "#f59e0b",
  at_clinic: "#8b5cf6",
}

type DateFilter = "today" | "yesterday" | "this_week" | "this_month" | "all"

function isInRange(dateStr: string, filter: DateFilter, from: string, to: string): boolean {
  const d = new Date(dateStr)
  const today = new Date("2026-02-20")
  if (from && to) {
    return d >= new Date(from) && d <= new Date(to)
  }
  switch (filter) {
    case "today":
      return d.toDateString() === today.toDateString()
    case "yesterday": {
      const y = new Date(today)
      y.setDate(y.getDate() - 1)
      return d.toDateString() === y.toDateString()
    }
    case "this_week": {
      const start = new Date(today)
      start.setDate(start.getDate() - start.getDay())
      return d >= start && d <= today
    }
    case "this_month":
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
    default:
      return true
  }
}

export default function AppointmentsPage() {
  const [dateFilter, setDateFilter] = useState<DateFilter>("all")
  const [specialistFilter, setSpecialistFilter] = useState("all")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [tableStatusFilter, setTableStatusFilter] = useState("all")
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null)

  const specialists = users.filter((u) => u.role === "specialist")

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      if (!isInRange(a.date, dateFilter, fromDate, toDate)) return false
      if (specialistFilter !== "all" && a.specialistId !== specialistFilter) return false
      return true
    })
  }, [dateFilter, specialistFilter, fromDate, toDate])

  const tableFiltered = useMemo(() => {
    if (tableStatusFilter === "all") return filtered
    return filtered.filter((a) => a.status === tableStatusFilter)
  }, [filtered, tableStatusFilter])

  // KPI calculations
  const totalAppointments = filtered.length
  const completedCount = filtered.filter((a) => a.status === "completed").length
  const canceledCount = filtered.filter((a) => a.status === "canceled").length
  const totalRevenue = filtered.filter((a) => a.status === "completed").reduce((s, a) => s + a.amount, 0)
  const voiceCalls = filtered.filter((a) => a.packageType === "voice_call")
  const videoCalls = filtered.filter((a) => a.packageType === "video_call")
  const voiceDuration = voiceCalls.reduce((s, a) => s + a.duration, 0)
  const videoDuration = videoCalls.reduce((s, a) => s + a.duration, 0)

  // Package breakdown
  const packageBreakdown = Object.entries(
    filtered.reduce((acc, a) => {
      acc[a.packageType] = (acc[a.packageType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([key, count]) => ({
    name: packageLabels[key],
    value: count,
    color: packageColors[key],
    pct: totalAppointments > 0 ? ((count / totalAppointments) * 100).toFixed(1) : "0",
  }))

  // Status breakdown
  const statusBreakdown = [
    { name: "Completed", value: completedCount, color: "#14b8a6" },
    { name: "Canceled", value: canceledCount, color: "#ef4444" },
    { name: "Upcoming", value: filtered.filter((a) => a.status === "upcoming").length, color: "#3b82f6" },
  ]

  // Specialist performance
  const specPerf = specialists.map((s) => {
    const sApts = filtered.filter((a) => a.specialistId === s.id)
    const sRev = sApts.filter((a) => a.status === "completed").reduce((sum, a) => sum + a.amount, 0)
    const sCan = sApts.filter((a) => a.status === "canceled").length
    return { name: s.name, appointments: sApts.length, revenue: sRev, cancellations: sCan }
  }).filter((s) => s.appointments > 0)

  const mostActive = [...specPerf].sort((a, b) => b.appointments - a.appointments).slice(0, 5)
  const topRevenue = [...specPerf].sort((a, b) => b.revenue - a.revenue).slice(0, 5)
  const needingSupport = [...specPerf].filter((s) => s.cancellations > 0).sort((a, b) => b.cancellations - a.cancellations).slice(0, 5)

  const totalTableAmount = tableFiltered.filter((a) => a.status === "completed").reduce((s, a) => s + a.amount, 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          Appointments
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor appointments, track revenue, and evaluate specialist performance
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Quick Filter</span>
              <div className="flex gap-1">
                {([
                  ["today", "Today"],
                  ["yesterday", "Yesterday"],
                  ["this_week", "This Week"],
                  ["this_month", "This Month"],
                  ["all", "All"],
                ] as [DateFilter, string][]).map(([value, label]) => (
                  <Button
                    key={value}
                    size="sm"
                    variant={dateFilter === value && !fromDate && !toDate ? "default" : "outline"}
                    className="h-8 text-xs"
                    onClick={() => { setDateFilter(value); setFromDate(""); setToDate("") }}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Specialist</span>
              <Select value={specialistFilter} onValueChange={setSpecialistFilter}>
                <SelectTrigger className="h-8 w-44 text-xs">
                  <SelectValue placeholder="All Specialists" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialists</SelectItem>
                  {specialists.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">From</span>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setDateFilter("all") }}
                className="h-8 w-36 text-xs"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">To</span>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setDateFilter("all") }}
                className="h-8 w-36 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KPICardSmall icon={CalendarCheck} label="Total Appointments" value={totalAppointments} change={12.5} />
        <KPICardSmall icon={CheckCircle2} label="Completed" value={completedCount} change={8.3} iconColor="text-[#14b8a6]" />
        <KPICardSmall icon={XCircle} label="Canceled" value={canceledCount} change={-5.2} iconColor="text-destructive" />
        <KPICardSmall icon={DollarSign} label="Revenue" value={`$${totalRevenue.toLocaleString()}`} change={18.7} />
        <KPICardSmall icon={PhoneCall} label="Voice Calls" value={voiceCalls.length} subtext={`${voiceDuration}m total`} />
        <KPICardSmall icon={Video} label="Video Calls" value={videoCalls.length} subtext={`${videoDuration}m total`} />
      </div>

      {/* Cancellation Reasons + Package Breakdown + Status Breakdown */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Cancellation Reasons */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
              Cancellation Reasons
            </CardTitle>
            <CardDescription className="text-xs">{canceledCount} total cancellations</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col gap-3">
              {cancellationReasons.map((r) => {
                const pct = canceledCount > 0 ? ((r.count / canceledCount) * 100).toFixed(0) : 0
                return (
                  <div key={r.reason} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">{r.reason}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold tabular-nums">{r.count}</span>
                        <Badge variant="secondary" className="text-[10px] tabular-nums">{pct}%</Badge>
                      </div>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-destructive/60 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Package Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
              Appointments by Package
            </CardTitle>
            <CardDescription className="text-xs">Demand by package type</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={packageBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} strokeWidth={0}>
                  {packageBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--foreground)", fontSize: "12px" }}
                  formatter={(value: number, name: string) => [`${value} (${((value / totalAppointments) * 100).toFixed(1)}%)`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 pt-1">
              {packageBreakdown.map((p) => (
                <div key={p.name} className="flex items-center gap-1.5">
                  <span className="inline-block size-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-[10px] text-muted-foreground">{p.name} ({p.pct}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
              Status Breakdown
            </CardTitle>
            <CardDescription className="text-xs">Appointment distribution by status</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} strokeWidth={0}>
                  {statusBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--foreground)", fontSize: "12px" }}
                  formatter={(value: number, name: string) => [`${value} (${totalAppointments > 0 ? ((value / totalAppointments) * 100).toFixed(1) : 0}%)`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 pt-1">
              {statusBreakdown.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <span className="inline-block size-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-[10px] text-muted-foreground">{s.name} ({s.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments Over Time + Revenue Over Time */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Appointments Over Time</CardTitle>
            <CardDescription className="text-xs">Completed vs canceled appointments</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={appointmentsOverTime}>
                <defs>
                  <linearGradient id="gradComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradCanc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--foreground)", fontSize: "12px" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Area type="monotone" dataKey="completed" stroke="#14b8a6" fill="url(#gradComp)" strokeWidth={2} name="Completed" />
                <Area type="monotone" dataKey="canceled" stroke="#ef4444" fill="url(#gradCanc)" strokeWidth={2} name="Canceled" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Revenue Over Time</CardTitle>
            <CardDescription className="text-xs">Revenue generated from appointments</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={revenueOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} tickFormatter={(v) => `$${v}`} />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--foreground)", fontSize: "12px" }} formatter={(v: number) => [`$${v}`, "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Specialist Performance */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Most Active Specialists</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col gap-2">
              {mostActive.length === 0 && <span className="text-xs text-muted-foreground">No data</span>}
              {mostActive.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">{i + 1}</span>
                    <span className="text-xs font-medium">{s.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] tabular-nums">{s.appointments} apt</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Top Revenue Specialists</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col gap-2">
              {topRevenue.length === 0 && <span className="text-xs text-muted-foreground">No data</span>}
              {topRevenue.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-[#14b8a6]/15 text-[10px] font-bold text-[#14b8a6]">{i + 1}</span>
                    <span className="text-xs font-medium">{s.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] tabular-nums font-bold">${s.revenue}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="size-3.5 text-chart-3" />
                Specialists Needing Support
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col gap-2">
              {needingSupport.length === 0 && <span className="text-xs text-muted-foreground">No specialists with cancellations</span>}
              {needingSupport.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between rounded-lg bg-destructive/5 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-destructive/15 text-[10px] font-bold text-destructive">{i + 1}</span>
                    <span className="text-xs font-medium">{s.name}</span>
                  </div>
                  <Badge variant="destructive" className="text-[10px] tabular-nums">{s.cancellations} canceled</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Recent Appointments</CardTitle>
              <CardDescription className="text-xs">{tableFiltered.length} appointments shown</CardDescription>
            </div>
            <div className="flex gap-1">
              {(["all", "completed", "upcoming", "canceled"] as const).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={tableStatusFilter === s ? "default" : "outline"}
                  className="h-7 text-[10px] capitalize"
                  onClick={() => setTableStatusFilter(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-[10px] font-semibold">Client</TableHead>
                  <TableHead className="text-[10px] font-semibold">ID</TableHead>
                  <TableHead className="text-[10px] font-semibold">Specialist</TableHead>
                  <TableHead className="text-[10px] font-semibold">Package</TableHead>
                  <TableHead className="text-[10px] font-semibold">Status</TableHead>
                  <TableHead className="text-[10px] font-semibold">Date & Time</TableHead>
                  <TableHead className="text-[10px] font-semibold">Duration</TableHead>
                  <TableHead className="text-[10px] font-semibold text-right">Amount</TableHead>
                  <TableHead className="text-[10px] font-semibold">Location</TableHead>
                  <TableHead className="text-[10px] font-semibold w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableFiltered.map((apt) => (
                  <TableRow key={apt.id} className="group hover:bg-muted/40">
                    <TableCell className="text-xs font-medium">{apt.client}</TableCell>
                    <TableCell className="text-xs tabular-nums text-muted-foreground">{apt.id}</TableCell>
                    <TableCell className="text-xs">{apt.specialist}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{packageLabels[apt.packageType]}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-[10px] ${statusColors[apt.status]}`}>
                        {apt.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs tabular-nums">{apt.date} {apt.time}</TableCell>
                    <TableCell className="text-xs tabular-nums">{apt.duration}m</TableCell>
                    <TableCell className="text-xs tabular-nums text-right font-medium">${apt.amount}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {apt.location}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-7 p-0 opacity-0 group-hover:opacity-100"
                        onClick={() => setSelectedApt(apt)}
                      >
                        <Eye className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {tableFiltered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center text-sm text-muted-foreground">
                      No appointments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Table Footer Total */}
          <div className="flex justify-end border-t pt-3 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Total Amount (Completed):</span>
              <span className="text-sm font-bold tabular-nums" style={{ fontFamily: "var(--font-heading)" }}>
                ${totalTableAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Detail Dialog */}
      <Dialog open={!!selectedApt} onOpenChange={() => setSelectedApt(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>Appointment Details</DialogTitle>
            <DialogDescription>{selectedApt?.id}</DialogDescription>
          </DialogHeader>
          {selectedApt && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <InfoField label="Client" value={selectedApt.client} />
                <InfoField label="Specialist" value={selectedApt.specialist} />
                <InfoField label="Package" value={packageLabels[selectedApt.packageType]} />
                <InfoField label="Status">
                  <Badge variant="secondary" className={`text-[10px] ${statusColors[selectedApt.status]}`}>
                    {selectedApt.status}
                  </Badge>
                </InfoField>
                <InfoField label="Date & Time" value={`${selectedApt.date} at ${selectedApt.time}`} />
                <InfoField label="Duration" value={`${selectedApt.duration} minutes`} />
                <InfoField label="Amount" value={`$${selectedApt.amount}`} />
                <InfoField label="Location" value={selectedApt.location} />
              </div>
              {selectedApt.cancellationReason && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-destructive">
                    <AlertTriangle className="size-3.5" />
                    Cancellation Reason
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{selectedApt.cancellationReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// -- Small KPI Card subcomponent --
function KPICardSmall({
  icon: Icon,
  label,
  value,
  change,
  subtext,
  iconColor = "text-primary",
}: {
  icon: React.ElementType
  label: string
  value: string | number
  change?: number
  subtext?: string
  iconColor?: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
            <span className="text-xl font-bold tabular-nums tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              {value}
            </span>
            {change !== undefined && (
              <div className="flex items-center gap-1">
                {change >= 0 ? (
                  <TrendingUp className="size-3 text-[#14b8a6]" />
                ) : (
                  <TrendingDown className="size-3 text-destructive" />
                )}
                <span className={`text-[10px] font-medium ${change >= 0 ? "text-[#14b8a6]" : "text-destructive"}`}>
                  {change >= 0 ? "+" : ""}{change}%
                </span>
                <span className="text-[10px] text-muted-foreground">vs last week</span>
              </div>
            )}
            {subtext && <span className="text-[10px] text-muted-foreground">{subtext}</span>}
          </div>
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <Icon className={`size-4 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// -- Info field for detail dialog --
function InfoField({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      {children || <span className="text-xs font-medium">{value}</span>}
    </div>
  )
}
