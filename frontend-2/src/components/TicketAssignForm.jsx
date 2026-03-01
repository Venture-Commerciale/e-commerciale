import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { listAllUsers } from '../api';
import './TicketAssignForm.css';

export default function TicketAssignForm({ ticket, onAssign, onCancel }) {
  const { token } = useAuth();
  const [staff, setStaff] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(ticket?.assignedToId || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStaffMembers();
  }, [token]);

  const fetchStaffMembers = async () => {
    try {
      setLoading(true);
      // Try to get staff members - this might need backend support
      const res = await listAllUsers({ role: 'STAFF' }, token).catch(() => 
        listAllUsers({}, token)
      );
      const allUsers = res.content || res.data || [];
      // Filter for staff members
      const staffMembers = allUsers.filter((u) =>
        u.roles?.includes('ROLE_STAFF') || u.roles?.includes('ROLE_ADMIN')
      );
      setStaff(staffMembers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedStaffId) {
      setError('Please select a staff member');
      return;
    }
    onAssign(parseInt(selectedStaffId));
  };

  if (loading) return <div>Loading staff members...</div>;

  return (
    <div className="assign-form">
      <h4>Assign Ticket</h4>
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>Assign to:</label>
        <select
          value={selectedStaffId}
          onChange={(e) => setSelectedStaffId(e.target.value)}
        >
          <option value="">-- Unassigned --</option>
          {staff.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name} ({member.email})
            </option>
          ))}
        </select>
      </div>

      <div className="form-buttons">
        <button onClick={handleSubmit}>Assign</button>
        <button onClick={onCancel} className="btn-cancel">
          Cancel
        </button>
      </div>
    </div>
  );
}
