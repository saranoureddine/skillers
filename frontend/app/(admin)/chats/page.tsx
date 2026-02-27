"use client"

import { useState } from "react"
import { chats } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, MessageSquare, Flag, Eye, Archive } from "lucide-react"
import { toast } from "sonner"

const statusColors = {
  active: "bg-accent/20 text-accent",
  closed: "bg-muted text-muted-foreground",
  flagged: "bg-destructive/20 text-destructive",
}

const mockMessages = [
  { sender: "Sara Nourd", message: "Hi, I need my phone screen fixed", time: "10:25 AM", isClient: true },
  { sender: "Hassan Jaber", message: "Sure! What phone model do you have?", time: "10:26 AM", isClient: false },
  { sender: "Sara Nourd", message: "It's a Samsung Galaxy S24", time: "10:27 AM", isClient: true },
  { sender: "Hassan Jaber", message: "I can fix that. When can you come to fix my phone?", time: "10:28 AM", isClient: false },
  { sender: "Sara Nourd", message: "When can you come to fix my phone?", time: "10:30 AM", isClient: true },
]

export default function ChatsPage() {
  const [search, setSearch] = useState("")
  const [selectedChat, setSelectedChat] = useState<string | null>(chats[0]?.id || null)

  const filteredChats = chats.filter((c) =>
    c.participants.some((p) => p.toLowerCase().includes(search.toLowerCase()))
  )

  const activeChat = chats.find((c) => c.id === selectedChat)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          Chats & Messages
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor and moderate conversations between users
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3" style={{ minHeight: "calc(100vh - 240px)" }}>
        {/* Chat List */}
        <Card className="lg:col-span-1">
          <CardHeader className="p-3 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="flex flex-col">
                {filteredChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    className={`flex flex-col gap-1 border-b p-3 text-left transition-colors hover:bg-muted/50 ${
                      selectedChat === chat.id ? "bg-muted/50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {chat.participants.join(" & ")}
                      </span>
                      <Badge variant="secondary" className={`text-[9px] ${statusColors[chat.status]}`}>
                        {chat.status}
                      </Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{chat.lastMessage}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{chat.date}</span>
                      {chat.unread > 0 && (
                        <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat View */}
        <Card className="lg:col-span-2">
          {activeChat ? (
            <>
              <CardHeader className="flex flex-row items-center justify-between border-b p-3">
                <div className="flex flex-col">
                  <CardTitle className="text-sm">{activeChat.participants.join(" & ")}</CardTitle>
                  <span className="text-xs text-muted-foreground">{activeChat.id} - Read-only moderation view</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => toast.warning("Chat flagged for review")}
                  >
                    <Flag className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => toast.info("Conversation archived")}
                  >
                    <Archive className="size-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[440px]">
                  <div className="flex flex-col gap-3 p-4">
                    {mockMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.isClient ? "justify-start" : "justify-end"}`}
                      >
                        <div className={`max-w-[70%] rounded-lg p-3 ${
                          msg.isClient
                            ? "bg-muted text-foreground"
                            : "bg-primary text-primary-foreground"
                        }`}>
                          <p className="text-xs font-medium">{msg.sender}</p>
                          <p className="text-sm">{msg.message}</p>
                          <p className={`mt-1 text-[10px] ${msg.isClient ? "text-muted-foreground" : "text-primary-foreground/70"}`}>
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <MessageSquare className="size-8" />
                <p className="text-sm">Select a conversation to view</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
