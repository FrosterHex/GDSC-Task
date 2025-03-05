"use client"

import { useEffect, useState } from "react"
import { Check, ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type PostFilterProps = {
  onTagSelect: (tag: string | null) => void
  selectedTag: string | null
  onSortChange: (sortOption: string) => void
  currentSort: string
}

export function PostFilter({ onTagSelect, selectedTag, onSortChange, currentSort }: PostFilterProps) {
  const [popularTags, setPopularTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("https://dummyjson.com/posts?limit=100")
        
        if (!response.ok) {
          throw new Error(`Failed to fetch posts: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Extract all tags from posts and count occurrences
        const tagCounts: Record<string, number> = {}
        data.posts.forEach((post: any) => {
          post.tags.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          })
        })
        
        // Sort tags by occurrence count and take top 10
        const sortedTags = Object.entries(tagCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([tag]) => tag)
        
        setPopularTags(sortedTags)
      } catch (error) {
        console.error("Error fetching tags:", error)
        setPopularTags([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchTags()
  }, [])

  return (
    <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Sort By</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                {currentSort === "default" ? "Default" : 
                 currentSort === "reactions" ? "Most Liked" : "Default"}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <DropdownMenuRadioGroup value={currentSort} onValueChange={onSortChange}>
                <DropdownMenuRadioItem value="default">Default</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="reactions">Most Liked</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Popular Tags</h3>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedTag && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                  onClick={() => onTagSelect(null)}
                >
                  Clear Filter
                </Button>
              )}
              
              {popularTags.map((tag) => (
                <Badge 
                  key={tag}
                  variant={selectedTag === tag ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => onTagSelect(tag)}
                >
                  {selectedTag === tag && <Check className="mr-1 h-3 w-3" />}
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
