import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading profile…</p>;
  if (!user) return <p>No profile data.</p>;

  return (
    <div className="card">
      <h2>My Profile</h2>
      <p>Name: {user.name || user.email}</p>
      <p>Email: {user.email}</p>
      <p>Roles: {user.roles?.join(', ')}</p>
    </div>
  );
}
