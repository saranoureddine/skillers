"use client"

import { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Settings,
  Shield,
  Bell,
  Activity,
  Users,
  History,
  Search,
  Save,
  HelpCircle,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SettingsGeneral } from "@/components/admin/settings/settings-general"
import { SettingsSecurity } from "@/components/admin/settings/settings-security"
import { SettingsRBAC } from "@/components/admin/settings/settings-rbac"
import { SettingsNotifications } from "@/components/admin/settings/settings-notifications"
import { SettingsSystem } from "@/components/admin/settings/settings-system"
import { SettingsAudit } from "@/components/admin/settings/settings-audit"

const tabConfig = [
  { value: "general", label: "General", icon: Settings, keywords: ["app name", "language", "region", "timezone", "maintenance", "feature toggles", "upload", "core"] },
  { value: "security", label: "Security", icon: Shield, keywords: ["password", "session", "mfa", "authentication", "ip", "whitelist", "geo", "auto-approve", "brute force"] },
  { value: "rbac", label: "Roles & Access", icon: Users, keywords: ["roles", "permissions", "rbac", "admin", "moderator", "support", "analyst", "access control"] },
  { value: "notifications", label: "Notifications", icon: Bell, keywords: ["email", "push", "sms", "digest", "alerts", "templates", "notification"] },
  { value: "system", label: "System & Monitoring", icon: Activity, keywords: ["cpu", "memory", "disk", "uptime", "latency", "backup", "recovery", "version", "health", "services", "predictive"] },
  { value: "audit", label: "Audit Trail", icon: History, keywords: ["changelog", "rollback", "changes", "history", "log", "who changed"] },
]

export default function SettingsPage() {
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("general")

  const filteredTabs = useMemo(() => {
    if (!search.trim()) return tabConfig
    const q = search.toLowerCase()
    return tabConfig.filter(
      (tab) =>
        tab.label.toLowerCase().includes(q) ||
        tab.keywords.some((kw) => kw.includes(q))
    )
  }, [search])

  const handleSearch = (value: string) => {
    setSearch(value)
    if (value.trim()) {
      const q = value.toLowerCase()
      const match = tabConfig.find(
        (tab) =>
          tab.label.toLowerCase().includes(q) ||
          tab.keywords.some((kw) => kw.includes(q))
      )
      if (match) {
        setActiveTab(match.value)
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Platform Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure, secure, and monitor your platform from one place
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <HelpCircle className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Search any setting by name or category</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button onClick={() => toast.success("All settings saved successfully!")}>
            <Save className="mr-1.5 size-4" />
            Save All Changes
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search settings... (e.g., MFA, backup, language, roles)"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Search Results Indicator */}
      {search.trim() && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {filteredTabs.length} {filteredTabs.length === 1 ? "section" : "sections"} found
          </Badge>
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setSearch("")}>
            Clear search
          </Button>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
          {tabConfig.map((tab) => {
            const isVisible = filteredTabs.some((ft) => ft.value === tab.value)
            if (!isVisible && search.trim()) return null
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gap-1.5 rounded-lg border border-transparent px-3 py-2 text-xs data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                <tab.icon className="size-3.5" />
                {tab.label}
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <SettingsGeneral />
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <SettingsSecurity />
        </TabsContent>

        <TabsContent value="rbac" className="mt-4">
          <SettingsRBAC />
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <SettingsNotifications />
        </TabsContent>

        <TabsContent value="system" className="mt-4">
          <SettingsSystem />
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <SettingsAudit />
        </TabsContent>
      </Tabs>
    </div>
  )
}
