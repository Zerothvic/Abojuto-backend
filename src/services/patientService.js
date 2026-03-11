import Patient from "../models/Patient.js";


export const createPatient = async (data, userId) => {
  // Check if patient with same phone already exists
  const existingPhone = await Patient.findOne({ phone: data.phone });
  if (existingPhone) {
    const error = new Error("Patient with this phone number already exists");
    error.status = 400;
    throw error;
  }

  // Check if patient with same nationalId already exists
  if (data.nationalId) {
    const existingNationalId = await Patient.findOne({ nationalId: data.nationalId });
    if (existingNationalId) {
      const error = new Error("Patient with this national ID already exists");
      error.status = 400;
      throw error;
    }
  }

  const patient = new Patient({ ...data, registeredBy: userId });
  await patient.save(); // triggers pre("save") → auto generates patientId
  return patient;
};


export const getAllPatients = async () => {
  const patients = await Patient.find()
    .populate("registeredBy", "name role")
    .sort({ createdAt: -1 });
  return patients;
};


export const getPatientById = async (id) => {
  const patient = await Patient.findById(id)
    .populate("registeredBy", "name role");
  if (!patient) {
    const error = new Error("Patient not found");
    error.status = 404;
    throw error;
  }
  return patient;
};


export const searchPatients = async (query) => {
  const patients = await Patient.find({
    $or: [
      { fullName:  { $regex: query, $options: "i" } },
      { phone:     { $regex: query, $options: "i" } },
      { patientId: { $regex: query, $options: "i" } },
      { email:     { $regex: query, $options: "i" } },
    ],
  }).sort({ createdAt: -1 });
  return patients;
};


export const updatePatient = async (id, data) => {
  const patient = await Patient.findById(id);
  if (!patient) {
    const error = new Error("Patient not found");
    error.status = 404;
    throw error;
  }

  // Prevent patientId and registeredBy from being updated
  delete data.patientId;
  delete data.registeredBy;

  Object.assign(patient, data);
  await patient.save();
  return patient;
};

// check if patient has been deleted

export const deletePatient = async (id) => {
  const patient = await Patient.findByIdAndDelete(id);
 if (!patient) {
    const error = new Error("Patient not found");
    error.status = 404;
    throw error;
  }

  return { message: "Patient deleted successfully" };
};