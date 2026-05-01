import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getMyTasks, getTasks } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format, isPast } from 'date-fns';

const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status}`}>{status.replace('-', ' ')}</span>
);

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 FETCH FUNCTION (reusable)
  const fetchData = async () => {
    try {
      const [statsRes, tasksRes] = await Promise.all([
        getDashboardStats(),
        isAdmin ? getTasks() : getMyTasks()
      ]);

      setStats(statsRes.data.stats);
      setRecentTasks((tasksRes.data.tasks || []).slice(0, 5));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 AUTO REFRESH + INITIAL LOAD
  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 3000); // every 3 sec

    return () => clearInterval(interval);
  }, [isAdmin]);

  if (loading) return <div className="loader-full"><div className="spinner" /></div>;

  const statCards = [
    { label: 'Total Tasks', value: stats?.total || 0, icon: '📋', color: 'var(--accent)' },
    { label: 'In Progress', value: stats?.inProgress || 0, icon: '🔄', color: 'var(--info)' },
    { label: 'Completed', value: stats?.completed || 0, icon: '✅', color: 'var(--success)' },
    { label: 'Overdue', value: stats?.overdue || 0, icon: '⚠️', color: 'var(--danger)' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: 'var(--text2)', marginTop: 4 }}>
            Welcome back, {user?.name} 👋
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {/* 🔥 Manual Refresh Button */}
          <button onClick={fetchData} className="btn btn-sm">
            🔄 Refresh
          </button>

          {isAdmin && (
            <Link to="/projects" className="btn btn-primary">
              + New Project
            </Link>
          )}
        </div>
      </div>

      {/* 🔥 STAT CARDS */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {statCards.map((s, i) => (
          <div key={i} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 🔥 PROGRESS BAR */}
      {stats?.total > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: 15 }}>📊 Overall Progress</h3>

          <div style={{
            display: 'flex',
            gap: 4,
            height: 12,
            borderRadius: 6,
            overflow: 'hidden'
          }}>
            {stats.todo > 0 && <div style={{ flex: stats.todo, background: 'var(--border)' }} />}
            {stats.inProgress > 0 && <div style={{ flex: stats.inProgress, background: 'var(--accent)' }} />}
            {stats.review > 0 && <div style={{ flex: stats.review, background: 'var(--warning)' }} />}
            {stats.completed > 0 && <div style={{ flex: stats.completed, background: 'var(--success)' }} />}
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
            <span>Todo: {stats.todo}</span>
            <span>In Progress: {stats.inProgress}</span>
            <span>Review: {stats.review}</span>
            <span>Completed: {stats.completed}</span>
          </div>
        </div>
      )}

      {/* 🔥 RECENT TASKS */}
      <div className="card">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16
        }}>
          <h3 style={{ fontSize: 15 }}>🕐 Recent Tasks</h3>

          <Link to={isAdmin ? '/tasks' : '/my-tasks'}>
            View all →
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📭</div>
            <p>No tasks yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentTasks.map(task => (
              <div key={task._id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: 'var(--bg3)',
                borderRadius: 8
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{task.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                    {task.project?.name} • {task.assignedTo?.name}
                  </div>
                </div>

                <StatusBadge status={task.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}