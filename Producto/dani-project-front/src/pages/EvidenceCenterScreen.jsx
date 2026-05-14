// src/pages/EvidenceCenterScreen.jsx
import React, { useState, useContext } from 'react';
import { 
  Database, Zap, Upload, Clock, Search, Eye, RefreshCw, 
  CheckCircle2, XCircle, X, Send, Plus, ExternalLink,
  Sparkles, FileText, Download, Copy, AlertTriangle
} from 'lucide-react';
import { ThemeContext, useTranslation } from '../contexts/ThemeContext';

const labels = {
  en: {
    title: 'Evidence Center', subtitle: 'Automated evidence collection and management',
    evidences: 'Evidences', upload: 'Bulk Upload', requests: 'Evidence Requests', connectors: 'Connectors',
    totalEvidences: 'Total Evidences', autoCollected: 'Auto-Collected', manualUpload: 'Manual Upload',
    pendingRequests: 'Pending Requests', addEvidence: 'Add Evidence',
    health: 'Health', fresh: 'Fresh', expiringSoon: 'Expiring Soon', expired: 'Expired',
    lastUpdated: 'Last Updated', daysAgo: 'days ago', validFor: 'Valid for', days: 'days',
    needsUpdate: 'Needs Update', updateNow: 'Update Now',
    control: 'Control', type: 'Type', source: 'Source', actions: 'Actions',
    view: 'View', download: 'Download', delete: 'Delete',
    all: 'All', automatic: 'Automatic', manual: 'Manual',
    filterBy: 'Filter by', searchEvidences: 'Search evidences...',
    connected: 'Connected', error: 'Error', pending: 'Pending', configure: 'Configure',
    reconnect: 'Reconnect', lastSync: 'Last sync',
    requestEvidence: 'Request Evidence', assignTo: 'Assign to', dueDate: 'Due Date',
    sendRequest: 'Send Request', magicLink: 'Magic Link', copyLink: 'Copy Link',
    resendReminder: 'Resend Reminder', viewSubmission: 'View Submission',
    sourceDetails: 'Source Details', technicalDetails: 'Technical Details',
    collectedFrom: 'Collected from', timestamp: 'Timestamp', endpoint: 'Endpoint',
    copyJson: 'Copy JSON',
  },
  es: {
    title: 'Centro de Evidencias', subtitle: 'Recolección y gestión automatizada de evidencias',
    evidences: 'Evidencias', upload: 'Carga Masiva', requests: 'Solicitudes', connectors: 'Conectores',
    totalEvidences: 'Total Evidencias', autoCollected: 'Auto-Recolectadas', manualUpload: 'Carga Manual',
    pendingRequests: 'Solicitudes Pendientes', addEvidence: 'Agregar Evidencia',
    health: 'Salud', fresh: 'Vigente', expiringSoon: 'Por Vencer', expired: 'Vencida',
    lastUpdated: 'Última Actualización', daysAgo: 'días atrás', validFor: 'Válida por', days: 'días',
    needsUpdate: 'Necesita Actualización', updateNow: 'Actualizar Ahora',
    control: 'Control', type: 'Tipo', source: 'Fuente', actions: 'Acciones',
    view: 'Ver', download: 'Descargar', delete: 'Eliminar',
    all: 'Todos', automatic: 'Automático', manual: 'Manual',
    filterBy: 'Filtrar por', searchEvidences: 'Buscar evidencias...',
    connected: 'Conectado', error: 'Error', pending: 'Pendiente', configure: 'Configurar',
    reconnect: 'Reconectar', lastSync: 'Última sincronización',
    requestEvidence: 'Solicitar Evidencia', assignTo: 'Asignar a', dueDate: 'Fecha Límite',
    sendRequest: 'Enviar Solicitud', magicLink: 'Enlace Mágico', copyLink: 'Copiar Enlace',
    resendReminder: 'Reenviar Recordatorio', viewSubmission: 'Ver Envío',
    sourceDetails: 'Detalles de Origen', technicalDetails: 'Detalles Técnicos',
    collectedFrom: 'Recolectado de', timestamp: 'Marca de tiempo', endpoint: 'Endpoint',
    copyJson: 'Copiar JSON',
  },
  pt: {
    title: 'Centro de Evidências', subtitle: 'Coleta e gestão automatizada de evidências',
    evidences: 'Evidências', upload: 'Upload em Massa', requests: 'Solicitações', connectors: 'Conectores',
    totalEvidences: 'Total de Evidências', autoCollected: 'Auto-Coletadas', manualUpload: 'Upload Manual',
    pendingRequests: 'Solicitações Pendentes', addEvidence: 'Adicionar Evidência',
    health: 'Saúde', fresh: 'Vigente', expiringSoon: 'Expirando', expired: 'Expirada',
    lastUpdated: 'Última Atualização', daysAgo: 'dias atrás', validFor: 'Válida por', days: 'dias',
    needsUpdate: 'Precisa Atualização', updateNow: 'Atualizar Agora',
    control: 'Controle', type: 'Tipo', source: 'Fonte', actions: 'Ações',
    view: 'Ver', download: 'Baixar', delete: 'Excluir',
    all: 'Todos', automatic: 'Automático', manual: 'Manual',
    filterBy: 'Filtrar por', searchEvidences: 'Buscar evidências...',
    connected: 'Conectado', error: 'Erro', pending: 'Pendente', configure: 'Configurar',
    reconnect: 'Reconectar', lastSync: 'Última sincronização',
    requestEvidence: 'Solicitar Evidência', assignTo: 'Atribuir a', dueDate: 'Data Limite',
    sendRequest: 'Enviar Solicitação', magicLink: 'Link Mágico', copyLink: 'Copiar Link',
    resendReminder: 'Reenviar Lembrete', viewSubmission: 'Ver Envio',
    sourceDetails: 'Detalhes da Origem', technicalDetails: 'Detalhes Técnicos',
    collectedFrom: 'Coletado de', timestamp: 'Timestamp', endpoint: 'Endpoint',
    copyJson: 'Copiar JSON',
  }
};

