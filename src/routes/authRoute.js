import { Router } from "express";
import { register, login, logout } from "../controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = Router();


// Public routes
router.post("/login", login);

// Protected routes
router.post("/register", authenticate, authorize("Receptionist", "Nurse", "Doctor", "Accountant"), register);
router.post("/logout", authenticate, logout);

export default router;

