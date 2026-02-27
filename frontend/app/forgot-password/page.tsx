"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error("Please enter your email")
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setSent(true)
    toast.success("Reset link sent!")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="flex w-full max-w-[400px] flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary">
            <Zap className="size-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            Reset Password
          </h1>
          <p className="text-center text-sm text-muted-foreground">
            {sent
              ? "Check your email for a reset link"
              : "Enter your email to receive a password reset link"}
          </p>
        </div>

        <Card className="w-full">
          <CardContent className="p-6">
            {sent ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <CheckCircle2 className="size-12 text-accent" />
                <p className="text-center text-sm text-muted-foreground">
                  We&apos;ve sent a password reset link to{" "}
                  <span className="font-medium text-foreground">{email}</span>
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">
                    <ArrowLeft className="mr-1 size-4" />
                    Back to Sign In
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="admin@skillers.app"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-1 size-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/login">
                    <ArrowLeft className="mr-1 size-4" />
                    Back to Sign In
                  </Link>
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-[10px] text-muted-foreground">
          Powered by{" "}
          <span className="font-semibold text-destructive" style={{ fontFamily: "var(--font-heading)" }}>
            {"{ Brainlets }"}
          </span>
        </p>
      </div>
    </div>
  )
}
