import { taskAPI } from '../api/api';

export default function TaskCard({ task, members = [], onUpdate }) {
  const handleComplete = async () => {
    try {
      await taskAPI.complete(task.id);
      if (onUpdate) onUpdate();
    } catch {
      alert('Failed to complete task');
    }
  };

  const assignee = members.find(m => m.id === task.assignedTo);

  return (
    <div style={{
      ...S.card,
      background:  task.completed ? '#f0fdf4' : '#ffffff',
      borderColor: task.completed ? '#86efac' : '#e2e8f0',
    }}>
      <div style={S.left}>
        <span style={{
          ...S.title,
          textDecoration: task.completed ? 'line-through' : 'none',
          color:          task.completed ? '#94a3b8'      : '#0f172a',
        }}>
          {task.title}
        </span>
        <span style={S.meta}>
          {assignee ? `Assigned to ${assignee.name}` : 'Unassigned'}
        </span>
      </div>

      <div>
        {task.completed ? (
          <span style={S.doneBadge}>✓ Done</span>
        ) : (
          <button style={S.btn} onClick={handleComplete}>
            Mark Done
          </button>
        )}
      </div>
    </div>
  );
}

const S = {
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    marginBottom: 10,
    boxShadow: '0 1px 2px rgba(0,0,0,.04)',
  },
  left:      { display: 'flex', flexDirection: 'column', gap: 4, flex: 1, marginRight: 12 },
  title:     { fontSize: 14, fontWeight: 500 },
  meta:      { fontSize: 12, color: '#94a3b8' },
  btn: {
    padding: '6px 14px',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontWeight: 600,
    fontSize: 12,
    cursor: 'pointer',
  },
  doneBadge: { fontSize: 13, fontWeight: 700, color: '#16a34a', whiteSpace: 'nowrap' },
};