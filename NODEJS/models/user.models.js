import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,        // Removes whitespace
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
    // Can add match: /regex/ for email validation
  }
}, {
  timestamps: true  // Automatically adds createdAt & updatedAt
});

export const User = mongoose.model("User", userSchema);