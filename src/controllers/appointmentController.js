import {
  bookAppointment,
  getAllAppointments,
  getAppointmentById,
  getTodayAppointments,
  getDoctorTodayAppointments,
  updateAppointmentStatus,
  updateAppointment,
} from "../services/appointmentService.js";


export const book = async (req, res) => {
  try {
    const appointment = await bookAppointment(req.body, req.user.id);
    res.status(201).json(appointment);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};


export const getAll = async (req, res) => {
  try {
    const appointments = await getAllAppointments();
    res.status(200).json(appointments);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};


export const getOne = async (req, res) => {
  try {
    const appointment = await getAppointmentById(req.params.id);
    res.status(200).json(appointment);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};


export const getToday = async (req, res) => {
  try {
    const appointments = await getTodayAppointments();
    res.status(200).json(appointments);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};


export const getDoctorToday = async (req, res) => {
  try {
    const appointments = await getDoctorTodayAppointments(req.user.id);
    res.status(200).json(appointments);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};


export const updateStatus = async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    const appointment = await updateAppointmentStatus(
      req.params.id,
      status,
      cancellationReason
    );
    res.status(200).json(appointment);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const appointment = await updateAppointment(req.params.id, req.body);
    res.status(200).json(appointment);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};