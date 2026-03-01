import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { listOrders, listTickets } from '../api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalTickets: 0,
    pendingOrders: 0,
    openTickets: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [ordersRes, ticketsRes] = await Promise.all([
          listOrders({}, token),
          listTickets({}, token),
        ]);

        const orders = ordersRes.content || [];
        const tickets = ticketsRes.content || [];

        setStats({
          totalOrders: orders.length,
          totalTickets: tickets.length,
          pendingOrders: orders.filter((o) => o.status === 'PENDING').length,
          openTickets: tickets.filter((t) => t.status === 'OPEN').length,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      {error && <div className="error-message">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-number">{stats.totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Orders</h3>
          <p className="stat-number">{stats.pendingOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Total Tickets</h3>
          <p className="stat-number">{stats.totalTickets}</p>
        </div>
        <div className="stat-card">
          <h3>Open Tickets</h3>
          <p className="stat-number">{stats.openTickets}</p>
        </div>
      </div>

      <div className="admin-overview">
        <h3>Quick Actions</h3>
        <ul>
          <li><a href="/admin/orders">Manage All Orders</a> - View and update order statuses</li>
          <li><a href="/admin/tickets">Manage All Tickets</a> - Assign and update ticket details</li>
          <li><a href="/admin/invoices">View Invoices</a> - Monitor billing information</li>
        </ul>
      </div>
    </div>
  );
}
