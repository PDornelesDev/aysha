
import React, { useState } from 'react';
import { User, Bell, Shield, Moon, Smartphone, Globe, Lock, Check } from 'lucide-react';

interface SettingsModalProps {
  // Fix: Added user property to interface as it is being passed from App.tsx
  user: { id: number; name: string; email: string; picture: string } | null;
  toggleTheme: () => void;
  theme: 'light' | 'dark';
  onEditProfile: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ user, toggleTheme, theme, onEditProfile }) => {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordState, setPasswordState] = useState<'idle' | 'saving' | 'success'>('idle');

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordState('saving');
    setTimeout(() => {
        setPasswordState('success');
        setTimeout(() => {
            setIsChangePasswordOpen(false);
            setPasswordState('idle');
        }, 1500);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-aysha-purple to-aysha-pink p-[2px]">
            {/* Fix: Display user's profile picture from props */}
            <img 
              src={user?.picture || "https://picsum.photos/100/100"} 
              alt="Avatar" 
              className="w-full h-full rounded-full object-cover border-4 border-white dark:border-black"
            />
        </div>
        <div>
          {/* Fix: Display user's name and email from props instead of hardcoded strings */}
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">{user?.name || 'Israel Cobo'}</h4>
          <p className="text-sm text-gray-500">{user?.email || 'israel.cobo@aysha.ai'}</p>
        </div>
        <button 
            onClick={onEditProfile}
            className="ml-auto text-sm text-aysha-pink font-medium hover:underline"
        >
            Editar
        </button>
      </div>

      {/* Preferences */}
      <div className="space-y-1">
        <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Preferências</h5>
        
        <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer" onClick={toggleTheme}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300">
              <Moon size={18} />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Modo Escuro</span>
          </div>
          <div className={`w-10 h-6 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-aysha-pink' : 'bg-gray-200'}`}>
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-4' : ''}`} />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300">
              <Bell size={18} />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Notificações</span>
          </div>
          <span className="text-xs text-gray-400">Ligado</span>
        </div>
        
         <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300">
              <Globe size={18} />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Idioma</span>
          </div>
          <span className="text-xs text-gray-400">Português (BR)</span>
        </div>
      </div>

      {/* Security */}
      <div className="space-y-1">
        <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 mt-2">Segurança</h5>
        
        <div className="rounded-xl overflow-hidden transition-all duration-300">
             <div 
                onClick={() => setIsChangePasswordOpen(!isChangePasswordOpen)}
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer"
             >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300">
                    <Shield size={18} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Alterar Senha</span>
                </div>
                <Lock size={16} className={`text-gray-400 transition-transform duration-300 ${isChangePasswordOpen ? 'rotate-180' : ''}`} />
             </div>

             {isChangePasswordOpen && (
                <div className="p-4 bg-gray-50 dark:bg-white/5 animate-in slide-in-from-top-2">
                    <form onSubmit={handlePasswordSave} className="space-y-3">
                        <input type="password" placeholder="Senha Atual" className="w-full p-2 text-sm bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:border-aysha-pink dark:focus:border-aysha-pink" />
                        <input type="password" placeholder="Nova Senha" className="w-full p-2 text-sm bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:border-aysha-pink dark:focus:border-aysha-pink" />
                        <input type="password" placeholder="Confirmar Nova Senha" className="w-full p-2 text-sm bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:border-aysha-pink dark:focus:border-aysha-pink" />
                        <button 
                            type="submit"
                            disabled={passwordState !== 'idle'}
                            className="w-full py-2 bg-aysha-purple text-white rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2"
                        >
                            {passwordState === 'saving' && 'Salvando...'}
                            {passwordState === 'success' && <><Check size={16} /> Senha Alterada!</>}
                            {passwordState === 'idle' && 'Atualizar Senha'}
                        </button>
                    </form>
                </div>
             )}
        </div>

        <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300">
              <Smartphone size={18} />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Dispositivos Conectados</span>
          </div>
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
         <p className="text-xs text-gray-400">Aysha AI v1.0.3</p>
      </div>
    </div>
  );
};

export default SettingsModal;
