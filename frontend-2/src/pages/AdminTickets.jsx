import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { listTickets, updateTicket } from '../api';
import { bulkAssignTickets, bulkUpdateTicketStatus } from '../utils/bulkOperations';
import TicketAssignForm from '../components/TicketAssignForm';
import './AdminTickets.css';

export default function AdminTickets() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTickets, setSelectedTickets] = useState(new Set());
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [showAssignForm, setShowAssignForm] = useState(null);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkValue, setBulkValue] = useState('');
  const [searchText, setSearchText] = useState('');

  const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  useEffect(() => {
    fetchTickets();
  }, [token]);

  useEffect(() => {
    let filtered = tickets;

    if (statusFilter) {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    if (priorityFilter) {
      filtered = filtered.filter((t) => t.priority === priorityFilter);
    }

    if (searchText) {
      filtered = filtered.filter((t) =>
        t.subject?.toLowerCase().includes(searchText.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        t.id?.toString().includes(searchText)
      );
    }

    setFilteredTickets(filtered);
  }, [tickets, statusFilter, priorityFilter, searchText]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await listTickets({}, token);
      setTickets(res.content || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      setUpdatingId(ticketId);
      await updateTicket(ticketId, { status: newStatus }, token);
      setTickets(
        tickets.map((t) =>
          t.id === ticketId ? { ...t, status: newStatus } : t
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePriorityUpdate = async (ticketId, newPriority) => {
    try {
      setUpdatingId(ticketId);
      await updateTicket(ticketId, { priority: newPriority }, token);
      setTickets(
        tickets.map((t) =>
          t.id === ticketId ? { ...t, priority: newPriority } : t
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAssign = async (ticketId, staffId) => {
    try {
      setUpdatingId(ticketId);
      await updateTicket(ticketId, { assignedToId: staffId }, token);
      setTickets(
        tickets.map((t) =>
          t.id === ticketId ? { ...t, assignedToId: staffId } : t
        )
      );
      setShowAssignForm(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSelectTicket = (ticketId) => {
    const newSelected = new Set(selectedTickets);
    if (newSelected.has(ticketId)) {
      newSelected.delete(ticketId);
    } else {
      newSelected.add(ticketId);
    }
    setSelectedTickets(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTickets.size === filteredTickets.length) {
      setSelectedTickets(new Set());
    } else {
      setSelectedTickets(new Set(filteredTickets.map((t) => t.id)));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || !bulkValue || selectedTickets.size === 0) {
      setError('Please select tickets and an action');
      return;
    }

    try {
      setUpdatingId('bulk');
      let results;

      if (bulkAction === 'status') {
        results = await bulkUpdateTicketStatus(
          Array.from(selectedTickets),
          bulkValue,
          (ticketId, data) => updateTicket(ticketId, data, token)
        );
        setTickets(
          tickets.map((t) =>
            results.success.includes(t.id) ? { ...t, status: bulkValue } : t
          )
        );
      } else if (bulkAction === 'priority') {
        results = await bulkUpdateTicketStatus(
          Array.from(selectedTickets),
          bulkValue,
          (ticketId, data) => updateTicket(ticketId, { priority: bulkValue }, token)
        );
        setTickets(
          tickets.map((t) =>
            results.success.includes(t.id) ? { ...t, priority: bulkValue } : t
          )
        );
      }

      setError(
        `Updated ${results.success.length} tickets${
          results.failed.length > 0 ? `, ${results.failed.length} failed` : ''
        }`
      );
      setSelectedTickets(new Set());
      setBulkAction('');
      setBulkValue('');
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div>Loading tickets...</div>;

  return (
    <div className="admin-tickets">
      <h2>Manage All Tickets</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="filters">
        <input
          type="text"
          placeholder="Search by ID, subject, or description"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {TICKET_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">All Priorities</option>
          {PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
      </div>

      {selectedTickets.size > 0 && (
        <div className="bulk-actions">
          <p>Selected: {selectedTickets.size} ticket(s)</p>
          <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)}>
            <option value="">Choose action...</option>
            <option value="status">Update Status</option>
            <option value="priority">Update Priority</option>
          </select>

          {bulkAction === 'status' && (
            <select value={bulkValue} onChange={(e) => setBulkValue(e.target.value)}>
              <option value="">Choose status...</option>
              {TICKET_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          )}

          {bulkAction === 'priority' && (
            <select value={bulkValue} onChange={(e) => setBulkValue(e.target.value)}>
              <option value="">Choose priority...</option>
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleBulkAction}
            disabled={updatingId === 'bulk' || !bulkValue}
          >
            {updatingId === 'bulk' ? 'Updating...' : 'Apply to Selected'}
          </button>
        </div>
      )}

      <table className="tickets-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedTickets.size === filteredTickets.length && filteredTickets.length > 0}
                onChange={handleSelectAll}
              />
            </th>
            <th>ID</th>
            <th>Subject</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Assigned To</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTickets.length === 0 ? (
            <tr>
              <td colSpan="7">No tickets found</td>
            </tr>
          ) : (
            filteredTickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedTickets.has(ticket.id)}
                    onChange={() => handleSelectTicket(ticket.id)}
                  />
                </td>
                <td>#{ticket.id}</td>
                <td>{ticket.subject}</td>
                <td>
                  <select
                    value={ticket.status || ''}
                    onChange={(e) => handleStatusUpdate(ticket.id, e.target.value)}
                    disabled={updatingId === ticket.id}
                  >
                    {TICKET_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={ticket.priority || ''}
                    onChange={(e) => handlePriorityUpdate(ticket.id, e.target.value)}
                    disabled={updatingId === ticket.id}
                  >
                    {PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  {ticket.assignedToId ? (
                    <span>{ticket.assignedToId}</span>
                  ) : (
                    <span className="unassigned">Unassigned</span>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => setShowAssignForm(ticket.id)}
                    className="btn-small"
                    disabled={updatingId === ticket.id}
                  >
                    Assign
                  </button>
                  {updatingId === ticket.id && <span>Updating...</span>}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showAssignForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <TicketAssignForm
              ticket={tickets.find((t) => t.id === showAssignForm)}
              onAssign={(staffId) => handleAssign(showAssignForm, staffId)}
              onCancel={() => setShowAssignForm(null)}
            />
          </div>
        </div>
      )}

      <p className="count">Total: {filteredTickets.length} ticket(s)</p>
    </div>
  );
}
