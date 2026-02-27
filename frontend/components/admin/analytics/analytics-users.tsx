"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  userGrowthOverTime,
  engagementOverTime,
  topActiveClients,
  topActiveSpecialists,
  usersByRole,
  weeklyUsers,
} from "@/lib/mock-data"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TrendingUp, Star, MapPin } from "lucide-react"

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--foreground)",
  fontSize: "12px",
}

export function UserGrowthChart() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          User Growth Over Time
        </CardTitle>
        <CardDescription className="text-xs">Total, new, and active users by month</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={userGrowthOverTime}>
              <defs>
                <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [value.toLocaleString(), name]} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Area type="monotone" dataKey="totalUsers" name="Total" stroke="var(--chart-1)" fill="url(#gradTotal)" strokeWidth={2} />
              <Area type="monotone" dataKey="activeUsers" name="Active" stroke="var(--chart-3)" fill="url(#gradActive)" strokeWidth={2} />
              <Area type="monotone" dataKey="newUsers" name="New" stroke="var(--chart-2)" fill="url(#gradNew)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function UserRoleDistribution() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          User Distribution
        </CardTitle>
        <CardDescription className="text-xs">Clients vs Specialists</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4">
          <div className="h-[180px] w-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={usersByRole}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  dataKey="count"
                  nameKey="role"
                >
                  {usersByRole.map((entry) => (
                    <Cell key={entry.role} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [value.toLocaleString(), "Users"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-3">
            {usersByRole.map((role) => (
              <div key={role.role} className="flex items-center gap-2">
                <div className="size-3 rounded-sm" style={{ backgroundColor: role.color }} />
                <div>
                  <p className="text-sm font-medium">{role.role}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {role.count.toLocaleString()} ({role.pct}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function WeeklySignupsChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          Weekly Signups
        </CardTitle>
        <CardDescription className="text-xs">New users vs specialists this week</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyUsers}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="users" name="Users" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="specialists" name="Specialists" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function EngagementChart() {
  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          Platform Engagement
        </CardTitle>
        <CardDescription className="text-xs">Posts, comments, likes, and reviews over time</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={engagementOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="posts" name="Posts" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="comments" name="Comments" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="reviews" name="Reviews" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function TopClientsTable({ onDrillDown }: { onDrillDown?: (name: string, type: string) => void }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          Top Active Clients
        </CardTitle>
        <CardDescription className="text-xs">Ranked by total orders</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Client</TableHead>
              <TableHead className="text-xs text-right">Orders</TableHead>
              <TableHead className="text-xs text-right">Spent</TableHead>
              <TableHead className="text-xs text-right">Plan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topActiveClients.map((client) => (
              <TableRow
                key={client.name}
                className={onDrillDown ? "cursor-pointer hover:bg-muted/50" : ""}
                onClick={() => onDrillDown?.(client.name, "client")}
              >
                <TableCell className="text-xs">
                  <div className="flex flex-col">
                    <span className="font-medium">{client.name}</span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <MapPin className="size-2.5" />
                      {client.location}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-xs font-bold tabular-nums">
                  {client.orders}
                </TableCell>
                <TableCell className="text-right text-xs tabular-nums">
                  ${client.spent.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${client.plan === "Premium" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}
                  >
                    {client.plan}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export function TopSpecialistsTable({ onDrillDown }: { onDrillDown?: (name: string, type: string) => void }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          Top Active Specialists
        </CardTitle>
        <CardDescription className="text-xs">Ranked by total orders</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Specialist</TableHead>
              <TableHead className="text-xs text-right">Orders</TableHead>
              <TableHead className="text-xs text-right">Revenue</TableHead>
              <TableHead className="text-xs text-right">Rating</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topActiveSpecialists.map((spec) => (
              <TableRow
                key={spec.name}
                className={onDrillDown ? "cursor-pointer hover:bg-muted/50" : ""}
                onClick={() => onDrillDown?.(spec.name, "specialist")}
              >
                <TableCell className="text-xs">
                  <div className="flex flex-col">
                    <span className="font-medium">{spec.name}</span>
                    <span className="text-[10px] text-muted-foreground">{spec.profession}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-xs font-bold tabular-nums">
                  {spec.orders}
                </TableCell>
                <TableCell className="text-right text-xs tabular-nums">
                  ${spec.revenue.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Star className="size-3 fill-chart-3 text-chart-3" />
                    <span className="text-xs font-medium">{spec.rating}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
