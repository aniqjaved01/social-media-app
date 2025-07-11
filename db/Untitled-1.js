//Part: 1

// 1. COLLECTION SCHEMAS

// users collection

const userSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    auto: true // Automatically generate ObjectId if not provided
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  joined: {
    type: Date,
    default: Date.now
  },
  follower_count: {
    type: Number,
    default: 0
  },
  following_count: {
    type: Number,
    default: 0
  }
});

// follower collection
 const followerSchema = new mongoose.Schema({
  _id: {
    type: String, // user ID of the one being followed
    required: true
  },
  followers: {
    type: [String], // array of user IDs who follow this user
    default: []
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Following collection
const followingSchema = new mongoose.Schema({
  _id: {
    type: String, // user ID of the one who is following others
    required: true
  },
  followings: {
    type: [String], // array of user IDs being followed
    default: []
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});


// posts collection - optimized for chronological queries

const postSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    auto: true // Automatically generate ObjectId if not provided
  },
  author: {
    type: String, // Reference to user ID (e.g. "u2")
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  likes: {
    type: Number,
    default: 0 // Denormalized like count for fast access
  },
  replies: {
    type: Number,
    default: 0 // Denormalized reply count
  }
});

// 2. AGGREGATION PIPELINE - Get 10 most recent posts from user's followings

const getFeedPipeline = (userId) => {
  return [
    // Stage 1: Match the user's following document
    {
      $match: {
        _id: userId
      }
    },
    
    // Stage 2: Lookup posts from all users this user follows
    {
      $lookup: {
        from: "posts",
        localField: "followings",
        foreignField: "author",
        as: "followingPosts"
      }
    },
    
    // Stage 3: Unwind the posts array to work with individual posts
    {
      $unwind: "$followingPosts"
    },
    
    // Stage 4: Replace root to make posts the main documents
    {
      $replaceRoot: {
        newRoot: "$followingPosts"
      }
    },
    
    // Stage 5: Sort by creation date (newest first)
    {
      $sort: {
        created: -1
      }
    },
    
    // Stage 6: Limit to 10 most recent posts
    {
      $limit: 10
    }
  ];
};

// Example Usage
// db.followings.aggregate(getFeedPipeline("u123"));


// 3. Performance
// A compound index on {author: 1, created: -1} to efficiently filter posts by author and sort by creation date in descending order, 
// which directly supports the feed query pattern.
