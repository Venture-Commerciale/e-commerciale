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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setError('');
    listProducts(0, 100, token)
      .then((res) => setProducts(res.content || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const items = Object.entries(selected)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ productId: parseInt(id), quantity: qty }));
    
    if (items.length === 0) {
      setError('Please select at least one product');
      return;
    }

    // Validate quantities against stock
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (product && item.quantity > product.stock) {
        setError(`Cannot order ${item.quantity} units of ${product.name}. Available: ${product.stock}`);
        return;
      }
    }

    try {
      setSubmitting(true);
      await createOrder({ items }, token);
      navigate('/orders');
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotal = () => {
    return Object.entries(selected)
      .reduce((sum, [id, qty]) => {
        const product = products.find(p => p.id === parseInt(id));
        return sum + (product ? product.price * qty : 0);
      }, 0)
      .toFixed(2);
  };

  const selectedCount = Object.values(selected).reduce((sum, qty) => sum + qty, 0);

  if (loading) return <p>Loading products...</p>;

  return (
    <div className="card">
      <h2>Place New Order</h2>
      {error && <p className="error">{error}</p>}
      
      {products.length > 0 ? (
        <form onSubmit={handleSubmit}>
          <div className="products-grid">
            {products.map((p) => {
              const qty = selected[p.id] || 0;
              const isOutOfStock = p.stock <= 0;
              
              return (
                <div key={p.id} className="product-item" style={{
                  opacity: isOutOfStock ? 0.6 : 1,
                  border: '1px solid #ddd',
                  padding: '10px',
                  borderRadius: '4px',
                  marginBottom: '10px'
                }}>
                  <div>
                    <strong>{p.name}</strong>
                    <p>${p.price.toFixed(2)}</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>
                      Stock: <span style={{ 
                        fontWeight: 'bold',
                        color: isOutOfStock ? '#c0392b' : '#27ae60'
                      }}>
                        {p.stock}
                      </span>
                    </p>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={p.stock}
                    value={qty}
                    disabled={isOutOfStock}
                    onChange={(e) =>
                      setSelected({
                        ...selected,
                        [p.id]: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    placeholder="Qty"
                    style={{ width: '60px' }}
                  />
                </div>
              );
            })}
          </div>

          {selectedCount > 0 && (
            <div className="order-summary" style={{
              background: '#f0f0f0',
              padding: '15px',
              borderRadius: '4px',
              margin: '15px 0'
            }}>
              <h3 style={{ margin: '0 0 10px 0' }}>Order Summary</h3>
              <p><strong>Items Selected:</strong> {selectedCount}</p>
              <p><strong>Total:</strong> ${calculateTotal()}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={selectedCount === 0 || submitting}
            style={{ marginTop: '15px' }}
          >
            {submitting ? 'Creating Order...' : 'Create Order'}
          </button>
        </form>
      ) : (
        <p>No products available. Check back later!</p>
      )}
    </div>
  );
}
