/* eslint-disable */
import React, { createContext, useContext, useState } from 'react';

export const ThemeContext = createContext();

export const themes = {
  dark: { 
    bg: 'linear-gradient(135deg, #0a0f1c 0%, #111827 50%, #0d1321 100%)', 
    cardBg: 'rgba(15, 23, 42, 0.6)', 
    sidebarBg: 'rgba(15, 23, 42, 0.8)', 
    text: '#e2e8f0', 
    textMuted: '#94a3b8', 
    textDim: '#64748b', 
    border: 'rgba(255,255,255,0.06)', 
    inputBg: 'rgba(255,255,255,0.05)', 
    hoverBg: 'rgba(255,255,255,0.03)' 
  },
  light: { 
    bg: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)', 
    cardBg: 'rgba(255, 255, 255, 0.8)', 
    sidebarBg: 'rgba(255, 255, 255, 0.9)', 
    text: '#1e293b', 
    textMuted: '#475569', 
    textDim: '#64748b', 
    border: 'rgba(0,0,0,0.08)', 
    inputBg: 'rgba(0,0,0,0.03)', 
    hoverBg: 'rgba(0,0,0,0.02)' 
  },
  highContrast: { 
    bg: '#000000', cardBg: '#000000', sidebarBg: '#000000', text: '#ffffff', 
    textMuted: '#ffffff', textDim: '#cccccc', border: '#ffffff', inputBg: '#1a1a1a', hoverBg: '#333333' 
  }
};

export const translations = {
  en: {
    dashboard: 'Dashboard', gapAnalysis: 'Gap Analysis', docGenerator: 'Doc Generator', 
    riskMap: 'Risk Map', evidenceCenter: 'Evidence Center', documents: 'Documents', 
    auditRoom: 'Audit Room', settings: 'Settings', userManagement: 'User Management',
    commandCenter: 'Command Center', realtimeOverview: 'Real-time ISO 27001 compliance overview',
    synced: 'Synced', minAgo: 'min ago', exportReport: 'Export Report', healthScore: 'Health Score',
    ready: 'Ready', controlsImplemented: 'Controls Implemented', pendingActions: 'Pending Actions',
    highPriority: 'high priority', daysToAudit: 'Days to Audit', continueGapAnalysis: 'Continue Gap Analysis',
    completeAssessment: 'Complete your ISO 27001:2022 assessment', complete: 'complete', 
    continue: 'Continue', saveProgress: 'Save Progress', overallProgress: 'Overall Progress',
    phases: 'Phases', question: 'Question', of: 'of', critical: 'Critical', previous: 'Previous',
    soaPreview: 'SOA Preview', previewSoa: 'Preview SOA', highContrast: 'High Contrast'
    // ... añade aquí todas las que veas en el Gist que falten
  },
  es: {
    dashboard: 'Panel', gapAnalysis: 'Análisis de Brechas', docGenerator: 'Generador de Docs', 
    riskMap: 'Mapa de Riesgos', evidenceCenter: 'Centro de Evidencias', documents: 'Documentos', 
    auditRoom: 'Sala de Auditoría', settings: 'Configuración', userManagement: 'Gestión de Usuarios',
    commandCenter: 'Centro de Mando', realtimeOverview: 'Visión general de cumplimiento ISO 27001',
    synced: 'Sincronizado hace', minAgo: 'min', exportReport: 'Exportar Informe', healthScore: 'Puntuación de Salud',
    ready: 'Listo', controlsImplemented: 'Controles Implementados', pendingActions: 'Acciones Pendientes',
    highPriority: 'alta prioridad', daysToAudit: 'Días para Auditoría', continueGapAnalysis: 'Continuar Análisis',
    completeAssessment: 'Completa tu evaluación ISO 27001:2022', complete: 'completado', 
    continue: 'Continuar', saveProgress: 'Guardar', overallProgress: 'Progreso General',
    phases: 'Fases', question: 'Pregunta', of: 'de', critical: 'Crítico', previous: 'Anterior',
    soaPreview: 'Vista Previa SOA', previewSoa: 'Ver SOA', highContrast: 'Alto Contraste'
  }
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState('es');
  const [highContrast, setHighContrast] = useState(false);
  const t = highContrast ? themes.highContrast : (darkMode ? themes.dark : themes.light);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, language, setLanguage, highContrast, setHighContrast, theme: t, translations }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export const useTranslation = () => {
  const { language } = useTheme();
  return (key) => translations[language]?.[key] || translations.en[key] || key;
};