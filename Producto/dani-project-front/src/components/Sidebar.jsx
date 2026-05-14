/* eslint-disable */
import React from 'react';
import { LayoutDashboard, Search, FilePlus2, AlertTriangle, Database, FileText, FileCheck, Users, ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function SidebarProgressRings({ theme: t, language, collapsed }) {
  if (collapsed) return null;
  const domainProgress = [
    { name: language === 'es' ? 'Personas' : 'People', progress: 82, color: '#3b82f6' },
    { name: language === 'es' ? 'Tecnología' : 'Technology', progress: 68, color: '#8b5cf6' },
    { name: language === 'es' ? 'Físico' : 'Physical', progress: 91, color: '#10b981' },
    { name: language === 'es' ? 'Procesos' : 'Processes', progress: 55, color: '#f59e0b' }
  ];

  return (
    <div style={{ padding: '16px', borderTop: `1px solid ${t.border}`, marginTop: 'auto' }}>
      <div style={{ fontSize: '10px', fontWeight: 700, color: t.textDim, textTransform: 'uppercase', marginBottom: '12px' }}>GAP ANALYSIS</div>
      {domainProgress.map((d, i) => (
        <div key={i} style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '4px' }}>
            <span style={{ color: t.textMuted }}>{d.name}</span>
            <span style={{ color: d.color, fontWeight: 600 }}>{d.progress}%</span>
          </div>
          <div style={{ height: '4px', background: t.border, borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${d.progress}%`, height: '100%', background: d.color }} />
          </div>
        </div>
      ))}
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
  ];

  return (
    <aside style={{ width: sidebarCollapsed ? '80px' : '280px', background: t.sidebarBg, borderRight: `1px solid ${t.border}`, transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', zIndex: 20 }}>
      <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {!sidebarCollapsed && <span style={{ fontSize: '20px', fontWeight: 800, color: t.text, display: 'flex', alignItems: 'center', gap: '10px' }}><Shield size={24} color="#10b981" /> DANI</span>}
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: t.textDim }}>
          {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      <nav style={{ flex: 1, padding: '0 16px' }}>
        {navItems.map((item) => (
          <button key={item.id} onClick={() => setActiveScreen(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', marginBottom: '4px', borderRadius: '12px', border: 'none', background: activeScreen === item.id ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: activeScreen === item.id ? '#10b981' : t.textMuted, cursor: 'pointer' }}>
            <item.icon size={20} />
            {!sidebarCollapsed && <span style={{ fontSize: '14px', fontWeight: activeScreen === item.id ? 600 : 500 }}>{item.label}</span>}
          </button>
        ))}
      </nav>
      <SidebarProgressRings theme={t} language={language} collapsed={sidebarCollapsed} />
    </aside>
  );
};

export default Sidebar;