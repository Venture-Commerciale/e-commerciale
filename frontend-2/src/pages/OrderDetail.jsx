import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrder } from '../api';
import { useAuth } from '../context/AuthContext';

export default function OrderDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    getOrder(id, token)
      .then((res) => setOrder(res.data))
      .catch((e) => setError(e.message));
  }, [id, token]);

  if (error) return <p className="error">{error}</p>;
  if (!order) return <p>Loading…</p>;

  return (
    <div className="card">
      <h2>Order #{order.id}</h2>
      <p>Status: {order.status}</p>
      <p>Total: ${order.total}</p>
      {/* more details as needed */}
    </div>
  );
}
