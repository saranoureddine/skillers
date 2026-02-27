"use client"

import { useState } from "react"
import { categories, professions } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Search, Pencil, Trash2, GripVertical, Users, FolderTree } from "lucide-react"
import { toast } from "sonner"

export default function CategoriesPage() {
  const [search, setSearch] = useState("")
  const [addCategoryOpen, setAddCategoryOpen] = useState(false)
  const [addProfessionOpen, setAddProfessionOpen] = useState(false)

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const filteredProfessions = professions.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          Categories & Professions
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage service categories and professions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <FolderTree className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{categories.length}</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10">
              <Users className="size-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{professions.length}</p>
              <p className="text-xs text-muted-foreground">Professions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-chart-3/10">
              <Users className="size-5 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {categories.reduce((a, c) => a + c.specialistCount, 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Total Specialists</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-chart-4/10">
              <FolderTree className="size-5 text-chart-4" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {categories.filter((c) => c.status === "active").length}
              </p>
              <p className="text-xs text-muted-foreground">Active Categories</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="categories">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <TabsList>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="professions">Professions</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <TabsContent value="categories" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <CardTitle className="text-sm font-semibold">All Categories</CardTitle>
              <Button size="sm" className="gap-1" onClick={() => setAddCategoryOpen(true)}>
                <Plus className="size-4" />
                Add Category
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead>Professions</TableHead>
                    <TableHead>Specialists</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell>
                        <GripVertical className="size-4 cursor-grab text-muted-foreground" />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{cat.name}</span>
                          <span className="text-xs text-muted-foreground">{cat.id}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                        {cat.description}
                      </TableCell>
                      <TableCell className="text-sm">{cat.professionCount}</TableCell>
                      <TableCell className="text-sm">{cat.specialistCount}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${cat.status === "active" ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"}`}
                        >
                          {cat.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="size-7" onClick={() => toast.info(`Editing ${cat.name}`)}>
                            <Pencil className="size-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => toast.error(`Deleted ${cat.name}`)}>
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
        </TabsContent>

        <TabsContent value="professions" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <CardTitle className="text-sm font-semibold">All Professions</CardTitle>
              <Button size="sm" className="gap-1" onClick={() => setAddProfessionOpen(true)}>
                <Plus className="size-4" />
                Add Profession
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Specialists</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfessions.map((prof) => (
                    <TableRow key={prof.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{prof.name}</span>
                          <span className="text-xs text-muted-foreground">{prof.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{prof.categoryName}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{prof.specialistCount}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${prof.status === "active" ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"}`}
                        >
                          {prof.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="size-7" onClick={() => toast.info(`Editing ${prof.name}`)}>
                            <Pencil className="size-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => toast.error(`Deleted ${prof.name}`)}>
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
        </TabsContent>
      </Tabs>

      {/* Add Category Dialog */}
      <Dialog open={addCategoryOpen} onOpenChange={setAddCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>Add New Category</DialogTitle>
            <DialogDescription>Create a new service category for the platform</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="cat-name">Category Name</Label>
              <Input id="cat-name" placeholder="e.g. Photographers" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea id="cat-desc" placeholder="Brief description of this category..." />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="cat-active">Active</Label>
              <Switch id="cat-active" defaultChecked />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCategoryOpen(false)}>Cancel</Button>
            <Button onClick={() => { setAddCategoryOpen(false); toast.success("Category created successfully") }}>
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Profession Dialog */}
      <Dialog open={addProfessionOpen} onOpenChange={setAddProfessionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>Add New Profession</DialogTitle>
            <DialogDescription>Create a new profession under a category</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="prof-name">Profession Name</Label>
              <Input id="prof-name" placeholder="e.g. Portrait Photographer" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="prof-cat">Parent Category</Label>
              <Select>
                <SelectTrigger id="prof-cat">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="prof-active">Active</Label>
              <Switch id="prof-active" defaultChecked />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddProfessionOpen(false)}>Cancel</Button>
            <Button onClick={() => { setAddProfessionOpen(false); toast.success("Profession created successfully") }}>
              Create Profession
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
