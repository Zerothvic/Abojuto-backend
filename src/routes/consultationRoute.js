import { Router } from "express";
import {
  create,
  getAll,
  getOne,
  getByPatient,
  getByDoctor,
  update,
  updateVitals,
} from "../controllers/consultationController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import {authorize} from "../middlewares/roleMiddleware.js";

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Doctor only
router.post("/", authorize("doctor"), create);
router.put("/:id", authorize("doctor"), update);
router.get("/doctor", authorize("doctor"), getByDoctor);

// Nurse only
router.patch("/:id/vitals", authorize("nurse"), updateVitals);

// Receptionist, nurse and doctor
router.get("/patient/:patientId", authorize("receptionist", "nurse", "doctor"), getByPatient);

// All roles
router.get("/", authorize("receptionist", "nurse", "doctor", "accountant"), getAll);
router.get("/:id", authorize("receptionist", "nurse", "doctor", "accountant"), getOne);

export default router;