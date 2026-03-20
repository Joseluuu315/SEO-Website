import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const Admin = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'trial',
    temporaryUntil: ''
  });

  const isSuperAdmin = user?.email === 'joselufupa2016@gmail.com';

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3500);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      showMsg('Error cargando usuarios', 'error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    fetchUsers();
  }, [isSuperAdmin, fetchUsers]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error creando usuario');
      showMsg('Usuario creado exitosamente', 'success');
      setShowCreateModal(false);
      setFormData({ username: '', email: '', password: '', role: 'trial', temporaryUntil: '' });
      fetchUsers();
    } catch (err) {
      showMsg(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error actualizando usuario');
      showMsg('Usuario actualizado exitosamente', 'success');
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({ username: '', email: '', password: '', role: 'trial', temporaryUntil: '' });
      fetchUsers();
    } catch (err) {
      showMsg(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error eliminando usuario');
      showMsg('Usuario eliminado exitosamente', 'success');
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      showMsg(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          subject: e.target.subject.value,
          message: e.target.message.value
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error enviando email');
      showMsg('Email enviado exitosamente', 'success');
      setShowEmailModal(false);
      setSelectedUser(null);
    } catch (err) {
      showMsg(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-rose-500';
      case 'paid': return 'bg-amber-500';
      case 'trial': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'paid': return 'Premium';
      case 'trial': return 'Trial';
      default: return 'Desconocido';
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      temporaryUntil: user.temporaryUntil ? new Date(user.temporaryUntil).toISOString().slice(0, 16) : ''
    });
    setShowEditModal(true);
  };

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070711] text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
          <p className="text-white/60">No tienes permisos de administrador.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen relative overflow-x-hidden bg-[#070711] text-white">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-violet-600/12 blur-[100px]" />
          <div className="absolute top-1/3 -right-48 h-[420px] w-[420px] rounded-full bg-fuchsia-500/10 blur-[90px]" />
          <div className="absolute -bottom-60 left-1/3 h-[480px] w-[480px] rounded-full bg-indigo-500/10 blur-[110px]" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-4 py-12">
          <div className="mb-8">
            <p className="text-[10px] font-bold tracking-[0.35em] text-violet-400/70 uppercase mb-2">Administración</p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">Panel de Administración</h1>
            <p className="mt-2 text-sm text-white/40">Gestiona usuarios, roles y acciones administrativas.</p>
          </div>

          {message.text && (
            <div className={`slide-in mb-6 rounded-2xl border px-5 py-4 text-sm font-medium ${
              message.type === 'error'
                ? 'border-rose-500/20 bg-rose-500/8 text-rose-300'
                : message.type === 'info'
                ? 'border-white/10 bg-white/5 text-white/60'
                : 'border-emerald-500/20 bg-emerald-500/8 text-emerald-300'
            }`}>
              {message.text}
            </div>
          )}

          <div className="rounded-3xl border border-white/6 bg-white/3 backdrop-blur-xl p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Usuarios Registrados ({users.length})</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-gradient rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition"
              >
                + Crear Usuario
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-3 text-white/60">Usuario</th>
                    <th className="text-left p-3 text-white/60">Email</th>
                    <th className="text-left p-3 text-white/60">Rol</th>
                    <th className="text-left p-3 text-white/60">Estado</th>
                    <th className="text-left p-3 text-white/60">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-xs`}>
                            {user.username?.slice(0, 2).toUpperCase()}
                          </div>
                          <span>{user.username}</span>
                        </div>
                      </td>
                      <td className="p-3 text-white/80">{user.email}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase ${getRoleColor(user.role)} bg-clip-text`}
                          style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                          ● {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="p-3">
                        {user.temporaryUntil ? (
                          <div>
                            <span className="text-amber-400">Temporal</span>
                            <div className="text-xs text-white/50">
                              hasta {new Date(user.temporaryUntil).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-emerald-400">Activo</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/10 transition"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEmailModal(true);
                            }}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/10 transition"
                          >
                            Email
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteModal(true);
                            }}
                            className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-100 hover:bg-rose-500/15 transition"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-3xl border border-white/10 p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4 text-white">Crear Nuevo Usuario</h3>
            <form onSubmit={handleCreateUser}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold tracking-widest text-white/60">Nombre de usuario</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={e => setFormData({ ...formData, username: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold tracking-widest text-white/60">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold tracking-widest text-white/60">Contraseña</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold tracking-widest text-white/60">Rol</label>
                    <select
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
                    >
                      <option value="trial">Trial (Gratis)</option>
                      <option value="paid">Premium</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold tracking-widest text-white/60">Rol Temporal (opcional)</label>
                  <input
                    type="datetime-local"
                    value={formData.temporaryUntil}
                    onChange={e => setFormData({ ...formData, temporaryUntil: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
                  />
                  <p className="mt-1 text-xs text-white/40">Dejar en blanco para rol permanente</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gradient rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-3xl border border-white/10 p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4 text-white">Editar Usuario</h3>
            <form onSubmit={handleUpdateUser}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold tracking-widest text-white/60">Nombre de usuario</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={e => setFormData({ ...formData, username: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold tracking-widest text-white/60">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold tracking-widest text-white/60">Nueva Contraseña</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
                    />
                    <p className="mt-1 text-xs text-white/40">Dejar en blanco para no cambiar</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold tracking-widest text-white/60">Rol</label>
                    <select
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
                    >
                      <option value="trial">Trial (Gratis)</option>
                      <option value="paid">Premium</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold tracking-widest text-white/60">Rol Temporal</label>
                  <input
                    type="datetime-local"
                    value={formData.temporaryUntil}
                    onChange={e => setFormData({ ...formData, temporaryUntil: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
                  />
                  <p className="mt-1 text-xs text-white/40">Dejar en blanco para rol permanente</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gradient rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'Actualizando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-3xl border border-white/10 p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4 text-white">Confirmar Eliminación</h3>
            <p className="text-white/80 mb-6">
              ¿Estás seguro de eliminar al usuario <strong>{selectedUser.username}</strong> ({selectedUser.email})? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-6 py-2.5 text-sm font-semibold text-rose-100 hover:bg-rose-500/15 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Email Modal */}
      {showEmailModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-3xl border border-white/10 p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4 text-white">Enviar Email</h3>
            <form onSubmit={handleSendEmail}>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold tracking-widest text-white/60">Para</label>
                  <input
                    type="text"
                    defaultValue={selectedUser.email}
                    disabled
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white/60"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold tracking-widest text-white/60">Asunto</label>
                  <input
                    type="text"
                    placeholder="Asunto del email"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold tracking-widest text-white/60">Mensaje</label>
                  <textarea
                    placeholder="Escribe tu mensaje aquí..."
                    rows={4}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gradient rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'Enviando...' : 'Enviar Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Admin;
