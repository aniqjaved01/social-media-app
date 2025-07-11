### 1. **Error Handling (try-catch)**

**Problem**: If the database query fails , the function throws an unhandled exception and never sends a response. This makes the client end wait indefinitely.

**Fix**: Wrap the async operations in try-catch and always send a response, even on error.

**Why it matters**: Prevents hanging requests and provides meaningful error messages to clients.

### 2. **Database-Level Sorting**

**Problem**: `posts.sort()` happens in JavaScript after fetching ALL records. This is inefficient because:

- JavaScript sorting is slower than database sorting

**Fix**: Use MongoDB's `.sort({ created: -1 })` to sort at the database level.

**Why it matters**: Faster and scales better as your data grows.

### 3. **Explicit Status Codes**

**Problem**: Clients can't easily distinguish between different types of responses.

**Fix**: Use `res.status(200)` for success and `res.status(500)` for errors.

**Why it matters**: Makes your API more predictable and easier for clients to handle different scenarios.

### 4. **Pagination**

**Problem**: Fetching all posts at once will eventually cause memory issues and slow response times as your database grows.

**Fix**: Add pagination with `skip()` and `limit()`.

**Why it matters**: Keeps response times fast and memory usage predictable, regardless of dataset size.
