import React, { useEffect, useState } from 'react';
import { getMyTasks, updateTask, submitTask } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format, isPast } from 'date-fns';

export default function MyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [submissionNote, setSubmissionNote] = useState('');

  useEffect(() => {
    getMyTasks()
      .then(res => setTasks(res.data.tasks))
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false));
  }, []);

  const handleStart = async (id) => {
    try {
      const res = await updateTask(id, { status: 'in-progress' });
      setTasks(tasks.map(t => t._id === id ? res.data.task : t));
      toast.success('Task started!');
    } catch { toast.error('Failed'); }
  };

  const handleSubmit = async (id) => {
    try {
      const res = await submitTask(id, { submissionNote });
      setTasks(tasks.map(t => t._id === id ? res.data.task : t));
      setSelected(null);
      setSubmissionNote('');
      toast.success('Task submitted for review!');
    } catch { toast.error('Failed to submit'); }
  };

  const filtered = tasks.filter(t => filter === 'all' ? true : t.status === filter);

  const getStatusStep = (status) => {
    const steps = ['todo', 'in-progress', 'review', 'completed'];
    return steps.indexOf(status);
  };

  if (loading) return <div className="loader-full"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Tasks</h1>
          <p style={{ color: 'var(--text2)', marginTop: 4 }}>Tasks assigned to you</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'todo', 'in-progress', 'review', 'completed'].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(s)}>
            {s === 'all' ? `All (${tasks.length})` : `${s.replace('-', ' ')} (${tasks.filter(t => t.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state card"><div className="icon">📭</div><p>No tasks here</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(task => {
            const isOverdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== 'completed';
            const step = getStatusStep(task.status);
            return (
              <div key={task._id} className="card" style={{ borderLeft: `4px solid ${isOverdue ? 'var(--danger)' : ['var(--text3)','var(--accent)','var(--warning)','var(--success)'][step]}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 16 }}>{task.title}</h3>
                      {isOverdue && <span className="badge badge-overdue">Overdue</span>}
                    </div>
                    {task.description && <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 8 }}>{task.description}</p>}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', fontSize: 13 }}>
                      <span style={{ color: 'var(--text3)' }}>📁 {task.project?.name}</span>
                      {task.deadline && <span style={{ color: isOverdue ? 'var(--danger)' : 'var(--text3)' }}>📅 {format(new Date(task.deadline), 'MMM dd, yyyy')}</span>}
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                    </div>
                    {task.submittedAt && (
                      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--success)' }}>
                        ✓ Submitted on {format(new Date(task.submittedAt), 'MMM dd, yyyy HH:mm')}
                        {task.submissionNote && ` — "${task.submissionNote}"`}
                      </div>
                    )}
                  </div>

                  {/* Status pipeline */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                    <span className={`badge badge-${task.status}`}>{task.status.replace('-', ' ')}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {['todo','in-progress','review','completed'].map((s, i) => (
                        <div key={s} style={{ width: 24, height: 6, borderRadius: 3, background: i <= step ? 'var(--accent)' : 'var(--border)' }} title={s} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {task.status === 'todo' && (
                    <button className="btn btn-primary btn-sm" onClick={() => handleStart(task._id)}>▶ Start Task</button>
                  )}
                  {task.status === 'in-progress' && (
                    <button className="btn btn-success btn-sm" onClick={() => setSelected(task._id)}>📤 Submit Task</button>
                  )}
                  {task.status === 'review' && (
                    <span style={{ fontSize: 13, color: 'var(--warning)' }}>⏳ Waiting for admin review...</span>
                  )}
                  {task.status === 'completed' && (
                    <span style={{ fontSize: 13, color: 'var(--success)' }}>🎉 Completed!</span>
                  )}
                </div>

                {/* Submit panel */}
                {selected === task._id && (
                  <div style={{ marginTop: 14, padding: 14, background: 'rgba(67,233,123,0.07)', borderRadius: 8, border: '1px solid rgba(67,233,123,0.2)' }}>
                    <div className="form-group">
                      <label>Submission Note</label>
                      <textarea rows={2} placeholder="What did you complete? Any notes for the admin?" value={submissionNote}
                        onChange={e => setSubmissionNote(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-success btn-sm" onClick={() => handleSubmit(task._id)}>✓ Confirm Submit</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
