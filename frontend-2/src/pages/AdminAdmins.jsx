import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAdminMembers, createUser } from '../api';

export default function AdminAdmins() {
  const { token } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await getAdminMembers(token);
      // assume this returns a page-like object or array
      setAdmins(res.content || res || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      await createUser({ name, email, password, role: 'ADMIN' }, token);
      setFormSuccess('Admin created');
      setName('');
      setEmail('');
      setPassword('');
      fetchAdmins();
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div className="admin-admins">
      <h2>Admin Members</h2>
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
            {admins.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Add New Admin</h3>
      <form onSubmit={handleSubmit} className="admin-form">
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
        <button type="submit">Create Admin</button>
        {formError && <div className="error-message">{formError}</div>}
        {formSuccess && <div className="success-message">{formSuccess}</div>}
      </form>
    </div>
  );
}
