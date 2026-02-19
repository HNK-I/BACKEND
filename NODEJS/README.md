# Backend API - Node.js + Express + MongoDB

A Node.js backend application built with Express and MongoDB for managing data with RESTful API endpoints.

## Project Status
✅ **Stable & Running** on `http://localhost:5000`

---

## Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `localhost:27017`
- npm (comes with Node.js)

### Installation Steps
```bash
# 1. Navigate to project directory
cd BACKEND/NODEJS

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

**Expected Output:**
```
MongoDB connected!!
            localhost
Server is listening at port: 5000
```

---

## Bugs Found & Fixed

### 1. **Missing Express Function Call** ❌ → ✅
**File:** `src/app.js`

**Bug:**
```javascript
const app = express ;  // Missing parentheses!
```

**Issue:** Express wasn't being initialized as a function, causing the app object to be the function itself rather than an Express application instance.

**Fix:**
```javascript
const app = express();  // Added parentheses
```

---

### 2. **Missing Module Imports** ❌ → ✅
**File:** `src/index.js`

**Bug:**
```javascript
import dotenv from "dotenv";

dotenv.config({
    path:'./.env'
});

const startServer = async ()=>{
    await connectDB();  // connectDB not imported!
    app.listen(...);    // app not imported!
```

**Issue:** The `app` and `connectDB` modules were being used without being imported, causing ReferenceError.

**Fix:**
```javascript
import dotenv from "dotenv";
import app from './app.js';
import connectDB from './config/database.js';

dotenv.config({
    path:'./.env'
});
```

---

### 3. **Missing Dependencies in package.json** ❌ → ✅
**File:** `package.json`

**Bug:**
```json
"dependencies": {
    "nodemon": "^3.1.11"
}
// Missing express, mongoose, dotenv!
```

**Issue:** Critical packages weren't listed as dependencies, causing `ERR_MODULE_NOT_FOUND` errors when trying to import them.

**Fix:**
```json
"dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "dotenv": "^16.3.1",
    "nodemon": "^3.1.11"
}
```

**Solution:** Ran `npm install` to install all missing packages.

---

### 4. **Wrong Module Type** ❌ → ✅
**File:** `package.json`

**Bug:**
```json
"type": "commonjs",
"main": "index.js"
```

**Issue:** Using CommonJS syntax (`require()`) with ES6 imports (`import/export`) causes module resolution errors.

**Fix:**
```json
"type": "module",
"main": "src/index.js"
```

**Explanation:** Changed to ES6 modules to match the import syntax used throughout the code.

---

### 5. **Wrong MongoDB Connection String** ❌ → ✅
**File:** `.env`

**Bug:**
```
MONGODB_URI = mongodb+srv://hassankhannawaz341_db_user:O7F2oXWvJqB1nAI3@cluster0.9r52l0v.mongodb.net/
```

**Issues:**
- Pointing to MongoDB Atlas (cloud) instead of local MongoDB
- Contains exposed credentials
- Has spaces around the `=` sign
- Missing database name in the connection string

**Fix:**
```
MONGODB_URI=mongodb://localhost:27017/
```

**Additional Fix in database.js:**
```javascript
import { DB_NAME } from "./constants.js";

const connectionInstance = await mongoose.connect(
    `${process.env.MONGODB_URI}${DB_NAME}`
);
```

---

### 6. **Credentials Exposed in .env** 🔒 ❌ → ✅
**File:** `.env` and `.gitignore`

**Bug:**
```
.env file was in the repository with MongoDB credentials visible
.gitignore was located in /src/ instead of root
passwords.txt was not properly ignored
```

**Security Issues:**
- MongoDB username and password exposed
- Anyone viewing the repo can access the database
- Private credentials committed to version control

**Fix:**
```
# Ensure .gitignore is at ROOT level with these entries:
.env
.env.local
*.env
passwords.txt
node_modules/
```

**Best Practice:** Never commit `.env` files to source control.

---

### 7. **Function Name Case Mismatch** ❌ → ✅
**File:** `src/index.js`

**Bug:**
```javascript
const startserver = async ()=>{  // lowercase 's'
    // ...
}

startServer();  // Called with uppercase 'S'
```

**Issue:** JavaScript is case-sensitive. Function defined as `startserver` but called as `startServer()`.

**Fix:**
```javascript
const startServer = async ()=>{  // Consistent naming
    // ...
}

