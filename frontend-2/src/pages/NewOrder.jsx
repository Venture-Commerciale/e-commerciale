import React, { useState, useEffect } from 'react';
import { listProducts, createOrder } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function NewOrder() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    listProducts(0, 50, token)
      .then((res) => setProducts(res.data.content || []))
      .catch((e) => setError(e.message));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const items = Object.entries(selected)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ productId: id, quantity: qty }));
    if (items.length === 0) return;
    try {
      await createOrder({ items }, token);
      navigate('/orders');
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="card">
      <h2>Place New Order</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        {products.map((p) => (
          <div key={p.id}>
            <span>{p.name} (${p.price})</span>
            <input
              type="number"
              min="0"
              value={selected[p.id] || 0}
              onChange={(e) =>
                setSelected({
                  ...selected,
                  [p.id]: parseInt(e.target.value, 10) || 0,
                })
              }
            />
          </div>
        ))}
        <button type="submit">Submit Order</button>
      </form>
    </div>
  );
}
