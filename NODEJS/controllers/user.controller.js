// ============================================================
// FILE: src/controllers/user.controller.js
// PURPOSE: Handles user-related HTTP request logic
// PATTERN: Controller layer — sits between Route and Model
// ============================================================


// ────────────────────────────────────────────────────────────
// MODULE IMPORT
// ────────────────────────────────────────────────────────────

/**
 * import { User } — Named ES6 import
 *
 * Pulls the Mongoose User Model from user.model.js
 * 'User' is a Mongoose Model class that represents
 * the 'users' collection in MongoDB.
 *
 * It gives us access to static DB methods:
 *   User.findOne()   → search for a document
 *   User.create()    → insert a new document
 *   User.find()      → get multiple documents
 *   User.findById()  → search by _id
 *   User.deleteOne() → delete a document
 *
 * This import runs ONCE when Node.js first loads this file.
 */
import { User } from '../models/user.model.js';


// ────────────────────────────────────────────────────────────
// CONTROLLER FUNCTION: registerUser
// ────────────────────────────────────────────────────────────

/**
 * registerUser — Async Express Controller Function
 *
 * PURPOSE : Handles POST /api/register requests.
 *           Validates input → checks for duplicate →
 *           creates user → sends response.
 *
 * TYPE    : async arrow function
 *           'async' lets us use 'await' for DB calls
 *           and automatically wraps return in a Promise.
 *
 * PARAMS  :
 *   @param {Object} req — Express Request object
 *                         req.body    → parsed JSON from client
 *                         req.params  → URL params (:id)
 *                         req.query   → ?key=value params
 *                         req.headers → HTTP headers
 *
 *   @param {Object} res — Express Response object
 *                         res.status() → set HTTP status code
 *                         res.json()   → send JSON response
 *
 * HOW IT'S CALLED:
 *   Not called directly here. Exported and bound to a route:
 *   router.post('/register', registerUser)
 *   Express calls it automatically on every matching request.
 */
