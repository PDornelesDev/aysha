import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface InfoPageProps {
  title: string;
  subtitle: string;
  content: React.ReactNode;
  onBack: () => void;
}

const InfoPage: React.FC<InfoPageProps> = ({ title, subtitle, content, onBack }) => {
  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto min-h-screen animate-in fade-in duration-500">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-aysha-pink transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      <div className="bg-white dark:bg-black border border-gray-200 dark:border-aysha-purple/30 rounded-[2rem] p-8 md:p-12 shadow-none">
        <div className="mb-8 border-b border-gray-100 dark:border-white/10 pb-8">
          <h1 className="text-3xl font-medium text-gray-900 dark:text-white mb-2">{title}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">{subtitle}</p>
        </div>
        
        <div className="prose prose-gray dark:prose-invert max-w-none">
          {content}
        </div>
      </div>
    </div>
  );
};

export default InfoPage;