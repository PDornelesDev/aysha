
import React, { useState, useEffect } from 'react';
import { CheckCircle, Zap, CreditCard, AlertTriangle, Smartphone, FileText, Loader2, X, RefreshCw, Calendar } from 'lucide-react';
import { dbService } from '../services/db';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY || "");

interface SubscriptionViewProps {
  user: { id: number; email: string; name: string; subscriptionStatus: string } | null;
  daysLeft: number;
  onRefreshStatus: () => void;
}

const SubscriptionView: React.FC<SubscriptionViewProps> = ({ user, daysLeft, onRefreshStatus }) => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadPaymentHistory();
    }
  }, [user?.id, user?.subscriptionStatus]);

  const loadPaymentHistory = async () => {
    if (!user) return;
    const history = await dbService.getPaymentHistory(user.id);
    setPayments(history);
  };

  const handleSubscribe = async () => {
    if (!user) return;
    setIsRedirecting(true);
    try {
      const secret = await dbService.createStripeCheckout(user.id, user.email);
      if (secret) {
        setClientSecret(secret);
      } else {
        alert("Erro ao iniciar o checkout. Verifique sua conexão ou tente mais tarde.");
      }
    } catch (err) {
      console.error("Subscription Error:", err);
    } finally {
      setIsRedirecting(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshStatus();
    await loadPaymentHistory();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const options = { clientSecret };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto min-h-screen space-y-8 pb-20 animate-in fade-in duration-500">
      
      {clientSecret && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setClientSecret(null)}></div>
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
             <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pagamento Seguro</h3>
                <button 
                  onClick={() => setClientSecret(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 md:p-8">
                {stripePromise && (
                  <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
                    <EmbeddedCheckout />
                  </EmbeddedCheckoutProvider>
                )}
             </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-normal text-gray-900 dark:text-white">Assinatura & Plano</h2>
           <p className="text-gray-500 dark:text-gray-400">Automatize sua vida financeira com IA</p>
        </div>
        
        {user?.subscriptionStatus !== 'active' && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                {isRefreshing ? 'Checando...' : 'Já paguei? Atualizar status'}
              </button>
              
              {daysLeft < 7 && (
                  <div className="px-4 py-2 bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/30 rounded-xl flex items-center gap-3 text-orange-700 dark:text-orange-400">
                      <AlertTriangle size={18} />
                      <span className="text-sm font-medium">Conta expira em {daysLeft} dias</span>
                  </div>
              )}
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-2 bg-white dark:bg-black border border-gray-200 dark:border-aysha-purple/30 rounded-[2rem] p-8 relative overflow-hidden shadow-sm">
             <div className="absolute top-0 right-0 p-8 opacity-5 text-aysha-pink">
                 <Zap size={120} />
             </div>
             
             <div className="relative z-10">
                 <span className="px-3 py-1 bg-aysha-pink/10 text-aysha-pink text-[10px] font-bold uppercase tracking-widest rounded-full mb-4 inline-block">Plano Pro AI</span>
                 <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Aysha Total</h3>
                 <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                     Sincronização ilimitada via WhatsApp, leitura de Gmail via IA e dashboard premium.
                 </p>

                 <div className="flex items-baseline gap-1 mb-8">
                     <span className="text-5xl font-black text-gray-900 dark:text-white">R$ 29,90</span>
                     <span className="text-gray-400 font-medium">/mês</span>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                     <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                         <CheckCircle size={18} className="text-aysha-pink" />
                         <span>WhatsApp Ilimitado</span>
                     </div>
                     <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                         <CheckCircle size={18} className="text-aysha-pink" />
                         <span>Leitura de Gmail com IA</span>
                     </div>
                     <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                         <CheckCircle size={18} className="text-aysha-pink" />
                         <span>Pagamento via PIX e Cartão</span>
                     </div>
                     <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                         <CheckCircle size={18} className="text-aysha-pink" />
                         <span>Relatórios Mensais</span>
                     </div>
                 </div>
                 
                 <div className="flex flex-wrap gap-4">
                    <button 
                        onClick={handleSubscribe}
                        disabled={isRedirecting || user?.subscriptionStatus === 'active'}
                        className="px-10 py-4 bg-aysha-pink hover:bg-aysha-purple text-white rounded-2xl font-bold shadow-lg shadow-aysha-pink/20 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50"
                    >
                        {user?.subscriptionStatus === 'active' ? (
                          <>
                            <CheckCircle size={20} />
                            Plano Ativo
                          </>
                        ) : isRedirecting ? (
                          <>
                            <Loader2 size={20} className="animate-spin" />
                            Preparando...
                          </>
                        ) : (
                          <>
                            <CreditCard size={20} />
                            Assinar Agora
                          </>
                        )}
                    </button>
                 </div>
             </div>
         </div>

         <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[2rem] p-8 flex flex-col justify-between">
            <div>
                <div className="w-12 h-12 bg-white dark:bg-black rounded-2xl flex items-center justify-center text-aysha-pink mb-6 shadow-sm">
                    <Smartphone size={24} strokeWidth={1.5} />
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Checkout Seguro</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                  Utilizamos a tecnologia do Stripe para garantir que seus dados de pagamento estejam sempre protegidos.
                </p>
                
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-white dark:bg-black border border-gray-100 dark:border-white/5 rounded-2xl">
                        <div className="w-8 h-8 bg-aysha-pink/10 rounded-lg flex items-center justify-center text-aysha-pink font-bold text-[10px]">PIX</div>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Aceitamos PIX</span>
                    </div>
                </div>
            </div>
         </div>
      </div>

      <div className="bg-white dark:bg-black border border-gray-200 dark:border-aysha-purple/30 rounded-[2rem] p-8 overflow-hidden shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <FileText size={20} className="text-aysha-pink" />
              Histórico de Faturamento
          </h3>
          
          {payments.length === 0 ? (
            <div className="text-center py-10">
                <p className="text-gray-400 text-sm font-medium">
                  {user?.subscriptionStatus === 'active' ? 'Carregando histórico...' : 'Inicie sua primeira assinatura para ver o histórico aqui.'}
                </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-white/5">
                        <th className="pb-4">Data</th>
                        <th className="pb-4">Método</th>
                        <th className="pb-4">Valor</th>
                        <th className="pb-4">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                     {payments.map((pay) => (
                        <tr key={pay.id} className="text-sm">
                           <td className="py-4 text-gray-600 dark:text-gray-300 flex items-center gap-2">
                             <Calendar size={14} className="text-gray-400" />
                             {new Date(pay.created_at).toLocaleDateString('pt-BR')}
                           </td>
                           <td className="py-4 text-gray-600 dark:text-gray-300 uppercase font-bold text-[10px]">
                              {pay.payment_method}
                           </td>
                           <td className="py-4 font-bold text-gray-900 dark:text-white">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: pay.currency }).format(pay.amount)}
                           </td>
                           <td className="py-4">
                              <span className="px-3 py-1 bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400 text-[10px] font-bold rounded-full uppercase">
                                 {pay.status === 'succeeded' ? 'Pago' : pay.status}
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          )}
      </div>
    </div>
  );
};

export default SubscriptionView;
