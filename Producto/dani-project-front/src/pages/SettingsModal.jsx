// src/pages/SettingsModal.jsx
import React, { useState, useContext } from 'react';
import { 
  Settings, X, Key, Smartphone, Calendar, Globe, Monitor,
  Shield, Check, Eye, EyeOff, CheckCircle2, ChevronDown,
  Sun, Moon, MessageSquare, FileText
} from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';

const labels = {
  en: {
    settings: 'Settings', password: 'Password', twoFA: 'Two-Factor Auth',
    language: 'Language', appearance: 'Appearance', auditCycle: 'Audit Cycle',
    changePassword: 'Change Password', currentPassword: 'Current Password',
    newPassword: 'New Password', confirmPassword: 'Confirm Password',
    passwordRequirements: 'Password must be at least 12 characters with uppercase, lowercase, numbers and symbols',
    updatePassword: 'Update Password', twoFactorAuth: 'Two-Factor Authentication',
    twoFADescription: 'Add an extra layer of security to your account',
    enabled: 'Enabled', disabled: 'Disabled', authMethod: 'Authentication Method',
    authApp: 'Authenticator App', smsCode: 'SMS Code', emailCode: 'Email Code',
    defaultLanguage: 'Default Language', languageDescription: 'Choose your preferred language',
    screenMode: 'Screen Mode', appearanceDescription: 'Customize how Dani looks',
    darkMode: 'Dark Mode', lightMode: 'Light Mode',
    darkModeDesc: 'Easier on the eyes in low light',
    lightModeDesc: 'Better visibility in bright environments',
    auditCycleTitle: 'Audit Cycle Day',
    auditCycleDescription: 'Set the day of the month when your internal audit cycle begins',
    auditCycleDay: 'Cycle Start Day', auditCycleDayHelp: 'Monthly audit cycle will start on this day',
    saveChanges: 'Save Changes', cancel: 'Cancel', saved: 'Changes saved successfully!'
  },
  es: {
    settings: 'Configuración', password: 'Contraseña', twoFA: 'Autenticación 2FA',
    language: 'Idioma', appearance: 'Apariencia', auditCycle: 'Ciclo de Auditoría',
    changePassword: 'Cambiar Contraseña', currentPassword: 'Contraseña Actual',
    newPassword: 'Nueva Contraseña', confirmPassword: 'Confirmar Contraseña',
    passwordRequirements: 'La contraseña debe tener al menos 12 caracteres',
    updatePassword: 'Actualizar Contraseña', twoFactorAuth: 'Autenticación de Dos Factores',
    twoFADescription: 'Añade una capa extra de seguridad',
    enabled: 'Activado', disabled: 'Desactivado', authMethod: 'Método de Autenticación',
    authApp: 'App de Autenticación', smsCode: 'Código SMS', emailCode: 'Código Email',
    defaultLanguage: 'Idioma Predeterminado', languageDescription: 'Elige tu idioma preferido',
    screenMode: 'Modo de Pantalla', appearanceDescription: 'Personaliza cómo se ve Dani',
    darkMode: 'Modo Oscuro', lightMode: 'Modo Claro',
    darkModeDesc: 'Más cómodo en ambientes oscuros',
    lightModeDesc: 'Mejor visibilidad en ambientes claros',
    auditCycleTitle: 'Día del Ciclo de Auditoría',
    auditCycleDescription: 'Establece el día del mes del ciclo de auditoría',
    auditCycleDay: 'Día de Inicio', auditCycleDayHelp: 'El ciclo mensual comenzará este día',
    saveChanges: 'Guardar Cambios', cancel: 'Cancelar', saved: '¡Cambios guardados!'
  },
  pt: {
    settings: 'Configurações', password: 'Senha', twoFA: 'Autenticação 2FA',
    language: 'Idioma', appearance: 'Aparência', auditCycle: 'Ciclo de Auditoria',
    changePassword: 'Alterar Senha', currentPassword: 'Senha Atual',
    newPassword: 'Nova Senha', confirmPassword: 'Confirmar Senha',
    passwordRequirements: 'A senha deve ter pelo menos 12 caracteres',
    updatePassword: 'Atualizar Senha', twoFactorAuth: 'Autenticação de Dois Fatores',
    twoFADescription: 'Adicione uma camada extra de segurança',
    enabled: 'Ativado', disabled: 'Desativado', authMethod: 'Método de Autenticação',
    authApp: 'App Autenticador', smsCode: 'Código SMS', emailCode: 'Código Email',
    defaultLanguage: 'Idioma Padrão', languageDescription: 'Escolha seu idioma preferido',
    screenMode: 'Modo de Tela', appearanceDescription: 'Personalize como o Dani aparece',
    darkMode: 'Modo Escuro', lightMode: 'Modo Claro',
    darkModeDesc: 'Mais confortável em ambientes escuros',
    lightModeDesc: 'Melhor visibilidade em ambientes claros',
    auditCycleTitle: 'Dia do Ciclo de Auditoria',
    auditCycleDescription: 'Defina o dia do mês do ciclo de auditoria',
    auditCycleDay: 'Dia de Início', auditCycleDayHelp: 'O ciclo mensal começará neste dia',
    saveChanges: 'Salvar', cancel: 'Cancelar', saved: 'Alterações salvas!'
  }
};

