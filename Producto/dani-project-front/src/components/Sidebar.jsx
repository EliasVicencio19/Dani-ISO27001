/* eslint-disable */
import React from 'react';
import { LayoutDashboard, Search, FilePlus2, AlertTriangle, Database, FileText, FileCheck, Users, ChevronLeft, ChevronRight, Shield, UserCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function SidebarProgressRings({ theme: t, language, collapsed }) {
  if (collapsed) return null;
  const domainProgress = [
    { name: language === 'es' ? 'Personas' : 'People', progress: 82, color: '#3b82f6' },
    { name: language === 'es' ? 'Tecnología' : 'Technology', progress: 68, color: '#8b5cf6' },
    { name: language === 'es' ? 'Físico' : 'Physical', progress: 91, color: '#10b981' },
    { name: language === 'es' ? 'Procesos' : 'Processes', progress: 55, color: '#f59e0b' }
  ];

  const overallProgress = Math.round(domainProgress.reduce((sum, d) => sum + d.progress, 0) / domainProgress.length);
  const darkMode = t.bg.includes('#000000') || t.bg.includes('#0a0f1c'); // Infer dark mode from theme bg

  if (collapsed) {
    return (
      <div style={{ padding: '12px 8px', borderTop: `1px solid ${t.border}`, marginTop: 'auto' }}>
        <div style={{ width: '48px', height: '48px', margin: '0 auto', position: 'relative' }}>
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke={darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} strokeWidth="4" />
            <circle cx="24" cy="24" r="20" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${overallProgress * 1.26} 126`} transform="rotate(-90 24 24)" />
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '11px', fontWeight: 700, color: '#10b981' }}>{overallProgress}%</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', borderTop: `1px solid ${t.border}`, marginTop: 'auto' }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: t.textDim, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>{language === 'es' ? 'Análisis de Brechas' : 'Gap Analysis'}</div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <div style={{ width: '64px', height: '64px', position: 'relative' }}>
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="26" fill="none" stroke={darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} strokeWidth="6" />
            <circle cx="32" cy="32" r="26" fill="none" stroke="url(#overallGradient)" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${overallProgress * 1.63} 163`} transform="rotate(-90 32 32)" />
            <defs><linearGradient id="overallGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs>
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '16px', fontWeight: 700, color: '#10b981' }}>{overallProgress}%</div>
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: t.text }}>{language === 'es' ? 'General' : 'Overall'}</div>
          <div style={{ fontSize: '11px', color: t.textDim }}>4 {language === 'es' ? 'dominios' : 'domains'}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {domainProgress.map((domain, i) => (
          <div key={i}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: t.textMuted }}>{domain.name}</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: domain.color }}>{domain.progress}%</span>
            </div>
            <div style={{ height: '6px', background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${domain.progress}%`, height: '100%', background: domain.color, borderRadius: '3px', transition: 'width 0.5s ease' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const Sidebar = ({ activeScreen, setActiveScreen, sidebarCollapsed, setSidebarCollapsed }) => {
  const { theme: t, language, translations } = useTheme();
  const l = translations[language];

  const navItems = [
    { id: 'dashboard', label: l.dashboard, icon: LayoutDashboard },
    { id: 'gap-analysis', label: l.gapAnalysis, icon: Search },
    { id: 'doc-generator', label: l.docGenerator, icon: FilePlus2 },
    { id: 'risk-map', label: l.riskMap, icon: AlertTriangle },
    { id: 'evidence', label: l.evidenceCenter, icon: Database },
    { id: 'documents', label: l.documents, icon: FileText },
    { id: 'audit-room', label: l.auditRoom, icon: FileCheck },
    { id: 'user-management', label: l.userManagement, icon: Users },
    { id: 'employee-portal', label: language === 'es' ? 'Portal de Empleados' : 'Employee Portal', icon: UserCircle },
  ];

  return (
    <aside style={{ width: sidebarCollapsed ? '80px' : '260px', background: t.sidebarBg, backdropFilter: 'blur(20px)', borderRight: `1px solid ${t.border}`, padding: '24px 16px', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease', position: 'relative', zIndex: 10 }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', padding: '0 8px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={24} color="white" />
        </div>
        {!sidebarCollapsed && <div><div style={{ fontWeight: 700, fontSize: '20px' }}>Dani</div><div style={{ fontSize: '11px', color: t.textDim, textTransform: 'uppercase', letterSpacing: '1px' }}>ISO 27001</div></div>}
      </div>

      <nav style={{ flex: 1 }}>
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button key={item.id} onClick={() => setActiveScreen(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: sidebarCollapsed ? '12px' : '12px 16px', marginBottom: '6px', background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent', border: 'none', borderRadius: '12px', color: isActive ? '#10b981' : t.textMuted, cursor: 'pointer', transition: 'all 0.2s ease', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
              <item.icon size={20} />
              {!sidebarCollapsed && <span style={{ fontSize: '14px', fontWeight: isActive ? 600 : 500 }}>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <SidebarProgressRings theme={t} language={language} collapsed={sidebarCollapsed} />

      {/* Collapse Button */}
      <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ position: 'absolute', top: '50%', right: '-12px', width: '24px', height: '24px', borderRadius: '50%', background: t.cardBg, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: t.textDim }}>
        {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
};

export default Sidebar;