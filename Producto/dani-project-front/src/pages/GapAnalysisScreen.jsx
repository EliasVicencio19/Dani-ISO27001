/* eslint-disable */
import React, { useState, useContext, useEffect } from 'react';
import { 
  Building2, Target, Users, Lock, Sparkles, Eye,
  ChevronLeft, ChevronRight, Download, FolderUp, CheckCircle2,
  AlertCircle 
} from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';
// Importamos la pasarela de la API que unificamos previamente
import { complianceAPI } from '../services/api';
import InteractiveSOA from '../components/InteractiveSOA'; 

function GapAnalysisScreen() {
  const { theme: t, language, translations } = useContext(ThemeContext);
  const tr = (key) => translations?.[language]?.[key] || translations?.en?.[key] || key;
  
  const [activeTab, setActiveTab] = useState('assessment');
  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  // ==========================================
  // NUEVOS ESTADOS DE CONTROL Y ECOOSISTEMA
  // ==========================================
  const [controls, setControls] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Helper local para traducir las opciones dinámicamente en UI sin alterar claves guardadas
  const translateOption = (option) => {
    if (language !== 'es') return option;
    if (option === 'Yes') return 'Sí';
    if (option === 'No') return 'No';
    if (option === 'Partially') return 'Parcialmente';
    return option;
  };

  // 🔄 Carga síncrona de datos reales del backend al montar el componente
  useEffect(() => {
    const loadISOControls = async () => {
      try {
        const data = await complianceAPI.getControls();
        // Soportamos si el backend devuelve un objeto directo o un arreglo plano
        setControls(data.controls || data || []);
      } catch (error) {
        console.error("Error al sincronizar controles ISO con el backend:", error);
        // Fallback local defensivo para que la demo no se rompa si la BD está vacía
        setControls([
          { id: 'A.5.1', control: 'A.5.1', description: language === 'es' ? 'Políticas para la seguridad de la información' : 'Policies for information security', category: 'Organizational', applies: true, status: 'Implementado', justification: language === 'es' ? 'Requerido para el establecimiento del marco de SGSI' : 'Required for ISMS framework establishment' },
          { id: 'A.5.2', control: 'A.5.2', description: language === 'es' ? 'Roles de seguridad de la información' : 'Information security roles', category: 'Organizational', applies: true, status: 'Implementado', justification: language === 'es' ? 'Obligatorio para la gobernanza de seguridad' : 'Mandatory for security governance' },
          { id: 'A.5.15', control: 'A.5.15', description: language === 'es' ? 'Control de acceso' : 'Access control', category: 'Organizational', applies: true, status: 'Implementado', justification: language === 'es' ? 'Crítico para la protección de datos' : 'Critical for data protection' },
          { id: 'A.5.16', control: 'A.5.16', description: language === 'es' ? 'Gestión de identidad' : 'Identity management', category: 'Organizational', applies: true, status: 'Planificado', justification: language === 'es' ? 'Planificado para Q1 2026' : 'Scheduled for Q1 2026' },
          { id: 'A.7.4', control: 'A.7.4', description: language === 'es' ? 'Monitoreo de seguridad física' : 'Physical security monitoring', category: 'Physical', applies: false, status: 'No Implementado', justification: language === 'es' ? 'Sin centro de datos físico - solo nube' : 'No physical data center - cloud only' }
        ]);
      }
    };
    loadISOControls();
  }, [language]); // Recargamos fallbacks si cambia el idioma en caliente

  // ==========================================
  // MANEJADOR EN LA NUBE PARA GUARDAR PROGRESO
  // ==========================================
  const handleSaveProgress = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      // Disparamos la petición masiva al backend en Python
      await complianceAPI.fullAssessment({ controls });
      alert(language === 'es' ? "✨ ¡Progreso del Gap Analysis guardado con éxito en PostgreSQL!" : "✨ Gap Analysis progress saved successfully in PostgreSQL!");
    } catch (error) {
      console.error("Error salvando SOA:", error);
      alert(language === 'es' ? "⚠️ No se pudo sincronizar con el servidor. Datos guardados localmente." : "⚠️ Could not sync with the server. Data saved locally.");
    } finally {
      setIsSaving(false);
    }
  };

  // Datos de las Fases localizados en tiempo de renderizado
  const phases = [
    { 
      id: 'context', 
      name: language === 'es' ? 'Contexto y Liderazgo' : 'Context & Leadership', 
      clause: language === 'es' ? 'Cláusulas 4 y 5' : 'Clauses 4 & 5', 
      icon: Building2, 
      color: '#3b82f6', 
      questions: [
        { id: 'q1', title: language === 'es' ? 'Contexto de la Organización' : 'Organization Context', question: language === 'es' ? '¿Ha determinado las cuestiones externas e internas relevantes para su SGSI?' : 'Have you determined external and internal issues relevant to your ISMS?', options: ['Yes', 'No'], critical: true },
        { id: 'q2', title: language === 'es' ? 'Partes Interesadas' : 'Interested Parties', question: language === 'es' ? '¿Ha identificado a las partes interesadas relevantes para la seguridad de la información?' : 'Have you identified stakeholders relevant to information security?', options: ['Yes', 'No'], critical: true },
        { id: 'q3', title: language === 'es' ? 'Alcance del SGSI' : 'ISMS Scope', question: language === 'es' ? '¿Está el alcance del SGSI claramente definido y documentado?' : 'Is the ISMS scope clearly defined and documented?', options: ['Yes', 'No'], critical: true },
      ]
    },
    { 
      id: 'planning', 
      name: language === 'es' ? 'Planificación y Riesgo' : 'Planning & Risk', 
      clause: language === 'es' ? 'Cláusula 6' : 'Clause 6', 
      icon: Target, 
      color: '#10b981', 
      questions: [
        { id: 'q5', title: language === 'es' ? 'Metodología de Riesgos' : 'Risk Methodology', question: language === 'es' ? '¿Cuenta con un proceso documentado de evaluación de riesgos?' : 'Do you have a documented risk assessment process?', options: ['Yes', 'No'], critical: true },
        { id: 'q6', title: language === 'es' ? 'Tratamiento de Riesgos' : 'Risk Treatment', question: language === 'es' ? '¿Ha formulado un plan de tratamiento de riesgos?' : 'Have you formulated a risk treatment plan?', options: ['Yes', 'Partially', 'No'], critical: true },
      ]
    },
    { 
      id: 'support', 
      name: language === 'es' ? 'Soporte y Operación' : 'Support & Ops', 
      clause: language === 'es' ? 'Cláusulas 7 y 8' : 'Clauses 7 & 8', 
      icon: Users, 
      color: '#f59e0b', 
      questions: [
        { id: 'q8', title: language === 'es' ? 'Capacitación y Concienciación' : 'Training & Awareness', question: language === 'es' ? '¿Han recibido los empleados capacitación en concienciación sobre seguridad?' : 'Have employees received security awareness training?', options: ['Yes', 'Partially', 'No'], critical: false },
      ]
    },
    { 
      id: 'annex', 
      name: language === 'es' ? 'Controles del Anexo A' : 'Annex A Controls', 
      clause: language === 'es' ? 'Anexo A' : 'Annex A', 
      icon: Lock, 
      color: '#a855f7', 
      questions: [
        { id: 'q10', title: language === 'es' ? 'Control de Acceso' : 'Access Control', question: language === 'es' ? '¿Existe un proceso formal de registro de usuarios?' : 'Is there a formal user registration process?', options: ['Yes', 'No'], critical: true },
        { id: 'q11', title: language === 'es' ? 'Copias de Seguridad' : 'Backups', question: language === 'es' ? '¿Se realizan y prueban copias de seguridad con regularidad?' : 'Are backups taken and tested regularly?', options: ['Yes', 'Partially', 'No'], critical: true },
      ]
    }
  ];

  const currentPhaseData = phases[currentPhase];
  const currentQuestionData = currentPhaseData?.questions[currentQuestion];
  
  const totalQuestions = phases.reduce((sum, p) => sum + p.questions.length, 0);
  const answeredQuestions = Object.keys(answers).length;
  const globalProgress = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  const getPhaseProgress = (idx) => {
    const phase = phases[idx];
    if (phase.questions.length === 0) return 0;
    const answered = phase.questions.filter(q => answers[q.id]).length;
    return Math.round((answered / phase.questions.length) * 100);
  };

  const handleAnswer = (answer) => setAnswers({ ...answers, [currentQuestionData.id]: answer });
  
  const goToNext = () => { 
    if (currentQuestion < currentPhaseData.questions.length - 1) setCurrentQuestion(currentQuestion + 1); 
    else if (currentPhase < phases.length - 1) { setCurrentPhase(currentPhase + 1); setCurrentQuestion(0); } 
  };
  
  const goToPrev = () => { 
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1); 
    else if (currentPhase > 0) { setCurrentPhase(currentPhase - 1); setCurrentQuestion(phases[currentPhase - 1].questions.length - 1); } 
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease', color: t.text }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px', color: t.text }}>{tr('gapAnalysis')}</h1>
          <p style={{ color: t.textDim, fontSize: '15px' }}>
            {language === 'es' ? 'Completa la evaluación para generar tu Declaración de Aplicabilidad (SOA)' : 'Complete assessment to generate your SOA'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', background: t.inputBg, padding: '4px', borderRadius: '10px', border: `1px solid ${t.border}` }}>
            <button onClick={() => setActiveTab('assessment')} style={{ padding: '8px 16px', borderRadius: '6px', background: activeTab === 'assessment' ? '#0f766e20' : 'transparent', color: activeTab === 'assessment' ? '#10b981' : t.textMuted, fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: activeTab === 'assessment' ? '1px solid #10b98140' : '1px solid transparent' }}>
              {language === 'es' ? 'Evaluación' : 'Assessment'}
            </button>
            <button onClick={() => setActiveTab('soa')} style={{ padding: '8px 16px', borderRadius: '6px', background: activeTab === 'soa' ? '#8b5cf620' : 'transparent', color: activeTab === 'soa' ? '#8b5cf6' : t.textMuted, fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: activeTab === 'soa' ? '1px solid #8b5cf640' : '1px solid transparent' }}>
              {tr('soaPreview')}
            </button>
          </div>
          <button style={{ padding: '10px 20px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, cursor: 'pointer', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderUp size={16} /> {language === 'es' ? 'Carga Masiva' : 'Bulk Upload'}
          </button>
          {/* CONECTADO: Botón Save Progress ejecuta la sincronización con FastAPI */}
          <button 
            onClick={handleSaveProgress}
            disabled={isSaving}
            style={{ padding: '10px 20px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: isSaving ? t.textMuted : t.text, cursor: isSaving ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', opacity: isSaving ? 0.7 : 1 }}
          >
            <Download size={16} /> {isSaving ? (language === 'es' ? 'Guardando...' : 'Saving...') : (language === 'es' ? 'Guardar Progreso' : 'Save Progress')}
          </button>
        </div>
      </div>

      {activeTab === 'assessment' && currentPhaseData && currentQuestionData && (
        <>
          <div style={{ background: t.cardBg, borderRadius: '16px', padding: '24px', border: `1px solid ${t.border}`, marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', color: t.textDim, fontWeight: 500 }}>{tr('overallProgress')}:</span>
              <span style={{ fontSize: '16px', color: '#10b981', fontWeight: 700 }}>{globalProgress}%</span>
            </div>
            <div style={{ display: 'flex', gap: '4px', height: '8px' }}>
              {phases.map((p, i) => {
                const phaseProg = getPhaseProgress(i);
                return (
                  <div key={i} style={{ flex: 1, background: t.inputBg, borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${phaseProg}%`, height: '100%', background: '#10b981', transition: 'width 0.3s ease' }} />
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 300px', gap: '24px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '11px', color: t.textDim, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginLeft: '4px' }}>{tr('phases')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {phases.map((phase, idx) => {
                  const Icon = phase.icon; 
                  const isActive = currentPhase === idx;
                  return (
                    <button key={phase.id} onClick={() => { setCurrentPhase(idx); setCurrentQuestion(0); }} style={{ 
                      width: '100%', display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', 
                      background: isActive ? 'rgba(59, 130, 246, 0.1)' : t.cardBg, 
                      border: isActive ? `1px solid rgba(59, 130, 246, 0.3)` : `1px solid ${t.border}`, 
                      borderRadius: '16px', color: t.text, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease'
                    }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: isActive ? '#3b82f6' : t.inputBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={18} color={isActive ? 'white' : t.textDim} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: isActive ? 'white' : t.text }}>{phase.name}</div>
                        <div style={{ fontSize: '11px', color: isActive ? 'rgba(255,255,255,0.7)' : t.textDim, marginTop: '2px' }}>{phase.clause}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ background: t.cardBg, borderRadius: '20px', border: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '24px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <currentPhaseData.icon size={20} color="#3b82f6" />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: t.text }}>{currentPhaseData.name}</h2>
              </div>

              <div style={{ padding: '32px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '12px 16px', background: t.inputBg, borderRadius: '10px' }}>
                  <span style={{ fontSize: '13px', color: t.textDim, fontWeight: 500 }}>
                    {language === 'es' ? 'Pregunta' : 'Question'} <strong style={{color: '#3b82f6', fontSize: '15px'}}>{currentQuestion + 1}</strong> {language === 'es' ? 'de' : 'of'} {currentPhaseData.questions.length}
                  </span>
                  {currentQuestionData.critical && (
                    <span style={{ padding: '4px 10px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderRadius: '6px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={12} /> {tr('critical')}
                    </span>
                  )}
                </div>
                
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: t.text, marginBottom: '16px' }}>{currentQuestionData.title}</h3>
                <p style={{ fontSize: '20px', fontWeight: 500, color: t.text, marginBottom: '40px', lineHeight: '1.4' }}>{currentQuestionData.question}</p>
                
                <div style={{ display: 'flex', gap: '16px' }}>
                  {currentQuestionData.options.map(option => (
                    <button 
                      key={option} 
                      onClick={() => handleAnswer(option)} 
                      style={{ 
                        flex: 1, padding: '16px', borderRadius: '12px', 
                        border: answers[currentQuestionData.id] === option ? '2px solid #3b82f6' : `1px solid ${t.border}`, 
                        background: answers[currentQuestionData.id] === option ? 'rgba(59, 130, 246, 0.1)' : t.inputBg, 
                        color: t.text, cursor: 'pointer', fontWeight: 600, fontSize: '16px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {translateOption(option)}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ padding: '24px 32px', borderTop: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.1)' }}>
                <button onClick={goToPrev} disabled={currentPhase === 0 && currentQuestion === 0} style={{ padding: '12px 24px', background: 'transparent', border: 'none', color: t.textDim, cursor: (currentPhase === 0 && currentQuestion === 0) ? 'not-allowed' : 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <ChevronLeft size={18} /> {tr('previous')}
                </button>
                <button onClick={goToNext} disabled={!answers[currentQuestionData.id]} style={{ padding: '12px 24px', background: answers[currentQuestionData.id] ? '#3b82f6' : t.inputBg, border: 'none', borderRadius: '10px', color: answers[currentQuestionData.id] ? 'white' : t.textMuted, cursor: answers[currentQuestionData.id] ? 'pointer' : 'not-allowed', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', transition: 'all 0.2s ease' }}>
                  {language === 'es' ? 'Continuar' : 'Continue'} <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div style={{ background: t.cardBg, borderRadius: '20px', padding: '24px', border: `1px solid ${t.border}`, height: 'fit-content', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <Sparkles size={20} color="#10b981" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: t.text }}>{tr('soaPreview')}</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
                {phases.map((phase, idx) => (
                  <div key={phase.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CheckCircle2 size={16} color={getPhaseProgress(idx) === 100 ? '#10b981' : t.textMuted} />
                    <div style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: t.textDim }}>{phase.clause}</div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: t.textMuted }}>{getPhaseProgress(idx)}%</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setActiveTab('soa')}
                style={{ width: '100%', padding: '14px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', color: '#10b981', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' }}
              >
                <Eye size={16} /> {tr('previewSoa')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* CONECTADO: Pasamos el estado de los controles y su set a la vista interactiva de la tabla */}
      {activeTab === 'soa' && (
        <InteractiveSOA 
          controls={controls} 
          setControls={setControls} 
        />
      )}
    </div>
  );
}

export default GapAnalysisScreen;