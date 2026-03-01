import React, { useState, useEffect } from 'react';
import { getInvoiceForOrder } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Invoices() {
  const { token } = useAuth();
  const [invoice, setInvoice] = useState(null);
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');

  const handleCheck = () => {
    setError('');
    getInvoiceForOrder(orderId, token)
      .then((res) => setInvoice(res.data))
      .catch((e) => setError(e.message));
  };

  return (
    <div className="card">
      <h2>Invoice Lookup</h2>
      <input
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        placeholder="Order ID"
      />
      <button onClick={handleCheck}>Get Invoice</button>
      {error && <p className="error">{error}</p>}
      {invoice && (
        <div>
          <p>Invoice #{invoice.id}</p>
          <p>Amount: ${invoice.amount}</p>
          <p>Status: {invoice.status}</p>
        </div>
      )}
    </div>
  );
}
