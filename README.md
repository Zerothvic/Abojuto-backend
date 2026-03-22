# 🏥 Community Health Centre Management System — Backend

A RESTful API backend for managing a community health centre,
built with Node.js, Express.js and MongoDB.

---

## 📋 Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Role Based Access](#role-based-access)
- [Models](#models)

---

## Overview

This backend powers the Community Health Centre Management System MVP.
It handles authentication, patient registration, appointment booking,
medical consultations, invoice generation, and role-based dashboards
for all staff members.

---

## Tech Stack

- **Runtime** — Node.js
- **Framework** — Express.js
- **Database** — MongoDB with Mongoose
- **Authentication** — JWT (JSON Web Tokens)
- **Password Hashing** — bcrypt
- **PDF Generation** — PDFKit
- **Module System** — ESM (import/export)

---

## Project Structure
```
/backend
├── src
├── /config
│   └── db.js                        # MongoDB connection
├── /controllers
│   ├── auth.controller.js
│   ├── patient.controller.js
│   ├── appointment.controller.js
│   ├── consultation.controller.js
│   ├── invoice.controller.js
│   └── dashboard.controller.js
├── /middleware
│   ├── authMiddleware.js             # JWT verification
│   ├── roleMiddleware.js             # Role based access
│   ├── logger.js          # Request logger
│   └── errorHandler.js   # Global error handler
├── /models
│   ├── User.js
│   ├── Patient.js
│   ├── Appointment.js
│   ├── Consultation.js
│   └── Invoice.js
├── /routes
│   ├── authRoutes.js
│   ├── patientRoutes.js
│   ├── appointmentRoutes.js
│   ├── consultationRoutes.js
│   ├── invoiceRoutes.js
│   └── dashboardRoutes.js
├── /services
│   ├── authService.js
│   ├── patientService.js
│   ├── appointmentService.js
│   ├── consultationService.js
│   ├── invoiceService.js
│   └── dashboardService.js
├── /utils
│   ├── generatePatientId.js
│   ├── generateInvoiceNumber.js
│   ├── generateInvoicePdf.js
│   └── dateHelper.js
├── .env
├── .env.example
├── .gitignore
├── app.js
├── server.js
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB

### Installation

1. Clone the repository
\`\`\`bash
git clone https://github.com/Zerothvic/health-center-backend-group2.git
cd health-center-backend-group2
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Copy environment variables
\`\`\`bash
cp .env.example .env
\`\`\`

4. Fill in your `.env` file
\`\`\`bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/health_centre
JWT_SECRET=your_secret_key_here
JWT_REFRESH_SECRET_TOKEN=your_refresh_key_here
NODE_ENV=development
\`\`\`

5. Seed the database with default users
\`\`\`bash
node seed.js
\`\`\`

6. Start the server
\`\`\`bash
npm run dev
\`\`\`

The server will run on `http://localhost:5000`

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/health_centre` |
| `JWT_SECRET` | Secret key for JWT | `your_secret_key` |
| `JWT_REFRESH_SECRET_TOKEN` | Secret key for refresh token | `refreshes` |
| `NODE_ENV` | Environment | `development` |

---

## API Endpoints

### Auth
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/api/auth/login` | Login user | Public |
| `POST` | `/api/auth/logout` | Logout user | All roles |

### Patients
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/api/patients` | Register new patient | Receptionist |
| `GET` | `/api/patients` | Get all patients | All roles |
| `GET` | `/api/patients/search?q=` | Search patients | All roles |
| `GET` | `/api/patients/:id` | Get single patient | All roles |
| `PUT` | `/api/patients/:id` | Update patient | Receptionist |
| `DELETE` | `/api/patients/:id` | Delete patient | Receptionist |

### Appointments
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/api/appointments` | Book appointment | Receptionist |
| `GET` | `/api/appointments` | Get all appointments | All roles |
| `GET` | `/api/appointments/today` | Get today's appointments | Receptionist, Nurse |
| `GET` | `/api/appointments/doctor/today` | Get doctor's today appointments | Doctor |
| `GET` | `/api/appointments/:id` | Get single appointment | All roles |
| `PATCH` | `/api/appointments/:id/status` | Update appointment status | Receptionist, Doctor |
| `PUT` | `/api/appointments/:id` | Update appointment | Receptionist |

### Consultations
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/api/consultations` | Create consultation | Doctor |
| `GET` | `/api/consultations` | Get all consultations | All roles |
| `GET` | `/api/consultations/doctor` | Get doctor's consultations | Doctor |
| `GET` | `/api/consultations/:id` | Get single consultation | All roles |
| `GET` | `/api/consultations/patient/:patientId` | Get patient consultations | Receptionist, Nurse, Doctor |
| `PUT` | `/api/consultations/:id` | Update consultation | Doctor |
| `PATCH` | `/api/consultations/:id/vitals` | Update vital signs | Nurse |

### Invoices
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/api/invoices` | Create invoice | Accountant |
| `GET` | `/api/invoices` | Get all invoices | Accountant |
| `GET` | `/api/invoices/unpaid` | Get unpaid invoices | Accountant |
| `GET` | `/api/invoices/patient/:patientId` | Get patient invoices | Accountant |
| `GET` | `/api/invoices/:id` | Get single invoice | Accountant |
| `PUT` | `/api/invoices/:id` | Update invoice | Accountant |
| `PATCH` | `/api/invoices/:id/payment` | Record payment | Accountant |
| `GET` | `/api/invoices/:id/pdf` | Download invoice PDF | Accountant |

### Dashboard
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/dashboard` | Get role based dashboard | All roles |

---

## Role Based Access

| Feature | Receptionist | Nurse | Doctor | Accountant |
|---------|-------------|-------|--------|------------|
| Login | ✅ | ✅ | ✅ | ✅ |
| Register Patient | ✅ | ❌ | ❌ | ❌ |
| View Patients | ✅ | ✅ | ✅ | ✅ |
| Update Patient | ✅ | ❌ | ❌ | ❌ |
| Delete Patient | ✅ | ❌ | ❌ | ❌ |
| Book Appointment | ✅ | ❌ | ❌ | ❌ |
| View Appointments | ✅ | ✅ | ✅ | ✅ |
| Update Appointment Status | ✅ | ❌ | ✅ | ❌ |
| Create Consultation | ❌ | ❌ | ✅ | ❌ |
| View Consultations | ✅ | ✅ | ✅ | ✅ |
| Update Consultation | ❌ | ❌ | ✅ | ❌ |
| Record Vital Signs | ❌ | ✅ | ❌ | ❌ |
| Create Invoice | ❌ | ❌ | ❌ | ✅ |
| View Invoices | ❌ | ❌ | ❌ | ✅ |
| Record Payment | ❌ | ❌ | ❌ | ✅ |
| Download PDF | ❌ | ❌ | ❌ | ✅ |
| Dashboard | ✅ | ✅ | ✅ | ✅ |

---

## Models

### User
| Field | Type | Required |
|-------|------|----------|
| `name` | String | ✅ |
| `email` | String | ✅ |
| `password` | String | ✅ |
| `role` | Enum | ✅ |
| `phone` | String | ❌ |
| `specialization` | String | ❌ |
| `isActive` | Boolean | ❌ |

### Patient
| Field | Type | Required |
|-------|------|----------|
| `patientId` | String | ✅ auto-generated |
| `fullName` | String | ✅ |
| `dateOfBirth` | Date | ✅ |
| `gender` | Enum | ✅ |
| `phone` | String | ✅ |
| `email` | String | ❌ |
| `address` | String | ❌ |
| `bloodGroup` | Enum | ❌ |
| `allergies` | String | ❌ |
| `maritalStatus` | Enum | ❌ |
| `occupation` | String | ❌ |
| `nationalId` | String | ❌ |
| `insuranceNumber` | String | ❌ |
| `emergencyContact` | Object | ❌ |
| `registeredBy` | ObjectId | ✅ |

### Appointment
| Field | Type | Required |
|-------|------|----------|
| `patient` | ObjectId | ✅ |
| `doctor` | ObjectId | ✅ |
| `date` | Date | ✅ |
| `timeSlot` | String | ✅ |
| `duration` | Number | ❌ |
| `reason` | String | ❌ |
| `status` | Enum | ❌ |
| `priority` | Enum | ❌ |
| `type` | Enum | ❌ |
| `cancellationReason` | String | ❌ |
| `followUpDate` | Date | ❌ |
| `bookedBy` | ObjectId | ✅ |

### Consultation
| Field | Type | Required |
|-------|------|----------|
| `appointment` | ObjectId | ✅ |
| `patient` | ObjectId | ✅ |
| `doctor` | ObjectId | ✅ |
| `chiefComplaint` | String | ❌ |
| `symptoms` | String | ✅ |
| `diagnosis` | String | ✅ |
| `treatmentGiven` | String | ❌ |
| `prescription` | Array | ❌ |
| `vitalSigns` | Object | ❌ |
| `labTests` | String | ❌ |
| `referral` | Object | ❌ |
| `followUpRecommended` | Boolean | ❌ |
| `attendedBy` | ObjectId | ✅ |

### Invoice
| Field | Type | Required |
|-------|------|----------|
| `invoiceNumber` | String | ✅ auto-generated |
| `patient` | ObjectId | ✅ |
| `appointment` | ObjectId | ✅ |
| `consultation` | ObjectId | ✅ |
| `items` | Array | ✅ |
| `currency` | String | ❌ |
| `discount` | Number | ❌ |
| `tax` | Number | ❌ |
| `subTotal` | Number | ❌ auto-calculated |
| `totalAmount` | Number | ❌ auto-calculated |
| `amountPaid` | Number | ❌ |
| `balance` | Number | ❌ auto-calculated |
| `paymentStatus` | Enum | ❌ auto-updated |
| `paymentMethod` | Enum | ❌ |
| `paymentHistory` | Array | ❌ |
| `insuranceDetails` | Object | ❌ |
| `generatedBy` | ObjectId | ✅ |

---

## Default Seed Users

After running `node seed.js` the following users are available:

| Role | Email | Password |
|------|-------|----------|
| Receptionist | receptionist@health.com | password123 |
| Doctor | doctor@health.com | password123 |
| Nurse | nurse@health.com | password123 |
| Accountant | accountant@health.com | password123 |

---

## Architecture
```
Request → Route → Controller → Service → Model → DB
                      ↑             |
                      └─────────────┘
                       returns data
```

- **Routes** — define endpoints and apply middleware
- **Controllers** — handle req/res, call services
- **Services** — all business logic and DB queries
- **Models** — MongoDB schemas
- **Middleware** — auth, role, logger, error handler
- **Utils** — reusable helper functions


[👉 View live URL](https://abojuto.onrender.com/)

---

## Authors
- Group 2 Backend Team