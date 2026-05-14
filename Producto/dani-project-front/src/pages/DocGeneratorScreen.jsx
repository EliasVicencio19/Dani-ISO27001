/* eslint-disable */
import React, { useState, useContext } from 'react';
import { 
  Download, Building2, Users, Target, HelpCircle, Zap, Search, RefreshCw,
  Wand2, GitBranch, Edit2, Eye, UserCheck, CheckCircle, Send, 
  ArrowLeftRight, Edit3, Tag, History, Sparkles, FileText
} from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';
import { documentsAPI } from '../services/api';

const DocGeneratorScreen = () => {
  const { theme: t, darkMode } = useContext(ThemeContext);

  // ==========================================
  // 1. ESTADOS
  // ==========================================
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [generatedContent, setGeneratedContent] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [documentContent, setDocumentContent] = useState({});

  // Capítulos con sus ICONOS y COLORES ÚNICOS
  const chapters = [
    { id: 4, number: '4', title: 'Contexto de la Organización', sections: '4 sections', icon: Building2, color: '#3b82f6' }, // Azul
    { id: 5, number: '5', title: 'Liderazgo', sections: '3 sections', icon: Users, color: '#f59e0b' }, // Naranja
    { id: 6, number: '6', title: 'Planificación', sections: '2 sections', icon: Target, color: '#10b981' }, // Verde
    { id: 7, number: '7', title: 'Apoyo', sections: '5 sections', icon: HelpCircle, color: '#8b5cf6' }, // Morado
    { id: 8, number: '8', title: 'Operación', sections: '3 sections', icon: Zap, color: '#ec4899' }, // Rosa
    { id: 9, number: '9', title: 'Evaluación del Desempeño', sections: '3 sections', icon: Search, color: '#0ea5e9' }, // Cian
    { id: 10, number: '10', title: 'Mejora', sections: '2 sections', icon: RefreshCw, color: '#ef4444' } // Rojo
  ];

  const totalGenerated = Object.keys(generatedContent).length;
  const progressPercent = Math.round((totalGenerated / chapters.length) * 100);

  // ==========================================
  // 2. LÓGICA DE GENERACIÓN
  // ==========================================
  const handleGenerate = async () => {
    if (!selectedChapter) return;
    setIsGenerating(true);
    
    try {
      const response = await documentsAPI.generateChapter(selectedChapter.id, selectedChapter.title);
      const text = response.content || response.text || response.generated_text;
      
      setGeneratedContent(prev => ({ ...prev, [selectedChapter.id]: text }));
      setDocumentContent(prev => ({ ...prev, [selectedChapter.id]: text }));
    } catch (error) {
      console.error("Error API:", error);
      const fallbackText = `# ${selectedChapter.number}. ${selectedChapter.title}\n\n## Propósito\nEste capítulo establece los requisitos para mejora dentro del Sistema de Gestión de Seguridad de la Información (SGSI).\n\n## Alcance\nEsta documentación aplica a todo el personal, procesos y sistemas dentro del alcance del SGSI.\n\n## Requisitos\n\n### ${selectedChapter.number}.1 Mejora continua\nLa organización debe determinar las cuestiones...`;
      setGeneratedContent(prev => ({ ...prev, [selectedChapter.id]: fallbackText }));
      setDocumentContent(prev => ({ ...prev, [selectedChapter.id]: fallbackText }));
    } finally {
      setIsGenerating(false);
    }
  };

  // Renderizador para el "Borrador IA" usando el color dinámico del capítulo
  const renderMarkdown = (text, activeColor) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('# ')) return <h1 key={idx} style={{ fontSize: '24px', fontWeight: 700, color: activeColor, marginBottom: '24px' }}>{line.substring(2)}</h1>;
      if (line.startsWith('## ')) return <h2 key={idx} style={{ fontSize: '18px', fontWeight: 700, color: t.text, marginTop: '24px', marginBottom: '12px' }}>{line.substring(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={idx} style={{ fontSize: '15px', fontWeight: 600, color: t.text, marginTop: '16px', marginBottom: '8px' }}>{line.substring(4)}</h3>;
      if (line.trim() === '') return <div key={idx} style={{ height: '12px' }} />;
      return <p key={idx} style={{ color: t.textDim, lineHeight: '1.6', fontSize: '14px' }}>{line}</p>;
    });
  };

  // ==========================================
  // 3. RENDERIZADO VISUAL
  // ==========================================
  return (
    <div style={{ animation: 'fadeIn 0.4s ease', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* ENCABEZADO Y BARRA DE PROGRESO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: t.text, marginBottom: '8px' }}>Generador de Documentos ISO 27001</h1>
          <p style={{ color: t.textDim, fontSize: '15px' }}>Genera documentación compatible con asistencia de IA</p>
        </div>
        <button style={{ padding: '10px 20px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '8px', color: t.text, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500 }}>
          <Download size={16} /> Exportar Todos
        </button>
      </div>

      <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: '16px', padding: '16px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: t.textDim, marginBottom: '12px' }}>
          <span>Progreso Total</span>
          <span style={{ color: '#10b981', fontWeight: 700 }}>{totalGenerated}/7 Capítulos</span>
        </div>
        <div style={{ height: '8px', background: t.inputBg, borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: '#10b981', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', flex: 1, minHeight: 0 }}>
        
        {/* PANEL IZQUIERDO: LISTA DE CAPÍTULOS */}
        <div style={{ background: t.cardBg, borderRadius: '16px', border: `1px solid ${t.border}`, padding: '24px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '11px', fontWeight: 700, color: t.textDim, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px' }}>CAPÍTULOS</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {chapters.map((chapter) => {
              const isSelected = selectedChapter?.id === chapter.id;
              const Icon = chapter.icon;

              return (
                <button 
                  key={chapter.id} 
                  onClick={() => setSelectedChapter(chapter)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', 
                    background: isSelected ? `${chapter.color}15` : 'transparent', 
                    border: `1px solid ${isSelected ? chapter.color : 'transparent'}`, 
                    borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease' 
                  }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: isSelected ? `${chapter.color}20` : t.inputBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color={isSelected ? chapter.color : t.textDim} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? t.text : t.textDim, lineHeight: '1.4' }}>
                      {chapter.number}. {chapter.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PANEL DERECHO: ÁREA DE TRABAJO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minHeight: 0 }}>
          
          {/* ESTADO 1: Nada seleccionado */}
          {!selectedChapter && (
            <div style={{ background: t.cardBg, borderRadius: '16px', border: `1px solid ${t.border}`, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: t.textDim }}>
              <FileText size={48} style={{ opacity: 0.3, marginBottom: '20px' }} />
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: t.text, marginBottom: '8px' }}>Selecciona un capítulo para comenzar</h2>
              <p style={{ fontSize: '14px' }}>Elige un capítulo del panel izquierdo para comenzar</p>
            </div>
          )}

          {/* ESTADO 2: Capítulo seleccionado, pero NO generado */}
          {selectedChapter && !generatedContent[selectedChapter.id] && (
            <div style={{ background: t.cardBg, borderRadius: '16px', border: `1px solid ${t.border}`, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '24px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${selectedChapter.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <selectedChapter.icon size={24} color={selectedChapter.color} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: t.text }}>{selectedChapter.number}. {selectedChapter.title}</h2>
                    <p style={{ fontSize: '13px', color: t.textDim }}>{selectedChapter.sections}</p>
                  </div>
                </div>
                <button onClick={handleGenerate} disabled={isGenerating} style={{ padding: '10px 20px', background: selectedChapter.color, border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <Wand2 size={16} /> Generar Borrador
                </button>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: `${selectedChapter.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <Wand2 size={36} color={selectedChapter.color} />
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: t.text, marginBottom: '12px' }}>Generar Borrador {selectedChapter.number}</h2>
                <p style={{ fontSize: '15px', color: t.textDim, maxWidth: '400px', lineHeight: '1.5', marginBottom: '32px' }}>
                  La IA generará un borrador en el panel izquierdo que podrás editar en el derecho.
                </p>
                <button onClick={handleGenerate} disabled={isGenerating} style={{ padding: '14px 32px', background: selectedChapter.color, border: 'none', borderRadius: '12px', color: 'white', fontWeight: 600, cursor: isGenerating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', opacity: isGenerating ? 0.7 : 1 }}>
                  <Wand2 size={20} className={isGenerating ? "spin" : ""} /> 
                  {isGenerating ? 'Generando...' : 'Generar Borrador'}
                </button>
              </div>
            </div>
          )}

          {/* ESTADO 3: Vista Dividida (Split View) */}
          {selectedChapter && generatedContent[selectedChapter.id] && (
            <>
              <div style={{ background: t.cardBg, borderRadius: '16px', border: `1px solid ${t.border}`, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <GitBranch size={18} color={t.textDim} />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: t.text }}>Flujo de Aprobación</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: t.inputBg, border: `2px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit2 size={16} color={t.textDim} /></div>
                    <span style={{ fontSize: '11px', color: t.textDim, fontWeight: 500 }}>Borrador</span>
                  </div>
                  <div style={{ width: '40px', height: '1px', background: t.border, margin: '0 10px', alignSelf: 'flex-start', marginTop: '18px' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', opacity: 0.4 }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'transparent', border: `2px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Eye size={16} color={t.textDim} /></div>
                    <span style={{ fontSize: '11px', color: t.textDim, fontWeight: 500 }}>Revisión</span>
                  </div>
                  <div style={{ width: '40px', height: '1px', background: t.border, margin: '0 10px', alignSelf: 'flex-start', marginTop: '18px', opacity: 0.4 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', opacity: 0.4 }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'transparent', border: `2px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserCheck size={16} color={t.textDim} /></div>
                    <span style={{ fontSize: '11px', color: t.textDim, fontWeight: 500 }}>Aprobado</span>
                  </div>
                </div>

                <button style={{ padding: '10px 20px', background: '#10b981', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <Send size={16} /> Enviar a Revisión
                </button>
              </div>

              <div style={{ background: t.cardBg, borderRadius: '16px', border: `1px solid ${t.border}`, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: `${selectedChapter.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <selectedChapter.icon size={22} color={selectedChapter.color} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '18px', fontWeight: 700, color: t.text }}>{selectedChapter.number}. {selectedChapter.title}</h2>
                      <p style={{ fontSize: '12px', color: t.textDim }}>{selectedChapter.sections}</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <button style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '8px', color: t.textDim, fontSize: '12px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Tag size={14} /> Etiquetado
                    </button>
                    <button onClick={handleGenerate} disabled={isGenerating} style={{ padding: '8px 16px', background: selectedChapter.color, border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <RefreshCw size={14} className={isGenerating ? "spin" : ""} /> Regenerar
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, minHeight: 0 }}>
                  <div style={{ borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '12px 24px', background: `${selectedChapter.color}10`, borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={16} color={selectedChapter.color} />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: selectedChapter.color }}>Borrador IA</span>
                    </div>
                    <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
                      {/* Aquí pasamos el color del capítulo activo para los títulos # */}
                      {renderMarkdown(generatedContent[selectedChapter.id], selectedChapter.color)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '12px 24px', background: 'rgba(16, 185, 129, 0.05)', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Edit3 size={16} color="#10b981" />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#10b981' }}>Tu Documento</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <textarea
                        value={documentContent[selectedChapter.id]}
                        onChange={(e) => setDocumentContent({...documentContent, [selectedChapter.id]: e.target.value})}
                        style={{
                          width: '100%', height: '100%', padding: '32px', background: 'transparent',
                          border: 'none', outline: 'none', color: t.text, fontFamily: 'monospace',
                          fontSize: '14px', lineHeight: '1.8', resize: 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocGeneratorScreen;