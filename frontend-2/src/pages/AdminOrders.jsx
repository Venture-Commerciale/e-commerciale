import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { listOrders, updateOrderStatus } from '../api';
import { bulkUpdateOrderStatuses } from '../utils/bulkOperations';
import './AdminOrders.css';

export default function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [bulkStatus, setBulkStatus] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');

  const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

  useEffect(() => {
    fetchOrders();
  }, [token]);

  useEffect(() => {
    let filtered = orders;

    if (statusFilter) {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    if (searchCustomer) {
      filtered = filtered.filter((o) =>
        o.customerName?.toLowerCase().includes(searchCustomer.toLowerCase()) ||
        o.customerId?.toString().includes(searchCustomer)
      );
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchCustomer]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await listOrders({}, token);
      setOrders(res.content || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await updateOrderStatus(orderId, newStatus, token);
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSelectOrder = (orderId) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map((o) => o.id)));
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedOrders.size === 0) {
      setError('Please select orders and a status');
      return;
    }

    try {
      setUpdatingId('bulk');
      const results = await bulkUpdateOrderStatuses(
        Array.from(selectedOrders),
        bulkStatus,
        (orderId, status) => updateOrderStatus(orderId, status, token)
      );

      setOrders(
        orders.map((o) =>
          results.success.includes(o.id) ? { ...o, status: bulkStatus } : o
        )
      );

      setError(
        `Updated ${results.success.length} orders${
          results.failed.length > 0 ? `, ${results.failed.length} failed` : ''
        }`
      );
      setSelectedOrders(new Set());
      setBulkStatus('');
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="admin-orders">
      <h2>Manage All Orders</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="filters">
        <input
          type="text"
          placeholder="Search by customer name or ID"
          value={searchCustomer}
          onChange={(e) => setSearchCustomer(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {selectedOrders.size > 0 && (
        <div className="bulk-actions">
          <p>Selected: {selectedOrders.size} order(s)</p>
          <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>
            <option value="">Choose new status...</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            onClick={handleBulkStatusUpdate}
            disabled={updatingId === 'bulk' || !bulkStatus}
          >
            {updatingId === 'bulk' ? 'Updating...' : 'Update Selected'}
          </button>
        </div>
      )}

      <table className="orders-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                onChange={handleSelectAll}
              />
            </th>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length === 0 ? (
            <tr>
              <td colSpan="5">No orders found</td>
            </tr>
          ) : (
            filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedOrders.has(order.id)}
                    onChange={() => handleSelectOrder(order.id)}
                  />
                </td>
                <td>#{order.id}</td>
                <td>{order.customerId}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    disabled={updatingId === order.id}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  {updatingId === order.id && <span>Updating...</span>}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <p className="count">Total: {filteredOrders.length} order(s)</p>
    </div>
  );
}
