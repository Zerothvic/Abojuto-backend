import Invoice from "../models/Invoice.js";
import Appointment from "../models/Appointment.js";
import Consultation from "../models/Consultation.js";
import Patient from "../models/Patient.js";

// Valid payment methods
const validPaymentMethods = ["cash", "card", "bank_transfer", "insurance"];


export const createInvoice = async (data, userId) => {
  // Check if patient exists
  const patient = await Patient.findById(data.patient);
  if (!patient) {
    const error = new Error("Patient not found");
    error.status = 404;
    throw error;
  }

  // Check if appointment exists
  const appointment = await Appointment.findById(data.appointment);
  if (!appointment) {
    const error = new Error("Appointment not found");
    error.status = 404;
    throw error;
  }

  // Check if consultation exists
  const consultation = await Consultation.findById(data.consultation);
  if (!consultation) {
    const error = new Error("Consultation not found");
    error.status = 404;
    throw error;
  }

  // Check if invoice already exists for this appointment
  const existing = await Invoice.findOne({ appointment: data.appointment });
  if (existing) {
    const error = new Error("Invoice already exists for this appointment");
    error.status = 400;
    throw error;
  }

  // Check if items are provided
  if (!data.items || data.items.length === 0) {
    const error = new Error("Invoice must have at least one item");
    error.status = 400;
    throw error;
  }

  // Validate payment method if provided
  if (data.paymentMethod && !validPaymentMethods.includes(data.paymentMethod)) {
    const error = new Error(
      `Invalid payment method. Valid options: ${validPaymentMethods.join(", ")}`
    );
    error.status = 400;
    throw error;
  }

  // Validate discount range
  if (data.discount !== undefined && (data.discount < 0 || data.discount > 100)) {
    const error = new Error("Discount must be between 0 and 100");
    error.status = 400;
    throw error;
  }

  // Validate tax range
  if (data.tax !== undefined && (data.tax < 0 || data.tax > 100)) {
    const error = new Error("Tax must be between 0 and 100");
    error.status = 400;
    throw error;
  }

  // Validate item quantities and prices
  data.items.forEach((item, index) => {
    if (item.quantity < 1) {
      const error = new Error(`Quantity must be at least 1 for item ${index + 1}`);
      error.status = 400;
      throw error;
    }
    if (item.unitPrice < 0) {
      const error = new Error(`Unit price cannot be negative for item ${index + 1}`);
      error.status = 400;
      throw error;
    }
  });

  // Remove financial fields — rely on pre-save hook
  delete data.subTotal;
  delete data.totalAmount;
  delete data.balance;
  delete data.paidAt;
  delete data.paymentStatus;

  const invoice = new Invoice({ ...data, generatedBy: userId });
  await invoice.save(); // pre-save hook handles calculations & invoice number
  return invoice.populate([
    { path: "patient", select: "fullName phone patientId" },
    { path: "appointment", select: "date timeSlot type" },
    { path: "consultation", select: "diagnosis prescription" },
    { path: "generatedBy", select: "name role" },
  ]);
};

export const getAllInvoices = async () => {
  const invoices = await Invoice.find()
    .populate("patient", "fullName phone patientId")
    .populate("appointment", "date timeSlot")
    .populate("generatedBy", "name role")
    .sort({ createdAt: -1 });
  return invoices;
};


export const getInvoiceById = async (id) => {
  const invoice = await Invoice.findById(id)
    .populate("patient", "fullName phone patientId address insuranceNumber")
    .populate("appointment", "date timeSlot type reason")
    .populate("consultation", "diagnosis prescription treatmentGiven")
    .populate("generatedBy", "name role");
  if (!invoice) {
    const error = new Error("Invoice not found");
    error.status = 404;
    throw error;
  }
  return invoice;
};


export const getInvoicesByPatient = async (patientId) => {
  const invoices = await Invoice.find({ patient: patientId })
    .populate("appointment", "date timeSlot type")
    .populate("generatedBy", "name role")
    .sort({ createdAt: -1 });
  return invoices;
};


export const getUnpaidInvoices = async () => {
  const invoices = await Invoice.find({
    paymentStatus: { $in: ["unpaid", "partial"] },
  })
    .populate("patient", "fullName phone patientId")
    .populate("generatedBy", "name role")
    .sort({ createdAt: 1 });
  return invoices;
};



export const recordPayment = async (id, data, userId) => {
  const invoice = await Invoice.findById(id);
  if (!invoice) {
    const error = new Error("Invoice not found");
    error.status = 404;
    throw error;
  }

  // Check if invoice is already paid
  if (invoice.paymentStatus === "paid") {
    const error = new Error("Invoice is already fully paid");
    error.status = 400;
    throw error;
  }

  // Validate payment amount
  if (!data.amount || data.amount <= 0) {
    const error = new Error("Payment amount must be greater than zero");
    error.status = 400;
    throw error;
  }

  // Check if amount exceeds balance
  if (data.amount > invoice.balance) {
    const error = new Error(
      `Payment amount exceeds balance of ${invoice.balance}`
    );
    error.status = 400;
    throw error;
  }

  // Validate payment method
  if (!data.method || !validPaymentMethods.includes(data.method)) {
    const error = new Error(
      `Invalid or missing payment method. Valid options: ${validPaymentMethods.join(", ")}`
    );
    error.status = 400;
    throw error;
  }

  // Push to payment history
  invoice.paymentHistory.push({
    amount: data.amount,
    method: data.method,
    receivedBy: userId,
  });

  // Update amountPaid and method
  invoice.amountPaid += data.amount;
  invoice.paymentMethod = data.method;

  await invoice.save(); // pre-save hook recalculates balance, status, paidAt
  return invoice;
};


export const updateInvoice = async (id, data) => {
  const invoice = await Invoice.findById(id);
  if (!invoice) {
    const error = new Error("Invoice not found");
    error.status = 404;
    throw error;
  }

  // Prevent paid invoices from being updated
  if (invoice.paymentStatus === "paid") {
    const error = new Error("Paid invoices cannot be updated");
    error.status = 400;
    throw error;
  }

  // Validate discount range
  if (data.discount !== undefined && (data.discount < 0 || data.discount > 100)) {
    const error = new Error("Discount must be between 0 and 100");
    error.status = 400;
    throw error;
  }

  // Validate tax range
  if (data.tax !== undefined && (data.tax < 0 || data.tax > 100)) {
    const error = new Error("Tax must be between 0 and 100");
    error.status = 400;
    throw error;
  }

  // Prevent critical fields from being updated
  delete data.invoiceNumber;
  delete data.patient;
  delete data.appointment;
  delete data.consultation;
  delete data.generatedBy;
  delete data.amountPaid;
  delete data.paymentHistory;
  delete data.paymentStatus;
  delete data.paidAt;

  Object.assign(invoice, data);
  await invoice.save(); // triggers pre-save hook → recalculates financials
  return invoice;
};