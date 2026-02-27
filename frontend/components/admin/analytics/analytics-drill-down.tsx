"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  users,
  appointments,
  reviews,
  usersByLocation,
  topActiveSpecialists,
  topActiveClients,
} from "@/lib/mock-data"
import {
  Star,
  MapPin,
  DollarSign,
  CalendarCheck,
  ShoppingBag,
  Clock,
  User,
  Briefcase,
  Mail,
  Phone,
} from "lucide-react"

interface DrillDownModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityName: string | null
  entityType: string | null
}

export function DrillDownModal({ open, onOpenChange, entityName, entityType }: DrillDownModalProps) {
  if (!entityName) return null

  if (entityType === "specialist") {
    return <SpecialistDrillDown open={open} onOpenChange={onOpenChange} name={entityName} />
  }
  if (entityType === "client") {
    return <ClientDrillDown open={open} onOpenChange={onOpenChange} name={entityName} />
  }
  if (entityType === "location") {
    return <LocationDrillDown open={open} onOpenChange={onOpenChange} location={entityName} />
  }

  return null
}

function SpecialistDrillDown({ open, onOpenChange, name }: { open: boolean; onOpenChange: (o: boolean) => void; name: string }) {
  const user = users.find((u) => u.name === name)
  const spec = topActiveSpecialists.find((s) => s.name === name)
  const specAppointments = appointments.filter((a) => a.specialist === name)
  const specReviews = reviews.filter((r) => r.specialist === name)
  const completed = specAppointments.filter((a) => a.status === "completed")
  const totalRev = completed.reduce((s, a) => s + a.amount, 0)
  const avgRating = specReviews.length > 0 ? specReviews.reduce((s, r) => s + r.rating, 0) / specReviews.length : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <Briefcase className="size-5 text-primary" />
            {name}
          </DialogTitle>
          <DialogDescription>
            Specialist performance drill-down
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Profile info */}
          {user && (
            <div className="flex flex-col gap-2 rounded-lg border p-3">
              <div className="flex items-center gap-2 text-xs">
                <Mail className="size-3 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Phone className="size-3 text-muted-foreground" />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <MapPin className="size-3 text-muted-foreground" />
                <span>{user.location}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Briefcase className="size-3 text-muted-foreground" />
                <span>{user.profession || "N/A"}</span>
              </div>
            </div>
          )}

          {/* KPI grid */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat icon={ShoppingBag} label="Orders" value={spec?.orders?.toString() || user?.ordersCount?.toString() || "0"} />
            <Stat icon={DollarSign} label="Revenue" value={`$${(spec?.revenue || totalRev).toLocaleString()}`} />
            <Stat icon={Star} label="Avg Rating" value={avgRating > 0 ? avgRating.toFixed(1) : (user?.rating?.toString() || "N/A")} />
            <Stat icon={CalendarCheck} label="Completed" value={completed.length.toString()} />
          </div>

          <Separator />

          {/* Recent appointments */}
          <div>
            <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Recent Appointments
            </h4>
            {specAppointments.length === 0 ? (
              <p className="text-xs text-muted-foreground">No appointment data available</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {specAppointments.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-md border p-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">{a.client}</span>
                      <span className="text-[10px] text-muted-foreground">{a.date} at {a.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold tabular-nums">${a.amount}</span>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${a.status === "completed" ? "bg-accent/10 text-accent" : a.status === "canceled" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}
                      >
                        {a.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews */}
          {specReviews.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Reviews
              </h4>
              <div className="flex flex-col gap-1.5">
                {specReviews.slice(0, 3).map((r) => (
                  <div key={r.id} className="rounded-md border p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{r.reviewer}</span>
                      <div className="flex items-center gap-1">
                        <Star className="size-3 fill-chart-3 text-chart-3" />
                        <span className="text-xs">{r.rating}</span>
                      </div>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ClientDrillDown({ open, onOpenChange, name }: { open: boolean; onOpenChange: (o: boolean) => void; name: string }) {
  const user = users.find((u) => u.name === name)
  const client = topActiveClients.find((c) => c.name === name)
  const clientAppointments = appointments.filter((a) => a.client === name)
  const completed = clientAppointments.filter((a) => a.status === "completed")
  const totalSpent = completed.reduce((s, a) => s + a.amount, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <User className="size-5 text-primary" />
            {name}
          </DialogTitle>
          <DialogDescription>Client engagement drill-down</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {user && (
            <div className="flex flex-col gap-2 rounded-lg border p-3">
              <div className="flex items-center gap-2 text-xs">
                <Mail className="size-3 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <MapPin className="size-3 text-muted-foreground" />
                <span>{user.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={`text-[10px] ${user.accountType === "premium" ? "bg-accent/10 text-accent" : ""}`}
                >
                  {user.accountType}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  Joined {user.joinDate}
                </Badge>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat icon={ShoppingBag} label="Orders" value={client?.orders?.toString() || user?.ordersCount?.toString() || "0"} />
            <Stat icon={DollarSign} label="Total Spent" value={`$${(client?.spent || totalSpent).toLocaleString()}`} />
            <Stat icon={CalendarCheck} label="Completed" value={completed.length.toString()} />
            <Stat icon={Clock} label="Last Active" value={user?.lastActive || "N/A"} />
          </div>

          <Separator />

          <div>
            <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Recent Appointments
            </h4>
            {clientAppointments.length === 0 ? (
              <p className="text-xs text-muted-foreground">No appointment data available</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {clientAppointments.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-md border p-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">{a.specialist}</span>
                      <span className="text-[10px] text-muted-foreground">{a.date} at {a.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold tabular-nums">${a.amount}</span>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${a.status === "completed" ? "bg-accent/10 text-accent" : a.status === "canceled" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}
                      >
                        {a.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function LocationDrillDown({ open, onOpenChange, location }: { open: boolean; onOpenChange: (o: boolean) => void; location: string }) {
  const locData = usersByLocation.find((l) => l.location === location)
  const locUsers = users.filter((u) => u.location === location)
  const locAppointments = appointments.filter((a) => a.location === location)
  const completedAppts = locAppointments.filter((a) => a.status === "completed")
  const totalRev = completedAppts.reduce((s, a) => s + a.amount, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <MapPin className="size-5 text-primary" />
            {location}
          </DialogTitle>
          <DialogDescription>Geographic drill-down insights</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat icon={User} label="Users" value={locData?.users?.toLocaleString() || locUsers.length.toString()} />
            <Stat icon={Briefcase} label="Specialists" value={locData?.specialists?.toLocaleString() || locUsers.filter(u => u.role === "specialist").length.toString()} />
            <Stat icon={DollarSign} label="Revenue" value={`$${(locData?.revenue || totalRev).toLocaleString()}`} />
            <Stat icon={CalendarCheck} label="Appts" value={locAppointments.length.toString()} />
          </div>

          <Separator />

          {locUsers.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Users in {location}
              </h4>
              <div className="flex flex-col gap-1.5">
                {locUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between rounded-md border p-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">{u.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {u.role === "specialist" ? u.profession : "Client"} - {u.ordersCount} orders
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${u.status === "active" ? "bg-accent/10 text-accent" : u.status === "suspended" ? "bg-chart-3/10 text-chart-3" : "bg-destructive/10 text-destructive"}`}
                    >
                      {u.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-muted/50 p-2.5 text-center">
      <Icon className="mb-1 size-4 text-muted-foreground" />
      <span className="text-sm font-bold tabular-nums" style={{ fontFamily: "var(--font-heading)" }}>
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  )
}
