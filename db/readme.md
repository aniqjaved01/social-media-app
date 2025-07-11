# Social Media Database Schema

## Overview

This document outlines the MongoDB schema design for a social media application using Mongoose ODM. The schema implements a denormalized approach optimized for read-heavy operations typical in social media platforms.

## Database Design Philosophy

The schema follows a **denormalized design pattern** to optimize for:
- Fast read operations (critical for social media feeds)
- Reduced join operations
- Efficient aggregation queries
- Scalable follower/following relationships

## Collections

### 1. Users Collection

```javascript
const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  joined: Date,
  follower_count: Number,
  following_count: Number
});
```

**Purpose**: Stores core user profile information with denormalized counters.

**Fields**:
- `_id`: Auto-generated MongoDB ObjectId serving as unique identifier
- `name`: User's display name (required, whitespace trimmed)
- `joined`: Account creation timestamp (defaults to current date)
- `follower_count`: Denormalized count of users following this user
- `following_count`: Denormalized count of users this user follows

**Design Decisions**:
- Uses ObjectId for natural MongoDB integration
- Maintains denormalized counts to avoid expensive aggregation queries
- Trim whitespace to ensure data consistency

### 2. Follower Collection

```javascript
const followerSchema = new mongoose.Schema({
  _id: String,
  followers: [String],
  updatedAt: Date
});
```

**Purpose**: Tracks who follows each user using an array-based approach.

**Fields**:
- `_id`: User ID of the person being followed
- `followers`: Array of user IDs who follow this user
- `updatedAt`: Last modification timestamp

**Design Decisions**:
- Uses String IDs for simplified lookups
- Array storage enables efficient "who follows X" queries
- Single document per user reduces collection size

### 3. Following Collection

```javascript
const followingSchema = new mongoose.Schema({
  _id: String,
  followings: [String],
  updatedAt: Date
});
```

**Purpose**: Tracks who each user follows (inverse of follower relationship).

**Fields**:
- `_id`: User ID of the person doing the following
- `followings`: Array of user IDs being followed by this user
- `updatedAt`: Last modification timestamp

**Design Decisions**:
- Maintains bidirectional relationship data for query flexibility
- Enables efficient "who does X follow" queries
- Supports fast feed generation algorithms

### 4. Posts Collection

```javascript
const postSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  author: String,
  content: String,
  created: Date,
  likes: Number,
  replies: Number
});
```

**Purpose**: Stores user posts with denormalized engagement metrics.

**Fields**:
- `_id`: Auto-generated MongoDB ObjectId
- `author`: Reference to user ID (stored as string for consistency)
- `content`: Post text content (required, whitespace trimmed)
- `created`: Post creation timestamp
- `likes`: Denormalized like count
- `replies`: Denormalized reply count

**Design Decisions**:
- Uses ObjectId for natural timestamp ordering
- Denormalizes engagement metrics for dashboard performance
- String author reference maintains consistency with other collections

## Schema Relationships

```
Users (1) ←→ (N) Followers
Users (1) ←→ (N) Following  
Users (1) ←→ (N) Posts
```

## Query Optimization Considerations

### Indexing Strategy
Recommended indexes for optimal performance:

```javascript
// Users collection
db.users.createIndex({ "name": 1 })

// Followers collection  
db.followers.createIndex({ "followers": 1 })

// Following collection
db.followings.createIndex({ "followings": 1 })

// Posts collection
db.posts.createIndex({ "author": 1, "created": -1 })
db.posts.createIndex({ "created": -1 })
```