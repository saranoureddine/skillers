"use client"

import { useTheme } from "next-themes"
import { Search, Sun, Moon, Bell, Command } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { GlobalSearch } from "./global-search"

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/users": "User Management",
  "/categories": "Categories & Professions",
  "/orders": "Orders & Appointments",
  "/chats": "Chats & Messages",
  "/timeline": "Timeline / Posts",
  "/reviews": "Reviews & Ratings",
  "/subscriptions": "Subscriptions & Revenue",
  "/notifications": "Notifications",
  "/map": "Location & Map",
  "/verification": "Verification & KYC",
  "/moderation": "Moderation & Reports",
  "/analytics": "Analytics",
  "/system": "System Monitor",
  "/settings": "Settings",
}

export function Topbar() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)
  const pageTitle = pageTitles[pathname] || "Dashboard"

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault()
      setSearchOpen(true)
    }
  }, [])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-card px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />

        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Admin</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden gap-2 text-muted-foreground md:flex"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="size-4" />
            <span className="text-xs">Search...</span>
            <kbd className="pointer-events-none flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
              <Command className="size-3" />K
            </kbd>
          </Button>

          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="size-4" />
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-primary-foreground">
              3
            </span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <Separator orientation="vertical" className="h-6 hidden md:block" />

          <div className="hidden items-center gap-2 md:flex">
            <div className="flex size-7 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              SA
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium">Super Admin</span>
              <Badge variant="secondary" className="h-4 text-[9px] px-1">Super Admin</Badge>
            </div>
          </div>
        </div>
      </header>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
