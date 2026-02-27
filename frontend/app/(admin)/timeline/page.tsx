"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Search,
  Trash2,
  Heart,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  X,
  Loader2,
  Calendar,
  FileText,
  MessageSquare,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"
import {
  userPosts as initialPosts,
  userComments as initialComments,
  users,
  type UserPost,
  type UserComment,
} from "@/lib/mock-data"
import Image from "next/image"

function getUser(userId: string) {
  return users.find((u) => u.id === userId)
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
}

function getCommentAuthor(userId: string) {
  const user = getUser(userId)
  return user?.name ?? "Unknown User"
}

export default function TimelinePage() {
  const [posts, setPosts] = useState<UserPost[]>(
    [...initialPosts].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  )
  const [comments, setComments] = useState<UserComment[]>(initialComments)
  const [search, setSearch] = useState("")
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  // Delete confirmations
  const [deletePostTarget, setDeletePostTarget] = useState<string | null>(null)
  const [deleteCommentTarget, setDeleteCommentTarget] = useState<string | null>(
    null
  )
  const [deleting, setDeleting] = useState<string | null>(null)

  const filteredPosts = useMemo(() => {
    if (!search.trim()) return posts
    const q = search.toLowerCase()
    return posts.filter((p) => {
      const author = getUser(p.userId)?.name ?? ""
      return (
        author.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
      )
    })
  }, [posts, search])

  const totalComments = comments.length
  const postsWithImages = posts.filter((p) => p.image).length

  function getPostComments(postId: string) {
    return comments.filter((c) => c.postId === postId)
  }

  async function handleDeletePost(postId: string) {
    setDeleting(postId)
    // Simulate async
    await new Promise((r) => setTimeout(r, 600))
    setPosts((prev) => prev.filter((p) => p.id !== postId))
    setComments((prev) => prev.filter((c) => c.postId !== postId))
    setDeleting(null)
    setDeletePostTarget(null)
    if (expandedPost === postId) setExpandedPost(null)
    toast.success("Post deleted successfully")
  }

  async function handleDeleteComment(commentId: string) {
    setDeleting(commentId)
    await new Promise((r) => setTimeout(r, 400))
    setComments((prev) => prev.filter((c) => c.id !== commentId))
    setDeleting(null)
    setDeleteCommentTarget(null)
    toast.success("Comment deleted successfully")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Timeline / Posts
        </h1>
        <p className="text-sm text-muted-foreground">
          Moderate user-generated posts and comments
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Posts</p>
              <p className="text-xl font-bold">{posts.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-chart-2/10">
              <MessageSquare className="size-4 text-chart-2" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Comments</p>
              <p className="text-xl font-bold">{totalComments}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-chart-3/10">
              <ImageIcon className="size-4 text-chart-3" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Posts with Images</p>
              <p className="text-xl font-bold">{postsWithImages}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-chart-4/10">
              <Heart className="size-4 text-chart-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Likes</p>
              <p className="text-xl font-bold">
                {posts.reduce((s, p) => s + p.likes, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search posts by author, title, or content..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Posts Timeline */}
      <div className="flex flex-col gap-4">
        {filteredPosts.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-2 p-12">
              <FileText className="size-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No posts found</p>
            </CardContent>
          </Card>
        )}

        {filteredPosts.map((post) => {
          const author = getUser(post.userId)
          const postComments = getPostComments(post.id)
          const isExpanded = expandedPost === post.id
          const isDeleting = deleting === post.id

          return (
            <Card
              key={post.id}
              className={`overflow-hidden transition-shadow hover:shadow-md ${isDeleting ? "pointer-events-none opacity-50" : ""}`}
            >
              <CardContent className="p-0">
                {/* Post Header */}
                <div className="flex items-start justify-between p-4 pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                        {getInitials(author?.name ?? "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          {author?.name ?? "Unknown User"}
                        </span>
                        {author?.role && (
                          <Badge
                            variant="outline"
                            className="text-[9px] capitalize"
                          >
                            {author.role}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Calendar className="size-3" />
                        <span>{post.createdAt}</span>
                        <span className="text-muted-foreground/60">
                          {post.id}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeletePostTarget(post.id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </Button>
                </div>

                {/* Post Content */}
                <div className="px-4 pb-3">
                  <h3 className="text-sm font-semibold leading-snug">
                    {post.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {post.content}
                  </p>
                </div>

                {/* Post Image */}
                {post.image && (
                  <div className="px-4 pb-3">
                    <button
                      type="button"
                      className="group relative w-full max-w-sm cursor-pointer overflow-hidden rounded-lg border"
                      onClick={() => setLightboxImage(post.image!)}
                    >
                      <Image
                        src={post.image}
                        alt={post.title}
                        width={400}
                        height={240}
                        className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition-colors group-hover:bg-foreground/10">
                        <ImageIcon className="size-6 text-background opacity-0 drop-shadow-lg transition-opacity group-hover:opacity-100" />
                      </div>
                    </button>
                  </div>
                )}

                {/* Post Stats Bar */}
                <div className="flex items-center justify-between border-t px-4 py-2.5">
                  <div className="flex items-center gap-5">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Heart className="size-3.5" />
                      <span className="text-xs font-medium">{post.likes}</span>
                    </div>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
                      onClick={() =>
                        setExpandedPost(isExpanded ? null : post.id)
                      }
                    >
                      <MessageCircle className="size-3.5" />
                      <span className="text-xs font-medium">
                        {postComments.length} comment
                        {postComments.length !== 1 ? "s" : ""}
                      </span>
                    </button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    onClick={() =>
                      setExpandedPost(isExpanded ? null : post.id)
                    }
                  >
                    {isExpanded ? (
                      <>
                        Hide <ChevronUp className="size-3" />
                      </>
                    ) : (
                      <>
                        Show comments <ChevronDown className="size-3" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Comments Section (Expandable) */}
                {isExpanded && (
                  <div className="border-t bg-muted/30">
                    {postComments.length === 0 ? (
                      <p className="p-4 text-center text-xs text-muted-foreground">
                        No comments on this post
                      </p>
                    ) : (
                      <div className="flex flex-col">
                        {postComments.map((comment, idx) => {
                          const commentAuthor = getCommentAuthor(
                            comment.userId
                          )
                          const isDeletingComment =
                            deleting === comment.id
                          return (
                            <div key={comment.id}>
                              {idx > 0 && <Separator />}
                              <div
                                className={`flex items-start gap-3 p-4 transition-opacity ${isDeletingComment ? "pointer-events-none opacity-40" : ""}`}
                              >
                                <Avatar className="mt-0.5 size-7">
                                  <AvatarFallback className="bg-secondary text-[9px] font-bold">
                                    {getInitials(commentAuthor)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold">
                                      {commentAuthor}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {comment.createdAt}
                                    </span>
                                  </div>
                                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                                    {comment.content}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 shrink-0 text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() =>
                                    setDeleteCommentTarget(comment.id)
                                  }
                                  disabled={isDeletingComment}
                                >
                                  {isDeletingComment ? (
                                    <Loader2 className="size-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="size-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Lightbox Dialog */}
      <Dialog
        open={!!lightboxImage}
        onOpenChange={() => setLightboxImage(null)}
      >
        <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none sm:max-w-3xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Post Image</DialogTitle>
            <DialogDescription>Full size post image view</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Button
              variant="secondary"
              size="icon"
              className="absolute -top-3 -right-3 z-10 size-8 rounded-full shadow-lg"
              onClick={() => setLightboxImage(null)}
            >
              <X className="size-4" />
            </Button>
            {lightboxImage && (
              <Image
                src={lightboxImage}
                alt="Full size post image"
                width={900}
                height={600}
                className="w-full rounded-lg object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Post Confirmation */}
      <AlertDialog
        open={!!deletePostTarget}
        onOpenChange={() => setDeletePostTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Delete Post
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This will also remove
              all comments associated with it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletePostTarget && handleDeletePost(deletePostTarget)}
            >
              {deleting ? (
                <Loader2 className="mr-1 size-3.5 animate-spin" />
              ) : (
                <Trash2 className="mr-1 size-3.5" />
              )}
              Delete Post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Comment Confirmation */}
      <AlertDialog
        open={!!deleteCommentTarget}
        onOpenChange={() => setDeleteCommentTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Delete Comment
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteCommentTarget && handleDeleteComment(deleteCommentTarget)
              }
            >
              {deleting ? (
                <Loader2 className="mr-1 size-3.5 animate-spin" />
              ) : (
                <Trash2 className="mr-1 size-3.5" />
              )}
              Delete Comment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
