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
    { role: 'assistant', content: '👋 ¡Hola! Soy DANI, tu asistente de cumplimiento ISO 27001. Tengo 50 módulos expertos cargados. ¿Qué área deseas auditar hoy?' }
  ]);
  const [isThinking, setIsThinking] = useState(false);

  // ==========================================
  // BANCO DE 50 PROMPTS EXPERTOS (Mapeo dinámico automatizado)
  // ==========================================
  const systemPrompts = [
    // 🛡️ CATEGORÍA: GESTIÓN DE RIESGOS (1-10)
    { id: 'r1', label: 'Severidad de Riesgo', icon: ShieldAlert, text: 'Evalúa la severidad técnica (Impacto x Probabilidad) de una filtración en la base de datos de producción.' },
    { id: 'r2', label: 'Mitigación de Accesos', icon: ShieldAlert, text: 'Propón controles del Anexo A para mitigar el riesgo de credenciales compartidas en sistemas críticos.' },
    { id: 'r3', label: 'Riesgo de Fuga USB', icon: ShieldAlert, text: 'Genera un plan de contención ante el riesgo de extracción de datos confidenciales mediante dispositivos USB.' },
    { id: 'r4', label: 'Caída de Autenticación', icon: ShieldAlert, text: 'Analiza el impacto operativo de la caída del servidor Active Directory / LDAP perimetral.' },
    { id: 'r5', label: 'Riesgo en la Nube', icon: ShieldAlert, text: 'Evalúa riesgos de seguridad asociados a malas configuraciones en buckets de almacenamiento AWS S3.' },
    { id: 'r6', label: 'Ingeniería Social', icon: ShieldAlert, text: 'Diseña una estrategia de mitigación técnica y concientización contra ataques de Phishing dirigido a ejecutivos.' },
    { id: 'r7', label: 'Cómputo Remoto', icon: ShieldAlert, text: 'Identifica los riesgos de seguridad de la información en el ecosistema de teletrabajo y redes domésticas.' },
    { id: 'r8', label: 'Falla de Proveedores', icon: ShieldAlert, text: 'Analiza el riesgo de interrupción de servicio por parte de un proveedor crítico de infraestructura SaaS.' },
    { id: 'r9', label: 'Obsolescencia de SW', icon: ShieldAlert, text: 'Establece los riesgos de mantener servidores legacy con sistemas operativos sin soporte del fabricante.' },
    { id: 'r10', label: 'Pérdida de Respaldos', icon: ShieldAlert, text: 'Evalúa el impacto de la corrupción de datos en respaldos históricos debido a la falta de pruebas de restauración.' },

    // 📋 CATEGORÍA: AUDITORÍA INTERNA Y GAP ANALYSIS (11-20)
    { id: 'a11', label: 'Auditar Control Acceso', icon: CheckSquare, text: 'Actúa como auditor ISO 27001 y redacta 5 preguntas clave para evaluar el control A.5.15 (Control de acceso).' },
    { id: 'a12', label: 'Evidencia de Respaldo', icon: CheckSquare, text: '¿Qué evidencias técnicas y registros documentales solicitarías para certificar la política de copias de seguridad?' },
    { id: 'a13', label: 'Auditoría de Parches', icon: CheckSquare, text: 'Genera una lista de verificación (checklist) para auditar el proceso de gestión de vulnerabilidades técnicas.' },
    { id: 'a14', label: 'Entrevistas de Personal', icon: CheckSquare, text: 'Redacta un cuestionario de auditoría interna para validar la concientización en seguridad de los empleados nuevos.' },
    { id: 'a15', label: 'Revisión de Logs', icon: CheckSquare, text: '¿Cómo verificarías en una auditoría que los registros de eventos (Audit Logs) no han sido manipulados?' },
    { id: 'a16', label: 'Cifrado de Datos', icon: CheckSquare, text: '¿Qué métricas e indicadores de cumplimiento pedirías para validar el uso de criptografía en reposo y tránsito?' },
    { id: 'a17', label: 'Bajas de Usuarios', icon: CheckSquare, text: 'Diseña un escenario de pruebas para auditar la revocación inmediata de accesos a empleados desvinculados.' },
    { id: 'a18', label: 'Seguridad Física', icon: CheckSquare, text: 'Crea una guía de inspección visual para auditar las áreas seguras y centros de cómputo de la empresa.' },
    { id: 'a19', label: 'Desarrollo Seguro', icon: CheckSquare, text: '¿Cómo comprobarías en una auditoría que se aplican pautas de OWASP en el ciclo de vida del software (SDLC)?' },
    { id: 'a20', label: 'Revisión por Dirección', icon: CheckSquare, text: 'Detalla los elementos mínimos indispensables que debe contener el informe de revisión del SGSI por la alta dirección.' },

    // 🔐 CATEGORÍA: CONTROLES DEL ANEXO A (21-30)
    { id: 'c21', label: 'Política de Contraseñas', icon: Lock, text: 'Redacta una política de contraseñas robusta alineada con los requisitos actuales de la ISO 27001:2022.' },
    { id: 'c22', label: 'Uso de MFA', icon: Lock, text: 'Justifica técnicamente ante el comité de finanzas la obligatoriedad de implementar Autenticación Multifactor.' },
    { id: 'c23', label: 'Políticas de Escritorio', icon: Lock, text: 'Diseña la estructura de una política corporativa de pantallas limpias y escritorios despejados.' },
    { id: 'c24', label: 'Clasificación de Datos', icon: Lock, text: 'Crea una matriz estándar para la clasificación de activos de información (Pública, Interna, Confidencial, Secreta).' },
    { id: 'c25', label: 'Gestión de Activos', icon: Lock, text: 'Define los campos obligatorios para estructurar un inventario de activos de información institucional.' },
    { id: 'c26', label: 'Propiedad Intelectual', icon: Lock, text: 'Redacta cláusulas de confidencialidad (NDA) para contratos de ingenieros de software externos.' },
    { id: 'c27', label: 'Uso de Criptografía', icon: Lock, text: 'Establece los estándares mínimos de algoritmos de cifrado recomendados (ej. AES-256) para canales de comunicación.' },
    { id: 'c28', label: 'Eliminación Segura', icon: Lock, text: 'Escribe el procedimiento técnico normativo para la desmagnetización y destrucción física de discos duros obsoletos.' },
    { id: 'c29', label: 'Hardening de Servidores', icon: Lock, text: 'Crea una guía base de Hardening técnico para sistemas operativos Linux de producción.' },
    { id: 'c30', label: 'Gestión de Capacidad', icon: Lock, text: 'Define un control operativo para monitorear y alertar sobre los límites de capacidad en recursos de red.' },

    // 💥 CATEGORÍA: RED TEAM Y SIMULACIÓN OFENSIVA (31-40)
    { id: 't31', label: 'Ataque de Inyección SQL', icon: Terminal, text: 'Actúa como analista ofensivo Red Team. Describe el vector de ataque de una inyección SQL y su contención técnica.' },
    { id: 't32', label: 'Análisis de Metasploit', icon: Terminal, text: '¿Cómo simularías la explotación de una vulnerabilidad crítica de ejecución remota de código usando herramientas de testing?' },
    { id: 't33', label: 'Escaneo de Red Nmap', icon: Terminal, text: 'Genera un script básico explicativo de comandos Nmap para auditorías de descubrimiento de puertos expuestos.' },
    { id: 't34', label: 'Ataque de Ransomware', icon: Terminal, text: 'Describe la cadena de ataque (Kill Chain) de un Ransomware y cómo los controles de la norma bloquean sus fases.' },
    { id: 't35', label: 'Fuerza Bruta SSH', icon: Terminal, text: 'Explica cómo un atacante explota un servicio SSH expuesto con contraseñas débiles y cómo mitigarlo con Fail2Ban.' },
    { id: 't36', label: 'Interceptación Wireshark', icon: Terminal, text: 'Demuestra el peligro del envío de credenciales por protocolos inseguros (HTTP/FTP) simulando un ataque Man-in-the-Middle.' },
    { id: 't37', label: 'Exfiltración DNS', icon: Terminal, text: 'Explica el concepto técnico de exfiltración de datos mediante túneles DNS y las reglas de firewall necesarias para bloquearlo.' },
    { id: 't38', label: 'Ataque API Broken Auth', icon: Terminal, text: 'Analiza una vulnerabilidad de autenticación rota en un endpoint REST y propone el parche en código.' },
    { id: 't39', label: 'Inyección de Comandos', icon: Terminal, text: 'Describe cómo un campo de entrada mal sanitizado permite ejecución de comandos en el sistema operativo del servidor.' },
    { id: 't40', label: 'Simular Malware Local', icon: Terminal, text: 'Explica el comportamiento de persistencia de un troyano en registros del sistema y los controles EDR para su detección.' },

    // 🏢 CATEGORÍA: GOBIERNO, INCIDENTES Y CONTINUIDAD (41-50)
    { id: 'g41', label: 'Plan de Incidentes', icon: Shield, text: 'Diseña el flujo de trabajo (Playbook) para la respuesta y contención ante un incidente confirmado de Malware.' },
    { id: 'g42', label: 'Clasificar Incidentes', icon: Shield, text: 'Crea una tabla de niveles de criticidad para incidentes de seguridad (Bajo, Medio, Alto, Crítico) con tiempos de respuesta.' },
    { id: 'g43', label: 'Simulacro DRP', icon: Shield, text: 'Redacta la minuta técnica para coordinar un simulacro de recuperación ante desastres (DRP) en la nube.' },
    { id: 'g44', label: 'Análisis Post-Mortem', icon: Shield, text: 'Escribe la plantilla de reporte de Lecciones Aprendidas tras un ataque exitoso de denegación de servicio (DoS).' },
    { id: 'g45', label: 'KPIs de Seguridad', icon: Shield, text: 'Define 5 KPIs cuantitativos para medir la efectividad mensual de la gestión de incidentes.' },
    { id: 'g46', label: 'Comité de Crisis', icon: Shield, text: 'Establece los roles y responsabilidades del Comité de Manejo de Crisis ante brechas de datos masivas.' },
    { id: 'g47', label: 'Notificación Legal', icon: Shield, text: '¿Cuál es el procedimiento normativo para reportar incidentes de fuga de datos privados a las autoridades reguladoras?' },
    { id: 'g48', label: 'Continuidad de Negocio', icon: Shield, text: 'Escribe un procedimiento para operar en modo degradado ante la pérdida total de conectividad troncal de internet.' },
    { id: 'g49', label: 'Análisis de BIA', icon: Shield, text: 'Explica cómo calcular el RTO (Recovery Time Objective) y RPO (Recovery Point Objective) de la base de datos empresarial.' },
    { id: 'g50', label: 'Mejora Continua', icon: Shield, text: 'Define un plan de acción correctiva (CAPA) para cerrar una no conformidad de auditoría sobre control de accesos.' }
  ];

  // ==========================================
  // 3. LÓGICA DE ENVÍO
  // ==========================================
  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || chatQuery;
    
    if (!textToSend.trim() || isThinking) return;

    let userDisplayContent = textToSend;
    if (customText) {
      const selectedPrompt = systemPrompts.find(p => p.text === customText);
      userDisplayContent = selectedPrompt ? `📊 Módulo: ${selectedPrompt.label}` : customText;
    }

    const newUserMessage = { role: 'user', content: userDisplayContent };
    
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
            <div style={{ fontWeight: 600, fontSize: '14px', color: t.text }}>DANI IA Expert (50)</div>
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
              DANI está analizando el vector...
            </div>
          </div>
        )}
      </div>

      {/* CARRUSEL DE 50 PROMPTS AUTOMATIZADO CON MAP (DISEÑO PRESERVADO) */}
      <div style={{ 
        padding: '0 16px', display: 'flex', gap: '8px', overflowX: 'auto', 
        paddingBottom: '8px', whiteSpace: 'nowrap',
        scrollbarWidth: 'none', msOverflowStyle: 'none'
      }}>
        {systemPrompts.map((prompt) => {
          const PromptIcon = prompt.icon;
          return (
            <button
              key={prompt.id}
              onClick={() => handleSendMessage(prompt.text)}
              disabled={isThinking}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
                background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                border: `1px solid rgba(16, 185, 129, 0.2)`, borderRadius: '20px',
                color: '#10b981', fontSize: '11px', fontWeight: 600, cursor: isThinking ? 'not-allowed' : 'pointer',
                flexShrink: 0, transition: 'all 0.2s ease'
              }}
            >
              <PromptIcon size={12} />
              {prompt.label}
            </button>
          );
        })}
      </div>

      {/* Input */}
      <div style={{ padding: '16px', borderTop: `1px solid ${t.border}` }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            value={chatQuery} 
            onChange={(e) => setChatQuery(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Pregunta sobre ISO 27001..." 
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