import { Router } from "express";
import {
  book,
  getAll,
  getOne,
  getToday,
  getDoctorToday,
  updateStatus,
  update,
} from "../controllers/appointmentController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import {authorize} from "../middlewares/roleMiddleware.js";

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Receptionist only
router.post("/", authorize("receptionist"), book);
router.put("/:id", authorize("receptionist"), update);

// Receptionist and nurse
router.get("/today", authorize("receptionist", "nurse"), getToday);

// Doctor only
router.get("/doctor/today", authorize("doctor"), getDoctorToday);

// Receptionist and doctor
router.patch("/:id/status", authorize("receptionist", "doctor"), updateStatus);

// All roles
router.get("/", authorize("receptionist", "nurse", "doctor", "accountant"), getAll);
router.get("/:id", authorize("receptionist", "nurse", "doctor", "accountant"), getOne);

export default router;