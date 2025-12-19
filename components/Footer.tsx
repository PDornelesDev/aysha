import React from 'react';
import { Shield, FileText, HelpCircle, Heart, Star } from 'lucide-react';
import { ViewState } from '../types';

interface FooterProps {
  onNavigate: (view: ViewState) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full py-8 mt-auto border-t border-gray-200 dark:border-aysha-purple/20 bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
               <div className="w-8 h-8 flex items-center justify-center">
                  <img src="https://i.postimg.cc/2SMRvvRN/aysha-ai-(4).png" alt="Logo" className="w-full h-full object-contain" />
               </div>
               <span className="text-lg font-medium text-aysha-purple dark:text-white">
                 Aysha <span className="font-semibold text-aysha-pink">AI</span>
               </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Sua assistente inteligente para gestão financeira e pagamentos de boletos.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Produto</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <button onClick={() => onNavigate('features')} className="hover:text-aysha-pink transition-colors flex items-center gap-2">
                  <Star size={14} /> Funcionalidades
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('subscription')} className="hover:text-aysha-pink transition-colors">
                  Planos e Preços
                </button>
              </li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Suporte</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <button onClick={() => onNavigate('help')} className="hover:text-aysha-pink transition-colors flex items-center gap-2">
                  <HelpCircle size={14} /> Central de Ajuda
                </button>
              </li>
              <li>
                <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="hover:text-aysha-pink transition-colors">
                  Fale Conosco (WhatsApp)
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <button onClick={() => onNavigate('terms')} className="hover:text-aysha-pink transition-colors flex items-center gap-2">
                  <FileText size={14} /> Termos de Uso
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy')} className="hover:text-aysha-pink transition-colors flex items-center gap-2">
                  <Shield size={14} /> Política de Privacidade
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Aysha AI Tecnologia Ltda. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-1 text-sm text-gray-400">
            Feito com <Heart size={14} className="text-aysha-pink fill-current" /> no Brasil
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;