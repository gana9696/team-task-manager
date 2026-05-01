import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a', // 🔥 DARK BLUE BACKGROUND
      padding: 20
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{
            fontSize: 38,
            fontWeight: '800',
            color: '#3b82f6', // 🔵 BLUE
            marginBottom: 6
          }}>
            ⚡ TeamTask
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>
            Smart Team Management Platform
          </p>
        </div>

        {/* CARD */}
        <div style={{
          background: '#1e293b', // 🔥 DARK CARD
          padding: 28,
          borderRadius: 16,
          boxShadow: '0 12px 30px rgba(0,0,0,0.5)'
        }}>

          <h2 style={{
            textAlign: 'center',
            marginBottom: 20,
            fontSize: 22,
            fontWeight: '600',
            color: '#e2e8f0'
          }}>
            Welcome Back 👋
          </h2>

          <form onSubmit={handleSubmit}>

            {/* EMAIL */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: '#cbd5f5' }}>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  marginTop: 6,
                  borderRadius: 10,
                  border: '1px solid #334155',
                  background: '#0f172a',
                  color: '#fff',
                  fontSize: 14,
                  outline: 'none'
                }}
              />
            </div>

            {/* PASSWORD */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: '#cbd5f5' }}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  marginTop: 6,
                  borderRadius: 10,
                  border: '1px solid #334155',
                  background: '#0f172a',
                  color: '#fff',
                  fontSize: 14,
                  outline: 'none'
                }}
              />
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 10,
                border: 'none',
                background: '#3b82f6', // 🔵 PRIMARY BLUE
                color: '#fff',
                fontWeight: '600',
                fontSize: 15,
                cursor: 'pointer'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>

          </form>

          {/* REGISTER LINK */}
          <p style={{
            textAlign: 'center',
            marginTop: 18,
            fontSize: 13,
            color: '#94a3b8'
          }}>
            No account?{' '}
            <Link to="/register" style={{ color: '#3b82f6', fontWeight: 600 }}>
              Register here
            </Link>
          </p>
        </div>

        {/* INFO BOX */}
        <div style={{
          marginTop: 18,
          padding: 14,
          background: '#1e3a8a',
          borderRadius: 10,
          border: '1px solid #2563eb'
        }}>
          <p style={{ fontSize: 12, color: '#bfdbfe', marginBottom: 4 }}>
            💡 Demo Accounts:
          </p>
          <p style={{ fontSize: 12, color: '#bfdbfe' }}>
            Register as <strong>admin</strong> to create projects & tasks
          </p>
          <p style={{ fontSize: 12, color: '#bfdbfe' }}>
            Register as <strong>member</strong> to view & submit tasks
          </p>
        </div>

      </div>
    </div>
  );
}