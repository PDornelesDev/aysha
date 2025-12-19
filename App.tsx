
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import InvoiceList from './components/InvoiceList';
import WhatsAppConnect from './components/WhatsAppConnect';
import CalendarView from './components/CalendarView';
import SubscriptionView from './components/SubscriptionView';
import ProfileView from './components/ProfileView'; 
import Modal from './components/Modal';
import SettingsModal from './components/SettingsModal';
import Footer from './components/Footer'; 
import { Invoice, ViewState, ModalType, DateFilterType } from './types';
import { ShieldAlert, CheckCircle, Loader2, Database, Upload, FileText, Plus, Mail, Copy, Check, ExternalLink } from 'lucide-react';
import { dbService } from './services/db';

const App: React.FC = () => {
  const [user, setUser] = useState<{ 
    id: number; 
    name: string; 
    email: string; 
    picture: string; 
    subscriptionStatus: string; 
    daysLeft: number;
    gmailLastSync: string | null; 
  } | null>(() => {
    const savedUser = localStorage.getItem('aysha_session');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('aysha_theme');
    return (savedTheme as 'light' | 'dark') || 'light';
  }); 
  
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
  setCopied(false);
}, [selectedInvoice]);


  
  const barcode =
  selectedInvoice?.barcode ||
  '34191.79001 01043.510047 91020.150008 5 95640000012000';


  
  
  
  const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch (err) {
    console.error("Erro ao copiar:", err);
  }
};



  const handleLoginSuccess = useCallback(async (googleProfile: any) => {
    setIsSyncing(true);
    try {
      const dbData = await dbService.syncUserDetailed(googleProfile);
      if (dbData) {
        const userData = { 
          id: dbData.userId, 
          name: googleProfile.name, 
          email: googleProfile.email, 
          whatsapp: dbData.whatsapp || '',
          cpf: dbData.cpf || '',
          cnpj: dbData.cnpj || '',
          picture: googleProfile.picture,
          subscriptionStatus: dbData.subscriptionStatus,
          daysLeft: dbData.daysLeft,
          gmailLastSync: dbData.gmailLastSync
        };
        localStorage.setItem('aysha_session', JSON.stringify(userData));
        setUser(userData);
        return userData;
      }
    } catch (err) {
      console.error("Erro no login:", err);
    } finally {
      setIsSyncing(false);
    }
    return null;
  }, []);

 useEffect(() => {
  const handleMessage = async (event: MessageEvent) => {
    if (event.data.type === 'GMAIL_CONNECTED_SUCCESS' && user) {
      await handleLoginSuccess({
        email: user.email,
        name: user.name,
        picture: user.picture
      });
      setActiveModal(null);
    }
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, [user, handleLoginSuccess]);

  
  useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const hasSuccess = urlParams.get('checkout_success') === 'true';
  const sessionId = urlParams.get('session_id');

  if (!hasSuccess || !sessionId || !user || user.subscriptionStatus === 'active') return;

  setVerifyingPayment(true);
  setShowPaymentSuccess(true);

  const cleanUrl = window.location.origin + window.location.pathname;
  window.history.replaceState({}, '', cleanUrl);

  const startSyncProcess = async () => {
    await dbService.verifySession(sessionId);

    let attempts = 0;
    const maxAttempts = 10;

    const poll = async () => {
      attempts++;

      const updatedUser = await handleLoginSuccess({
        email: user.email,
        name: user.name,
        picture: user.picture
      });

      if (updatedUser?.subscriptionStatus === 'active') {
        setVerifyingPayment(false);
        setCurrentView('dashboard');
        return;
      }

      if (attempts < maxAttempts) {
        setTimeout(poll, 2500);
      } else {
        setVerifyingPayment(false);
      }
    };

    poll();
  };

  startSyncProcess();

  const timer = setTimeout(() => setShowPaymentSuccess(false), 10000);
  return () => clearTimeout(timer);
}, [user, handleLoginSuccess]);


  const handleConnectGmail = () => setActiveModal('gmail_connect');

  const triggerGmailAuth = () => {
    if (!user) return;
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const API_BASE_URL = isLocal ? 'http://localhost:3001/api' : 'https://api.ayshaia.com/api';
    const width = 550;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(`${API_BASE_URL}/auth/gmail/connect?userId=${user.id}`, 'Conectar Gmail', `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`);
  };

  const handleDisconnectGmail = async () => {
    if (!user) return;
    if (!confirm("Deseja realmente desconectar seu Gmail?")) return;
    setIsSyncing(true);
    try {
      await dbService.disconnectGmail(user.id);
      const updatedUser = { ...user, gmailLastSync: null };
      localStorage.setItem('aysha_session', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) { console.error(error); } finally { setIsSyncing(false); }
  };
  
  const handleMarkAsPaid = async (id: string) => {
  setIsSyncing(true);

  try {
    const success = await dbService.updateInvoiceStatus(id, 'paid');

    if (success) {
      await loadInvoices(); // ⚠️ use loadInvoices, não loadData
    }
  } catch (error) {
    console.error("Erro ao marcar boleto como pago:", error);
    alert("Erro ao marcar boleto como pago.");
  } finally {
    setIsSyncing(false);       // 🔴 GARANTIDO
    setSelectedInvoice(null); // 🔴 GARANTIDO
  }
};


  const isAccountBlocked = useMemo(() => {
    if (!user) return false;
    return !['active', 'trial'].includes(user.subscriptionStatus);
  }, [user]);

  const isGmailConnected = useMemo(() => {
  return Boolean(user?.gmailLastSync);
}, [user?.gmailLastSync]);


  const loadInvoices = async () => {
    if (!user || isAccountBlocked) return;
    try {
      const data = await dbService.getAllInvoices(user.id);
      setInvoices(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { if (user) loadInvoices(); }, [user?.id, user?.subscriptionStatus]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false); 
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('month');
  
  const filteredInvoices = useMemo(() => {
  if (!searchTerm.trim()) return invoices;

  const term = searchTerm.toLowerCase();

  return invoices.filter((invoice) =>
    invoice.company.toLowerCase().includes(term) ||
    invoice.category?.toLowerCase().includes(term)
  );
}, [invoices, searchTerm]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('aysha_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const handleLogout = () => { localStorage.removeItem('aysha_session'); setUser(null); };

  const onOpenInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setActiveModal('invoice_details');
  };

  const renderCurrentView = () => {
    if (isAccountBlocked) {
      return <SubscriptionView user={user} daysLeft={user?.daysLeft || 0} onRefreshStatus={() => user && handleLoginSuccess({email: user.email, name: user.name, picture: user.picture})} />;
    }
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            invoices={filteredInvoices} 
            onAddInvoice={() => setActiveModal('add_invoice')} 
            onViewDetails={(filter) => {
               if (filter === 'paid') setCurrentView('paid');
               else if (filter === 'due') setCurrentView('due_soon');
               else setCurrentView('invoices');
            }} 
            onSyncEmail={loadInvoices} 
            onOpenInvoice={onOpenInvoice} 
            gmailConnected={isGmailConnected} 
            onConnectGmail={handleConnectGmail}
            onDisconnectGmail={handleDisconnectGmail}
          />
        );
      case 'invoices': return <InvoiceList title="Meus Boletos" invoices={filteredInvoices} onBack={() => setCurrentView('dashboard')} onOpenInvoice={onOpenInvoice} />;
      case 'paid': return <InvoiceList title="Boletos Pagos" invoices={filteredInvoices} filter="paid" onBack={() => setCurrentView('dashboard')} onOpenInvoice={onOpenInvoice} />;
      case 'due_soon': return <InvoiceList title="Boletos a Vencer" invoices={filteredInvoices} filter="due" onBack={() => setCurrentView('dashboard')} onOpenInvoice={onOpenInvoice} />;
      case 'calendar': return <CalendarView invoices={filteredInvoices} onOpenInvoice={onOpenInvoice} />;
      case 'whatsapp': return <WhatsAppConnect />;
      case 'subscription': return <SubscriptionView user={user} daysLeft={user?.daysLeft || 0} onRefreshStatus={() => {}} />;
      case 'profile': return <ProfileView user={user} />;
      default: return null;
    }
  };

  if (!user) return <Login onLogin={handleLoginSuccess} />;

  return (
    <div className={`min-h-screen text-gray-900 dark:text-white transition-colors duration-300 font-sans ${theme === 'light' ? 'bg-[#fcfdfe]' : 'bg-black'}`}>
    {showPaymentSuccess && (
  <div className="fixed top-6 right-6 z-[200] bg-green-600 text-white px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-4 border-2 border-white/20 backdrop-blur-md">
    <div className="bg-white/20 p-2 rounded-full">
      {verifyingPayment ? (
        <Loader2 size={28} className="animate-spin" />
      ) : (
        <CheckCircle size={28} />
      )}
    </div>
    <div>
      <p className="font-bold text-base">
        {verifyingPayment ? 'Verificando pagamento...' : 'Pagamento confirmado!'}
      </p>
      <p className="text-xs opacity-90">
        {verifyingPayment
          ? 'Atualizando sua assinatura no banco de dados.'
          : 'Sua conta já está liberada.'}
      </p>
    </div>
  </div>
)}

      <Sidebar currentView={currentView} onChangeView={(v) => { if (isAccountBlocked && v !== 'subscription') return; setCurrentView(v); setIsSidebarOpen(false); }} onOpenSettings={() => setActiveModal('settings')} onLogout={handleLogout} isOpen={isSidebarOpen} isExpanded={isSidebarExpanded} onToggleExpand={() => setIsSidebarExpanded(!isSidebarExpanded)} whatsappConnected={true} isBlocked={isAccountBlocked} />
      
      <div className={`transition-all duration-300 min-h-screen flex flex-col ${isSidebarExpanded ? 'lg:ml-64' : 'lg:ml-24'}`}>
        <Header user={user} title={currentView} theme={theme} toggleTheme={toggleTheme} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} onLogout={handleLogout} onOpenSettings={() => setActiveModal('settings')} isSidebarExpanded={isSidebarExpanded} toggleDesktopSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)} onNavigateToProfile={() => !isAccountBlocked && setCurrentView('profile')} searchTerm={searchTerm} onSearchChange={setSearchTerm} dateFilter={dateFilter} onDateFilterChange={setDateFilter} />
        <main className="flex-1 overflow-y-auto">
            {isAccountBlocked && (<div className="bg-red-600 text-white text-center py-3 text-xs font-bold flex items-center justify-center gap-3 shadow-lg"><ShieldAlert size={16} /> ACESSO RESTRITO </div>)}
            {renderCurrentView()}
            <Footer onNavigate={(v) => !isAccountBlocked && setCurrentView(v)} />
        </main>
      </div>

      {/* MODAL DETALHES DO BOLETO */}
      {activeModal === 'invoice_details' && selectedInvoice && (
        <Modal isOpen={true} onClose={() => setActiveModal(null)} title="Detalhes do Boleto">
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
               <div className="w-12 h-12 bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-xl flex items-center justify-center font-bold text-aysha-pink">
                  {selectedInvoice.company.substring(0,2).toUpperCase()}
               </div>
               <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{selectedInvoice.company}</h4>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">ID: #{selectedInvoice.id}</p>
               </div>
               <div className="ml-auto text-right">
                  <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase ${
                    selectedInvoice.status === 'paid' ? 'bg-green-100 text-green-700' : 
                    selectedInvoice.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {selectedInvoice.status === 'paid' ? 'Pago' : selectedInvoice.status === 'overdue' ? 'Vencido' : 'Aberto'}
                  </span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Valor</p>
                  <p className="text-xl font-black text-gray-900 dark:text-white">R$ {selectedInvoice.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
               </div>
               <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Vencimento</p>
                  <p className="text-xl font-black text-gray-900 dark:text-white">{selectedInvoice.dueDate}</p>
               </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
               <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Código de Barras</p>
               <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-mono text-gray-600 dark:text-gray-300 break-all leading-tight">
                    {selectedInvoice.barcode }
                  </p>
                  <button
  onClick={() => copyToClipboard(barcode)}
  className="p-2 bg-aysha-pink text-white rounded-lg transition-colors"
>
  {copied ? <Check size={16} /> : <Copy size={16} />}
</button>

               </div>
            </div>

            <div className="flex gap-3">
  {selectedInvoice.status !== 'paid' && (
    <button
      onClick={() => handleMarkAsPaid(selectedInvoice.id)}
      className="flex-1 h-14 bg-black dark:bg-white dark:text-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
    >
      <Check size={18} /> Marcar Pago
    </button>
  )}

  <button className="w-14 h-14 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl flex items-center justify-center hover:bg-gray-100 transition-all">
    <ExternalLink size={20} />
  </button>
</div>

          </div>
        </Modal>
      )}

      {activeModal === 'gmail_connect' && (
  <Modal
    isOpen={true}
    onClose={() => setActiveModal(null)}
    title={isGmailConnected ? 'Gmail Conectado' : 'Sincronizar Gmail'}
  >
    <div className="text-center space-y-6 py-4">
      <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg"
          alt="Gmail"
          className="w-10 h-10"
        />
      </div>

      <div>
        <h4 className="text-lg font-bold text-gray-900 dark:text-white">
          {isGmailConnected ? 'Conta conectada' : 'Automação Inteligente'}
        </h4>
        <p className="text-sm text-gray-400 mt-2 leading-relaxed">
          {isGmailConnected
            ? 'Seu Gmail já está conectado e sincronizando boletos automaticamente.'
            : 'Nossa IA buscará boletos automaticamente em sua caixa de entrada.'}
        </p>
      </div>

      {/* BOTÃO CONECTAR */}
      {!isGmailConnected && (
        <button
          onClick={() => {
            triggerGmailAuth();
            setActiveModal(null);
          }}
          className="w-full h-14 bg-black dark:bg-white dark:text-black text-white rounded-2xl font-bold flex items-center justify-center gap-3"
        >
          <Mail size={18} /> Conectar com Google
        </button>
      )}

      {/* BOTÃO DESCONECTAR */}
      {isGmailConnected && (
        <button
          onClick={async () => {
            await handleDisconnectGmail();
            setActiveModal(null);
          }}
          className="w-full h-14 bg-red-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-red-700 transition-colors"
        >
          <ExternalLink size={18} /> Desconectar Gmail
        </button>
      )}
    </div>
  </Modal>
)}


      {(isSyncing || verifyingPayment) && (
        <div className="fixed inset-0 z-[300] bg-white/60 dark:bg-black/60 backdrop-blur-md flex flex-col items-center justify-center">
          <Loader2 size={40} className="text-aysha-pink animate-spin mb-4" />
          <p className="text-gray-900 dark:text-white font-bold uppercase text-xs tracking-widest">
  {verifyingPayment ? 'Atualizando assinatura...' : 'Sincronizando...'}
</p>
        </div>
      )}
    </div>
  );
};

export default App;
