"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import { Heart, MessageCircle, Share2, ArrowLeft } from 'lucide-react'

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
  image: string
}

type Comment = {
  id: number
  body: string
  postId: number
  user: {
    id: number
    username: string
  }
}

export default function PostPage() {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentUsers, setCommentUsers] = useState<Record<number, User>>({})

  useEffect(() => {
    const fetchPostData = async () => {
      setLoading(true)
      try {
        // Fetch post
        const postResponse = await fetch(`https://dummyjson.com/posts/${id}`)
        
        if (!postResponse.ok) {
          throw new Error(`Failed to fetch post: ${postResponse.status}`)
        }
        
        const postData = await postResponse.json()
        setPost(postData)
        
        // Fetch post author
        const userResponse = await fetch(`https://dummyjson.com/users/${postData.userId}`)
        
        if (!userResponse.ok) {
          throw new Error(`Failed to fetch user: ${userResponse.status}`)
        }
        
        const userData = await userResponse.json()
        setUser(userData)
        
        // Fetch comments
        const commentsResponse = await fetch(`https://dummyjson.com/posts/${id}/comments`)
        
        if (!commentsResponse.ok) {
          throw new Error(`Failed to fetch comments: ${commentsResponse.status}`)
        }
        
        const commentsData = await commentsResponse.json()
        setComments(commentsData.comments || [])
        
        // Fetch user data for each comment
        if (commentsData.comments && commentsData.comments.length > 0) {
          const userIds: number[] = [];
          // const userIds = [...new Set(commentsData.comments.map((comment: Comment) => comment.user.id))]
          const userDataPromises = userIds.map((userId: number) => 
            fetch(`https://dummyjson.com/users/${userId}`).then(res => {
              if (!res.ok) {
                throw new Error(`Failed to fetch user ${userId}: ${res.status}`)
              }
              return res.json()
            })
          )
          
          const usersData = await Promise.all(userDataPromises)
          const usersMap: Record<number, User> = {}
          usersData.forEach((userData: User) => {
            usersMap[userData.id] = userData
          })
          
          setCommentUsers(usersMap)
        }
      } catch (error) {
        console.error("Error fetching post data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (id) {
      fetchPostData()
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <main className="container py-6">
          <div className="max-w-3xl mx-auto">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px] bg-gray-200 dark:bg-gray-700" />
                    <Skeleton className="h-4 w-[150px] bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700" />
                <div className="flex flex-wrap gap-2 mt-4">
                  <Skeleton className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <Skeleton className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <Skeleton className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                </div>
              </CardContent>
            </Card>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Comments</h2>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-[120px] bg-gray-200 dark:bg-gray-700" />
                        <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <main className="container py-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-bold">Post not found</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">The post you're looking for doesn't exist or has been removed.</p>
            <Button asChild className="mt-4 bg-purple-600 hover:bg-purple-700 text-white">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <main className="container py-6">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Feed
            </Link>
          </Button>
          
          <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Link href={`/profile/${post.userId}`}>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user?.image} alt={user?.username} />
                    <AvatarFallback>
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link href={`/profile/${post.userId}`} className="font-medium hover:underline">
                    {user?.firstName} {user?.lastName}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400">@{user?.username}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
              <p className="whitespace-pre-line text-gray-500 dark:text-gray-400">{post.body}</p>
              
              <div className="flex flex-wrap gap-2 mt-6">
                {post.tags.map((tag) => (
                  <Link href={`/dashboard?tag=${tag}`} key={tag}>
                    <Badge variant="secondary" className="hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer">
                      #{tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-200 dark:border-gray-800 p-4 flex justify-between">
              <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400 gap-1">
                <Heart className="h-4 w-4" />
                <span>{post.reactions} likes</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400 gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>{comments.length} comments</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400 gap-1">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </CardFooter>
          </Card>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">Comments ({comments.length})</h2>
          
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => {
                const commentUser = commentUsers[comment.user.id]
                return (
                  <Card key={comment.id} className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <Link href={`/profile/${comment.user.id}`}>
                          <Avatar>
                            <AvatarImage src={commentUser?.image} alt={commentUser?.username} />
                            <AvatarFallback>
                              {commentUser?.firstName?.charAt(0)}{commentUser?.lastName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <Link href={`/profile/${comment.user.id}`} className="font-medium hover:underline">
                              {commentUser?.firstName} {commentUser?.lastName}
                            </Link>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">@{comment.user.username}</p>
                          <p>{comment.body}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
