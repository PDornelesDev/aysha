
import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, User, ArrowRight, CreditCard, Phone, ChevronDown, Check } from 'lucide-react';

declare const google: any;

interface LoginProps {
  onLogin: (profile: any) => void;
}

const COUNTRIES = [
  { code: '55', flag: '🇧🇷', name: 'Brasil' },
  { code: '1', flag: '🇺🇸', name: 'Estados Unidos' },
  { code: '351', flag: '🇵🇹', name: 'Portugal' },
  { code: '34', flag: '🇪🇸', name: 'Espanha' },
  { code: '44', flag: '🇬🇧', name: 'Reino Unido' },
  { code: '33', flag: '🇫🇷', name: 'França' },
  { code: '49', flag: '🇩 जर्मनी', name: 'Alemanha' },
  { code: '39', flag: '🇮🇹', name: 'Itália' },
  { code: '81', flag: '🇯🇵', name: 'Japão' },
  { code: '54', flag: '🇦🇷', name: 'Argentina' },
  { code: '598', flag: '🇺🇾', name: 'Uruguai' },
  { code: '56', flag: '🇨🇱', name: 'Chile' },
  { code: '57', flag: '🇨🇴', name: 'Colômbia' },
  { code: '52', flag: '🇲🇽', name: 'México' },
  { code: '1', flag: '🇨🇦', name: 'Canadá' },
  { code: '61', flag: '🇦🇺', name: 'Austrália' },
  { code: '244', flag: '🇦🇴', name: 'Angola' },
  { code: '258', flag: '🇲🇿', name: 'Moçambique' },
  { code: '41', flag: '🇨🇭', name: 'Suíça' },
  { code: '31', flag: '🇳🇱', name: 'Holanda' },
  { code: '32', flag: '🇧🇪', name: 'Bélgica' },
  { code: '971', flag: '🇦🇪', name: 'Emirados Árabes' },
  { code: '353', flag: '🇮🇪', name: 'Irlanda' },
].sort((a, b) => a.name.localeCompare(b.name));

