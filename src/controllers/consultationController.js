import {
  createConsultation,
  getAllConsultations,
  getConsultationById,
  getConsultationsByPatient,
  getConsultationsByDoctor,
  updateConsultation,
} from "../services/consultationService.js";


export const create = async (req, res) => {
  try {
    const consultation = await createConsultation(req.body, req.user.id);
    res.status(201).json(consultation);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};


export const getAll = async (req, res) => {
  try {
    const consultations = await getAllConsultations();
    res.status(200).json(consultations);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};


export const getOne = async (req, res) => {
  try {
    const consultation = await getConsultationById(req.params.id);
    res.status(200).json(consultation);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};


export const getByPatient = async (req, res) => {
  try {
    const consultations = await getConsultationsByPatient(req.params.patientId);
    res.status(200).json(consultations);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};


export const getByDoctor = async (req, res) => {
  try {
    const consultations = await getConsultationsByDoctor(req.user.id);
    res.status(200).json(consultations);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};


export const update = async (req, res) => {
  try {
    const consultation = await updateConsultation(
      req.params.id,
      req.body,
      req.user.id
    );
    res.status(200).json(consultation);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};