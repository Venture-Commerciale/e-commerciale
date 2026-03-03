import React, { useState, useEffect } from 'react';
import { listProducts } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Products() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    listProducts(0, 50, token)
      .then((res) => setProducts(res.content || []))
      .catch((e) => setError(e.message));
  }, [token]);

  return (
    <div className="card">
      <h2>Products</h2>
      {error && <p className="error">{error}</p>}
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.name} - ${p.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
