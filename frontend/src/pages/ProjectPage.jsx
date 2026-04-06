import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectAPI, taskAPI } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function ProjectPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState({
    progress: 0,
    completed: 0,
    total: 0,
  });
  const [newTask, setNewTask] = useState({ title: "", assignedTo: "" });
  const [memberEmail, setMemberEmail] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const isAdmin = project && project.ownerId === user.id;
  const [members, setMembers] = useState([]);

  const reload = useCallback(async () => {
    try {
      const [allProjects, taskList, prog, memberList] = await Promise.all([
        projectAPI.list(),
        taskAPI.list(id),
        projectAPI.progress(id),
        projectAPI.members(id), // add this
      ]);
      setProject(allProjects.find((p) => p.id === parseInt(id)) || null);
      setTasks(taskList);
      setProgress(prog);
      setMembers(memberList); // add this
    } catch {
      setError("Failed to load project");
    }
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  // ADMIN sees all tasks, MEMBER sees only their own
  const visibleTasks = isAdmin
    ? tasks
    : tasks.filter((t) => t.assignedTo === user.id);

  const handleComplete = async (taskId) => {
    try {
      await taskAPI.complete(taskId);
      reload();
    } catch {
      setError("Failed to complete task");
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;
    try {
      await taskAPI.create(id, {
        title: newTask.title.trim(),
        assignedTo: newTask.assignedTo ? parseInt(newTask.assignedTo) : null,
      });
      setNewTask({ title: "", assignedTo: "" });
      reload();
    } catch {
      setError("Failed to create task");
    }
  };

  const handleAddMember = async () => {
    if (!memberEmail.trim()) return;
    try {
      await projectAPI.addMember(id, memberEmail.trim());
      setMemberEmail("");
      setMsg("Member added successfully!");
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setError("Could not add member. Check the email.");
      setTimeout(() => setError(""), 3000);
    }
  };

  if (!project)
    return <div style={{ padding: 40, color: "#999" }}>Loading project...</div>;

  return (
    <div style={styles.page}>
      {/* Back + title */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
          ← Back
        </button>
        <div>
          <h2 style={styles.heading}>{project.name}</h2>
          <span style={isAdmin ? styles.adminBadge : styles.memberBadge}>
            {isAdmin ? " Owner" : "Member"}
          </span>
        </div>
      </div>

      {error && <p style={styles.error}>{error}</p>}
      {msg && <p style={styles.success}>{msg}</p>}

      {/* Progress bar */}
      <div style={styles.progressBox}>
        <div style={styles.progressHeader}>
          <span style={{ fontWeight: 600 }}>Progress</span>
          <span style={styles.progressLabel}>
            {progress.completed}/{progress.total} tasks — {progress.progress}%
          </span>
        </div>
        <div style={styles.progressTrack}>
          <div
            style={{ ...styles.progressFill, width: `${progress.progress}%` }}
          />
        </div>
      </div>

      {/* ADMIN: Add member */}
      {isAdmin && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Add Member</h3>
          <div style={styles.row}>
            <input
              style={styles.input}
              placeholder="Member's email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
            />
            <button style={styles.btn} onClick={handleAddMember}>
              Add
            </button>
          </div>
        </div>
      )}

      {/* ADMIN: Create task */}
      {isAdmin && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Create Task</h3>
          <div style={styles.row}>
            <input
              style={styles.input}
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
            />
            <select
              style={{ ...styles.input, maxWidth: 200 }}
              value={newTask.assignedTo}
              onChange={(e) =>
                setNewTask({ ...newTask, assignedTo: e.target.value })
              }
            >
              <option value="">Assign to...</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
            <button style={styles.btn} onClick={handleCreateTask}>
              Add Task
            </button>
          </div>
        </div>
      )}

      {/* Task list */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          Tasks{" "}
          {!isAdmin && <span style={styles.muted}>(assigned to you)</span>}
        </h3>

        {visibleTasks.length === 0 ? (
          <div style={styles.empty}>No tasks yet.</div>
        ) : (
          visibleTasks.map((task) => (
            <div
              key={task.id}
              style={{
                ...styles.taskCard,
                background: task.completed ? "#f0fdf4" : "#fff",
                borderColor: task.completed ? "#bbf7d0" : "#e8e8e8",
              }}
            >
              <div style={styles.taskLeft}>
                <span
                  style={{
                    ...styles.taskTitle,
                    textDecoration: task.completed ? "line-through" : "none",
                    color: task.completed ? "#999" : "#111",
                  }}
                >
                  {task.title}
                </span>
                <span style={styles.taskMeta}>
                  Assigned to:{" "}
                  {members.find((m) => m.id === task.assignedTo)?.name ?? "—"}
                </span>
              </div>
              <div style={styles.taskRight}>
                {task.completed ? (
                  <span style={styles.doneBadge}>✓ Done</span>
                ) : (
                  <button
                    style={styles.completeBtn}
                    onClick={() => handleComplete(task.id)}
                  >
                    Mark Done
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 800, margin: '0 auto', padding: '40px 20px' },

  header: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 30 },

  backBtn: {
    padding: '6px 12px',
    border: '1px solid #ddd',
    borderRadius: 8,
    background: '#fff',
    cursor: 'pointer'
  },

  heading: { fontSize: 22, fontWeight: 700 },

  adminBadge: {
    background: '#eef2ff',
    color: '#4f46e5',
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: 11
  },

  memberBadge: {
    background: '#f0fdf4',
    color: '#16a34a',
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: 11
  },

  progressBox: {
    background: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 25,
    border: '1px solid #eee'
  },

  progressTrack: {
    height: 8,
    background: '#eee',
    borderRadius: 6,
    overflow: 'hidden'
  },

  progressFill: {
    height: '100%',
    background: '#4f46e5'
  },

  section: {
    background: '#fff',
    padding: 20,
    borderRadius: 12,
    border: '1px solid #eee',
    marginBottom: 20
  },

  sectionTitle: { fontWeight: 600, marginBottom: 10 },

  row: { display: 'flex', gap: 10 },

  input: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: '1px solid #ddd'
  },

  btn: {
    background: '#4f46e5',
    color: '#fff',
    padding: '10px 16px',
    border: 'none',
    borderRadius: 8
  },

  taskCard: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 10,
    border: '1px solid #eee',
    marginBottom: 10
  },

  taskTitle: { fontWeight: 500 },

  taskMeta: { fontSize: 12, color: '#888' },

  completeBtn: {
    padding: '6px 12px',
    borderRadius: 6,
    background: '#4f46e5',
    color: '#fff',
    border: 'none'
  },

  doneBadge: { color: '#16a34a', fontWeight: 600 },

  empty: { textAlign: 'center', color: '#aaa' }
};