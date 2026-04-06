import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await authAPI.signup(form);
    login({ id: res.userId, name: res.name, email: res.email }, res.token);
    navigate('/dashboard');
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2>Create account</h2>

        <form onSubmit={handleSubmit}>
          <input placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
          <input type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} />

          <button type="submit">Signup</button>
        </form>

        <Link to="/login">Login</Link>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  card: { padding: 30, border: '1px solid #ddd', borderRadius: 10 }
};