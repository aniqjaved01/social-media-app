"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "./components/login-form"
import { Feed } from "./components/feed"
import { useAuth } from "./hooks/use-auth"
import { Button } from "@/components/ui/button"

export function App() {
  const { user, logout } = useAuth()
  const [currentView, setCurrentView] = useState<"login" | "feed">("login")

  useEffect(() => {
    if (user) {
      setCurrentView("feed")
    } else {
      setCurrentView("login")
    }
  }, [user])

  return (
    <div className="min-h-screen bg-gray-50">
      {user && (
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-xl font-semibold">Mini Feed</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user.username}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </header>
      )}

      <main className="max-w-4xl mx-auto px-4 py-6">{currentView === "login" ? <LoginForm /> : <Feed />}</main>
    </div>
  )
}
