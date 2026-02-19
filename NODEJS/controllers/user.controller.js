import { User } from '../models/user.model.js';

const registerUser = async (req, res) => {
  try {
    // Step 1: Extract data from request body
    const { username, email, password } = req.body;

    // Step 2: Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });

    // step 3 : check whether the user already exists!!
    const existingUser = await.User
    }

    // Additional registration logic here...

  } catch (error) {
    console.log("Error:", error);
  }
};

export { registerUser };