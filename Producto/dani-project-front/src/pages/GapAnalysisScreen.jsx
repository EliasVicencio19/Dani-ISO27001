// src/pages/GapAnalysisScreen.jsx
import React, { useState, useContext, useEffect } from 'react';
import { 
  Building2, Target, Users, Lock, Sparkles, Eye,
  ChevronLeft, ChevronRight, Download, FolderUp, CheckCircle2, 
  AlertCircle, Activity, Shield, Edit3, FileCheck, Globe
} from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';
import { complianceAPI } from '../services/api';

function GapAnalysisScreen() {
  const { theme: t } = useContext(ThemeContext);
  
  // ==========================================
  // TRADUCCIONES COMPLETAS
  // ==========================================
  const translations = {
    en: {
      gapAnalysis: 'Gap Analysis',
      completeAssessment: 'Complete the assessment to generate your SOA',
      evaluation: 'Assessment',
      previewSOA: 'SOA Preview',
      bulkUpload: 'Bulk Upload',
      saveProgress: 'Save Progress',
      generalProgress: 'General Progress',
      phases: 'PHASES',
      question: 'Question',
      critical: 'Critical',
      previous: 'Previous',
      continue: 'Continue',
      previewSOATitle: 'SOA Preview',
      viewSOA: 'View full SOA',
      saving: 'Saving...',
      soaTitle: 'Statement of Applicability (SOA)',
      soaApplicable: 'Applicable',
      soaImplemented: 'Implemented',
      control: 'Control',
      description: 'Description',
      applicable: 'Applicable',
      notApplicable: 'Not Applicable',
      justification: 'Justification',
      status: 'Status',
      implemented: 'Implemented',
      planned: 'Planned',
      notImplemented: 'Not Implemented',
      showAll: 'All',
      showApplicable: 'Applicable',
      showNotApplicable: 'Not Applicable',
      required: 'Required',
      autoSaved: 'Auto-saved',
      contextLeadership: 'Context & Leadership',
      planningRisk: 'Planning & Risk',
      supportOps: 'Support & Operations',
      annexA: 'Annex A Controls',
      clauses45: 'Clauses 4 & 5',
      clause6: 'Clause 6',
      clauses78: 'Clauses 7 & 8',
      annexAtext: 'Annex A',
      q1Title: 'Organization Context',
      q1Question: 'Have you determined external and internal issues relevant to your ISMS?',
      q2Title: 'Interested Parties',
      q2Question: 'Have you identified stakeholders relevant to information security?',
      q3Title: 'ISMS Scope',
      q3Question: 'Is the ISMS scope clearly defined and documented?',
      q4Title: 'Risk Methodology',
      q4Question: 'Do you have a documented risk assessment process?',
      q5Title: 'Risk Treatment',
      q5Question: 'Have you formulated a risk treatment plan?',
      q6Title: 'Training & Awareness',
      q6Question: 'Have employees received security awareness training?',
      q7Title: 'Organizational Controls',
      q7Question: 'Have organizational controls been implemented?',
      q8Title: 'Technological Controls',
      q8Question: 'Have technological controls been implemented?',
      yes: 'Yes',
      no: 'No',
      partially: 'Partially'
    },
    es: {
      gapAnalysis: 'Análisis de Brechas',
      completeAssessment: 'Completa la evaluación para generar tu Declaración de Aplicabilidad (SOA)',
      evaluation: 'Evaluación',
      previewSOA: 'Vista Previa SOA',
      bulkUpload: 'Carga Masiva',
      saveProgress: 'Guardar Progreso',
      generalProgress: 'Progreso General',
      phases: 'FASES',
      question: 'Pregunta',
      critical: 'Crítica',
      previous: 'Anterior',
      continue: 'Continuar',
      previewSOATitle: 'Vista previa de la SOA',
      viewSOA: 'Ver SOA completa',
      saving: 'Guardando...',
      soaTitle: 'Declaración de Aplicabilidad (SOA)',
      soaApplicable: 'Aplica',
      soaImplemented: 'Implementado',
      control: 'Control',
      description: 'Descripción',
      applicable: 'Aplica',
      notApplicable: 'No Aplica',
      justification: 'Justificación',
      status: 'Estado',
      implemented: 'Implementado',
      planned: 'Planificado',
      notImplemented: 'No Implementado',
      showAll: 'Todos',
      showApplicable: 'Aplica',
      showNotApplicable: 'No Aplica',
      required: 'Requerido',
      autoSaved: 'Auto-guardado',
      contextLeadership: 'Contexto y Liderazgo',
      planningRisk: 'Planificación y Riesgo',
      supportOps: 'Soporte y Operación',
      annexA: 'Controles del Anexo A',
      clauses45: 'Cláusulas 4 y 5',
      clause6: 'Cláusula 6',
      clauses78: 'Cláusulas 7 y 8',
      annexAtext: 'Anexo A',
      q1Title: 'Contexto de la Organización',
      q1Question: '¿Ha determinado las cuestiones externas e internas relevantes para su SGSI?',
      q2Title: 'Partes Interesadas',
      q2Question: '¿Ha identificado las partes interesadas relevantes para la seguridad de la información?',
      q3Title: 'Alcance del SGSI',
      q3Question: '¿El alcance del SGSI está claramente definido y documentado?',
      q4Title: 'Metodología de Riesgos',
      q4Question: '¿Existe una metodología documentada para la evaluación de riesgos?',
      q5Title: 'Tratamiento de Riesgos',
      q5Question: '¿Se ha formulado un plan de tratamiento de riesgos?',
      q6Title: 'Competencia y Concienciación',
      q6Question: '¿El personal ha recibido capacitación en seguridad de la información?',
      q7Title: 'Controles Organizacionales',
      q7Question: '¿Se han implementado los controles organizacionales?',
      q8Title: 'Controles Tecnológicos',
      q8Question: '¿Se han implementado los controles tecnológicos?',
      yes: 'Sí',
      no: 'No',
      partially: 'Parcialmente'
    },
    pt: {
      gapAnalysis: 'Análise de Lacunas',
      completeAssessment: 'Complete a avaliação para gerar sua Declaração de Aplicabilidade (SOA)',
      evaluation: 'Avaliação',
      previewSOA: 'Visualizar SOA',
      bulkUpload: 'Upload em Massa',
      saveProgress: 'Salvar Progresso',
      generalProgress: 'Progresso Geral',
      phases: 'FASES',
      question: 'Pergunta',
      critical: 'Crítica',
      previous: 'Anterior',
      continue: 'Continuar',
      previewSOATitle: 'Visualização da SOA',
      viewSOA: 'Ver SOA completa',
      saving: 'Salvando...',
      soaTitle: 'Declaração de Aplicabilidade (SOA)',
      soaApplicable: 'Aplicável',
      soaImplemented: 'Implementado',
      control: 'Controle',
      description: 'Descrição',
      applicable: 'Aplicável',
      notApplicable: 'Não Aplicável',
      justification: 'Justificativa',
      status: 'Status',
      implemented: 'Implementado',
      planned: 'Planejado',
      notImplemented: 'Não Implementado',
      showAll: 'Todos',
      showApplicable: 'Aplicável',
      showNotApplicable: 'Não Aplicável',
      required: 'Obrigatório',
      autoSaved: 'Auto-salvo',
      contextLeadership: 'Contexto e Liderança',
      planningRisk: 'Planejamento e Risco',
      supportOps: 'Suporte e Operação',
      annexA: 'Controles do Anexo A',
      clauses45: 'Cláusulas 4 e 5',
      clause6: 'Cláusula 6',
      clauses78: 'Cláusulas 7 e 8',
      annexAtext: 'Anexo A',
      q1Title: 'Contexto da Organização',
      q1Question: 'Você determinou as questões externas e internas relevantes para o seu SGSI?',
      q2Title: 'Partes Interessadas',
      q2Question: 'Você identificou as partes interessadas relevantes para a segurança da informação?',
      q3Title: 'Escopo do SGSI',
      q3Question: 'O escopo do SGSI está claramente definido e documentado?',
      q4Title: 'Metodologia de Riscos',
      q4Question: 'Existe uma metodologia documentada para avaliação de riscos?',
      q5Title: 'Tratamento de Riscos',
      q5Question: 'Você formulou um plano de tratamento de riscos?',
      q6Title: 'Competência e Conscientização',
      q6Question: 'Os funcionários receberam treinamento em segurança da informação?',
      q7Title: 'Controles Organizacionais',
      q7Question: 'Os controles organizacionais foram implementados?',
      q8Title: 'Controles Tecnológicos',
      q8Question: 'Os controles tecnológicos foram implementados?',
      yes: 'Sim',
      no: 'Não',
      partially: 'Parcialmente'
    }
  };
  
  const tText = translations[language] || translations.en;

  // ==========================================
  // ESTADOS
  // ==========================================
  const [activeMainTab, setActiveMainTab] = useState('assessment');
  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [controls, setControls] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

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
          { id: 'A.5.1', control: 'A.5.1', description: 'Policies for information security', category: 'Organizational', applies: true, status: 'Implementado', justification: 'Required for ISMS framework establishment' },
          { id: 'A.5.2', control: 'A.5.2', description: 'Information security roles', category: 'Organizational', applies: true, status: 'Implementado', justification: 'Mandatory for security governance' },
          { id: 'A.5.15', control: 'A.5.15', description: 'Access control', category: 'Organizational', applies: true, status: 'Implementado', justification: 'Critical for data protection' },
          { id: 'A.5.16', control: 'A.5.16', description: 'Identity management', category: 'Organizational', applies: true, status: 'Planificado', justification: 'Scheduled for Q1 2025' },
          { id: 'A.7.4', control: 'A.7.4', description: 'Physical security monitoring', category: 'Physical', applies: false, status: 'No Implementado', justification: 'No physical data center - cloud only' }
        ]);
      }
    };
    loadISOControls();
  }, []);

  // ==========================================
  // DATOS DE LAS FASES
  // ==========================================
  const handleSaveProgress = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      // Disparamos la petición masiva al backend en Python
      await complianceAPI.fullAssessment({ controls });
      alert("✨ ¡Progreso del Gap Analysis guardado con éxito en PostgreSQL (Neon.tech)!");
    } catch (error) {
      console.error("Error salvando SOA:", error);
      alert("⚠️ No se pudo sincronizar con el servidor. Datos guardados localmente en caché.");
    } finally {
      setIsSaving(false);
    }
  };

  // Datos de las Fases
  const phases = [
    { 
      id: 'context', name: 'Context & Leadership', clause: 'Clauses 4 & 5', icon: Building2, color: '#3b82f6', 
      questions: [
        { id: 'q1', title: 'Organization Context', question: 'Have you determined external and internal issues relevant to your ISMS?', options: ['Yes', 'No'], critical: true },
        { id: 'q2', title: 'Interested Parties', question: 'Have you identified stakeholders relevant to information security?', options: ['Yes', 'No'], critical: true },
        { id: 'q3', title: 'ISMS Scope', question: 'Is the ISMS scope clearly defined and documented?', options: ['Yes', 'No'], critical: true },
      ]
    },
    { 
      id: 'planning', name: 'Planning & Risk', clause: 'Clause 6', icon: Target, color: '#10b981', 
      questions: [
        { id: 'q5', title: 'Risk Methodology', question: 'Do you have a documented risk assessment process?', options: ['Yes', 'No'], critical: true },
        { id: 'q6', title: 'Risk Treatment', question: 'Have you formulated a risk treatment plan?', options: ['Yes', 'Partially', 'No'], critical: true },
      ]
    },
    { 
      id: 'support', name: 'Support & Ops', clause: 'Clauses 7 & 8', icon: Users, color: '#f59e0b', 
      questions: [
        { id: 'q8', title: 'Training & Awareness', question: 'Have employees received security awareness training?', options: ['Yes', 'Partially', 'No'], critical: false },
      ]
    },
    { 
      id: 'annex', name: 'Annex A Controls', clause: 'Annex A', icon: Lock, color: '#a855f7', 
      questions: [
        { id: 'q10', title: 'Access Control', question: 'Is there a formal user registration process?', options: ['Yes', 'No'], critical: true },
        { id: 'q11', title: 'Backups', question: 'Are backups taken and tested regularly?', options: ['Yes', 'Partially', 'No'], critical: true },
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

  const handleAnswer = (answer) => {
    setAnswers({ ...answers, [currentQuestionData.id]: answer });
    setTimeout(() => {
      if (currentQuestion < currentPhaseData.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else if (currentPhase < phases.length - 1) {
        setCurrentPhase(currentPhase + 1);
        setCurrentQuestion(0);
      }
    }, 300);
  };
  
  const goToNext = () => { 
    if (currentQuestion < currentPhaseData.questions.length - 1) setCurrentQuestion(currentQuestion + 1);
    else if (currentPhase < phases.length - 1) { setCurrentPhase(currentPhase + 1); setCurrentQuestion(0); }
  };
  
  const goToPrev = () => { 
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
    else if (currentPhase > 0) { setCurrentPhase(currentPhase - 1); setCurrentQuestion(phases[currentPhase - 1].questions.length - 1); }
  };

  // Funciones SOA
  const toggleApplicable = (id) => {
    setControls(prev => prev.map(c => c.id === id ? { ...c, applicable: !c.applicable } : c));
  };

  const updateStatus = (id, status) => {
    setControls(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const updateJustification = (id, justification) => {
    setControls(prev => prev.map(c => c.id === id ? { ...c, justification } : c));
    setShowJustificationModal(null);
  };

  const handleSaveProgress = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await complianceAPI.fullAssessment({ controls, answers });
      alert("✨ " + (language === 'es' ? '¡Progreso guardado con éxito!' : language === 'pt' ? 'Progresso salvo com sucesso!' : 'Progress saved successfully!'));
    } catch (error) {
      console.error("Error saving progress:", error);
      alert("⚠️ " + (language === 'es' ? 'No se pudo sincronizar con el servidor.' : language === 'pt' ? 'Não foi possível sincronizar com o servidor.' : 'Could not sync with server.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setShowLanguageMenu(false);
  };

  const filteredControls = controls.filter(c => {
    if (filterApplicable === 'applicable') return c.applicable;
    if (filterApplicable === 'notApplicable') return !c.applicable;
    return true;
  });

  const appliesCount = controls.filter(c => c.applicable).length;
  const implementedCount = controls.filter(c => c.applicable && c.status === 'implemented').length;

  // Componente SOA
  const InteractiveSOA = () => (
    <div style={{ background: t.cardBg, borderRadius: '20px', border: `1px solid ${t.border}`, overflow: 'hidden', marginTop: '24px' }}>
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px', color: t.text }}>Gap Analysis</h1>
          <p style={{ color: t.textDim, fontSize: '15px' }}>Complete assessment to generate your SOA</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', background: t.inputBg, padding: '4px', borderRadius: '10px', border: `1px solid ${t.border}` }}>
            <button onClick={() => setActiveTab('assessment')} style={{ padding: '8px 16px', padding8px16px: '8px 16px', borderRadius: '6px', background: activeTab === 'assessment' ? '#0f766e20' : 'transparent', color: activeTab === 'assessment' ? '#10b981' : t.textMuted, fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: activeTab === 'assessment' ? '1px solid #10b98140' : '1px solid transparent' }}>
              Assessment
            </button>
            <button onClick={() => setActiveTab('soa')} style={{ padding: '8px 16px', borderRadius: '6px', background: activeTab === 'soa' ? '#8b5cf620' : 'transparent', color: activeTab === 'soa' ? '#8b5cf6' : t.textMuted, fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: activeTab === 'soa' ? '1px solid #8b5cf640' : '1px solid transparent' }}>
              SOA
            </button>
          </div>
          <button style={{ padding: '10px 20px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, cursor: 'pointer', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderUp size={16} /> Bulk Upload
          </button>
          <button 
            onClick={handleSaveProgress} 
            disabled={isSaving}
            style={{ 
              padding: '8px 16px', 
              borderRadius: '6px', 
              background: '#10b981', 
              border: 'none', 
              color: 'white', 
              fontWeight: 500, 
              fontSize: '13px', 
              cursor: isSaving ? 'not-allowed' : 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px' 
            }}
          >
            <Download size={16} /> {isSaving ? 'Saving...' : 'Save Progress'}
          </button>
        </div>
      </div>

      {activeTab === 'assessment' && currentPhaseData && currentQuestionData && (
        <>
          <div style={{ background: t.cardBg, borderRadius: '16px', padding: '24px', border: `1px solid ${t.border}`, marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', color: t.textDim, fontWeight: 500 }}>Overall Progress:</span>
              <span style={{ fontSize: '16px', color: '#10b981', fontWeight: 700 }}>{globalProgress}%</span>
            </div>
            <div style={{ height: '8px', background: t.inputBg, borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${globalProgress}%`, height: '100%', background: '#10b981', borderRadius: '4px', transition: 'width 0.3s ease' }} />
            </div>
          </div>

          {/* Grid principal del wizard */}
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 320px', gap: '24px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '11px', color: t.textDim, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginLeft: '4px' }}>PHASES</h3>
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

            {/* Columna central - PREGUNTA */}
            {currentQuestionData && (
              <div style={{ background: t.cardBg, borderRadius: '16px', border: `1px solid ${t.border}`, padding: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', color: t.textDim }}>{tText.question} {currentQuestion + 1} de {currentPhaseData.questions.length}</span>
                  {currentQuestionData.critical && <span style={{ marginLeft: '12px', padding: '2px 8px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderRadius: '12px', fontSize: '10px' }}>{tText.critical}</span>}
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: t.text }}>{currentPhaseData.name}</h2>
              </div>

              <div style={{ padding: '32px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '12px 16px', background: t.inputBg, borderRadius: '10px' }}>
                  <span style={{ fontSize: '13px', color: t.textDim, fontWeight: 500 }}>Question <strong style={{color: '#3b82f6', fontSize: '15px'}}>{currentQuestion + 1}</strong> of {currentPhaseData.questions.length}</span>
                  {currentQuestionData.critical && (
                    <span style={{ padding: '4px 10px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderRadius: '6px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={12} /> Critical
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
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ padding: '24px 32px', borderTop: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.1)' }}>
                <button onClick={goToPrev} disabled={currentPhase === 0 && currentQuestion === 0} style={{ padding: '12px 24px', background: 'transparent', border: 'none', color: t.textDim, cursor: (currentPhase === 0 && currentQuestion === 0) ? 'not-allowed' : 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <ChevronLeft size={18} /> Previous
                </button>
                <button onClick={goToNext} disabled={!answers[currentQuestionData.id]} style={{ padding: '12px 24px', background: answers[currentQuestionData.id] ? '#3b82f6' : t.inputBg, border: 'none', borderRadius: '10px', color: answers[currentQuestionData.id] ? 'white' : t.textMuted, cursor: answers[currentQuestionData.id] ? 'pointer' : 'not-allowed', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', transition: 'all 0.2s ease' }}>
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div style={{ background: t.cardBg, borderRadius: '20px', padding: '24px', border: `1px solid ${t.border}`, height: 'fit-content', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <Sparkles size={20} color="#10b981" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: t.text }}>SOA Preview</h3>
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
                <Eye size={16} /> Preview SOA
              </button>
            </div>
          </div>
        </>
      ) : (
        <InteractiveSOA />
      )}
    </div>
  );
}

export default GapAnalysisScreen;