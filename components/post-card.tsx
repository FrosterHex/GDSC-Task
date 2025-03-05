"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Heart, MessageCircle, Share2 } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { truncateText } from "@/lib/utils"

type Post = {
  id: number
  title: string
  body: string
  userId: number
  tags: string[]
  reactions: string
}

type User = {
  id: number
  firstName: string
  lastName: string
  username: string
  image: string
}

export function PostCard({ post }: { post: Post }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`https://dummyjson.com/users/${post.userId}`)
        const data = await response.json()
        setUser(data)
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [post.userId])

  return (
    <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ) : (
              <Link href={`/profile/${post.userId}`}>
                <Avatar>
                  <AvatarImage src={user?.image} alt={user?.username} />
                  <AvatarFallback>
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Link>
            )}
            <div>
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              ) : (
                <>
                  <Link href={`/profile/${post.userId}`} className="font-medium hover:underline">
                    {user?.firstName} {user?.lastName}
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400">@{user?.username}</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Link href={`/post/${post.id}`}>
            <h3 className="text-xl font-semibold hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              {post.title}
            </h3>
          </Link>
          <p className="mt-2 text-gray-500 dark:text-gray-400">{truncateText(post.body, 150)}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link href={`/dashboard?tag=${tag}`} key={tag}>
                <Badge variant="secondary" className="hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer">
                  #{tag}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-gray-200 dark:border-gray-800 p-4 flex justify-between">
        <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400 gap-1">
          <Heart className="h-4 w-4" />
          <span>{post.reactions}</span>
        </Button>

        <Link href={`/post/${post.id}`}>
          <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400 gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>Comments</span>
          </Button>
        </Link>

        <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400 gap-1">
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </CardFooter>
    </Card>
  )
}

