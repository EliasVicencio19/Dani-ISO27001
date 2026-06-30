/* eslint-disable */
import React, { useState, useContext, useEffect, useRef } from 'react';
import { Sparkles, Send, X, ChevronRight } from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';
import { chatAPI } from '../services/api';

// ── Static data ─────────────────────────────────────────────────────────────

const screenLabels = {
  es: {
    dashboard: 'Panel', 'gap-analysis': 'Análisis de Brechas', 'doc-generator': 'Generador de Docs',
    'risk-map': 'Mapa de Riesgos', evidence: 'Evidence Center', documents: 'Documentos',
    'audit-room': 'Sala de Auditoría', 'user-management': 'Gestión de Usuarios', 'employee-portal': 'Portal de Empleados'
  },
  en: {
    dashboard: 'Dashboard', 'gap-analysis': 'Gap Analysis', 'doc-generator': 'Doc Generator',
    'risk-map': 'Risk Map', evidence: 'Evidence Center', documents: 'Documents',
    'audit-room': 'Audit Room', 'user-management': 'User Management', 'employee-portal': 'Employee Portal'
  },
  pt: {
    dashboard: 'Painel', 'gap-analysis': 'Análise de Lacunas', 'doc-generator': 'Gerador de Docs',
    'risk-map': 'Mapa de Riscos', evidence: 'Centro de Evidências', documents: 'Documentos',
    'audit-room': 'Sala de Auditoria', 'user-management': 'Gestão de Usuários', 'employee-portal': 'Portal de Funcionários'
  }
};

