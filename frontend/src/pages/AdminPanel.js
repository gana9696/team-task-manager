import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole } from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllUsers()
      .then(res => setUsers(res.data.users))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (id, role) => {
    try {
      const res = await updateUserRole(id, { role });
      setUsers(users.map(u => u._id === id ? res.data.user : u));
      toast.success(`Role updated to ${role}`);
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="loader-full"><div className="spinner" /></div>;

  const admins = users.filter(u => u.role === 'admin');
  const members = users.filter(u => u.role === 'member');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Admin Panel</h1>
          <p style={{ color: 'var(--text2)', marginTop: 4 }}>Manage users and roles</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ borderTop: '3px solid var(--accent)' }}>
          <div className="stat-icon">👥</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{users.length}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid var(--warning)' }}>
          <div className="stat-icon">🔑</div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{admins.length}</div>
          <div className="stat-label">Admins</div>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid var(--info)' }}>
          <div className="stat-icon">👤</div>
          <div className="stat-value" style={{ color: 'var(--info)' }}>{members.length}</div>
          <div className="stat-label">Members</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>All Users</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: user.role === 'admin' ? 'var(--accent)' : 'var(--bg3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 14, border: '1px solid var(--border)'
                      }}>
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500 }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text2)', fontSize: 13 }}>{user.email}</td>
                  <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                  <td style={{ color: 'var(--text3)', fontSize: 13 }}>{format(new Date(user.createdAt), 'MMM dd, yyyy')}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={e => handleRoleChange(user._id, e.target.value)}
                      style={{ fontSize: 12, padding: '4px 8px', width: 'auto' }}
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
