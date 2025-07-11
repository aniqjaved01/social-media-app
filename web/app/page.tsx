"use client"

import { AuthProvider } from "./hooks/use-auth"
import { App } from "./app"

export default function Page() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  )
}
