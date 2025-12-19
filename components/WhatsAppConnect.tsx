import React, { useState, useEffect } from 'react';
import { Smartphone, RefreshCw, CheckCircle, ArrowRight } from 'lucide-react';

const WhatsAppConnect: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);

  // Simulate connection after 5 seconds for demo purposes
  useEffect(() => {
    const timer = setTimeout(() => {
        setIsConnected(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (isConnected) {
    return (
        <div className="p-6 md:p-12 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-100px)] animate-in fade-in duration-700">
           <div className="w-full bg-white dark:bg-black border border-gray-200 dark:border-aysha-purple/30 rounded-[2rem] p-8 md:p-16 flex flex-col items-center text-center">
               <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-8">
                   <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                       <CheckCircle className="text-white w-8 h-8" strokeWidth={2.5} />
                   </div>
               </div>
               
               <h2 className="text-3xl font-medium text-gray-900 dark:text-white mb-4">
                   WhatsApp Conectado!
               </h2>
               <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 text-lg">
                   Seus boletos agora serão sincronizados automaticamente assim que chegarem no seu WhatsApp.
               </p>

               <div className="flex flex-col sm:flex-row gap-4">
                    <button className="px-8 py-3 bg-white border border-gray-200 dark:bg-white/5 dark:border-white/10 text-gray-900 dark:text-white rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                        Gerenciar conexão
                    </button>
               </div>
           </div>
        </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
      <div className="w-full bg-white dark:bg-black border border-gray-200 dark:border-aysha-purple/30 rounded-[2rem] p-8 md:p-16 flex flex-col items-center text-center">
        
        <div className="w-20 h-20 rounded-3xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-8">
          <Smartphone className="w-10 h-10 text-green-600 dark:text-green-400" strokeWidth={1.5} />
        </div>

        <h2 className="text-3xl md:text-4xl font-normal text-aysha-purple dark:text-white mb-4">
          Conectar WhatsApp
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-12 text-lg leading-relaxed">
          Aponte a câmera do seu celular para sincronizar seus boletos automaticamente.
        </p>

        {/* QR Code Container */}
        <div className="relative group">
          <div className="w-72 h-72 bg-white p-6 rounded-3xl border border-gray-100 dark:border-aysha-purple/50 flex items-center justify-center">
            {/* Mock QR */}
            <div className="w-full h-full bg-gray-900 pattern-grid-lg opacity-90 relative overflow-hidden rounded-xl">
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-1">
                     {Array.from({length: 36}).map((_, i) => (
                         <div key={i} className={`bg-black ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`}></div>
                     ))}
                </div>
                 {/* Corner markers for QR style */}
                 <div className="absolute top-0 left-0 w-12 h-12 border-4 border-black bg-transparent rounded-lg">
                    <div className="absolute top-2 left-2 w-5 h-5 bg-black rounded-sm"></div>
                 </div>
                 <div className="absolute top-0 right-0 w-12 h-12 border-4 border-black bg-transparent rounded-lg">
                    <div className="absolute top-2 left-2 w-5 h-5 bg-black rounded-sm"></div>
                 </div>
                 <div className="absolute bottom-0 left-0 w-12 h-12 border-4 border-black bg-transparent rounded-lg">
                    <div className="absolute top-2 left-2 w-5 h-5 bg-black rounded-sm"></div>
                 </div>
                 
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center p-1">
                        <div className="w-full h-full bg-green-500 rounded-full flex items-center justify-center">
                            <Smartphone size={24} className="text-white" />
                        </div>
                    </div>
                 </div>
            </div>
            
            {/* Scan animation line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-aysha-pink/80 shadow-[0_0_20px_rgba(253,127,214,0.6)] animate-[scan_2s_ease-in-out_infinite]"></div>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-aysha-pink text-white font-medium hover:bg-pink-400 transition-colors">
                <RefreshCw size={20} />
                Atualizar QR
            </button>
             <button className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-transparent border border-gray-200 dark:border-aysha-purple text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                Como funciona?
            </button>
        </div>

        <div className="mt-10 flex items-center gap-3 text-sm text-gray-400">
            <CheckCircle size={16} className="text-green-500" />
            <span>Criptografia de ponta a ponta</span>
        </div>

      </div>
    </div>
  );
};

export default WhatsAppConnect;