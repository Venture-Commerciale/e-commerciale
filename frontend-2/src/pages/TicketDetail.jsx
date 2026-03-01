import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTicket, addComment } from '../api';
import { useAuth } from '../context/AuthContext';

export default function TicketDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getTicket(id, token)
      .then((res) => setTicket(res.data))
      .catch((e) => setError(e.message));
  }, [id, token]);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment) return;
    try {
      const res = await addComment(id, { text: comment }, token);
      setTicket((t) => ({ ...t, comments: [...(t.comments || []), res.data] }));
      setComment('');
    } catch (e) {
      setError(e.message);
    }
  };

  if (error) return <p className="error">{error}</p>;
  if (!ticket) return <p>Loading…</p>;

  return (
    <div className="card">
      <h2>Ticket #{ticket.id}</h2>
      <p>{ticket.title}</p>
      <p>Status: {ticket.status}</p>
      <h3>Comments</h3>
      <ul>
        {ticket.comments?.map((c) => (
          <li key={c.id}>{c.text}</li>
        ))}
      </ul>
      <form onSubmit={submitComment}>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button type="submit">Add Comment</button>
      </form>
    </div>
  );
}
