"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface KPICardProps {
  title: string
  value: string | number
  change: number
  icon: LucideIcon
  format?: "number" | "currency" | "rating"
}

export function KPICard({ title, value, change, icon: Icon, format = "number" }: KPICardProps) {
  const isPositive = change >= 0

  const formatValue = () => {
    if (format === "currency") return `$${Number(value).toLocaleString()}`
    if (format === "rating") return value
    return Number(value).toLocaleString()
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">{title}</span>
            <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              {formatValue()}
            </span>
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="size-3 text-accent" />
              ) : (
                <TrendingDown className="size-3 text-destructive" />
              )}
              <span className={`text-xs font-medium ${isPositive ? "text-accent" : "text-destructive"}`}>
                {isPositive ? "+" : ""}{change}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </div>
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="size-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
