import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Mock authentication - replace with real auth logic
    if (username === "demo" && password === "password") {
      return NextResponse.json({
        token: "mock-jwt-token-" + Date.now(),
        user: {
          id: "1",
          username: "demo",
          email: "demo@example.com",
        },
      })
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
