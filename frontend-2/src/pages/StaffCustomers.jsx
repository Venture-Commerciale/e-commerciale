import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { listAllUsers } from '../api';
import { useNavigate } from 'react-router-dom';

export default function StaffCustomers() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    listAllUsers({ role: 'CUSTOMER', page: 0, size: 50 }, token)
      .then(res => setCustomers(res.data.content))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  const handleRowClick = (id) => {
    navigate(`/staff/customers/${id}`);
  };

  if (loading) return <p>Loading customers...</p>;
  return (
    <div className="staff-customers">
      <h2>Customers</h2>
      <table>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Status</th></tr>
        </thead>
        <tbody>
          {customers.map(c => (
            <tr key={c.id} onClick={() => handleRowClick(c.id)} style={{cursor: 'pointer'}}>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}