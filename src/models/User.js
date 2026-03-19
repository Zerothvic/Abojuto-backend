import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["Receptionist", "Nurse", "Doctor", "Accountant"],
      required: true
    },
    phone: {
      type: String,
      trim: true
    },
    specialization: {
      type: String,
      trim: true, // e.g. "Cardiology", "General Practice"
    },
    isActive: {
      type: Boolean,
      default: true
    },
  },
  { timestamps: true }
);

/**
 * Pre-save middleware to hash password
 */
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Method to compare entered password with hashed password in DB
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