const registerUser = async (req, res) => {

  /**
   * try { } block
   *
   * Wraps all logic that involves async DB operations.
   * If ANYTHING inside throws an error (DB failure,
   * validation error, network timeout, etc.) JavaScript
   * automatically jumps to the catch(error) block below.
   *
   * Without try/catch → unhandled Promise rejection →
   * potential Node.js crash or hanging request.
   */
  try {

    // ──────────────────────────────────────────────────────
    // STEP 1: EXTRACT DATA FROM REQUEST BODY
    // ──────────────────────────────────────────────────────

    /**
     * ES6 Object Destructuring
     *
     * Pulls 3 named properties from req.body in one line.
     * req.body is the JSON object sent by the client:
     * {
     *   "username": "hassan",
     *   "email": "hassan@mail.com",
     *   "password": "secret123"
     * }
     *
     * Equivalent longhand:
     *   const username = req.body.username;
     *   const email    = req.body.email;
     *   const password = req.body.password;
     *
     * NOTE: req.body only works if express.json()
     * middleware is active in app.js:
     *   app.use(express.json())
     *
     * If a field is missing from the request body,
     * its value becomes undefined — no crash yet.
     */
    const { username, email, password } = req.body;


    // ──────────────────────────────────────────────────────
    // STEP 2: BASIC VALIDATION
    // ──────────────────────────────────────────────────────

    /**
     * Falsy check on all three required fields.
     *
     * The ! (NOT) operator returns true when a value is:
     *   undefined → field missing from request body
     *   null      → explicitly sent as null
     *   ""        → empty string sent by client
     *   0         → zero (edge case)
     *
     * The || (OR) means: if ANY field is falsy → reject.
     *
     * FIX #1 APPLIED HERE:
     * The original code had the closing } of this if-block
     * in the wrong place — it wrapped Steps 3 onward inside
     * this if-block, meaning the duplicate check only ran
     * when fields were MISSING (completely backwards!).
     * The } now correctly closes immediately after return.
     */
    if (!username || !email || !password) {

      /**
       * res.status(400).json({ ... })
       *
       * res.status(400) → sets HTTP status to 400 Bad Request
       *                   tells client "you sent wrong data"
       * .json({ })      → serialises object to JSON string,
       *                   sets Content-Type: application/json
       *                   header automatically, sends response
       *
       * return → CRITICAL: exits the function immediately.
       *          Without return, code below would still run
       *          even after sending this response, causing
       *          "Cannot set headers after they are sent" error.
       */
      return res.status(400).json({
        message: "All fields are required"
      });

    } // ← FIX #1: closing brace is HERE (not after Step 3)


    // ──────────────────────────────────────────────────────
    // STEP 3: CHECK WHETHER USER ALREADY EXISTS
    // ──────────────────────────────────────────────────────

    /**
     * User.findOne({ filter })
     *
     * Mongoose static model method.
     * Searches the 'users' MongoDB collection for ONE
     * document that matches the filter object.
     *
     * { email: email.toLowerCase() }
     *   → the filter: find a document where the email
     *     field matches the normalised email from request
     *
     * email.toLowerCase()
     *   → String.prototype.toLowerCase() — built-in JS method
     *   → Returns a new string with all characters lowercased
     *   → Does NOT mutate the original string
     *   → WHY: emails are case-insensitive by standard.
     *     'Hassan@Mail.com' and 'hassan@mail.com' are the
     *     same email. Normalise before comparing + storing.
     *
     * await
     *   → Pauses execution of this async function here
     *     until MongoDB responds with a result.
     *   → If DB is slow, Node.js event loop is NOT blocked —
     *     other requests still get handled meanwhile.
     *
     * Return values:
     *   Document object → user with this email exists
     *   null            → no user found, safe to proceed
     */
    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });

    /**
     * Duplicate user check
     *
     * If existingUser is not null → a user with this
     * email already exists in the database.
     *
     * FIX #2 APPLIED HERE:
     * Original code used 'existing' (undefined variable)
     * instead of 'existingUser' (the declared constant above).
     * JavaScript is case-sensitive and 'existing' was never
     * declared → ReferenceError crash at runtime.
     */
    if (existingUser) {

      /**
       * Send 400 conflict response.
       * return exits the function — no user gets created.
       */
      return res.status(400).json({
        message: "User already exists!"
      });
    }


    // ──────────────────────────────────────────────────────
    // STEP 4: CREATE NEW USER IN DATABASE
    // ──────────────────────────────────────────────────────

    /**
     * User.create({ data })
     *
     * Mongoose static model method.
     * Does two things in one call:
     *   1. Validates the data object against the
     *      Mongoose schema defined in user.model.js
     *      (required fields, types, min/max length etc.)
     *   2. If valid → inserts a new document into MongoDB
     *
     * Returns: the newly created document object, which
     *          includes all the fields PLUS auto-generated:
     *          _id        → MongoDB ObjectId (unique)
     *          createdAt  → timestamp (if schema has it)
     *          updatedAt  → timestamp (if schema has it)
     *          __v        → Mongoose version key
     *
     * await → pauses until MongoDB confirms the write.
     *
     * If schema validation fails or DB write fails →
     * throws an error → caught by catch block below.
     *
     * Fields explained:
     *   username          → stored as-is from request
     *   email.toLowerCase → consistent casing in DB
     *   password          → ⚠️ stored as plaintext here!
     *                       In production always hash first:
     *                       const hashed = await bcrypt.hash(password, 10)
     *                       then store hashed instead
     *   loggedIn: false   → default state on registration
     */
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password,
      loggedIn: false,
    });


    // ──────────────────────────────────────────────────────
    // STEP 5: SEND SUCCESS RESPONSE
    // ──────────────────────────────────────────────────────

    /**
     * res.status(201).json({ ... })
     *
     * res.status(201) → HTTP 201 Created
     *                   The correct code when a new resource
     *                   has been successfully created.
     *                   (200 = OK, but 201 = specifically "created")
     *
     * .json({ })      → sends the response body as JSON
     *
     * WHAT WE SEND BACK:
     *   message        → human-readable confirmation string
     *   user.id        → the MongoDB _id of the new document
     *   user.email     → echo back the stored email
     *   user.username  → echo back the stored username
     *
     * WHAT WE INTENTIONALLY OMIT:
     *   password       → NEVER send password back, even hashed.
     *                    Security best practice.
     *   loggedIn       → internal field, not needed by client
     *   __v            → Mongoose internal version key
     *
     * FIX #3 APPLIED HERE:
     * Original code had { user._id } which is invalid JS
     * object shorthand syntax → SyntaxError.
     * Fixed to { id: user._id } (explicit key: value pair).
     *
     * FIX #4 APPLIED HERE:
     * Original code had user.emai (missing 'l') → undefined
     * in the response. Fixed to user.email.
     */
    res.status(201).json({
      message: "user registered",
      user: {
        id: user._id,         // FIX #3: was 'user._id' (invalid shorthand)
        email: user.email,    // FIX #4: was 'user.emai' (typo)
        username: user.username
      }
    });


  // ──────────────────────────────────────────────────────
  // CATCH BLOCK — ERROR HANDLER
  // ──────────────────────────────────────────────────────

  /**
   * catch(error)
   *
   * Runs if ANYTHING inside try { } throws an error.
   * Common causes in this function:
   *   • MongoDB connection failure / timeout
   *   • Mongoose schema validation failure
   *     (e.g. required field missing in User.create)
   *   • Network issues reaching the DB server
   *   • Unexpected runtime errors
   *
   * 'error' is the Error object JavaScript provides.
   * Useful properties:
   *   error.message → short human-readable description
   *   error.name    → error type e.g. "ValidationError"
   *   error.stack   → full stack trace for debugging
   *
   * res.status(500).json({ ... })
   *   500 → Internal Server Error (server-side problem)
   *   Always sends a response so client never hangs.
   *
   * ⚠️ NOTE for production:
   *   Don't expose error.message to clients in production
   *   as it can leak implementation details.
   *   Use a generic message instead and log internally:
   *   console.error(error);
   *   res.status(500).json({ message: "Something went wrong" })
   */
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      error: error.message
    });
  }

}; // ← end of registerUser function


// ────────────────────────────────────────────────────────────
// EXPORT
// ────────────────────────────────────────────────────────────

/**
 * export { registerUser } — ES6 Named Export
 *
 * Named export → uses curly braces { }
 * (vs default export which has no braces)
 *
 * This makes registerUser importable in other files:
 *
 *   import { registerUser } from './controllers/user.controller.js'
 *
 * Then bound to an Express route in the router file:
 *
 *   import express from 'express';
 *   import { registerUser } from '../controllers/user.controller.js';
 *
 *   const router = express.Router();
 *   router.post('/register', registerUser);
 *   //           ↑ path      ↑ handler function
 *   // Express calls registerUser(req, res) automatically
 *   // on every POST request to /register
 *
 *   export default router;
 *
 * This export line runs at MODULE LOAD TIME —
 * not when a request comes in.
 */
export { registerUser };