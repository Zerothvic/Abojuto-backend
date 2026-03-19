import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();

const seedUsers = [
  {
    name: "Ada Receptionist",
    email: "receptionist@health.com",
    password: "password123",
    role: "Receptionist",
    phone: "08012345678",
    isActive: true,
  },
  {
    name: "Dr. Emeka",
    email: "doctor@health.com",
    password: "password123",
    role: "Doctor",
    phone: "08023456789",
    specialization: "General Practice",
    isActive: true,
  },
  {
    name: "Nurse Ngozi",
    email: "nurse@health.com",
    password: "password123",
    role: "Nurse",
    phone: "08034567890",
    isActive: true,
  },
  {
    name: "Chidi Accountant",
    email: "accountant@health.com",
    password: "password123",
    role: "Accountant",
    phone: "08045678901",
    isActive: true,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    // Clear existing users
    await User.deleteMany({});
    console.log("Existing users cleared");

    // Hash passwords and create users
    for (const userData of seedUsers) {
      const hashed = await bcrypt.hash(userData.password, 10);
      await User.create({ ...userData, password: hashed });
    }

    console.log("✅ Users seeded successfully");
    console.log("Receptionist: receptionist@health.com / password123");
    console.log("Doctor:       doctor@health.com / password123");
    console.log("Nurse:        nurse@health.com / password123");
    console.log("Accountant:   accountant@health.com / password123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seed();