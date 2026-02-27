"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { heatmapData } from "@/lib/mock-data"
import { Flame } from "lucide-react"

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const hours = Array.from({ length: 24 }, (_, i) => i)

function getHeatColor(value: number): string {
  if (value >= 80) return "bg-destructive/80"
  if (value >= 60) return "bg-chart-3/70"
  if (value >= 40) return "bg-chart-3/40"
  if (value >= 20) return "bg-accent/40"
  return "bg-accent/15"
}

function getHeatLabel(value: number): string {
  if (value >= 80) return "Very High"
  if (value >= 60) return "High"
  if (value >= 40) return "Moderate"
  if (value >= 20) return "Low"
  return "Very Low"
}

export function SystemHeatmap() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Flame className="size-4 text-chart-3" />
          Traffic Heatmap (Requests by Day & Hour)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hours header */}
            <div className="mb-1 flex items-center gap-[2px]">
              <div className="w-10 shrink-0" />
              {hours.map((h) => (
                <div key={h} className="flex-1 text-center text-[9px] text-muted-foreground">
                  {h % 3 === 0 ? `${String(h).padStart(2, "0")}` : ""}
                </div>
              ))}
            </div>

            {/* Grid */}
            <TooltipProvider delayDuration={100}>
              {days.map((day) => (
                <div key={day} className="mb-[2px] flex items-center gap-[2px]">
                  <div className="w-10 shrink-0 text-[10px] font-medium text-muted-foreground">{day}</div>
                  {hours.map((hour) => {
                    const cell = heatmapData.find((d) => d.day === day && d.hour === hour)
                    const val = cell?.value || 0
                    return (
                      <Tooltip key={`${day}-${hour}`}>
                        <TooltipTrigger asChild>
                          <div className={`flex-1 h-6 rounded-sm ${getHeatColor(val)} transition-colors cursor-default`} />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <p className="font-medium">{day} {String(hour).padStart(2, "0")}:00</p>
                          <p className="text-muted-foreground">Load: {val}% ({getHeatLabel(val)})</p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              ))}
            </TooltipProvider>

            {/* Legend */}
            <div className="mt-3 flex items-center justify-end gap-2">
              <span className="text-[9px] text-muted-foreground">Low</span>
              <div className="flex items-center gap-[2px]">
                <div className="h-3 w-5 rounded-sm bg-accent/15" />
                <div className="h-3 w-5 rounded-sm bg-accent/40" />
                <div className="h-3 w-5 rounded-sm bg-chart-3/40" />
                <div className="h-3 w-5 rounded-sm bg-chart-3/70" />
                <div className="h-3 w-5 rounded-sm bg-destructive/80" />
              </div>
              <span className="text-[9px] text-muted-foreground">High</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
