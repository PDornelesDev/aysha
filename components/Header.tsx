
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Moon, Sun, Menu, User, Settings, LogOut, ChevronsLeft, ChevronsRight, Search, Calendar, ChevronDown, Check, AlertCircle, Info, X } from 'lucide-react';
import { DateFilterType } from '../types';

interface HeaderProps {
  user: any;
  title: string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  toggleSidebar: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  isSidebarExpanded: boolean;
  toggleDesktopSidebar: () => void;
  onNavigateToProfile: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  dateFilter: DateFilterType;
  onDateFilterChange: (filter: DateFilterType) => void;
}

const Header: React.FC<HeaderProps> = ({ 
    user,
    title,
    theme, 
    toggleTheme, 
    toggleSidebar, 
    onLogout, 
    onOpenSettings,
    isSidebarExpanded,
    toggleDesktopSidebar,
    onNavigateToProfile,
    searchTerm,
    onSearchChange,
    dateFilter,
    onDateFilterChange
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getFilterLabel = () => {
    switch(dateFilter) {
      case 'today': return 'Hoje';
      case 'week': return 'Esta Semana';
      case 'month': return 'Este Mês';
      case 'all': return 'Todo Período';
      default: return 'Filtro';
    }
  };

  const notifications = [
    { id: 1, type: 'success', title: 'Boletos Sincronizados', message: 'Dados carregados do MySQL.', time: 'agora' },
  ];

  return (
    <header className="h-24 bg-white dark:bg-black border-b border-gray-100 dark:border-aysha-purple/20 flex items-center justify-between px-8 sticky top-0 z-40 transition-colors duration-300">
      
      <div className="flex items-center gap-4 shrink-0">
        <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl">
          <Menu size={24} />
        </button>

        <button 
            onClick={toggleDesktopSidebar} 
            className="hidden lg:flex p-2 text-gray-400 hover:text-aysha-pink dark:text-gray-500 dark:hover:text-aysha-pink hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors mr-3"
            title={isSidebarExpanded ? "Recolher menu" : "Expandir menu"}
        >
             {isSidebarExpanded ? <ChevronsLeft size={22} strokeWidth={1.5} /> : <ChevronsRight size={22} strokeWidth={1.5} />}
        </button>

        <h2 className="text-xl font-normal text-gray-900 dark:text-white hidden xl:block whitespace-nowrap">
          {title}
        </h2>
      </div>

      <div className="flex-1 max-w-2xl mx-4 lg:mx-12 flex items-center gap-3">
        <div className="flex-1 relative group hidden lg:block">
           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-aysha-pink transition-colors">
              <Search size={18} />
           </div>
           <input 
              type="text" 
              placeholder="Buscar boletos..." 
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl outline-none focus:border-aysha-pink dark:focus:border-aysha-pink text-sm text-gray-700 dark:text-gray-200 transition-colors"
           />
        </div>

        <button 
           onClick={() => setIsSearchModalOpen(true)}
           className="lg:hidden w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-300"
        >
            <Search size={20} />
        </button>

        <div className="relative shrink-0 hidden sm:block" ref={filterRef}>
           <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="h-12 px-4 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-aysha-pink dark:hover:border-aysha-pink transition-colors"
           >
              <Calendar size={16} className="text-aysha-pink" />
              <span className="hidden sm:inline">{getFilterLabel()}</span>
              <ChevronDown size={14} className="text-gray-400" />
           </button>
           
           {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-black border border-gray-200 dark:border-aysha-purple/30 rounded-xl shadow-none p-1 z-50 animate-in fade-in slide-in-from-top-2">
                 {(['today', 'week', 'month', 'all'] as DateFilterType[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        onDateFilterChange(f);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between
                        ${dateFilter === f 
                          ? 'bg-aysha-pink/10 text-aysha-pink' 
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}
                      `}
                    >
                      {f === 'today' && 'Hoje'}
                      {f === 'week' && 'Esta Semana'}
                      {f === 'month' && 'Este Mês'}
                      {f === 'all' && 'Todo Período'}
                      {dateFilter === f && <div className="w-1.5 h-1.5 rounded-full bg-aysha-pink"></div>}
                    </button>
                 ))}
              </div>
           )}
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center bg-transparent border border-gray-100 dark:border-white/10 text-gray-500 dark:text-aysha-pink hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          {theme === 'light' ? <Moon size={20} strokeWidth={1.5} /> : <Sun size={20} strokeWidth={1.5} />}
        </button>

        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center bg-transparent border border-gray-100 dark:border-white/10 transition-colors
              ${isNotificationsOpen ? 'bg-gray-50 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5'}
            `}
          >
            <Bell size={20} strokeWidth={1.5} />
          </button>
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-aysha-pink rounded-full border-2 border-white dark:border-black pointer-events-none"></span>
        </div>

        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-4 pl-4 lg:pl-6 border-l border-gray-100 dark:border-gray-800 focus:outline-none"
          >
            <div className="text-right hidden xl:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">{user?.name || 'Usuário'}</p>
              <p className="text-[10px] text-gray-400">ID: #{user?.id}</p>
            </div>
            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full p-[2px] transition-all duration-200 ${isProfileMenuOpen ? 'bg-aysha-pink' : 'bg-gradient-to-tr from-aysha-purple to-aysha-pink'}`}>
              <img 
                src={user?.picture || 'https://picsum.photos/100/100'} 
                alt="Avatar" 
                className="w-full h-full rounded-full object-cover border-2 border-white dark:border-black"
              />
            </div>
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-4 w-64 bg-white dark:bg-black border border-gray-200 dark:border-aysha-purple/30 rounded-2xl shadow-none p-2 animate-in fade-in slide-in-from-top-2 z-50">
               <div className="px-4 py-3 mb-2 border-b border-gray-100 dark:border-white/10">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
               </div>
               
               <div className="space-y-1">
                 <button 
                  onClick={() => { onNavigateToProfile(); setIsProfileMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-300"
                 >
                    <User size={18} />
                    <span className="text-sm font-medium">Meus Dados</span>
                 </button>

                 

                 <div className="border-t border-gray-100 dark:border-white/10 my-1"></div>

                 <button 
                  onClick={onLogout}
                  className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-red-600 dark:text-red-400"
                 >
                    <LogOut size={18} />
                    <span className="text-sm font-medium">Sair</span>
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
