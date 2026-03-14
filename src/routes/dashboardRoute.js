import { Router } from "express";
import { getDashboard } from "../controllers/dashboardController.js";
import {authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// All roles — controller handles role based response
router.get("/", getDashboard);

export default router;
