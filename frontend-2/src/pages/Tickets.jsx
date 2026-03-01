import React, { useState, useEffect } from 'react';
import { listTickets } from '../api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Tickets() {
  const { token, isStaff } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    listTickets({}, token)
      .then((res) => setTickets(res.data.content || []))
      .catch((e) => setError(e.message));
  }, [token]);

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
      <ul>
        {tickets.map((t) => (
          <li key={t.id}>
            <Link to={`/tickets/${t.id}`}>#{t.id}</Link> – {t.status} – {t.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
