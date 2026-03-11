import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import User from "../models/User.js";


export const bookAppointment = async (data, userId) => {
  // Check if patient exists
  const patient = await Patient.findById(data.patient);
  if (!patient) {
    const error = new Error("Patient not found");
    error.status = 404;
    throw error;
  }

  // Check if doctor exists and has doctor role
  const doctor = await User.findById(data.doctor);
  if (!doctor || doctor.role !== "doctor") {
    const error = new Error("Doctor not found");
    error.status = 404;
    throw error;
  }

  // Check if doctor already has appointment at same date and timeSlot
  const conflict = await Appointment.findOne({
    doctor: data.doctor,
    date: data.date,
    timeSlot: data.timeSlot,
    status: { $nin: ["cancelled"] },
  });
  if (conflict) {
    const error = new Error("Doctor already has an appointment at this time");
    error.status = 400;
    throw error;
  }

  const appointment = new Appointment({ ...data, bookedBy: userId });
  await appointment.save();
  return appointment.populate([
    { path: "patient", select: "fullName phone patientId" },
    { path: "doctor", select: "name specialization" },
    { path: "bookedBy", select: "name role" },
  ]);
};


export const getAllAppointments = async () => {
  const appointments = await Appointment.find()
    .populate("patient", "fullName phone patientId")
    .populate("doctor", "name specialization")
    .populate("bookedBy", "name role")
    .sort({ date: 1, timeSlot: 1 });
  return appointments;
};


export const getAppointmentById = async (id) => {
  const appointment = await Appointment.findById(id)
    .populate("patient", "fullName phone patientId")
    .populate("doctor", "name specialization")
    .populate("bookedBy", "name role");
  if (!appointment) {
    const error = new Error("Appointment not found");
    error.status = 404;
    throw error;
  }
  return appointment;
};

export const getTodayAppointments = async () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const appointments = await Appointment.find({
    date: { $gte: start, $lte: end },
  })
    .populate("patient", "fullName phone patientId")
    .populate("doctor", "name specialization")
    .sort({ timeSlot: 1 });
  return appointments;
};


export const getDoctorTodayAppointments = async (doctorId) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const appointments = await Appointment.find({
    doctor: doctorId,
    date: { $gte: start, $lte: end },
  })
    .populate("patient", "fullName phone patientId")
    .sort({ timeSlot: 1 });
  return appointments;
};


export const updateAppointmentStatus = async (id, status, cancellationReason) => {
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    const error = new Error("Appointment not found");
    error.status = 404;
    throw error;
  }

  // Require cancellation reason if cancelling
  if (status === "cancelled" && !cancellationReason) {
    const error = new Error("Cancellation reason is required");
    error.status = 400;
    throw error;
  }

  appointment.status = status;
  if (cancellationReason) {
    appointment.cancellationReason = cancellationReason;
  }

  await appointment.save();
  return appointment;
};


export const updateAppointment = async (id, data) => {
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    const error = new Error("Appointment not found");
    error.status = 404;
    throw error;
  }

  // Prevent bookedBy from being updated
  delete data.bookedBy;

  // Check for time conflict if date or timeSlot is being changed
  if (data.date || data.timeSlot) {
    const conflict = await Appointment.findOne({
      _id: { $ne: id }, // exclude current appointment
      doctor: data.doctor || appointment.doctor,
      date: data.date || appointment.date,
      timeSlot: data.timeSlot || appointment.timeSlot,
      status: { $nin: ["cancelled"] },
    });
    if (conflict) {
      const error = new Error("Doctor already has an appointment at this time");
      error.status = 400;
      throw error;
    }
  }

  Object.assign(appointment, data);
  await appointment.save();
  return appointment;
};