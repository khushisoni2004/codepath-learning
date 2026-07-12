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
          <p><span>Payment ID:</span><strong>{receipt.paymentId}</strong></p>
          <p><span>Order ID:</span><strong>{receipt.orderId}</strong></p>
          <p><span>Student:</span><strong>{receipt.studentName}</strong></p>
          <p><span>Email:</span><strong>{receipt.studentEmail}</strong></p>
          <p><span>Date:</span><strong>{new Date(receipt.paidAt).toLocaleString()}</strong></p>
        </div>
        <button className="payment-primary" type="button" onClick={() => window.print()}>Print Receipt</button>
      </section>
    </div>
  );
}
