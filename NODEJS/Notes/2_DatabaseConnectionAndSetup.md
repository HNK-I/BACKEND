# Backend Development - Database Connection and Server Setup

---

## Section 1: Database Connection Setup

### File Location: `src/config/database.js`

```javascript
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`);
    console.log(`MongoDB connected! Host: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default connectDB;
```

### Key Points:
- **try-catch for error handling** — Never let the database crash silently
- **process.exit(1)** = shut down cleanly if DB fails to connect
- **conn.connection.host** shows the MongoDB cluster address in console

---

## Section 2: Server Entry Point — index.js

**index.js = the file that STARTS your backend server**

```javascript
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import app from './app.js';

dotenv.config({ path: './.env' });

const startServer = async () => {
  await connectDB();
  app.listen(process.env.PORT || 8000, () => console.log('Server running'));
};

startServer();
```

### Understanding Ports

Like USB ports on a laptop — your server 'listens' on one specific port for incoming requests

- **Defined in .env** — e.g. `PORT=4000`
- **Fallback: || 8000** — in case env port fails

### Success Output:
```
MongoDB connected! DB Host: cluster.mongodb.net
Server running on port 4000
```

---

## Section 3: Nodemon + Environment Variables

### What is Nodemon?

**Nodemon = auto-restart server on file save** — saves you from Ctrl+C every time

### package.json Scripts:

```json
"scripts": {
  "dev":   "nodemon src/index.js",
  "start": "node src/index.js"
}
```

- `"dev"` — development (with auto-restart)
- `"start"` — production (runs once)

### Install Commands:

```bash
npm i nodemon
npm i dotenv
npm i mongoose
```

### Environment Variables (.env)

⚠️ **.env MUST be in the ROOT directory** — not inside `src/` or any subfolder!

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
DB_NAME=mydatabase
PORT=4000
```

**dotenv purpose:** reads `.env` → makes vars accessible everywhere → keeps secrets out of your code

---

## Section 4: Project Structure

```
project-root/
├── src/
│   ├── config/database.js
│   ├── models/user.model.js
│   ├── routes/user.route.js
│   ├── controllers/user.controller.js
│   ├── app.js
│   └── index.js
├── .env   ← ROOT level!
├── package.json
└── node_modules/  ← ONE only
```

### File Roles:

| File | Purpose |
|------|---------|
| **index.js** | Entry point (starts server) |
| **database.js** | MongoDB connection |
| **models/** | Data structures |
| **routes/** | API paths |
| **controllers/** | Business logic |

💡 **Only ONE node_modules folder in root** — never inside `src/`

---

## Section 5: User Model & Mongoose Schema

**Model = code version of your data structure**  
**Schema = the blueprint for that structure**

```javascript
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minLength: 1,
    maxLength: 30
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
    maxLength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  }
}, { timestamps: true });  // auto-adds createdAt + updatedAt

export const User = mongoose.model('User', userSchema);
```

### Schema Properties Quick Reference:

| Property | Effect |
|----------|--------|
| **required: true** | Field cannot be empty |
| **unique: true** | No two documents can share this value |
| **lowercase: true** | Auto converts to lowercase before saving |
| **trim: true** | Removes whitespace (e.g., `'lily   '` → `'lily'`) |
| **timestamps: true** | Auto-creates `createdAt` + `updatedAt` on every document |

### ER Diagrams:

Show: (1) what data exists (2) how models relate to each other

**Models in this project:**
- **User** (auth)
- **Post** (content)

---

## Section 6: Routes & Controllers

### Routes = Address book for your API

- Handle paths
- Direct to controllers

### Controllers = Decision makers

- Handle logic
- Process data
- Send responses

**Analogy:** Routes = mail sorting facility  |  Controllers = mail processing + delivery

---

## Route File (user.route.js):

```javascript
import { Router } from 'express';
import { registerUser } from '../controllers/user.controller.js';

const router = Router();
router.post('/register', registerUser);

export default router;
```

**Real-world example:** ycombinator.com → click 'Library' → URL becomes `/library` (a route!)

---

## Section 7: registerUser Controller — Fixed Code

```javascript
import { User } from '../models/user.model.js';

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password)
      return res.status(400).json({ message: 'All fields required' });

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists!' });

    // Create user in MongoDB
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password,
      loggedIn: false
    });

    // Send success response
    res.status(201).json({
      message: 'user registered',
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'internal server error',
      error: error.message
    });
  }
};

export { registerUser };
```

### 🐛 Bugs Fixed from Original:

- `if(existing)` → should be `if(existingUser)` — variable name mismatch
- `{user._id}` → should be `id: user._id` (invalid shorthand inside object literal)
- `user.emai` → should be `user.email` (typo)
- Existing user check was INSIDE validation block — must be OUTSIDE
- Original didn't normalize email to lowercase

---

## Section 8: Troubleshooting + Best Practices

### Common Issues:

| Error | Solution |
|-------|----------|
| **'Cannot find module'** | Check import paths end with `.js` |
| **'app is not defined'** | Import app from `app.js` |
| **Connection string error** | Verify `.env` is in root directory |
| **Port conflicts** | Change `PORT` in `.env` |
| **Multiple node_modules folders** | Delete extras, keep only root version |

### ✅ Best Practices:

- ✅ Always use try-catch for error handling
- ✅ Use async/await to prevent task conflicts
- ✅ Validate input BEFORE database operations
- ✅ Use meaningful HTTP status codes (201 created, 400 bad, 500 error)
- ✅ Export constants so they can be reused across files

### 3 Core Auth Endpoints Being Built:

🔐 **Register** (POST /register)  
🔑 **Login** (POST /login)  
🚪 **Logout** (POST /logout)
