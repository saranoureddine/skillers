"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Navigation } from "lucide-react"

const locationStats = [
  { city: "Beirut", specialists: 189, clients: 4520, topCategory: "Doctors" },
  { city: "Tripoli", specialists: 87, clients: 2340, topCategory: "IT Workers" },
  { city: "Sidon", specialists: 56, clients: 1890, topCategory: "Teachers" },
  { city: "Jounieh", specialists: 43, clients: 1650, topCategory: "Translators" },
  { city: "Zahle", specialists: 38, clients: 1200, topCategory: "Nurses" },
  { city: "Byblos", specialists: 28, clients: 980, topCategory: "Chefs" },
  { city: "Tyre", specialists: 25, clients: 870, topCategory: "Journalists" },
  { city: "Baalbek", specialists: 22, clients: 760, topCategory: "Teachers" },
  { city: "Nabatieh", specialists: 34, clients: 1100, topCategory: "IT Workers" },
  { city: "Aabbasiyyeh", specialists: 12, clients: 450, topCategory: "Doctors" },
]

export default function MapPage() {
  const totalSpecialists = locationStats.reduce((sum, l) => sum + l.specialists, 0)
  const totalClients = locationStats.reduce((sum, l) => sum + l.clients, 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          Location & Map
        </h1>
        <p className="text-sm text-muted-foreground">
          Geographic distribution of users and specialists
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              <p className="text-xs text-muted-foreground">Active Locations</p>
            </div>
            <p className="text-2xl font-bold">{locationStats.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-accent" />
              <p className="text-xs text-muted-foreground">Total Specialists</p>
            </div>
            <p className="text-2xl font-bold">{totalSpecialists}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Navigation className="size-4 text-chart-1" />
              <p className="text-xs text-muted-foreground">Total Clients</p>
            </div>
            <p className="text-2xl font-bold">{totalClients.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Location Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {locationStats
              .sort((a, b) => b.specialists + b.clients - (a.specialists + a.clients))
              .map((location) => {
                const total = location.specialists + location.clients
                const maxTotal = locationStats[0].specialists + locationStats[0].clients
                return (
                  <div key={location.city} className="flex items-center gap-3 rounded-lg border p-3">
                    <MapPin className="size-4 text-primary" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{location.city}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px]">
                            {location.topCategory}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-1 flex items-center gap-4">
                        <span className="text-[10px] text-muted-foreground">
                          {location.specialists} specialists
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {location.clients.toLocaleString()} clients
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(total / maxTotal) * 100}%` }}
                        />
                      </div>
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
