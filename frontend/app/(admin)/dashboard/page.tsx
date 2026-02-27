"use client"

import { kpiData } from "@/lib/mock-data"
import { KPICard } from "@/components/admin/kpi-card"
import {
  RevenueByCategoryChart,
  WeeklyUsersChart,
  TopProfessionsList,
  RecentActivityFeed,
  SystemHealthWidget,
  PlanSubscriptionOverview,
  MonthlyClientsByPlanChart,
  AppointmentsSummaryWidget,
} from "@/components/admin/dashboard-charts"
import {
  Users,
  UserCheck,
  DollarSign,
  ShieldAlert,
  UserPlus,
  Star,
  MessageSquare,
  CalendarCheck,
} from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Overview of the Skillers platform performance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title={kpiData.totalUsers.label}
          value={kpiData.totalUsers.value}
          change={kpiData.totalUsers.change}
          icon={Users}
        />
        <KPICard
          title={kpiData.activeSpecialists.label}
          value={kpiData.activeSpecialists.value}
          change={kpiData.activeSpecialists.change}
          icon={UserCheck}
        />
        <KPICard
          title={kpiData.revenueMonth.label}
          value={kpiData.revenueMonth.value}
          change={kpiData.revenueMonth.change}
          icon={DollarSign}
          format="currency"
        />
        <KPICard
          title={kpiData.pendingVerifications.label}
          value={kpiData.pendingVerifications.value}
          change={kpiData.pendingVerifications.change}
          icon={ShieldAlert}
        />
        <KPICard
          title={kpiData.newSignups.label}
          value={kpiData.newSignups.value}
          change={kpiData.newSignups.change}
          icon={UserPlus}
        />
        <KPICard
          title={kpiData.avgRating.label}
          value={kpiData.avgRating.value}
          change={kpiData.avgRating.change}
          icon={Star}
          format="rating"
        />
        <KPICard
          title={kpiData.activeChats.label}
          value={kpiData.activeChats.value}
          change={kpiData.activeChats.change}
          icon={MessageSquare}
        />
        <KPICard
          title="Today's Appointments"
          value={2}
          change={15.2}
          icon={CalendarCheck}
        />
      </div>

      {/* Appointments Summary + Subscription Overview */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AppointmentsSummaryWidget />
        <PlanSubscriptionOverview />
      </div>

      {/* Monthly Clients by Plan */}
      <MonthlyClientsByPlanChart />

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RevenueByCategoryChart />
        <WeeklyUsersChart />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TopProfessionsList />
        <RecentActivityFeed />
        <SystemHealthWidget />
      </div>
    </div>
  )
}
