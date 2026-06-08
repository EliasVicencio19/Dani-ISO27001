/* eslint-disable */
import React, { useState, useEffect, useContext } from 'react';
import { 
  Users, UserPlus, Search, Filter, MoreHorizontal, 
  Shield, Edit3, Trash2, Mail, CheckCircle2, XCircle, 
  Clock, Key, Building2, ShieldCheck
} from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';
import { userAPI } from '../services/api';

const UserManagementScreen = () => {
  const { theme: t, language, darkMode } = useContext(ThemeContext);
  
  // ==========================================
  // 1. ESTADOS LOCALES
  // ==========================================
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  // Modal de Crear Usuario
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ full_name: '', email: '', password: '', role: 'employee', department: 'General' });
  const [isCreating, setIsCreating] = useState(false);

  // Modal de Editar Usuario
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Estado de eliminación
  const [isDeleting, setIsDeleting] = useState(null);

  // ==========================================
  // 2. CONEXIÓN REAL CON EL BACKEND
  // ==========================================
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    try {
      const data = await userAPI.getAll();
      if (data && Array.isArray(data)) {
        const mappedUsers = data.map(u => {
          const fullName = u.full_name || 'Usuario';
          return {
            id: u.id,
            name: fullName,
            email: u.email,
            role: u.role || 'employee',
            department: u.department || 'General',
            status: u.is_active ? 'active' : 'inactive',
            lastLogin: u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Nunca',
            avatar: fullName.substring(0, 2).toUpperCase()
          };
        });
        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error("Error conectando con la API de Usuarios:", error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await userAPI.create(newUser);
      setIsAddModalOpen(false);
      setNewUser({ full_name: '', email: '', password: '', role: 'employee', department: 'General' });
      await loadUsers(); // Refrescar tabla automáticamente
    } catch (error) {
      console.error("Error creando usuario:", error);
      alert("Error al crear usuario: " + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEdit = (user, e) => {
    e.stopPropagation();
    setEditingUser({ id: user.id, full_name: user.name, email: user.email, role: user.role, is_active: user.status === 'active' });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await userAPI.update(editingUser.id, {
        full_name: editingUser.full_name,
        email: editingUser.email,
        role: editingUser.role,
        is_active: editingUser.is_active
      });
      setIsEditModalOpen(false);
      setEditingUser(null);
      await loadUsers();
    } catch (error) {
      console.error("Error actualizando usuario:", error);
      alert("Error al actualizar usuario: " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (userId, e) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) return;
    setIsDeleting(userId);
    try {
      await userAPI.delete(userId);
      if (selectedUser?.id === userId) setSelectedUser(null);
      await loadUsers();
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      alert("Error al eliminar usuario: " + error.message);
    } finally {
      setIsDeleting(null);
    }
  };

  // Configuración visual de Roles
  const rolesConfig = {
    admin: { label: 'Administrador', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)', icon: Shield },
    ciso: { label: 'CISO', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: ShieldCheck },
    security_manager: { label: 'Gerente de Seguridad', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', icon: Key },
    compliance_officer: { label: 'Oficial de Cumplimiento', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: Building2 },
    auditor: { label: 'Auditor', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: Search },
    employee: { label: 'Empleado', color: t.textDim, bg: t.inputBg, icon: Users }
  };

  // Filtrado
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // ==========================================
  // 3. RENDERIZADO VISUAL
  // ==========================================
  return (
    <div style={{ animation: 'fadeIn 0.4s ease', color: t.text, display: 'flex', flexDirection: 'column', gap: '24px', height: '100%', paddingBottom: '24px' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Gestión de Usuarios</h1>
          <p style={{ color: t.textDim, fontSize: '15px' }}>Administra accesos y asigna roles para cumplimiento ISO 27001</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          style={{ padding: '10px 20px', background: '#3b82f6', border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}
        >
          <UserPlus size={18} /> Agregar Usuario
        </button>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {[
          { label: 'Total Usuarios', value: users.length, color: '#3b82f6', icon: Users },
          { label: 'Usuarios Activos', value: users.filter(u => u.status === 'active').length, color: '#10b981', icon: CheckCircle2 },
          { label: 'Inactivos / Pendientes', value: users.filter(u => u.status !== 'active').length, color: '#f59e0b', icon: Mail },
          { label: 'Equipo de Seguridad', value: users.filter(u => ['ciso', 'security_manager', 'admin'].includes(u.role)).length, color: '#8b5cf6', icon: Shield }
        ].map((stat, idx) => (
          <div key={idx} style={{ background: t.cardBg, borderRadius: '16px', border: `1px solid ${t.border}`, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon size={24} color={stat.color} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: t.text, lineHeight: '1.2' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: t.textDim, fontWeight: 500, marginTop: '2px' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', flex: 1, minHeight: 0 }}>
        
        {/* PANEL IZQUIERDO: TABLA DE USUARIOS */}
        <div style={{ background: t.cardBg, borderRadius: '20px', border: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Barra de Búsqueda y Filtros */}
          <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${t.border}` }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
              <Search size={18} color={t.textDim} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Buscar usuarios..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 14px 10px 42px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ padding: '10px 16px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, fontSize: '13px', fontWeight: 500, cursor: 'pointer', outline: 'none' }}>
                <option value="all">Todos los Roles</option>
                <option value="admin">Administrador</option>
                <option value="ciso">CISO</option>
                <option value="security_manager">Gerente de Seguridad</option>
                <option value="auditor">Auditor</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '10px 16px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, fontSize: '13px', fontWeight: 500, cursor: 'pointer', outline: 'none' }}>
                <option value="all">Todos los Estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
                <option value="pending">Pendientes</option>
              </select>
            </div>
          </div>

          {/* Tabla */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                  <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: t.textDim, textTransform: 'uppercase', letterSpacing: '1px' }}>Usuario</th>
                  <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: t.textDim, textTransform: 'uppercase', letterSpacing: '1px' }}>Rol</th>
                  <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: t.textDim, textTransform: 'uppercase', letterSpacing: '1px' }}>Departamento</th>
                  <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: t.textDim, textTransform: 'uppercase', letterSpacing: '1px' }}>Estado</th>
                  <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: t.textDim, textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const rConfig = rolesConfig[user.role] || rolesConfig.employee;
                  const isSelected = selectedUser?.id === user.id;

                  return (
                    <tr 
                      key={user.id} 
                      onClick={() => setSelectedUser(user)}
                      style={{ 
                        borderBottom: `1px solid ${t.border}`, 
                        background: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                        transition: 'background 0.2s', cursor: 'pointer' 
                      }}
                    >
                      {/* Avatar, Nombre y Email */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
                            {user.avatar}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: t.text, marginBottom: '2px' }}>{user.name}</div>
                            <div style={{ fontSize: '12px', color: t.textDim }}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Rol (Badge) */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', background: rConfig.bg, borderRadius: '8px', color: rConfig.color, fontSize: '11px', fontWeight: 700 }}>
                          <rConfig.icon size={12} />
                          {rConfig.label}
                        </div>
                      </td>

                      {/* Departamento */}
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ fontSize: '13px', color: t.text }}>{user.department}</span>
                      </td>

                      {/* Estado */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ 
                            width: '8px', height: '8px', borderRadius: '50%', 
                            background: user.status === 'active' ? '#10b981' : user.status === 'inactive' ? '#ef4444' : '#f59e0b',
                            boxShadow: `0 0 8px ${user.status === 'active' ? '#10b981' : user.status === 'inactive' ? '#ef4444' : '#f59e0b'}60`
                          }} />
                          <span style={{ fontSize: '12px', color: t.textDim, textTransform: 'capitalize' }}>
                            {user.status === 'active' ? 'Activo' : user.status === 'inactive' ? 'Inactivo' : 'Pendiente'}
                          </span>
                        </div>
                      </td>

                      {/* Acciones */}
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={(e) => handleOpenEdit(user, e)}
                            title="Editar usuario"
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: t.textDim, padding: '6px', borderRadius: '6px' }}
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteUser(user.id, e)}
                            disabled={isDeleting === user.id}
                            title="Eliminar usuario"
                            style={{ background: 'transparent', border: 'none', cursor: isDeleting === user.id ? 'not-allowed' : 'pointer', color: '#ef4444', padding: '6px', borderRadius: '6px', opacity: isDeleting === user.id ? 0.5 : 1 }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* PANEL DERECHO: DETALLES Y PERMISOS DEL ROL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ background: t.cardBg, borderRadius: '20px', border: `1px solid ${t.border}`, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <ShieldCheck size={20} color="#3b82f6" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: t.text }}>Permisos del Rol</h3>
            </div>

            {selectedUser ? (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: 700, margin: '0 auto 12px' }}>
                    {selectedUser.avatar}
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, color: t.text }}>{selectedUser.name}</h4>
                  <div style={{ fontSize: '12px', color: rolesConfig[selectedUser.role]?.color || t.textDim, fontWeight: 700, marginTop: '4px' }}>
                    {rolesConfig[selectedUser.role]?.label}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '12px', background: t.inputBg, borderRadius: '10px', border: `1px solid ${t.border}` }}>
                    <div style={{ fontSize: '11px', color: t.textDim, fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Último Acceso</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: t.text }}>
                      <Clock size={14} color={t.textMuted} /> {selectedUser.lastLogin}
                    </div>
                  </div>

                  <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 700, marginBottom: '8px' }}>NIVEL DE ACCESO</div>
                    <p style={{ fontSize: '13px', color: t.textDim, lineHeight: '1.5' }}>
                      {selectedUser.role === 'admin' && 'Acceso total al sistema, gestión de usuarios, configuración y todos los módulos ISO 27001.'}
                      {selectedUser.role === 'ciso' && 'Dashboard ejecutivo, reportes, supervisión de riesgos y acceso total a auditoría.'}
                      {selectedUser.role === 'security_manager' && 'Control operativo: Mapa de riesgos, centro de evidencias y análisis de brechas.'}
                      {selectedUser.role === 'compliance_officer' && 'Gestión documental, sala de auditoría y revisión de evidencias.'}
                      {selectedUser.role === 'auditor' && 'Vista de solo lectura a la sala de auditoría y visualización de evidencias aprobadas.'}
                      {selectedUser.role === 'employee' && 'Acceso exclusivo al portal de empleados para aceptación de políticas.'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: t.textDim }}>
                <Users size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                <p style={{ fontSize: '14px' }}>Selecciona un usuario de la tabla para ver sus permisos detallados.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL EDITAR USUARIO */}
      {isEditModalOpen && editingUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: t.cardBg, borderRadius: '20px', border: `1px solid ${t.border}`, width: '400px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', animation: 'fadeIn 0.2s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: t.text }}>Editar Usuario</h3>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', color: t.textDim, cursor: 'pointer' }}><XCircle size={20} /></button>
            </div>

            <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: t.textDim, marginBottom: '6px', fontWeight: 600 }}>Nombre Completo</label>
                <input required type="text" value={editingUser.full_name} onChange={e => setEditingUser({...editingUser, full_name: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, fontSize: '13px', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: t.textDim, marginBottom: '6px', fontWeight: 600 }}>Correo Electrónico</label>
                <input required type="email" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, fontSize: '13px', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: t.textDim, marginBottom: '6px', fontWeight: 600 }}>Rol en el Sistema</label>
                <select value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, fontSize: '13px', outline: 'none' }}>
                  <option value="admin">Administrador</option>
                  <option value="auditor">Auditor</option>
                  <option value="manager">Manager</option>
                  <option value="employee">Empleado</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px' }}>
                <input type="checkbox" id="is_active" checked={editingUser.is_active} onChange={e => setEditingUser({...editingUser, is_active: e.target.checked})} style={{ cursor: 'pointer' }} />
                <label htmlFor="is_active" style={{ fontSize: '13px', color: t.text, cursor: 'pointer' }}>Usuario activo</label>
              </div>

              <div style={{ marginTop: '8px', display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ flex: 1, padding: '12px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={isUpdating} style={{ flex: 1, padding: '12px', background: '#10b981', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 600, cursor: isUpdating ? 'not-allowed' : 'pointer', opacity: isUpdating ? 0.7 : 1 }}>
                  {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR USUARIO */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: t.cardBg, borderRadius: '20px', border: `1px solid ${t.border}`, width: '400px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', animation: 'fadeIn 0.2s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: t.text }}>Crear Nuevo Usuario</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', color: t.textDim, cursor: 'pointer' }}><XCircle size={20} /></button>
            </div>
            
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: t.textDim, marginBottom: '6px', fontWeight: 600 }}>Nombre Completo</label>
                <input required type="text" value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, fontSize: '13px', outline: 'none' }} placeholder="Ej: Ana Martínez" />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: t.textDim, marginBottom: '6px', fontWeight: 600 }}>Correo Electrónico</label>
                <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, fontSize: '13px', outline: 'none' }} placeholder="ana@empresa.com" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: t.textDim, marginBottom: '6px', fontWeight: 600 }}>Contraseña</label>
                <input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, fontSize: '13px', outline: 'none' }} placeholder="••••••••" />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: t.textDim, marginBottom: '6px', fontWeight: 600 }}>Rol en el Sistema</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, fontSize: '13px', outline: 'none' }}>
                  <option value="admin">Administrador</option>
                  <option value="ciso">CISO</option>
                  <option value="security_manager">Gerente de Seguridad</option>
                  <option value="auditor">Auditor</option>
                  <option value="employee">Empleado</option>
                </select>
              </div>

              <div style={{ marginTop: '8px', display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ flex: 1, padding: '12px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={isCreating} style={{ flex: 1, padding: '12px', background: '#3b82f6', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 600, cursor: isCreating ? 'not-allowed' : 'pointer', opacity: isCreating ? 0.7 : 1 }}>
                  {isCreating ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementScreen;