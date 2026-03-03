import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { listOrders, getInvoiceForOrder } from '../api';
import './AdminInvoices.css';

export default function AdminInvoices() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

  useEffect(() => {
    fetchOrders();
  }, [token]);

  useEffect(() => {
    let filtered = orders;

    if (statusFilter) {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    if (searchText) {
      filtered = filtered.filter((o) =>
        o.id?.toString().includes(searchText) ||
        o.customerId?.toString().includes(searchText)
      );
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchText]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await listOrders({}, token);
      setOrders(res.content || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadInvoice = async (orderId) => {
    try {
      setInvoiceLoading(true);
      setInvoiceError('');
      const invoice = await getInvoiceForOrder(orderId, token);
      setSelectedInvoice(invoice);
    } catch (err) {
      setInvoiceError(err.message);
    } finally {
      setInvoiceLoading(false);
    }
  };

  if (loading) return <div>Loading invoices...</div>;

  return (
    <div className="admin-invoices">
      <h2>Invoices and Billing</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="filters">
        <input
          type="text"
          placeholder="Search by Order ID or Customer ID"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Order Statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="invoices-container">
        <div className="orders-list">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer ID</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="4">No orders found</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customerId}</td>
                    <td>{order.status}</td>
                    <td>
                      <button
                        onClick={() => loadInvoice(order.id)}
                        className="btn-view"
                      >
                        View Invoice
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <p className="count">Total: {filteredOrders.length} order(s)</p>
        </div>

        {selectedInvoice && (
          <div className="invoice-detail">
            <h3>Invoice Details</h3>
            {invoiceLoading && <div>Loading invoice...</div>}
            {invoiceError && <div className="error-message">{invoiceError}</div>}

            {!invoiceLoading && selectedInvoice && (
              <>
                <div className="invoice-info">
                  <p>
                    <strong>Invoice ID:</strong> {selectedInvoice.id}
                  </p>
                  <p>
                    <strong>Order ID:</strong> {selectedInvoice.orderId}
                  </p>
                  <p>
                    <strong>Amount:</strong> ${selectedInvoice.totalAmount?.toFixed(2) || 'N/A'}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedInvoice.status}
                  </p>
                  <p>
                    <strong>Due Date:</strong>{' '}
                    {selectedInvoice.dueDate
                      ? new Date(selectedInvoice.dueDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                  <p>
                    <strong>Created:</strong>{' '}
                    {selectedInvoice.createdAt
                      ? new Date(selectedInvoice.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>

                {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                  <div className="invoice-items">
                    <h4>Line Items</h4>
                    <table>
                      <thead>
                        <tr>
                          <th>Description</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.items.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.description || 'Product'}</td>
                            <td>{item.quantity}</td>
                            <td>${item.price?.toFixed(2) || '0.00'}</td>
                            <td>
                              ${((item.quantity || 1) * (item.price || 0)).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="btn-close"
                >
                  Close
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
