
import React, { useState, useMemo } from 'react';
import { Invoice } from '../types';
import { ArrowLeft, Search, Filter, ArrowUpDown, ChevronDown } from 'lucide-react';

interface InvoiceListProps {
  title: string;
  invoices: Invoice[];
  filter?: 'paid' | 'due' | 'overdue';
  onBack?: () => void;
  onOpenInvoice: (invoice: Invoice) => void;
}

type SortField = 'date' | 'value' | 'company';
type SortOrder = 'asc' | 'desc';

const InvoiceList: React.FC<InvoiceListProps> = ({ title, invoices, filter, onBack, onOpenInvoice }) => {
  const [localSearch, setLocalSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  // 1. Initial Filter (by View Type: Paid, Due, etc.)
  const baseInvoices = useMemo(() => {
    return filter 
      ? invoices.filter(inv => {
          if (filter === 'due') return inv.status === 'due' || inv.status === 'overdue';
          return inv.status === filter;
        })
      : invoices;
  }, [invoices, filter]);

  // 2. Local Search & Sorting
  const processedInvoices = useMemo(() => {
    let result = [...baseInvoices];

    // Search
    if (localSearch) {
      const term = localSearch.toLowerCase();
      result = result.filter(inv => 
        inv.company.toLowerCase().includes(term) ||
        inv.value.toString().includes(term) ||
        inv.codeSuffix.includes(term)
      );
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'value': comparison = a.value - b.value; break;
        case 'company': comparison = a.company.localeCompare(b.company); break;
        case 'date':
        default:
          comparison = new Date(a.fullDate || '').getTime() - new Date(b.fullDate || '').getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [baseInvoices, localSearch, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setIsSortMenuOpen(false);
  };

  const getSortLabel = () => {
    if (sortField === 'date') return 'Data';
    if (sortField === 'value') return 'Valor';
    if (sortField === 'company') return 'Nome';
    return 'Ordenar';
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto min-h-screen flex flex-col animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-5">
          {onBack && (
              <button onClick={onBack} className="p-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 rounded-2xl transition-all shadow-sm group" title="Voltar">
                  <ArrowLeft size={22} className="text-gray-400 group-hover:text-aysha-pink transition-colors"/>
              </button>
          )}
          <div>
            <h2 className="text-3xl font-medium text-gray-900 dark:text-white tracking-tight">
                {title}
            </h2>
            <p className="text-sm text-gray-400 mt-1 font-medium">
               {processedInvoices.length} {processedInvoices.length === 1 ? 'boleto encontrado' : 'boletos encontrados'}
            </p>
          </div>
        </div>

        {/* Toolbar: Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-aysha-pink transition-colors" />
             <input 
                type="text" 
                placeholder="Filtrar nesta lista..." 
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full sm:w-72 h-14 pl-12 pr-4 bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-2xl outline-none focus:border-aysha-pink text-sm text-gray-700 dark:text-gray-200 transition-all shadow-sm"
             />
          </div>

          <div className="relative">
             <button 
                onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                className="w-full sm:w-auto px-5 h-14 bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-2xl flex items-center justify-between gap-4 hover:border-aysha-pink transition-all text-sm font-bold text-gray-500 dark:text-gray-300 shadow-sm"
             >
                <div className="flex items-center gap-2">
                   <ArrowUpDown size={18} className="text-gray-400" />
                   <span>{getSortLabel()}</span>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isSortMenuOpen ? 'rotate-180' : ''}`} />
             </button>

             {isSortMenuOpen && (
               <>
                 <div className="fixed inset-0 z-10" onClick={() => setIsSortMenuOpen(false)}></div>
                 <div className="absolute right-0 top-full mt-3 w-56 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/10 rounded-[1.5rem] shadow-2xl p-2 z-20 animate-in fade-in zoom-in-95">
                    <button onClick={() => toggleSort('date')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex justify-between items-center ${sortField === 'date' ? 'bg-aysha-pink/5 text-aysha-pink' : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300'}`}>
                       <span>Data</span>
                       {sortField === 'date' && <div className="w-1.5 h-1.5 rounded-full bg-aysha-pink" />}
                    </button>
                    <button onClick={() => toggleSort('value')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex justify-between items-center ${sortField === 'value' ? 'bg-aysha-pink/5 text-aysha-pink' : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300'}`}>
                       <span>Valor</span>
                       {sortField === 'value' && <div className="w-1.5 h-1.5 rounded-full bg-aysha-pink" />}
                    </button>
                    <button onClick={() => toggleSort('company')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex justify-between items-center ${sortField === 'company' ? 'bg-aysha-pink/5 text-aysha-pink' : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300'}`}>
                       <span>Empresa</span>
                       {sortField === 'company' && <div className="w-1.5 h-1.5 rounded-full bg-aysha-pink" />}
                    </button>
                 </div>
               </>
             )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-black rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-2xl flex-1 transition-all">
        {processedInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
                <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                   <Filter size={32} className="text-gray-200" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nenhum registro encontrado</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
                   Parece que não há dados correspondentes para exibir aqui no momento.
                </p>
            </div>
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50/30 dark:bg-white/5 border-b border-gray-50 dark:border-white/5">
                    <tr>
                        <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Empresa</th>
                        <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Valor</th>
                        <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Vencimento</th>
                        <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Status</th>
                        <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] hidden sm:table-cell">Código</th>
                        <th className="px-8 py-6 text-right text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Ação</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                    {processedInvoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                            <td className="px-8 py-6 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="w-11 h-11 rounded-xl bg-white dark:bg-black border border-gray-100 dark:border-white/10 flex items-center justify-center text-[11px] font-bold text-gray-400 mr-4 shadow-sm group-hover:scale-105 transition-transform">
                                        {invoice.company.substring(0,2).toUpperCase()}
                                    </div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">{invoice.company}</div>
                                </div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white font-bold">R$ {invoice.value.toFixed(2)}</div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{invoice.dueDate}</div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                                <span className={`px-4 py-1 inline-flex text-[10px] font-bold uppercase tracking-wider rounded-full
                                    ${invoice.status === 'paid' ? 'bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400' : ''}
                                    ${invoice.status === 'due' ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/10 dark:text-yellow-400' : ''}
                                    ${invoice.status === 'overdue' ? 'bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400' : ''}
                                `}>
                                    {invoice.status === 'paid' && 'Pago'}
                                    {invoice.status === 'due' && 'Aberto'}
                                    {invoice.status === 'overdue' && 'Vencido'}
                                </span>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap text-xs text-gray-300 dark:text-gray-700 font-mono hidden sm:table-cell tracking-widest">
                                ••• {invoice.codeSuffix}
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap text-right text-sm">
                                <button 
                                    onClick={() => onOpenInvoice(invoice)}
                                    className="text-gray-300 hover:text-aysha-pink transition-colors font-bold text-xs"
                                >
                                    Detalhes
                                </button>
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

export default InvoiceList;
