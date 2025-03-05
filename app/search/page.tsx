"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { PostCard } from "@/components/post-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SearchIcon, User, FileText } from "lucide-react"

type Post = {
  id: number
  title: string
  body: string
  userId: number
  tags: string[]
  reactions: number
}

type User = {
  id: number
  firstName: string
  lastName: string
  username: string
  email: string
  image: string
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [activeTab, setActiveTab] = useState("posts")
  const [posts, setPosts] = useState<Post[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const query = searchParams.get("q")
    if (query) {
      setSearchQuery(query)
      performSearch(query)
    }
  }, [searchParams])

  const performSearch = async (query: string) => {
    if (!query.trim()) return

    setLoading(true)
    try {
      // Search posts
      const postsResponse = await fetch(
        `https://dummyjson.com/posts/search?q=${query}&limit=${itemsPerPage}&skip=${(currentPage - 1) * itemsPerPage}`,
      )
      const postsData = await postsResponse.json()
      setPosts(postsData.posts)
      setTotalPages(Math.ceil(postsData.total / itemsPerPage))

      // Search users
      const usersResponse = await fetch(`https://dummyjson.com/users/search?q=${query}`)
      const usersData = await usersResponse.json()
      setUsers(usersData.users)
    } catch (error) {
      console.error("Error performing search:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setCurrentPage(1)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    performSearch(searchQuery)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Search</h1>

          <form onSubmit={handleSearch} className="relative mb-6">
            <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for posts, users, or tags..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" className="absolute right-1 top-1">
              Search
            </Button>
          </form>

          {searchParams.has("q") && (
            <>
              <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="posts" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Posts
                  </TabsTrigger>
                  <TabsTrigger value="users" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Users
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="posts" className="mt-6">
                  {loading ? (
                    <div className="space-y-6">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-lg border bg-card">
                          <div className="p-6 space-y-4">
                            <div className="flex items-center space-x-4">
                              <Skeleton className="h-12 w-12 rounded-full" />
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-[200px]" />
                                <Skeleton className="h-4 w-[150px]" />
                              </div>
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : posts.length > 0 ? (
                    <div className="space-y-6">
                      {/* {posts.map((post) => (
                        // <PostCard key={post.id} post={post} />
                      ))} */}

                      <Pagination>
                        <PaginationContent>
                          {currentPage > 1 && (
                            <PaginationItem>
                              <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  handlePageChange(currentPage - 1)
                                }}
                              />
                            </PaginationItem>
                          )}

                          {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                            const pageNumber = i + 1
                            return (
                              <PaginationItem key={pageNumber}>
                                <PaginationLink
                                  href="#"
                                  isActive={pageNumber === currentPage}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    handlePageChange(pageNumber)
                                  }}
                                >
                                  {pageNumber}
                                </PaginationLink>
                              </PaginationItem>
                            )
                          })}

                          {currentPage < totalPages && (
                            <PaginationItem>
                              <PaginationNext
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  handlePageChange(currentPage + 1)
                                }}
                              />
                            </PaginationItem>
                          )}
                        </PaginationContent>
                      </Pagination>
                    </div>
                  ) : (
                    <div className="rounded-lg border bg-card p-6 text-center">
                      <h3 className="text-lg font-medium">No posts found</h3>
                      <p className="text-muted-foreground">Try searching for something else</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="users" className="mt-6">
                  {loading ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="rounded-lg border bg-card p-4">
                          <div className="flex flex-col items-center text-center space-y-3">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : users.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {users.map((user) => (
                        <Card key={user.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <Link
                              href={`/profile/${user.id}`}
                              className="flex flex-col items-center text-center space-y-3"
                            >
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={user.image} alt={user.username} />
                                <AvatarFallback>
                                  {user.firstName.charAt(0)}
                                  {user.lastName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">
                                  {user.firstName} {user.lastName}
                                </h3>
                                <p className="text-sm text-muted-foreground">@{user.username}</p>
                              </div>
                              <Button variant="outline" size="sm" className="mt-2">
                                View Profile
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border bg-card p-6 text-center">
                      <h3 className="text-lg font-medium">No users found</h3>
                      <p className="text-muted-foreground">Try searching for something else</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

