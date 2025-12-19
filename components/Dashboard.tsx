
import React, { useMemo, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, AlertTriangle, Check, ArrowUpRight, Clock, LogOut } from 'lucide-react';
import { Invoice } from '../types';

interface DashboardProps {
    user: any;
    invoices: Invoice[];
    onAddInvoice: () => void;
    // Added 'all' to the union type to fix the type mismatch error on line 198
    onViewDetails: (filter?: 'paid' | 'due' | 'overdue' | 'all') => void;
    onSyncEmail: () => void;
    onOpenInvoice: (invoice: Invoice) => void;
    gmailConnected: boolean;
    onConnectGmail: () => void;
    onDisconnectGmail: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    user,
    invoices, 
    onAddInvoice, 
    onViewDetails, 
    onSyncEmail,
    onOpenInvoice,
    gmailConnected,
    onConnectGmail,
    onDisconnectGmail
}) => {
  const firstName = user?.name ? user.name.split(' ')[0] : 'Usuário';
  const daysLeft = user?.daysLeft || 0;
  
  const pendingInvoices = useMemo(() => {
    return invoices
        .filter(i => i.status === 'due' || i.status === 'overdue')
        .sort((a,b) => new Date(a.fullDate || '').getTime() - new Date(b.fullDate || '').getTime());
  }, [invoices]);

  const stats = useMemo(() => {
    const paid = invoices.filter(i => i.status === 'paid').length;
    const due = invoices.filter(i => i.status === 'due' || i.status === 'overdue').length;
    const total = invoices.length;
    return { total, due, paid };
  }, [invoices]);

  const today = new Date();
  const [calendarDate, setCalendarDate] = useState(new Date(2025, 11, 1)); 
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  
  const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay();

  const getStatusForDay = (day: number) => {
    const dateStr = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayInvoices = invoices.filter(inv => inv.fullDate === dateStr);
    if (dayInvoices.some(i => i.status === 'overdue')) return 'vencido';
    if (dayInvoices.some(i => i.status === 'due')) return 'aberto';
    if (dayInvoices.some(i => i.status === 'paid')) return 'pago';
    return null;
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {user?.subscriptionStatus === 'trial' && daysLeft <= 3 && (
        <div className="w-full bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-orange-800 dark:text-orange-300">Seu teste grátis termina em {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}.</p>
              <p className="text-xs text-orange-600 dark:text-orange-400">Assine agora para manter sua integração ativa.</p>
            </div>
          </div>
          <button className="px-5 py-2 bg-white dark:bg-orange-900/40 border border-orange-200 dark:border-orange-800 rounded-xl text-xs font-bold text-orange-700 dark:text-orange-300 hover:bg-orange-100 transition-colors">Assinar Plano Pro</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GREEN CARD AREA */}
        <div className="lg:col-span-2 bg-[#adff2f] rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-lg flex flex-col min-h-[520px]">
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none select-none overflow-hidden rotate-12 -translate-y-10 translate-x-10">
              <div className="text-[12rem] font-black leading-none flex flex-wrap gap-10 whitespace-nowrap">
                  {Array.from({length: 8}).map((_, i) => <span key={i}>Aysha</span>)}
              </div>
          </div>
          
          <div className="relative z-10 flex-1">
              <h1 className="text-4xl font-bold text-black mb-4 flex items-center gap-2">Olá, <span className="font-black">{firstName}</span> 👋</h1>
              <p className="text-black/80 text-lg font-medium max-w-xl leading-tight mb-2">
                  {user?.subscriptionStatus === 'trial' ? `Você está no período de teste.` : `Sua conta está ativa e sincronizada.`}
              </p>
              <p className="text-black text-lg mb-8">Você tem <span className="font-bold">{pendingInvoices.length} boletos</span> pendentes.</p>

              {/* GMAIL CONNECTION AREA */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                  <div className={`bg-white px-6 py-3 rounded-full flex items-center gap-2 shadow-sm border border-black/5`}>
                      <div className={`w-2 h-2 rounded-full ${gmailConnected ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></div>
                      <span className="text-black text-sm font-bold">
                          {gmailConnected ? 'Gmail conectado' : 'Gmail não conectado'}
                      </span>
                  </div>
                  
                  {gmailConnected ? (
                      <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDisconnectGmail(); }}
                          className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-bold shadow-md transition-all active:scale-95 flex items-center gap-2 relative z-50"
                      >
                          <LogOut size={16} />
                          Desconectar
                      </button>
                  ) : (
                      <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onConnectGmail(); }}
                          className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-full font-bold shadow-md transition-all active:scale-95 flex items-center gap-2 relative z-50"
                      >
                          <ArrowUpRight size={16} />
                          Conectar Gmail
                      </button>
                  )}
              </div>

              {/* INVOICES SLIDER */}
              <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
                  {pendingInvoices.length > 0 ? pendingInvoices.map((inv) => (
                      <div key={inv.id} onClick={() => onOpenInvoice(inv)} className="min-w-[280px] bg-[#f9fbe7] rounded-[2rem] p-6 shadow-sm border border-black/5 flex flex-col justify-between h-48 cursor-pointer hover:scale-[1.02] transition-transform">
                          <div className="flex justify-between items-start">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-xs border border-black/5 shadow-sm">{inv.company.substring(0,2).toUpperCase()}</div>
                              <div className={`w-2.5 h-2.5 rounded-full ${inv.status === 'overdue' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                          </div>
                          <div>
                              <h4 className="text-black font-bold text-sm truncate mb-1 uppercase tracking-tight">{inv.company}</h4>
                              <p className="text-black text-2xl font-black">R$ {inv.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          </div>
                          <p className={`text-[10px] font-bold uppercase ${inv.status === 'overdue' ? 'text-red-500' : 'text-gray-500'}`}>Vence: {inv.dueDate}</p>
                      </div>
                  )) : (
                    <div className="w-full bg-white/20 backdrop-blur-sm rounded-[2rem] p-8 border border-black/5 flex flex-col items-center justify-center text-black/60 italic font-medium">
                      Nenhum boleto pendente no momento.
                    </div>
                  )}
              </div>
          </div>

          
        </div>

        {/* CALENDAR MINI AREA */}
        <div className="bg-white dark:bg-[#111] rounded-[2.5rem] p-8 shadow-lg border border-gray-100 dark:border-white/5 flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-[#00c08b]">
                    <div className="w-6 h-6 border-2 border-current rounded-md flex items-center justify-center font-bold text-[10px]">31</div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{monthNames[calendarDate.getMonth()]} {calendarDate.getFullYear()}</h3>
                </div>
                <div className="flex gap-4 text-gray-400">
                    <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth()-1, 1))}><ChevronLeft size={20} /></button>
                    <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth()+1, 1))}><ChevronRight size={20} /></button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-y-6 text-center">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                    <div key={`${d}-${i}`} className="text-[10px] font-bold text-gray-400">{d}</div>
                ))}
                {Array.from({length: firstDay}).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({length: daysInMonth}).map((_, i) => {
                    const day = i + 1;
                    const status = getStatusForDay(day);
                    const isToday = day === today.getDate() && calendarDate.getMonth() === today.getMonth();
                    return (
                        <div key={day} className="relative flex flex-col items-center cursor-pointer group" onClick={() => {
                           const dateStr = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                           const inv = invoices.find(i => i.fullDate === dateStr);
                           if (inv) onOpenInvoice(inv);
                        }}>
                            <span className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-all group-hover:bg-gray-100 dark:group-hover:bg-white/10 ${isToday ? 'bg-[#00c08b] text-white shadow-lg shadow-[#00c08b]/40' : 'text-gray-600 dark:text-gray-300'}`}>{day}</span>
                            {status && (<div className={`w-1 h-1 rounded-full mt-1 ${status === 'pago' ? 'bg-green-500' : status === 'aberto' ? 'bg-orange-500' : 'bg-red-500'}`}></div>)}
                        </div>
                    );
                })}
            </div>

            <div className="mt-auto pt-8 flex justify-around border-t border-gray-50 dark:border-white/5">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Pago</div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Aberto</div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Vencido</div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-black p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm flex flex-col gap-4 cursor-pointer hover:scale-[1.02] transition-all" onClick={() => onViewDetails('all')}>
           <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600"><Check size={20} /></div>
           <div>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Boletos Processados</p>
             <div className="flex items-baseline gap-2">
               <span className="text-3xl font-black text-gray-900 dark:text-white">{stats.total}</span>
               <span className="text-gray-400 text-xs font-medium">total</span>
             </div>
           </div>
        </div>
        <div className="bg-white dark:bg-black p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm flex flex-col gap-4 cursor-pointer hover:scale-[1.02] transition-all" onClick={() => onViewDetails('due')}>
           <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600"><Clock size={20} /></div>
           <div>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">A Vencer</p>
             <div className="flex items-baseline gap-2">
               <span className="text-3xl font-black text-gray-900 dark:text-white">{stats.due}</span>
               <span className="text-gray-400 text-xs font-medium">pendentes</span>
             </div>
           </div>
        </div>
        <div className="bg-white dark:bg-black p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm flex flex-col gap-4 cursor-pointer hover:scale-[1.02] transition-all" onClick={() => onViewDetails('paid')}>
           <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600"><ArrowUpRight size={20} /></div>
           <div>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Pago</p>
             <div className="flex items-baseline gap-2">
               <span className="text-3xl font-black text-gray-900 dark:text-white">{stats.paid}</span>
               <span className="text-gray-400 text-xs font-medium">pagos</span>
             </div>
           </div>
        </div>
      </div>

      {/* Tabela de Boletos No Período */}
      <div className="bg-white dark:bg-black rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden mt-6">
        <div className="p-8 border-b border-gray-50 dark:border-white/5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Boletos no Período</h2>
            <button onClick={() => onViewDetails()} className="text-[#00c08b] text-sm font-bold hover:underline">Ver todos</button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50/50 dark:bg-white/5">
                    <tr className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <th className="px-8 py-4">Empresa</th>
                        <th className="px-8 py-4">Valor</th>
                        <th className="px-8 py-4">Vencimento</th>
                        <th className="px-8 py-4">Status</th>
                        <th className="px-8 py-4">Código</th>
                        <th className="px-8 py-4 text-right">Ação</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {invoices.slice(0, 8).map((inv) => (
                        <tr key={inv.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gray-50 dark:bg-white/10 rounded-lg flex items-center justify-center text-[10px] font-bold border border-gray-100">
                                    {inv.company.substring(0,2).toUpperCase()}
                                  </div>
                                  <span className="font-bold text-gray-900 dark:text-white text-sm">{inv.company}</span>
                                </div>
                            </td>
                            <td className="px-8 py-5 font-bold text-gray-900 dark:text-white text-sm">R$ {inv.value.toFixed(2)}</td>
                            <td className="px-8 py-5 text-gray-400 font-medium text-xs">{inv.dueDate}</td>
                            <td className="px-8 py-5">
                                <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase 
                                  ${inv.status === 'paid' ? 'bg-green-50 text-green-600' : inv.status === 'due' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>
                                    {inv.status === 'paid' ? 'Pago' : inv.status === 'due' ? 'Aberto' : 'Vencido'}
                                </span>
                            </td>
                            <td className="px-8 py-5 text-gray-300 font-mono text-[10px]">••• {inv.codeSuffix}</td>
                            <td className="px-8 py-5 text-right">
                                <button onClick={() => onOpenInvoice(inv)} className="text-gray-400 hover:text-[#00c08b] font-bold text-xs transition-colors">Ver detalhes</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
