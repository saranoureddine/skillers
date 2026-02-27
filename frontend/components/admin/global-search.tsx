"use client"

import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  LayoutDashboard,
  Users,
  FolderTree,

  MessageSquare,
  Star,
  CreditCard,
  BarChart3,
  Settings,
  Bell,
  Flag,
  ShieldCheck,
} from "lucide-react"

const pages = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/" },
  { title: "All Users", icon: Users, href: "/users" },
  { title: "Categories & Professions", icon: FolderTree, href: "/categories" },

  { title: "Chats & Messages", icon: MessageSquare, href: "/chats" },
  { title: "Reviews & Ratings", icon: Star, href: "/reviews" },
  { title: "Subscriptions & Revenue", icon: CreditCard, href: "/subscriptions" },
  { title: "Notifications", icon: Bell, href: "/notifications" },
  { title: "Verification & KYC", icon: ShieldCheck, href: "/verification" },
  { title: "Moderation & Reports", icon: Flag, href: "/moderation" },
  { title: "Analytics", icon: BarChart3, href: "/analytics" },
  { title: "Settings", icon: Settings, href: "/settings" },
]

const quickActions = [
  { title: "Add New User", href: "/users" },
  { title: "Create Category", href: "/categories" },
  { title: "Send Notification", href: "/notifications" },
  { title: "View Reports", href: "/moderation" },
]

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter()

  const handleSelect = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search pages, users, categories..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {pages.map((page) => (
            <CommandItem key={page.href} onSelect={() => handleSelect(page.href)}>
              <page.icon className="mr-2 size-4" />
              <span>{page.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          {quickActions.map((action) => (
            <CommandItem key={action.title} onSelect={() => handleSelect(action.href)}>
              <span>{action.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
