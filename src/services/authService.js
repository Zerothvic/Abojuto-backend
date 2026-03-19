import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";


export const registerUser = async (userData) => {
  const { name, email, password, role, phone } = userData;

  // 1. Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("A user with this email already exists.");
  }

  // 2. Create the user 
  // (Password hashing is handled by the pre-save hook in the User Model)
  const newUser = await User.create({
    name,
    email,
    password,
    role,
    phone
  });

  // 3. Return user object without the password
  const userResponse = newUser.toObject();
  delete userResponse.password;
  
  return userResponse;
};

/**
 * Fetches all staff users, optionally filtered by role
 */
export const getAllUsers = async (filter = {}) => {
  return await User.find(filter).select("-password");
};

/**
 * Finds a specific user by ID
 */
export const getUserById = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new Error("User not found.");
  }
  return user;
};

export const loginUser = async (email, password) => {
  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  // Check if account is active
  if (!user.isActive) {
    const error = new Error("Account deactivated. Contact admin.");
    error.status = 403;
    throw error;
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  // Generate JWT
  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET_TOKEN,
    { expiresIn: "8h" }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
    },
  };
};

export const logoutUser = () => {
  return { success: true, message: "Logged out successfully" };
};