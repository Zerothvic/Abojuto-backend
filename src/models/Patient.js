import mongoose from "mongoose";
import generatePatientId from "../utils/generatePatientId.js";

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      unique: true,
      trim: true, // Example: CHC-0001
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    maritalStatus: {
      type: String,
      enum: ["single", "married", "divorced", "widowed"],
    },
    occupation: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    nationalId: {
      type: String,
      trim: true,
    },
    insuranceNumber: {
      type: String,
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    allergies: {
      type: String,
      trim: true,
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      relationship: {
        type: String,
        trim: true,
      },
    },
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-generate patientId using utility function
patientSchema.pre("save", async function (next) {
  if (!this.patientId) {
    this.patientId = await generatePatientId();
  }
  next();
});

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;