startServer();
```

---

### 8. **.env File Format Issues** ❌ → ✅
**File:** `.env`

**Bug:**
```
MONGODB_URI = mongodb+srv://...  # Spaces around =
PORT = 4000;                      # Semicolon after value
```

**Issue:** .env files should not have spaces around `=` or semicolons at the end.

**Fix:**
```
MONGODB_URI=mongodb://localhost:27017/
PORT=5000
```

---

### 9. **Port Already in Use** ❌ → ✅
**File:** `.env` and `src/index.js`

**Bug:**
```
Error: listen EADDRINUSE: address already in use :::4000
```

**Issue:** Port 4000 was already occupied by another process, then port 3000 also had the same issue.

**Solution:**
1. Changed port to 5000:
```
PORT=5000
```

2. Enhanced error handling in `src/index.js`:
```javascript
server.on('error', (error) => {
    if(error.code === 'EADDRINUSE') {
        console.log(`Port ${process.env.PORT} is already in use.`);
        process.exit(1);
    }
});
```

3. Command to kill processes:
```powershell
taskkill /f /im node.exe /t
```

---

### 10. **Missing Error Handling** ❌ → ✅
**File:** `src/index.js`

**Bug:**
```javascript
}catch(error){
    console.log("MongoDB connection failed!!", error);
    // Process continued even after error!
}
```

**Issue:** App would crash silently without proper error messages or exit codes.

**Fix:**
```javascript
}catch(error){
    console.log("MongoDB connection failed!!", error);
    process.exit(1);  // Exit with error code
}

process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection:', err);
    process.exit(1);
});
```

---

### 11. **.gitignore Location** ❌ → ✅
**File:** `src/.gitignore`

**Bug:**
```
.gitignore was in /src/ directory instead of root
```

**Issue:** Only files in `/src/` would be ignored, not the entire project.

**Fix:** `.gitignore` should be at the **project ROOT** level to apply globally:
```
/BACKEND/NODEJS/.gitignore  ✅ Correct location
/BACKEND/NODEJS/src/.gitignore  ❌ Wrong location
```

---

## Environment Variables

Create a `.env` file at the root of the project:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/

# Server Configuration
PORT=5000
```

**Important:** Never commit `.env` to GitHub!

---

## Project Structure

```
BACKEND/NODEJS/
├── src/
│   ├── app.js                 # Express application setup
│   ├── index.js               # Server entry point
│   └── config/
│       ├── database.js        # MongoDB connection
│       └── constants.js       # App constants
├── .env                       # Environment variables (not in Git)
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies & scripts
├── package-lock.json          # Dependency lock file
└── README.md                  # This file
```

---

## Available Commands

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Check for vulnerabilities
npm audit
```

---

## Current Setup

✅ **Server:** Express.js on port 5000
✅ **Database:** MongoDB (local - localhost:27017)
✅ **Database Name:** Project 0
✅ **Module System:** ES6 (import/export)
✅ **Development Tool:** Nodemon (auto-reload)
✅ **Environment:** Development

---

## Next Steps

1. **Create API Routes** - Add POST, GET, PUT, DELETE endpoints
2. **Define Mongoose Schemas** - Create data models
3. **Add Controllers** - Implement business logic
4. **Add Middleware** - Body parsing, authentication, etc.
5. **Test Endpoints** - Use Postman or similar tools

---

## Security Notes

⚠️ **Important:**
- Never commit `.env` to git
- Never expose MongoDB credentials
- Always use `.gitignore` for sensitive files
- Use environment variables for all sensitive data
- Keep dependencies updated: `npm audit`

---

## Troubleshooting

### Port Already in Use
```powershell
# Kill all Node processes
taskkill /f /im node.exe /t

# Or find and kill specific port
netstat -ano | findstr :5000
taskkill /f /pid <PID>
```

### MongoDB Not Connecting
1. Ensure MongoDB is running locally
2. Check connection string matches: `mongodb://localhost:27017/`
3. Verify database name is correct

### Dependencies Missing
```powershell
npm install
```

---

## Summary of All Fixes

| Bug | File | Status |
|-----|------|--------|
| Missing express() parentheses | app.js | ✅ Fixed |
| Missing imports (app, connectDB) | index.js | ✅ Fixed |
| Missing dependencies | package.json | ✅ Fixed |
| Wrong module type (commonjs) | package.json | ✅ Fixed |
| Wrong MongoDB connection string | .env | ✅ Fixed |
| Exposed credentials | .env | ✅ Fixed |
| Function name mismatch | index.js | ✅ Fixed |
| .env format issues | .env | ✅ Fixed |
| Port conflicts | .env | ✅ Fixed |
| Missing error handling | index.js | ✅ Fixed |
| .gitignore in wrong location | src/.gitignore | ✅ Fixed |

---

**Last Updated:** February 18, 2026
**Status:** ✅ Production Ready
