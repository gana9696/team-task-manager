import React, { useEffect, useState } from 'react';
import { getTasks, updateTask, deleteTask } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format, isPast } from 'date-fns';

const STATUS_OPTIONS = ['todo', 'in-progress', 'review', 'completed'];

export default function Tasks() {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getTasks()
      .then(res => setTasks(res.data.tasks))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const res = await updateTask(id, { status });
      setTasks(tasks.map(t => t._id === id ? res.data.task : t));
      toast.success('Updated');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete task?')) return;
    try {
      await deleteTask(id);
      setTasks(tasks.filter(t => t._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
  };

  const filtered = tasks.filter(t => {
    const matchStatus = filter === 'all' ? true : t.status === filter;
    const matchSearch = search ? t.title.toLowerCase().includes(search.toLowerCase()) || t.assignedTo?.name.toLowerCase().includes(search.toLowerCase()) : true;
    return matchStatus && matchSearch;
  });

  if (loading) return <div className="loader-full"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1>All Tasks</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <input placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 200 }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', ...STATUS_OPTIONS].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(s)}>
            {s === 'all' ? 'All' : s.replace('-', ' ')}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Deadline</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>No tasks found</td></tr>
              ) : filtered.map(task => {
                const isOverdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== 'completed';
                return (
                  <tr key={task._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{task.title}</div>
                      {isOverdue && <span className="badge badge-overdue" style={{ marginTop: 4 }}>Overdue</span>}
                      {task.submittedAt && <div style={{ fontSize: 11, color: 'var(--success)', marginTop: 2 }}>✓ Submitted</div>}
                    </td>
                    <td style={{ color: 'var(--text2)' }}>{task.project?.name}</td>
                    <td>{task.assignedTo?.name || <span style={{ color: 'var(--text3)' }}>Unassigned</span>}</td>
                    <td><span className={`badge badge-${task.priority}`}>{task.priority}</span></td>
                    <td>
                      {isAdmin ? (
                        <select value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)} style={{ fontSize: 12, padding: '4px 8px' }}>
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
                        </select>
                      ) : (
                        <span className={`badge badge-${task.status}`}>{task.status.replace('-', ' ')}</span>
                      )}
                    </td>
                    <td style={{ fontSize: 13, color: isOverdue ? 'var(--danger)' : 'var(--text2)' }}>
                      {task.deadline ? format(new Date(task.deadline), 'MMM dd, yyyy') : '—'}
                    </td>
                    {isAdmin && (
                      <td>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}
                          onClick={() => handleDelete(task._id)}>🗑</button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
