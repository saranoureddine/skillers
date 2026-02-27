"use client"

import { useState, useMemo, Fragment } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Search,
  Clock,
  Shield,
  User,
  MapPin,
  Monitor,
  ChevronDown,
  ChevronUp,
  Download,
  BarChart3,
  FileText,
  List,
  Timer,
  Filter,
  Globe,
} from "lucide-react"
import { enhancedAuditLog, auditLogStats } from "@/lib/mock-data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const severityConfig = {
  critical: { color: "bg-destructive/15 text-destructive", dot: "bg-destructive" },
  high: { color: "bg-chart-3/15 text-chart-3", dot: "bg-chart-3" },
  medium: { color: "bg-primary/15 text-primary", dot: "bg-primary" },
  low: { color: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
}

type ViewMode = "table" | "timeline"

export function SystemAudit() {
  const [search, setSearch] = useState("")
  const [actorFilter, setActorFilter] = useState("all")
  const [moduleFilter, setModuleFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const [showAnalytics, setShowAnalytics] = useState(false)

  const actors = useMemo(() => [...new Set(enhancedAuditLog.map((e) => e.actor))], [])
  const modules = useMemo(() => [...new Set(enhancedAuditLog.map((e) => e.module))], [])

  const filtered = useMemo(() => {
    return enhancedAuditLog.filter((entry) => {
      const matchesSearch = search === "" || entry.action.toLowerCase().includes(search.toLowerCase()) || entry.actor.toLowerCase().includes(search.toLowerCase()) || entry.module.toLowerCase().includes(search.toLowerCase())
      const matchesActor = actorFilter === "all" || entry.actor === actorFilter
      const matchesModule = moduleFilter === "all" || entry.module === moduleFilter
      const matchesSeverity = severityFilter === "all" || entry.severity === severityFilter
      return matchesSearch && matchesActor && matchesModule && matchesSeverity
    })
  }, [search, actorFilter, moduleFilter, severityFilter])

  const handleExport = (format: string) => {
    const data = filtered.map((e) => ({
      id: e.id,
      actor: e.actor,
      action: e.action,
      module: e.module,
      severity: e.severity,
      timestamp: e.timestamp,
      ip: e.ip,
      location: e.location,
    }))
    const blob = format === "json"
      ? new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      : new Blob([
          Object.keys(data[0]).join(",") + "\n" + data.map((r) => Object.values(r).join(",")).join("\n"),
        ], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-log.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Audit Stats Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Actions</p>
              <p className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>{auditLogStats.totalActions}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/10">
              <Shield className="size-4 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Critical Actions</p>
              <p className="text-lg font-bold text-destructive" style={{ fontFamily: "var(--font-heading)" }}>{auditLogStats.criticalActions}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-chart-4/10">
              <User className="size-4 text-chart-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Unique Actors</p>
              <p className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>{actors.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-accent/10">
              <BarChart3 className="size-4 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Modules Touched</p>
              <p className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>{modules.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Controls */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search actions, actors, modules..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={actorFilter} onValueChange={setActorFilter}>
                  <SelectTrigger className="h-8 w-[130px] text-xs">
                    <SelectValue placeholder="Actor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actors</SelectItem>
                    {actors.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={moduleFilter} onValueChange={setModuleFilter}>
                  <SelectTrigger className="h-8 w-[140px] text-xs">
                    <SelectValue placeholder="Module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modules</SelectItem>
                    {modules.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="h-8 w-[120px] text-xs">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-md border">
                <button
                  onClick={() => setViewMode("table")}
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] transition-colors ${viewMode === "table" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <List className="size-3" />
                  Table
                </button>
                <button
                  onClick={() => setViewMode("timeline")}
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] transition-colors ${viewMode === "timeline" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Timer className="size-3" />
                  Timeline
                </button>
              </div>
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[10px] transition-colors ${showAnalytics ? "bg-primary/10 text-primary border-primary/30" : "text-muted-foreground hover:text-foreground"}`}
              >
                <BarChart3 className="size-3" />
                Analytics
              </button>
              <div className="flex items-center rounded-md border">
                <button onClick={() => handleExport("csv")} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                  <Download className="size-3" />
                  CSV
                </button>
                <button onClick={() => handleExport("json")} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                  JSON
                </button>
              </div>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-muted-foreground">
            Showing {filtered.length} of {enhancedAuditLog.length} entries
          </div>
        </CardContent>
      </Card>

      {/* Analytics Panel */}
      {showAnalytics && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold">Actions by Actor</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={auditLogStats.byActor} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <YAxis dataKey="actor" type="category" tick={{ fontSize: 9 }} width={80} className="text-muted-foreground" />
                  <RechartsTooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }} />
                  <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold">Actions by Severity</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={auditLogStats.bySeverity} dataKey="count" nameKey="severity" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                    {auditLogStats.bySeverity.map((entry) => (
                      <Cell key={entry.severity} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3">
                {auditLogStats.bySeverity.map((s) => (
                  <div key={s.severity} className="flex items-center gap-1.5">
                    <div className="size-2 rounded-full" style={{ background: s.color }} />
                    <span className="text-[9px] capitalize text-muted-foreground">{s.severity} ({s.count})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold">Top Modules</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col gap-1.5">
                {auditLogStats.byModule.sort((a, b) => b.count - a.count).slice(0, 8).map((m) => (
                  <div key={m.module} className="flex items-center gap-2">
                    <span className="w-24 truncate text-[10px] text-muted-foreground">{m.module}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(m.count / Math.max(...auditLogStats.byModule.map((x) => x.count))) * 100}%` }} />
                    </div>
                    <span className="w-5 text-right text-[10px] font-medium">{m.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-[60px]">Severity</TableHead>
                    <TableHead className="text-xs">Actor</TableHead>
                    <TableHead className="text-xs">Action</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Module</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">IP / Location</TableHead>
                    <TableHead className="text-xs">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((entry) => {
                    const sev = severityConfig[entry.severity as keyof typeof severityConfig]
                    const isExpanded = expandedEntry === entry.id
                    const isCritical = entry.severity === "critical"

                    return (
                      <Fragment key={entry.id}>
                        <TableRow
                          className={`cursor-pointer transition-colors hover:bg-muted/50 ${isCritical ? "bg-destructive/[0.03]" : ""}`}
                          onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                        >
                          <TableCell>
                            <Badge variant="secondary" className={`text-[9px] ${sev.color}`}>
                              {entry.severity}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs font-medium">{entry.actor}</TableCell>
                          <TableCell className="text-xs max-w-[220px] truncate">{entry.action}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge variant="outline" className="text-[9px]">{entry.module}</Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Globe className="size-2.5" />
                              {entry.ip === "internal" ? "Internal" : entry.location}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock className="size-2.5" />
                              {entry.timestamp}
                            </div>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow key={`${entry.id}-details`}>
                            <TableCell colSpan={6} className="bg-muted/30 p-0">
                              <div className="px-4 py-3">
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                  <div className="flex items-center gap-2">
                                    <Globe className="size-3 text-muted-foreground" />
                                    <div>
                                      <p className="text-[9px] text-muted-foreground">IP Address</p>
                                      <p className="text-[11px] font-medium">{entry.ip}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="size-3 text-muted-foreground" />
                                    <div>
                                      <p className="text-[9px] text-muted-foreground">Location</p>
                                      <p className="text-[11px] font-medium">{entry.location}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Monitor className="size-3 text-muted-foreground" />
                                    <div>
                                      <p className="text-[9px] text-muted-foreground">Device</p>
                                      <p className="text-[11px] font-medium">{entry.device}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Shield className="size-3 text-muted-foreground" />
                                    <div>
                                      <p className="text-[9px] text-muted-foreground">Module</p>
                                      <p className="text-[11px] font-medium">{entry.module}</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-2 rounded-md bg-background px-3 py-2">
                                  <p className="text-[9px] text-muted-foreground">Details</p>
                                  <p className="mt-0.5 text-[11px] leading-relaxed">{entry.details}</p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    )
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Timeline View */}
      {viewMode === "timeline" && (
        <Card>
          <CardContent className="p-4">
            <ScrollArea className="h-[500px]">
              <div className="relative ml-4">
                <div className="absolute left-0 top-0 h-full w-px bg-border" />
                <div className="flex flex-col gap-4">
                  {filtered.map((entry) => {
                    const sev = severityConfig[entry.severity as keyof typeof severityConfig]
                    const isExpanded = expandedEntry === entry.id

                    return (
                      <div key={entry.id} className="relative pl-6">
                        <div className={`absolute left-[-4px] top-2 size-2 rounded-full ${sev.dot}`} />
                        <button
                          onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                          className="w-full text-left rounded-lg border p-3 transition-all hover:bg-muted/30"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" className={`text-[9px] ${sev.color}`}>
                                  {entry.severity}
                                </Badge>
                                <span className="text-xs font-semibold">{entry.actor}</span>
                                <Badge variant="outline" className="text-[9px]">{entry.module}</Badge>
                              </div>
                              <p className="mt-1 text-[11px]">{entry.action}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock className="size-2.5" />
                              {entry.timestamp}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mt-3 grid grid-cols-2 gap-2 rounded-md bg-muted/50 p-2.5 md:grid-cols-4">
                              <div>
                                <p className="text-[9px] text-muted-foreground">IP</p>
                                <p className="text-[10px] font-medium">{entry.ip}</p>
                              </div>
                              <div>
                                <p className="text-[9px] text-muted-foreground">Location</p>
                                <p className="text-[10px] font-medium">{entry.location}</p>
                              </div>
                              <div>
                                <p className="text-[9px] text-muted-foreground">Device</p>
                                <p className="text-[10px] font-medium">{entry.device}</p>
                              </div>
                              <div className="col-span-2 md:col-span-1">
                                <p className="text-[9px] text-muted-foreground">Details</p>
                                <p className="text-[10px] leading-relaxed">{entry.details}</p>
                              </div>
                            </div>
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
