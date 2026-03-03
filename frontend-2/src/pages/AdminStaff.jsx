import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStaffMembers, createUser } from '../api';

export default function AdminStaff() {
  const { token } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await getStaffMembers(token);
      // assume this returns a page-like object or array
      setStaff(res.content || res || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      await createUser({ name, email, password, role: 'STAFF' }, token);
      setFormSuccess('Staff member created');
      setName('');
      setEmail('');
      setPassword('');
      fetchStaff();
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div className="admin-staff">
      <h2>Staff Members</h2>
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Add New Staff</h3>
      <form onSubmit={handleSubmit} className="staff-form">
        <div>
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create Staff</button>
        {formError && <p className="error">{formError}</p>}
        {formSuccess && <p className="success">{formSuccess}</p>}
      </form>
    </div>
  );
}
