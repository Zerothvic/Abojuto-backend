import { Router } from "express";
import {
  create,
  getAll,
  getOne,
  search,
  update,
  remove,
} from "../controllers/patientController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import {authorize} from "../middlewares/roleMiddleware.js";

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Receptionist only
router.post("/", authorize("receptionist"), create);
router.put("/:id", authorize("receptionist"), update);
router.delete("/:id", authorize("receptionist"), remove);

// All staff roles
router.get("/search", authorize("receptionist", "nurse", "doctor", "accountant"), search);
router.get("/", authorize("receptionist", "nurse", "doctor", "accountant"), getAll);
router.get("/:id", authorize("receptionist", "nurse", "doctor", "accountant"), getOne);

export default router;