import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import Invoice from "../models/Invoice.js";
import { getTodayRange } from "../utils/dateHelper.js";


//    Receptionist / Nurse Dashboard`
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

//    Doctor Dashboard

export const getDoctorDashboard = async (doctorId) => {
  const { start, end } = getTodayRange();

  const [todayAppointments, pendingAppointments, completedToday] = await Promise.all([
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
  ]);

  return {
    todayAppointments: {
      count: todayAppointments.length,
      list: todayAppointments,
    },
    pendingAppointments,
    completedToday,
  };
};


//    Accountant Dashboard
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