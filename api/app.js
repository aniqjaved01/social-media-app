const express = require("express")
const jwt = require("jsonwebtoken")

const app = express()
app.use(express.json())

const users = [
  { id: "u1", username: "user1", password: "pass1", role: "user" },
  { id: "u2", username: "admin1", password: "pass2", role: "admin" },
]

// Custom JWT Secret
const JWT_SECRET = "key"

// middleware
const authorize = (roles) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid token" })
    }

    const token = authHeader.substring(7) 

    try {
      const decoded = jwt.verify(token, JWT_SECRET)

      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ error: "Insufficient permissions" })
      }

      req.user = decoded
      next()
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" })
    }
  }
}

// POST login
app.post("/login", (req, res) => {
  const { username, password } = req.body

  const user = users.find((u) => u.username === username && u.password === password)

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" })
  }

  // Create JWT token
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" })

  res.json({ token, user: { id: user.id, role: user.role } })
})

// Admin DELETE
app.delete("/posts/:id", authorize(["admin"]), (req, res) => {
  const postId = req.params.id

  res.json({
    message: `Post ${postId} deleted successfully`,
    deletedBy: req.user.id,
  })
})


const PORT = process.env.PORT || 3000


module.exports = { app, authorize }
