// PDF generation utility for creating medical invoices
import PDFDocument from "pdfkit";


// Function to generate invoice PDF
const generateInvoicePDF = (invoiceData, res) => {

  const doc = new PDFDocument({ margin: 50 });
// Set response headers for PDF download
  res.setHeader(
    "Content-Disposition",`attachment; filename=invoice-${invoiceData.invoiceNumber}.pdf`
  );
//   Set content type to PDF
  res.setHeader("Content-Type", "application/pdf");
//   Pipe the PDF document to the response
  doc.pipe(res);
//   Add invoice details to the PDF
  doc.fontSize(20).text("Community Health Center", { align: "center" });
//   Add a horizontal line 
  doc.moveDown();
//  Add invoice title
  doc.fontSize(16).text("Medical Invoice", { align: "center" });

  doc.moveDown();
// Add patient details and invoice information
  doc.fontSize(12).text(`Invoice No: ${invoiceData.invoiceNumber}`);
  doc.text(`Patient: ${invoiceData.patientName}`);
  doc.text(`Date: ${invoiceData.date}`);

  doc.moveDown();
//  Add table headers for services and prices
  doc.fontSize(14).text("Services", { underline: true });
  doc.text("Price", { align: "right", underline: true });

// Lists all the services provided in the invoice along with their prices
  invoiceData.services.forEach(service => {
    doc.text(`${service.name}  -  ₦${service.price}`);
  });

  doc.moveDown();
//  Add total amount at the end of the invoice
  doc.fontSize(14).text(`Total: ₦${invoiceData.total}`, {
    align: "right"
  });

  doc.end();
};

export default generateInvoicePDF;