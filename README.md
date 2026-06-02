<div align="center">

#  Socialify (Pixora)

**A production-grade, full-stack social media platform built with the MERN Stack.**

*Create posts · Like content · Follow users · Discover trending content*

[![Node.js](https://img.shields.io/badge/Node.js-22.x-green?logo=nodedotjs)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-black?logo=express)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)

</div>

---

##  Table of Contents

1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [System Architecture](#-system-architecture)
4. [Backend Deep Dive](#-backend-deep-dive)
   - [Directory Structure](#directory-structure)
   - [API Reference](#api-reference)
   - [Middleware Pipeline](#middleware-pipeline)
   - [Authentication Flow](#authentication-flow)
   - [Error Handling](#error-handling)
   - [Security Hardening](#security-hardening)
5. [Frontend Deep Dive](#-frontend-deep-dive)
6. [Data Models](#-data-models)
7. [Docker & Deployment](#-docker--deployment)
8. [Getting Started](#-getting-started)
9. [Environment Variables](#-environment-variables)

---

##  Project Overview

Socialify is a **production-ready social media web application** inspired by Instagram. It allows users to create accounts, upload photo posts, follow other creators, like content, and discover trending posts from the community.

### Core Functionality

| Feature | Description |
|---|---|
|  **Auth** | JWT-based registration & login with secure HttpOnly cookies |
|  **Post Creation** | Upload images with captions, stored via ImageKit CDN |
|  **Likes** | Optimistic UI like/unlike with real-time count updates |
|  **Follow System** | Follow/Unfollow users, personalized home feed |
|  **Search** | Search posts by caption or username via regex matching |
|  **Popular Feed** | Posts ranked by like count using MongoDB aggregation |
|  **Profiles** | User profiles with follower/following counts and post history |
|  **Profile Editing** | Update username, bio, and avatar |
|  **Delete Posts** | Authors can delete their own posts |
|  **Pagination** | All feed endpoints support `?page=X&limit=Y` |

---

##  Tech Stack

### Backend
| Package | Version | Role |
|---|---|---|
| `express` | `^5.2.1` | Web framework |
| `mongoose` | `^9.3.1` | MongoDB ODM |
| `jsonwebtoken` | `^9.0.3` | JWT-based authentication |
| `bcryptjs` | `^3.0.3` | Password hashing |
| `multer` | `^2.1.1` | Multipart file upload handling |
| `@imagekit/nodejs` | `^7.3.0` | Cloud media storage |
| `cookie-parser` | `^1.4.7` | HttpOnly cookie parsing |
| `cors` | `^2.8.6` | Cross-Origin Resource Sharing |
| `helmet` | `^8.2.0` | Secure HTTP headers |
| `express-rate-limit` | `^8.5.2` | Brute-force rate limiting |
| `express-validator` | `^7.3.2` | Input validation |
| `dotenv` | `^17.3.1` | Environment variable management |

### Frontend
| Package | Role |
|---|---|
| `react@19` + `vite` | UI framework and build tool |
| `react-router@7` | Client-side routing |
| `framer-motion` | Animations and micro-interactions |
| `lucide-react` | Icon library |
| `sass` | SCSS-based styling |
| `axios` | HTTP client for API requests |
| `react-hot-toast` | Toast notifications |
| `browser-image-compression` | Client-side image compression before upload |

---

##  System Architecture

Socialify uses a **monolithic deployment strategy**: the Express backend serves the compiled React app as static files from the `/dist` folder.  There is no separate frontend hosting — one Node.js server handles everything.

```
┌────────────────────────────────────────────────────┐
│               User's Web Browser                    │
│                                                    │
│  GET /            → Express serves React (SPA)     │
│  GET /api/...     → Express handles API request    │
└────────────────────────┬───────────────────────────┘
                         │  HTTP
                         ▼
┌────────────────────────────────────────────────────┐
│              Node.js / Express Server               │
│                   (Port 3000)                       │
│                                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │ /api/auth   │  │ /api/posts  │  │ /api/users │ │
│  └─────────────┘  └─────────────┘  └────────────┘ │
│                                                    │
│  ┌────────────────────────────────────────────────┐│
│  │           Middleware Pipeline                   ││
│  │  Helmet → CORS → CookieParser → Rate Limiter   ││
│  │  → Validator → identifyUser → Controller       ││
│  └────────────────────────────────────────────────┘│
└───────────┬──────────────────────────┬─────────────┘
            │ Mongoose ODM             │ ImageKit SDK
            ▼                         ▼
┌─────────────────┐         ┌──────────────────────┐
│  MongoDB Atlas  │         │    ImageKit CDN       │
│  (Database)     │         │  (Image Storage)      │
└─────────────────┘         └──────────────────────┘
```

---

##  Backend Deep Dive

### Directory Structure

```
Backend/
├── server.js              # Entry point: connects DB, starts server
├── src/
│   ├── app.js             # Express app setup, middleware chain
│   ├── config/
│   │   └── database.js    # Mongoose connection logic
│   ├── controllers/
│   │   ├── auth.controller.js   # register, login, logout, getMe
│   │   ├── post.controller.js   # CRUD + like + feed + search + popular
│   │   └── user.controller.js   # follow, unfollow, profile, topCreators
│   ├── middlewares/
│   │   ├── auth.middleware.js      # JWT verification (identifyUser, optionalIdentifyUser)
│   │   ├── error.middleware.js     # Global error handler
│   │   └── validation.middleware.js # express-validator result checker
│   ├── models/
│   │   ├── user.model.js
│   │   ├── post.model.js
│   │   ├── like.model.js
│   │   └── follow.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── post.routes.js
│   │   └── user.routes.js
│   ├── validators/
│   │   ├── auth.validator.js  # Register & login validation chains
│   │   └── user.validator.js  # Profile update validation chains
│   └── utils/
│       └── catchAsync.js      # Async error wrapper utility
```

---

### API Reference

####  Auth Routes — `/api/auth`

| Method | Endpoint | Auth | Rate Limit | Description |
|---|---|---|---|---|
| `POST` | `/register` | ❌ Public | ✅ 5/15min | Create a new account |
| `POST` | `/login` | ❌ Public | ✅ 5/15min | Login and receive cookie |
| `GET` | `/get-me` | ✅ Required | ❌ | Get the logged-in user's data |
| `POST` | `/logout` | ❌ Public | ❌ | Clear the auth cookie |

**Register Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123",
  "bio": "Hello world!" // optional
  // profileImage: <multipart file> // optional
}
```

---

####  Post Routes — `/api/posts`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/` | ✅ Required | Create a new post (multipart image + caption) |
| `GET` | `/` | ✅ Required | Get all posts by the logged-in user |
| `GET` | `/details/:postId` | ✅ Required | Get a single post's details |
| `DELETE` | `/:postId` | ✅ Required | Delete your own post |
| `POST` | `/like/:postId` | ✅ Required | Like a post |
| `POST` | `/unlike/:postId` | ✅ Required | Unlike a post |
| `GET` | `/feed?page=1&limit=10` | 🔓 Optional | Personalized feed (following + own posts) |
| `GET` | `/search?q=keyword` | 🔓 Optional | Search by caption or username |
| `GET` | `/popular?page=1&limit=10` | 🔓 Optional | Posts ranked by like count |

> 🔓 **Optional Auth**: If you are logged in, these endpoints also return `isLiked` and `isFollowing` flags. Without auth, they return public post data only.

---

####  User Routes — `/api/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/follow/:username` | ✅ Required | Follow a user |
| `POST` | `/unfollow/:username` | ✅ Required | Unfollow a user |
| `GET` | `/profile/:username` | 🔓 Optional | Get any user's full profile |
| `PUT` | `/profile` | ✅ Required | Update your own profile |
| `GET` | `/top` | 🔓 Optional | Get top creators by follower count |

---

### Middleware Pipeline

Every incoming HTTP request travels through a sequential pipeline before reaching a controller. Here is the exact order of execution:

```
Incoming Request
       │
       ▼
  [1] express.json()          → Parses JSON request body
       │
       ▼
  [2] helmet()                → Sets secure HTTP headers
  (CSP disabled for CDN images)
       │
       ▼
  [3] cookieParser()          → Makes cookies available at req.cookies
       │
       ▼
  [4] cors()                  → Allows requests from FRONTEND_URL only
       │
       ▼
  [5] Route Match             → e.g. POST /api/auth/register
       │
       ▼
  [6] Rate Limiter (authLimiter)  → Only on /login & /register
  (5 requests per 15 minutes per IP)
       │
       ▼
  [7] Multer Upload           → Handles file uploads to memory buffer
       │
       ▼
  [8] Express-Validator       → Validates/sanitizes request body fields
       │
       ▼
  [9] identifyUser / optionalIdentifyUser
  (JWT middleware - verifies cookie token)
       │
       ▼
  [10] Controller             → Business logic runs here
       │
       ▼
  [11] errorHandler (global)  → Catches any thrown errors, returns JSON
```

---

### Authentication Flow

This application uses a **stateless JWT (JSON Web Token)** authentication system. No sessions are stored in memory or the database.

```mermaid
sequenceDiagram
    participant Browser
    participant Express
    participant MongoDB

    Browser->>Express: POST /api/auth/login with email and password
    Express->>MongoDB: Find user by email
    MongoDB-->>Express: Return user document
    Express->>Express: bcrypt.compare password with stored hash
    Express->>Express: jwt.sign id and username into a token
    Express-->>Browser: Set HttpOnly Cookie containing the JWT token

    Note over Browser: Cookie is stored automatically<br/>and sent on every future request

    Browser->>Express: GET /api/posts/feed with Cookie header
    Express->>Express: identifyUser middleware verifies the token
    Express->>Express: Attaches decoded user to req.user
    Express->>MongoDB: Query personalized feed for this user
    MongoDB-->>Express: Return posts array
    Express-->>Browser: 200 OK with posts data
```

**Why HttpOnly cookies?**
- They cannot be read by JavaScript (immune to XSS attacks).
- They are automatically sent with every request (no manual `Authorization` header needed).
- Combined with `SameSite=Lax`, they are resistant to CSRF attacks.

---

### Error Handling

The backend uses a **two-layer error handling architecture** that prevents server crashes and returns consistent JSON error responses.

#### Layer 1: `catchAsync` Utility
Every async controller function is wrapped with `catchAsync`, which automatically catches any unhandled promise rejection and forwards it to the global error handler via `next(err)`.

```javascript
// utils/catchAsync.js
const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
```

**Without catchAsync:** An unhandled rejection in an async function would crash the entire Node.js process.  
**With catchAsync:** Errors are gracefully forwarded and handled.

#### Layer 2: Global Error Handler
Registered as the last middleware in `app.js`, it catches every error forwarded by `next(err)`:

```javascript
// middlewares/error.middleware.js
const errorHandler = (err, req, res, next) => {
    // Mongoose Duplicate Key (e.g. username already taken)
    if (err.code === 11000) {
        return res.status(400).json({ message: "Duplicate key error" });
    }
    // All other errors
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error"
    });
};
```

---

### Security Hardening

#### 1. Helmet (HTTP Security Headers)

`helmet` automatically sets a suite of HTTP response headers that protect against common web vulnerabilities.

```javascript
app.use(helmet({
    contentSecurityPolicy: false,    // Disabled to allow ImageKit CDN images
    crossOriginEmbedderPolicy: false // Disabled for cross-origin media
}))
```

Headers set by Helmet include:
| Header | Protects Against |
|---|---|
| `X-Content-Type-Options: nosniff` | MIME-type sniffing attacks |
| `X-Frame-Options: SAMEORIGIN` | Clickjacking attacks |
| `X-XSS-Protection: 0` | Legacy XSS filter (disabled as recommended) |
| `Strict-Transport-Security` | Downgrade attacks (forces HTTPS) |
| `Referrer-Policy` | Information leakage via referrer header |

#### 2. Rate Limiting (Brute-Force Protection)

Applied specifically to the `/login` and `/register` routes:

```javascript
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15-minute window
    max: 5,                    // Only 5 attempts allowed per window per IP
    message: "Too many attempts, please try again after 15 minutes",
    standardHeaders: true,     // Sends X-RateLimit-* headers in response
    legacyHeaders: false,
})
```

**Why only auth routes?**  Without rate limiting, an attacker can automate thousands of login attempts to guess a user's password (brute-force). By capping at 5 attempts per 15 minutes, a bot would take centuries to crack even a weak password.

#### 3. Input Validation (express-validator)

Incoming request bodies are validated before they reach any controller logic.

**Registration rules:**
- `username`: Required, 3–20 chars, alphanumeric + underscores only
- `email`: Required, must be valid email format
- `password`: Required, minimum 6 characters
- `bio`: Optional, max 150 characters

If validation fails, the server immediately returns a `400 Bad Request` with an array of specific error messages — the controller never even runs.

```json
{
  "errors": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "password", "message": "Password must be at least 6 characters long" }
  ]
}
```

#### 4. Password Hashing (bcryptjs)

Passwords are **never stored as plain text**. Before saving a user to the database, the password is run through `bcrypt.hash()` with a salt round of 10. During login, `bcrypt.compare()` is used to verify the entered password against the stored hash.

#### 5. File Upload Limits (Multer)

To prevent denial-of-service via massive file uploads, all Multer upload configurations enforce a **5MB maximum file size**:

```javascript
const upload = multer({
    storage: multer.memoryStorage(), // No disk I/O - stored in RAM buffer
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB hard limit
})
```

---

##  Frontend Deep Dive

The frontend is a **Feature-Driven Single Page Application (SPA)** built with React 19 + Vite.

### Key UX Features

**Optimistic Updates:** When you click "Like," the heart icon updates *instantly* in the UI without waiting for the server response. If the server fails, it silently reverts. This is handled in `usePost.js`.

**Skeleton Loaders:** Instead of a generic spinner, `SkeletonPost.jsx` renders shimming animated placeholders that match the exact shape of a real post card. This makes the app feel extremely fast to the user.

**Client-Side Image Compression:** Using `browser-image-compression`, images are compressed in the user's browser before upload:
- Max file size: **1MB** (down from potentially 5MB)
- Max dimension: **1920px** width/height
- Profile picture max: **800px** (square crop friendly)

This reduces ImageKit storage costs and makes uploads 3–5x faster on mobile connections.

---

##  Data Models

### User Model
```
User {
  username    : String (unique, required)
  email       : String (unique, required)
  password    : String (hashed, required)
  bio         : String
  profileImage: String (ImageKit URL)
  createdAt   : Date
}
```

### Post Model
```
Post {
  caption : String (required)
  imgurl  : String (ImageKit URL, required)
  user    : ObjectId → User (required)
  createdAt: Date
}
```

### Like Model
```
Like {
  post : ObjectId → Post (required)
  user : ObjectId → User (required)
}
```

### Follow Model
```
Follow {
  follower : ObjectId → User (who is following)
  followee : ObjectId → User (who is being followed)
}
```

### Entity Relationship Diagram

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│   User   │──────▶│   Post   │◀──────│   Like   │
│          │  1:N  │          │  N:1  │          │
│ id       │       │ id       │       │ id       │
│ username │       │ caption  │       │ post_id  │
│ email    │       │ imgurl   │       │ user_id  │
│ password │       │ user_id  │       └──────────┘
│ bio      │       └──────────┘
│ avatar   │
└──────────┘
     │
     │ N:M (via Follow)
     │
┌──────────────┐
│    Follow    │
│              │
│ id           │
│ follower_id  │
│ followee_id  │
└──────────────┘
```

---

##  Docker & Deployment

### How the Dockerfile Works

The Dockerfile uses a **multi-stage build** to keep the final image small and production-optimized:

```dockerfile
# ─── Stage 1: Build the React Frontend ────────────────────────────────────
FROM node:22-alpine AS frontend-builder
# Install dependencies for the frontend
# Run `vite build` → outputs compiled files to /Backend/dist

# ─── Stage 2: Production Backend Image ────────────────────────────────────
FROM node:22-alpine
# Only copies:
# 1. Backend source code
# 2. The /dist folder from Stage 1 (compiled React app)
# 3. Only production npm dependencies (--production flag)
# Result: a lean, fast Docker image with no dev tools
EXPOSE 3000
CMD ["node", "server.js"]
```

**Why multi-stage?** The first stage needs all frontend dev tools (Vite, TypeScript compiler, etc.) which would bloat the final image to 500MB+. The second stage starts clean and only copies the final compiled output.

### Docker Compose (Local Full-Stack Setup)

`docker-compose.yml` defines a complete local environment with **two services**:

```
docker-compose up --build
        │
        ├──  mongodb service
        │     Image: mongo:latest
        │     Port: 27017 (local)
        │     Volume: mongodb_data (persistent)
        │
        └──  app service
              Build: ./Dockerfile
              Port: 3000 → localhost:3000
              Env: MONGODB_URI=mongodb://mongodb:27017/socialify
              Depends on: mongodb (waits for DB before starting)
```

The app service uses the **service name** `mongodb` (not `localhost`) as the database host — this is Docker's internal DNS resolution. When running with Compose, you get a fully isolated environment with no dependency on MongoDB Atlas.

### .dockerignore

Keeps the Docker build context clean by ignoring unnecessary files:

```
node_modules        # Never copy node_modules (rebuilt inside container)
.git                # Version control history not needed
.env                # Secrets never baked into image
Backend/node_modules
Frontend/node_modules
Backend/dist        # Will be built fresh inside Docker
```

---

##  Getting Started

### Prerequisites
- Node.js v18+ installed
- MongoDB Atlas account (or Docker for local MongoDB)
- ImageKit account (free tier works)

### Option 1: Docker Compose (Zero Setup Required)

```bash
# Clone the repository
git clone https://github.com/your-username/socialify.git
cd socialify

# Create Backend/.env with your secrets (see Environment Variables below)

# Start everything with one command
docker-compose up --build

# App is now running at http://localhost:3000
```

### Option 2: Traditional Local Dev

```bash
# 1. Install all dependencies
cd Backend && npm install
cd ../Frontend && npm install

# 2. Set up environment variables (see below)
# Create Backend/.env

# 3. Start development servers (two terminals)
# Terminal 1:
cd Backend && npm run dev   # Nodemon server on :3000

# Terminal 2:
cd Frontend && npm run dev  # Vite dev server on :5173
```

### Building for Production (Deploy to Render, etc.)

```bash
cd Frontend && npm run build
# This outputs to Backend/dist (configured in vite.config.js)
# Then deploy the entire Backend/ folder to your host
```

---

##  Environment Variables

Create a file at `Backend/.env`:

```env
# MongoDB connection string
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/socialify

# JWT secret — use a long, random string in production!
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long

# ImageKit credentials (from imagekit.io dashboard)
IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxxxxxxxxxxxx

# Frontend URL for CORS (use your deployed domain in production)
FRONTEND_URL=http://localhost:5173
```

>  **Critical:** Never commit `.env` to Git. Add it to `.gitignore`. If you accidentally expose your `JWT_SECRET`, rotate it immediately — all existing user sessions will be invalidated.

---

##  Project File Structure (Full)

```
socialify/
├── .dockerignore
├── docker-compose.yml
├── Dockerfile
├── README.md
│
├── Backend/
│   ├── server.js
│   ├── package.json
│   ├── .env                    ← (you create this)
│   ├── dist/                   ← (generated by `npm run build` in Frontend)
│   └── src/
│       ├── app.js
│       ├── config/database.js
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── post.controller.js
│       │   └── user.controller.js
│       ├── middlewares/
│       │   ├── auth.middleware.js
│       │   ├── error.middleware.js
│       │   └── validation.middleware.js
│       ├── models/
│       │   ├── user.model.js
│       │   ├── post.model.js
│       │   ├── like.model.js
│       │   └── follow.model.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── post.routes.js
│       │   └── user.routes.js
│       ├── validators/
│       │   ├── auth.validator.js
│       │   └── user.validator.js
│       └── utils/
│           └── catchAsync.js
│
└── Frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        └── features/
            ├── auth/          ← Login, Register pages & hooks
            ├── post/          ← Feed, Post, Skeleton components
            ├── user/          ← Profile page
            └── shared/        ← Spinner, Sidebar, Navbar
```
