import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Invoice } from '../types';

interface CalendarViewProps {
  invoices: Invoice[];
  onOpenInvoice: (invoice: Invoice) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ invoices, onOpenInvoice }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Get number of days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate the calendar grid array
  // We need empty slots for days before the 1st
  const daysArray = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }
  // Fill remaining slots to complete the row (optional, looks better)
  while (daysArray.length % 7 !== 0) {
      daysArray.push(null);
  }

  const getInvoicesForDay = (day: number) => {
    if (!day) return [];
    // Format: YYYY-MM-DD to match inv.fullDate
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return invoices.filter(inv => inv.fullDate === dateStr);
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto min-h-screen">
      <div className="bg-white dark:bg-black rounded-[2.5rem] border border-gray-200 dark:border-aysha-purple/30 overflow-hidden flex flex-col h-[calc(100vh-140px)]">
        
        {/* Calendar Header */}
        <div className="p-8 border-b border-gray-100 dark:border-aysha-purple/20 flex justify-between items-center">
            <h2 className="text-2xl font-normal text-gray-900 dark:text-white flex items-center gap-4">
                {monthNames[month]} {year}
            </h2>
            <div className="flex gap-2">
                <button 
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <button 
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500 transition-colors"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-100 dark:border-aysha-purple/20">
            {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((day) => (
                <div key={day} className="py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.substring(0,3)}</span>
                </div>
            ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-gray-50 dark:bg-black/20 overflow-y-auto">
            {daysArray.map((day, idx) => {
                const dayInvoices = day ? getInvoicesForDay(day) : [];
                return (
                    <div 
                        key={idx} 
                        className={`
                            border-r border-b border-gray-100 dark:border-aysha-purple/10 p-2 sm:p-4 min-h-[100px] relative transition-colors
                            ${day ? 'bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-white/5' : 'bg-gray-50/50 dark:bg-black/40'}
                            ${(idx + 1) % 7 === 0 ? 'border-r-0' : ''}
                        `}
                    >
                        {day && (
                            <>
                                <span className={`text-sm font-medium ${
                                    day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()
                                    ? 'text-aysha-pink' 
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                    {day}
                                </span>
                                
                                <div className="mt-2 space-y-1">
                                    {dayInvoices.map((inv) => (
                                        <button 
                                            key={inv.id} 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onOpenInvoice(inv);
                                            }}
                                            className={`
                                                w-full text-left text-[10px] sm:text-xs px-2 py-1 rounded-md truncate font-medium border cursor-pointer hover:opacity-80 transition-opacity
                                                ${inv.status === 'paid' 
                                                    ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' 
                                                    : inv.status === 'overdue'
                                                        ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'
                                                        : 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/30'
                                                }
                                            `}
                                            title={`${inv.company} - R$ ${inv.value.toFixed(2)}`}
                                        >
                                            {inv.company}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;