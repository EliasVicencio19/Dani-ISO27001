/* eslint-disable */
import React, { useState, useContext } from 'react';
import { 
  Download, Building2, Users, Target, HelpCircle, Zap, Search, RefreshCw,
  Wand2, GitBranch, Edit2, Eye, UserCheck, CheckCircle, Send, 
  ArrowLeftRight, Edit3, Tag, History, Sparkles, FileText, Loader2
} from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';
import { documentsAPI } from '../services/api';

// NUEVO: Importamos la librería para crear PDFs profesionales
import html2pdf from 'html2pdf.js';

const DocGeneratorScreen = () => {
  const { theme: t, darkMode } = useContext(ThemeContext);

  const [selectedChapter, setSelectedChapter] = useState(null);
  const [generatedContent, setGeneratedContent] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [documentContent, setDocumentContent] = useState({});

  const chapters = [
    { id: 4, number: '4', title: 'Contexto de la Organización', sections: '4 sections', icon: Building2, color: '#3b82f6' },
    { id: 5, number: '5', title: 'Liderazgo', sections: '3 sections', icon: Users, color: '#f59e0b' },
    { id: 6, number: '6', title: 'Planificación', sections: '2 sections', icon: Target, color: '#10b981' },
    { id: 7, number: '7', title: 'Apoyo', sections: '5 sections', icon: HelpCircle, color: '#8b5cf6' },
    { id: 8, number: '8', title: 'Operación', sections: '3 sections', icon: Zap, color: '#ec4899' },
    { id: 9, number: '9', title: 'Evaluación del Desempeño', sections: '3 sections', icon: Search, color: '#0ea5e9' },
    { id: 10, number: '10', title: 'Mejora', sections: '2 sections', icon: RefreshCw, color: '#ef4444' }
  ];

  const totalGenerated = Object.keys(generatedContent).length;
  const progressPercent = Math.round((totalGenerated / chapters.length) * 100);

  const handleGenerate = async () => {
    if (!selectedChapter) return;
    setIsGenerating(true);
    
    try {
      const promptData = { 
        title: selectedChapter.title,
        chapter_number: selectedChapter.number 
      };
      
      const response = await documentsAPI.generateDocument(`chapter_${selectedChapter.id}`, promptData);
      const text = response.content || response.text || response.generated_text;
      
      if (!text) throw new Error("La API no devolvió contenido de texto.");

      setGeneratedContent(prev => ({ ...prev, [selectedChapter.id]: text }));
      setDocumentContent(prev => ({ ...prev, [selectedChapter.id]: text }));

    } catch (error) {
      console.error("Error conectando con la API de IA:", error);
      const fallbackText = `# ${selectedChapter.number}. ${selectedChapter.title}\n\n## Propósito\nEste capítulo establece los requisitos para mejora dentro del Sistema de Gestión de Seguridad de la Información (SGSI).\n\n## Alcance\nEsta documentación aplica a todo el personal, procesos y sistemas dentro del alcance del SGSI.\n\n## Requisitos\n\n### ${selectedChapter.number}.1 Mejora continua\nLa organización debe determinar las cuestiones necesarias para el correcto funcionamiento de su sistema.\n\n### ${selectedChapter.number}.2 No conformidades\nSi ocurre un problema, se debe registrar en el inventario de eventos.`;
      
      setGeneratedContent(prev => ({ ...prev, [selectedChapter.id]: fallbackText }));
      setDocumentContent(prev => ({ ...prev, [selectedChapter.id]: fallbackText }));
    } finally {
      setIsGenerating(false);
    }
  };

  // ==========================================
  // NUEVO: EXPORTACIÓN A PDF CON HTML2PDF
  // ==========================================
  const handleExportDocument = () => {
    const contentToExport = documentContent[selectedChapter?.id];
    
    if (!contentToExport) {
      alert("⚠️ Primero debes generar o escribir el borrador de un capítulo para poder exportarlo.");
      return;
    }

    // 1. Inyectamos el logo (texto), la fecha y el título del documento
    const today = new Date().toLocaleDateString();
    let htmlContent = `
      <div style="font-family: Helvetica, Arial, sans-serif; padding: 40px; color: #333; background-color: #ffffff;">
        <div style="border-bottom: 2px solid #10b981; padding-bottom: 10px; margin-bottom: 30px; display: flex; justify-content: space-between;">
          <strong style="font-size: 24px; color: #10b981;">DANI GR&C</strong>
          <span style="color: #666;">ISO 27001 - ${today}</span>
        </div>
    `;

    // Parseamos el Markdown a HTML estructurado y bonito
    htmlContent += contentToExport.split('\n').map(line => {
      if (line.startsWith('# ')) return `<h1 style="color: #1e293b; font-size: 24px; margin-bottom: 20px;">${line.substring(2)}</h1>`;
      if (line.startsWith('## ')) return `<h2 style="color: #3b82f6; font-size: 18px; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">${line.substring(3)}</h2>`;
      if (line.startsWith('### ')) return `<h3 style="color: #0f172a; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">${line.substring(4)}</h3>`;
      if (line.trim() === '') return `<br/>`;
      return `<p style="line-height: 1.6; font-size: 14px; margin-bottom: 10px; text-align: justify;">${line}</p>`;
    }).join('');

    htmlContent += `</div>`;
    // 2. Configuramos las opciones del PDF (tamaño carta, márgenes, etc.)
    const options = {
      margin:       0.5, // Media pulgada de margen
      filename:     `ISO_27001_Capitulo_${selectedChapter.number}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff' }, // Mayor escala = Mayor resolución
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // 3. Pasamos el HTML directamente como string (evita problemas de elementos invisibles o coords negativas)
    html2pdf().set(options).from(htmlContent).save().catch(err => {
      console.error("Error generando PDF:", err);
    });
  };

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

  return (
    <div style={{ animation: 'fadeIn 0.4s ease', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* ENCABEZADO Y BARRA DE PROGRESO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: t.text, marginBottom: '8px' }}>Generador de Documentos ISO 27001</h1>
          <p style={{ color: t.textDim, fontSize: '15px' }}>Genera documentación compatible con asistencia de IA</p>
        </div>
        <button 
          onClick={handleExportDocument}
          style={{ padding: '10px 20px', background: '#ef4444', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}
        >
          <Download size={16} /> Descargar PDF
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
                <button onClick={handleGenerate} disabled={isGenerating} style={{ padding: '10px 20px', background: selectedChapter.color, border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: isGenerating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', opacity: isGenerating ? 0.7 : 1 }}>
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />} 
                  {isGenerating ? 'Generando...' : 'Generar Borrador'}
                </button>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: `${selectedChapter.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  {isGenerating ? <Loader2 size={36} color={selectedChapter.color} className="animate-spin" /> : <Wand2 size={36} color={selectedChapter.color} />}
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: t.text, marginBottom: '12px' }}>Generar Borrador {selectedChapter.number}</h2>
                <p style={{ fontSize: '15px', color: t.textDim, maxWidth: '400px', lineHeight: '1.5', marginBottom: '32px' }}>
                  La IA generará un borrador en el panel izquierdo que podrás editar en el derecho.
                </p>
                <button onClick={handleGenerate} disabled={isGenerating} style={{ padding: '14px 32px', background: selectedChapter.color, border: 'none', borderRadius: '12px', color: 'white', fontWeight: 600, cursor: isGenerating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', opacity: isGenerating ? 0.7 : 1 }}>
                  {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />} 
                  {isGenerating ? 'Conectando con IA...' : 'Generar Borrador'}
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
                    <button onClick={handleGenerate} disabled={isGenerating} style={{ padding: '8px 16px', background: selectedChapter.color, border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px', fontWeight: 600, cursor: isGenerating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: isGenerating ? 0.7 : 1 }}>
                      {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} 
                      {isGenerating ? 'Generando...' : 'Regenerar'}
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