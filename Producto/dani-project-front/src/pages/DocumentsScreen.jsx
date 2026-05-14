/* eslint-disable */
import React, { useState, useContext } from 'react';
import { 
  FileText, Search, Filter, Plus, Download, 
  MoreHorizontal, CheckCircle2, Clock, Edit3, FileSignature 
} from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';

const DocumentsScreen = () => {
  const { theme: t, language, darkMode } = useContext(ThemeContext);
  
  // ==========================================
  // 1. ESTADOS LOCALES
  // ==========================================
  const [activeTab, setActiveTab] = useState('all'); // all, approved, review, drafts
  const [searchQuery, setSearchQuery] = useState('');

  // ==========================================
  // 2. DATOS DE DEMOSTRACIÓN (Basados en el Gist)
  // ==========================================
  const documents = [
    { id: 'POL-001', name: 'Política de Seguridad de la Información', type: 'Política', version: 'v2.1', status: 'approved', date: '2024-05-10', author: 'Ana Martínez' },
    { id: 'PRO-005', name: 'Procedimiento de Gestión de Incidentes', type: 'Procedimiento', version: 'v1.4', status: 'review', date: '2024-05-12', author: 'Carlos López' },
    { id: 'MAN-002', name: 'Manual de Clasificación de Activos', type: 'Manual', version: 'v1.0', status: 'draft', date: '2024-05-13', author: 'Jordy Mondaca' },
    { id: 'POL-003', name: 'Política de Control de Accesos', type: 'Política', version: 'v3.0', status: 'approved', date: '2024-04-28', author: 'Ana Martínez' },
    { id: 'PRO-012', name: 'Procedimiento de Copias de Seguridad', type: 'Procedimiento', version: 'v2.0', status: 'review', date: '2024-05-14', author: 'Pedro Sánchez' }
  ];

  // Filtro de documentos según la pestaña activa
  const filteredDocs = documents.filter(doc => {
    const matchesTab = activeTab === 'all' || doc.status === activeTab;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || doc.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Funciones auxiliares para estilos de estado
  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': 
        return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', text: 'Aprobado', icon: CheckCircle2 };
      case 'review': 
        return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', text: 'En Revisión', icon: Clock };
      case 'draft': 
        return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', text: 'Borrador', icon: Edit3 };
      default: 
        return { bg: t.inputBg, color: t.textDim, text: 'Desconocido', icon: FileText };
    }
  };

  // ==========================================
  // 3. RENDERIZADO VISUAL
  // ==========================================
  return (
    <div style={{ animation: 'fadeIn 0.4s ease', color: t.text, display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Gestor Documental</h1>
          <p style={{ color: t.textDim, fontSize: '15px' }}>Repositorio centralizado de políticas, manuales y procedimientos</p>
        </div>
        <button style={{ padding: '10px 20px', background: '#10b981', border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
          <Plus size={18} /> Crear Documento
        </button>
      </div>

      {/* ÁREA PRINCIPAL */}
      <div style={{ background: t.cardBg, borderRadius: '20px', border: `1px solid ${t.border}`, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Pestañas de Navegación */}
        <div style={{ padding: '0 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', gap: '32px' }}>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'approved', label: 'Aprobados' },
            { id: 'review', label: 'En Revisión' },
            { id: 'draft', label: 'Borradores' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ 
                padding: '20px 0', background: 'transparent', border: 'none', 
                borderBottom: activeTab === tab.id ? `3px solid #10b981` : '3px solid transparent',
                color: activeTab === tab.id ? '#10b981' : t.textDim,
                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
              <span style={{ marginLeft: '8px', padding: '2px 8px', borderRadius: '10px', background: activeTab === tab.id ? 'rgba(16, 185, 129, 0.1)' : t.inputBg, fontSize: '11px', color: activeTab === tab.id ? '#10b981' : t.textMuted }}>
                {tab.id === 'all' ? documents.length : documents.filter(d => d.status === tab.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Barra de Búsqueda y Filtros */}
        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${t.border}` }}>
          <div style={{ position: 'relative', width: '350px' }}>
            <Search size={18} color={t.textDim} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Buscar documento por nombre o ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '12px 14px 12px 42px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '12px', color: t.text, fontSize: '13px', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ padding: '10px 16px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '10px', color: t.textDim, fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} /> Filtros Avanzados
            </button>
          </div>
        </div>

        {/* Tabla de Documentos */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: t.textDim, textTransform: 'uppercase', letterSpacing: '1px' }}>Nombre del Documento</th>
                <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: t.textDim, textTransform: 'uppercase', letterSpacing: '1px' }}>Estado</th>
                <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: t.textDim, textTransform: 'uppercase', letterSpacing: '1px' }}>Versión</th>
                <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: t.textDim, textTransform: 'uppercase', letterSpacing: '1px' }}>Última Act.</th>
                <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: t.textDim, textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc, idx) => {
                  const badge = getStatusBadge(doc.status);
                  const StatusIcon = badge.icon;
                  return (
                    <tr key={idx} style={{ borderBottom: `1px solid ${t.border}`, transition: 'background 0.2s', cursor: 'pointer' }}>
                      
                      {/* Nombre e ID */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: t.inputBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FileSignature size={18} color={t.textDim} />
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: t.text, marginBottom: '4px' }}>{doc.name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '11px', color: t.textDim, fontFamily: 'monospace' }}>{doc.id}</span>
                              <span style={{ fontSize: '10px', color: t.textMuted }}>•</span>
                              <span style={{ fontSize: '11px', color: t.textDim }}>{doc.type}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Estado (Badge Dinámico) */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: badge.bg, borderRadius: '8px', color: badge.color, fontSize: '12px', fontWeight: 700 }}>
                          <StatusIcon size={14} />
                          {badge.text}
                        </div>
                      </td>

                      {/* Versión */}
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: t.text }}>{doc.version}</span>
                      </td>

                      {/* Última Actualización y Autor */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontSize: '13px', color: t.text, marginBottom: '2px' }}>{doc.date}</div>
                        <div style={{ fontSize: '11px', color: t.textDim }}>por {doc.author}</div>
                      </td>

                      {/* Acciones */}
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: t.textDim, padding: '6px', borderRadius: '6px' }}>
                            <Download size={18} />
                          </button>
                          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: t.textDim, padding: '6px', borderRadius: '6px' }}>
                            <MoreHorizontal size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: t.textDim }}>
                    <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                    <p style={{ fontSize: '15px' }}>No se encontraron documentos que coincidan con tu búsqueda.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentsScreen;