"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Shield, Clock } from "lucide-react"
import { verificationAuditLog } from "@/lib/mock-data"

export function VerificationAuditLog() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Shield className="size-4 text-primary" />
          <CardTitle className="text-sm" style={{ fontFamily: "var(--font-heading)" }}>
            Audit Log
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[260px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Actor</TableHead>
                <TableHead className="text-xs">Action</TableHead>
                <TableHead className="hidden text-xs md:table-cell">Target</TableHead>
                <TableHead className="text-xs">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {verificationAuditLog.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-xs font-medium">{entry.actor}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{entry.action}</TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                    {entry.target}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Clock className="size-2.5" />
                      {entry.date}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
