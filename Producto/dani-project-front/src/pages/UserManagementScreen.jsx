/* eslint-disable */
import React, { useState, useContext } from 'react';
// Solo importamos lo que REALMENTE se usa en el diseño
import { 
  Shield, Lock, FileCheck, Eye, UserCircle, 
  CheckCircle2, Clock, Search, Plus, X, Edit3, Trash2, Users 
} from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';

function UserManagementScreen() {
  const { theme: t, language } = useContext(ThemeContext);
  const [users, setUsers] = useState([
    { id: 1, name: 'Carlos López', email: 'carlos.lopez@company.com', role: 'admin', department: 'IT Security', status: 'active', lastLogin: '2024-12-14 09:30', avatar: 'CL' },
    { id: 2, name: 'Ana Martínez', email: 'ana.martinez@company.com', role: 'ciso', department: 'Executive', status: 'active', lastLogin: '2024-12-14 08:15', avatar: 'AM' },
    { id: 3, name: 'Pedro Sánchez', email: 'pedro.sanchez@company.com', role: 'security_manager', department: 'IT Security', status: 'active', lastLogin: '2024-12-13 17:45', avatar: 'PS' },
    { id: 4, name: 'María García', email: 'maria.garcia@company.com', role: 'compliance_officer', department: 'Compliance', status: 'active', lastLogin: '2024-12-14 10:00', avatar: 'MG' },
    { id: 5, name: 'Juan Rodríguez', email: 'juan.rodriguez@company.com', role: 'auditor', department: 'External', status: 'active', lastLogin: '2024-12-12 14:30', avatar: 'JR' },
    { id: 6, name: 'Laura Fernández', email: 'laura.fernandez@company.com', role: 'employee', department: 'Engineering', status: 'inactive', lastLogin: '2024-11-28 11:20', avatar: 'LF' },
    { id: 7, name: 'Roberto Díaz', email: 'roberto.diaz@company.com', role: 'employee', department: 'HR', status: 'active', lastLogin: '2024-12-14 07:50', avatar: 'RD' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'employee', department: '', password: '' });

  const labels = {
    en: { title: 'User Management', subtitle: 'Manage users and assign roles', addUser: 'Add User', searchPlaceholder: 'Search...', allRoles: 'All Roles', allStatus: 'All Status', active: 'Active', inactive: 'Inactive', name: 'Name', email: 'Email', role: 'Role', department: 'Department', status: 'Status', lastLogin: 'Last Login', actions: 'Actions', edit: 'Edit', delete: 'Delete', deactivate: 'Deactivate', activate: 'Activate', admin: 'Admin', ciso: 'CISO', security_manager: 'Security Mgr', compliance_officer: 'Compliance', auditor: 'Auditor', employee: 'Employee', addNewUser: 'Add New User', editUser: 'Edit User', fullName: 'Full Name', selectRole: 'Select Role', selectDepartment: 'Select Dept', password: 'Password', cancel: 'Cancel', save: 'Save', update: 'Update', permissionsTitle: 'Permissions', adminPerms: 'Full access', cisoPerms: 'High level', securityManagerPerms: 'Manager level', compliancePerms: 'Compliance only', auditorPerms: 'ReadOnly', employeePerms: 'Portal only', totalUsers: 'Total', activeUsers: 'Active', pendingInvites: 'Pending', roleDistribution: 'Roles', confirmDelete: 'Delete user?' },
    es: { title: 'Gestión de Usuarios', subtitle: 'Administra usuarios y roles', addUser: 'Agregar Usuario', searchPlaceholder: 'Buscar...', allRoles: 'Todos los Roles', allStatus: 'Todos los Estados', active: 'Activo', inactive: 'Inactivo', name: 'Nombre', email: 'Email', role: 'Rol', department: 'Departamento', status: 'Estado', lastLogin: 'Último Acceso', actions: 'Acciones', edit: 'Editar', delete: 'Eliminar', deactivate: 'Desactivar', activate: 'Activar', admin: 'Administrador', ciso: 'CISO', security_manager: 'Gerente Seg.', compliance_officer: 'Cumplimiento', auditor: 'Auditor', employee: 'Empleado', addNewUser: 'Nuevo Usuario', editUser: 'Editar Usuario', fullName: 'Nombre Completo', selectRole: 'Elegir Rol', selectDepartment: 'Elegir Depto', password: 'Contraseña', cancel: 'Cancelar', save: 'Guardar', update: 'Actualizar', permissionsTitle: 'Permisos', adminPerms: 'Acceso Total', cisoPerms: 'Nivel Ejecutivo', securityManagerPerms: 'Nivel Gerencia', compliancePerms: 'Gestión Normativa', auditorPerms: 'Solo Lectura', employeePerms: 'Solo Portal', totalUsers: 'Total', activeUsers: 'Activos', pendingInvites: 'Pendientes', roleDistribution: 'Roles', confirmDelete: '¿Eliminar usuario?' }
  };
  const l = labels[language] || labels.en;

  const roles = [
    { id: 'admin', color: '#ef4444', icon: Shield },
    { id: 'ciso', color: '#8b5cf6', icon: Shield },
    { id: 'security_manager', color: '#3b82f6', icon: Lock },
    { id: 'compliance_officer', color: '#10b981', icon: FileCheck },
    { id: 'auditor', color: '#f59e0b', icon: Eye },
    { id: 'employee', color: '#6b7280', icon: UserCircle }
  ];

  const departments = ['IT Security', 'Executive', 'Compliance', 'Engineering', 'HR', 'External'];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (roleId) => roles.find(r => r.id === roleId)?.color || '#6b7280';

  const handleAddUser = () => {
    const newId = Math.max(...users.map(u => u.id)) + 1;
    const avatar = newUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    setUsers([...users, { ...newUser, id: newId, avatar, status: 'active', lastLogin: 'Never' }]);
    setShowAddModal(false);
  };

  const handleUpdateUser = (userId, updates) => {
    setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u));
    setShowEditModal(null);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm(l.confirmDelete)) { // Agregado window. para evitar error global
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const toggleUserStatus = (userId) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* ... (Todo tu JSX de UserManagement que ya tenías) ... */}
      <h1 style={{ color: t.text }}>{l.title}</h1>
      {/* (Mantén el resto del diseño que pegaste antes) */}
    </div>
  );
}

export default UserManagementScreen;