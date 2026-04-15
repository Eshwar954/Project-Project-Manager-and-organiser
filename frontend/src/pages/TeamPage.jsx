import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function TeamPage() {
  const { user, logout }       = useAuth();
  const [members,    setMembers]    = useState([]);
  const [selected,   setSelected]   = useState(null);  // member being viewed
  const [memberTasks, setMemberTasks] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [taskLoading, setTaskLoading] = useState(false);

  useEffect(() => {
    userAPI.team()
      .then(setMembers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const viewMember = async (member) => {
    setSelected(member);
    setTaskLoading(true);
    try {
      const tasks = await userAPI.memberTasks(member.id);
      setMemberTasks(tasks);
    } catch {
      setMemberTasks([]);
    } finally {
      setTaskLoading(false);
    }
  };

  const initials = (name) =>
    (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const avatarColor = (id) => {
    const colors = ['#2563eb', '#7c3aed', '#0891b2', '#0d9488', '#dc2626', '#d97706'];
    return colors[id % colors.length];
  };

  return (
    <div style={S.page}>

      {/* Navbar */}
      <header style={S.navbar}>
        <div style={S.navInner}>
          <div style={S.navBrand}>
            <div style={S.brandIcon}>P</div>
            <span style={S.brandName}>ProjectBoard</span>
          </div>
          <nav style={S.navLinks}>
            <Link to="/dashboard" style={S.navLink}>Dashboard</Link>
            <Link to="/team"      style={{ ...S.navLink, ...S.navLinkActive }}>Team</Link>
            <Link to="/profile"   style={S.navLink}>Profile</Link>
          </nav>
          <button style={S.logoutBtn} onClick={logout}>Sign out</button>
        </div>
      </header>

      <main style={S.body}>
        <h1 style={S.pageTitle}>Team Members</h1>
        <p style={S.pageSub}>All members across your shared projects.</p>

        {loading ? (
          <p style={S.muted}>Loading…</p>
        ) : (
          <div style={S.layout}>

            {/* Member list */}
            <div style={S.memberList}>
              {members.map(m => (
                <div
                  key={m.id}
                  id={`member-${m.id}`}
                  style={{
                    ...S.memberCard,
                    borderColor:   selected?.id === m.id ? '#2563eb' : '#e2e8f0',
                    background:    selected?.id === m.id ? '#eff6ff' : '#fff',
                  }}
                  onClick={() => viewMember(m)}
                  role="button" tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && viewMember(m)}
                >
                  <div style={{ ...S.avatar, background: avatarColor(m.id) }}>
                    {initials(m.name)}
                  </div>
                  <div style={S.memberInfo}>
                    <div style={S.memberName}>{m.name}</div>
                    <div style={S.memberEmail}>{m.email}</div>
                  </div>
                  {m.id === user.id && (
                    <span style={S.youBadge}>You</span>
                  )}
                </div>
              ))}
            </div>

            {/* Right panel: member task detail */}
            <div style={S.detailPanel}>
              {!selected ? (
                <div style={S.emptyState}>
                  <div style={S.emptyIcon}>👆</div>
                  <p style={S.emptyText}>Select a member to see their assigned tasks</p>
                </div>
              ) : (
                <>
                  <div style={S.detailHeader}>
                    <div style={{ ...S.avatarLg, background: avatarColor(selected.id) }}>
                      {initials(selected.name)}
                    </div>
                    <div>
                      <div style={S.detailName}>{selected.name}</div>
                      <div style={S.detailEmail}>{selected.email}</div>
                    </div>
                  </div>

                  <div style={S.detailSectionLabel}>Assigned Tasks</div>

                  {taskLoading ? (
                    <p style={S.muted}>Loading tasks…</p>
                  ) : memberTasks.length === 0 ? (
                    <p style={S.muted}>No tasks assigned.</p>
                  ) : (
                    <div style={S.taskList}>
                      {memberTasks.map(t => (
                        <div key={t.id} style={S.taskRow}>
                          <div style={S.taskLeft}>
                            <span style={{
                              ...S.taskTitle,
                              textDecoration: t.completed ? 'line-through' : 'none',
                              color: t.completed ? '#94a3b8' : '#0f172a',
                            }}>
                              {t.title}
                            </span>
                          </div>
                          <div style={S.taskRight}>
                            <span style={{ ...S.priorityBadge, ...priorityStyle(t.priority) }}>
                              {t.priority || 'MEDIUM'}
                            </span>
                            {t.completed
                              ? <span style={S.doneBadge}>✓ Done</span>
                              : <span style={S.pendingBadge}>Pending</span>
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Summary counts */}
                  {memberTasks.length > 0 && (
                    <div style={S.summaryRow}>
                      <span style={S.summaryChip}>
                        {memberTasks.filter(t => t.completed).length} done
                      </span>
                      <span style={{ ...S.summaryChip, background: '#ffedd5', color: '#c2410c' }}>
                        {memberTasks.filter(t => !t.completed).length} pending
                      </span>
                    </div>
                  )}
                </>
              )}
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

  body: { maxWidth: 1100, margin: '0 auto', padding: '36px 24px' },
  pageTitle: { fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 4 },
  pageSub: { fontSize: 14, color: '#64748b', marginBottom: 28 },

  layout: { display: 'flex', gap: 20, alignItems: 'flex-start' },
  memberList: { display: 'flex', flexDirection: 'column', gap: 10, width: 300, flexShrink: 0 },

  memberCard: {
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
    padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
    cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,.05)',
  },
  avatar: { width: 42, height: 42, borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 14, fontWeight: 600, color: '#0f172a' },
  memberEmail: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  youBadge: { fontSize: 10, fontWeight: 700, background: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: 20, textTransform: 'uppercase' },

  detailPanel: {
    flex: 1, background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: 10, padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,.05)',
    minHeight: 300,
  },
  emptyState: { textAlign: 'center', padding: '60px 0' },
  emptyIcon: { fontSize: 36, marginBottom: 12 },
  emptyText: { fontSize: 14, color: '#94a3b8' },

  detailHeader: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #f1f5f9' },
  avatarLg: { width: 56, height: 56, borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, flexShrink: 0 },
  detailName: { fontSize: 18, fontWeight: 700, color: '#0f172a' },
  detailEmail: { fontSize: 13, color: '#64748b', marginTop: 2 },
  detailSectionLabel: { fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 },

  taskList: { display: 'flex', flexDirection: 'column', gap: 8 },
  taskRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8 },
  taskLeft: { flex: 1, marginRight: 12 },
  taskRight: { display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 },
  taskTitle: { fontSize: 14, fontWeight: 500 },
  priorityBadge: { fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, letterSpacing: '.04em', textTransform: 'uppercase' },
  doneBadge: { fontSize: 12, fontWeight: 700, color: '#16a34a' },
  pendingBadge: { fontSize: 11, color: '#94a3b8' },

  summaryRow: { display: 'flex', gap: 10, marginTop: 16 },
  summaryChip: { fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20, background: '#dcfce7', color: '#15803d' },

  muted: { color: '#94a3b8', fontSize: 14 },
};
