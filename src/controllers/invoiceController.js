import {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  getInvoicesByPatient,
  getUnpaidInvoices,
  recordPayment,
  updateInvoice,
} from "../services/invoiceService.js";

// Allowed payment methods
const validPaymentMethods = ["cash", "card", "bank_transfer", "insurance"];

//  Create Invoice
export const create = async (req, res) => {
  try {
    const invoice = await createInvoice(req.body, req.user.id);
    res.status(201).json(invoice);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

//  Get All Invoices
export const getAll = async (req, res) => {
  try {
    const invoices = await getAllInvoices();
    res.status(200).json(invoices);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

//  Get Invoice by ID
export const getOne = async (req, res) => {
  try {
    const invoice = await getInvoiceById(req.params.id);
    res.status(200).json(invoice);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

//  Get Invoices by Patient
export const getByPatient = async (req, res) => {
  try {
    const invoices = await getInvoicesByPatient(req.params.patientId);
    res.status(200).json(invoices);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

//  Get Unpaid Invoices
export const getUnpaid = async (req, res) => {
  try {
    const invoices = await getUnpaidInvoices();
    res.status(200).json(invoices);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

//  Record Payment
export const payment = async (req, res) => {
  try {
    const { amount, method } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Payment amount is required" });
    }

    if (!method) {
      return res.status(400).json({ message: "Payment method is required" });
    }

    //  Validate payment method before calling service
    if (!validPaymentMethods.includes(method)) {
      return res.status(400).json({
        message: `Invalid payment method. Valid options: ${validPaymentMethods.join(
          ", "
        )}`,
      });
    }

    const invoice = await recordPayment(req.params.id, req.body, req.user.id);
    res.status(200).json(invoice);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

// 🔹 Update Invoice
export const update = async (req, res) => {
  try {
    const invoice = await updateInvoice(req.params.id, req.body);
    res.status(200).json(invoice);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};