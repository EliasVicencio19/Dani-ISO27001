/* eslint-disable */
import React, { useState, useEffect, useContext } from 'react';
import { Shield, Search, Download, RefreshCw, Clock, ArrowRight, FileCheck, AlertTriangle, Plus } from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import CAPATracker from '../components/CAPATracker';
import { getComplianceScore, riskAPI, capaAPI } from '../services/api';

const DashboardScreen = ({ onNavigate }) => {
  const { theme: t, language, translations, darkMode } = useContext(ThemeContext);
  const { user } = useAuth();
  const tr = (key) => translations[language]?.[key] || translations.en[key] || key;
  const canAccessGapAnalysis = ['admin', 'manager', 'auditor'].includes(user?.role);

  const [healthScore, setHealthScore] = useState(null);
  const [riskStats, setRiskStats] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [scoreData, statsData] = await Promise.all([
          getComplianceScore(),
          riskAPI.getStatistics()
        ]);
        if (scoreData && !scoreData.detail) setHealthScore(Math.round(scoreData.overall_score ?? scoreData.score ?? 0));
        if (statsData && !statsData.detail) setRiskStats(statsData);
        setLastSync(new Date());
      } catch (_) {}
      finally { setIsLoading(false); }
    };
    loadDashboardData();
  }, []);

  const generatePDFReport = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const capas = await capaAPI.getAll().catch(() => []);

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = 210;
      const margin = 20;
      let y = margin;

      const addText = (text, x, fontSize = 11, style = 'normal', color = [30, 30, 30]) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', style);
        doc.setTextColor(...color);
        doc.text(String(text), x, y);
      };

      const lineBreak = (h = 7) => { y += h; };

      const divider = (color = [200, 200, 200]) => {
        doc.setDrawColor(...color);
        doc.line(margin, y, W - margin, y);
        lineBreak(5);
      };

      // — Cabecera —
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, W, 28, 'F');
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('DANI ISO 27001 — Informe de Cumplimiento', margin, 13);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generado el ${new Date().toLocaleString('es')} · Usuario: ${user?.full_name || user?.email || '—'}`, margin, 21);
      y = 38;

      // — Sección 1: Estado General —
      addText('1. Estado General de Cumplimiento', margin, 13, 'bold', [16, 185, 129]);
      lineBreak(8);
      divider([180, 220, 200]);

      const score = healthScore ?? 0;
      addText(`Índice de Salud ISO 27001:`, margin, 11, 'bold');
      addText(`${score}%`, margin + 72, 11, 'normal', score >= 75 ? [16, 185, 129] : score >= 50 ? [245, 158, 11] : [239, 68, 68]);
      lineBreak();
      addText('Controles implementados:', margin, 11, 'normal');
      addText('92 / 114  (80.7%)', margin + 60, 11, 'normal');
      lineBreak();
      addText('Umbral de certificación:', margin, 11, 'normal');
      addText('85%', margin + 60, 11, 'normal');
      lineBreak();
      addText('Estado:', margin, 11, 'normal');
      const readinessText = score >= 85 ? 'LISTO PARA AUDITORÍA' : score >= 70 ? 'CASI LISTO' : 'EN PROGRESO';
      addText(readinessText, margin + 30, 11, 'bold', score >= 85 ? [16, 185, 129] : score >= 70 ? [245, 158, 11] : [239, 68, 68]);
      lineBreak(12);

      // — Sección 2: Riesgos —
      addText('2. Mapa de Riesgos', margin, 13, 'bold', [16, 185, 129]);
      lineBreak(8);
      divider([180, 220, 200]);

      if (riskStats) {
        const levels = [
          ['Riesgos abiertos totales:', riskStats.open_risks ?? 0],
          ['Críticos:', riskStats.by_level?.critical ?? 0],
          ['Altos:', riskStats.by_level?.high ?? 0],
          ['Medios:', riskStats.by_level?.medium ?? 0],
          ['Bajos:', riskStats.by_level?.low ?? 0],
        ];
        for (const [label, val] of levels) {
          addText(label, margin, 10, 'normal');
          addText(String(val), margin + 65, 10, 'bold');
          lineBreak(6);
        }
      } else {
        addText('No se pudieron cargar estadísticas de riesgo.', margin, 10, 'italic', [120, 120, 120]);
        lineBreak(6);
      }
      lineBreak(5);

      // — Sección 3: CAPAs —
      addText('3. No Conformidades y Acciones Correctivas (CAPA)', margin, 13, 'bold', [16, 185, 129]);
      lineBreak(8);
      divider([180, 220, 200]);

      if (capas.length === 0) {
        addText('Sin no conformidades registradas.', margin, 10, 'italic', [120, 120, 120]);
        lineBreak(6);
      } else {
        const statusLabel = { open: 'Abierta', inProgress: 'En Progreso', resolved: 'Resuelta', closed: 'Cerrada' };
        const priorityLabel = { high: 'Alta', medium: 'Media', low: 'Baja' };

        const headers = ['Código', 'Título', 'Prioridad', 'Estado', 'Progreso'];
        const colX = [margin, margin + 22, margin + 100, margin + 122, margin + 148];

        doc.setFillColor(240, 253, 250);
        doc.rect(margin, y - 4, W - margin * 2, 8, 'F');
        headers.forEach((h, i) => addText(h, colX[i], 9, 'bold', [16, 185, 129]));
        lineBreak(7);
        divider([180, 220, 200]);

        for (const c of capas) {
          if (y > 265) {
            doc.addPage();
            y = margin;
          }
          const title = c.title?.length > 40 ? c.title.slice(0, 37) + '...' : c.title;
          addText(c.nc_code || '—', colX[0], 8, 'normal');
          addText(title || '—', colX[1], 8, 'normal');
          addText(priorityLabel[c.priority] || c.priority, colX[2], 8, 'normal');
          addText(statusLabel[c.status] || c.status, colX[3], 8, 'normal');
          addText(`${c.progress ?? 0}%`, colX[4], 8, 'normal');
          lineBreak(6);
        }

        lineBreak(4);
        const open = capas.filter(c => c.status === 'open').length;
        const inProg = capas.filter(c => c.status === 'inProgress').length;
        const resolved = capas.filter(c => ['resolved', 'closed'].includes(c.status)).length;
        addText(`Total: ${capas.length}  ·  Abiertas: ${open}  ·  En progreso: ${inProg}  ·  Resueltas/Cerradas: ${resolved}`, margin, 9, 'italic', [80, 80, 80]);
        lineBreak(10);
      }

      // — Pie de página —
      if (y > 265) { doc.addPage(); y = margin; }
      doc.setDrawColor(16, 185, 129);
      doc.line(margin, y, W - margin, y);
      lineBreak(5);
      addText('Informe generado automáticamente por DANI · Plataforma de Gestión ISO 27001', margin, 8, 'italic', [120, 120, 120]);

      doc.save(`DANI_Informe_ISO27001_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('No se pudo generar el informe. Intenta de nuevo.');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* HEADER PROFESIONAL */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: t.text }}>{tr('commandCenter')}</h1>
          <p style={{ color: t.textDim, fontSize: '15px' }}>{tr('realtimeOverview')}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', fontSize: '13px', color: '#10b981' }}>
            <RefreshCw size={14} />
            {lastSync ? `Actualizado ${lastSync.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}` : 'Cargando...'}
          </div>
          <button
            onClick={generatePDFReport}
            style={{ padding: '10px 20px', background: '#10b981', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
          >
            <Download size={16} /> {tr('exportReport')}
          </button>
        </div>
      </div>

      {/* GRID DE ESTADÍSTICAS CON DISEÑO ORIGINAL */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }}>
        {/* Salud con Gradiente */}
        <div style={{ background: t.cardBg, backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '24px', border: `1px solid ${t.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: t.textDim, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>{tr('healthScore')}</div>
          <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto' }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke={darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} strokeWidth="12" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="url(#hg)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(healthScore ?? 0) * 3.27} 327`} transform="rotate(-90 60 60)" />
              <defs><linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#059669" /></linearGradient></defs>
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>
                {isLoading ? '...' : `${healthScore ?? '--'}%`}
              </div>
              <div style={{ fontSize: '11px', color: t.textDim }}>{tr('ready')}</div>
            </div>
          </div>
        </div>

        {/* Controles Implementados */}
        <div style={{ background: t.cardBg, backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '24px', border: `1px solid ${t.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '36px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={18} color="#3b82f6" /></div>
            <span style={{ fontSize: '13px', color: t.textMuted }}>{tr('controlsImplemented')}</span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>92<span style={{ fontSize: '20px', color: t.textDim }}>/114</span></div>
          <div style={{ background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: '80.7%', height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', borderRadius: '3px' }} />
          </div>
        </div>

        {/* Acciones Pendientes */}
        <div style={{ background: t.cardBg, backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '24px', border: `1px solid ${t.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '36px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clock size={18} color="#f59e0b" /></div>
            <span style={{ fontSize: '13px', color: t.textMuted }}>{tr('pendingActions')}</span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#f59e0b', marginBottom: '4px' }}>
            {isLoading ? '...' : (riskStats?.open_risks ?? '--')}
          </div>
          <div style={{ fontSize: '13px', color: t.textDim }}>
            {isLoading ? '' : `${(riskStats?.by_level?.critical ?? 0) + (riskStats?.by_level?.high ?? 0)} alto/crítico`}
          </div>
        </div>

        {/* Días para Auditoría */}
        <div style={{ background: t.cardBg, backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '24px', border: `1px solid ${t.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '36px', background: 'rgba(168, 85, 247, 0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileCheck size={18} color="#a855f7" /></div>
            <span style={{ fontSize: '13px', color: t.textMuted }}>{tr('daysToAudit')}</span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#a855f7', marginBottom: '4px' }}>47</div>
          <div style={{ fontSize: '13px', color: t.textDim }}>Aug 15, 2025</div>
        </div>
      </div>

      {/* BANNER DE ACCESO RÁPIDO — solo roles con acceso a Gap Analysis */}
      {canAccessGapAnalysis && (
        <div
          onClick={() => onNavigate('gap-analysis')}
          style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', marginBottom: '24px' }}
        >
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Search size={28} color="#10b981" /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>{tr('continueGapAnalysis')}</div>
            <div style={{ fontSize: '14px', color: t.textDim }}>{tr('completeAssessment')} • {isLoading ? '...' : `${healthScore ?? '--'}%`} {tr('complete')}</div>
          </div>
          <div style={{ padding: '12px 24px', background: '#10b981', borderRadius: '10px', color: 'white', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {tr('continue')} <ArrowRight size={16} />
          </div>
        </div>
      )}

      {/* RASTREADOR CAPA MODULAR COMPLETO */}
      <CAPATracker />
    </div>
  );
};

export default DashboardScreen;