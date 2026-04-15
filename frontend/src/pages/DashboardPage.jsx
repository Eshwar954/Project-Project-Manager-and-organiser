import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
      .catch(() => setError('Failed to load projects.'))
      .finally(() => setLoading(false));
  }, []);

  const createProject = async () => {
    if (!newName.trim()) return;
    try {
      const p = await projectAPI.create(newName.trim());
      setProjects([...projects, p]);
      setNewName('');
    } catch {
      setError('Failed to create project.');
    }
  };

  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div style={S.page}>

      {/* Top navigation bar */}
      <header style={S.navbar}>
        <div style={S.navInner}>
          <div style={S.navBrand}>
            <div style={S.brandIcon}>P</div>
            <span style={S.brandName}>ProjectBoard</span>
          </div>

          <nav style={S.navLinks}>
            <Link to="/dashboard" style={{ ...S.navLink, ...S.navLinkActive }}>Dashboard</Link>
            <Link to="/team"      style={S.navLink}>Team</Link>
            <Link to="/profile"   style={S.navLink}>Profile</Link>
          </nav>

          <div style={S.navRight}>
            <Link to="/profile" style={S.avatarLink}>
              <div style={S.avatar}>{initials}</div>
              <span style={S.navUser}>{user.name}</span>
            </Link>
            <button id="dashboard-logout" style={S.logoutBtn} onClick={logout}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Page body */}
      <main style={S.body}>

        {/* Page title */}
        <div style={S.pageHeader}>
          <div>
            <h1 style={S.heading}>My Projects</h1>
            <p style={S.sub}>Select a project to view tasks, or create a new one.</p>
          </div>

          {/* Quick-nav cards */}
          <div style={S.quickNav}>
            <Link to="/team"    style={S.quickCard}>
              <span style={S.quickIcon}>👥</span>
              <span style={S.quickLabel}>Team</span>
            </Link>
            <Link to="/profile" style={S.quickCard}>
              <span style={S.quickIcon}>👤</span>
              <span style={S.quickLabel}>Profile</span>
            </Link>
          </div>
        </div>

        {/* Create project row */}
        <div style={S.createRow}>
          <input
            id="new-project-input"
            style={S.input}
            placeholder="New project name…"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createProject()}
          />
          <button id="create-project-btn" style={S.createBtn} onClick={createProject}>
            + Create Project
          </button>
        </div>

        {error && <div style={S.alert}>{error}</div>}

        {/* Project grid */}
        {loading ? (
          <p style={S.muted}>Loading projects…</p>
        ) : projects.length === 0 ? (
          <div style={S.empty}>
            <div style={S.emptyIcon}>📋</div>
            <p style={S.emptyTitle}>No projects yet</p>
            <p style={S.emptySub}>Create your first project using the field above.</p>
          </div>
        ) : (
          <div style={S.grid}>
            {projects.map(p => (
              <div
                key={p.id}
                id={`project-card-${p.id}`}
                style={S.card}
                onClick={() => navigate(`/project/${p.id}`)}
                role="button" tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && navigate(`/project/${p.id}`)}
              >
                <div style={S.cardHeader}>
                  <span style={S.projectName}>{p.name}</span>
                  <span style={{
                    ...S.badge,
                    background: p.ownerId === user.id ? '#dbeafe' : '#dcfce7',
                    color:      p.ownerId === user.id ? '#1e40af' : '#15803d',
                  }}>
                    {p.ownerId === user.id ? 'Owner' : 'Member'}
                  </span>
                </div>
                <div style={S.cardFooter}>
                  <span style={S.openLink}>Open project →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const S = {
  page: { background: '#f1f5f9', minHeight: '100vh' },

  navbar: { background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 },
  navInner: { maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  navBrand: { display: 'flex', alignItems: 'center', gap: 10 },
  brandIcon: { width: 32, height: 32, background: '#2563eb', color: '#fff', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 },
  brandName: { fontWeight: 700, fontSize: 16, color: '#0f172a' },
  navLinks: { display: 'flex', gap: 24 },
  navLink: { fontSize: 14, fontWeight: 500, color: '#475569', textDecoration: 'none' },
  navLinkActive: { color: '#2563eb', fontWeight: 700 },
  navRight: { display: 'flex', alignItems: 'center', gap: 14 },
  avatarLink: { display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' },
  avatar: { width: 30, height: 30, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 },
  navUser: { fontSize: 14, color: '#475569', fontWeight: 500 },
  logoutBtn: { padding: '7px 14px', border: '1px solid #cbd5e1', borderRadius: 7, background: '#fff', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' },

  body: { maxWidth: 1100, margin: '0 auto', padding: '36px 24px' },

  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  heading: { fontSize: 24, fontWeight: 700, color: '#0f172a' },
  sub: { fontSize: 14, color: '#64748b', marginTop: 4 },

  quickNav: { display: 'flex', gap: 10 },
  quickCard: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 13, color: '#374151', boxShadow: '0 1px 3px rgba(0,0,0,.05)' },
  quickIcon: { fontSize: 16 },
  quickLabel: { fontSize: 13, fontWeight: 600 },

  createRow: { display: 'flex', gap: 10, marginBottom: 24 },
  input: { flex: 1, padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14, color: '#0f172a', background: '#fff', outline: 'none' },
  createBtn: { padding: '10px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' },

  alert: { background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 500, marginBottom: 20 },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 },

  card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '20px 22px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,.06)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 16 },
  projectName: { fontSize: 15, fontWeight: 600, color: '#0f172a', lineHeight: 1.35, flex: 1 },
  badge: { fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, letterSpacing: '.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' },
  cardFooter: { borderTop: '1px solid #f1f5f9', paddingTop: 12 },
  openLink: { fontSize: 13, color: '#2563eb', fontWeight: 500 },

  empty: { textAlign: 'center', padding: '60px 20px', background: '#fff', border: '1px dashed #cbd5e1', borderRadius: 12 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 6 },
  emptySub: { fontSize: 14, color: '#64748b' },

  muted: { color: '#94a3b8', fontSize: 14 },
};