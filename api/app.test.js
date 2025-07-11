const request = require("supertest")
const jwt = require("jsonwebtoken")
const { app } = require("./app")

const JWT_SECRET = "key"

describe("Express JWT Auth App", () => {
  let adminToken
  let userToken

  beforeAll(async () => {
    // Get admin token
    const adminResponse = await request(app).post("/login").send({ username: "admin1", password: "pass2" })

    adminToken = adminResponse.body.token

    // Get user token
    const userResponse = await request(app).post("/login").send({ username: "user1", password: "pass1" })

    userToken = userResponse.body.token
  })

  describe("POST /login", () => {
    it("should return JWT token for valid credentials", async () => {
      const response = await request(app).post("/login").send({ username: "admin1", password: "pass2" })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty("token")
      expect(response.body.user).toEqual({ id: "u2", role: "admin" })
    })

    it("should return 401 for invalid credentials", async () => {
      const response = await request(app).post("/login").send({ username: "invalid", password: "invalid" })

      expect(response.status).toBe(401)
      expect(response.body.error).toBe("Invalid credentials")
    })
  })

  describe("DELETE /posts/:id", () => {
    it("should allow admin to delete posts", async () => {
      const response = await request(app).delete("/posts/123").set("Authorization", `Bearer ${adminToken}`)

      expect(response.status).toBe(200)
      expect(response.body.message).toBe("Post 123 deleted successfully")
      expect(response.body.deletedBy).toBe("u2")
    })

    it("should forbid normal user from deleting posts", async () => {
      const response = await request(app).delete("/posts/123").set("Authorization", `Bearer ${userToken}`)

      expect(response.status).toBe(403)
      expect(response.body.error).toBe("Insufficient permissions")
    })

    it("should return 401 for missing token", async () => {
      const response = await request(app).delete("/posts/123")

      expect(response.status).toBe(401)
      expect(response.body.error).toBe("Missing or invalid token")
    })

    it("should return 401 for invalid token", async () => {
      const response = await request(app).delete("/posts/123").set("Authorization", "Bearer invalid-token")

      expect(response.status).toBe(401)
      expect(response.body.error).toBe("Invalid token")
    })

    it("should return 401 for malformed authorization header", async () => {
      const response = await request(app).delete("/posts/123").set("Authorization", "InvalidFormat token")

      expect(response.status).toBe(401)
      expect(response.body.error).toBe("Missing or invalid token")
    })
  })

  describe("Authorization Middleware", () => {
    it("should extract user information from valid token", async () => {
      const response = await request(app).delete("/posts/456").set("Authorization", `Bearer ${adminToken}`)

      expect(response.status).toBe(200)
      expect(response.body.deletedBy).toBe("u2")
    })

    it("should handle expired tokens", async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { id: "u2", role: "admin" },
        JWT_SECRET,
        { expiresIn: "-1h" }, // Expired 1 hour ago
      )

      const response = await request(app).delete("/posts/123").set("Authorization", `Bearer ${expiredToken}`)

      expect(response.status).toBe(401)
      expect(response.body.error).toBe("Invalid token")
    })
  })
})
