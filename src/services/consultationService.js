import Consultation from "../models/Consultation.js";
import Appointment from "../models/Appointment.js";

/*
====================================
 Create Consultation Service
====================================
*/
export const createConsultation = async (data, doctorId) => {
  // Check if appointment exists
  const appointment = await Appointment.findById(data.appointment);
  if (!appointment) {
    const error = new Error("Appointment not found");
    error.status = 404;
    throw error;
  }

  // Check if appointment belongs to this doctor
  if (appointment.doctor.toString() !== doctorId.toString()) {
    const error = new Error("You are not assigned to this appointment");
    error.status = 403;
    throw error;
  }

  // Check if appointment is scheduled
  if (appointment.status !== "scheduled") {
    const error = new Error("Appointment is not scheduled");
    error.status = 400;
    throw error;
  }

  // Check if consultation already exists for this appointment
  const existing = await Consultation.findOne({ appointment: data.appointment });
  if (existing) {
    const error = new Error("Consultation already exists for this appointment");
    error.status = 400;
    throw error;
  }

  // Create consultation
  const consultation = new Consultation({
    ...data,
    doctor: doctorId,
    patient: appointment.patient,
    attendedBy: doctorId,
  });
  await consultation.save();

  // Update appointment status to completed
  appointment.status = "completed";
  await appointment.save();

  return consultation.populate([
    { path: "patient", select: "fullName phone patientId" },
    { path: "doctor", select: "name specialization" },
    { path: "appointment", select: "date timeSlot type priority" },
  ]);
};

/*
====================================
 Get All Consultations Service
====================================
*/
export const getAllConsultations = async () => {
  const consultations = await Consultation.find()
    .populate("patient", "fullName phone patientId")
    .populate("doctor", "name specialization")
    .populate("appointment", "date timeSlot type priority")
    .sort({ createdAt: -1 });
  return consultations;
};

/*
====================================
 Get Single Consultation Service
====================================
*/
export const getConsultationById = async (id) => {
  const consultation = await Consultation.findById(id)
    .populate("patient", "fullName phone patientId bloodGroup allergies")
    .populate("doctor", "name specialization")
    .populate("appointment", "date timeSlot type priority reason");
  if (!consultation) {
    const error = new Error("Consultation not found");
    error.status = 404;
    throw error;
  }
  return consultation;
};

/*
====================================
 Get Consultations By Patient Service
====================================
*/
export const getConsultationsByPatient = async (patientId) => {
  const consultations = await Consultation.find({ patient: patientId })
    .populate("doctor", "name specialization")
    .populate("appointment", "date timeSlot type priority")
    .sort({ createdAt: -1 });
  return consultations;
};

/*
====================================
 Get Consultations By Doctor Service
====================================
*/
export const getConsultationsByDoctor = async (doctorId) => {
  const consultations = await Consultation.find({ doctor: doctorId })
    .populate("patient", "fullName phone patientId")
    .populate("appointment", "date timeSlot type priority")
    .sort({ createdAt: -1 });
  return consultations;
};

/*
====================================
 Update Consultation Service
====================================
*/
export const updateConsultation = async (id, data, doctorId) => {
  const consultation = await Consultation.findById(id);
  if (!consultation) {
    const error = new Error("Consultation not found");
    error.status = 404;
    throw error;
  }

  // Only the doctor who created it can update it
  if (consultation.doctor.toString() !== doctorId.toString()) {
    const error = new Error("You are not authorized to update this consultation");
    error.status = 403;
    throw error;
  }

  // Prevent critical fields from being updated
  delete data.patient;
  delete data.doctor;
  delete data.appointment;
  delete data.attendedBy;

  Object.assign(consultation, data);
  await consultation.save();
  return consultation;
};

/*
====================================
 Update Vital Signs Service
====================================
*/
export const updateVitalSigns = async (id, vitals) => {
  const consultation = await Consultation.findById(id);
  if (!consultation) {
    const error = new Error("Consultation not found");
    error.status = 404;
    throw error;
  }

  // Validate vital signs — no negative values
  const vitalFields = [
    "bloodPressureSystolic",
    "bloodPressureDiastolic",
    "temperature",
    "pulse",
    "weight",
    "height",
  ];

  vitalFields.forEach((field) => {
    if (vitals[field] !== undefined && vitals[field] < 0) {
      const error = new Error(`${field} cannot be negative`);
      error.status = 400;
      throw error;
    }
  });

  consultation.vitalSigns = {
    ...consultation.vitalSigns,
    ...vitals,
  };

  await consultation.save();
  return consultation;
};