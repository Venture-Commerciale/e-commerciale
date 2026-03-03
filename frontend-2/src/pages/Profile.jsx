import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, loading } = useAuth();
  const [editMode, setEditMode] = useState(false);

  if (loading) return <p>Loading profile…</p>;
  if (!user) return <p>No profile data.</p>;

  const isAdmin = user.roles?.some(r => r === 'ADMIN' || r === 'ROLE_ADMIN');
  const isStaff = user.roles?.some(r => r === 'STAFF' || r === 'ROLE_STAFF');
  const isCustomer = user.roles?.some(r => r === 'CUSTOMER' || r === 'ROLE_CUSTOMER');

  return (
    <div className="card">
      <h2>My Profile</h2>
      
      <div className="profile-section">
        <h3>Account Information</h3>
        <div className="profile-info">
          <div className="info-row">
            <label>Name:</label>
            <span>{user.name || user.email}</span>
          </div>
          <div className="info-row">
            <label>Email:</label>
            <span>{user.email}</span>
          </div>
          <div className="info-row">
            <label>Account Status:</label>
            <span style={{
              padding: '4px 8px',
              borderRadius: '4px',
              background: user.status === 'ACTIVE' ? '#d5f4e6' : '#fadbd8',
              color: user.status === 'ACTIVE' ? '#27ae60' : '#c0392b',
            }}>
              {user.status || 'ACTIVE'}
            </span>
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h3>User Role & Permissions</h3>
        <div className="roles-list">
          {isAdmin && (
            <div className="role-badge admin">
              <strong>Administrator</strong>
              <p>Full system access and management</p>
            </div>
          )}
          {isStaff && (
            <div className="role-badge staff">
              <strong>Staff Member</strong>
              <p>Can manage orders, tickets, and customer data</p>
            </div>
          )}
          {isCustomer && (
            <div className="role-badge customer">
              <strong>Customer</strong>
              <p>Can create orders, tickets, and view invoices</p>
            </div>
          )}
          {(!isAdmin && !isStaff && !isCustomer) && (
            <p>No assigned roles</p>
          )}
        </div>
      </div>

      <div className="profile-section">
        <h3>Quick Links</h3>
        <ul>
          {isCustomer && (
            <>
              <li><a href="/orders">View My Orders</a></li>
              <li><a href="/tickets">View My Tickets</a></li>
              <li><a href="/invoices">View My Invoices</a></li>
            </>
          )}
          {(isAdmin || isStaff) && (
            <>
              <li><a href="/staff/customers">View Customers</a></li>
              <li><a href="/staff/orders">View All Orders</a></li>
              <li><a href="/staff/tickets">View All Tickets</a></li>
              <li><a href="/admin/invoices">View Invoices</a></li>
            </>
          )}
          {isAdmin && (
            <>
              <li><a href="/admin">Admin Dashboard</a></li>
            </>
          )}
        </ul>
      </div>

      <style jsx>{`
        .profile-section {
          margin: 20px 0;
          padding: 15px;
          background: #f9f9f9;
          border-radius: 4px;
          border-left: 4px solid #3498db;
        }

        .profile-section h3 {
          margin-top: 0;
          color: #222;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }

        .info-row label {
          font-weight: 600;
          color: #555;
          width: 120px;
        }

        .info-row span {
          color: #333;
        }

        .roles-list {
          display: grid;
          gap: 10px;
        }

        .role-badge {
          padding: 12px;
          border-radius: 4px;
          border-left: 4px solid;
        }

        .role-badge.admin {
          background: #fdeaed;
          border-color: #e74c3c;
        }

        .role-badge.admin strong {
          color: #c0392b;
        }

        .role-badge.staff {
          background: #e8f8f5;
          border-color: #27ae60;
        }

        .role-badge.staff strong {
          color: #27ae60;
        }

        .role-badge.customer {
          background: #fef9e7;
          border-color: #f39c12;
        }

        .role-badge.customer strong {
          color: #d68910;
        }

        .role-badge p {
          margin: 5px 0 0 0;
          font-size: 13px;
          color: #666;
        }

        .profile-section ul {
          list-style: none;
          padding: 0;
        }

        .profile-section li {
          padding: 8px;
          background: white;
          margin: 5px 0;
          border-left: 4px solid #3498db;
          border-radius: 0 4px 4px 0;
        }

        .profile-section a {
          color: #3498db;
          text-decoration: none;
        }

        .profile-section a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
