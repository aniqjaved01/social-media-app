import { type NextRequest, NextResponse } from "next/server"

// Mock data generator with more realistic content
const generateMockPosts = (page: number, limit: number) => {
  const posts = []
  const startId = (page - 1) * limit + 1

  const sampleTitles = [
    "The Future of Web Development",
    "Building Scalable React Applications",
    "Understanding Modern JavaScript",
    "CSS Grid vs Flexbox: When to Use What",
    "State Management in React",
    "TypeScript Best Practices",
    "Performance Optimization Tips",
    "Accessibility in Web Development",
    "Modern DevOps Practices",
    "API Design Principles",
  ]

  const sampleContent = [
    "Exploring the latest trends and technologies that are shaping the future of web development. From AI integration to progressive web apps, the landscape is evolving rapidly.",
    "Learn how to structure your React applications for maximum scalability and maintainability. We'll cover component architecture, state management, and testing strategies.",
    "Dive deep into modern JavaScript features including async/await, destructuring, modules, and more. Understanding these concepts is crucial for any web developer.",
    "A comprehensive comparison of CSS Grid and Flexbox, helping you understand when to use each layout method for optimal results in your web projects.",
    "Comparing different state management solutions for React applications, from Context API to Redux and Zustand. Find the right tool for your project.",
    "Essential TypeScript patterns and practices that will make your code more robust, maintainable, and developer-friendly.",
    "Practical tips for optimizing web application performance, including code splitting, lazy loading, and bundle optimization techniques.",
    "Making your web applications accessible to all users. Learn about ARIA, semantic HTML, and testing for accessibility compliance.",
    "Modern approaches to DevOps including containerization, CI/CD pipelines, and infrastructure as code for efficient development workflows.",
    "Best practices for designing RESTful APIs that are intuitive, scalable, and maintainable. Learn about versioning, documentation, and error handling.",
  ]

  const authors = ["Alice Johnson", "Bob Smith", "Carol Davis", "David Wilson", "Eva Brown"]

  for (let i = 0; i < limit; i++) {
    const id = startId + i
    const titleIndex = (id - 1) % sampleTitles.length
    const contentIndex = (id - 1) % sampleContent.length
    const authorIndex = (id - 1) % authors.length

    posts.push({
      id: id.toString(),
      title: sampleTitles[titleIndex],
      content: sampleContent[contentIndex],
      author: authors[authorIndex],
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      likes: Math.floor(Math.random() * 100) + 1,
    })
  }

  return posts
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 500))

    const posts = generateMockPosts(page, limit)
    const hasMore = page < 15 // Simulate having 15 pages of data

    return NextResponse.json({
      posts,
      hasMore,
      page,
      totalPages: 15,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 })
  }
}
