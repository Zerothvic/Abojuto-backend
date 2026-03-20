import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import Invoice from "../models/Invoice.js";
import { getTodayRange } from "../utils/dateHelper.js";
import Consultation from "../models/Consultation.js"


  //  Receptionist Dashboard

export const getReceptionistDashboard = async () => {
  const { start, end } = getTodayRange();

  const [totalPatients, todayAppointments, todayNewPatients] = await Promise.all([
    Patient.countDocuments(),
    Appointment.find({ date: { $gte: start, $lte: end } })
      .populate("patient", "fullName phone patientId")
      .populate("doctor", "name specialization")
      .sort({ timeSlot: 1 }),
    Patient.countDocuments({ createdAt: { $gte: start, $lte: end } }),
  ]);

  return {
    totalPatients,
    todayNewPatients,
    todayAppointments: {
      count: todayAppointments.length,
      list: todayAppointments,
    },
  };
};


  //  Nurse Dashboard

export const getNurseDashboard = async () => {
  const { start, end } = getTodayRange();

  const [todayAppointments, totalPatients, todayConsultations] = await Promise.all([
    Appointment.find({ date: { $gte: start, $lte: end } })
      .populate("patient", "fullName phone patientId bloodGroup allergies")
      .populate("doctor", "name specialization")
      .sort({ timeSlot: 1 }),
    Patient.countDocuments(),
    Consultation.find({ createdAt: { $gte: start, $lte: end } })
      .populate("patient", "fullName patientId")
      .select("patient vitalSigns diagnosis"),
  ]);

  return {
    totalPatients,
    todayAppointments: {
      count: todayAppointments.length,
      list: todayAppointments,
    },
    todayConsultations: {
      count: todayConsultations.length,
      list: todayConsultations,
    },
  };
};


  //  Doctor Dashboard

export const getDoctorDashboard = async (doctorId) => {
  const { start, end } = getTodayRange();

  const [todayAppointments, pendingAppointments, completedToday, recentConsultations] = await Promise.all([
    Appointment.find({
      doctor: doctorId,
      date: { $gte: start, $lte: end },
    })
      .populate("patient", "fullName phone patientId bloodGroup allergies")
      .sort({ timeSlot: 1 }),
    Appointment.countDocuments({
      doctor: doctorId,
      date: { $gte: start, $lte: end },
      status: "scheduled",
    }),
    Appointment.countDocuments({
      doctor: doctorId,
      date: { $gte: start, $lte: end },
      status: "completed",
    }),
    Consultation.find({ doctor: doctorId })  // ✅ recent consultations
      .populate("patient", "fullName patientId")
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  return {
    todayAppointments: {
      count: todayAppointments.length,
      list: todayAppointments,
    },
    pendingAppointments,
    completedToday,
    recentConsultations: {        // ✅
      count: recentConsultations.length,
      list: recentConsultations,
    },
  };
};

  //  Accountant Dashboard

export const getAccountantDashboard = async () => {
  const { start, end } = getTodayRange();

  const [
    totalRevenue,
    unpaidCount,
    partialCount,
    todayRevenue,
    recentInvoices,
  ] = await Promise.all([
    Invoice.aggregate([{ $group: { _id: null, total: { $sum: "$amountPaid" } } }]),
    Invoice.countDocuments({ paymentStatus: "unpaid" }),
    Invoice.countDocuments({ paymentStatus: "partial" }),
    Invoice.aggregate([
      { $match: { paidAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: "$amountPaid" } } },
    ]),
    Invoice.find()
      .populate("patient", "fullName patientId")
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  return {
    totalRevenue: totalRevenue[0]?.total || 0,
    todayRevenue: todayRevenue[0]?.total || 0,
    unpaidCount,
    partialCount,
    recentInvoices,
  };
};