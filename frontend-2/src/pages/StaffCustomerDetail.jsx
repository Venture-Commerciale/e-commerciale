import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUser, listOrders, listTickets } from '../api';

export default function StaffCustomerDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    if (!id) return;
    getUser(id, token)
      .then(res => setUser(res.data))
      .catch(console.error);
    listOrders({ customerId: id }, token)
      .then(res => setOrders(res.data.content))
      .catch(console.error);
    listTickets({ customerId: id }, token)
      .then(res => setTickets(res.data.content))
      .catch(console.error);
  }, [id, token]);

  if (!user) return <p>Loading customer...</p>;
  return (
    <div className="staff-customer-detail">
      <h2>Customer: {user.name}</h2>
      <p>Email: {user.email}</p>
      <p>Status: {user.status}</p>
      <h3>Orders</h3>
      <ul>
        {orders.map(o => (
          <li key={o.id}>Order #{o.id} - {o.status} - ${o.total}</li>
        ))}
      </ul>
      <h3>Tickets</h3>
      <ul>
        {tickets.map(t => (
          <li key={t.id}>Ticket #{t.id} - {t.status} - {t.subject}</li>
        ))}
      </ul>
    </div>
  );
}