const sortedCountries = [
  { code: '55', flag: '🇧🇷', name: 'Brasil' },
  ...COUNTRIES.filter(c => c.code !== '55')
];

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    document: '', 
    whatsapp: '' 
  });
  
  const [selectedCountry, setSelectedCountry] = useState(sortedCountries[0]);
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);
  const [error, setError] = useState('');
  
  const initializedRef = useRef(false);
  const countryMenuRef = useRef<HTMLDivElement>(null);

  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID; 

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryMenuRef.current && !countryMenuRef.current.contains(event.target as Node)) {
        setIsCountryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const decodeJwtResponse = (token: string) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  };

  useEffect(() => {
    if (initializedRef.current) return;
    const initializeGoogle = () => {
        if (!(window as any).google || !GOOGLE_CLIENT_ID) return;
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false
        });
        google.accounts.id.renderButton(
            document.getElementById("googleBtn"),
            { theme: "outline", size: "large", width: "350", shape: "pill" }
        );
        initializedRef.current = true;
    };

    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.body.appendChild(script);
  }, [GOOGLE_CLIENT_ID]);

  const handleCredentialResponse = (response: any) => {
    const payload = decodeJwtResponse(response.credential);
    setIsScanning(true);
    setTimeout(() => {
        onLogin({ email: payload.email, name: payload.name, picture: payload.picture });
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsScanning(true);

    const cleanNumber = formData.whatsapp.replace(/\D/g, '');
    const fullWhatsapp = `${selectedCountry.code}${cleanNumber}`;

    try {
      const endpoint = isLoginView ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, whatsapp: fullWhatsapp })
      });

      const data = await response.json();

      if (response.ok) {
        onLogin({
          id: data.userId,
          name: data.name || formData.name,
          email: formData.email,
          document: data.document || formData.document,
          whatsapp: data.whatsapp || fullWhatsapp,
          picture: data.picture || `https://ui-avatars.com/api/?name=${formData.name || 'User'}&background=10b981&color=fff`
        });
      } else {
        setError(data.error || 'Erro na autenticação');
        setIsScanning(false);
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
      setIsScanning(false);
    }
  };

  if (isScanning) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-black flex flex-col items-center justify-center z-50">
        <div className="relative w-72 h-72 flex items-center justify-center mb-8">
          <div className="absolute inset-0 bg-aysha-pink/20 rounded-full blur-[60px] animate-pulse"></div>
          <div className="relative z-10 w-24 h-24 bg-white dark:bg-black rounded-full flex items-center justify-center shadow-xl">
            <img src="https://i.postimg.cc/2SMRvvRN/aysha-ai-(4).png" alt="Logo" className="w-12 h-12 animate-bounce" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Autenticando</h2>
        <p className="text-gray-400 mt-2 font-mono text-[10px] tracking-[0.2em] uppercase">Sync: MySQL Remote DB</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-black relative overflow-hidden px-6">
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-aysha-pink/10 rounded-full blur-[100px]" />
      
      <div className="w-full max-w-[480px] bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-10 shadow-2xl z-10">
        <div className="text-center mb-10">
          <img src="https://i.postimg.cc/QdRwV31X/logo.png" alt="Aysha AI" className="h-8 mx-auto dark:hidden" />
          <img src="https://i.postimg.cc/Dzkpnc31/logo-branco.png" alt="Aysha AI" className="h-8 mx-auto hidden dark:block" />
          <p className="text-gray-400 mt-4 font-medium text-sm leading-relaxed">
            {isLoginView ? 'Gestão de boletos inteligente via WhatsApp' : 'Crie sua conta para automatizar sua vida financeira'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginView && (
            <>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  required
                  type="text" 
                  placeholder="Nome Completo" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full h-14 pl-12 pr-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl outline-none focus:border-aysha-pink text-sm transition-all text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 relative">
                <div className="relative w-[130px] shrink-0" ref={countryMenuRef}>
                  <div 
                    onClick={() => setIsCountryMenuOpen(!isCountryMenuOpen)}
                    className="w-full h-14 px-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl flex items-center justify-between cursor-pointer hover:border-aysha-pink transition-colors text-gray-900 dark:text-white"
                  >
                    <span className="text-lg flex items-center gap-2">
                       {selectedCountry.flag} <span className="text-sm font-bold text-gray-900 dark:text-white">+{selectedCountry.code}</span>
                    </span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${isCountryMenuOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {isCountryMenuOpen && (
                    <div className="absolute top-full left-0 mt-2 w-[220px] bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl z-[100] max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-2">
                      {sortedCountries.map((c) => (
                        <div 
                          key={`${c.code}-${c.name}`}
                          onClick={() => {
                            setSelectedCountry(c);
                            setIsCountryMenuOpen(false);
                          }}
                          className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/10 cursor-pointer transition-colors ${selectedCountry.code === c.code ? 'bg-aysha-pink/10 text-aysha-pink' : 'text-gray-700 dark:text-gray-200'}`}
                        >
                          <div className="flex items-center gap-3">
                             <span className="text-xl">{c.flag}</span>
                             <div className="flex flex-col">
                                <span className={`text-sm font-bold ${selectedCountry.code === c.code ? 'text-aysha-pink' : 'text-gray-900 dark:text-white'}`}>+{c.code}</span>
                                <span className="text-[10px] opacity-60 font-medium">{c.name}</span>
                             </div>
                          </div>
                          {selectedCountry.code === c.code && <Check size={14} className="text-aysha-pink" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative flex-1">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    required
                    type="tel" 
                    placeholder="WhatsApp" 
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    className="w-full h-14 pl-12 pr-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl outline-none focus:border-aysha-pink text-sm transition-all text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  required
                  type="text" 
                  placeholder="CPF ou CNPJ" 
                  value={formData.document}
                  onChange={(e) => setFormData({...formData, document: e.target.value})}
                  className="w-full h-14 pl-12 pr-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl outline-none focus:border-aysha-pink text-sm transition-all text-gray-900 dark:text-white"
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              required
              type="email" 
              placeholder="E-mail" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full h-14 pl-12 pr-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl outline-none focus:border-aysha-pink text-sm transition-all text-gray-900 dark:text-white"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              required
              type="password" 
              placeholder="Senha" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full h-14 pl-12 pr-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl outline-none focus:border-aysha-pink text-sm transition-all text-gray-900 dark:text-white"
            />
          </div>

          {error && <p className="text-xs text-red-500 font-bold text-center py-2 bg-red-50 dark:bg-red-900/10 rounded-lg">{error}</p>}

          <button 
            type="submit"
            className="w-full h-14 bg-aysha-pink hover:bg-aysha-purple text-white rounded-2xl font-bold shadow-lg shadow-aysha-pink/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
          >
            {isLoginView ? 'Entrar' : 'Começar Agora'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="my-8 flex items-center gap-4 text-gray-300 dark:text-gray-700">
          <div className="h-[1px] flex-1 bg-current opacity-20"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest">OU ACESSE COM</span>
          <div className="h-[1px] flex-1 bg-current opacity-20"></div>
        </div>

        <div id="googleBtn" className="w-full flex justify-center h-12 overflow-hidden rounded-full"></div>

        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">
            {isLoginView ? 'Ainda não tem uma conta?' : 'Já possui cadastro?'}
            <button 
              onClick={() => { setIsLoginView(!isLoginView); setError(''); }}
              className="ml-2 text-aysha-pink font-bold hover:underline transition-all"
            >
              {isLoginView ? 'Cadastre-se grátis' : 'Faça login aqui'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
