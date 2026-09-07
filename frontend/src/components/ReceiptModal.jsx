import ProtectedStudentResourceLink from "./ProtectedStudentResourceLink";

export default function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null;
  return (
    <div className="payment-overlay" role="dialog" aria-modal="true" aria-label="Payment receipt">
      <section className="payment-modal receipt-modal">
        <button className="payment-close" type="button" onClick={onClose} aria-label="Close">×</button>
        <div className="payment-success-icon">✓</div>
        <h2>Payment Successful</h2>
        <div className="receipt-details">
          <p><span>Receipt No:</span><strong>{receipt.receiptNumber}</strong></p>
          <p><span>Course:</span><strong>{receipt.courseTitle}</strong></p>
          <p><span>Amount:</span><strong>₹{(receipt.amount / 100).toFixed(0)}</strong></p>
          <p><span>Payment Method:</span><strong>{receipt.paymentMethod === "UPI_QR" ? "CODEPATH LEARNING QR" : "Razorpay"}</strong></p>
          <p><span>Payment ID:</span><strong>{receipt.paymentId}</strong></p>
          {receipt.orderId ? <p><span>Order ID:</span><strong>{receipt.orderId}</strong></p> : null}
          <p><span>Student:</span><strong>{receipt.studentName}</strong></p>
          <p><span>Email:</span><strong>{receipt.studentEmail}</strong></p>
          <p><span>Date:</span><strong>{new Date(receipt.paidAt).toLocaleString()}</strong></p>
        </div>
        <div className="receipt-course-access">
          <p>Your course access is active. Join the student community and open your class resources.</p>
          <div className="receipt-course-access-actions">
            <ProtectedStudentResourceLink resource="whatsapp" className="payment-primary receipt-resource-link">
              Join WhatsApp Group
            </ProtectedStudentResourceLink>
            <ProtectedStudentResourceLink resource="classroom" className="payment-primary receipt-resource-link receipt-resource-link-secondary">
              Open Google Classroom
            </ProtectedStudentResourceLink>
          </div>
        </div>
        <button className="payment-primary" type="button" onClick={() => window.print()}>Print Receipt</button>
      </section>
    </div>
  );
}
