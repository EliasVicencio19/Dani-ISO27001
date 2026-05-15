/* eslint-disable */
import React, { useContext } from 'react';
import { 
  Shield, Clock, CheckCircle2, FileText
} from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';

const EmployeePortalScreen = () => {
  const { theme: t, darkMode } = useContext(ThemeContext);

  // ==========================================
  // DATOS DE DEMOSTRACIÓN (Basados en la imagen)
  // ==========================================
  const policies = [
    { 
      id: 1, 
      title: 'Information Security Policy', 
      version: 'v2.1', 
      description: 'Defines the overall approach to information security within the organization.' 
    },
    { 
      id: 2, 
      title: 'Acceptable Use Policy', 
      version: 'v1.5', 
      description: 'Guidelines for appropriate use of company IT resources and data.' 
    },
    { 
      id: 3, 
      title: 'Password Policy', 
      version: 'v1.3', 
      description: 'Requirements for creating and managing secure passwords.' 
    }
  ];

  // ==========================================
  // RENDERIZADO VISUAL
  // ==========================================
  return (
    <div style={{ animation: 'fadeIn 0.4s ease', color: t.text, display: 'flex', flexDirection: 'column', gap: '32px', height: '100%', paddingBottom: '24px' }}>
      
      {/* HEADER TIPO TOPBAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '24px', borderBottom: `1px solid ${t.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
            <Shield size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: t.text, marginBottom: '4px' }}>Portal de Concientización</h1>
            <p style={{ color: t.textDim, fontSize: '14px' }}>Revisa y acepta las políticas de la empresa</p>
          </div>
        </div>
        <button style={{ padding: '10px 20px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '10px', color: t.textDim, fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
          Salir del Portal
        </button>
      </div>

      {/* TARJETAS DE RESUMEN (STATS) */}
      <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
        {/* Tarjeta Pendientes */}
        <div style={{ width: '320px', background: darkMode ? 'rgba(245, 158, 11, 0.05)' : t.cardBg, border: `1px solid rgba(245, 158, 11, 0.3)`, borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={28} color="#f59e0b" />
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#f59e0b', lineHeight: '1' }}>5</div>
            <div style={{ fontSize: '13px', color: t.textDim, fontWeight: 600, marginTop: '4px' }}>Pendientes</div>
          </div>
        </div>

        {/* Tarjeta Completados */}
        <div style={{ width: '320px', background: darkMode ? 'rgba(16, 185, 129, 0.02)' : t.cardBg, border: `1px solid rgba(16, 185, 129, 0.15)`, borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={28} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#10b981', lineHeight: '1' }}>0</div>
            <div style={{ fontSize: '13px', color: t.textDim, fontWeight: 600, marginTop: '4px' }}>Completados</div>
          </div>
        </div>
      </div>

      {/* LISTA DE POLÍTICAS */}
      <div style={{ background: t.cardBg, borderRadius: '20px', border: `1px solid ${t.border}`, padding: '32px', flex: 1 }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: t.text, marginBottom: '24px' }}>Políticas</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {policies.map((policy) => (
            <div key={policy.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '16px', transition: 'all 0.2s', cursor: 'pointer' }}>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }}>
                  <FileText size={20} color={t.textDim} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: t.text }}>{policy.title}</h3>
                    <span style={{ fontSize: '11px', padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', color: t.textDim, fontWeight: 600 }}>{policy.version}</span>
                    <span style={{ fontSize: '10px', padding: '3px 8px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '6px', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Obligatorio</span>
                  </div>
                  <p style={{ fontSize: '13px', color: t.textDim, lineHeight: '1.5' }}>{policy.description}</p>
                </div>
              </div>

              <button style={{ padding: '12px 24px', background: '#10b981', border: 'none', borderRadius: '10px', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)', transition: 'transform 0.2s' }}>
                Ver Política
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default EmployeePortalScreen;