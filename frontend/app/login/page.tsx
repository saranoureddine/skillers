"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, Mail, Lock, LogIn } from "lucide-react"
import { toast } from "sonner"
import { agUsersService } from "@/services/api/ag-users.service"

export default function LoginPage() {
  const router = useRouter()
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!login.trim() || !password.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    setLoading(true)

    try {
      const response = await agUsersService.login({
        login: login.trim(),
        password: password.trim(),
      })

      // Response might be wrapped in data property (from TransformInterceptor)
      const responseData = (response as any).data || response

      if (responseData.succeeded) {
        // Store user data and session in localStorage
        if (responseData.user) {
          localStorage.setItem('user', JSON.stringify(responseData.user))
          localStorage.setItem('skillers_user', JSON.stringify(responseData.user))
          localStorage.setItem('permissions', JSON.stringify(responseData.permissions || []))
          localStorage.setItem('skillers_permissions', JSON.stringify(responseData.permissions || []))
          localStorage.setItem('session', 'true')
        }
        
        // Store token for authentication (token is returned separately, not in user object)
        if (responseData.token) {
          localStorage.setItem(
            process.env.NEXT_PUBLIC_JWT_TOKEN_KEY || 'skillers_jwt_token',
            responseData.token
          )
          // Also store in auth token key for compatibility
          localStorage.setItem(
            process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'skillers_auth_token',
            responseData.token
          )
        }

        // Show success toast with API message
        toast.success(responseData.message || "Login successful")
        
        // Redirect to dashboard
        router.push("/dashboard")
      } else {
        toast.error(responseData.message || "Invalid credentials")
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Login failed. Please try again."
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f0f4f8]">
      {/* Background decorative circles */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-[400px] w-[400px] rounded-full bg-[#e8eef5]/60" />
      <div className="pointer-events-none absolute -right-10 top-10 h-[300px] w-[300px] rounded-full bg-[#dce6f0]/40" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[350px] w-[350px] rounded-full bg-[#e8eef5]/50" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[460px] mx-4">
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-black/5">
          {/* Top blue gradient bar */}
          <div className="h-1.5 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600" />

          <div className="px-8 pb-10 pt-8 sm:px-10">
            {/* Logo */}
            <div className="mb-8 flex flex-col items-center gap-1">
              <div className="relative mb-1 flex h-16 w-16 items-center justify-center">
                <Image
                  src="/placeholder-logo.png"
                  alt="Skillers"
                  width={64}
                  height={64}
                  className="object-contain"
                  priority
                />
              </div>
              <span
                className="text-sm font-bold tracking-wider text-[#3b82f6]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                SKILLERS
              </span>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              {/* Email / Phone field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Email or Phone Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter your email or phone"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 pr-11 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    autoComplete="username"
                    autoFocus
                  />
                  <Mail className="pointer-events-none absolute right-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Password field */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-[#3b82f6] transition-colors hover:text-blue-700"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 pr-11 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Lock className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Sign In button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#3b82f6] text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-[18px] w-[18px] animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-[18px] w-[18px]" />
                    Sign In
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Powered by{" "}
          <span
            className="font-semibold text-gray-500"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Brain Space
          </span>
        </p>
      </div>
    </div>
  )
}
