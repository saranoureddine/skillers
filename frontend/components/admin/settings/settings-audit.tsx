"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { settingsChangeLog as initialLog, type SettingsChangeLog } from "@/lib/mock-data"
import {
  History,
  RotateCcw,
  ArrowRight,
  AlertTriangle,
} from "lucide-react"

export function SettingsAudit() {
  const [log, setLog] = useState<SettingsChangeLog[]>(initialLog)
  const [rollbackDialog, setRollbackDialog] = useState(false)
  const [rollbackEntry, setRollbackEntry] = useState<SettingsChangeLog | null>(null)

  const openRollback = (entry: SettingsChangeLog) => {
    setRollbackEntry(entry)
    setRollbackDialog(true)
  }

  const performRollback = () => {
    if (!rollbackEntry) return
    setLog((prev) =>
      prev.map((e) =>
        e.id === rollbackEntry.id
          ? { ...e, newValue: e.oldValue, oldValue: e.newValue, changedBy: "Admin (Super)", changedAt: new Date().toISOString().replace("T", " ").slice(0, 16), canRollback: false }
          : e
      )
    )
    setRollbackDialog(false)
    toast.success(`Rolled back: ${rollbackEntry.setting}`)
  }

  const moduleColor: Record<string, string> = {
    General: "bg-primary/10 text-primary",
    Security: "bg-destructive/10 text-destructive",
    Notifications: "bg-chart-3/10 text-chart-3",
    System: "bg-accent/10 text-accent",
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Settings Change Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="size-4 text-primary" />
            <div>
              <CardTitle className="text-sm">Settings Change Log</CardTitle>
              <CardDescription className="text-xs">
                Track who changed which setting and when, with rollback capability
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Setting</TableHead>
                  <TableHead className="text-xs">Change</TableHead>
                  <TableHead className="hidden text-xs md:table-cell">Module</TableHead>
                  <TableHead className="hidden text-xs md:table-cell">Changed By</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {log.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-xs font-medium">{entry.setting}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[9px] bg-destructive/5 text-destructive/80 line-through">
                          {entry.oldValue}
                        </Badge>
                        <ArrowRight className="size-3 text-muted-foreground" />
                        <Badge variant="outline" className="text-[9px] bg-accent/5 text-accent">
                          {entry.newValue}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary" className={`text-[9px] ${moduleColor[entry.module] || ""}`}>
                        {entry.module}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                      {entry.changedBy}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{entry.changedAt}</TableCell>
                    <TableCell>
                      {entry.canRollback && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => openRollback(entry)}
                        >
                          <RotateCcw className="size-3" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground">Total Changes</p>
            <p className="text-lg font-bold">{log.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground">Rollbackable</p>
            <p className="text-lg font-bold">{log.filter((e) => e.canRollback).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground">Security Changes</p>
            <p className="text-lg font-bold">{log.filter((e) => e.module === "Security").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground">Unique Actors</p>
            <p className="text-lg font-bold">{new Set(log.map((e) => e.changedBy)).size}</p>
          </CardContent>
        </Card>
      </div>

      {/* Rollback Confirmation Dialog */}
      <Dialog open={rollbackDialog} onOpenChange={setRollbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="size-4 text-chart-3" />
              Confirm Rollback
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to rollback this setting change?
            </DialogDescription>
          </DialogHeader>
          {rollbackEntry && (
            <div className="rounded-lg border p-4">
              <p className="text-xs font-medium">{rollbackEntry.setting}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline" className="text-[9px]">
                  Current: {rollbackEntry.newValue}
                </Badge>
                <ArrowRight className="size-3 text-muted-foreground" />
                <Badge variant="outline" className="text-[9px] bg-accent/5 text-accent">
                  Rollback to: {rollbackEntry.oldValue}
                </Badge>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">
                Changed by {rollbackEntry.changedBy} on {rollbackEntry.changedAt}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setRollbackDialog(false)}>Cancel</Button>
            <Button size="sm" variant="destructive" onClick={performRollback}>
              <RotateCcw className="mr-1.5 size-3" />
              Confirm Rollback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
