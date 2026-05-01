import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProject, getTasks, createTask, updateTask, deleteTask, addMember, removeMember, getMembers, submitTask, addComment, getTask } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format, isPast } from 'date-fns';

const STATUS_OPTIONS = ['todo', 'in-progress', 'review', 'completed'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];

export default function ProjectDetail() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(null);
  const [allMembers, setAllMembers] = useState([]);
  const [memberEmail, setMemberEmail] = useState('');
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', priority: 'medium', deadline: '' });
  const [saving, setSaving] = useState(false);
  const [comment, setComment] = useState('');
  const [submissionNote, setSubmissionNote] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        getProject(id),
        getTasks(id)
      ]);
      setProject(projRes.data.project);
      setTasks(taskRes.data.tasks);
      if (isAdmin) {
        const membersRes = await getMembers();
        setAllMembers(membersRes.data.members);
      }
    } catch (err) { toast.error('Failed to load project'); }
    finally { setLoading(false); }
  };

  const openTaskDetail = async (taskId) => {
    try {
      const res = await getTask(taskId);
      setShowTaskDetail(res.data.task);
      setSubmissionNote(res.data.task.submissionNote || '');
    } catch { toast.error('Failed to load task'); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await createTask({ ...taskForm, projectId: id });
      setTasks([res.data.task, ...tasks]);
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', assignedTo: '', priority: 'medium', deadline: '' });
      toast.success('Task created!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleStatusUpdate = async (taskId, status) => {
    try {
      const res = await updateTask(taskId, { status });
      setTasks(tasks.map(t => t._id === taskId ? res.data.task : t));
      if (showTaskDetail?._id === taskId) setShowTaskDetail(res.data.task);
      toast.success('Status updated!');
    } catch { toast.error('Failed'); }
  };

  const handleSubmitTask = async (taskId) => {
    try {
      const res = await submitTask(taskId, { submissionNote });
      setTasks(tasks.map(t => t._id === taskId ? res.data.task : t));
      setShowTaskDetail(res.data.task);
      toast.success('Task submitted for review!');
    } catch { toast.error('Failed to submit'); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete task?')) return;
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(t => t._id !== taskId));
      setShowTaskDetail(null);
      toast.success('Task deleted');
    } catch { toast.error('Failed'); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const res = await addMember(id, { email: memberEmail });
      setProject(res.data.project);
      setMemberEmail('');
      toast.success('Member added!');
    } catch (err) { toast.error(err.response?.data?.message || 'User not found'); }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await removeMember(id, userId);
      setProject({ ...project, members: project.members.filter(m => m.user._id !== userId) });
      toast.success('Member removed');
    } catch { toast.error('Failed'); }
  };

  const handleAddComment = async (taskId) => {
    if (!comment.trim()) return;
    try {
      const res = await addComment(taskId, { text: comment });
      setShowTaskDetail({ ...showTaskDetail, comments: res.data.comments });
      setComment('');
    } catch { toast.error('Failed'); }
  };

  const filteredTasks = tasks.filter(t => {
    if (activeTab === 'all') return true;
    if (activeTab === 'mine') return t.assignedTo?._id === user._id;
    return t.status === activeTab;
  });

  if (loading) return <div className="loader-full"><div className="spinner" /></div>;
  if (!project) return <div className="card">Project not found</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link to="/projects" style={{ fontSize: 13, color: 'var(--text2)' }}>← Projects</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 8, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28 }}>{project.name}</h1>
            {project.description && <p style={{ color: 'var(--text2)', marginTop: 4 }}>{project.description}</p>}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {isAdmin && (
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowMemberModal(true)}>👥 Members ({project.members?.length})</button>
                <button className="btn btn-primary btn-sm" onClick={() => setShowTaskModal(true)}>+ Add Task</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'todo', 'in-progress', 'review', 'completed', ...(isAdmin ? [] : ['mine'])].map(tab => (
          <button key={tab} className={`btn btn-sm ${activeTab === tab ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab(tab)}>
            {tab === 'all' ? '📋 All' : tab === 'mine' ? '👤 Mine' : tab.replace('-', ' ')}
            <span style={{ marginLeft: 4, opacity: 0.7 }}>
              {tab === 'all' ? tasks.length : tab === 'mine' ? tasks.filter(t => t.assignedTo?._id === user._id).length : tasks.filter(t => t.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Tasks grid */}
      {filteredTasks.length === 0 ? (
        <div className="empty-state card"><div className="icon">✅</div><p>No tasks here</p></div>
      ) : (
        <div className="grid-2">
          {filteredTasks.map(task => {
            const isOverdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== 'completed';
            const isMyTask = task.assignedTo?._id === user._id;
            return (
              <div key={task._id} className="task-card" onClick={() => openTaskDetail(task._id)}
                style={{ borderLeft: `3px solid ${isOverdue ? 'var(--danger)' : task.status === 'completed' ? 'var(--success)' : 'var(--accent)'}` }}>
                <div className="task-card-title">{task.title}</div>
                {task.description && <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>{task.description.substring(0, 80)}{task.description.length > 80 && '...'}</p>}
                <div className="task-card-meta">
                  <span className={`badge badge-${task.status}`}>{task.status.replace('-',' ')}</span>
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                  {isOverdue && <span className="badge badge-overdue">Overdue</span>}
                </div>
                <div className="task-card-footer">
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                    {task.assignedTo ? `👤 ${task.assignedTo.name}` : '⬜ Unassigned'}
                  </div>
                  {task.deadline && (
                    <div style={{ fontSize: 12, color: isOverdue ? 'var(--danger)' : 'var(--text3)' }}>
                      📅 {format(new Date(task.deadline), 'MMM dd')}
                    </div>
                  )}
                </div>
                {/* Member quick actions */}
                {!isAdmin && isMyTask && task.status !== 'completed' && task.status !== 'review' && (
                  <div style={{ marginTop: 10, display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                    {task.status === 'todo' && (
                      <button className="btn btn-primary btn-sm" onClick={() => handleStatusUpdate(task._id, 'in-progress')}>
                        ▶ Start
                      </button>
                    )}
                    {task.status === 'in-progress' && (
                      <button className="btn btn-success btn-sm" onClick={() => openTaskDetail(task._id)}>
                        📤 Submit
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Task Create Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowTaskModal(false)}>
          <div className="modal">
            <h2>✅ Create Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Task Title *</label>
                <input placeholder="What needs to be done?" value={taskForm.title}
                  onChange={e => setTaskForm({...taskForm, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={3} value={taskForm.description}
                  onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select value={taskForm.assignedTo} onChange={e => setTaskForm({...taskForm, assignedTo: e.target.value})}>
                  <option value="">-- Select Member --</option>
                  {project.members?.map(m => (
                    <option key={m.user._id} value={m.user._id}>{m.user.name} ({m.user.email})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                    {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Deadline</label>
                  <input type="date" value={taskForm.deadline} onChange={e => setTaskForm({...taskForm, deadline: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Management Modal */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowMemberModal(false)}>
          <div className="modal">
            <h2>👥 Team Members</h2>
            <form onSubmit={handleAddMember} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <input placeholder="Enter member email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required />
              <button type="submit" className="btn btn-primary">Add</button>
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {project.members?.map(m => (
                <div key={m.user._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg3)', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{m.user.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{m.user.email}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={`badge badge-${m.role}`}>{m.role}</span>
                    {m.role !== 'admin' && (
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}
                        onClick={() => handleRemoveMember(m.user._id)}>✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowMemberModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {showTaskDetail && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowTaskDetail(null)}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18 }}>{showTaskDetail.title}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowTaskDetail(null)}>✕</button>
            </div>

            {showTaskDetail.description && (
              <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 16 }}>{showTaskDetail.description}</p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>STATUS</div>
                {isAdmin ? (
                  <select value={showTaskDetail.status}
                    onChange={e => handleStatusUpdate(showTaskDetail._id, e.target.value)}
                    style={{ fontSize: 13 }}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
                  </select>
                ) : (
                  <span className={`badge badge-${showTaskDetail.status}`}>{showTaskDetail.status.replace('-',' ')}</span>
                )}
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>PRIORITY</div>
                <span className={`badge badge-${showTaskDetail.priority}`}>{showTaskDetail.priority}</span>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>ASSIGNED TO</div>
                <div style={{ fontSize: 14 }}>{showTaskDetail.assignedTo?.name || 'Unassigned'}</div>
              </div>
              {showTaskDetail.deadline && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>DEADLINE</div>
                  <div style={{ fontSize: 14 }}>{format(new Date(showTaskDetail.deadline), 'MMM dd, yyyy')}</div>
                </div>
              )}
              {showTaskDetail.submittedAt && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>SUBMITTED</div>
                  <div style={{ fontSize: 14, color: 'var(--success)' }}>{format(new Date(showTaskDetail.submittedAt), 'MMM dd, yyyy HH:mm')}</div>
                </div>
              )}
            </div>

            {showTaskDetail.submissionNote && (
              <div style={{ padding: 12, background: 'var(--bg3)', borderRadius: 8, marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>SUBMISSION NOTE</div>
                <p style={{ fontSize: 14 }}>{showTaskDetail.submissionNote}</p>
              </div>
            )}

            {/* Member submit section */}
            {!isAdmin && showTaskDetail.assignedTo?._id === user._id &&
              showTaskDetail.status !== 'completed' && showTaskDetail.status !== 'review' && (
              <div style={{ marginBottom: 16, padding: 16, background: 'rgba(108,99,255,0.1)', borderRadius: 8, border: '1px solid rgba(108,99,255,0.3)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginBottom: 8 }}>📤 SUBMIT YOUR WORK</div>
                <div className="form-group">
                  <label>Submission Note (optional)</label>
                  <textarea rows={2} placeholder="Describe what you did..." value={submissionNote}
                    onChange={e => setSubmissionNote(e.target.value)} />
                </div>
                <button className="btn btn-success" onClick={() => handleSubmitTask(showTaskDetail._id)}>
                  ✓ Submit for Review
                </button>
              </div>
            )}

            {/* Admin status quick update for review */}
            {isAdmin && showTaskDetail.status === 'review' && (
              <div style={{ marginBottom: 16, padding: 12, background: 'rgba(249,199,79,0.1)', borderRadius: 8, border: '1px solid rgba(249,199,79,0.3)' }}>
                <p style={{ fontSize: 13, color: 'var(--warning)', marginBottom: 10 }}>⏳ This task is in review. Mark as:</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-success btn-sm" onClick={() => handleStatusUpdate(showTaskDetail._id, 'completed')}>✅ Approve & Complete</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleStatusUpdate(showTaskDetail._id, 'in-progress')}>↩ Send Back</button>
                </div>
              </div>
            )}

            {/* Comments */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>💬 Comments ({showTaskDetail.comments?.length || 0})</div>
              <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 10 }}>
                {showTaskDetail.comments?.map((c, i) => (
                  <div key={i} style={{ marginBottom: 8, padding: '8px 12px', background: 'var(--bg3)', borderRadius: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginBottom: 2 }}>{c.user?.name}</div>
                    <div style={{ fontSize: 13 }}>{c.text}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input placeholder="Write a comment..." value={comment} onChange={e => setComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddComment(showTaskDetail._id)} />
                <button className="btn btn-primary btn-sm" onClick={() => handleAddComment(showTaskDetail._id)}>Send</button>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 16 }}>
              {isAdmin && (
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTask(showTaskDetail._id)}>🗑 Delete</button>
              )}
              <button className="btn btn-ghost" onClick={() => setShowTaskDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
