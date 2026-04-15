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
      setSuccess(`${email} has been added to the project.`);
      setEmail('');
      if (onSuccess) onSuccess();
      setTimeout(() => setSuccess(''), 4000);
    } catch {
      setError('User not found or already a member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.box}>
      <h3 style={S.heading}>Add Team Member</h3>

      {error   && <div style={S.alertDanger}>{error}</div>}
      {success && <div style={S.alertSuccess}>{success}</div>}

      <div style={S.row}>
        <input
          id="add-member-email"
          style={S.input}
          type="email"
          placeholder="colleague@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <button id="add-member-submit" style={S.btn} onClick={handleAdd} disabled={loading}>
          {loading ? 'Adding…' : 'Add'}
        </button>
      </div>
    </div>
  );
}

const S = {
  box: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    padding: '20px 24px',
    marginBottom: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,.06)',
  },
  heading: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 14,
    marginTop: 0,
  },
  alertDanger: {
    background: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fca5a5',
    borderRadius: 7,
    padding: '8px 12px',
    fontSize: 13,
    marginBottom: 12,
  },
  alertSuccess: {
    background: '#dcfce7',
    color: '#15803d',
    border: '1px solid #86efac',
    borderRadius: 7,
    padding: '8px 12px',
    fontSize: 13,
    marginBottom: 12,
  },
  row: { display: 'flex', gap: 10 },
  input: {
    flex: 1,
    padding: '10px 14px',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    fontSize: 14,
    color: '#0f172a',
    background: '#fff',
    outline: 'none',
  },
  btn: {
    padding: '10px 18px',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
};