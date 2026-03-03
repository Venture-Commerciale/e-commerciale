import React, { useState, useEffect } from 'react';
import { listOrders } from '../api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Orders() {
  const { token, isStaff } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    setError('');
    listOrders({ page, size: pageSize }, token)
      .then((res) => {
        setOrders(res.content || []);
        setTotalElements(res.totalElements || 0);
      })
      .catch((e) => setError(e.message));
  }, [token, page, pageSize]);

  const totalPages = Math.ceil(totalElements / pageSize);
  const hasNextPage = page < totalPages - 1;
  const hasPrevPage = page > 0;

  return (
    <div className="card">
      <h2>{isStaff() ? 'All Orders' : 'My Orders'}</h2>
      {isStaff() && (
        <Link to="/staff">
          <button>Staff Panel</button>
        </Link>
      )}
      <Link to="/orders/new">
        <button>New Order</button>
      </Link>
      {error && <p className="error">{error}</p>}
      
      {orders.length > 0 ? (
        <>
          <ul>
            {orders.map((o) => (
              <li key={o.id}>
                <Link to={`/orders/${o.id}`}>Order #{o.id}</Link> – {o.status} – ${o.total}
              </li>
            ))}
          </ul>
          
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
        <p>No orders found. <Link to="/orders/new">Create one now</Link></p>
      )}
    </div>
  );
}
