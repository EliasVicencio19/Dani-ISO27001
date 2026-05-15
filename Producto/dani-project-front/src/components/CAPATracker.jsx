// src/components/CAPATracker.jsx
import React, { useState } from 'react';
import { AlertTriangle, Plus, ChevronDown } from 'lucide-react';
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

function CAPATracker() {
  const { theme: t, language } = useTheme();
  const [expandedCapa, setExpandedCapa] = useState(null);
  const cl = capaLabels[language] || capaLabels.en;

  const capas = [
    { id: 'NC-2024-015', title: 'Missing access review documentation', source: 'preAudit', status: 'inProgress', priority: 'high', dueDate: '2024-12-20', assignee: 'Carlos López', control: 'A.5.18', rootCause: 'No documented procedure for quarterly access reviews', correctiveAction: 'Implement automated access review process', progress: 60 },
    { id: 'NC-2024-014', title: 'Incomplete security awareness training', source: 'internalAudit', status: 'open', priority: 'medium', dueDate: '2024-12-25', assignee: 'Ana Martínez', control: 'A.6.3', rootCause: 'Manual tracking system with no enforcement', correctiveAction: 'Deploy LMS with mandatory completion tracking', progress: 20 },
    { id: 'NC-2024-013', title: 'Backup verification not performed monthly', source: 'internalAudit', status: 'resolved', priority: 'high', dueDate: '2024-12-10', assignee: 'Pedro Sánchez', control: 'A.8.13', rootCause: 'No automated backup verification schedule', correctiveAction: 'Implemented automated backup testing with AWS', progress: 100 }
  ];

  const getStatusColor = (status) => ({ open: '#ef4444', inProgress: '#f59e0b', resolved: '#10b981', closed: '#6b7280' }[status] || '#6b7280');
  const getPriorityColor = (priority) => ({ high: '#ef4444', medium: '#f59e0b', low: '#10b981' }[priority] || '#6b7280');

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
        <button style={{ padding: '10px 18px', background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} />{cl.addNonConformity}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[{ label: cl.open, count: capas.filter(c => c.status === 'open').length, color: '#ef4444' }, { label: cl.inProgress, count: capas.filter(c => c.status === 'inProgress').length, color: '#f59e0b' }, { label: cl.resolved, count: capas.filter(c => c.status === 'resolved').length, color: '#10b981' }, { label: cl.closed, count: capas.filter(c => c.status === 'closed').length, color: '#6b7280' }].map((stat) => (
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
                    <span style={{ padding: '2px 8px', background: '#8b5cf620', borderRadius: '4px', fontSize: '10px', fontWeight: 600, color: '#8b5cf6' }}>{capa.control}</span>
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
                      <p style={{ fontSize: '13px', color: t.text, lineHeight: '1.5' }}>{capa.rootCause}</p>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: t.textDim, textTransform: 'uppercase', marginBottom: '6px' }}>{cl.correctiveAction}</div>
                      <p style={{ fontSize: '13px', color: t.text, lineHeight: '1.5' }}>{capa.correctiveAction}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CAPATracker;