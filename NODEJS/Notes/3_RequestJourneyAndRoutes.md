# Backend Development - Request Journey, Routes & Controllers

---

## 1-) Journey of a Request

**Backend = the brain behind a website**

### Step-by-Step Flow:

#### 1. Client
- Browser, Postman, Mobile App
- Initiates the request

#### 2. app.js
- Entry point — receives ALL requests first
- Gateway for the backend

#### 3. Routes File
- Checks URL path + HTTP method
- Directs to appropriate controller

#### 4. Controller
- Does the actual work — fetch / save / delete
- Processes the request

#### 5. MongoDB
- Fetches or saves data
- Returns data to controller

#### 6. Response ✅
- Sent back to client
- Complete the cycle

---

## 2-) app.js Configuration

**app.js = the gateway — first file to handle every request**

### Two Critical Lines:

#### 1. `app.use(express.json())`

- **Purpose:** Parses incoming JSON body
- **Effect:** Makes `req.body` available

#### 2. `app.use('/api/v1/users', userRouter)`

- **Purpose:** All `/api/v1/users/*` requests go to userRouter
- **Effect:** Routes are registered for specific paths

---

## URL Breakdown

```
http://localhost:5000/api/v1/users/register
```

| Part | Name | Meaning |
|------|------|---------|
| `http://` | Protocol | How data is sent |
| `localhost` | Dev server | Your computer |
| `:5000` | Port | Where to listen |
| `/api` | API prefix | API identifier |
| `/v1` | Version | API version |
| `/users` | Router path (app.js) | Set in `app.use()` |
| `/register` | Route (routes file) | Set in route file |

---

## 3-) HTTP Methods

**HTTP = the language client and server use to talk to each other**

### GET
- **Action:** Read / Fetch data
- **Example:** Load Twitter feed, get user profile

### POST
- **Action:** Create new data
- **Example:** Register, Login, Logout

### PUT
- **Action:** Replace entire resource
- **Example:** Replace whole user profile

### PATCH
- **Action:** Update part of a resource
- **Example:** Update profile picture only

### DELETE
- **Action:** Remove data
- **Example:** Delete a post or account

---

## HTTP Status Codes

### 2xx — Success ✅

| Code | Meaning |
|------|---------|
| **200** | OK — Request successful |
| **201** | Created — New resource successfully created |

### 4xx — Client Error ⚠️

| Code | Meaning |
|------|---------|
| **400** | Bad Request — Invalid client input |
| **404** | Not Found — Resource doesn't exist |

### 5xx — Server Error ❌

| Code | Meaning |
|------|---------|
| **500** | Internal Server Error — Server-side failure |

### Rule:
- **2xx** = ✅ success
- **4xx** = ⚠️ client fault
- **5xx** = ❌ server fault

---

## 4-) Routes File Setup

**Routes = traffic directors**

They do NOT do the work — they just forward requests to controllers

### user.routes.js:

```javascript
import express from 'express';
import { registerUser } from '../controllers/user.controller.js';

const router = express.Router();

router.route('/register').post(registerUser);

export default router;
```

### Key Insight:

`router.route()` lets you chain multiple methods on the same path

```javascript
router.route('/users')
  .post(createUser)    // Create
  .get(getUsers)       // Read
  .patch(updateUser)   // Update
  .delete(deleteUser);  // Delete
```

---

## 5-) registerUser Controller

**Controller = does the actual work**

Fetch / Save / Delete data, then send response back to client

### Step 1: Extract fields from req.body

```javascript
const { username, email, password } = req.body
```

### Step 2: Validate — check nothing is empty

```javascript
if (!username || !email || !password) → return 400
```

### Step 3: Check if user already exists in MongoDB

```javascript
User.findOne({ email: email.toLowerCase() })
```

### Step 4: Create user in MongoDB

```javascript
User.create({ username, email, password, loggedIn: false })
```

### Step 5: Send success response

```javascript
res.status(201).json({ message: 'user registered', user })
```

### Catch Block:

```javascript
catch block → res.status(500).json({ error: error.message })
```

---

## 6-) Postman API Testing

**Postman = test your API without building a frontend**

### Setup Steps:

1. Create workspace → `'intro to backend'`
2. Create collection → `'Auth'`
3. Add request → `'register'`

### Register Request Configuration:

- **Method:** POST
- **URL:** `http://localhost:5000/api/v1/users/register`
- **Body** → raw → JSON

```json
{
  "username": "hassan",
  "email": "hassan@gmail.com",
  "password": "123456"
}
```

### Expected Response → 201 Created ✅

```json
{
  "message": "user registered",
  "user": {
    "id": "...",
    "email": "...",
    "username": "..."
  }
}
```

---

## 7-) MongoDB — How Data is Stored

Each user is stored as a document in the users collection

### Document Fields:

```javascript
{
  _id: "64abc123...",              // Auto-generated ObjectId — always unique
  username: "hassan",              // Stored as-is from request
  email: "hassan@gmail.com",       // Normalized to lowercase
  password: "123456",              // ⚠️ Should be hashed with bcrypt!
  loggedIn: false,                 // Default state on registration
  createdAt: "2026-02-18T...",    // Auto timestamp from schema
  __v: 0                          // Mongoose version key
}
```

⚠️ **Always hash passwords with bcrypt before storing** — never plain text!

---

## 8-) loginUser Controller (In Progress)

**Login needs only email + password**

No new model needed — reuse the same User model

### ✅ Done — Step 1:
Extract email + password from req.body

### ✅ Done — Step 2:
`email.toLowerCase()` — case-insensitive matching

### ✅ Done — Step 3:
`User.findOne({ email })` — check user exists

### ✅ Done — Step 4:
If not found → return 400 `'User not found'`

### 🔧 TODO — Step 5:
`bcrypt.compare(password, user.password)`

### 🔧 TODO — Step 6:
Generate session / token

### 🔧 TODO — Step 7:
Return success response to client

### Key Insight:

`email.toLowerCase()` ensures `'Hassan@gmail.com'` and `'hassan@gmail.com'` match the same account
