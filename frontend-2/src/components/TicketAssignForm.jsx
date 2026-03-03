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
      setError('');
      
      // Fetch staff members with STAFF or ADMIN role
      const res = await listAllUsers({ role: 'STAFF' }, token);
      let staffMembers = (res.content || []);
      
      // If response is empty or doesn't have staff, try fetching all users
      if (!staffMembers || staffMembers.length === 0) {
        const allUsersRes = await listAllUsers({}, token);
        staffMembers = (allUsersRes.content || []).filter((u) =>
          u.roles?.some(r => r === 'STAFF' || r === 'ROLE_STAFF' || r === 'ADMIN' || r === 'ROLE_ADMIN')
        );
      }
      
      setStaff(staffMembers);
    } catch (err) {
      console.error('Failed to fetch staff members:', err);
      setError('Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedStaffId) {
      setError('Please select a staff member');
      return;
    }
    onAssign(parseInt(selectedStaffId, 10));
  };

  if (loading) return <div className="assign-form"><p>Loading staff members...</p></div>;

  return (
    <div className="assign-form">
      <h4>Assign Ticket</h4>
      {error && <div className="error-message">{error}</div>}

      {staff.length > 0 ? (
        <>
          <div className="form-group">
            <label>Assign to:</label>
            <select
              value={selectedStaffId}
              onChange={(e) => {
                setSelectedStaffId(e.target.value);
                setError('');
              }}
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
        </>
      ) : (
        <p className="error-message">No staff members available</p>
      )}
    </div>
  );
}
