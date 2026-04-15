import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { projectAPI, taskAPI, commentAPI } from "../api/api";
import { useAuth } from "../context/AuthContext";

// ─── Helpers ────────────────────────────────────────────────────────────────

function priorityStyle(p) {
  switch ((p || "MEDIUM").toUpperCase()) {
    case "CRITICAL": return { background: "#fee2e2", color: "#dc2626" };
    case "HIGH":     return { background: "#ffedd5", color: "#c2410c" };
    case "LOW":      return { background: "#dcfce7", color: "#15803d" };
    default:         return { background: "#dbeafe", color: "#1e40af" };
  }
}

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

function fmtTime(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProjectPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project,  setProject]  = useState(null);
  const [tasks,    setTasks]    = useState([]);
  const [members,  setMembers]  = useState([]);
  const [progress, setProgress] = useState({ progress: 0, completed: 0, total: 0 });

  // Create task form
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "MEDIUM", assignedTo: "" });

  // Add member form
  const [memberEmail, setMemberEmail] = useState("");

  // Expanded task (for comments / detail view)
  const [expandedId,  setExpandedId]  = useState(null);
  const [comments,    setComments]    = useState({});   // taskId -> [CommentResponse]
  const [newComment,  setNewComment]  = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const [error, setError] = useState("");
  const [msg,   setMsg]   = useState("");

  const isAdmin = project && project.ownerId === user.id;

  // ── Data loading ───────────────────────────────────────────────────────────

  const reload = useCallback(async () => {
    try {
      const [allProjects, taskList, prog, memberList] = await Promise.all([
        projectAPI.list(),
        taskAPI.list(id),
        projectAPI.progress(id),
        projectAPI.members(id),
      ]);
      setProject(allProjects.find(p => p.id === parseInt(id)) || null);
      setTasks(taskList);
      setProgress(prog);
      setMembers(memberList);
    } catch {
      setError("Failed to load project data.");
    }
  }, [id]);

  useEffect(() => { reload(); }, [reload]);

  // ── Task actions ───────────────────────────────────────────────────────────

  const visibleTasks = isAdmin ? tasks : tasks.filter(t => t.assignedTo === user.id);

  const handleComplete = async (taskId) => {
    try { await taskAPI.complete(taskId); reload(); }
    catch { setError("Failed to mark task as done."); }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;
    try {
      await taskAPI.create(id, {
        title:       newTask.title.trim(),
        description: newTask.description.trim() || null,
        priority:    newTask.priority || "MEDIUM",
        assignedTo:  newTask.assignedTo ? parseInt(newTask.assignedTo) : null,
      });
      setNewTask({ title: "", description: "", priority: "MEDIUM", assignedTo: "" });
      reload();
    } catch { setError("Failed to create task."); }
  };

  const handleAddMember = async () => {
    if (!memberEmail.trim()) return;
    try {
      await projectAPI.addMember(id, memberEmail.trim());
      setMemberEmail("");
      setMsg("Member added successfully.");
      reload();
      setTimeout(() => setMsg(""), 4000);
    } catch {
      setError("Could not add member. Verify the email address.");
      setTimeout(() => setError(""), 4000);
    }
  };

  // ── Comments ───────────────────────────────────────────────────────────────

  const toggleExpand = async (taskId) => {
    if (expandedId === taskId) { setExpandedId(null); return; }
    setExpandedId(taskId);
    if (!comments[taskId]) {
      try {
        const list = await commentAPI.list(taskId);
        setComments(prev => ({ ...prev, [taskId]: list }));
      } catch { /* silently */ }
    }
  };

  const handleAddComment = async (taskId) => {
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      const c = await commentAPI.add(taskId, newComment.trim());
      setComments(prev => ({ ...prev, [taskId]: [...(prev[taskId] || []), c] }));
      setNewComment("");
    } catch { setError("Failed to add comment."); }
    finally { setCommentLoading(false); }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!project) return (
    <div style={{ padding: 48, color: "#94a3b8", fontFamily: "Inter, sans-serif" }}>Loading project…</div>
  );

  const pct = progress.progress;

  return (
    <div style={S.page}>

      {/* Topbar */}
      <header style={S.navbar}>
        <div style={S.navInner}>
          <div style={S.navLeft}>
            <button style={S.backBtn} onClick={() => navigate("/dashboard")}>← Dashboard</button>
            <span style={S.separator}>|</span>
            <span style={S.projectTitle}>{project.name}</span>
            <span style={{ ...S.badge, background: isAdmin ? "#dbeafe" : "#dcfce7", color: isAdmin ? "#1e40af" : "#15803d" }}>
              {isAdmin ? "Owner" : "Member"}
            </span>
          </div>
          <nav style={S.navLinks}>
            <Link to="/team"    style={S.navLink}>Team</Link>
            <Link to="/profile" style={S.navLink}>Profile</Link>
          </nav>
        </div>
      </header>

      <main style={S.body}>

        {error && <div style={S.alertDanger}>{error}</div>}
        {msg   && <div style={S.alertSuccess}>{msg}</div>}

        {/* Progress */}
        <div style={S.card}>
          <div style={S.progressHeader}>
            <span style={S.sectionLabel}>Progress</span>
            <span style={S.progressCount}>{progress.completed} / {progress.total} tasks · {pct}%</span>
          </div>
          <div style={S.track}><div style={{ ...S.fill, width: `${pct}%` }} /></div>
        </div>

        <div style={S.cols}>

          {/* Left column (admin forms + member list) */}
          {isAdmin && (
            <div style={S.colLeft}>

              {/* Add member */}
              <div style={S.card}>
                <h2 style={S.sectionHeading}>Add Team Member</h2>
                <div style={S.row}>
                  <input style={S.input} type="email" placeholder="colleague@example.com"
                    value={memberEmail} onChange={e => setMemberEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAddMember()} />
                  <button style={S.btnPrimary} onClick={handleAddMember}>Add</button>
                </div>
              </div>

              {/* Create task */}
              <div style={S.card}>
                <h2 style={S.sectionHeading}>Create Task</h2>
                <div style={S.formCol}>
                  <input style={S.input} placeholder="Task title *"
                    value={newTask.title}
                    onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
                  <textarea style={S.textarea} placeholder="Description (optional)…"
                    value={newTask.description}
                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                    rows={3} />
                  <div style={S.row}>
                    <select style={{ ...S.input, flex: 1 }}
                      value={newTask.priority}
                      onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                      {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select style={{ ...S.input, flex: 2 }}
                      value={newTask.assignedTo}
                      onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })}>
                      <option value="">Assign to…</option>
                      {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <button style={S.btnPrimary} onClick={handleCreateTask}>Add Task</button>
                </div>
              </div>

              {/* Members overview */}
              <div style={S.card}>
                <h2 style={S.sectionHeading}>Members</h2>
                <div style={S.memberList}>
                  {members.map(m => {
                    const count = tasks.filter(t => t.assignedTo === m.id).length;
                    const done  = tasks.filter(t => t.assignedTo === m.id && t.completed).length;
                    return (
                      <div key={m.id} style={S.memberRow}>
                        <div style={S.memberAvatar}>
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={S.memberInfo}>
                          <span style={S.memberName}>{m.name}</span>
                          <span style={S.memberEmail}>{m.email}</span>
                        </div>
                        <div style={S.memberStats}>
                          <span style={S.statChip}>{count} tasks</span>
                          <span style={{ ...S.statChip, background: "#dcfce7", color: "#15803d" }}>{done} done</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Right column: task list */}
          <div style={S.colRight}>
            <div style={S.card}>
              <h2 style={S.sectionHeading}>
                Tasks {!isAdmin && <span style={S.subLabel}>(assigned to you)</span>}
              </h2>

              {visibleTasks.length === 0 ? (
                <div style={S.empty}><span style={S.emptyIcon}>✓</span><p>No tasks yet.</p></div>
              ) : (
                <div style={S.taskList}>
                  {visibleTasks.map(task => {
                    const assignee  = members.find(m => m.id === task.assignedTo);
                    const expanded  = expandedId === task.id;
                    const taskComments = comments[task.id] || [];

                    return (
                      <div key={task.id} style={{ ...S.taskCard, borderColor: task.completed ? "#86efac" : "#e2e8f0", background: task.completed ? "#f0fdf4" : "#fff" }}>

                        {/* Task header row */}
                        <div style={S.taskHeader}>
                          <div style={S.taskMeta}>
                            {/* Priority badge */}
                            <span style={{ ...S.priorityBadge, ...priorityStyle(task.priority) }}>
                              {task.priority || "MEDIUM"}
                            </span>
                            <span style={{ ...S.taskTitle, textDecoration: task.completed ? "line-through" : "none", color: task.completed ? "#94a3b8" : "#0f172a" }}>
                              {task.title}
                            </span>
                          </div>
                          <div style={S.taskActions}>
                            {/* Expand / collapse */}
                            <button style={S.expandBtn} onClick={() => toggleExpand(task.id)}>
                              {expanded ? "▲" : "▼"}
                            </button>
                            {task.completed
                              ? <span style={S.doneBadge}>✓ Done</span>
                              : <button style={S.completeBtn} onClick={() => handleComplete(task.id)}>Mark Done</button>
                            }
                          </div>
                        </div>

                        {/* Assignee + description row */}
                        <div style={S.taskSubRow}>
                          <span style={S.taskAssignee}>
                            {assignee ? `Assigned to ${assignee.name}` : "Unassigned"}
                          </span>
                          {task.description && !expanded && (
                            <span style={S.taskDescPreview}>{task.description.slice(0, 60)}{task.description.length > 60 ? "…" : ""}</span>
                          )}
                        </div>

                        {/* Expanded detail */}
                        {expanded && (
                          <div style={S.expanded}>

                            {/* Description */}
                            {task.description && (
                              <div style={S.expandSection}>
                                <div style={S.expandLabel}>Description</div>
                                <p style={S.descText}>{task.description}</p>
                              </div>
                            )}

                            {/* Comments */}
                            <div style={S.expandSection}>
                              <div style={S.expandLabel}>Comments ({taskComments.length})</div>
                              {taskComments.length === 0
                                ? <p style={S.muted}>No comments yet. Be the first!</p>
                                : (
                                  <div style={S.commentList}>
                                    {taskComments.map(c => (
                                      <div key={c.id} style={S.commentItem}>
                                        <div style={S.commentMeta}>
                                          <span style={S.commentAuthor}>{c.authorName}</span>
                                          <span style={S.commentTime}>{fmtTime(c.createdAt)}</span>
                                        </div>
                                        <p style={S.commentText}>{c.content}</p>
                                      </div>
                                    ))}
                                  </div>
                                )
                              }

                              {/* Add comment */}
                              <div style={S.commentInputRow}>
                                <input
                                  style={S.commentInput}
                                  placeholder="Write a comment…"
                                  value={newComment}
                                  onChange={e => setNewComment(e.target.value)}
                                  onKeyDown={e => e.key === "Enter" && handleAddComment(task.id)}
                                />
                                <button style={S.btnPrimary} disabled={commentLoading}
                                  onClick={() => handleAddComment(task.id)}>
                                  {commentLoading ? "…" : "Post"}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const S = {
  page: { background: "#f1f5f9", minHeight: "100vh" },

  navbar: { background: "#fff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 100 },
  navInner: { maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" },
  navLeft: { display: "flex", alignItems: "center", gap: 12 },
  backBtn: { padding: "7px 14px", border: "1px solid #cbd5e1", borderRadius: 7, background: "#fff", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer" },
  separator: { color: "#e2e8f0", fontSize: 18 },
  projectTitle: { fontSize: 15, fontWeight: 700, color: "#0f172a" },
  badge: { fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, letterSpacing: ".04em", textTransform: "uppercase" },
  navLinks: { display: "flex", gap: 20 },
  navLink: { fontSize: 14, fontWeight: 500, color: "#475569", textDecoration: "none" },

  body: { maxWidth: 1200, margin: "0 auto", padding: "28px 24px" },

  alertDanger: { background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", fontSize: 13, fontWeight: 500, marginBottom: 16 },
  alertSuccess: { background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", borderRadius: 8, padding: "10px 14px", fontSize: 13, fontWeight: 500, marginBottom: 16 },

  card: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "20px 24px", marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,.06)" },

  progressHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".08em" },
  progressCount: { fontSize: 13, color: "#64748b" },
  track: { height: 8, background: "#e2e8f0", borderRadius: 6, overflow: "hidden" },
  fill: { height: "100%", background: "#2563eb", borderRadius: 6 },

  cols: { display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" },
  colLeft: { flex: "0 0 340px", minWidth: 280 },
  colRight: { flex: 1, minWidth: 320 },

  sectionHeading: { fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 14 },
  subLabel: { fontSize: 12, color: "#94a3b8", fontWeight: 400 },

  row: { display: "flex", gap: 10 },
  formCol: { display: "flex", flexDirection: "column", gap: 10 },
  input: { flex: 1, padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 14, color: "#0f172a", background: "#fff", outline: "none" },
  textarea: { padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 14, color: "#0f172a", background: "#fff", outline: "none", resize: "vertical", fontFamily: "inherit" },
  btnPrimary: { padding: "10px 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" },

  /* Members overview */
  memberList: { display: "flex", flexDirection: "column", gap: 10 },
  memberRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #f1f5f9" },
  memberAvatar: { width: 34, height: 34, borderRadius: "50%", background: "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 },
  memberInfo: { display: "flex", flexDirection: "column", flex: 1 },
  memberName: { fontSize: 13, fontWeight: 600, color: "#0f172a" },
  memberEmail: { fontSize: 11, color: "#94a3b8" },
  memberStats: { display: "flex", gap: 6 },
  statChip: { fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: "#dbeafe", color: "#1e40af" },

  /* Task list */
  taskList: { display: "flex", flexDirection: "column", gap: 10 },
  taskCard: { border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" },
  taskHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px" },
  taskMeta: { display: "flex", alignItems: "center", gap: 10, flex: 1 },
  taskActions: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  taskTitle: { fontSize: 14, fontWeight: 500 },
  taskSubRow: { display: "flex", gap: 16, padding: "0 16px 10px", flexWrap: "wrap" },
  taskAssignee: { fontSize: 12, color: "#94a3b8" },
  taskDescPreview: { fontSize: 12, color: "#94a3b8", fontStyle: "italic" },

  priorityBadge: { fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, letterSpacing: ".04em", textTransform: "uppercase", flexShrink: 0 },
  completeBtn: { padding: "5px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: "pointer" },
  doneBadge: { fontSize: 13, fontWeight: 700, color: "#16a34a" },
  expandBtn: { padding: "4px 8px", background: "none", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", fontSize: 11, color: "#94a3b8" },

  /* Expanded section */
  expanded: { borderTop: "1px solid #f1f5f9", background: "#fafafa", padding: "16px 16px 12px" },
  expandSection: { marginBottom: 16 },
  expandLabel: { fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 },
  descText: { fontSize: 14, color: "#374151", lineHeight: 1.6 },

  /* Comments */
  commentList: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 },
  commentItem: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px" },
  commentMeta: { display: "flex", gap: 10, alignItems: "center", marginBottom: 4 },
  commentAuthor: { fontSize: 12, fontWeight: 700, color: "#0f172a" },
  commentTime: { fontSize: 11, color: "#94a3b8" },
  commentText: { fontSize: 13, color: "#374151", lineHeight: 1.5 },
  commentInputRow: { display: "flex", gap: 8, marginTop: 8 },
  commentInput: { flex: 1, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 7, fontSize: 13, outline: "none", fontFamily: "inherit" },

  empty: { textAlign: "center", padding: "32px 0", color: "#94a3b8" },
  emptyIcon: { fontSize: 28, display: "block", marginBottom: 8 },
  muted: { color: "#94a3b8", fontSize: 13 },
};