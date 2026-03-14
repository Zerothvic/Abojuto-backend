import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import logRequest from "./src/middlewares/logger.js";
import errorHandler from "./src/middlewares/errorHandler.js";

import authRoutes         from "./src/routes/authRoute.js";
import patientRoutes      from "./src/routes/patientRoute.js";
import appointmentRoutes  from "./src/routes/appointmentRoute.js";
import consultationRoutes from "./src/routes/consultationRoute.js";
import invoiceRoutes      from "./src/routes/invoiceRoute.js";
import dashboardRoutes    from "./src/routes/dashboardRoute.js";



// Load environment variables
dotenv.config();

const app = express();

// GLOBAL MIDDLEWARE
app.use(cors()); // Allows our frontend to talk to this server
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true }));
app.use(logRequest); 

// Routes
app.use("/api/auth",          authRoutes);
app.use("/api/patients",      patientRoutes);
app.use("/api/appointments",  appointmentRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/invoices",      invoiceRoutes);
app.use("/api/dashboard",     dashboardRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Health Centre API is running" });
});


//  Error handler
app.use(errorHandler);



export default app;