import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";


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
    process.env.JWT_SECRET,
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