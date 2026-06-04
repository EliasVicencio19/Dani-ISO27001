// src/pages/GapAnalysisScreen.jsx
import React, { useState, useContext, useEffect } from 'react';
import {
  Building2, Target, Users, Lock, Sparkles, Eye,
  ChevronLeft, ChevronRight, Download, FolderUp, CheckCircle2,
  AlertCircle, Activity, Shield, Edit3, FileCheck, Globe
} from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';
import { complianceAPI, documentsAPI } from '../services/api';

function GapAnalysisScreen() {
  const { theme: t, language, setLanguage } = useContext(ThemeContext);

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
  const [controls, setControls] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [filterApplicable, setFilterApplicable] = useState('all');
  const [showJustificationModal, setShowJustificationModal] = useState(null);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [availableDocs, setAvailableDocs] = useState([]);
  const [showAIAuditModal, setShowAIAuditModal] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // ==========================================
  // DATOS DE LAS FASES
  // ==========================================
  const phases = [
    {
      id: 'context', name: tText.contextLeadership, clause: tText.clauses45, icon: Building2, color: '#3b82f6',
      questions: [
        { id: 'q1', title: tText.q1Title, question: tText.q1Question, options: [tText.yes, tText.no], critical: true },
        { id: 'q2', title: tText.q2Title, question: tText.q2Question, options: [tText.yes, tText.no], critical: true },
        { id: 'q3', title: tText.q3Title, question: tText.q3Question, options: [tText.yes, tText.no], critical: true }
      ]
    },
    {
      id: 'planning', name: tText.planningRisk, clause: tText.clause6, icon: Target, color: '#10b981',
      questions: [
        { id: 'q4', title: tText.q4Title, question: tText.q4Question, options: [tText.yes, tText.no], critical: true },
        { id: 'q5', title: tText.q5Title, question: tText.q5Question, options: [tText.yes, tText.partially, tText.no], critical: true }
      ]
    },
    {
      id: 'support', name: tText.supportOps, clause: tText.clauses78, icon: Users, color: '#f59e0b',
      questions: [
        { id: 'q6', title: tText.q6Title, question: tText.q6Question, options: [tText.yes, tText.partially, tText.no], critical: false }
      ]
    },
    {
      id: 'annex', name: tText.annexA, clause: tText.annexAtext, icon: Lock, color: '#a855f7',
      questions: [
        { id: 'q7', title: tText.q7Title, question: tText.q7Question, options: [tText.yes, tText.partially, tText.no], critical: true },
        { id: 'q8', title: tText.q8Title, question: tText.q8Question, options: [tText.yes, tText.partially, tText.no], critical: true }
      ]
    }
  ];

  // Actualizar traducciones cuando cambia el idioma
  useEffect(() => {
    phases[0].name = tText.contextLeadership;
    phases[0].clause = tText.clauses45;
    phases[0].questions[0].title = tText.q1Title;
    phases[0].questions[0].question = tText.q1Question;
    phases[0].questions[0].options = [tText.yes, tText.no];
    phases[0].questions[1].title = tText.q2Title;
    phases[0].questions[1].question = tText.q2Question;
    phases[0].questions[2].title = tText.q3Title;
    phases[0].questions[2].question = tText.q3Question;

    phases[1].name = tText.planningRisk;
    phases[1].clause = tText.clause6;
    phases[1].questions[0].title = tText.q4Title;
    phases[1].questions[0].question = tText.q4Question;
    phases[1].questions[1].title = tText.q5Title;
    phases[1].questions[1].question = tText.q5Question;
    phases[1].questions[1].options = [tText.yes, tText.partially, tText.no];

    phases[2].name = tText.supportOps;
    phases[2].clause = tText.clauses78;
    phases[2].questions[0].title = tText.q6Title;
    phases[2].questions[0].question = tText.q6Question;
    phases[2].questions[0].options = [tText.yes, tText.partially, tText.no];

    phases[3].name = tText.annexA;
    phases[3].clause = tText.annexAtext;
    phases[3].questions[0].title = tText.q7Title;
    phases[3].questions[0].question = tText.q7Question;
    phases[3].questions[1].title = tText.q8Title;
    phases[3].questions[1].question = tText.q8Question;
  }, [language]);

  // Cargar controles ISO
  useEffect(() => {
    const loadISOControls = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token usado:', token);
        const data = await complianceAPI.getControls(token);
        console.log('Datos recibidos:', data);

        if (data.controls) {
          const formattedControls = data.controls.map(c => ({
            id: c.id,
            name: c.name,
            category: c.category || 'Organizational',
            applicable: c.applicable !== undefined ? c.applicable : true,
            status: c.status === 'implemented' ? 'implemented' : (c.status === 'planned' ? 'planned' : 'notImplemented'),
            justification: c.justification || ''
          }));
          setControls(formattedControls);
          console.log('✅ Controles cargados desde BD:', formattedControls.length);
        }
      } catch (error) {
        console.error("Error loading ISO controls:", error);
      }
    };
    loadISOControls();
  }, []);

  // Cargar documentos publicados
  useEffect(() => {
    const loadDocs = async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await documentsAPI.getPublishedPolicies(token);
        if (data.policies) setAvailableDocs(data.policies);
      } catch (error) {
        console.error("Error loading policies:", error);
      }
    };
    loadDocs();
  }, []);

  const handleAIAudit = async (documentId) => {
    if (!showAIAuditModal) return;
    setIsAuditing(true);
    try {
      const response = await complianceAPI.evaluateControl(showAIAuditModal.id, documentId);
      setControls(prev => prev.map(c => c.id === showAIAuditModal.id ? { 
        ...c, 
        status: response.status === 'implemented' ? 'implemented' : (response.status === 'planned' ? 'planned' : 'notImplemented'),
        justification: response.justification 
      } : c));
      alert("✨ " + (language === 'es' ? 'Evaluación completada por DANI' : 'DANI AI Evaluation Complete'));
      setShowAIAuditModal(null);
    } catch (error) {
      console.error("Error en evaluación IA:", error);
      alert("❌ " + (language === 'es' ? 'Error al evaluar con IA' : 'Error evaluating with AI'));
    } finally {
      setIsAuditing(false);
    }
  };

  // Funciones del wizard
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

  // ==========================================
  // COMPONENTE INTERACTIVE SOA
  // ==========================================
  const InteractiveSOA = () => (
    <div style={{ background: t.cardBg, borderRadius: '20px', border: `1px solid ${t.border}`, overflow: 'hidden', marginTop: '24px' }}>
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: t.text }}>{tText.soaTitle}</h3>
          <p style={{ fontSize: '12px', color: t.textDim }}>{appliesCount} {tText.soaApplicable} • {implementedCount} {tText.soaImplemented}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: tText.showAll },
            { id: 'applicable', label: tText.showApplicable },
            { id: 'notApplicable', label: tText.showNotApplicable }
          ].map((filter) => (
            <button key={filter.id} onClick={() => setFilterApplicable(filter.id)} style={{ padding: '6px 14px', background: filterApplicable === filter.id ? '#10b98120' : 'transparent', border: `1px solid ${filterApplicable === filter.id ? '#10b981' : t.border}`, borderRadius: '20px', color: filterApplicable === filter.id ? '#10b981' : t.textMuted, fontSize: '12px', cursor: 'pointer' }}>
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: t.inputBg }}>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: t.textDim, width: '100px' }}>{tText.control}</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: t.textDim }}>{tText.description}</th>
              <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: t.textDim, width: '120px' }}>{tText.applicable}?</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: t.textDim, width: '140px' }}>{tText.status}</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: t.textDim }}>{tText.justification}</th>
              /</tr>
          </thead>
          <tbody>
            {filteredControls.map((control) => (
              <tr key={control.id} style={{ borderBottom: `1px solid ${t.border}` }}>
                <td style={{ padding: '16px 20px' }}><span style={{ fontSize: '13px', fontWeight: 600, color: '#8b5cf6' }}>{control.id}</span></td>
                <td style={{ padding: '16px 20px' }}><div style={{ fontSize: '13px', color: t.text }}>{control.name}</div><span style={{ fontSize: '11px', color: t.textDim }}>{control.category}</span></td>
                <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                    <button onClick={() => toggleApplicable(control.id)} style={{ padding: '6px 12px', background: control.applicable ? '#10b98120' : 'transparent', border: `1px solid ${control.applicable ? '#10b981' : t.border}`, borderRadius: '6px 0 0 6px', color: control.applicable ? '#10b981' : t.textDim, fontSize: '11px', cursor: 'pointer' }}>{tText.applicable}</button>
                    <button onClick={() => toggleApplicable(control.id)} style={{ padding: '6px 12px', background: !control.applicable ? '#ef444420' : 'transparent', border: `1px solid ${!control.applicable ? '#ef4444' : t.border}`, borderRadius: '0 6px 6px 0', color: !control.applicable ? '#ef4444' : t.textDim, fontSize: '11px', cursor: 'pointer' }}>{tText.notApplicable}</button>
                  </div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  {control.applicable && (
                    <select value={control.status} onChange={(e) => updateStatus(control.id, e.target.value)} style={{ padding: '6px 10px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '6px', color: t.text, fontSize: '12px', cursor: 'pointer' }}>
                      <option value="implemented">{tText.implemented}</option>
                      <option value="planned">{tText.planned}</option>
                      <option value="notImplemented">{tText.notImplemented}</option>
                    </select>
                  )}
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: control.justification ? t.textMuted : '#ef4444', fontStyle: control.justification ? 'normal' : 'italic' }}>{control.justification || tText.required}</span>
                    <button onClick={() => setShowJustificationModal(control)} title="Editar manualmente" style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: t.textDim }}><Edit3 size={14} /></button>
                    <button onClick={() => setShowAIAuditModal(control)} title="Auditar con IA" style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#8b5cf6' }}><Sparkles size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#10b981' }}>
        <CheckCircle2 size={14} /><span>{tText.autoSaved}</span>
      </div>

      {showJustificationModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: t.cardBg, borderRadius: '16px', padding: '24px', width: '500px', maxWidth: '90%' }}>
            <h3 style={{ marginBottom: '16px' }}>{tText.justification}</h3>
            <textarea defaultValue={showJustificationModal.justification} rows={4} style={{ width: '100%', padding: '12px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '8px', color: t.text, fontSize: '14px', marginBottom: '16px' }} id="justification-textarea" />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowJustificationModal(null)} style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => { const textarea = document.getElementById('justification-textarea'); updateJustification(showJustificationModal.id, textarea.value); }} style={{ padding: '8px 16px', background: '#10b981', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE IA */}
      {showAIAuditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: t.cardBg, borderRadius: '16px', padding: '24px', width: '500px', maxWidth: '90%' }}>
            <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: t.text }}><Sparkles size={20} color="#8b5cf6" /> Auditar con Inteligencia Artificial</h3>
            <p style={{ fontSize: '13px', color: t.textDim, marginBottom: '20px' }}>Selecciona el documento de evidencia que DANI debe evaluar contra el control <strong>{showAIAuditModal.id}</strong>.</p>
            
            <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
              {availableDocs.length === 0 ? (
                <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', fontSize: '13px' }}>
                  No hay documentos publicados disponibles para auditar. Ve al Generador de Documentos y aprueba uno primero.
                </div>
              ) : (
                availableDocs.map(doc => (
                  <button 
                    key={doc.id}
                    onClick={() => handleAIAudit(doc.id)}
                    disabled={isAuditing}
                    style={{ padding: '12px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '8px', textAlign: 'left', cursor: isAuditing ? 'wait' : 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: t.text }}>Capítulo {doc.chapter_id}</div>
                      <div style={{ fontSize: '12px', color: t.textDim }}>{doc.title}</div>
                    </div>
                    {isAuditing && <div style={{ fontSize: '12px', color: '#8b5cf6' }}>Evaluando...</div>}
                  </button>
                ))
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAIAuditModal(null)} disabled={isAuditing} style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '8px', cursor: 'pointer', color: t.text }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ==========================================
  // RENDER PRINCIPAL
  // ==========================================
  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh' }}>

      {/* Header con título y botones alineados a la derecha */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '16px' }}>

        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
            {tText.gapAnalysis}
          </h1>
          <p style={{ color: t.textDim, fontSize: '14px', marginTop: '4px' }}>{tText.completeAssessment}</p>
        </div>

        {/* Botones a la derecha */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveMainTab('assessment')} style={{ padding: '8px 20px', borderRadius: '6px', background: activeMainTab === 'assessment' ? '#3b82f6' : 'transparent', border: activeMainTab === 'assessment' ? 'none' : `1px solid ${t.border}`, color: activeMainTab === 'assessment' ? 'white' : t.text, fontWeight: 500, fontSize: '13px', cursor: 'pointer' }}>
            {tText.evaluation}
          </button>
          <button onClick={() => setActiveMainTab('soa')} style={{ padding: '8px 20px', borderRadius: '6px', background: activeMainTab === 'soa' ? '#3b82f6' : 'transparent', border: activeMainTab === 'soa' ? 'none' : `1px solid ${t.border}`, color: activeMainTab === 'soa' ? 'white' : t.text, fontWeight: 500, fontSize: '13px', cursor: 'pointer' }}>
            {tText.previewSOA}
          </button>
          <button style={{ padding: '8px 16px', borderRadius: '6px', background: 'transparent', border: `1px solid ${t.border}`, color: t.text, fontWeight: 500, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FolderUp size={14} /> {tText.bulkUpload}
          </button>
          <button onClick={handleSaveProgress} disabled={isSaving} style={{ padding: '8px 16px', borderRadius: '6px', background: '#10b981', border: 'none', color: 'white', fontWeight: 500, fontSize: '13px', cursor: isSaving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={14} /> {isSaving ? tText.saving : tText.saveProgress}
          </button>

        </div>
      </div>

      {/* Contenido según pestaña */}
      {activeMainTab === 'assessment' ? (
        <>
          {/* Barra de progreso general */}
          <div style={{ background: t.cardBg, borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', border: `1px solid ${t.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: t.textDim }}>{tText.generalProgress}</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#10b981' }}>{globalProgress}%</span>
            </div>
            <div style={{ height: '8px', background: t.inputBg, borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${globalProgress}%`, height: '100%', background: '#10b981', borderRadius: '4px', transition: 'width 0.3s ease' }} />
            </div>
          </div>

          {/* Grid principal del wizard */}
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 320px', gap: '24px' }}>

            {/* Columna izquierda - FASES */}
            <div>
              <h3 style={{ fontSize: '11px', color: t.textDim, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', paddingLeft: '8px' }}>{tText.phases}</h3>
              {phases.map((phase, idx) => {
                const Icon = phase.icon;
                const isActive = currentPhase === idx;
                const phaseProgress = getPhaseProgress(idx);
                return (
                  <button key={phase.id} onClick={() => { setCurrentPhase(idx); setCurrentQuestion(0); }} style={{ width: '100%', padding: '16px', marginBottom: '8px', background: isActive ? 'rgba(16, 185, 129, 0.1)' : t.cardBg, border: isActive ? `1px solid rgba(16, 185, 129, 0.3)` : `1px solid ${t.border}`, borderRadius: '12px', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: isActive ? '#10b981' : t.inputBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={16} color={isActive ? 'white' : t.textDim} /></div>
                      <div><div style={{ fontSize: '14px', fontWeight: 600, color: isActive ? '#10b981' : t.text }}>{phase.name}</div><div style={{ fontSize: '11px', color: t.textDim }}>{phase.clause}</div></div>
                    </div>
                    <div style={{ fontSize: '11px', color: t.textDim, marginTop: '4px' }}>{phase.questions.filter(q => answers[q.id]).length}/{phase.questions.length} {tText.question.toLowerCase()}</div>
                    {phaseProgress > 0 && <div style={{ marginTop: '8px', height: '4px', background: t.inputBg, borderRadius: '2px', overflow: 'hidden' }}><div style={{ width: `${phaseProgress}%`, height: '100%', background: '#10b981', borderRadius: '2px' }} /></div>}
                  </button>
                );
              })}
            </div>

            {/* Columna central - PREGUNTA */}
            {currentQuestionData && (
              <div style={{ background: t.cardBg, borderRadius: '16px', border: `1px solid ${t.border}`, padding: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', color: t.textDim }}>{tText.question} {currentQuestion + 1} de {currentPhaseData.questions.length}</span>
                  {currentQuestionData.critical && <span style={{ marginLeft: '12px', padding: '2px 8px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderRadius: '12px', fontSize: '10px' }}>{tText.critical}</span>}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: t.text }}>{currentQuestionData.title}</h3>
                <p style={{ fontSize: '16px', marginBottom: '32px', lineHeight: '1.5', color: t.text }}>{currentQuestionData.question}</p>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                  {currentQuestionData.options.map(option => (
                    <button key={option} onClick={() => handleAnswer(option)} style={{ flex: 1, padding: '14px', borderRadius: '8px', border: answers[currentQuestionData.id] === option ? '2px solid #10b981' : `1px solid ${t.border}`, background: answers[currentQuestionData.id] === option ? 'rgba(16, 185, 129, 0.1)' : t.cardBg, color: answers[currentQuestionData.id] === option ? '#10b981' : t.text, cursor: 'pointer', fontWeight: 500 }}>
                      {option}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                  <button onClick={goToPrev} disabled={currentPhase === 0 && currentQuestion === 0} style={{ padding: '10px 20px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '8px', cursor: (currentPhase === 0 && currentQuestion === 0) ? 'not-allowed' : 'pointer', opacity: (currentPhase === 0 && currentQuestion === 0) ? 0.5 : 1 }}>{tText.previous}</button>
                  <button onClick={goToNext} style={{ padding: '10px 20px', background: '#10b981', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>{tText.continue}</button>
                </div>
              </div>
            )}

            {/* Columna derecha - Vista previa SOA */}
            <div style={{ background: t.cardBg, borderRadius: '16px', padding: '20px', border: `1px solid ${t.border}`, height: 'fit-content' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}><Sparkles size={18} color="#10b981" /><h3 style={{ fontSize: '15px', fontWeight: 600 }}>{tText.previewSOATitle}</h3></div>
              {phases.map((phase, idx) => {
                const progress = getPhaseProgress(idx);
                return (
                  <div key={phase.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: t.textDim }}>{phase.clause}</span>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: progress === 100 ? '#10b981' : t.textMuted }}>{progress}%</span>
                  </div>
                );
              })}
              <button onClick={() => setActiveMainTab('soa')} style={{ width: '100%', marginTop: '20px', padding: '10px', background: 'rgba(16, 185, 129, 0.1)', border: `1px solid rgba(16, 185, 129, 0.3)`, borderRadius: '8px', color: '#10b981', cursor: 'pointer' }}>{tText.viewSOA}</button>
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