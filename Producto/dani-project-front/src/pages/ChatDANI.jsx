/* eslint-disable */
import React, { useState, useContext } from 'react';
import { Sparkles, Send, Bot, X, ShieldAlert, CheckSquare, Shield, Terminal, FileText, Lock, Eye, RefreshCw, Users, Database } from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';
import { chatAPI } from '../services/api';

const ChatDANI = ({ isOpen, onClose }) => {
  const { theme: t, darkMode } = useContext(ThemeContext);
  
  // ==========================================
  // 1. ESTADOS LOCALES
  // ==========================================
  const [chatQuery, setChatQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 ¡Hola! Soy DANI, tu asistente de cumplimiento ISO 27001 potenciado con RAG (Generación Aumentada por Recuperación).\n\nPuedes hacerme cualquier consulta abierta. Analizaré automáticamente los documentos y políticas que hayas subido en el Evidence Center para darte una evaluación de brechas (Gap Analysis) en tiempo real.' }
  ]);
  const [isThinking, setIsThinking] = useState(false);

  // ==========================================
  // 3. LÓGICA DE ENVÍO
  // ==========================================
  const handleSendMessage = async () => {
    const textToSend = chatQuery;
    
    if (!textToSend.trim() || isThinking) return;

    const newUserMessage = { role: 'user', content: textToSend };

    
    setMessages(prev => [...prev, newUserMessage]);
    setChatQuery('');
    setIsThinking(true);

    try {
      const data = await chatAPI.sendMessage(textToSend);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.reply || data.response || "Análisis completado de forma exitosa." 
      }]);
    } catch (error) {
      console.error("Error en Chat DANI:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Hubo un error al procesar el prompt en el motor de IA.' 
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  if (!isOpen) return null;

  // ==========================================
  // 4. RENDIMIENTO VISUAL (DISEÑO INTACTO)
  // ==========================================
  return (
    <div style={{ 
      position: 'fixed', bottom: '110px', right: '32px', width: '380px', height: '500px', 
      background: darkMode ? '#1e293b' : '#ffffff', borderRadius: '20px', 
      boxShadow: '0 10px 50px rgba(0,0,0,0.3)', border: `1px solid ${t.border}`, 
      display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1000,
      animation: 'fadeIn 0.3s ease'
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: t.text }}>DANI Asistente RAG</div>
            <div style={{ fontSize: '11px', color: '#10b981' }}>● En línea</div>
          </div>
        </div>
        <button onClose={onClose} onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: t.textDim }}>
          <X size={20} />
        </button>
      </div>
      
      {/* Mensajes */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ 
              background: msg.role === 'user' ? '#10b981' : t.inputBg, 
              color: msg.role === 'user' ? 'white' : t.text, 
              padding: '12px 16px', borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px', 
              maxWidth: '85%', fontSize: '13px', lineHeight: '1.5', whiteSpace: 'pre-line'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {isThinking && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: t.inputBg, padding: '12px 16px', borderRadius: '12px 12px 12px 4px', fontSize: '13px', color: t.textDim }}>
              DANI está recuperando evidencias y analizando...
            </div>
          </div>
        )}
      </div>

      <style>{`
        .dani-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .dani-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .dani-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.4);
          border-radius: 10px;
        }
        .dani-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.8);
        }
      `}</style>

      {/* Input */}
      <div style={{ padding: '16px', borderTop: `1px solid ${t.border}` }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            value={chatQuery} 
            onChange={(e) => setChatQuery(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Pregunta sobre tus evidencias e ISO 27001..." 
            style={{ 
              flex: 1, padding: '12px 16px', background: t.inputBg, border: `1px solid ${t.border}`, 
              borderRadius: '12px', color: t.text, fontSize: '13px', outline: 'none' 
            }} 
          />
          <button 
            onClick={() => handleSendMessage()} 
            disabled={isThinking || !chatQuery.trim()} 
            style={{ 
              width: '44px', height: '44px', borderRadius: '12px', 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
              border: 'none', cursor: 'pointer', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', opacity: (isThinking || !chatQuery.trim()) ? 0.6 : 1 
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