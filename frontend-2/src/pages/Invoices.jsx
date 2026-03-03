import React, { useState, useEffect } from 'react';
import { listOrders, getInvoiceForOrder } from '../api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Invoices() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [invoiceMap, setInvoiceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    setError('');
    setLoading(true);
    listOrders({ page, size: pageSize }, token)
      .then((res) => {
        setOrders(res.content || []);
        setTotalElements(res.totalElements || 0);
        // Fetch invoices for all orders
        if (res.content && res.content.length > 0) {
          loadInvoices(res.content);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, page, pageSize]);

  const loadInvoices = async (orders) => {
    const invoices = {};
    for (const order of orders) {
      try {
        const inv = await getInvoiceForOrder(order.id, token);
        invoices[order.id] = inv;
      } catch (err) {
        console.error(`Failed to load invoice for order ${order.id}`);
      }
    }
    setInvoiceMap(invoices);
  };

  const totalPages = Math.ceil(totalElements / pageSize);
  const hasNextPage = page < totalPages - 1;
  const hasPrevPage = page > 0;

  if (loading) return <p>Loading invoices...</p>;

  return (
    <div className="card">
      <h2>My Invoices</h2>
      {error && <p className="error">{error}</p>}

      {orders.length > 0 ? (
        <>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Invoice #</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const invoice = invoiceMap[order.id];
                return (
                  <tr key={order.id}>
                    <td>
                      <Link to={`/orders/${order.id}`}>#{order.id}</Link>
                    </td>
                    <td>{invoice ? invoice.invoiceNo : 'N/A'}</td>
                    <td>${invoice ? invoice.total.toFixed(2) : order.total}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: invoice?.status === 'PAID' ? '#d5f4e6' : '#fadbd8',
                        color: invoice?.status === 'PAID' ? '#27ae60' : '#c0392b',
                      }}>
                        {invoice ? invoice.status : order.status}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/orders/${order.id}`}>
                        <button>View</button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="pagination">
            <button 
              onClick={() => setPage(p => p - 1)} 
              disabled={!hasPrevPage}
            >
              ← Previous
            </button>
            <span>Page {page + 1} of {totalPages || 1} (Total: {totalElements})</span>
            <button 
              onClick={() => setPage(p => p + 1)} 
              disabled={!hasNextPage}
            >
              Next →
            </button>
          </div>
        </>
      ) : (
        <p>
          No invoices found.{' '}
          <Link to="/orders/new">Create an order</Link> to generate an invoice.
        </p>
      )}
    </div>
  );
}
