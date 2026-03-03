import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrder, getInvoiceForOrder, createPayment } from '../api';
import { useAuth } from '../context/AuthContext';

export default function OrderDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    setError('');
    getOrder(id, token)
      .then((res) => {
        setOrder(res);
        // Fetch invoice for this order
        return getInvoiceForOrder(id, token);
      })
      .then((inv) => setInvoice(inv))
      .catch((e) => setError(e.message));
  }, [id, token]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!invoice) {
      setError('Invoice not found');
      return;
    }
    
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    if (amount > invoice.total) {
      setError(`Payment cannot exceed invoice total of $${invoice.total}`);
      return;
    }

    try {
      setProcessingPayment(true);
      await createPayment({
        invoiceId: invoice.id,
        amount,
        method: paymentMethod,
      }, token);
      setMessage(`Payment of $${amount} processed successfully!`);
      setPaymentAmount('');
      // Refresh invoice after payment
      const updatedInvoice = await getInvoiceForOrder(id, token);
      setInvoice(updatedInvoice);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (error) return <p className="error">{error}</p>;
  if (!order) return <p>Loading…</p>;

  const amountDue = invoice ? (invoice.total - (invoice.paidAmount || 0)) : 0;
  const isPaid = invoice && invoice.status === 'PAID';

  return (
    <div className="card">
      <h2>Order #{order.id}</h2>
      <div className="order-details">
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Order Total:</strong> ${order.total}</p>
        <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
        
        {order.items && (
          <>
            <h3>Items:</h3>
            <ul>
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.productName || `Product ${item.productId}`} - 
                  Qty: {item.quantity} × ${item.price} = ${(item.quantity * item.price).toFixed(2)}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {invoice && (
        <div className="invoice-section">
          <h3>Invoice #{invoice.invoiceNo}</h3>
          <p><strong>Invoice Status:</strong> {invoice.status}</p>
          <p><strong>Invoice Total:</strong> ${invoice.total.toFixed(2)}</p>
          {invoice.paidAmount && <p><strong>Paid Amount:</strong> ${invoice.paidAmount.toFixed(2)}</p>}
          <p><strong>Amount Due:</strong> <span style={{ color: isPaid ? 'green' : 'red' }}>
            ${amountDue.toFixed(2)}
          </span></p>

          {!isPaid && amountDue > 0 && (
            <form onSubmit={handlePayment} className="payment-form">
              <h4>Make Payment</h4>
              {message && <p className="success">{message}</p>}
              {error && <p className="error">{error}</p>}
              
              <div>
                <label>Payment Method:</label>
                <select 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={processingPayment}
                >
                  <option value="CARD">Credit/Debit Card</option>
                  <option value="UPI">UPI</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>

              <div>
                <label>Amount to Pay:</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={amountDue}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder={`Max: $${amountDue.toFixed(2)}`}
                  disabled={processingPayment}
                />
              </div>

              <button type="submit" disabled={processingPayment}>
                {processingPayment ? 'Processing...' : 'Pay Now'}
              </button>
            </form>
          )}

          {isPaid && <p style={{ color: 'green', fontWeight: 'bold' }}>✓ Invoice Paid</p>}
        </div>
      )}
    </div>
  );
}
