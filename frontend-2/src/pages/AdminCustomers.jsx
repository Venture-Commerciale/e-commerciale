import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCustomerList } from '../api';
import { useNavigate } from 'react-router-dom';

export default function AdminCustomers() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    getCustomerList({ page, size: pageSize }, token)
      .then(res => {
        setCustomers(res.content || []);
        setTotalElements(res.totalElements || 0);
      })
      .catch(err => { console.error(err); setError(err.message || String(err)); })
      .finally(() => setLoading(false));
  }, [token, page, pageSize]);

  const totalPages = Math.ceil(totalElements / pageSize);
  const hasNextPage = page < totalPages - 1;
  const hasPrevPage = page > 0;

  const handleRowClick = (id) => {
    navigate(`/admin/customers/${id}`);
  };

  if (loading) return <p>Loading customers...</p>;
  return (
    <div className="admin-customers">
      <h2>All Customers</h2>
      {error && <div className="error-message">{error}</div>}
      {customers.length > 0 ? (
        <>
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
          
          <div className="pagination">
            <button onClick={() => setPage(p => p - 1)} disabled={!hasPrevPage}>← Previous</button>
            <span>Page {page + 1} of {totalPages || 1} (Total: {totalElements})</span>
            <button onClick={() => setPage(p => p + 1)} disabled={!hasNextPage}>Next →</button>
          </div>
        </>
      ) : (
        <p>No customers found.</p>
      )}
    </div>
  );
}
