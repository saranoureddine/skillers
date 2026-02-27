"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { usersService } from "@/services/api/users.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Download, MoreHorizontal, Eye, Ban, Trash2, Loader2, Users, UserCheck, DollarSign, ShieldAlert, TrendingUp, Plus, SlidersHorizontal } from "lucide-react"
import { toast } from "sonner"
import { UserProfilePanel } from "@/components/admin/user-profile-panel"

const statusColors: Record<string, string> = {
  active: "bg-green-500/20 text-green-600 dark:text-green-400",
  inactive: "bg-red-500/20 text-red-600 dark:text-red-400",
  suspended: "bg-chart-3/20 text-chart-3",
  banned: "bg-destructive/20 text-destructive",
}

interface ApiUser {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  country_code: string
  is_activated: number
  location: string | null
  created_at: string
  updated_at: string
  [key: string]: any
}

export default function UsersPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [cityId, setCityId] = useState<number | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [users, setUsers] = useState<ApiUser[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    totalCount: 0,
    pageCount: 0,
    currentPage: 1,
    perPage: 10,
  })
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null)
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    userName: true,
    email: true,
    phoneNumber: true,
    status: true,
    role: true,
    createdAt: true,
  })
  
  // Stats data (will be replaced with API call later)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSpecialists: 0,
    revenueMonth: 0,
    pendingVerifications: 0,
    totalUsersChange: 0,
    activeSpecialistsChange: 0,
    revenueMonthChange: 0,
    pendingVerificationsChange: 0,
  })

  // Check authentication on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('session')
      const user = localStorage.getItem('user') || localStorage.getItem('skillers_user')
      
      if (!session || !user) {
        toast.error("Please login to access this page")
        router.push('/login')
        return
      }
    }
  }, [router])

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const params: any = {
          page,
          perPage,
        }
        
        if (search.trim()) {
          params.search = search.trim()
        }
        
        if (cityId) {
          params.cityId = cityId
        }

        const response = await usersService.getAllUsersAdmin(params)
        
        // Handle response structure (might be wrapped in data)
        const responseData = response.data || response
        
        if (responseData.succeeded && responseData.users) {
          setUsers(responseData.users)
          setPagination(responseData.pagination || {
            totalCount: responseData.users.length,
            pageCount: 1,
            currentPage: page,
            perPage: perPage,
          })
        } else {
          toast.error(responseData.message || "Failed to fetch users")
          setUsers([])
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to fetch users")
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    // Only fetch if authenticated
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('session')
      if (session) {
        fetchUsers()
      }
    }
  }, [search, cityId, page, perPage])

  // Calculate visible column count for colSpan
  const visibleColumnCount = useMemo(() => {
    return 2 + Object.values(visibleColumns).filter(Boolean).length // checkbox + visible columns + actions
  }, [visibleColumns])

  // Calculate dynamic column widths based on visible columns
  const columnWidths = useMemo(() => {
    const baseWidths: Record<string, number> = {
      userName: 28,
      email: 20,
      role: 10,
      phoneNumber: 15,
      status: 10,
      createdAt: 12,
    }
    // Sum of visible column widths
    const totalVisible = Object.entries(baseWidths)
      .filter(([key]) => visibleColumns[key as keyof typeof visibleColumns])
      .reduce((sum, [, w]) => sum + w, 0)
    
    // Scale factor to fill 100% of remaining space (minus fixed checkbox + actions ~90px)
    const scale = totalVisible > 0 ? 95 / totalVisible : 1
    
    return {
      userName: `${Math.round(baseWidths.userName * scale)}%`,
      email: `${Math.round(baseWidths.email * scale)}%`,
      role: `${Math.round(baseWidths.role * scale)}%`,
      phoneNumber: `${Math.round(baseWidths.phoneNumber * scale)}%`,
      status: `${Math.round(baseWidths.status * scale)}%`,
      createdAt: `${Math.round(baseWidths.createdAt * scale)}%`,
    }
  }, [visibleColumns])

  // Calculate stats from users data (temporary - will be replaced with API)
  useEffect(() => {
    if (users.length > 0) {
      const activeSpecialists = users.filter(u => u.role === 'specialist' && u.is_activated === 1).length
      setStats({
        totalUsers: pagination.totalCount,
        activeSpecialists: activeSpecialists,
        revenueMonth: 0, // Will come from API
        pendingVerifications: 0, // Will come from API
        totalUsersChange: 12.5, // Will come from API
        activeSpecialistsChange: 8.3, // Will come from API
        revenueMonthChange: 18.7, // Will come from API
        pendingVerificationsChange: 15.2, // Will come from API
      })
    }
  }, [users, pagination.totalCount])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            User Management
          </h1>
          <p className="text-sm text-muted-foreground">
            {pagination.totalCount} total users
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => toast.success("Export started", { description: "CSV file will download shortly" })}
        >
          <Download className="size-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+{stats.totalUsersChange}% vs last month</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Specialists Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-muted-foreground">Active Specialists</p>
                <p className="text-2xl font-bold">{stats.activeSpecialists.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+{stats.activeSpecialistsChange}% vs last month</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue (Month) Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-muted-foreground">Revenue (Month)</p>
                <p className="text-2xl font-bold">${stats.revenueMonth.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+{stats.revenueMonthChange}% vs last month</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Verifications Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-muted-foreground">Pending Verifications</p>
                <p className="text-2xl font-bold">{stats.pendingVerifications.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+{stats.pendingVerificationsChange}% vs last month</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <ShieldAlert className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="flex flex-col overflow-hidden h-[700px]">
        {/* Table Toolbar */}
        <div className="flex flex-col gap-3 px-6 py-3 pb-0 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Users Management</h2>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              className="gap-2"
              onClick={() => toast.info("Add new user")}
            >
              <Plus className="size-4" />
              Add New User
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="size-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.userName}
                  onCheckedChange={(checked) => setVisibleColumns(prev => ({ ...prev, userName: checked }))}
                >
                  User Name
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.email}
                  onCheckedChange={(checked) => setVisibleColumns(prev => ({ ...prev, email: checked }))}
                >
                  Email
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.phoneNumber}
                  onCheckedChange={(checked) => setVisibleColumns(prev => ({ ...prev, phoneNumber: checked }))}
                >
                  Phone Number
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.status}
                  onCheckedChange={(checked) => setVisibleColumns(prev => ({ ...prev, status: checked }))}
                >
                  Status
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.role}
                  onCheckedChange={(checked) => setVisibleColumns(prev => ({ ...prev, role: checked }))}
                >
                  Role
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.createdAt}
                  onCheckedChange={(checked) => setVisibleColumns(prev => ({ ...prev, createdAt: checked }))}
                >
                  Created At
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="relative">
              <Input
                placeholder="Search"
                className="h-9 w-[200px] pr-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Fixed Table Header */}
        <div className="bg-muted/80 border-b shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="h-14">
                <th className="w-[40px] py-4 px-4 text-left align-middle"><Checkbox /></th>
                {visibleColumns.userName && (
                  <th className="py-4 px-4 text-left align-middle text-sm font-bold text-foreground" style={{ width: columnWidths.userName }}>User Name</th>
                )}
                {visibleColumns.email && (
                  <th className="py-4 px-4 text-left align-middle text-sm font-bold text-foreground" style={{ width: columnWidths.email }}>Email</th>
                )}
                {visibleColumns.role && (
                  <th className="py-4 px-4 text-left align-middle text-sm font-bold text-foreground" style={{ width: columnWidths.role }}>Role</th>
                )}
                {visibleColumns.phoneNumber && (
                  <th className="py-4 px-4 text-left align-middle text-sm font-bold text-foreground" style={{ width: columnWidths.phoneNumber }}>Phone Number</th>
                )}
                {visibleColumns.status && (
                  <th className="py-4 px-4 text-left align-middle text-sm font-bold text-foreground" style={{ width: columnWidths.status }}>Status</th>
                )}
                {visibleColumns.createdAt && (
                  <th className="py-4 px-4 text-left align-middle text-sm font-bold text-foreground" style={{ width: columnWidths.createdAt }}>Created At</th>
                )}
                <th className="w-[50px] py-4 px-4 text-left align-middle text-sm font-bold text-foreground">Actions</th>
              </tr>
            </thead>
          </table>
        </div>

        {/* Scrollable Table Body Only */}
        <CardContent className="p-0 flex-1 overflow-y-auto overflow-x-auto min-h-0">
          <table className="w-full table-auto text-sm">
            <colgroup>
              <col style={{ width: '40px' }} />
              {visibleColumns.userName && <col style={{ width: columnWidths.userName }} />}
              {visibleColumns.email && <col style={{ width: columnWidths.email }} />}
              {visibleColumns.role && <col style={{ width: columnWidths.role }} />}
              {visibleColumns.phoneNumber && <col style={{ width: columnWidths.phoneNumber }} />}
              {visibleColumns.status && <col style={{ width: columnWidths.status }} />}
              {visibleColumns.createdAt && <col style={{ width: columnWidths.createdAt }} />}
              <col style={{ width: '50px' }} />
            </colgroup>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={visibleColumnCount} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading users...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColumnCount} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedUser(user)}>
                    <TableCell className="w-[40px]" onClick={(e) => e.stopPropagation()}>
                      <Checkbox />
                    </TableCell>
                    {visibleColumns.userName && (
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {`${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || 'U'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A'}
                            </span>
                            <span className="text-xs text-muted-foreground">{user.id}</span>
                          </div>
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.email && (
                      <TableCell className="text-sm">{user.email || 'N/A'}</TableCell>
                    )}
                    {visibleColumns.role && (
                      <TableCell className="text-sm">
                        <Badge variant="secondary" className={`text-[10px] ${user.role === 'specialist' ? 'bg-primary/20 text-primary' : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'}`}>
                          {user.role === 'specialist' ? 'Specialist' : 'Client'}
                        </Badge>
                      </TableCell>
                    )}
                    {visibleColumns.phoneNumber && (
                      <TableCell className="text-sm">
                        {user.country_code && user.phone_number ? `${user.country_code} ${user.phone_number}` : 'N/A'}
                      </TableCell>
                    )}
                    {visibleColumns.status && (
                      <TableCell>
                        <Badge variant="secondary" className={`text-[10px] ${user.is_activated === 1 ? statusColors.active : statusColors.inactive}`}>
                          {user.is_activated === 1 ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    )}
                    {visibleColumns.createdAt && (
                      <TableCell className="text-sm text-muted-foreground">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    )}
                    <TableCell className="w-[50px]">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="size-7">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedUser(user) }}>
                            <Eye className="mr-2 size-4" /> View Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.warning(`Suspended ${user.first_name} ${user.last_name}`) }}>
                            <Ban className="mr-2 size-4" /> Suspend
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); toast.error(`Deleted ${user.first_name} ${user.last_name}`) }}>
                            <Trash2 className="mr-2 size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </table>
        </CardContent>
        
        {/* Fixed Pagination Footer */}
        {pagination.pageCount > 0 && (
          <div className="border-t bg-gradient-to-r from-muted/80 to-muted/60 backdrop-blur-sm shadow-sm">
            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <span className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{((page - 1) * perPage) + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * perPage, pagination.totalCount)}</span> of <span className="font-medium text-foreground">{pagination.totalCount}</span> users
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground hidden sm:inline">•</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Per page:</span>
                    <Select
                      value={perPage.toString()}
                      onValueChange={(value) => {
                        setPerPage(parseInt(value))
                        setPage(1) // Reset to first page when changing per page
                      }}
                    >
                      <SelectTrigger className="h-9 w-[100px] font-medium text-foreground">
                        <SelectValue>
                          <span>{perPage}</span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="z-[100] min-w-[100px]">
                        <SelectItem value="10" className="cursor-pointer font-medium">10</SelectItem>
                        <SelectItem value="20" className="cursor-pointer font-medium">20</SelectItem>
                        <SelectItem value="50" className="cursor-pointer font-medium">50</SelectItem>
                        <SelectItem value="100" className="cursor-pointer font-medium">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center sm:justify-end">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (page > 1) {
                            setPage(page - 1)
                          }
                        }}
                        className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {/* Page Numbers */}
                    {(() => {
                      const pages: (number | 'ellipsis')[] = []
                      const totalPages = pagination.pageCount
                      const currentPage = page
                      
                      if (totalPages <= 7) {
                        // Show all pages if 7 or fewer
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i)
                        }
                      } else {
                        // Always show first page
                        pages.push(1)
                        
                        if (currentPage <= 4) {
                          // Show pages 2-5, then ellipsis, then last
                          for (let i = 2; i <= 5; i++) {
                            pages.push(i)
                          }
                          pages.push('ellipsis')
                          pages.push(totalPages)
                        } else if (currentPage >= totalPages - 3) {
                          // Show first, ellipsis, then last 5 pages
                          pages.push('ellipsis')
                          for (let i = totalPages - 4; i <= totalPages; i++) {
                            pages.push(i)
                          }
                        } else {
                          // Show first, ellipsis, current-1, current, current+1, ellipsis, last
                          pages.push('ellipsis')
                          pages.push(currentPage - 1)
                          pages.push(currentPage)
                          pages.push(currentPage + 1)
                          pages.push('ellipsis')
                          pages.push(totalPages)
                        }
                      }
                      
                      return pages.map((pageNum, index) => {
                        if (pageNum === 'ellipsis') {
                          return (
                            <PaginationItem key={`ellipsis-${index}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )
                        }
                        
                        return (
                          <PaginationItem key={pageNum}>
                            {pageNum === currentPage ? (
                              <PaginationLink href="#" isActive onClick={(e) => e.preventDefault()}>
                                {pageNum}
                              </PaginationLink>
                            ) : (
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  setPage(pageNum)
                                }}
                                className="cursor-pointer"
                              >
                                {pageNum}
                              </PaginationLink>
                            )}
                          </PaginationItem>
                        )
                      })
                    })()}
                    
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (page < pagination.pageCount) {
                            setPage(page + 1)
                          }
                        }}
                        className={page >= pagination.pageCount ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* User Profile Panel */}
      {selectedUser && (
        <UserProfilePanel
          user={{
            id: selectedUser.id,
            name: `${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim() || 'N/A',
            email: selectedUser.email || '',
            phone: selectedUser.country_code && selectedUser.phone_number
              ? `${selectedUser.country_code} ${selectedUser.phone_number}`
              : selectedUser.phone_number || '',
            role: (selectedUser.role === 'specialist' ? 'specialist' : 'client') as any,
            location: selectedUser.location || '',
            status: (selectedUser.is_activated === 1 ? 'active' : 'suspended') as any,
            joinDate: selectedUser.created_at || '',
            lastActive: selectedUser.updated_at || '',
            accountType: 'free' as any,
            ordersCount: 0,
          }}
          open={!!selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  )
}
