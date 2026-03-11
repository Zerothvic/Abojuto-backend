import Invoice from "../models/Invoice.js";
import Appointment from "../models/Appointment.js";
import Consultation from "../models/Consultation.js";
import Patient from "../models/Patient.js";

// Valid payment methods
const validPaymentMethods = ["cash", "card", "bank_transfer", "insurance"];

//  Create Invoice
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

//  Record Payment
export const recordPayment = async (id, data, userId) => {
  const invoice = await Invoice.findById(id);
  if (!invoice) {
    const error = new Error("Invoice not found");
    error.status = 404;
    throw error;
  }

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