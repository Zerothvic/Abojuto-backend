import { Router } from "express";
import { login, logout } from "../controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

// Public routes
router.post("/login", login);

// Protected routes
router.post("/logout", authenticate, logout);

export default router;