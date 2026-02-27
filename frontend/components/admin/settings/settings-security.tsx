"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { ipWhitelist as initialIPs, type IPWhitelistEntry } from "@/lib/mock-data"
import {
  Shield,
  Key,
  Globe,
  Plus,
  Trash2,
  ShieldCheck,
  Lock,
  Fingerprint,
} from "lucide-react"

export function SettingsSecurity() {
  const [sessionTimeout, setSessionTimeout] = useState("30")
  const [mfaEnforcement, setMfaEnforcement] = useState("admins")
  const [autoApprove, setAutoApprove] = useState(false)
  const [autoApproveThreshold, setAutoApproveThreshold] = useState("3")
  const [ipRestrictions, setIpRestrictions] = useState(true)
  const [geoRestrictions, setGeoRestrictions] = useState(false)
  const [allowedRegions, setAllowedRegions] = useState("all")
  const [ips, setIps] = useState<IPWhitelistEntry[]>(initialIPs)
  const [addIpDialog, setAddIpDialog] = useState(false)
  const [newIp, setNewIp] = useState("")
  const [newIpLabel, setNewIpLabel] = useState("")
  const [passwordMinLength, setPasswordMinLength] = useState("8")
  const [requireSpecialChar, setRequireSpecialChar] = useState(true)
  const [bruteForceProtection, setBruteForceProtection] = useState(true)
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5")

  const addIp = () => {
    if (!newIp.trim()) return
    const entry: IPWhitelistEntry = {
      id: `IP-${ips.length + 1}`.padStart(6, "0"),
      ip: newIp,
      label: newIpLabel || "Unlabeled",
      addedBy: "Admin (Super)",
      addedAt: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
    }
    setIps([...ips, entry])
    setNewIp("")
    setNewIpLabel("")
    setAddIpDialog(false)
    toast.success("IP address added to whitelist")
  }

  const removeIp = (id: string) => {
    setIps(ips.filter((ip) => ip.id !== id))
    toast.success("IP address removed from whitelist")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="size-4 text-primary" />
            <CardTitle className="text-sm">Authentication</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Session management and password policies
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Session Timeout (minutes)</Label>
              <Input
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Min Password Length</Label>
              <Input
                type="number"
                value={passwordMinLength}
                onChange={(e) => setPasswordMinLength(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium">Require Special Characters</p>
              <p className="text-[10px] text-muted-foreground">Passwords must include special characters</p>
            </div>
            <Switch checked={requireSpecialChar} onCheckedChange={setRequireSpecialChar} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium">Brute Force Protection</p>
              <p className="text-[10px] text-muted-foreground">Lock account after failed login attempts</p>
            </div>
            <Switch checked={bruteForceProtection} onCheckedChange={setBruteForceProtection} />
          </div>
          {bruteForceProtection && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Max Login Attempts Before Lockout</Label>
              <Input
                type="number"
                value={maxLoginAttempts}
                onChange={(e) => setMaxLoginAttempts(e.target.value)}
                className="max-w-[200px]"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* MFA Enforcement */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Fingerprint className="size-4 text-primary" />
            <CardTitle className="text-sm">Multi-Factor Authentication</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Enforce MFA for specific roles or sensitive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">MFA Enforcement Policy</Label>
            <Select value={mfaEnforcement} onValueChange={setMfaEnforcement}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No enforcement</SelectItem>
                <SelectItem value="admins">Required for Admins & Super Admins</SelectItem>
                <SelectItem value="all_staff">Required for all staff roles</SelectItem>
                <SelectItem value="everyone">Required for all users</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-accent" />
              <span className="text-xs text-muted-foreground">
                {mfaEnforcement === "none" && "MFA is optional for all users."}
                {mfaEnforcement === "admins" && "Admin and Super Admin roles must use MFA on every login."}
                {mfaEnforcement === "all_staff" && "All staff roles (Admin, Moderator, Support, Analyst) must use MFA."}
                {mfaEnforcement === "everyone" && "All platform users, including clients and specialists, must use MFA."}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-Approve Verifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-primary" />
            <CardTitle className="text-sm">Smart Auto-Approve</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Automatically approve verifications based on rules and thresholds
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium">Enable Auto-Approve</p>
              <p className="text-[10px] text-muted-foreground">Auto-approve verified specialists meeting criteria</p>
            </div>
            <Switch checked={autoApprove} onCheckedChange={setAutoApprove} />
          </div>
          {autoApprove && (
            <>
              <Separator />
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Minimum Positive Reviews Required</Label>
                <Input
                  type="number"
                  value={autoApproveThreshold}
                  onChange={(e) => setAutoApproveThreshold(e.target.value)}
                  className="max-w-[200px]"
                />
              </div>
              <div className="rounded-lg border border-accent/30 bg-accent/5 p-3">
                <p className="text-xs text-accent">
                  Specialists with {autoApproveThreshold}+ positive reviews and all clear documents will be auto-approved.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* IP Whitelisting */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="size-4 text-primary" />
              <div>
                <CardTitle className="text-sm">IP Whitelisting & Geo-Restrictions</CardTitle>
                <CardDescription className="text-xs">
                  Control access based on IP ranges or geographic regions
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium">Enable IP Restrictions</p>
              <p className="text-[10px] text-muted-foreground">Only allow admin access from whitelisted IPs</p>
            </div>
            <Switch checked={ipRestrictions} onCheckedChange={setIpRestrictions} />
          </div>

          {ipRestrictions && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Whitelisted IP Addresses</p>
                <Button variant="outline" size="sm" onClick={() => setAddIpDialog(true)}>
                  <Plus className="mr-1.5 size-3" />
                  Add IP
                </Button>
              </div>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">IP / Range</TableHead>
                      <TableHead className="text-xs">Label</TableHead>
                      <TableHead className="hidden text-xs md:table-cell">Added By</TableHead>
                      <TableHead className="hidden text-xs md:table-cell">Last Used</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ips.map((ip) => (
                      <TableRow key={ip.id}>
                        <TableCell className="font-mono text-xs">{ip.ip}</TableCell>
                        <TableCell className="text-xs">{ip.label}</TableCell>
                        <TableCell className="hidden text-xs text-muted-foreground md:table-cell">{ip.addedBy}</TableCell>
                        <TableCell className="hidden text-xs text-muted-foreground md:table-cell">{ip.lastUsed}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => removeIp(ip.id)}
                          >
                            <Trash2 className="size-3 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium">Enable Geo-Restrictions</p>
              <p className="text-[10px] text-muted-foreground">Restrict platform access to specific regions</p>
            </div>
            <Switch checked={geoRestrictions} onCheckedChange={setGeoRestrictions} />
          </div>
          {geoRestrictions && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Allowed Regions</Label>
              <Select value={allowedRegions} onValueChange={setAllowedRegions}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="middle_east">Middle East Only</SelectItem>
                  <SelectItem value="me_europe">Middle East + Europe</SelectItem>
                  <SelectItem value="custom">Custom List</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add IP Dialog */}
      <Dialog open={addIpDialog} onOpenChange={setAddIpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Lock className="size-4" />
              Add IP Address
            </DialogTitle>
            <DialogDescription className="text-xs">
              Add a new IP address or range to the whitelist.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">IP Address or CIDR Range</Label>
              <Input
                placeholder="e.g., 192.168.1.100 or 10.0.0.0/16"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Label (optional)</Label>
              <Input
                placeholder="e.g., Home Office"
                value={newIpLabel}
                onChange={(e) => setNewIpLabel(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAddIpDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={addIp}>Add to Whitelist</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
