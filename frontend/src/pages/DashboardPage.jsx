import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [newName, setNewName]   = useState('');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const { user, logout }        = useAuth();
  const navigate                = useNavigate();

  useEffect(() => {
    projectAPI.list()
      .then(setProjects)
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  const createProject = async () => {
    if (!newName.trim()) return;
    try {
      const p = await projectAPI.create(newName.trim());
      setProjects([...projects, p]);
      setNewName('');
    } catch {
      setError('Failed to create project');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.heading}>My Projects</h2>
            <p style={styles.sub}>Welcome back, {user.name}</p>
          </div>
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>

        {/* Create */}
        <div style={styles.createRow}>
          <input
            style={styles.input}
            placeholder="Start a new project..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createProject()}
          />
          <button style={styles.btn} onClick={createProject}>Create</button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {/* Projects */}
        {loading ? (
          <p style={styles.muted}>Loading...</p>
        ) : projects.length === 0 ? (
          <div style={styles.empty}>
            <p>No projects yet</p>
            <span style={styles.emptySub}>Create your first one above</span>
          </div>
        ) : (
          <div style={styles.grid}>
            {projects.map(p => (
              <div
                key={p.id}
                style={styles.card}
                onClick={() => navigate(`/project/${p.id}`)}
              >
                <div style={styles.cardTop}>
                  <span style={styles.projectName}>{p.name}</span>
                  <span style={p.ownerId === user.id ? styles.owner : styles.member}>
                    {p.ownerId === user.id ? 'Owner' : 'Member'}
                  </span>
                </div>

                <div style={styles.cardFooter}>
                  <span style={styles.openText}>Open project →</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  page: { background: '#f6f7fb', minHeight: '100vh', padding: 30 },

  container: { maxWidth: 900, margin: '0 auto' },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 30,
    alignItems: 'center'
  },

  heading: { fontSize: 26, fontWeight: 700 },

  sub: { fontSize: 14, color: '#777' },

  logoutBtn: {
    padding: '8px 16px',
    border: '1px solid #ddd',
    borderRadius: 10,
    background: '#fff',
    cursor: 'pointer'
  },

  createRow: { display: 'flex', gap: 10, marginBottom: 25 },

  input: {
    flex: 1,
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid #ddd',
    fontSize: 14
  },

  btn: {
    padding: '12px 20px',
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer'
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 18
  },

  card: {
    background: '#fff',
    borderRadius: 14,
    padding: 20,
    border: '1px solid #eee',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },

  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 10
  },

  projectName: { fontWeight: 600 },

  owner: {
    background: '#eef2ff',
    color: '#4f46e5',
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: 11
  },

  member: {
    background: '#f0fdf4',
    color: '#16a34a',
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: 11
  },

  cardFooter: { marginTop: 10 },

  openText: { fontSize: 12, color: '#aaa' },

  empty: {
    textAlign: 'center',
    padding: 50,
    background: '#fff',
    borderRadius: 12,
    border: '1px dashed #ddd'
  },

  emptySub: { fontSize: 12, color: '#999' },

  error: { color: 'red' },

  muted: { color: '#aaa' }
};