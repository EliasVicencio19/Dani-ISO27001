/* eslint-disable */
import React, { useState, useContext } from 'react';
import { 
  Building2, Target, Users, Lock, Sparkles, Eye,
  ChevronLeft, ChevronRight, Download, FolderUp, CheckCircle2,
  AlertCircle // 1. SOLUCIONADO: Añadimos AlertCircle a la importación
} from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';
import InteractiveSOA from '../components/InteractiveSOA'; 

function GapAnalysisScreen() {
  const { theme: t } = useContext(ThemeContext);
  // 2. SOLUCIONADO: Eliminamos la variable 'l' que no usábamos para quitar el warning
  
  const [activeTab, setActiveTab] = useState('assessment');
  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

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
  
  // Cálculos de Progreso
  const totalQuestions = phases.reduce((sum, p) => sum + p.questions.length, 0);
  const answeredQuestions = Object.keys(answers).length;
  const globalProgress = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  const getPhaseProgress = (idx) => {
    const phase = phases[idx];
    if (phase.questions.length === 0) return 0;
    const answered = phase.questions.filter(q => answers[q.id]).length;
    return Math.round((answered / phase.questions.length) * 100);
  };

  // Navegación
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
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px', color: t.text }}>Gap Analysis</h1>
          <p style={{ color: t.textDim, fontSize: '15px' }}>Complete assessment to generate your SOA</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', background: t.inputBg, padding: '4px', borderRadius: '10px', border: `1px solid ${t.border}` }}>
            {/* 3. SOLUCIONADO: Eliminado el border duplicado en los botones */}
            <button onClick={() => setActiveTab('assessment')} style={{ padding: '8px 16px', borderRadius: '6px', background: activeTab === 'assessment' ? '#0f766e20' : 'transparent', color: activeTab === 'assessment' ? '#10b981' : t.textMuted, fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: activeTab === 'assessment' ? '1px solid #10b98140' : '1px solid transparent' }}>
              Assessment
            </button>
            <button onClick={() => setActiveTab('soa')} style={{ padding: '8px 16px', borderRadius: '6px', background: activeTab === 'soa' ? '#8b5cf620' : 'transparent', color: activeTab === 'soa' ? '#8b5cf6' : t.textMuted, fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: activeTab === 'soa' ? '1px solid #8b5cf640' : '1px solid transparent' }}>
              SOA
            </button>
          </div>
          <button style={{ padding: '10px 20px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, cursor: 'pointer', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderUp size={16} /> Bulk Upload
          </button>
          <button style={{ padding: '10px 20px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, cursor: 'pointer', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={16} /> Save Progress
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

            <div style={{ background: t.cardBg, borderRadius: '20px', border: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '24px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <currentPhaseData.icon size={20} color="#3b82f6" />
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
      )}

      {activeTab === 'soa' && <InteractiveSOA />}
    </div>
  );
}

export default GapAnalysisScreen;