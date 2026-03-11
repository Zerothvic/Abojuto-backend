import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          const today = new Date();
          today.setHours(0,0,0,0);
          return value >= today;
        },
        message: "Appointment date cannot be in the past",
      },
    },
    timeSlot: {
      type: String,
      required: true,
      trim: true, // Example: 09:00 
    },
    duration: {
      type: Number,
      default: 30, // in minutes
    },
    reason: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "no-show"],
      default: "scheduled",
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["normal", "urgent", "emergency"],
      default: "normal",
    },
    type: {
      type: String,
      enum: ["new", "follow-up"],
      default: "new",
    },
    followUpDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;