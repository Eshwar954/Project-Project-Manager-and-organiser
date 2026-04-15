import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { authAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login({ id: res.userId, name: res.name, email: res.email }, res.token);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.panel}>
        {/* Brand mark */}
        <div style={S.brand}>
          <div style={S.brandIcon}>P</div>
          <span style={S.brandName}>ProjectBoard</span>
        </div>

        <h1 style={S.heading}>Sign in to your account</h1>
        <p style={S.sub}>Welcome back — enter your credentials below.</p>

        {error && (
          <div style={S.alert} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={S.form}>
          <label style={S.label} htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
            style={S.input}
          />

          <label style={S.label} htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
            style={S.input}
          />

          <button id="login-submit" className="btn-primary w-full" type="submit" disabled={loading} style={S.btn}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={S.footer}>
          Don't have an account?{' '}
          <Link to="/signup" style={S.link}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

const S = {
  page: {
    minHeight: '100vh',
    background: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  panel: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: '40px 44px',
    width: '100%',
    maxWidth: 440,
    boxShadow: '0 2px 8px rgba(0,0,0,.08)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  brandIcon: {
    width: 36,
    height: 36,
    background: '#2563eb',
    color: '#fff',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 18,
  },
  brandName: {
    fontWeight: 700,
    fontSize: 18,
    color: '#0f172a',
  },
  heading: {
    fontSize: 22,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 6,
  },
  sub: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
  },
  alert: {
    background: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fca5a5',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 18,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    fontSize: 14,
    color: '#0f172a',
    background: '#fff',
    outline: 'none',
  },
  btn: {
    marginTop: 22,
    padding: '11px 20px',
    fontSize: 14,
    fontWeight: 600,
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    background: '#2563eb',
    color: '#fff',
    width: '100%',
  },
  footer: {
    textAlign: 'center',
    marginTop: 22,
    fontSize: 13,
    color: '#64748b',
  },
  link: {
    color: '#2563eb',
    fontWeight: 600,
  },
};