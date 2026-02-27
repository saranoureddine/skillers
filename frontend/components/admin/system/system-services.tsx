"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Server,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  GitBranch,
} from "lucide-react"
import { systemHealth } from "@/lib/mock-data"

const statusConfig = {
  healthy: { icon: CheckCircle2, color: "text-accent", bg: "bg-accent/10", border: "border-accent/30", label: "Healthy" },
  degraded: { icon: AlertTriangle, color: "text-chart-3", bg: "bg-chart-3/10", border: "border-chart-3/30", label: "Degraded" },
  down: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", label: "Down" },
}

function getResponseTimeSeverity(ms: number): "green" | "yellow" | "red" {
  if (ms > 500) return "red"
  if (ms > 200) return "yellow"
  return "green"
}

function getUptimeSeverity(pct: number): "green" | "yellow" | "red" {
  if (pct < 99.0) return "red"
  if (pct < 99.9) return "yellow"
  return "green"
}

const sevColors = {
  green: "text-accent",
  yellow: "text-chart-3",
  red: "text-destructive",
}

export function SystemServices() {
  const [expandedService, setExpandedService] = useState<string | null>(null)
  const [showDeps, setShowDeps] = useState(false)

  const services = systemHealth.services
  const healthyCount = services.filter((s) => s.status === "healthy").length
  const degradedCount = services.filter((s) => s.status === "degraded").length
  const downCount = services.filter((s) => s.status === "down").length

  return (
    <div className="flex flex-col gap-4">
      {/* Overview */}
      <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-accent/10">
              <Server className="size-4 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Services</p>
              <p className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>{services.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-accent/10">
              <CheckCircle2 className="size-4 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Healthy</p>
              <p className="text-lg font-bold text-accent" style={{ fontFamily: "var(--font-heading)" }}>{healthyCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-chart-3/10">
              <AlertTriangle className="size-4 text-chart-3" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Degraded</p>
              <p className="text-lg font-bold text-chart-3" style={{ fontFamily: "var(--font-heading)" }}>{degradedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hidden md:block">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/10">
              <XCircle className="size-4 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Down</p>
              <p className="text-lg font-bold text-destructive" style={{ fontFamily: "var(--font-heading)" }}>{downCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Cards */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Server className="size-4 text-primary" />
              Service Health Details
            </CardTitle>
            <button
              onClick={() => setShowDeps(!showDeps)}
              className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <GitBranch className="size-3" />
              {showDeps ? "Hide" : "Show"} Dependencies
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-2 md:grid-cols-2">
            {services.map((service) => {
              const config = statusConfig[service.status]
              const StatusIcon = config.icon
              const rtSev = getResponseTimeSeverity(service.responseTime)
              const utSev = getUptimeSeverity(service.uptime)
              const isExpanded = expandedService === service.name

              return (
                <div key={service.name} className={`rounded-lg border ${config.border} transition-all`}>
                  <button
                    onClick={() => setExpandedService(isExpanded ? null : service.name)}
                    className="flex w-full items-center gap-3 p-3 text-left"
                  >
                    <div className={`flex size-8 items-center justify-center rounded-md ${config.bg}`}>
                      <StatusIcon className={`size-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{service.name}</span>
                        <Badge variant="secondary" className={`text-[9px] ${config.bg} ${config.color}`}>
                          {config.label}
                        </Badge>
                      </div>
                      <div className="mt-0.5 flex items-center gap-3">
                        <span className={`text-[10px] ${sevColors[rtSev]}`}>{service.responseTime}ms</span>
                        <span className={`text-[10px] ${sevColors[utSev]}`}>{service.uptime}%</span>
                        {service.affectedEndpoints > 0 && (
                          <span className="text-[10px] text-destructive">{service.affectedEndpoints} endpoints affected</span>
                        )}
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="size-3.5 shrink-0 text-muted-foreground" /> : <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />}
                  </button>

                  {isExpanded && (
                    <div className="border-t px-3 pb-3 pt-2">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                          <p className="text-[9px] text-muted-foreground">Response Time</p>
                          <p className={`text-xs font-semibold ${sevColors[rtSev]}`}>{service.responseTime}ms</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground">Uptime</p>
                          <p className={`text-xs font-semibold ${sevColors[utSev]}`}>{service.uptime}%</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground">Last Downtime</p>
                          <div className="flex items-center gap-1">
                            <Clock className="size-2.5 text-muted-foreground" />
                            <p className="text-xs">{service.lastDowntime}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground">Endpoints</p>
                          <p className="text-xs">{service.endpoints} total, {service.affectedEndpoints} affected</p>
                        </div>
                      </div>

                      {showDeps && service.dependencies.length > 0 && (
                        <div className="mt-2 rounded-md bg-muted/50 px-2.5 py-2">
                          <p className="text-[9px] font-medium text-muted-foreground">Dependencies</p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {service.dependencies.map((dep) => {
                              const depService = services.find((s) => s.name === dep)
                              const depStatus = depService ? statusConfig[depService.status] : statusConfig.healthy
                              return (
                                <TooltipProvider key={dep}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" className="gap-1 text-[9px]">
                                        <div className={`size-1.5 rounded-full ${depStatus.bg.replace('/10', '')} ${depStatus.color}`} />
                                        {dep}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">{dep}: {depStatus.label}</p>
                                      {depService && <p className="text-[10px] text-muted-foreground">{depService.responseTime}ms / {depService.uptime}% uptime</p>}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dependency Graph Overview */}
      {showDeps && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <GitBranch className="size-4 text-chart-4" />
              Service Dependency Map
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex flex-col gap-3">
                {services.map((service) => {
                  const config = statusConfig[service.status]
                  const dependents = services.filter((s) => s.dependencies.includes(service.name))
                  return (
                    <div key={service.name} className="flex items-center gap-3">
                      <div className="flex w-36 shrink-0 items-center gap-2">
                        <div className={`size-2 rounded-full ${config.color === "text-accent" ? "bg-accent" : config.color === "text-chart-3" ? "bg-chart-3" : "bg-destructive"}`} />
                        <span className="text-[11px] font-medium truncate">{service.name}</span>
                      </div>
                      {dependents.length > 0 && (
                        <>
                          <ArrowUpRight className="size-3 text-muted-foreground shrink-0" />
                          <div className="flex flex-wrap gap-1">
                            {dependents.map((dep) => {
                              const depConfig = statusConfig[dep.status]
                              return (
                                <Badge key={dep.name} variant="outline" className={`text-[9px] ${depConfig.bg} ${depConfig.color}`}>
                                  {dep.name}
                                </Badge>
                              )
                            })}
                          </div>
                        </>
                      )}
                      {dependents.length === 0 && (
                        <span className="text-[10px] text-muted-foreground italic">No dependents</span>
                      )}
                    </div>
                  )
                })}
              </div>
              <p className="mt-3 text-[9px] text-muted-foreground">
                Arrows show which services depend on each service. If a service goes down, its dependents may be impacted.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
