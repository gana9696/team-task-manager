import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, createProject, deleteProject } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const statusColor = { active: 'var(--success)', 'on-hold': 'var(--warning)', completed: 'var(--text3)' };

export default function Projects() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', deadline: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  // ✅ FIX: separate fetch function
  const fetchProjects = async () => {
    try {
      const res = await getProjects();
      setProjects(res.data.projects);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: always refetch after create
  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createProject(form);

      // 🔥 MAIN FIX: re-fetch from backend
      await fetchProjects();

      setShowModal(false);
      setForm({ name: '', description: '', deadline: '' });

      toast.success('Project created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  // ✅ FIX: also refetch after delete (optional but best)
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await deleteProject(id);

      // 🔥 ensure sync
      await fetchProjects();

      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="loader-full"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Projects</h1>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="empty-state card">
          <div className="icon">📁</div>
          <p>{isAdmin ? 'Create your first project!' : 'You are not in any project yet.'}</p>
        </div>
      ) : (
        <div className="grid-2">
          {projects.map(p => (
            <div key={p._id} className="card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: statusColor[p.status],
                    display: 'inline-block'
                  }} />
                  <h3 style={{ fontSize: 16 }}>{p.name}</h3>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--danger)' }}
                  >
                    🗑
                  </button>
                )}
              </div>

              {p.description && (
                <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 12 }}>
                  {p.description}
                </p>
              )}

              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>
                  👥 {p.members?.length || 0} members
                </span>

                {p.deadline && (
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>
                    📅 {format(new Date(p.deadline), 'MMM dd, yyyy')}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <Link to={`/projects/${p._id}`} className="btn btn-primary btn-sm">
                  View Project →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={e => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="modal">
            <h2>📁 Create New Project</h2>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  placeholder="E.g. Website Redesign"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  placeholder="What is this project about?"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}