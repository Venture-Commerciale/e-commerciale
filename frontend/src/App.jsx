import React, { useState } from "react";
import { getMyOrders, getProducts, login } from "./api";

export default function App() {
  const [email, setEmail] = useState("customer@demo.com");
  const [password, setPassword] = useState("Password123");
  const [token, setToken] = useState("");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      const response = await login(email, password);
      setToken(response.data.accessToken);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadProducts = async () => {
    setError("");
    try {
      const response = await getProducts(token);
      setProducts(response.data.content || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadOrders = async () => {
    setError("");
    try {
      const response = await getMyOrders(token);
      setOrders(response.data.content || []);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Unified Business Platform</h1>
        <p>Simple React client for auth + orders</p>
      </header>

      <section className="card">
        <h2>Login</h2>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
        {token && <p className="success">Logged in</p>}
      </section>

      <section className="card">
        <h2>Products</h2>
        <button onClick={loadProducts}>Load products</button>
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              {product.name} - ${product.price}
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>My Orders</h2>
        <button onClick={loadOrders}>Load orders</button>
        <ul>
          {orders.map((order) => (
            <li key={order.id}>
              Order #{order.id} - {order.status} - ${order.total}
            </li>
          ))}
        </ul>
      </section>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
