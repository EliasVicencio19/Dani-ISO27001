// src/components/NotificationCenter.jsx
import React from 'react';
import { AlertTriangle, XCircle, Clock, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const labels = {
  en: { 
    title: 'Notifications', 
    markAllRead: 'Mark all read', 
    noNotifications: 'No new notifications', 
    evidenceExpired: 'Evidence expired', 
    controlFailed: 'Control check failed', 
    newApproval: 'New approval required', 
    slackDigest: 'Slack Digest', 
    viewAll: 'View All' 
  },
  es: { 
    title: 'Notificaciones', 
    markAllRead: 'Marcar todo leído', 
    noNotifications: 'Sin notificaciones nuevas', 
    evidenceExpired: 'Evidencia expirada', 
    controlFailed: 'Verificación fallida', 
    newApproval: 'Aprobación requerida', 
    slackDigest: 'Resumen Slack', 
    viewAll: 'Ver Todo' 
  },
  pt: { 
    title: 'Notificações', 
    markAllRead: 'Marcar tudo lido', 
    noNotifications: 'Sem notificações novas', 
    evidenceExpired: 'Evidência expirada', 
    controlFailed: 'Verificação falhou', 
    newApproval: 'Aprovação necessária', 
    slackDigest: 'Resumo Slack', 
    viewAll: 'Ver Tudo' 
  }
};

function NotificationCenter({ isOpen, onClose, darkMode }) {
  const { theme: t, language } = useTheme();
  const l = labels[language] || labels.en;

  const notifications = [
    { id: 1, type: 'warning', title: l.evidenceExpired, message: 'Backup Verification Log - expired 5 days ago', time: '10 min ago', read: false, icon: AlertTriangle, color: '#ef4444' },
    { id: 2, type: 'error', title: l.controlFailed, message: 'MFA disabled for admin@company.com in Google Workspace', time: '1 hour ago', read: false, icon: XCircle, color: '#ef4444' },
    { id: 3, type: 'info', title: l.newApproval, message: 'Access Control Policy v1.4 awaiting your review', time: '2 hours ago', read: false, icon: Clock, color: '#f59e0b' },
    { id: 4, type: 'slack', title: l.slackDigest, message: '3 new comments on your evidence uploads', time: '5 hours ago', read: true, icon: MessageSquare, color: '#8b5cf6' },
    { id: 5, type: 'success', title: 'Evidence auto-collected', message: 'AWS S3 Encryption Config synced', time: 'Yesterday', read: true, icon: CheckCircle2, color: '#10b981' }
  ];

  if (!isOpen) return null;

  return (
    <div style={{ position: 'absolute', top: '50px', right: '0', width: '380px', background: darkMode ? '#1e293b' : '#ffffff', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', border: `1px solid ${t.border}`, overflow: 'hidden', zIndex: 100 }}>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: t.text }}>{l.title}</h3>
        <button style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>{l.markAllRead}</button>
      </div>
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {notifications.map((notif) => {
          const Icon = notif.icon;
          return (
            <div key={notif.id} style={{ padding: '14px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', gap: '12px', background: notif.read ? 'transparent' : (darkMode ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.03)'), cursor: 'pointer' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${notif.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={notif.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: t.text }}>{notif.title}</span>
                  {!notif.read && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }} />}
                </div>
                <p style={{ fontSize: '12px', color: t.textDim, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{notif.message}</p>
                <span style={{ fontSize: '11px', color: t.textMuted }}>{notif.time}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${t.border}`, textAlign: 'center' }}>
        <button style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>{l.viewAll}</button>
      </div>
    </div>
  );
}

export default NotificationCenter;