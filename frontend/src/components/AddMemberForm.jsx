import { useState } from 'react';
import { projectAPI } from '../api/api';

export default function AddMemberForm({ projectId, onSuccess }) {
  const [email,   setEmail]   = useState('');
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!email.trim()) return;
    setError(''); setSuccess(''); setLoading(true);
    try {
      await projectAPI.addMember(projectId, email.trim());
      setSuccess(`${email} added!`);
      setEmail('');
      if (onSuccess) onSuccess();
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('User not found or already a member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.box}>
      <h3 style={styles.title}>Add Member</h3>
      {error   && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}
      <div style={styles.row}>
        <input
          style={styles.input}
          type="email"
          placeholder="Member's email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <button style={styles.btn} onClick={handleAdd} disabled={loading}>
          {loading ? 'Adding...' : 'Add'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  box:     { background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: '20px 24px', marginBottom: 20 },
  title:   { fontSize: 15, fontWeight: 600, marginBottom: 14, marginTop: 0 },
  row:     { display: 'flex', gap: 10 },
  input:   { flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 },
  btn:     { padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
  error:   { color: '#e53e3e', fontSize: 13, marginBottom: 10 },
  success: { color: '#16a34a', fontSize: 13, marginBottom: 10 },
};