"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { metricsTimeline1h, metricsTimeline24h, metricsTimeline7d } from "@/lib/mock-data"
import { Activity, Cpu, Zap, HardDrive, Gauge } from "lucide-react"

type TimeRange = "1h" | "24h" | "7d"

export function SystemMetricsCharts() {
  const [range, setRange] = useState<TimeRange>("1h")

  const getXKey = () => {
    if (range === "1h") return "time"
    if (range === "24h") return "hour"
    return "day"
  }

  const getData = () => {
    if (range === "1h") return metricsTimeline1h
    if (range === "24h") return metricsTimeline24h
    return metricsTimeline7d
  }

  const data = getData()
  const xKey = getXKey()

  return (
    <div className="flex flex-col gap-4">
      {/* Time range selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Activity className="size-4 text-primary" />
          Metric Trends
        </h3>
        <Tabs value={range} onValueChange={(v) => setRange(v as TimeRange)}>
          <TabsList className="h-8">
            <TabsTrigger value="1h" className="text-xs px-3 h-6">1h</TabsTrigger>
            <TabsTrigger value="24h" className="text-xs px-3 h-6">24h</TabsTrigger>
            <TabsTrigger value="7d" className="text-xs px-3 h-6">7d</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* API Latency & Error Rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold">
              <Zap className="size-3.5 text-primary" />
              API Latency & Error Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey={xKey} tick={{ fontSize: 10 }} className="text-muted-foreground" interval={range === "1h" ? 9 : "preserveStartEnd"} />
                <YAxis yAxisId="latency" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                <YAxis yAxisId="error" orientation="right" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }}
                  labelStyle={{ fontSize: 11, fontWeight: 600 }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                <Line yAxisId="latency" type="monotone" dataKey="apiLatency" name="Latency (ms)" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                <Line yAxisId="error" type="monotone" dataKey="errorRate" name="Error Rate (%)" stroke="var(--chart-5)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* CPU & Memory */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold">
              <Cpu className="size-3.5 text-chart-3" />
              CPU & Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey={xKey} tick={{ fontSize: 10 }} className="text-muted-foreground" interval={range === "1h" ? 9 : "preserveStartEnd"} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }}
                  labelStyle={{ fontSize: 11, fontWeight: 600 }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                <Area type="monotone" dataKey="cpu" name="CPU (%)" fill="var(--chart-3)" fillOpacity={0.15} stroke="var(--chart-3)" strokeWidth={2} />
                <Area type="monotone" dataKey="memory" name="Memory (%)" fill="var(--chart-4)" fillOpacity={0.15} stroke="var(--chart-4)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sessions & Requests */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold">
              <Activity className="size-3.5 text-accent" />
              Sessions & Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey={xKey} tick={{ fontSize: 10 }} className="text-muted-foreground" interval={range === "1h" ? 9 : "preserveStartEnd"} />
                <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }}
                  labelStyle={{ fontSize: 11, fontWeight: 600 }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                <Area type="monotone" dataKey="sessions" name="Sessions" fill="var(--chart-2)" fillOpacity={0.15} stroke="var(--chart-2)" strokeWidth={2} />
                <Area type="monotone" dataKey="requests" name="Requests/min" fill="var(--chart-1)" fillOpacity={0.1} stroke="var(--chart-1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Network I/O (only for 1h) */}
        {range === "1h" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                <HardDrive className="size-3.5 text-chart-4" />
                Network & Disk I/O
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey={xKey} tick={{ fontSize: 10 }} className="text-muted-foreground" interval={9} />
                  <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }}
                    labelStyle={{ fontSize: 11, fontWeight: 600 }}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="networkIn" name="Net In (MB/s)" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="networkOut" name="Net Out (MB/s)" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="diskIO" name="Disk I/O (%)" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {range !== "1h" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                <Gauge className="size-3.5 text-chart-4" />
                {range === "7d" ? "Weekly Incidents" : "Hourly Distribution"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey={xKey} tick={{ fontSize: 10 }} className="text-muted-foreground" interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }}
                    labelStyle={{ fontSize: 11, fontWeight: 600 }}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="sessions" name="Sessions" fill="var(--chart-2)" fillOpacity={0.15} stroke="var(--chart-2)" strokeWidth={2} />
                  <Area type="monotone" dataKey="requests" name={range === "7d" ? "Total Requests" : "Requests/hr"} fill="var(--chart-1)" fillOpacity={0.1} stroke="var(--chart-1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
