import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { register, login, logout } from '../controllers/authController.js';
import { getDashboard } from '../controllers/dashboardController.js';
import { 
  createConsultation,
  getAllConsultations,
  getConsultationById
} from "../services/consultationService.js";
import { createPatient, getAllPatients, getPatientById, updatePatient } from '../services/patientService.js';



const router = Router();

// To check if the User API is active

router.get('/health', (req, res) => {
  res.status(200).json({ message: 'Staff API is active' });
});


// Dashbaord: Accessible by all staff roles, but logic will filter data based on req.user.role

router.get('/dashboard', authorize('Receptionist', 'Nurse', 'Doctor', 'Accountant'), (req, res) => {
  res.json({ 
    message: `Welcome to the ${req.user.role} dashboard`,
    role: req.user.role 
  });
});


// Patient Management

router.post('/patients', authorize('Receptionist','Nurse'), async (req, res, next) => {
  try {
    const patient = await createPatient(req.body, req.user.id);

    res.status(201).json({
      message: "Patient registered successfully",
      data: patient
    });

  } catch (error) {
    next(error);
  }
});

router.get('/patients', authorize('Receptionist','Nurse','Doctor'), getAllPatients);

router.get('/patients/:id', authorize('Receptionist','Nurse','Doctor'), getPatientById);

router.put('/patients/:id', authorize('Receptionist','Nurse'), updatePatient);


// Consultation routes

router.get('/consultations', authorize('Doctor','Nurse'), getAllConsultations);

router.get('/consultations/:id', authorize('Doctor','Nurse'), getConsultationById);

// Clinical Notes

router.post('/consultations', authorize('Doctor'), async (req, res, next) => {
  try {
    const consultation = await createConsultation(req.body, req.user.id);

    res.status(201).json({
      message: "Consultation created successfully",
      data: consultation
    });

  } catch (error) {
    next(error);
  }
});

// Billing

router.get('/billing/summary', authorize('Accountant'), (req, res) => {
  res.json({ message: "Revenue data loaded" });
});

export default router;