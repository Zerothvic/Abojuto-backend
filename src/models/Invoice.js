import mongoose from "mongoose";
import generateInvoiceNumber from "../utils/generateInvoiceNumber.js";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      trim: true, // Example: INV-0001
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    consultation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultation",
      required: true,
    },
    items: [
      {
        description: {
          type: String,
          required: true,
          trim: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
        },
        total: {
          type: Number,
          required: true,
        },
      },
    ],
    currency: {
      type: String,
      default: "NGN",
      trim: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    subTotal: Number,
    totalAmount: Number,
    amountPaid: {
      type: Number,
      default: 0,
    },
    balance: Number,
    dueDate: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "bank_transfer", "insurance"],
    },
    paymentHistory: [
      {
        amount: {
          type: Number,
          required: true,
        },
        method: {
          type: String,
          enum: ["cash", "card", "bank_transfer", "insurance"],
        },
        paidAt: {
          type: Date,
          default: Date.now,
        },
        receivedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    insuranceDetails: {
      provider: String,
      claimAmount: Number,
      approvalCode: String,
    },
    notes: String,
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paidAt: Date,
  },
  { timestamps: true }
);

// Combined pre-save hook for invoice number & financial calculations
invoiceSchema.pre("save", async function () {
  // Generate invoice number if missing
  if (!this.invoiceNumber) {
    this.invoiceNumber = await generateInvoiceNumber();
  }

  // Calculate each item total automatically
  this.items.forEach((item) => {
    item.total = item.quantity * item.unitPrice;
  });

  // Calculate subtotal
  this.subTotal = this.items.reduce((sum, item) => sum + item.total, 0);

  // Apply discount
  const discountAmount = (this.subTotal * this.discount) / 100;

  // Apply tax
  const taxAmount = ((this.subTotal - discountAmount) * this.tax) / 100;

  // Total amount
  this.totalAmount = this.subTotal - discountAmount + taxAmount;

  // Balance calculation
  this.balance = this.totalAmount - this.amountPaid;

  // Payment status logic
  if (this.balance <= 0) {
    this.paymentStatus = "paid";
    this.paidAt = new Date();
    this.balance = 0;
  } else if (this.amountPaid > 0) {
    this.paymentStatus = "partial";
  } else {
    this.paymentStatus = "unpaid";
  }
});

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;