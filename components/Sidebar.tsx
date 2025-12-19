
import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Settings, 
  MessageCircle, 
  CalendarDays,
  CreditCard,
  Lock
} from 'lucide-react';
import { SidebarItem, ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  isOpen: boolean; 
  isExpanded: boolean; 
  onToggleExpand: () => void;
  whatsappConnected: boolean;
  isBlocked?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onChangeView, 
  onOpenSettings, 
  isOpen, 
  isExpanded,
  whatsappConnected,
  isBlocked = false
}) => {
  
  const menuItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={22} strokeWidth={1.5} /> },
    { id: 'calendar', label: 'Calendário', icon: <CalendarDays size={22} strokeWidth={1.5} /> },
    { id: 'invoices', label: 'Meus Boletos', icon: <FileText size={22} strokeWidth={1.5} /> },
    { id: 'paid', label: 'Boletos Pagos', icon: <CheckCircle2 size={22} strokeWidth={1.5} /> },
    { id: 'due_soon', label: 'Boletos a Vencer', icon: <Clock size={22} strokeWidth={1.5} /> },
    { id: 'subscription', label: 'Assinatura', icon: <CreditCard size={22} strokeWidth={1.5} /> },
  ];

  const showText = isExpanded || isOpen;

  return (
    <aside className={`
      fixed left-0 top-0 h-full bg-white dark:bg-black dark:border-r dark:border-aysha-purple/20 border-r border-gray-100
      transition-all duration-300 z-50 flex flex-col
      ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0'}
      ${isExpanded ? 'lg:w-64' : 'lg:w-24'}
    `}>
      <div className={`
        h-24 flex items-center border-b border-gray-50 dark:border-aysha-purple/10 transition-all duration-300 overflow-hidden
        ${showText ? 'justify-start px-8' : 'justify-center px-0'}
      `}>
        <div className={`
          w-10 h-10 flex items-center justify-center shrink-0 transition-all duration-300
          ${showText ? 'mr-4' : 'mr-0'}
        `}>
          <img 
            src="https://i.postimg.cc/2SMRvvRN/aysha-ai-(4).png" 
            alt="Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <span className={`
          text-xl font-medium text-aysha-purple dark:text-white whitespace-nowrap transition-opacity duration-300
          ${showText ? 'opacity-100 block' : 'opacity-0 hidden'}
        `}>
          Aysha <span className="font-semibold text-aysha-pink">AI</span>
        </span>
      </div>

      <nav className="flex-1 py-8 px-4 space-y-3 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => {
          const isItemLocked = isBlocked && item.id !== 'subscription';
          
          return (
            <button
              key={item.id}
              disabled={isItemLocked}
              onClick={() => onChangeView(item.id as ViewState)}
              className={`
                w-full flex items-center h-14 rounded-2xl transition-all duration-200 group
                ${currentView === item.id 
                  ? 'bg-gray-50 dark:bg-white/5 text-aysha-purple dark:text-aysha-pink' 
                  : isItemLocked 
                    ? 'opacity-30 cursor-not-allowed' 
                    : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-aysha-purple/10 hover:text-aysha-purple dark:hover:text-white'}
                ${showText ? 'px-4 justify-start' : 'px-0 justify-center'}
              `}
              title={item.label}
            >
              <span className={`shrink-0 flex items-center justify-center`}>
                {isItemLocked ? <Lock size={20} className="text-gray-300" /> : item.icon}
              </span>
              <span className={`
                ml-4 font-medium text-sm whitespace-nowrap transition-all duration-300 origin-left
                ${showText ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}
              `}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      
    </aside>
  );
};

export default Sidebar;
