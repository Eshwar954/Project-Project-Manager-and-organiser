import { taskAPI } from '../api/api';

export default function TaskCard({ task, onUpdate }) {
  const handleComplete = async () => {
    try {
      await taskAPI.complete(task.id);
      if (onUpdate) onUpdate();
    } catch {
      alert('Failed to complete task');
    }
  };

  return (
    <div style={{
      ...styles.card,
      background:   task.completed ? '#f0fdf4' : '#fff',
      borderColor:  task.completed ? '#bbf7d0' : '#e8e8e8',
    }}>
      <div style={styles.left}>
        <span style={{
          ...styles.title,
          textDecoration: task.completed ? 'line-through' : 'none',
          color:          task.completed ? '#999' : '#111',
        }}>
          {task.title}
        </span>
        <span style={styles.meta}>
          Assigned to user #{task.assignedTo ?? '—'}
        </span>
      </div>
      <div>
        {task.completed ? (
          <span style={styles.doneBadge}>✓ Done</span>
        ) : (
          <button style={styles.btn} onClick={handleComplete}>
            Mark Done
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  card:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', border: '1px solid #e8e8e8', borderRadius: 10, marginBottom: 10 },
  left:      { display: 'flex', flexDirection: 'column', gap: 4 },
  title:     { fontSize: 14, fontWeight: 500 },
  meta:      { fontSize: 12, color: '#aaa' },
  btn:       { padding: '6px 14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  doneBadge: { fontSize: 13, color: '#16a34a', fontWeight: 600 },
};