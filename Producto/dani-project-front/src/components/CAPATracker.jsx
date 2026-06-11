// src/components/CAPATracker.jsx
import React, { useState } from 'react';
import { AlertTriangle, Plus, ChevronDown, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const capaLabels = {
  en: {
    title: 'CAPA Tracker',
    subtitle: 'Non-conformities & Corrective Actions (Clause 10)',
    addNonConformity: 'Add NC',
    open: 'Open', inProgress: 'In Progress', resolved: 'Resolved', closed: 'Closed',
    rootCause: 'Root Cause', correctiveAction: 'Corrective Action',
    assignee: 'Assignee', source: 'Source', viewDetails: 'View Details',
    overdue: 'Overdue', daysLeft: 'days left',
    high: 'High', medium: 'Medium', low: 'Low',
    internalAudit: 'Internal Audit', preAudit: 'Pre-Audit'
  },
  es: {
    title: 'Rastreador CAPA',
    subtitle: 'No Conformidades y Acciones Correctivas (Cláusula 10)',
    addNonConformity: 'Agregar NC',
    open: 'Abierto', inProgress: 'En Progreso', resolved: 'Resuelto', closed: 'Cerrado',
    rootCause: 'Causa Raíz', correctiveAction: 'Acción Correctiva',
    assignee: 'Responsable', source: 'Fuente', viewDetails: 'Ver Detalles',
    overdue: 'Vencido', daysLeft: 'días restantes',
    high: 'Alto', medium: 'Medio', low: 'Bajo',
    internalAudit: 'Auditoría Interna', preAudit: 'Pre-Auditoría'
  },
  pt: {
    title: 'Rastreador CAPA',
    subtitle: 'Não Conformidades e Ações Corretivas (Cláusula 10)',
    addNonConformity: 'Adicionar NC',
    open: 'Aberto', inProgress: 'Em Progresso', resolved: 'Resolvido', closed: 'Fechado',
    rootCause: 'Causa Raiz', correctiveAction: 'Ação Corretiva',
    assignee: 'Responsável', source: 'Fonte', viewDetails: 'Ver Detalhes',
    overdue: 'Atrasado', daysLeft: 'dias restantes',
    high: 'Alto', medium: 'Médio', low: 'Baixo',
    internalAudit: 'Auditoria Interna', preAudit: 'Pré-Auditoria'
  }
};

const INITIAL_CAPAS = [
  { id: 'NC-2024-015', title: 'Missing access review documentation', source: 'preAudit', status: 'inProgress', priority: 'high', dueDate: '2026-09-20', assignee: 'Carlos López', control: 'A.5.18', rootCause: 'No documented procedure for quarterly access reviews', correctiveAction: 'Implement automated access review process', progress: 60 },
  { id: 'NC-2024-014', title: 'Incomplete security awareness training', source: 'internalAudit', status: 'open', priority: 'medium', dueDate: '2026-09-25', assignee: 'Ana Martínez', control: 'A.6.3', rootCause: 'Manual tracking system with no enforcement', correctiveAction: 'Deploy LMS with mandatory completion tracking', progress: 20 },
  { id: 'NC-2024-013', title: 'Backup verification not performed monthly', source: 'internalAudit', status: 'resolved', priority: 'high', dueDate: '2026-08-10', assignee: 'Pedro Sánchez', control: 'A.8.13', rootCause: 'No automated backup verification schedule', correctiveAction: 'Implemented automated backup testing with AWS', progress: 100 }
];

const EMPTY_FORM = { title: '', rootCause: '', correctiveAction: '', assignee: '', control: '', priority: 'medium', dueDate: '', source: 'internalAudit' };

function CAPATracker() {
  const { theme: t, language } = useTheme();
  const [capas, setCapas] = useState(INITIAL_CAPAS);
  const [expandedCapa, setExpandedCapa] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const cl = capaLabels[language] || capaLabels.en;

  const getStatusColor = (status) => ({ open: '#ef4444', inProgress: '#f59e0b', resolved: '#10b981', closed: '#6b7280' }[status] || '#6b7280');
  const getPriorityColor = (priority) => ({ high: '#ef4444', medium: '#f59e0b', low: '#10b981' }[priority] || '#6b7280');

  const handleSubmit = (e) => {
    e.preventDefault();
    const seq = String(capas.length + 1).padStart(3, '0');
    const year = new Date().getFullYear();
    const newCapa = {
      ...form,
      id: `NC-${year}-${seq}`,
      status: 'open',
      progress: 0
    };
    setCapas(prev => [newCapa, ...prev]);
    setForm(EMPTY_FORM);
    setShowModal(false);
  };

  return (
    <div style={{ background: t.cardBg, borderRadius: '20px', padding: '24px', border: `1px solid ${t.border}`, marginTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={22} color="white" />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: t.text }}>{cl.title}</h3>
            <p style={{ fontSize: '12px', color: t.textDim }}>{cl.subtitle}</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ padding: '10px 18px', background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} />{cl.addNonConformity}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: cl.open,       count: capas.filter(c => c.status === 'open').length,       color: '#ef4444' },
          { label: cl.inProgress, count: capas.filter(c => c.status === 'inProgress').length, color: '#f59e0b' },
          { label: cl.resolved,   count: capas.filter(c => c.status === 'resolved').length,   color: '#10b981' },
          { label: cl.closed,     count: capas.filter(c => c.status === 'closed').length,     color: '#6b7280' }
        ].map((stat) => (
          <div key={stat.label} style={{ padding: '12px', background: t.inputBg, borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: stat.color }}>{stat.count}</div>
            <div style={{ fontSize: '11px', color: t.textDim }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {capas.map((capa) => {
          const isExpanded = expandedCapa === capa.id;
          const daysLeft = Math.ceil((new Date(capa.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
          const isOverdue = daysLeft < 0 && capa.status !== 'resolved';

          return (
            <div key={capa.id} style={{ background: t.inputBg, borderRadius: '12px', border: `1px solid ${isOverdue ? 'rgba(239, 68, 68, 0.3)' : t.border}`, overflow: 'hidden' }}>
              <div onClick={() => setExpandedCapa(isExpanded ? null : capa.id)} style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: getStatusColor(capa.status) }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: t.textDim, fontFamily: 'monospace' }}>{capa.id}</span>
                    <span style={{ padding: '2px 8px', background: `${getPriorityColor(capa.priority)}20`, borderRadius: '4px', fontSize: '10px', fontWeight: 600, color: getPriorityColor(capa.priority) }}>{cl[capa.priority]}</span>
                    {capa.control && <span style={{ padding: '2px 8px', background: '#8b5cf620', borderRadius: '4px', fontSize: '10px', fontWeight: 600, color: '#8b5cf6' }}>{capa.control}</span>}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: t.text }}>{capa.title}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: isOverdue ? '#ef4444' : t.textDim }}>{isOverdue ? cl.overdue : `${Math.abs(daysLeft)} ${cl.daysLeft}`}</div>
                  <div style={{ fontSize: '11px', color: t.textMuted }}>{capa.dueDate}</div>
                </div>
                <ChevronDown size={18} color={t.textDim} style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </div>
              {isExpanded && (
                <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${t.border}` }}>
                  <div style={{ paddingTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: t.textDim, textTransform: 'uppercase', marginBottom: '6px' }}>{cl.rootCause}</div>
                      <p style={{ fontSize: '13px', color: t.text, lineHeight: '1.5' }}>{capa.rootCause || '—'}</p>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: t.textDim, textTransform: 'uppercase', marginBottom: '6px' }}>{cl.correctiveAction}</div>
                      <p style={{ fontSize: '13px', color: t.text, lineHeight: '1.5' }}>{capa.correctiveAction || '—'}</p>
                    </div>
                  </div>
                  {capa.assignee && (
                    <div style={{ marginTop: '12px', fontSize: '12px', color: t.textDim }}>
                      <strong>{cl.assignee}:</strong> {capa.assignee}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL AGREGAR NC */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: t.cardBg, borderRadius: '20px', border: `1px solid ${t.border}`, width: '480px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: t.text, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={20} color="#ef4444" /> Nueva No Conformidad
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: t.textDim, cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: t.textDim, marginBottom: '6px', fontWeight: 600 }}>Título de la NC *</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Descripción breve de la no conformidad" style={{ width: '100%', padding: '10px 14px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, fontSize: '13px', outline: 'none' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: t.textDim, marginBottom: '6px', fontWeight: 600 }}>Prioridad</label>
                  <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, fontSize: '13px', outline: 'none' }}>
                    <option value="high">Alto</option>
                    <option value="medium">Medio</option>
                    <option value="low">Bajo</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: t.textDim, marginBottom: '6px', fontWeight: 600 }}>Fuente</label>
                  <select value={form.source} onChange={e => setForm({...form, source: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, fontSize: '13px', outline: 'none' }}>
                    <option value="internalAudit">Auditoría Interna</option>
                    <option value="preAudit">Pre-Auditoría</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: t.textDim, marginBottom: '6px', fontWeight: 600 }}>Control ISO (ej. A.5.18)</label>
                  <input value={form.control} onChange={e => setForm({...form, control: e.target.value})} placeholder="A.X.XX" style={{ width: '100%', padding: '10px 14px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, fontSize: '13px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: t.textDim, marginBottom: '6px', fontWeight: 600 }}>Fecha Límite *</label>
                  <input required type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, fontSize: '13px', outline: 'none' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: t.textDim, marginBottom: '6px', fontWeight: 600 }}>Responsable *</label>
                <input required value={form.assignee} onChange={e => setForm({...form, assignee: e.target.value})} placeholder="Nombre del responsable" style={{ width: '100%', padding: '10px 14px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, fontSize: '13px', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: t.textDim, marginBottom: '6px', fontWeight: 600 }}>Causa Raíz</label>
                <textarea value={form.rootCause} onChange={e => setForm({...form, rootCause: e.target.value})} rows={2} placeholder="¿Por qué ocurrió esta no conformidad?" style={{ width: '100%', padding: '10px 14px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, fontSize: '13px', outline: 'none', resize: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: t.textDim, marginBottom: '6px', fontWeight: 600 }}>Acción Correctiva</label>
                <textarea value={form.correctiveAction} onChange={e => setForm({...form, correctiveAction: e.target.value})} rows={2} placeholder="¿Qué se hará para corregirlo?" style={{ width: '100%', padding: '10px 14px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, fontSize: '13px', outline: 'none', resize: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Registrar NC</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CAPATracker;
