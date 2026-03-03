import React, { useState, useEffect } from 'react';
import { listTickets } from '../api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Tickets() {
  const { token, isStaff } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    listTickets({ page, size: pageSize }, token)
      .then((res) => {
        setTickets(res.content || []);
        setTotalElements(res.totalElements || 0);
      })
      .catch((e) => setError(e.message));
  }, [token, page, pageSize]);

  const totalPages = Math.ceil(totalElements / pageSize);
  const hasNextPage = page < totalPages - 1;
  const hasPrevPage = page > 0;

  return (
    <div className="card">
      <h2>{isStaff() ? 'All Support Tickets' : 'Support Tickets'}</h2>
      {isStaff() && (
        <Link to="/staff">
          <button>Staff Panel</button>
        </Link>
      )}
      <Link to="/tickets/new">
        <button>New Ticket</button>
      </Link>
      {error && <p className="error">{error}</p>}
      
      {tickets.length > 0 ? (
        <>
          <ul>
            {tickets.map((t) => (
              <li key={t.id}>
                <Link to={`/tickets/${t.id}`}>#{t.id}</Link> – {t.status} – {t.subject || t.title}
              </li>
            ))}
          </ul>
          
          <div className="pagination">
            <button 
              onClick={() => setPage(p => p - 1)} 
              disabled={!hasPrevPage}
            >
              ← Previous
            </button>
            <span>Page {page + 1} of {totalPages || 1} (Total: {totalElements})</span>
            <button 
              onClick={() => setPage(p => p + 1)} 
              disabled={!hasNextPage}
            >
              Next →
            </button>
          </div>
        </>
      ) : (
        <p>No tickets found. <Link to="/tickets/new">Create one now</Link></p>
      )}
    </div>
  );
}
