import React, { useState, useEffect } from 'react';
import { listOrders } from '../api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Orders() {
  const { token, isStaff } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    listOrders({}, token)
      .then((res) => setOrders(res.data.content || []))
      .catch((e) => setError(e.message));
  }, [token]);

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
      <ul>
        {orders.map((o) => (
          <li key={o.id}>
            <Link to={`/orders/${o.id}`}>Order #{o.id}</Link> – {o.status} – ${o.total}
          </li>
        ))}
      </ul>
    </div>
  );
}
