// src/pages/EmployeePortal.jsx
import React, { useState, useContext } from 'react';
import { Shield, Clock, CheckCircle2, FileText, X } from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';

const labels = {
  en: { 
    title: 'Employee Awareness Portal', subtitle: 'Review and acknowledge company policies',
    pendingAcknowledgments: 'Pending', completed: 'Completed', policies: 'Policies',
    readAndAccept: 'I have read and accept this policy', acknowledged: 'Acknowledged',
    acknowledge: 'Acknowledge', viewPolicy: 'View Policy', lastUpdated: 'Last updated',
    mandatory: 'Mandatory', complianceNote: 'This acknowledgment serves as evidence for ISO 27001 clause 7.3 (Awareness)',
    exit: 'Exit Portal' 
  },
  es: { 
    title: 'Portal de Concientización', subtitle: 'Revisa y acepta las políticas de la empresa',
    pendingAcknowledgments: 'Pendientes', completed: 'Completados', policies: 'Políticas',
    readAndAccept: 'He leído y acepto esta política', acknowledged: 'Aceptado',
    acknowledge: 'Aceptar', viewPolicy: 'Ver Política', lastUpdated: 'Última actualización',
    mandatory: 'Obligatorio', complianceNote: 'Esta aceptación sirve como evidencia para la cláusula 7.3 de ISO 27001',
    exit: 'Salir del Portal' 
  },
  pt: { 
    title: 'Portal de Conscientização', subtitle: 'Revise e aceite as políticas da empresa',
    pendingAcknowledgments: 'Pendentes', completed: 'Concluídos', policies: 'Políticas',
    readAndAccept: 'Li e aceito esta política', acknowledged: 'Aceito',
    acknowledge: 'Aceitar', viewPolicy: 'Ver Política', lastUpdated: 'Última atualização',
    mandatory: 'Obrigatório', complianceNote: 'Esta aceitação serve como evidência para a cláusula 7.3 da ISO 27001',
    exit: 'Sair do Portal' 
  }
};

function EmployeePortal({ onClose }) {
  const { darkMode, theme: t, language } = useContext(ThemeContext);
  const [acknowledgedPolicies, setAcknowledgedPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const l = labels[language] || labels.en;

  const policies = [
    { id: 1, title: 'Information Security Policy', version: 'v2.1', mandatory: true, lastUpdated: '2024-12-01', summary: 'Defines the overall approach to information security within the organization.' },
    { id: 2, title: 'Acceptable Use Policy', version: 'v1.5', mandatory: true, lastUpdated: '2024-11-15', summary: 'Guidelines for appropriate use of company IT resources and data.' },
    { id: 3, title: 'Password Policy', version: 'v1.3', mandatory: true, lastUpdated: '2024-10-20', summary: 'Requirements for creating and managing secure passwords.' },
    { id: 4, title: 'Remote Work Security Policy', version: 'v1.2', mandatory: true, lastUpdated: '2024-11-01', summary: 'Security requirements when working outside the office.' },
    { id: 5, title: 'Data Classification Policy', version: 'v1.0', mandatory: false, lastUpdated: '2024-09-15', summary: 'How to classify and handle different types of data.' },
    { id: 6, title: 'Incident Reporting Procedure', version: 'v1.4', mandatory: true, lastUpdated: '2024-12-05', summary: 'Steps to follow when you suspect a security incident.' }
  ];

  const pendingCount = policies.filter(p => p.mandatory && !acknowledgedPolicies.includes(p.id)).length;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: darkMode ? '#0f172a' : '#f8fafc', zIndex: 1000, overflow: 'auto' }}>
      <div style={{ background: t.cardBg, borderBottom: `1px solid ${t.border}`, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: t.text }}>{l.title}</h1>
            <p style={{ fontSize: '13px', color: t.textDim }}>{l.subtitle}</p>
          </div>
        </div>
        <button onClick={onClose} style={{ padding: '10px 20px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>{l.exit}</button>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
          <div style={{ background: pendingCount > 0 ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)' : t.cardBg, border: `1px solid ${pendingCount > 0 ? 'rgba(245, 158, 11, 0.3)' : t.border}`, borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: pendingCount > 0 ? 'rgba(245, 158, 11, 0.2)' : t.inputBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={28} color={pendingCount > 0 ? '#f59e0b' : t.textDim} />
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: pendingCount > 0 ? '#f59e0b' : t.text }}>{pendingCount}</div>
              <div style={{ fontSize: '14px', color: t.textDim }}>{l.pendingAcknowledgments}</div>
            </div>
          </div>
          <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={28} color="#10b981" />
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>{acknowledgedPolicies.length}</div>
              <div style={{ fontSize: '14px', color: t.textDim }}>{l.completed}</div>
            </div>
          </div>
        </div>

        <div style={{ background: t.cardBg, borderRadius: '20px', border: `1px solid ${t.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${t.border}` }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: t.text }}>{l.policies}</h2>
          </div>
          <div>
            {policies.map((policy) => {
              const isAcknowledged = acknowledgedPolicies.includes(policy.id);
              return (
                <div key={policy.id} style={{ padding: '20px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: isAcknowledged ? 'rgba(16, 185, 129, 0.15)' : t.inputBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isAcknowledged ? <CheckCircle2 size={22} color="#10b981" /> : <FileText size={22} color={t.textDim} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 600, color: t.text }}>{policy.title}</span>
                      <span style={{ fontSize: '11px', color: t.textDim, background: t.inputBg, padding: '2px 8px', borderRadius: '4px' }}>{policy.version}</span>
                      {policy.mandatory && <span style={{ fontSize: '10px', fontWeight: 600, color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>{l.mandatory}</span>}
                    </div>
                    <p style={{ fontSize: '13px', color: t.textDim }}>{policy.summary}</p>
                  </div>
                  {isAcknowledged ? (
                    <span style={{ padding: '8px 16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: '#10b981', fontSize: '13px', fontWeight: 600 }}>{l.acknowledged}</span>
                  ) : (
                    <button onClick={() => setSelectedPolicy(policy)} style={{ padding: '10px 20px', background: '#10b981', border: 'none', borderRadius: '10px', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>{l.viewPolicy}</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: '24px', padding: '16px 20px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield size={20} color="#8b5cf6" />
          <p style={{ fontSize: '13px', color: '#8b5cf6' }}>{l.complianceNote}</p>
        </div>
      </div>

      {selectedPolicy && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div style={{ width: '600px', maxHeight: '80vh', background: darkMode ? '#1e293b' : '#ffffff', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: t.text }}>{selectedPolicy.title}</h3>
                <span style={{ fontSize: '12px', color: t.textDim }}>{selectedPolicy.version} • {l.lastUpdated}: {selectedPolicy.lastUpdated}</span>
              </div>
              <button onClick={() => setSelectedPolicy(null)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: t.inputBg, border: 'none', cursor: 'pointer', color: t.textDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
            </div>
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
              <p style={{ fontSize: '14px', color: t.textMuted, lineHeight: '1.8' }}>{selectedPolicy.summary}</p>
            </div>
            <div style={{ padding: '16px 24px', borderTop: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: '18px', height: '18px', accentColor: '#10b981' }} />
                <span style={{ fontSize: '13px', color: t.text }}>{l.readAndAccept}</span>
              </label>
              <button onClick={() => { setAcknowledgedPolicies(prev => [...prev, selectedPolicy.id]); setSelectedPolicy(null); }} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>{l.acknowledge}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeePortal;