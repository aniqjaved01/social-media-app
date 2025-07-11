"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useApi } from "../hooks/use-api"
import { Post } from "./post"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"

interface PostData {
  id: string
  title: string
  content: string
  author: string
  createdAt: string
  likes: number
}

export function Feed() {
  const [page, setPage] = useState(1)
  const [allPosts, setAllPosts] = useState<PostData[]>([])
  const [hasMore, setHasMore] = useState(true)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const { data, loading, error, refetch } = useApi<{ posts: PostData[]; hasMore: boolean }>("/api/feed", {
    params: { page, limit: 10 },
  })

  // Update posts when new data arrives
  useEffect(() => {
    if (data?.posts) {
      if (page === 1) {
        setAllPosts(data.posts)
      } else {
        setAllPosts((prev) => {
          // Avoid duplicates
          const existingIds = new Set(prev.map((p) => p.id))
          const newPosts = data.posts.filter((p) => !existingIds.has(p.id))
          return [...prev, ...newPosts]
        })
      }
      setHasMore(data.hasMore)
    }
  }, [data, page])

  // Infinite scroll implementation
  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1)
        }
      })

      if (node) observerRef.current.observe(node)
    },
    [loading, hasMore],
  )

  const handleRefresh = () => {
    setPage(1)
    setAllPosts([])
    setHasMore(true)
    refetch()
  }

  if (error && allPosts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error loading feed: {error}</p>
        <Button onClick={handleRefresh}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Feed</h2>
        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {allPosts.map((post, index) => (
          <div key={post.id} ref={index === allPosts.length - 1 ? lastPostRef : null}>
            <Post post={post} />
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading more posts...</span>
          </div>
        </div>
      )}

      {!hasMore && allPosts.length > 0 && (
        <div className="text-center py-4 text-gray-500">🎉 You've reached the end! No more posts to load.</div>
      )}

      {allPosts.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">No posts available. Try refreshing the page.</div>
      )}
    </div>
  )
}
