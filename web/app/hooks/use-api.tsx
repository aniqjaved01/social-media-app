"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "./use-auth"

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiOptions {
  skip?: boolean
  params?: Record<string, any>
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useApi<T>(resource: string, options: UseApiOptions = {}) {
  const { token } = useAuth()
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchData = async (signal?: AbortSignal) => {
    const cacheKey = `${resource}${JSON.stringify(options.params || {})}`

    // Check cache first
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setState({ data: cached.data, loading: false, error: null })
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const url = new URL(resource, window.location.origin)
      if (options.params) {
        Object.entries(options.params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value))
        })
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(url.toString(), {
        headers,
        signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Cache the result
      cache.set(cacheKey, { data, timestamp: Date.now() })

      setState({ data, loading: false, error: null })
    } catch (error: any) {
      if (error.name !== "AbortError") {
        setState({ data: null, loading: false, error: error.message })
      }
    }
  }

  useEffect(() => {
    if (options.skip) return

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    fetchData(abortControllerRef.current.signal)

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [resource, JSON.stringify(options.params), options.skip, token])

  const refetch = () => {
    if (!options.skip) {
      fetchData()
    }
  }

  return { ...state, refetch }
}
