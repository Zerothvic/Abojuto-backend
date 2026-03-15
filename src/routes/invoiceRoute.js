import { Router } from "express";
import {
  create,
  getAll,
  getOne,
  getByPatient,
  getUnpaid,
  payment,
  update,
  downloadPdf,
} from "../controllers/invoiceController.js";
import {authenticate} from "../middlewares/authMiddleware.js";
import {authorize} from "../middlewares/roleMiddleware.js";

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Accountant only
router.post("/", authorize("accountant"), create);
router.put("/:id", authorize("accountant"), update);
router.patch("/:id/payment", authorize("accountant"), payment);
router.get("/unpaid", authorize("accountant"), getUnpaid);
router.get("/patient/:patientId", authorize("accountant"), getByPatient);
router.get("/", authorize("accountant"), getAll);
router.get("/:id", authorize("accountant"), getOne);
router.get("/:id/pdf", authorize("accountant"), downloadPdf);

export default router;