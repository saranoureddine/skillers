"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  Gauge,
  Server,
  Shield,
  Zap,
  Bell,
  RefreshCw,
} from "lucide-react"
import { SystemKPIs } from "@/components/admin/system/system-kpis"
import { SystemMetricsCharts } from "@/components/admin/system/system-metrics-charts"
import { SystemHeatmap } from "@/components/admin/system/system-heatmap"
import { SystemAnomalies } from "@/components/admin/system/system-anomalies"
import { SystemServices } from "@/components/admin/system/system-services"
import { SystemAudit } from "@/components/admin/system/system-audit"
import { SystemAlerts } from "@/components/admin/system/system-alerts"
import { anomalies, systemHealth } from "@/lib/mock-data"

function useAutoRefresh(interval: number) {
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setIsRefreshing(true)
      setTimeout(() => {
        setLastRefresh(new Date())
        setIsRefreshing(false)
      }, 600)
    }, interval)
    return () => clearInterval(timer)
  }, [interval])

  const manualRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setLastRefresh(new Date())
      setIsRefreshing(false)
    }, 600)
  }

  return { lastRefresh, isRefreshing, manualRefresh }
}

export default function SystemPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const { lastRefresh, isRefreshing, manualRefresh } = useAutoRefresh(30000)

  const activeAnomalies = anomalies.filter((a) => a.status !== "resolved").length
  const degradedServices = systemHealth.services.filter((s) => s.status !== "healthy").length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            System Monitor & Audit
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time platform health, predictive analytics, and audit intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeAnomalies > 0 && (
            <Badge variant="secondary" className="bg-destructive/10 text-destructive text-[10px] gap-1">
              <Zap className="size-3" />
              {activeAnomalies} Active Anomal{activeAnomalies === 1 ? "y" : "ies"}
            </Badge>
          )}
          {degradedServices > 0 && (
            <Badge variant="secondary" className="bg-chart-3/10 text-chart-3 text-[10px] gap-1">
              <Server className="size-3" />
              {degradedServices} Degraded
            </Badge>
          )}
          <button
            onClick={manualRefresh}
            className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[10px] text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50"
          >
            <RefreshCw className={`size-3 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : `Updated ${lastRefresh.toLocaleTimeString()}`}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-4">
        <TabsList className="h-9 w-fit">
          <TabsTrigger value="overview" className="gap-1.5 text-xs">
            <Gauge className="size-3.5" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="metrics" className="gap-1.5 text-xs">
            <Activity className="size-3.5" />
            <span className="hidden sm:inline">Metrics</span>
          </TabsTrigger>
          <TabsTrigger value="ai-insights" className="gap-1.5 text-xs">
            <Zap className="size-3.5" />
            <span className="hidden sm:inline">AI Insights</span>
            {activeAnomalies > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                {activeAnomalies}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="services" className="gap-1.5 text-xs">
            <Server className="size-3.5" />
            <span className="hidden sm:inline">Services</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-1.5 text-xs">
            <Shield className="size-3.5" />
            <span className="hidden sm:inline">Audit Log</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-1.5 text-xs">
            <Bell className="size-3.5" />
            <span className="hidden sm:inline">Alerts</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="flex flex-col gap-6 mt-0">
          <SystemKPIs />
          <SystemMetricsCharts />
          <SystemHeatmap />
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="flex flex-col gap-6 mt-0">
          <SystemKPIs />
          <SystemMetricsCharts />
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai-insights" className="flex flex-col gap-4 mt-0">
          <SystemAnomalies />
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="flex flex-col gap-4 mt-0">
          <SystemServices />
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="flex flex-col gap-4 mt-0">
          <SystemAudit />
        </TabsContent>

        {/* Alerts Config Tab */}
        <TabsContent value="alerts" className="flex flex-col gap-4 mt-0">
          <SystemAlerts />
        </TabsContent>
      </Tabs>
    </div>
  )
}
