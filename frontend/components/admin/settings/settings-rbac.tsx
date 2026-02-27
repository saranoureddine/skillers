"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { settingsRoles as initialRoles, settingsPermissionModules, type SettingsRole } from "@/lib/mock-data"
import {
  Users,
  ShieldCheck,
  Plus,
  Pencil,
  Crown,
} from "lucide-react"

export function SettingsRBAC() {
  const [roles, setRoles] = useState<SettingsRole[]>(initialRoles)
  const [editDialog, setEditDialog] = useState(false)
  const [editRole, setEditRole] = useState<SettingsRole | null>(null)
  const [newPermissions, setNewPermissions] = useState<string[]>([])

  const openEdit = (role: SettingsRole) => {
    setEditRole(role)
    setNewPermissions(role.permissions)
    setEditDialog(true)
  }

  const togglePermission = (perm: string) => {
    setNewPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    )
  }

  const saveRole = () => {
    if (!editRole) return
    setRoles((prev) =>
      prev.map((r) => (r.id === editRole.id ? { ...r, permissions: newPermissions } : r))
    )
    setEditDialog(false)
    toast.success(`Permissions updated for ${editRole.name}`)
  }

  const permissionLabels: Record<string, string> = {
    users: "User Management",
    content: "Content",
    settings: "Settings",
    verification: "Verification",
    moderation: "Moderation",
    reviews: "Reviews",
    chats: "Chats",
    analytics: "Analytics",
    subscriptions: "Subscriptions",
    notifications: "Notifications",
    system: "System",
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Roles Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <div>
                <CardTitle className="text-sm">Roles & Permissions</CardTitle>
                <CardDescription className="text-xs">
                  Define fine-grained permissions for each admin role
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {roles.map((role) => (
            <div key={role.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${role.color}15` }}
                  >
                    {role.name === "Super Admin" ? (
                      <Crown className="size-4" style={{ color: role.color }} />
                    ) : (
                      <ShieldCheck className="size-4" style={{ color: role.color }} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{role.name}</p>
                      <Badge variant="secondary" className="text-[9px]">
                        {role.members} {role.members === 1 ? "member" : "members"}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{role.description}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(role)}
                  disabled={role.permissions.includes("all")}
                >
                  <Pencil className="mr-1.5 size-3" />
                  Edit
                </Button>
              </div>
              <Separator className="my-3" />
              <div className="flex flex-wrap gap-1.5">
                {role.permissions.includes("all") ? (
                  <Badge variant="secondary" className="text-[9px] bg-destructive/10 text-destructive border-destructive/20">
                    All Permissions
                  </Badge>
                ) : (
                  role.permissions.map((perm) => (
                    <Badge key={perm} variant="outline" className="text-[9px]">
                      {perm}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Permission Matrix Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Permission Matrix</CardTitle>
          <CardDescription className="text-xs">
            Overview of permissions across all roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left font-medium text-muted-foreground">Module</th>
                  {roles.map((role) => (
                    <th key={role.id} className="p-2 text-center font-medium" style={{ color: role.color }}>
                      {role.name.split(" ")[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {settingsPermissionModules.map((mod) => (
                  <tr key={mod} className="border-b border-muted/50">
                    <td className="p-2 font-medium capitalize">{permissionLabels[mod] || mod}</td>
                    {roles.map((role) => {
                      const hasRead = role.permissions.includes("all") || role.permissions.includes(`${mod}.read`)
                      const hasWrite = role.permissions.includes("all") || role.permissions.includes(`${mod}.write`)
                      return (
                        <td key={role.id} className="p-2 text-center">
                          {hasRead && hasWrite ? (
                            <Badge variant="secondary" className="bg-accent/10 text-accent text-[8px]">R/W</Badge>
                          ) : hasRead ? (
                            <Badge variant="secondary" className="bg-primary/10 text-primary text-[8px]">R</Badge>
                          ) : (
                            <span className="text-muted-foreground/50">--</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Permissions Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">
              Edit Permissions: {editRole?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Toggle read and write access for each module.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto py-2">
            <div className="flex flex-col gap-3">
              {settingsPermissionModules.map((mod) => (
                <div key={mod} className="flex items-center justify-between rounded-lg border p-3">
                  <p className="text-xs font-medium capitalize">{permissionLabels[mod] || mod}</p>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5">
                      <Checkbox
                        checked={newPermissions.includes(`${mod}.read`)}
                        onCheckedChange={() => togglePermission(`${mod}.read`)}
                      />
                      <span className="text-[10px] text-muted-foreground">Read</span>
                    </label>
                    <label className="flex items-center gap-1.5">
                      <Checkbox
                        checked={newPermissions.includes(`${mod}.write`)}
                        onCheckedChange={() => togglePermission(`${mod}.write`)}
                      />
                      <span className="text-[10px] text-muted-foreground">Write</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={saveRole}>Save Permissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
