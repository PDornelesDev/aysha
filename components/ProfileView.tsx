import React, { useState, useEffect } from 'react';
import { User, Mail, CreditCard, Save, Smartphone } from 'lucide-react';

interface ProfileViewProps {
  user: any;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user }) => {
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    cnpj: '',
    whatsapp: ''
  });

  // 🔥 IMPORTANTE: sincroniza o formulário quando o user chegar/atualizar
  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.name || '',
        cpf: user.cpf || '',
        cnpj: user.cnpj || '',
        whatsapp: user.whatsapp || ''
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 🔧 Aqui futuramente você chama o backend
    // await api.updateProfile(formData)

    setTimeout(() => {
      setIsLoading(false);
      alert('Dados atualizados com sucesso!');
    }, 1200);
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto min-h-screen animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-normal text-gray-900 dark:text-white">
          Meus Dados
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Informações da sua conta Aysha AI
        </p>
      </div>

      <div className="bg-white dark:bg-black border border-gray-200 dark:border-aysha-purple/30 rounded-[2.5rem] p-8">
        <form onSubmit={handleSave} className="space-y-8">
          {/* HEADER */}
          <div className="flex items-center gap-6 pb-6 border-b border-gray-50 dark:border-white/5">
            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden border-4 border-white dark:border-black">
              <img
                src={
                  user?.picture ||
                  `https://ui-avatars.com/api/?name=${formData.nome}&background=10b981&color=fff`
                }
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {formData.nome || 'Usuário'}
              </h3>
              <p className="text-sm text-gray-400">
                ID do usuário: #{user?.id}
              </p>
            </div>
          </div>

          {/* FORM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NOME */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <User size={16} /> Nome Completo
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                className="w-full mt-2 p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-aysha-pink"
              />
            </div>

            {/* WHATSAPP */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Smartphone size={16} /> WhatsApp
              </label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp: e.target.value })
                }
                placeholder="(11) 99999-9999"
                className="w-full mt-2 p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-aysha-pink"
              />
            </div>

            {/* CPF */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <CreditCard size={16} /> CPF
              </label>
              <input
                type="text"
                readOnly
                value={formData.cpf}
                onChange={(e) =>
                  setFormData({ ...formData, cpf: e.target.value })
                }
                className="w-full mt-2 p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-aysha-pink"
              />
            </div>

            {/* CNPJ */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <CreditCard size={16} /> CNPJ
              </label>
              <input
                type="text"
                readOnly
                value={formData.cnpj}
                onChange={(e) =>
                  setFormData({ ...formData, cnpj: e.target.value })
                }
                className="w-full mt-2 p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-aysha-pink"
              />
            </div>

            {/* EMAIL */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Mail size={16} /> E-mail
              </label>
              <input
                type="email"
                readOnly
                value={user?.email || ''}
                className="w-full mt-2 p-3 bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* SAVE */}
          <div className="pt-6 border-t border-gray-50 dark:border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-aysha-purple hover:bg-aysha-pink text-white rounded-xl font-bold flex items-center gap-2 transition-all"
            >
              {isLoading ? 'Salvando...' : <><Save size={18} /> Atualizar Perfil</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileView;
