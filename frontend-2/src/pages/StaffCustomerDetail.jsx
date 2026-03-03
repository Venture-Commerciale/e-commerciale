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
      .then(res => setUser(res))
      .catch(console.error);
    listOrders({ customerId: id, page: 0, size: 20 }, token)
      .then(res => setOrders(res.content || []))
      .catch(console.error);
    listTickets({ customerId: id, page: 0, size: 20 }, token)
      .then(res => setTickets(res.content || []))
      .catch(console.error);
  }, [id, token]);

  if (!user) return <p>Loading customer...</p>;
  return (
    <div className="staff-customer-detail">
      <h2>Customer: {user.name}</h2>
      <p>Email: {user.email}</p>
      <p>Status: {user.status}</p>
      <h3>Orders ({orders.length})</h3>
      {orders.length > 0 ? (
        <ul>
          {orders.map(o => (
            <li key={o.id}>Order #{o.id} - {o.status} - ${o.total}</li>
          ))}
        </ul>
      ) : (
        <p>No orders</p>
      )}
      <h3>Tickets ({tickets.length})</h3>
      {tickets.length > 0 ? (
        <ul>
          {tickets.map(t => (
            <li key={t.id}>Ticket #{t.id} - {t.status} - {t.subject || t.title}</li>
          ))}
        </ul>
      ) : (
        <p>No tickets</p>
      )}
    </div>
  );
}