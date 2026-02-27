"use client"

import { useState, useEffect, useMemo } from "react"
import type { User, UserStatus, UserRole } from "@/lib/mock-data"
import { userPosts, userComments, userLikes } from "@/lib/mock-data"
import { usersService } from "@/services/api/users.service"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Heart,
  MessageSquare,
  FileText,
  ThumbsUp,
  Clock,
  Briefcase,
  Ban,
  Trash2,
  Edit2,
  Loader2,
  TrendingUp,
} from "lucide-react"
import { toast } from "sonner"

const statusColors: Record<UserStatus, string> = {
  active: "bg-accent/20 text-accent",
  suspended: "bg-chart-3/20 text-chart-3",
  banned: "bg-destructive/20 text-destructive",
}

const roleColors: Record<UserRole, string> = {
  client: "bg-primary/20 text-primary",
  specialist: "bg-chart-2/20 text-chart-2",
}

interface UserProfilePanelProps {
  user: User | null
  open: boolean
  onClose: () => void
}

export function UserProfilePanel({ user, open, onClose }: UserProfilePanelProps) {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [userDetails, setUserDetails] = useState<any>(null)

  // Fetch real user details from API
  useEffect(() => {
    if (user && open) {
      setLoading(true)
      setActiveTab("overview")
      setUserDetails(null)
      
      usersService.getUserDetails(user.id)
        .then((response) => {
          const data = response?.data || response
          if (data?.succeeded && data?.user) {
            setUserDetails(data.user)
          }
        })
        .catch(() => {
          // Fallback - keep using the basic user data
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [user, open])

  // Use API data if available, otherwise fallback to basic user data
  const apiUser = userDetails
  const commentsCount = apiUser?.engagement?.comments_count ?? 0
  const postsLikedCount = apiUser?.engagement?.posts_liked_count ?? 0
  const lastActive = apiUser?.last_active
    ? new Date(apiUser.last_active).toLocaleString()
    : user?.lastActive || 'N/A'
  const sosNumbers = apiUser?.sos_numbers || []

  const posts = useMemo(
    () => (user ? userPosts.filter((p) => p.userId === user.id) : []),
    [user]
  )
  const comments = useMemo(
    () => (user ? userComments.filter((c) => c.userId === user.id) : []),
    [user]
  )
  const likes = useMemo(
    () => (user ? userLikes.filter((l) => l.userId === user.id) : []),
    [user]
  )

  const totalLikesReceived = useMemo(
    () => posts.reduce((sum, p) => sum + p.likes, 0),
    [posts]
  )
  const totalCommentsReceived = useMemo(
    () => posts.reduce((sum, p) => sum + p.comments, 0),
    [posts]
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden p-0 sm:max-w-2xl">
        {user && (
          <ScrollArea className="max-h-[90vh]">
            {/* Header section */}
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 pt-6 pb-4">
              <DialogHeader className="mb-4">
                <DialogTitle className="sr-only">User Profile</DialogTitle>
                <DialogDescription className="sr-only">
                  Detailed profile view for {user.name}
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-start gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/10 text-xl font-bold text-primary">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <h2
                    className="truncate text-lg font-bold"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {user.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${roleColors[user.role]}`}
                    >
                      {user.role}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${statusColors[user.status]}`}
                    >
                      {user.status}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {user.accountType}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {user.id}
                  </span>
                </div>
              </div>

              {/* Quick info row */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-lg bg-background/60 p-2.5 backdrop-blur-sm">
                  <Mail className="size-3.5 text-muted-foreground" />
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-background/60 p-2.5 backdrop-blur-sm">
                  <Phone className="size-3.5 text-muted-foreground" />
                  <span className="truncate text-xs">{user.phone}</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-background/60 p-2.5 backdrop-blur-sm">
                  <MapPin className="size-3.5 text-muted-foreground" />
                  <span className="truncate text-xs">{apiUser?.location || user.location || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-background/60 p-2.5 backdrop-blur-sm">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  <span className="truncate text-xs">
                    Joined {apiUser?.created_at ? new Date(apiUser.created_at).toLocaleDateString() : user.joinDate}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={() => {
                    onClose()
                    toast.success("Edit mode opened")
                  }}
                >
                  <Edit2 className="size-3.5" /> Edit User
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose()
                    toast.warning(`Suspended ${user.name}`)
                  }}
                >
                  <Ban className="size-3.5" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    onClose()
                    toast.error(`Deleted ${user.name}`)
                  }}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Loading state */}
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Loading profile data...
                </p>
              </div>
            ) : (
              /* Tabs content */
              <div className="px-6 py-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full">
                    <TabsTrigger value="overview" className="flex-1 text-xs">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="posts" className="flex-1 text-xs">
                      Posts ({posts.length})
                    </TabsTrigger>
                    <TabsTrigger value="comments" className="flex-1 text-xs">
                      Comments ({comments.length})
                    </TabsTrigger>
                    <TabsTrigger value="likes" className="flex-1 text-xs">
                      Likes ({likes.length})
                    </TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="mt-4">
                    <div className="flex flex-col gap-4">
                      {/* Engagement stats */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col items-center gap-1 rounded-xl border p-3">
                          <FileText className="size-5 text-primary" />
                          <span className="text-xl font-bold tabular-nums">
                            {posts.length}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Posts
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-1 rounded-xl border p-3">
                          <Heart className="size-5 text-destructive" />
                          <span className="text-xl font-bold tabular-nums">
                            {totalLikesReceived}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Likes Received
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-1 rounded-xl border p-3">
                          <MessageSquare className="size-5 text-chart-2" />
                          <span className="text-xl font-bold tabular-nums">
                            {totalCommentsReceived}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Comments Received
                          </span>
                        </div>
                      </div>

                      {/* Additional engagement metrics */}
                      <Card>
                        <CardContent className="p-4">
                          <h4
                            className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                            style={{ fontFamily: "var(--font-heading)" }}
                          >
                            Engagement Summary
                          </h4>
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <ThumbsUp className="size-3.5 text-muted-foreground" />
                                <span className="text-sm">
                                  Comments made by user
                                </span>
                              </div>
                              <span className="text-sm font-semibold tabular-nums">
                                {commentsCount}
                              </span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Heart className="size-3.5 text-muted-foreground" />
                                <span className="text-sm">
                                  Posts liked by user
                                </span>
                              </div>
                              <span className="text-sm font-semibold tabular-nums">
                                {postsLikedCount}
                              </span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Briefcase className="size-3.5 text-muted-foreground" />
                                <span className="text-sm">Total orders</span>
                              </div>
                              <span className="text-sm font-semibold tabular-nums">
                                {user.ordersCount}
                              </span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Clock className="size-3.5 text-muted-foreground" />
                                <span className="text-sm">Last active</span>
                              </div>
                              <span className="text-sm font-semibold">
                                {lastActive}
                              </span>
                            </div>
                            {user.role === "specialist" && user.rating && (
                              <>
                                <Separator />
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Star className="size-3.5 text-chart-3 fill-chart-3" />
                                    <span className="text-sm">Rating</span>
                                  </div>
                                  <span className="text-sm font-semibold tabular-nums">
                                    {user.rating} / 5.0
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Emergency Contact Numbers (SOS) */}
                      <Card>
                        <CardContent className="p-4">
                          <h4
                            className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                            style={{ fontFamily: "var(--font-heading)" }}
                          >
                            Emergency Contact Numbers (SOS)
                          </h4>
                          {sosNumbers.length > 0 ? (
                            <div className="flex flex-col gap-2">
                              {sosNumbers.map((sos: any, index: number) => (
                                <div key={index} className="flex items-center gap-2 rounded-lg bg-muted/50 p-2.5">
                                  <Phone className="size-3.5 text-destructive" />
                                  <span className="text-sm">{sos.name || `Contact ${index + 1}`}: {sos.phone_number || sos.number || 'N/A'}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No emergency contact numbers available</p>
                          )}
                        </CardContent>
                      </Card>

                      {/* Location Information */}
                      {apiUser && (apiUser.location || apiUser.address || apiUser.cities?.length > 0) && (
                        <Card>
                          <CardContent className="p-4">
                            <h4
                              className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                              style={{ fontFamily: "var(--font-heading)" }}
                            >
                              Location Information
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              {apiUser.location && (
                                <div>
                                  <span className="text-[10px] text-muted-foreground">Location</span>
                                  <p className="text-sm font-medium">{apiUser.location}</p>
                                </div>
                              )}
                              {apiUser.address && (
                                <div>
                                  <span className="text-[10px] text-muted-foreground">Address</span>
                                  <p className="text-sm font-medium">{apiUser.address}</p>
                                </div>
                              )}
                              {apiUser.cities?.length > 0 && (
                                <div>
                                  <span className="text-[10px] text-muted-foreground">Cities</span>
                                  <p className="text-sm font-medium">{apiUser.cities.map((c: any) => c.name).join(', ')}</p>
                                </div>
                              )}
                              {apiUser.province && (
                                <div>
                                  <span className="text-[10px] text-muted-foreground">Province</span>
                                  <p className="text-sm font-medium">{apiUser.province.name}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Specialist info */}
                      {user.role === "specialist" && (
                        <Card>
                          <CardContent className="p-4">
                            <h4
                              className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                              style={{ fontFamily: "var(--font-heading)" }}
                            >
                              Specialist Info
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <span className="text-[10px] text-muted-foreground">
                                  Category
                                </span>
                                <p className="text-sm font-medium">
                                  {user.category}
                                </p>
                              </div>
                              <div>
                                <span className="text-[10px] text-muted-foreground">
                                  Profession
                                </span>
                                <p className="text-sm font-medium">
                                  {user.profession}
                                </p>
                              </div>
                              <div>
                                <span className="text-[10px] text-muted-foreground">
                                  Subscription
                                </span>
                                <p className="text-sm font-medium capitalize">
                                  {user.accountType}
                                </p>
                              </div>
                              <div>
                                <span className="text-[10px] text-muted-foreground">
                                  Completed Orders
                                </span>
                                <p className="text-sm font-medium">
                                  {user.ordersCount}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Recent posts preview */}
                      {posts.length > 0 && (
                        <Card>
                          <CardContent className="p-4">
                            <div className="mb-3 flex items-center justify-between">
                              <h4
                                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                                style={{
                                  fontFamily: "var(--font-heading)",
                                }}
                              >
                                Recent Posts
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto px-2 py-1 text-[10px] text-primary"
                                onClick={() => setActiveTab("posts")}
                              >
                                View All
                              </Button>
                            </div>
                            <div className="flex flex-col gap-2">
                              {posts.slice(0, 2).map((post) => (
                                <div
                                  key={post.id}
                                  className="rounded-lg border p-3"
                                >
                                  <p className="text-sm font-medium leading-snug">
                                    {post.title}
                                  </p>
                                  <div className="mt-1.5 flex items-center gap-3 text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Heart className="size-3" /> {post.likes}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MessageSquare className="size-3" />{" "}
                                      {post.comments}
                                    </span>
                                    <span>{post.createdAt}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  {/* Posts Tab */}
                  <TabsContent value="posts" className="mt-4">
                    <div className="flex flex-col gap-3">
                      {posts.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-10 text-center">
                          <FileText className="size-10 text-muted-foreground/40" />
                          <p className="text-sm text-muted-foreground">
                            No posts yet
                          </p>
                        </div>
                      ) : (
                        posts.map((post) => (
                          <Card key={post.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-sm font-semibold leading-snug">
                                  {post.title}
                                </h4>
                                <Badge
                                  variant="outline"
                                  className="shrink-0 text-[9px]"
                                >
                                  {post.id}
                                </Badge>
                              </div>
                              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                                {post.content}
                              </p>
                              <Separator className="my-3" />
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Heart className="size-3.5 text-destructive" />
                                  <span className="font-medium tabular-nums">
                                    {post.likes}
                                  </span>{" "}
                                  likes
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="size-3.5 text-primary" />
                                  <span className="font-medium tabular-nums">
                                    {post.comments}
                                  </span>{" "}
                                  comments
                                </span>
                                <span className="ml-auto flex items-center gap-1">
                                  <Clock className="size-3" />
                                  {post.createdAt}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  {/* Comments Tab */}
                  <TabsContent value="comments" className="mt-4">
                    <div className="flex flex-col gap-3">
                      {comments.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-10 text-center">
                          <MessageSquare className="size-10 text-muted-foreground/40" />
                          <p className="text-sm text-muted-foreground">
                            No comments yet
                          </p>
                        </div>
                      ) : (
                        comments.map((comment) => (
                          <Card key={comment.id}>
                            <CardContent className="p-4">
                              <div className="mb-2 flex items-center gap-2">
                                <FileText className="size-3.5 text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground">
                                  on
                                </span>
                                <span className="text-xs font-medium text-primary">
                                  {comment.postTitle}
                                </span>
                              </div>
                              <p className="text-sm leading-relaxed">
                                {comment.content}
                              </p>
                              <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Clock className="size-3" />
                                {comment.createdAt}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  {/* Likes Tab */}
                  <TabsContent value="likes" className="mt-4">
                    <div className="flex flex-col gap-3">
                      {likes.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-10 text-center">
                          <Heart className="size-10 text-muted-foreground/40" />
                          <p className="text-sm text-muted-foreground">
                            No liked posts yet
                          </p>
                        </div>
                      ) : (
                        likes.map((like) => (
                          <Card key={like.id}>
                            <CardContent className="flex items-center gap-3 p-4">
                              <Heart className="size-4 shrink-0 text-destructive fill-destructive" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                  {like.postTitle}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  by {like.postAuthor}
                                </p>
                              </div>
                              <span className="shrink-0 text-[10px] text-muted-foreground">
                                {like.likedAt}
                              </span>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
