/* eslint-disable */
import React, { useState, useContext } from 'react';
import { 
  Users, UserPlus, Search, Filter, MoreHorizontal, 
  Shield, Edit3, Trash2, Mail, CheckCircle2, XCircle, 
  Clock, Key, Building2, ShieldCheck
} from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';

const UserManagementScreen = () => {
  const { theme: t, language, darkMode } = useContext(ThemeContext);
  
  // ==========================================
  // 1. ESTADOS LOCALES
  // ==========================================
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  // ==========================================
  // 2. DATOS DE DEMOSTRACIÓN
  // ==========================================
  const users = [
    { id: 1, name: 'Ana Martínez', email: 'ana.martinez@empresa.com', role: 'ciso', department: 'Seguridad', status: 'active', lastLogin: 'Hace 2 horas', avatar: 'AM' },
    { id: 2, name: 'Carlos López', email: 'carlos.lopez@empresa.com', role: 'admin', department: 'Tecnología', status: 'active', lastLogin: 'Hace 5 min', avatar: 'CL' },
    { id: 3, name: 'Jordy Mondaca', email: 'j.mondaca@empresa.com', role: 'security_manager', department: 'Ciberseguridad', status: 'active', lastLogin: 'Hace 1 día', avatar: 'JM' },
    { id: 4, name: 'Pedro Sánchez', email: 'psanchez@empresa.com', role: 'auditor', department: 'Auditoría Externa', status: 'inactive', lastLogin: 'Hace 15 días', avatar: 'PS' },
    { id: 5, name: 'Laura Gómez', email: 'lgomez@empresa.com', role: 'employee', department: 'Recursos Humanos', status: 'active', lastLogin: 'Hace 3 días', avatar: 'LG' },
    { id: 6, name: 'Roberto Díaz', email: 'rdiaz@empresa.com', role: 'compliance_officer', department: 'Legal', status: 'pending', lastLogin: 'Nunca', avatar: 'RD' }
  ];

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
        <button style={{ padding: '10px 20px', background: '#3b82f6', border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
          <UserPlus size={18} /> Agregar Usuario
        </button>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {[
          { label: 'Total Usuarios', value: '245', color: '#3b82f6', icon: Users },
          { label: 'Usuarios Activos', value: '238', color: '#10b981', icon: CheckCircle2 },
          { label: 'Invitaciones Pendientes', value: '7', color: '#f59e0b', icon: Mail },
          { label: 'Equipo de Seguridad', value: '12', color: '#8b5cf6', icon: Shield }
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
                          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: t.textDim, padding: '6px', borderRadius: '6px' }}><Edit3 size={18} /></button>
                          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '6px', borderRadius: '6px' }}><Trash2 size={18} /></button>
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
    </div>
  );
};

export default UserManagementScreen;