function SettingsModal({ onClose }) {
  const { darkMode, theme: t, language, setDarkMode, setLanguage } = useContext(ThemeContext);
  const [activeSection, setActiveSection] = useState('password');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(true);
  const [twoFAMethod, setTwoFAMethod] = useState('app');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [auditCycleDay, setAuditCycleDay] = useState(1);

  const l = labels[language] || labels.en;

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' }
  ];

  const sections = [
    { id: 'password', label: l.password, icon: Key },
    { id: '2fa', label: l.twoFA, icon: Smartphone },
    { id: 'auditCycle', label: l.auditCycle, icon: Calendar },
    { id: 'language', label: l.language, icon: Globe },
    { id: 'appearance', label: l.appearance, icon: Monitor }
  ];

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
      <div style={{ width: '720px', maxHeight: '85vh', background: darkMode ? '#1e293b' : '#ffffff', borderRadius: '20px', border: `1px solid ${t.border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
        
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings size={20} color="white" />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: t.text }}>{l.settings}</h2>
          </div>
          <button onClick={onClose} style={{ width: '36px', height: '36px', borderRadius: '8px', background: t.inputBg, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textDim }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div style={{ width: '200px', borderRight: `1px solid ${t.border}`, padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button key={section.id} onClick={() => setActiveSection(section.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
                  background: activeSection === section.id ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  border: 'none', borderRadius: '10px', cursor: 'pointer',
                  color: activeSection === section.id ? '#10b981' : t.textMuted,
                  fontSize: '14px', fontWeight: activeSection === section.id ? 600 : 500, textAlign: 'left'
                }}>
                  <Icon size={18} /> {section.label}
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            {activeSection === 'password' && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: t.text }}>{l.changePassword}</h3>
                <p style={{ fontSize: '13px', color: t.textDim, marginBottom: '24px' }}>{l.passwordRequirements}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[{ label: l.currentPassword, show: showCurrentPassword, setShow: setShowCurrentPassword },
                    { label: l.newPassword, show: showNewPassword, setShow: setShowNewPassword },
                    { label: l.confirmPassword, show: showConfirmPassword, setShow: setShowConfirmPassword }].map((field, i) => (
                    <div key={i}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: t.textMuted, marginBottom: '8px' }}>{field.label}</label>
                      <div style={{ position: 'relative' }}>
                        <input type={field.show ? 'text' : 'password'} style={{ width: '100%', padding: '12px 44px 12px 14px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, fontSize: '14px', outline: 'none' }} />
                        <button onClick={() => field.setShow(!field.show)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: t.textDim }}>
                          {field.show ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}>{l.updatePassword}</button>
                </div>
              </div>
            )}

            {activeSection === '2fa' && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: t.text }}>{l.twoFactorAuth}</h3>
                <p style={{ fontSize: '13px', color: t.textDim, marginBottom: '24px' }}>{l.twoFADescription}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: t.inputBg, borderRadius: '12px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: twoFAEnabled ? 'rgba(16, 185, 129, 0.15)' : t.hoverBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Shield size={20} color={twoFAEnabled ? '#10b981' : t.textDim} />
                    </div>
                    <div><div style={{ fontSize: '14px', fontWeight: 600, color: t.text }}>{l.twoFactorAuth}</div><div style={{ fontSize: '12px', color: twoFAEnabled ? '#10b981' : t.textDim }}>{twoFAEnabled ? l.enabled : l.disabled}</div></div>
                  </div>
                  <button onClick={() => setTwoFAEnabled(!twoFAEnabled)} style={{ width: '52px', height: '28px', borderRadius: '14px', background: twoFAEnabled ? '#10b981' : t.hoverBg, border: `1px solid ${twoFAEnabled ? '#10b981' : t.border}`, cursor: 'pointer', position: 'relative' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: twoFAEnabled ? '27px' : '2px', transition: 'all 0.2s ease' }} />
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'auditCycle' && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: t.text }}>{l.auditCycleTitle}</h3>
                <p style={{ fontSize: '13px', color: t.textDim, marginBottom: '24px' }}>{l.auditCycleDescription}</p>
                <div style={{ padding: '20px', background: t.inputBg, borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={20} color="#10b981" /></div>
                    <div><div style={{ fontSize: '14px', fontWeight: 600, color: t.text }}>{l.auditCycleDay}</div><div style={{ fontSize: '12px', color: t.textDim }}>{l.auditCycleDayHelp}</div></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <button key={day} onClick={() => setAuditCycleDay(day)} style={{ aspectRatio: '1', borderRadius: '8px', background: auditCycleDay === day ? '#10b981' : 'transparent', border: `1px solid ${auditCycleDay === day ? '#10b981' : t.border}`, color: auditCycleDay === day ? 'white' : t.text, fontSize: '13px', fontWeight: auditCycleDay === day ? 600 : 500, cursor: 'pointer' }}>{day}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'language' && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: t.text }}>{l.defaultLanguage}</h3>
                <p style={{ fontSize: '13px', color: t.textDim, marginBottom: '24px' }}>{l.languageDescription}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {languages.map((lang) => (
                    <button key={lang.code} onClick={() => setLanguage(lang.code)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', background: language === lang.code ? 'rgba(16, 185, 129, 0.1)' : t.inputBg, border: `2px solid ${language === lang.code ? '#10b981' : t.border}`, borderRadius: '12px', cursor: 'pointer', textAlign: 'left' }}>
                      <span style={{ fontSize: '28px' }}>{lang.flag}</span>
                      <span style={{ flex: 1, fontSize: '15px', fontWeight: 600, color: language === lang.code ? '#10b981' : t.text }}>{lang.name}</span>
                      {language === lang.code && <Check size={14} color="#10b981" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'appearance' && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: t.text }}>{l.screenMode}</h3>
                <p style={{ fontSize: '13px', color: t.textDim, marginBottom: '24px' }}>{l.appearanceDescription}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <button onClick={() => setDarkMode(true)} style={{ padding: '20px', background: darkMode ? 'rgba(16, 185, 129, 0.1)' : t.inputBg, border: `2px solid ${darkMode ? '#10b981' : t.border}`, borderRadius: '16px', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ width: '100%', height: '80px', background: 'linear-gradient(135deg, #0a0f1c 0%, #1e293b 100%)', borderRadius: '10px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}><Moon size={28} color="#6366f1" /></div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: darkMode ? '#10b981' : t.text }}>{l.darkMode}</div>
                    <div style={{ fontSize: '11px', color: t.textDim }}>{l.darkModeDesc}</div>
                  </button>
                  <button onClick={() => setDarkMode(false)} style={{ padding: '20px', background: !darkMode ? 'rgba(16, 185, 129, 0.1)' : t.inputBg, border: `2px solid ${!darkMode ? '#10b981' : t.border}`, borderRadius: '16px', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ width: '100%', height: '80px', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', borderRadius: '10px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.1)' }}><Sun size={28} color="#f59e0b" /></div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: !darkMode ? '#10b981' : t.text }}>{l.lightMode}</div>
                    <div style={{ fontSize: '11px', color: t.textDim }}>{l.lightModeDesc}</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {saveSuccess ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '13px', fontWeight: 500 }}><CheckCircle2 size={16} /> {l.saved}</div>
          ) : <div />}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={onClose} style={{ padding: '10px 20px', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>{l.cancel}</button>
            <button onClick={handleSave} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>{l.saveChanges}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;