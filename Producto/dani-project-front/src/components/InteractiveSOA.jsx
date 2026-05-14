// src/components/InteractiveSOA.jsx
import React, { useState } from 'react';
import { FileCheck, CheckCircle2, Edit3 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const labels = {
  en: { 
    title: 'Statement of Applicability (SOA)', 
    control: 'Control', description: 'Description', 
    applicable: 'Applicable', notApplicable: 'Not Applicable', 
    justification: 'Justification', status: 'Status', 
    implemented: 'Implemented', planned: 'Planned', notImplemented: 'Not Implemented', 
    showAll: 'All', showApplicable: 'Applicable', showNotApplicable: 'Not Applicable', 
    required: 'Required', autoSaved: 'Auto-saved' 
  },
  es: { 
    title: 'Declaración de Aplicabilidad (SOA)', 
    control: 'Control', description: 'Descripción', 
    applicable: 'Aplica', notApplicable: 'No Aplica', 
    justification: 'Justificación', status: 'Estado', 
    implemented: 'Implementado', planned: 'Planificado', notImplemented: 'No Implementado', 
    showAll: 'Todos', showApplicable: 'Aplica', showNotApplicable: 'No Aplica', 
    required: 'Requerido', autoSaved: 'Auto-guardado' 
  },
  pt: { 
    title: 'Declaração de Aplicabilidade (SOA)', 
    control: 'Controle', description: 'Descrição', 
    applicable: 'Aplicável', notApplicable: 'Não Aplicável', 
    justification: 'Justificativa', status: 'Status', 
    implemented: 'Implementado', planned: 'Planejado', notImplemented: 'Não Implementado', 
    showAll: 'Todos', showApplicable: 'Aplicável', showNotApplicable: 'Não Aplicável', 
    required: 'Obrigatório', autoSaved: 'Auto-salvo' 
  }
};

function InteractiveSOA() {
  const { theme: t, language } = useTheme();
  const [filterApplicable, setFilterApplicable] = useState('all');
  const l = labels[language] || labels.en;

  const [controls, setControls] = useState([
    { id: 'A.5.1', name: 'Policies for information security', category: 'Organizational', applicable: true, status: 'implemented', justification: 'Required for ISMS framework establishment' },
    { id: 'A.5.2', name: 'Information security roles', category: 'Organizational', applicable: true, status: 'implemented', justification: 'Mandatory for security governance' },
    { id: 'A.5.15', name: 'Access control', category: 'Organizational', applicable: true, status: 'implemented', justification: 'Critical for data protection' },
    { id: 'A.5.16', name: 'Identity management', category: 'Organizational', applicable: true, status: 'planned', justification: 'Scheduled for Q1 2025' },
    { id: 'A.7.4', name: 'Physical security monitoring', category: 'Physical', applicable: false, status: 'notImplemented', justification: 'No physical data center - cloud only' },
    { id: 'A.8.1', name: 'User endpoint devices', category: 'Technological', applicable: true, status: 'implemented', justification: 'All employees use company devices' },
    { id: 'A.8.24', name: 'Use of cryptography', category: 'Technological', applicable: true, status: 'implemented', justification: 'TLS 1.3 and AES-256 in use' }
  ]);

  const toggleApplicable = (id) => {
    setControls(prev => prev.map(c => c.id === id ? { ...c, applicable: !c.applicable } : c));
  };

  const updateStatus = (id, status) => {
    setControls(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const filteredControls = controls.filter(c => {
    if (filterApplicable === 'all') return true;
    if (filterApplicable === 'applicable') return c.applicable;
    if (filterApplicable === 'notApplicable') return !c.applicable;
    return true;
  });

  return (
    <div style={{ background: t.cardBg, borderRadius: '20px', border: `1px solid ${t.border}`, overflow: 'hidden', marginTop: '24px' }}>
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileCheck size={22} color="white" />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: t.text }}>{l.title}</h3>
            <p style={{ fontSize: '12px', color: t.textDim }}>
              {controls.filter(c => c.applicable).length} {l.applicable} • {controls.filter(c => c.applicable && c.status === 'implemented').length} {l.implemented}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[{ id: 'all', label: l.showAll }, { id: 'applicable', label: l.showApplicable }, { id: 'notApplicable', label: l.showNotApplicable }].map((filter) => (
            <button key={filter.id} onClick={() => setFilterApplicable(filter.id)} style={{ 
              padding: '8px 14px', 
              background: filterApplicable === filter.id ? '#8b5cf620' : 'transparent', 
              border: `1px solid ${filterApplicable === filter.id ? '#8b5cf6' : t.border}`, 
              borderRadius: '8px', color: filterApplicable === filter.id ? '#8b5cf6' : t.textMuted, 
              fontSize: '12px', fontWeight: 500, cursor: 'pointer' 
            }}>{filter.label}</button>
          ))}
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: t.textDim, textTransform: 'uppercase', width: '100px' }}>{l.control}</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: t.textDim, textTransform: 'uppercase' }}>{l.description}</th>
              <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: t.textDim, textTransform: 'uppercase', width: '140px' }}>{l.applicable}?</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: t.textDim, textTransform: 'uppercase', width: '150px' }}>{l.status}</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: t.textDim, textTransform: 'uppercase' }}>{l.justification}</th>
            </tr>
          </thead>
          <tbody>
            {filteredControls.map((control) => (
              <tr key={control.id} style={{ borderBottom: `1px solid ${t.border}` }}>
                <td style={{ padding: '16px 20px' }}><span style={{ fontSize: '13px', fontWeight: 600, color: '#8b5cf6', fontFamily: 'monospace' }}>{control.id}</span></td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: '13px', color: t.text }}>{control.name}</div>
                  <span style={{ fontSize: '11px', color: t.textDim }}>{control.category}</span>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                    <button onClick={() => toggleApplicable(control.id)} style={{ padding: '6px 12px', background: control.applicable ? '#10b98120' : 'transparent', border: `1px solid ${control.applicable ? '#10b981' : t.border}`, borderRadius: '6px 0 0 6px', color: control.applicable ? '#10b981' : t.textDim, fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>{l.applicable}</button>
                    <button onClick={() => toggleApplicable(control.id)} style={{ padding: '6px 12px', background: !control.applicable ? '#ef444420' : 'transparent', border: `1px solid ${!control.applicable ? '#ef4444' : t.border}`, borderRadius: '0 6px 6px 0', color: !control.applicable ? '#ef4444' : t.textDim, fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>{l.notApplicable}</button>
                  </div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  {control.applicable && (
                    <select value={control.status} onChange={(e) => updateStatus(control.id, e.target.value)} style={{ padding: '6px 10px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '6px', color: t.text, fontSize: '12px', outline: 'none', cursor: 'pointer' }}>
                      <option value="implemented">{l.implemented}</option>
                      <option value="planned">{l.planned}</option>
                      <option value="notImplemented">{l.notImplemented}</option>
                    </select>
                  )}
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: control.justification ? t.textMuted : '#ef4444' }}>{control.justification || l.required}</span>
                    <button style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: t.textDim }}><Edit3 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#10b981' }}>
        <CheckCircle2 size={14} /><span>{l.autoSaved}</span>
      </div>
    </div>
  );
}

export default InteractiveSOA;