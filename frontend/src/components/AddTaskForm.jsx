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
      setError('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.box}>
      <h3 style={S.heading}>Create Task</h3>

      {error && <div style={S.alertDanger}>{error}</div>}

      <div style={S.fieldsCol}>
        <input
          id="task-title"
          style={S.input}
          placeholder="Task title"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />

        <div style={S.row}>
          <select
            id="task-assign"
            style={{ ...S.input, flex: 1 }}
            value={form.assignedTo}
            onChange={e => setForm({ ...form, assignedTo: e.target.value })}
          >
            <option value="">Assign to (optional)…</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.email}
              </option>
            ))}
          </select>

          <button id="add-task-submit" style={S.btn} onClick={handleAdd} disabled={loading}>
            {loading ? 'Adding…' : 'Add Task'}
          </button>
        </div>
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
  fieldsCol: { display: 'flex', flexDirection: 'column', gap: 10 },
  row: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  input: {
    padding: '10px 14px',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    fontSize: 14,
    color: '#0f172a',
    background: '#fff',
    outline: 'none',
    width: '100%',
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