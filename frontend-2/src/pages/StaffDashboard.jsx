import React from 'react';
import { Link } from 'react-router-dom';

export default function StaffDashboard() {
  return (
    <div className="staff-dashboard">
      <h2>Staff Dashboard</h2>
      <div className="staff-overview">
        <ul>
          <li><Link to="/staff/customers">Manage Customers</Link> - Browse and inspect customers</li>
          <li><Link to="/staff/orders">Manage All Orders</Link> - View and update order statuses</li>
          <li><Link to="/staff/tickets">Manage All Tickets</Link> - Assign and update ticket details</li>
          <li><Link to="/admin/invoices">View Invoices</Link> - Monitor billing information</li>
        </ul>
      </div>
    </div>
  );
}