import React from 'react';
import { Shield, Search, UserCircle, ChevronRight, ChevronLeft } from 'lucide-react';

const Sidebar = ({
  sidebarCollapsed,
  setSidebarCollapsed,
  activeScreen,
  setActiveScreen,
  t,
  navItems,
  navLabels,
  setShowEmployeePortal,
  setCommandPaletteOpen,
  darkMode,
  language,
  SidebarProgressRings
}) => {
  return (
    <aside style={{ width: sidebarCollapsed ? '80px' : '260px', background: t.sidebarBg, backdropFilter: 'blur(20px)', borderRight: `1px solid ${t.border}`, padding: '24px 16px', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease', position: 'relative', zIndex: 10 }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', padding: '0 8px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={24} color="white" />
        </div>
        {!sidebarCollapsed && <div><div style={{ fontWeight: 700, fontSize: '20px' }}>Dani</div><div style={{ fontSize: '11px', color: t.textDim, textTransform: 'uppercase', letterSpacing: '1px' }}>ISO 27001</div></div>}
      </div>

      {/* Command Palette Trigger */}
      {!sidebarCollapsed && (
        <button 
          onClick={() => setCommandPaletteOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.textDim, fontSize: '13px', cursor: 'pointer', marginBottom: '20px', width: '100%', textAlign: 'left' }}
        >
          <Search size={16} />
          <span style={{ flex: 1 }}>Search...</span>
          <kbd style={{ padding: '2px 6px', background: t.hoverBg, borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace' }}>⌘K</kbd>
        </button>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button key={item.id} onClick={() => setActiveScreen(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: sidebarCollapsed ? '12px' : '12px 16px', marginBottom: '6px', background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent', border: 'none', borderRadius: '12px', color: isActive ? '#10b981' : t.textMuted, cursor: 'pointer', transition: 'all 0.2s ease', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
              <Icon size={20} />
              {!sidebarCollapsed && <span style={{ fontSize: '14px', fontWeight: isActive ? 600 : 500 }}>{item.label}</span>}
            </button>
          );
        })}
        
        {/* Employee Portal Link */}
        <button onClick={() => setShowEmployeePortal(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: sidebarCollapsed ? '12px' : '12px 16px', marginBottom: '6px', marginTop: '16px', background: 'transparent', border: `1px dashed ${t.border}`, borderRadius: '12px', color: t.textDim, cursor: 'pointer', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
          <UserCircle size={20} />
          {!sidebarCollapsed && <span style={{ fontSize: '14px', fontWeight: 500 }}>{navLabels.employeePortal}</span>}
        </button>
      </nav>

      {/* Progress Rings (Gamification) */}
      <SidebarProgressRings darkMode={darkMode} theme={t} language={language} collapsed={sidebarCollapsed} />

      {/* Collapse Button */}
      <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ position: 'absolute', top: '50%', right: '-12px', width: '24px', height: '24px', borderRadius: '50%', background: t.cardBg, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: t.textDim }}>
        {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
};

export default Sidebar;