const chatLabels = {
  es: {
    title: 'DANI Asistente RAG',
    online: 'En línea',
    thinkingSteps: ['🔍 Analizando tu solicitud...', '📚 Leyendo la documentación...', '🧠 Preparando respuesta...'],
    placeholder: 'Pregunta sobre tus evidencias e ISO 27001...',
    placeholderThinking: 'Esperando respuesta de DANI...',
    initialMessage: '👋 ¡Hola! Soy DANI, tu asistente de cumplimiento ISO 27001.\n¿En qué puedo ayudarte hoy?\n\n🔍 Analizar documentos y políticas en tiempo real.\n📊 Generar una evaluación de brechas (Gap Analysis).\n📋 Consultar requisitos de la norma ISO 27001:2022.',
    errorNetwork: 'Hubo un error al procesar el prompt en el motor de IA.',
    workspace: 'Espacio de Trabajo',
    quickReplies: ['¿Cómo subo mis evidencias?', 'Explícame la norma ISO 27001', '¿Qué es un Gap Analysis?']
  },
  en: {
    title: 'DANI RAG Assistant',
    online: 'Online',
    thinkingSteps: ['🔍 Analyzing your request...', '📚 Reading the documentation...', '🧠 Preparing response...'],
    placeholder: 'Ask about your evidence and ISO 27001...',
    placeholderThinking: 'Waiting for DANI response...',
    initialMessage: '👋 Hello! I am DANI, your ISO 27001 compliance assistant.\nHow can I help you today?\n\n🔍 Analyze documents and policies in real time.\n📊 Generate a Gap Analysis assessment.\n📋 Consult ISO 27001:2022 standard requirements.',
    errorNetwork: 'There was an error processing the prompt in the AI engine.',
    workspace: 'Workspace',
    quickReplies: ['How do I upload my evidence?', 'Explain the ISO 27001 standard', 'What is a Gap Analysis?']
  },
  pt: {
    title: 'DANI Assistente RAG',
    online: 'Online',
    thinkingSteps: ['🔍 Analisando sua solicitação...', '📚 Lendo a documentação...', '🧠 Preparando resposta...'],
    placeholder: 'Pergunte sobre suas evidências e ISO 27001...',
    placeholderThinking: 'Aguardando resposta do DANI...',
    initialMessage: '👋 Olá! Sou DANI, seu assistente de conformidade ISO 27001.\nComo posso te ajudar hoje?\n\n🔍 Analisar documentos e políticas em tempo real.\n📊 Gerar uma avaliação de lacunas (Gap Analysis).\n📋 Consultar requisitos da norma ISO 27001:2022.',
    errorNetwork: 'Ocorreu um erro ao processar o prompt no mecanismo de IA.',
    workspace: 'Espaço de Trabalho',
    quickReplies: ['Como envio minhas evidências?', 'Explique a norma ISO 27001', 'O que é uma Análise de Lacunas?']
  }
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const stripMarkdown = (text) =>
  text
    .replace(/\*\*(.*?)\*\*/gs, '$1')
    .replace(/\*(.*?)\*/gs, '$1')
    .replace(/_{2}(.*?)_{2}/gs, '$1')
    .replace(/_(.*?)_/gs, '$1')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/`{3}[\s\S]*?`{3}/g, (m) => m.replace(/`{3}[^\n]*/g, '').trim())
    .replace(/`([^`]+)`/g, '$1');

const TICK_MS = 20;
const TARGET_DURATION_MS = 4000; // typewriter completes in ≤4 s regardless of length

// ── Component ────────────────────────────────────────────────────────────────

const ChatDANI = ({ isOpen, onClose, activeScreen = 'dashboard' }) => {
  const { theme: t, darkMode, language } = useContext(ThemeContext);

  const l       = chatLabels[language]  || chatLabels.es;
  const screens = screenLabels[language] || screenLabels.es;
  const currentScreenLabel = screens[activeScreen] || screens.dashboard;

  // ── State ──
  const [chatQuery,    setChatQuery]    = useState('');
  const [messages,     setMessages]     = useState([{ role: 'assistant', content: 'INITIAL_MSG' }]);
  const [isThinking,   setIsThinking]   = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);

  // Typewriter: the full cleaned text of the AI message being animated
  const [typingText,   setTypingText]   = useState('');
  const [typingChars,  setTypingChars]  = useState(0);
  const isTypingActive = typingText.length > 0 && typingChars < typingText.length;

  const messagesEndRef = useRef(null);

  // Reset conversation when language changes so all UI text stays consistent
  useEffect(() => {
    setMessages([{ role: 'assistant', content: 'INITIAL_MSG' }]);
    setChatQuery('');
    setTypingText('');
    setTypingChars(0);
    setIsThinking(false);
  }, [language]);

  // ── Thinking steps cycling ──
  useEffect(() => {
    if (!isThinking) { setThinkingStep(0); return; }
    const timer = setInterval(
      () => setThinkingStep(prev => (prev + 1) % l.thinkingSteps.length),
      1500
    );
    return () => clearInterval(timer);
  }, [isThinking, l.thinkingSteps.length]);

  // ── Typewriter tick ──
  useEffect(() => {
    if (!isTypingActive) return;
    const charsPerTick = Math.max(2, Math.ceil(typingText.length / (TARGET_DURATION_MS / TICK_MS)));
    const timer = setTimeout(
      () => setTypingChars(prev => Math.min(prev + charsPerTick, typingText.length)),
      TICK_MS
    );
    return () => clearTimeout(timer);
  }, [isTypingActive, typingChars, typingText]);

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: isTypingActive ? 'auto' : 'smooth' });
  }, [messages.length, typingChars]);

  // ── Skip typewriter on click ──
  const skipTyping = () => { if (isTypingActive) setTypingChars(typingText.length); };

  // ── Render content for a bubble ──
  const getBubbleContent = (msg, index) => {
    if (msg.content === 'INITIAL_MSG') return l.initialMessage;
    const cleaned = msg.role === 'assistant' ? stripMarkdown(msg.content) : msg.content;
    // Animate only the last assistant message
    if (msg.role === 'assistant' && index === messages.length - 1 && isTypingActive) {
      return typingText.slice(0, typingChars);
    }
    return cleaned;
  };

  // ── Send message ──
  const handleSendMessage = async (overrideText) => {
    const textToSend = (overrideText || chatQuery).trim();
    if (!textToSend || isThinking) return;

    // Build history from all settled messages (skip welcome sentinel)
    const history = messages
      .filter(m => m.content !== 'INITIAL_MSG')
      .map(m => ({
        role: m.role,
        content: m.role === 'assistant' ? stripMarkdown(m.content) : m.content,
      }));

    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setChatQuery('');
    setTypingText('');
    setTypingChars(0);
    setIsThinking(true);

    try {
      const data = await chatAPI.sendMessage(textToSend, language, null, null, history);
      const rawReply = data.error
        ? `⚠️ ${data.error}`
        : (data.reply || data.response || 'Análisis completado de forma exitosa.');

      const cleaned = stripMarkdown(rawReply);
      setMessages(prev => [...prev, { role: 'assistant', content: rawReply }]);
      setTypingText(cleaned);
      setTypingChars(0);
    } catch (error) {
      console.error('Error en Chat DANI:', error);
      const errClean = stripMarkdown(l.errorNetwork);
      setMessages(prev => [...prev, { role: 'assistant', content: l.errorNetwork }]);
      setTypingText(errClean);
      setTypingChars(0);
    } finally {
      setIsThinking(false);
    }
  };

  if (!isOpen) return null;

  const showQuickReplies =
    messages.length === 1 && messages[0].content === 'INITIAL_MSG' && !isThinking && !isTypingActive;

  return (
    <div style={{
      position: 'fixed', bottom: '110px', right: '32px', width: '380px', height: '530px',
      background: darkMode ? '#1e293b' : '#ffffff', borderRadius: '20px',
      boxShadow: '0 10px 50px rgba(0,0,0,0.3)', border: `1px solid ${t.border}`,
      display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1000,
      animation: 'fadeIn 0.3s ease'
    }}>

      {/* ── Header ── */}
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${t.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Sparkles size={18} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: t.text }}>{l.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '1px' }}>
                <span className="dani-online-dot" />
                <span style={{ fontSize: '11px', color: '#10b981' }}>{l.online}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: t.textDim, padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', paddingLeft: '48px' }}>
          <span style={{ fontSize: '10px', color: t.textDim }}>{l.workspace}</span>
          <ChevronRight size={10} color={t.textDim} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 500 }}>{currentScreenLabel}</span>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="dani-scrollbar" style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div
              onClick={msg.role === 'assistant' && index === messages.length - 1 ? skipTyping : undefined}
              style={{
                background: msg.role === 'user' ? '#10b981' : t.inputBg,
                color: msg.role === 'user' ? 'white' : t.text,
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                maxWidth: '85%', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-line',
                cursor: (msg.role === 'assistant' && index === messages.length - 1 && isTypingActive) ? 'pointer' : 'default'
              }}
            >
              {getBubbleContent(msg, index)}
              {/* Blinking cursor while typing this bubble */}
              {msg.role === 'assistant' && index === messages.length - 1 && isTypingActive && (
                <span className="dani-cursor" />
              )}
            </div>
          </div>
        ))}

        {/* Thinking bubble with animated steps */}
        {isThinking && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              background: t.inputBg, padding: '12px 16px',
              borderRadius: '12px 12px 12px 4px',
              display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '220px'
            }}>
              <span key={thinkingStep} className="dani-thinking-step" style={{ fontSize: '13px', color: t.textMuted }}>
                {l.thinkingSteps[thinkingStep]}
              </span>
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                <span className="dani-dot" />
                <span className="dani-dot" />
                <span className="dani-dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick Replies ── */}
      {showQuickReplies && (
        <div style={{ padding: '0 16px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {l.quickReplies.map((reply, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(reply)}
              className="dani-quick-reply"
              style={{
                textAlign: 'left', padding: '8px 14px', background: 'transparent',
                border: `1px solid ${t.border}`, borderRadius: '10px',
                color: t.textMuted, cursor: 'pointer', fontSize: '12px',
                transition: 'border-color 0.15s, color 0.15s'
              }}
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* ── CSS ── */}
      <style>{`
        @keyframes dani-ping {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.55); }
          60%       { box-shadow: 0 0 0 5px rgba(16,185,129,0); }
        }
        @keyframes dani-blink {
          0%, 100% { opacity: 1; } 50% { opacity: 0; }
        }
        @keyframes dani-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
          40%           { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes dani-step-in {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dani-online-dot {
          display: inline-block; width: 7px; height: 7px;
          border-radius: 50%; background: #10b981;
          animation: dani-ping 2s ease-in-out infinite;
        }
        .dani-cursor {
          display: inline-block; width: 2px; height: 14px;
          background: #10b981; margin-left: 2px; vertical-align: text-bottom;
          animation: dani-blink 0.75s ease-in-out infinite;
        }
        .dani-dot {
          display: inline-block; width: 6px; height: 6px;
          border-radius: 50%; background: #10b981;
          animation: dani-bounce 1.2s ease-in-out infinite;
        }
        .dani-dot:nth-child(1) { animation-delay: 0s; }
        .dani-dot:nth-child(2) { animation-delay: 0.18s; }
        .dani-dot:nth-child(3) { animation-delay: 0.36s; }
        .dani-thinking-step { animation: dani-step-in 0.25s ease; display: block; }
        .dani-scrollbar::-webkit-scrollbar { width: 5px; }
        .dani-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .dani-scrollbar::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.4); border-radius: 10px; }
        .dani-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16,185,129,0.8); }
        .dani-input::placeholder { color: rgba(148,163,184,0.85) !important; opacity: 1 !important; }
        .dani-quick-reply:hover { border-color: #10b981 !important; color: #10b981 !important; }
      `}</style>

      {/* ── Input ── */}
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${t.border}` }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            className="dani-input"
            value={chatQuery}
            onChange={(e) => setChatQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isThinking ? l.placeholderThinking : l.placeholder}
            disabled={isThinking}
            style={{
              flex: 1, padding: '12px 16px',
              background: isThinking ? t.background : t.inputBg,
              border: `1px solid ${t.border}`, borderRadius: '12px',
              color: t.text, fontSize: '13px', outline: 'none',
              opacity: isThinking ? 0.7 : 1
            }}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isThinking || !chatQuery.trim()}
            style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none', cursor: isThinking || !chatQuery.trim() ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: (isThinking || !chatQuery.trim()) ? 0.55 : 1
            }}
          >
            <Send size={18} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatDANI;
