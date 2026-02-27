"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertTriangle,
  ShieldAlert,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Zap,
  TrendingUp,
  Lightbulb,
  ExternalLink,
} from "lucide-react"
import { anomalies, predictions, suggestedActions } from "@/lib/mock-data"

const severityConfig = {
  critical: { icon: ShieldAlert, bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/30", badge: "bg-destructive/15 text-destructive" },
  warning: { icon: AlertTriangle, bg: "bg-chart-3/10", text: "text-chart-3", border: "border-chart-3/30", badge: "bg-chart-3/15 text-chart-3" },
  info: { icon: Info, bg: "bg-primary/10", text: "text-primary", border: "border-primary/30", badge: "bg-primary/15 text-primary" },
}

const statusConfig = {
  active: { label: "Active", color: "bg-destructive/15 text-destructive" },
  investigating: { label: "Investigating", color: "bg-chart-3/15 text-chart-3" },
  resolved: { label: "Resolved", color: "bg-accent/15 text-accent" },
}

const riskConfig = {
  high: { color: "bg-destructive/15 text-destructive", label: "High Risk" },
  medium: { color: "bg-chart-3/15 text-chart-3", label: "Medium Risk" },
  low: { color: "bg-accent/15 text-accent", label: "Low Risk" },
}

const priorityConfig = {
  high: { color: "bg-destructive/15 text-destructive" },
  medium: { color: "bg-chart-3/15 text-chart-3" },
  low: { color: "bg-primary/15 text-primary" },
}

export function SystemAnomalies() {
  const [expandedAnomaly, setExpandedAnomaly] = useState<string | null>(null)
  const [expandedPrediction, setExpandedPrediction] = useState<string | null>(null)
  const [showAllActions, setShowAllActions] = useState(false)

  const activeAnomalies = anomalies.filter((a) => a.status !== "resolved")
  const resolvedAnomalies = anomalies.filter((a) => a.status === "resolved")
  const pendingActions = suggestedActions.filter((a) => a.status === "pending")
  const visibleActions = showAllActions ? suggestedActions : pendingActions.slice(0, 3)

  return (
    <div className="flex flex-col gap-4">
      {/* Top summary bar */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/10">
              <ShieldAlert className="size-4 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Anomalies</p>
              <p className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>{activeAnomalies.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-chart-3/10">
              <TrendingUp className="size-4 text-chart-3" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Predictions</p>
              <p className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>{predictions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <Lightbulb className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending Actions</p>
              <p className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>{pendingActions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-accent/10">
              <CheckCircle2 className="size-4 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Resolved</p>
              <p className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>{resolvedAnomalies.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Anomaly Detection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Zap className="size-4 text-destructive" />
              Anomaly Detection
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 pt-0">
            {anomalies.map((anomaly) => {
              const sev = severityConfig[anomaly.severity as keyof typeof severityConfig] || severityConfig.info
              const stat = statusConfig[anomaly.status as keyof typeof statusConfig]
              const SevIcon = sev.icon
              const isExpanded = expandedAnomaly === anomaly.id

              return (
                <div key={anomaly.id} className={`rounded-lg border ${sev.border} ${sev.bg} transition-all`}>
                  <button
                    onClick={() => setExpandedAnomaly(isExpanded ? null : anomaly.id)}
                    className="flex w-full items-start gap-3 p-3 text-left"
                  >
                    <SevIcon className={`mt-0.5 size-4 shrink-0 ${sev.text}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold">{anomaly.metric}</span>
                        <Badge variant="secondary" className={`text-[9px] ${sev.badge}`}>
                          {anomaly.severity}
                        </Badge>
                        <Badge variant="secondary" className={`text-[9px] ${stat.color}`}>
                          {stat.label}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground truncate">{anomaly.message}</p>
                    </div>
                    {isExpanded ? <ChevronUp className="size-3.5 shrink-0 text-muted-foreground mt-1" /> : <ChevronDown className="size-3.5 shrink-0 text-muted-foreground mt-1" />}
                  </button>
                  {isExpanded && (
                    <div className="border-t px-3 pb-3 pt-2" style={{ borderColor: "inherit" }}>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                        <div>
                          <p className="text-[9px] text-muted-foreground">Current Value</p>
                          <p className="text-xs font-semibold text-destructive">{anomaly.value}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground">Baseline</p>
                          <p className="text-xs font-semibold text-accent">{anomaly.baseline}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground">Detected</p>
                          <p className="text-xs">{anomaly.detected}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground">Affected Service</p>
                          <p className="text-xs">{anomaly.affectedService}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* AI Predictions & Forecasts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="size-4 text-chart-4" />
              AI Predictions & Forecasts
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 pt-0">
            {predictions.map((pred) => {
              const risk = riskConfig[pred.risk]
              const isExpanded = expandedPrediction === pred.id

              return (
                <div key={pred.id} className="rounded-lg border bg-card transition-all">
                  <button
                    onClick={() => setExpandedPrediction(isExpanded ? null : pred.id)}
                    className="flex w-full items-start gap-3 p-3 text-left"
                  >
                    <TrendingUp className="mt-0.5 size-4 shrink-0 text-chart-4" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold">{pred.metric}</span>
                        <Badge variant="secondary" className={`text-[9px] ${risk.color}`}>
                          {risk.label}
                        </Badge>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-[9px] text-muted-foreground">{pred.confidence}% confidence</span>
                            </TooltipTrigger>
                            <TooltipContent><p className="text-xs">AI model confidence level</p></TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="mt-0.5 text-[11px] font-medium">{pred.forecast}</p>
                    </div>
                    {isExpanded ? <ChevronUp className="size-3.5 shrink-0 text-muted-foreground mt-1" /> : <ChevronDown className="size-3.5 shrink-0 text-muted-foreground mt-1" />}
                  </button>
                  {isExpanded && (
                    <div className="border-t px-3 pb-3 pt-2">
                      <p className="text-[11px] text-muted-foreground">{pred.detail}</p>
                      <div className="mt-2 flex items-center gap-2 rounded-md bg-primary/5 px-2 py-1.5">
                        <Lightbulb className="size-3 text-primary" />
                        <p className="text-[10px] font-medium text-primary">{pred.action}</p>
                      </div>
                      <div className="mt-2">
                        <p className="text-[9px] text-muted-foreground">Confidence</p>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-chart-4 transition-all" style={{ width: `${pred.confidence}%` }} />
                          </div>
                          <span className="text-[10px] font-medium">{pred.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Suggested Actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Lightbulb className="size-4 text-primary" />
              Suggested Actions
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowAllActions(!showAllActions)}>
              {showAllActions ? "Show Pending" : `Show All (${suggestedActions.length})`}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {visibleActions.map((act) => {
              const pri = priorityConfig[act.priority]
              return (
                <div key={act.id} className="flex flex-col gap-2 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{act.title}</span>
                    <Badge variant="secondary" className={`text-[9px] ${pri.color}`}>{act.priority}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{act.reason}</p>
                  <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1.5">
                    <ExternalLink className="size-2.5 text-primary" />
                    <p className="text-[10px] font-medium">{act.action}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    {act.relatedAnomaly && (
                      <span className="text-[9px] text-muted-foreground">Linked: {act.relatedAnomaly}</span>
                    )}
                    <Badge variant="outline" className={`ml-auto text-[9px] ${act.status === "completed" ? "bg-accent/10 text-accent" : "bg-chart-3/10 text-chart-3"}`}>
                      {act.status}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
