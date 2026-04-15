import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userAPI, projectAPI, taskAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [projects,  setProjects]  = useState([]);
  const [allTasks,  setAllTasks]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const projs = await projectAPI.list();
        setProjects(projs);
        // fetch tasks for all projects
        const taskArrays = await Promise.all(projs.map(p => taskAPI.list(p.id)));
        setAllTasks(taskArrays.flat());
      } catch { /* silently handle */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const myTasks      = allTasks.filter(t => t.assignedTo === user.id);
  const doneTasks    = myTasks.filter(t => t.completed);
  const pendingTasks = myTasks.filter(t => !t.completed);
  const pct = myTasks.length ? Math.round((doneTasks.length / myTasks.length) * 100) : 0;

  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div style={S.page}>

      {/* Navbar */}
      <header style={S.navbar}>
        <div style={S.navInner}>
          <Link to="/dashboard" style={{ ...S.navBrand, textDecoration: 'none' }}>
            <div style={S.brandIcon}>P</div>
            <span style={S.brandName}>ProjectBoard</span>
          </Link>
          <nav style={S.navLinks}>
            <Link to="/dashboard" style={S.navLink}>Dashboard</Link>
            <Link to="/team"      style={S.navLink}>Team</Link>
            <Link to="/profile"   style={{ ...S.navLink, ...S.navLinkActive }}>Profile</Link>
          </nav>
          <button style={S.logoutBtn} onClick={logout}>Sign out</button>
        </div>
      </header>

      <main style={S.body}>
        <h1 style={S.pageTitle}>My Profile</h1>

        {/* Profile card */}
        <div style={S.profileCard}>
          <div style={S.avatar}>{initials}</div>
          <div>
            <div style={S.profileName}>{user.name}</div>
            <div style={S.profileEmail}>{user.email}</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={S.statsRow}>
          {[
            { label: 'Projects',       value: projects.length },
            { label: 'Tasks assigned', value: myTasks.length },
            { label: 'Completed',      value: doneTasks.length },
            { label: 'Pending',        value: pendingTasks.length },
          ].map(s => (
            <div key={s.label} style={S.statCard}>
              <div style={S.statValue}>{s.value}</div>
              <div style={S.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {myTasks.length > 0 && (
          <div style={S.card}>
            <div style={S.sectionRow}>
              <span style={S.sectionLabel}>Overall task completion</span>
              <span style={S.pctText}>{pct}%</span>
            </div>
            <div style={S.track}><div style={{ ...S.fill, width: `${pct}%` }} /></div>
          </div>
        )}

        {/* Projects */}
        <div style={S.card}>
          <h2 style={S.sectionHeading}>My Projects</h2>
          {loading ? (
            <p style={S.muted}>Loading…</p>
          ) : projects.length === 0 ? (
            <p style={S.muted}>No projects yet.</p>
          ) : (
            <div style={S.projectList}>
              {projects.map(p => (
                <div
                  key={p.id}
                  style={S.projectRow}
                  onClick={() => navigate(`/project/${p.id}`)}
                  role="button" tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && navigate(`/project/${p.id}`)}
                >
                  <span style={S.projectName}>{p.name}</span>
                  <span style={{
                    ...S.badge,
                    background: p.ownerId === user.id ? '#dbeafe' : '#dcfce7',
                    color:      p.ownerId === user.id ? '#1e40af' : '#15803d',
                  }}>
                    {p.ownerId === user.id ? 'Owner' : 'Member'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending tasks */}
        {pendingTasks.length > 0 && (
          <div style={S.card}>
            <h2 style={S.sectionHeading}>Pending Tasks</h2>
            <div style={S.taskList}>
              {pendingTasks.map(t => (
                <div key={t.id} style={S.taskRow}>
                  <span style={S.taskTitle}>{t.title}</span>
                  <span style={{ ...S.priorityBadge, ...priorityStyle(t.priority) }}>
                    {t.priority || 'MEDIUM'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function priorityStyle(p) {
  switch ((p || 'MEDIUM').toUpperCase()) {
    case 'CRITICAL': return { background: '#fee2e2', color: '#dc2626' };
    case 'HIGH':     return { background: '#ffedd5', color: '#c2410c' };
    case 'LOW':      return { background: '#dcfce7', color: '#15803d' };
    default:         return { background: '#dbeafe', color: '#1e40af' };
  }
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
  logoutBtn: { padding: '7px 14px', border: '1px solid #cbd5e1', borderRadius: 7, background: '#fff', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' },

  body: { maxWidth: 800, margin: '0 auto', padding: '36px 24px' },
  pageTitle: { fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 24 },

  profileCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,.06)' },
  avatar: { width: 64, height: 64, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, flexShrink: 0 },
  profileName: { fontSize: 20, fontWeight: 700, color: '#0f172a' },
  profileEmail: { fontSize: 14, color: '#64748b', marginTop: 4 },

  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 },
  statCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '18px 20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,.06)' },
  statValue: { fontSize: 28, fontWeight: 700, color: '#2563eb' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 500 },

  card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '20px 24px', marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,.06)' },
  sectionRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionLabel: { fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '.06em' },
  pctText: { fontSize: 13, color: '#64748b' },
  track: { height: 8, background: '#e2e8f0', borderRadius: 6, overflow: 'hidden' },
  fill: { height: '100%', background: '#2563eb', borderRadius: 6 },

  sectionHeading: { fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 14 },
  projectList: { display: 'flex', flexDirection: 'column', gap: 8 },
  projectRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer' },
  projectName: { fontSize: 14, fontWeight: 500, color: '#0f172a' },
  badge: { fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, letterSpacing: '.04em', textTransform: 'uppercase' },

  taskList: { display: 'flex', flexDirection: 'column', gap: 8 },
  taskRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8 },
  taskTitle: { fontSize: 14, color: '#0f172a' },
  priorityBadge: { fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, letterSpacing: '.04em', textTransform: 'uppercase' },

  muted: { color: '#94a3b8', fontSize: 14 },
};
