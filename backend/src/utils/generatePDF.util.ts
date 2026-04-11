import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export interface ReceiptData {
  orderId: string;
  date: Date;
  customerName?: string;
  paymentMethod: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  total: number;
}

export const generateReceipt = async (data: ReceiptData): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const fileName = `receipt_${data.orderId}.pdf`;
      const dirPath = path.join(process.cwd(), "public", "receipts");
      
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const filePath = path.join(dirPath, fileName);
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header
      doc
        .fontSize(20)
        .text("EPOS SYSTEM", { align: "center" })
        .fontSize(10)
        .text("123 Business Street, Tech City", { align: "center" })
        .text("Phone: +123 456 789", { align: "center" })
        .moveDown();

      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Order Info
      doc
        .fontSize(12)
        .text(`Order ID: ${data.orderId}`)
        .text(`Date: ${data.date.toLocaleString()}`)
        .text(`Customer: ${data.customerName || "Walk-in Customer"}`)
        .text(`Payment Method: ${data.paymentMethod.toUpperCase()}`)
        .moveDown();

      // Table Header
      const tableTop = doc.y;
      doc.font("Helvetica-Bold");
      doc.text("Item", 50, tableTop);
      doc.text("Qty", 250, tableTop, { width: 50, align: "right" });
      doc.text("Price", 350, tableTop, { width: 100, align: "right" });
      doc.text("Total", 450, tableTop, { width: 100, align: "right" });
      doc.moveDown();
      doc.font("Helvetica");

      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Items
      data.items.forEach((item) => {
        const y = doc.y;
        doc.text(item.name, 50, y, { width: 200 });
        doc.text(item.quantity.toString(), 250, y, { width: 50, align: "right" });
        doc.text(`$${item.price.toFixed(2)}`, 350, y, { width: 100, align: "right" });
        doc.text(`$${item.subtotal.toFixed(2)}`, 450, y, { width: 100, align: "right" });
        doc.moveDown(0.5);
      });

      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Total
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text(`TOTAL: $${data.total.toFixed(2)}`, { align: "right" })
        .moveDown();

      // Footer
      doc
        .text("Thank you for your business!", { align: "center" });

      doc.end();

      stream.on("finish", () => {
        // Return relative path for URL generation
        resolve(`/receipts/${fileName}`);
      });

      stream.on("error", (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};