function EvidenceCenterScreen() {
  const { darkMode, theme: t, language } = useContext(ThemeContext);
  const tr = useTranslation();
  const [activeTab, setActiveTab] = useState('evidences');
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const l = labels[language] || labels.en;

  const evidences = [
    { id: 1, name: 'AWS S3 Encryption Config', control: 'A.8.24', type: 'automatic', source: 'AWS', sourceIcon: '☁️', lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), validityDays: 30, status: 'fresh', apiData: { endpoint: 'GET /s3/bucket-encryption', timestamp: '2024-12-13T14:32:00Z', response: { ServerSideEncryptionConfiguration: { Rules: [{ ApplyServerSideEncryptionByDefault: { SSEAlgorithm: 'aws:kms' } }] } } } },
    { id: 2, name: 'Azure AD MFA Status Report', control: 'A.5.17', type: 'automatic', source: 'Azure', sourceIcon: '🔷', lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), validityDays: 7, status: 'fresh', apiData: { endpoint: 'GET /reports/authenticationMethods', timestamp: '2024-12-10T09:15:00Z', response: { totalMfaEnabled: 245, totalUsers: 250, complianceRate: '98%' } } },
    { id: 3, name: 'Backup Verification Log', control: 'A.8.13', type: 'manual', source: 'Manual', sourceIcon: '📄', lastUpdated: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), validityDays: 30, status: 'expired' },
    { id: 4, name: 'Jira Security Training Tickets', control: 'A.6.3', type: 'automatic', source: 'Jira', sourceIcon: '📋', lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), validityDays: 90, status: 'fresh', apiData: { endpoint: 'GET /rest/api/3/search', timestamp: '2024-12-14T11:00:00Z', response: { total: 45 } } },
    { id: 5, name: 'Okta Access Review Export', control: 'A.5.18', type: 'automatic', source: 'Okta', sourceIcon: '🔐', lastUpdated: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), validityDays: 30, status: 'expiring', apiData: { endpoint: 'GET /api/v1/users', timestamp: '2024-11-20T16:45:00Z', response: { totalActiveUsers: 250 } } },
    { id: 6, name: 'Penetration Test Report Q4', control: 'A.8.8', type: 'manual', source: 'Manual', sourceIcon: '📄', lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), validityDays: 365, status: 'fresh' },
    { id: 7, name: 'GitHub Branch Protection Rules', control: 'A.8.9', type: 'automatic', source: 'GitHub', sourceIcon: '🐙', lastUpdated: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), validityDays: 30, status: 'expired', apiData: { endpoint: 'GET /repos/{owner}/{repo}/branches/{branch}/protection', timestamp: '2024-10-15T08:30:00Z', response: { required_pull_request_reviews: { required_approving_review_count: 2 } } } }
  ];

  const evidenceRequests = [
    { id: 1, title: 'HR Policy Acknowledgment Records', control: 'A.6.2', assignee: 'María López', department: 'HR', dueDate: '2024-12-20', status: 'pending', magicLink: 'https://dani.app/upload/abc123' },
    { id: 2, title: 'Physical Access Logs - Data Center', control: 'A.7.2', assignee: 'Carlos Ruiz', department: 'Facilities', dueDate: '2024-12-18', status: 'overdue', magicLink: 'https://dani.app/upload/def456' },
    { id: 3, title: 'Vendor Security Assessments', control: 'A.5.19', assignee: 'Ana García', department: 'Procurement', dueDate: '2024-12-25', status: 'pending', magicLink: 'https://dani.app/upload/ghi789' },
    { id: 4, title: 'Employee Background Check Records', control: 'A.6.1', assignee: 'Pedro Sánchez', department: 'HR', dueDate: '2024-12-15', status: 'submitted', magicLink: 'https://dani.app/upload/jkl012' }
  ];

  const connectors = [
    { id: 'aws', name: 'AWS', icon: '☁️', status: 'connected', lastSync: '5 min ago', evidences: 12, color: '#FF9900' },
    { id: 'azure', name: 'Azure', icon: '🔷', status: 'connected', lastSync: '2 min ago', evidences: 28, color: '#0078D4' },
    { id: 'jira', name: 'Jira', icon: '📋', status: 'connected', lastSync: '1 min ago', evidences: 45, color: '#0052CC' },
    { id: 'okta', name: 'Okta', icon: '🔐', status: 'connected', lastSync: '3 min ago', evidences: 18, color: '#007DC1' },
    { id: 'github', name: 'GitHub', icon: '🐙', status: 'error', lastSync: 'Failed 2h ago', evidences: 8, color: '#333' },
    { id: 'slack', name: 'Slack', icon: '💬', status: 'pending', lastSync: 'Not configured', evidences: 0, color: '#4A154B' }
  ];

  const getDaysAgo = (date) => Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  const getFreshnessStatus = (evidence) => {
    const daysAgo = getDaysAgo(evidence.lastUpdated);
    const daysRemaining = evidence.validityDays - daysAgo;
    if (daysRemaining <= 0) return 'expired';
    if (daysRemaining <= 7) return 'expiring';
    return 'fresh';
  };
  const getFreshnessColor = (status) => {
    switch (status) { case 'fresh': return '#10b981'; case 'expiring': return '#f59e0b'; case 'expired': return '#ef4444'; default: return '#6b7280'; }
  };

  const filteredEvidences = evidences.filter(e => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'automatic') return e.type === 'automatic';
    if (filterStatus === 'manual') return e.type === 'manual';
    if (filterStatus === 'expired') return getFreshnessStatus(e) === 'expired';
    if (filterStatus === 'expiring') return getFreshnessStatus(e) === 'expiring';
    return true;
  });

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>{l.title}</h1>
          <p style={{ color: t.textDim, fontSize: '15px' }}>{l.subtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setShowRequestModal(true)} style={{ padding: '10px 20px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, cursor: 'pointer', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={16} /> {l.requestEvidence}
          </button>
          <button onClick={() => setActiveTab('upload')} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={16} /> {l.addEvidence}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[{ label: l.totalEvidences, value: evidences.length, color: '#10b981', icon: Database }, { label: l.autoCollected, value: evidences.filter(e => e.type === 'automatic').length, color: '#3b82f6', icon: Zap }, { label: l.manualUpload, value: evidences.filter(e => e.type === 'manual').length, color: '#f59e0b', icon: Upload }, { label: l.pendingRequests, value: evidenceRequests.filter(r => r.status === 'pending' || r.status === 'overdue').length, color: '#ef4444', icon: Clock }].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} style={{ background: t.cardBg, borderRadius: '14px', padding: '18px', border: `1px solid ${t.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={18} color={stat.color} /></div>
                <span style={{ fontSize: '12px', color: t.textDim }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[{ id: 'evidences', label: l.evidences, icon: Database }, { id: 'upload', label: l.upload, icon: Upload }, { id: 'requests', label: l.requests, icon: Send }, { id: 'connectors', label: l.connectors, icon: Zap }].map((tab) => {
          const Icon = tab.icon; const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '10px 20px', background: isActive ? '#10b98120' : 'transparent', border: `1px solid ${isActive ? '#10b981' : t.border}`, borderRadius: '10px', color: isActive ? '#10b981' : t.textMuted, cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon size={16} /> {tab.label}
              {tab.id === 'requests' && evidenceRequests.filter(r => r.status === 'pending' || r.status === 'overdue').length > 0 && (
                <span style={{ background: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '10px' }}>{evidenceRequests.filter(r => r.status === 'pending' || r.status === 'overdue').length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Evidences Tab */}
      {activeTab === 'evidences' && (
        <div style={{ background: t.cardBg, borderRadius: '20px', border: `1px solid ${t.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: t.textDim }}>{l.filterBy}:</span>
              {[{ id: 'all', label: l.all }, { id: 'automatic', label: l.automatic }, { id: 'manual', label: l.manual }, { id: 'expired', label: l.expired }, { id: 'expiring', label: l.expiringSoon }].map((filter) => (
                <button key={filter.id} onClick={() => setFilterStatus(filter.id)} style={{ padding: '6px 12px', background: filterStatus === filter.id ? '#10b98120' : t.inputBg, border: `1px solid ${filterStatus === filter.id ? '#10b981' : t.border}`, borderRadius: '6px', color: filterStatus === filter.id ? '#10b981' : t.textMuted, fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>{filter.label}</button>
              ))}
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: t.textDim }} />
              <input placeholder={l.searchEvidences} style={{ padding: '8px 12px 8px 36px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '8px', color: t.text, fontSize: '13px', width: '250px', outline: 'none' }} />
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: t.textDim, textTransform: 'uppercase' }}>{l.health}</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: t.textDim, textTransform: 'uppercase' }}>Evidence</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: t.textDim, textTransform: 'uppercase' }}>{l.control}</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: t.textDim, textTransform: 'uppercase' }}>{l.source}</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: t.textDim, textTransform: 'uppercase' }}>{l.lastUpdated}</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: t.textDim, textTransform: 'uppercase' }}>{l.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvidences.map((evidence) => {
                  const freshnessStatus = getFreshnessStatus(evidence);
                  const freshnessColor = getFreshnessColor(freshnessStatus);
                  const daysAgo = getDaysAgo(evidence.lastUpdated);
                  const daysRemaining = evidence.validityDays - daysAgo;
                  return (
                    <tr key={evidence.id} style={{ borderBottom: `1px solid ${t.border}`, cursor: 'pointer' }} onClick={() => setSelectedEvidence(evidence)}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: freshnessColor, boxShadow: `0 0 8px ${freshnessColor}60` }} />
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: freshnessColor }}>{freshnessStatus === 'fresh' ? l.fresh : freshnessStatus === 'expiring' ? l.expiringSoon : l.expired}</div>
                            <div style={{ fontSize: '10px', color: t.textDim }}>{daysRemaining > 0 ? `${l.validFor} ${daysRemaining} ${l.days}` : l.needsUpdate}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: evidence.type === 'automatic' ? '#3b82f620' : '#f59e0b20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>{evidence.sourceIcon}</div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: t.text }}>{evidence.name}</div>
                            <div style={{ fontSize: '11px', color: t.textDim }}>{evidence.type === 'automatic' ? l.automatic : l.manual}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}><span style={{ padding: '4px 10px', background: '#8b5cf620', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#8b5cf6' }}>{evidence.control}</span></td>
                      <td style={{ padding: '16px 20px' }}><span style={{ fontSize: '13px', color: t.text }}>{evidence.source}</span></td>
                      <td style={{ padding: '16px 20px' }}><span style={{ fontSize: '13px', color: t.textMuted }}>{daysAgo} {l.daysAgo}</span></td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {freshnessStatus === 'expired' && <button style={{ padding: '6px 12px', background: '#ef444420', border: '1px solid #ef444440', borderRadius: '6px', color: '#ef4444', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><RefreshCw size={12} /> {l.updateNow}</button>}
                          <button onClick={(e) => { e.stopPropagation(); setSelectedEvidence(evidence); }} style={{ padding: '6px 12px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '6px', color: t.textMuted, fontSize: '11px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={12} /> {l.view}</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div style={{ background: t.cardBg, borderRadius: '20px', border: `1px solid ${t.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '60px 40px', textAlign: 'center', cursor: 'pointer' }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            style={{ border: `2px dashed ${dragOver ? '#10b981' : t.border}`, borderRadius: '16px', margin: '24px', background: dragOver ? 'rgba(16, 185, 129, 0.05)' : 'transparent' }}>
            <Upload size={48} color={dragOver ? '#10b981' : t.textDim} style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: t.text, marginBottom: '8px' }}>Drag & drop files here</h3>
            <p style={{ fontSize: '14px', color: t.textDim }}>or click to browse</p>
            <p style={{ fontSize: '12px', color: t.textMuted, marginTop: '8px' }}>PDF, DOCX, PNG, JPG, JSON, CSV (max 50MB per file)</p>
          </div>
        </div>
      )}

      {/* Connectors Tab */}
      {activeTab === 'connectors' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {connectors.map((connector) => (
            <div key={connector.id} style={{ background: t.cardBg, borderRadius: '16px', padding: '20px', border: connector.status === 'error' ? '1px solid rgba(239, 68, 68, 0.3)' : `1px solid ${t.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: t.inputBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{connector.icon}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: connector.status === 'connected' ? 'rgba(16, 185, 129, 0.15)' : connector.status === 'error' ? 'rgba(239, 68, 68, 0.15)' : t.inputBg, color: connector.status === 'connected' ? '#10b981' : connector.status === 'error' ? '#ef4444' : t.textDim }}>
                  {connector.status === 'connected' && <CheckCircle2 size={12} />}
                  {connector.status === 'error' && <XCircle size={12} />}
                  {connector.status === 'connected' ? l.connected : connector.status === 'error' ? l.error : l.pending}
                </div>
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px', color: t.text }}>{connector.name}</h4>
              <div style={{ fontSize: '12px', color: connector.status === 'error' ? '#ef4444' : t.textDim, marginBottom: '16px' }}>{l.lastSync}: {connector.lastSync}</div>
              {connector.status === 'connected' && <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ fontSize: '13px', color: t.text }}>{connector.evidences} {l.evidences}</span><Eye size={14} color="#10b981" /></div>}
              {connector.status === 'error' && <button style={{ width: '100%', padding: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>{l.reconnect}</button>}
              {connector.status === 'pending' && <button style={{ width: '100%', padding: '10px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '8px', color: t.text, cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>{l.configure}</button>}
            </div>
          ))}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div style={{ background: t.cardBg, borderRadius: '20px', border: `1px solid ${t.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: t.text }}>{l.requests}</h3>
            <button onClick={() => setShowRequestModal(true)} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={16} /> {l.requestEvidence}</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: t.textDim, textTransform: 'uppercase' }}>Evidence</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: t.textDim, textTransform: 'uppercase' }}>{l.control}</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: t.textDim, textTransform: 'uppercase' }}>{l.assignTo}</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: t.textDim, textTransform: 'uppercase' }}>{l.dueDate}</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: t.textDim, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: t.textDim, textTransform: 'uppercase' }}>{l.actions}</th>
                </tr>
              </thead>
              <tbody>
                {evidenceRequests.map((request) => (
                  <tr key={request.id} style={{ borderBottom: `1px solid ${t.border}` }}>
                    <td style={{ padding: '16px 20px' }}><div style={{ fontSize: '14px', fontWeight: 600, color: t.text }}>{request.title}</div></td>
                    <td style={{ padding: '16px 20px' }}><span style={{ padding: '4px 10px', background: '#8b5cf620', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#8b5cf6' }}>{request.control}</span></td>
                    <td style={{ padding: '16px 20px' }}><div style={{ fontSize: '13px', fontWeight: 500, color: t.text }}>{request.assignee}</div><div style={{ fontSize: '11px', color: t.textDim }}>{request.department}</div></td>
                    <td style={{ padding: '16px 20px' }}><span style={{ fontSize: '13px', color: request.status === 'overdue' ? '#ef4444' : t.textMuted }}>{request.dueDate}</span></td>
                    <td style={{ padding: '16px 20px' }}><span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: request.status === 'submitted' ? '#10b98120' : request.status === 'overdue' ? '#ef444420' : '#f59e0b20', color: request.status === 'submitted' ? '#10b981' : request.status === 'overdue' ? '#ef4444' : '#f59e0b' }}>{request.status}</span></td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      {request.status === 'submitted' ? (
                        <button style={{ padding: '6px 12px', background: '#10b98120', border: '1px solid #10b98140', borderRadius: '6px', color: '#10b981', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={12} /> {l.viewSubmission}</button>
                      ) : (
                        <button style={{ padding: '6px 12px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '6px', color: t.textMuted, fontSize: '11px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Send size={12} /> {l.resendReminder}</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default EvidenceCenterScreen;