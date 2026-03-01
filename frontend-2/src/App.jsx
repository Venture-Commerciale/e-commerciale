import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Products from './pages/Products';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import NewOrder from './pages/NewOrder';
import Invoices from './pages/Invoices';
import Tickets from './pages/Tickets';
import TicketDetail from './pages/TicketDetail';
import NewTicket from './pages/NewTicket';

import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminTickets from './pages/AdminTickets';
import AdminInvoices from './pages/AdminInvoices';

import StaffDashboard from './pages/StaffDashboard';
import StaffCustomers from './pages/StaffCustomers';
import StaffCustomerDetail from './pages/StaffCustomerDetail';

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { token, isAdmin } = useAuth();
  return token && isAdmin() ? children : <Navigate to="/products" replace />;
}

function StaffRoute({ children }) {
  const { token, isStaff } = useAuth();
  return token && isStaff() ? children : <Navigate to="/products" replace />;
}

export default function App() {
  const { token, logout, isAdmin, isStaff } = useAuth();

  return (
    <div className="app">
      <header>
        <h1>Unified Business Platform</h1>
        <nav>
          {isAdmin() && (
            <>
              <Link to="/admin">Admin</Link>
              <Link to="/admin/orders">All Orders</Link>
              <Link to="/admin/tickets">All Tickets</Link>
              <Link to="/admin/invoices">Invoices</Link>
              <span style={{color: '#666'}}>|</span>
            </>
          )}
          {(isAdmin() || isStaff()) && (
            <>
              <Link to="/staff">Staff</Link>
              <Link to="/staff/customers">Customers</Link>
              <Link to="/staff/orders">All Orders</Link>
              <Link to="/staff/tickets">All Tickets</Link>
              <Link to="/admin/invoices">Invoices</Link>
              <span style={{color: '#666'}}>|</span>
            </>
          )}
          <Link to="/products">Products</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/tickets">Tickets</Link>
          {token ? (
            <>
              <Link to="/profile">Profile</Link>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/profile"
            element={<PrivateRoute><Profile /></PrivateRoute>}
          />
          <Route
            path="/products"
            element={<PrivateRoute><Products /></PrivateRoute>}
          />
          <Route
            path="/orders"
            element={<PrivateRoute><Orders /></PrivateRoute>}
          />
          <Route
            path="/orders/new"
            element={<PrivateRoute><NewOrder /></PrivateRoute>}
          />
          <Route
            path="/orders/:id"
            element={<PrivateRoute><OrderDetail /></PrivateRoute>}
          />
          <Route
            path="/invoices"
            element={<PrivateRoute><Invoices /></PrivateRoute>}
          />
          <Route
            path="/tickets"
            element={<PrivateRoute><Tickets /></PrivateRoute>}
          />
          <Route
            path="/tickets/new"
            element={<PrivateRoute><NewTicket /></PrivateRoute>}
          />
          <Route
            path="/tickets/:id"
            element={<PrivateRoute><TicketDetail /></PrivateRoute>}
          />
          <Route
            path="/admin"
            element={<AdminRoute><AdminDashboard /></AdminRoute>}
          />
          <Route
            path="/admin/orders"
            element={<AdminRoute><AdminOrders /></AdminRoute>}
          />
          <Route
            path="/admin/tickets"
            element={<AdminRoute><AdminTickets /></AdminRoute>}
          />
          <Route
            path="/admin/invoices"
            element={<AdminRoute><AdminInvoices /></AdminRoute>}
          />
          <Route
            path="/staff"
            element={<StaffRoute><StaffDashboard /></StaffRoute>}
          />
          <Route
            path="/staff/customers"
            element={<StaffRoute><StaffCustomers /></StaffRoute>}
          />
          <Route
            path="/staff/customers/:id"
            element={<StaffRoute><StaffCustomerDetail /></StaffRoute>}
          />
          <Route
            path="/staff/orders"
            element={<StaffRoute><AdminOrders /></StaffRoute>}
          />
          <Route
            path="/staff/tickets"
            element={<StaffRoute><AdminTickets /></StaffRoute>}
          />
          <Route path="/*" element={<Navigate to="/products" replace />} />
        </Routes>
      </main>
    </div>
  );
}
