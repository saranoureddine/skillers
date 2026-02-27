"use client"

import { useState, useMemo } from "react"
import { reviews } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Search, Star, Flag, CheckCircle2, Trash2, Eye } from "lucide-react"
import { toast } from "sonner"
import type { Review } from "@/lib/mock-data"

const statusColors: Record<string, string> = {
  published: "bg-accent/20 text-accent",
  flagged: "bg-chart-3/20 text-chart-3",
  removed: "bg-destructive/20 text-destructive",
}

export default function ReviewsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchSearch =
        r.reviewer.toLowerCase().includes(search.toLowerCase()) ||
        r.specialist.toLowerCase().includes(search.toLowerCase()) ||
        r.comment.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === "all" || r.status === statusFilter
      const matchRating = ratingFilter === "all" || r.rating === Number(ratingFilter)
      return matchSearch && matchStatus && matchRating
    })
  }, [search, statusFilter, ratingFilter])

  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
  const flaggedCount = reviews.filter((r) => r.status === "flagged").length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          Reviews & Ratings
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor and moderate user reviews across the platform
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Reviews</p>
            <p className="text-2xl font-bold">{reviews.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Average Rating</p>
            <div className="flex items-center gap-1">
              <p className="text-2xl font-bold">{avgRating}</p>
              <Star className="size-4 fill-chart-3 text-chart-3" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Flagged</p>
            <p className="text-2xl font-bold text-chart-3">{flaggedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Published</p>
            <p className="text-2xl font-bold">{reviews.filter((r) => r.status === "published").length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by reviewer, specialist, or comment..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="removed">Removed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                {[5, 4, 3, 2, 1].map((r) => (
                  <SelectItem key={r} value={String(r)}>
                    {r} Star{r > 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Specialist</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="hidden md:table-cell">Comment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-mono text-xs">{review.id}</TableCell>
                  <TableCell className="text-sm">{review.reviewer}</TableCell>
                  <TableCell className="text-sm">{review.specialist}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3 ${
                            i < review.rating
                              ? "fill-chart-3 text-chart-3"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="hidden max-w-[200px] truncate text-xs text-muted-foreground md:table-cell">
                    {review.comment}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] ${statusColors[review.status]}`}>
                      {review.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                    {review.date}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="size-7" onClick={() => setSelectedReview(review)}>
                        <Eye className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => toast.success(`Review ${review.id} approved`)}
                      >
                        <CheckCircle2 className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive"
                        onClick={() => toast.error(`Review ${review.id} removed`)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Review Detail Dialog */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>Review Details</DialogTitle>
            <DialogDescription>{selectedReview?.id}</DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] text-muted-foreground">Reviewer</p>
                  <p className="text-sm font-medium">{selectedReview.reviewer}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] text-muted-foreground">Specialist</p>
                  <p className="text-sm font-medium">{selectedReview.specialist}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-5 ${
                      i < selectedReview.rating
                        ? "fill-chart-3 text-chart-3"
                        : "text-muted"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm font-medium">{selectedReview.rating}/5</span>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm leading-relaxed">{selectedReview.comment}</p>
              </div>
              <p className="text-xs text-muted-foreground">Submitted on {selectedReview.date}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReview(null)}>
              Close
            </Button>
            <Button
              variant="default"
              onClick={() => {
                toast.success("Review approved")
                setSelectedReview(null)
              }}
            >
              <CheckCircle2 className="mr-1 size-3" />
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                toast.error("Review removed")
                setSelectedReview(null)
              }}
            >
              <Trash2 className="mr-1 size-3" />
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
