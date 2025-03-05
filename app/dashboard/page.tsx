"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { PostCard } from "@/components/post-card"
import { PostFilter } from "@/components/post-filter"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type Post = {
  id: number
  title: string
  body: string
  userId: number
  tags: string[]
  reactions: {
    likes: number
    dislikes: number
  }
}

type PostsResponse = {
  posts: Post[]
  total: number
  skip: number
  limit: number
}

export default function DashboardPage() {
  // const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>("default")
  const postsPerPage = 10

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      try {
        let url = `https://dummyjson.com/posts?limit=${postsPerPage}&skip=${(currentPage - 1) * postsPerPage}`

        if (searchQuery) {
          url = `https://dummyjson.com/posts/search?q=${searchQuery}&limit=${postsPerPage}&skip=${(currentPage - 1) * postsPerPage}`
        } else if (selectedTag) {
          url = `https://dummyjson.com/posts/tag/${selectedTag}?limit=${postsPerPage}&skip=${(currentPage - 1) * postsPerPage}`
        }

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Failed to fetch posts: ${response.status}`)
        }

        const data: PostsResponse = await response.json()

        let sortedPosts = [...data.posts]

        if (sortBy === "reactions") {
          sortedPosts.sort((a, b) => b.reactions.likes - a.reactions.likes)
        }

        setPosts(sortedPosts)
        setTotalPages(Math.ceil(data.total / postsPerPage))
      } catch (error) {
        console.error("Error fetching posts:", error)
        // Set empty posts array to avoid undefined errors
        setPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [currentPage, searchQuery, selectedTag, sortBy])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag)
    setCurrentPage(1)
  }

  const handleSortChange = (sortOption: string) => {
    setSortBy(sortOption)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <main className="container py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="sticky top-20 space-y-6">
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                <h2 className="mb-4 font-semibold">Search Posts</h2>
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search posts..."
                    className="pl-8 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
              </div>

              <PostFilter
                onTagSelect={handleTagSelect}
                selectedTag={selectedTag}
                onSortChange={handleSortChange}
                currentSort={sortBy}
              />
            </div>
          </div>

          <div className="md:col-span-3 space-y-6">
            <h1 className="text-3xl font-bold">Feed</h1>

            {loading ? (
              <div className="space-y-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px] bg-gray-200 dark:bg-gray-700" />
                          <Skeleton className="h-4 w-[150px] bg-gray-200 dark:bg-gray-700" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
                      <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
                      <Skeleton className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700" />
                      <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                        <Skeleton className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={{
                      ...post,
                      // Convert the reactions object to a string so it doesn't render as an object
                      reactions: `Likes: ${post.reactions.likes}, Dislikes: ${post.reactions.dislikes}`
                    }}
                  />
                ))}

                <Pagination>
                  <PaginationContent>
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentPage(currentPage - 1)
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
                              setCurrentPage(pageNumber)
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
                            setCurrentPage(currentPage + 1)
                          }}
                        />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center">
                <h3 className="text-lg font-medium">No posts found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
