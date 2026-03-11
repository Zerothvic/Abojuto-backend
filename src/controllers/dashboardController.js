import {
  getReceptionistDashboard,
  getDoctorDashboard,
  getAccountantDashboard,
} from "../services/dashboardService.js";

export const getDashboard = async (req, res) => {
  try {
    const { role, id } = req.user;
    let data;

    switch (role) {
      case "receptionist":
      case "nurse":
        data = await getReceptionistDashboard();
        break;

      case "doctor":
        data = await getDoctorDashboard(id);
        break;

      case "accountant":
        data = await getAccountantDashboard();
        break;

      default:
        return res.status(403).json({ message: "Invalid role" });
    }

    res.status(200).json({ role, data });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};