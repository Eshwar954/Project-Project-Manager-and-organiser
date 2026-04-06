import { useState, useEffect } from 'react';
import { taskAPI, projectAPI } from '../api/api';

export default function AddTaskForm({ projectId, onSuccess }) {
  const [form,    setForm]    = useState({ title: '', assignedTo: '' });
  const [members, setMembers] = useState([]);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    projectAPI.members(projectId).then(setMembers).catch(() => {});
  }, [projectId]);

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    setError(''); setLoading(true);
    try {
      await taskAPI.create(projectId, {
        title: form.title.trim(),
        assignedTo: form.assignedTo ? parseInt(form.assignedTo) : null,
      });
      setForm({ title: '', assignedTo: '' });
      if (onSuccess) onSuccess();
    } catch {
      setError('Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.box}>
      <h3 style={styles.title}>Create Task</h3>
      {error && <p style={styles.error}>{error}</p>}
      <div style={styles.row}>
        <input
          style={styles.input}
          placeholder="Task title"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />

        {/* Dropdown instead of typing user ID */}
        <select
          style={styles.select}
          value={form.assignedTo}
          onChange={e => setForm({ ...form, assignedTo: e.target.value })}
        >
          <option value="">Assign to...</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.email})
            </option>
          ))}
        </select>

        <button style={styles.btn} onClick={handleAdd} disabled={loading}>
          {loading ? 'Adding...' : 'Add Task'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  box:    { background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: '20px 24px', marginBottom: 20 },
  title:  { fontSize: 15, fontWeight: 600, marginBottom: 14, marginTop: 0 },
  row:    { display: 'flex', gap: 10, flexWrap: 'wrap' },
  input:  { flex: 1, minWidth: 160, padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 },
  select: { flex: 1, minWidth: 160, padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, background: '#fff' },
  btn:    { padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, whiteSpace: 'nowrap' },
  error:  { color: '#e53e3e', fontSize: 13, marginBottom: 10 },
};