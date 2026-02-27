"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsKPIs } from "@/components/admin/analytics/analytics-kpis"
import { AnalyticsFilters } from "@/components/admin/analytics/analytics-filters"
import {
  UserGrowthChart,
  UserRoleDistribution,
  WeeklySignupsChart,
  EngagementChart,
  TopClientsTable,
  TopSpecialistsTable,
} from "@/components/admin/analytics/analytics-users"
import {
  RevenueKPICards,
  RevenueGrowthChart,
  RevenueByCategoryChart,
  RevenueByPlanChart,
  TopRevenueSpecialistsTable,
  ChurnRateChart,
  ChurnReasonsChart,
} from "@/components/admin/analytics/analytics-revenue"
import {
  AppointmentKPICards,
  AppointmentsTrendChart,
  AppointmentsByTypeChart,
  CancellationReasonsChart,
  AppointmentRevenueChart,
} from "@/components/admin/analytics/analytics-appointments"
import {
  ModerationKPICards,
  ReportsByTypeChart,
  ReportsByReasonChart,
  LocationAnalyticsTable,
  LocationBarChart,
} from "@/components/admin/analytics/analytics-content"
import { DrillDownModal } from "@/components/admin/analytics/analytics-drill-down"

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("monthly")
  const [userType, setUserType] = useState("all")
  const [activeTab, setActiveTab] = useState("overview")

  // Drill-down modal state
  const [drillDownOpen, setDrillDownOpen] = useState(false)
  const [drillDownEntity, setDrillDownEntity] = useState<string | null>(null)
  const [drillDownType, setDrillDownType] = useState<string | null>(null)

  const handleDrillDown = (name: string, type: string) => {
    setDrillDownEntity(name)
    setDrillDownType(type)
    setDrillDownOpen(true)
  }

  const handleLocationDrillDown = (location: string) => {
    setDrillDownEntity(location)
    setDrillDownType("location")
    setDrillDownOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-balance"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Analytics & Reports
          </h1>
          <p className="text-sm text-muted-foreground">
            Deep insights into platform performance and growth
          </p>
        </div>
      </div>

      {/* Top-level KPIs */}
      <AnalyticsKPIs />

      {/* Filters */}
      <AnalyticsFilters
        dateRange={dateRange}
        setDateRange={setDateRange}
        userType={userType}
        setUserType={setUserType}
      />

      {/* Tabbed sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-4">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
          {[
            { value: "overview", label: "Overview" },
            { value: "users", label: "Users & Activity" },
            { value: "revenue", label: "Subscriptions & Revenue" },
            { value: "appointments", label: "Appointments" },
            { value: "content", label: "Content & Moderation" },
            { value: "locations", label: "Locations" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-lg border border-transparent bg-transparent px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <UserGrowthChart />
            <UserRoleDistribution />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <RevenueGrowthChart />
            <RevenueByCategoryChart />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TopSpecialistsTable onDrillDown={handleDrillDown} />
            <TopClientsTable onDrillDown={handleDrillDown} />
          </div>
        </TabsContent>

        {/* USERS TAB */}
        <TabsContent value="users" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <UserGrowthChart />
            <UserRoleDistribution />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <WeeklySignupsChart />
            <EngagementChart />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TopClientsTable onDrillDown={handleDrillDown} />
            <TopSpecialistsTable onDrillDown={handleDrillDown} />
          </div>
        </TabsContent>

        {/* REVENUE TAB */}
        <TabsContent value="revenue" className="flex flex-col gap-4">
          <RevenueKPICards />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <RevenueGrowthChart />
            <RevenueByCategoryChart />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RevenueByPlanChart />
            <TopRevenueSpecialistsTable onDrillDown={handleDrillDown} />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChurnRateChart />
            <ChurnReasonsChart />
          </div>
        </TabsContent>

        {/* APPOINTMENTS TAB */}
        <TabsContent value="appointments" className="flex flex-col gap-4">
          <AppointmentKPICards />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <AppointmentsTrendChart />
            <AppointmentsByTypeChart />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <CancellationReasonsChart />
            <AppointmentRevenueChart />
          </div>
        </TabsContent>

        {/* CONTENT & MODERATION TAB */}
        <TabsContent value="content" className="flex flex-col gap-4">
          <ModerationKPICards />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ReportsByTypeChart />
            <ReportsByReasonChart />
          </div>
        </TabsContent>

        {/* LOCATIONS TAB */}
        <TabsContent value="locations" className="flex flex-col gap-4">
          <LocationBarChart />
          <LocationAnalyticsTable onDrillDown={handleLocationDrillDown} />
        </TabsContent>
      </Tabs>

      {/* Drill-down modal */}
      <DrillDownModal
        open={drillDownOpen}
        onOpenChange={setDrillDownOpen}
        entityName={drillDownEntity}
        entityType={drillDownType}
      />
    </div>
  )
}
