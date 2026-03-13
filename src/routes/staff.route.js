import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { login, logout } from '../controllers/authController.js';

// Controller imports (to be created by the team)
import * as authCtrl from '../controllers/authController.js';
// import * as dashCtrl from '../../controllers/dashController.js';

const router = Router();
 
router.get('/health', (req, res) => {
  res.status(200).json({ message: 'Staff API is active' });
});

router.post('/login', (req, res) => {
  res.json({ message: "User logged in successfully" });
});
 
router.use(authMiddleware); // All routes below require authentication

router.post('/logout', (req, res) => {
  res.json({ message: "User logged out successfully" });
});

// DASHBOARD: Accessible by all staff roles, but logic will filter data based on req.user.role

router.get('/dashboard', authorize('Receptionist', 'Nurse', 'Doctor', 'Accountant'), (req, res) => {
  res.json({ 
    message: `Welcome to the ${req.user.role} dashboard`,
    role: req.user.role 
  });
});


// Patient Management
router.post('/patients', authorize('Receptionist', 'Nurse'), (req, res) => {
  res.json({ message: "Patient registered" });
});

// Clinical Notes
router.post('/consultations', authorize('Doctor'), (req, res) => {
  res.json({ message: "Notes saved" });
});

// Billing
router.get('/billing/summary', authorize('Accountant'), (req, res) => {
  res.json({ message: "Revenue data loaded" });
});

export default router;