# Backend Development - Authentication & API Endpoints

---

## Section 1: Login API

### Goal:
Validate user credentials and return user data

---

### Step 1: Extract email + password from req.body

```javascript
const { email, password } = req.body
```

### Step 2: Find user in DB

```javascript
User.findOne({ email })
```

### Step 3: If user not found

```javascript
→ 400 { message: 'User not found' }
```

### Step 4: Compare passwords

```javascript
user.comparePassword(password) via bcrypt
```

### Step 5: If no match

```javascript
→ 400 { message: 'Invalid credentials' }
```

### Step 6: ✅ Match Found

```javascript
→ 200 { message: 'User logged in', id, email, username }
```

### Catch Block:

```javascript
→ 500 { message: 'Internal server error' }
```

### 📌 Production Note:

Real apps also generate **JWT access token + refresh token** to manage session duration (e.g. 15m, 1d)  
**NOT implemented in this tutorial** — for beginners only

---

## Section 2: Password Hashing with bcrypt

### Why Hash Passwords?

If your database leaks, plain-text passwords expose ALL user accounts

**Hashing makes passwords completely unreadable** — even to you

### Installation:

```bash
npm install bcrypt
```

### Pre-save Hook (user.model.js):

**Pre-save hook = runs logic automatically BEFORE a Mongoose document is saved to DB**

```javascript
userSchema.pre('save', async function (next) {
  // Skip if password unchanged
  if (!this.isModified('password')) return next();

  // Hash the password with 10 salt rounds
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
```

### Understanding Salt Rounds:

**Salt rounds (10)** = hashing complexity
- **Higher** = more secure but slower
- **10** = standard default

### Compare Passwords Method (used in login):

```javascript
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};
```

**bcrypt.compare** returns:
- `true` if match
- `false` if not match
- Used in **Step 4** of login controller

---

## Section 3: Logout API

### Goal:
Verify email and end the user's session

### Route:
```
POST /api/v1/users/logout
```

---

### Step 1: Extract email from req.body

```javascript
const { email } = req.body
```

### Step 2: Find user

```javascript
User.findOne({ email })
```

### Step 3: If not found

```javascript
→ 404 { message: 'User not found' }
```

### Step 4: ✅ Found

```javascript
→ 200 { message: 'Logout successful' }
```

### Catch Block:

```javascript
→ 500 { message: 'Internal server error' }
```

### Note:

Uses **404** (not found) here vs **400** (bad request) in login — different semantics!

---

## Section 4: Post Model + Create Post API

### post.model.js — Schema Fields:

```javascript
const postSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 1,
    max: 150
  }
}, { timestamps: true });  // auto-adds createdAt + updatedAt

export const Post = mongoose.model('Post', postSchema);
```

### Field Requirements:

| Field | Type | Rules |
|-------|------|-------|
| **name** | String | required, trimmed |
| **description** | String | required, trimmed |
| **age** | Number | required, min: 1, max: 150 |
| **timestamps** | - | auto-adds createdAt + updatedAt |

---

### Create Post API (post.controller.js):

#### Route:
```
POST /api/v1/posts/create
```

#### Steps:

1. Extract `name`, `description`, `age` from `req.body`
2. Missing field? → `400 { message: 'All fields are required' }`
3. `Post.create({ name, description, age })`
4. → `201 { message: 'Post created successfully' }`
5. catch → `500 { message: 'Internal server error' }`

---

## Section 5: File Structure + Postman Testing

### Project Structure:

```
/models
  ├── user.model.js    ← User schema + bcrypt hooks
  └── post.model.js    ← Post schema

/controllers
  ├── user.controller.js   ← register, login, logout
  └── post.controller.js   ← createPost + future CRUD

/routes
  ├── user.routes.js   ← /api/v1/users/*
  └── post.routes.js   ← /api/v1/posts/*
```

### Postman Testing Summary:

#### Login:
```
POST   /api/v1/users/login
Body:  { email, password }
```

#### Logout:
```
POST   /api/v1/users/logout
Body:  { email }
```

#### Create Post:
```
POST   /api/v1/posts/create
Body:  { name, description, age }
```

#### Headers for all requests:
```
Content-Type: application/json
```

---

## Section 6: Common Gotchas + Key Concepts

### ⚠️ Common Gotchas:

1. **Always SAVE your files before running** — unsaved files cause mysterious errors
2. **Export every new controller function** AND import it in the route file
3. **Register new routers in app.js** with `app.use()`
4. **Add the new route to the router file** AFTER creating the controller — easy to forget!

### 📌 Key Concepts:

#### bcrypt
**Library for hashing and comparing passwords**

#### Salt Rounds
**Hashing iterations** — higher = more secure but slower. **10 is standard**

#### Pre-save Hook
**Runs logic automatically BEFORE a document is saved to DB**

#### CRUD
**Create, Read, Update, Delete**

#### Status Code Reminder:
```
200 OK
201 Created
400 Bad Request
404 Not Found
500 Server Error
```

---

## Authentication Flow Summary

### Register:
1. User submits username, email, password
2. Server validates (not empty, unique email)
3. Password is hashed with bcrypt
4. User document created in MongoDB
5. Return 201 with user ID

### Login:
1. User submits email, password
2. Server finds user by email
3. bcrypt.compare() checks if password matches
4. If match → return 200 with user data
5. If not → return 400 'Invalid credentials'

### Logout:
1. User submits email
2. Server verifies user exists
3. Return 200 confirmation
4. Client removes local session/token

### Post Creation:
1. User submits name, description, age
2. Server validates all fields present
3. Post document created in MongoDB
4. Return 201 with post ID

---

## Next Steps for Full Auth System:

- 🔄 **JWT Tokens** — Secure session management
- 🛡️ **Middleware** — Protect routes (require login)
- 🔐 **Roles/Permissions** — Admin vs User
- 📧 **Email Verification** — Confirm email on register
- 🔄 **Password Reset** — Forgot password flow
