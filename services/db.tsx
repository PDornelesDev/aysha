
import { Invoice } from '../types';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = 'https://api.ayshaia.com/api';

export const dbService = {
  syncUserDetailed: async (googleUser: { email: string; name: string; picture: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google?t=${Date.now()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleUser)
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Erro ao sincronizar usuário:", error);
      return null;
    }
  },

  disconnectGmail: async (userId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/gmail/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Erro ao desconectar Gmail:", error);
      return null;
    }
  },

  verifySession: async (sessionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/stripe/verify-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      return await response.json();
    } catch (error) {
      console.error("Erro ao verificar sessão:", error);
      return null;
    }
  },

  createStripeCheckout: async (userId: number, email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/stripe/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email })
      });
      const data = await response.json();
      return data.clientSecret;
    } catch (error: any) {
      return null;
    }
  },

  getPaymentHistory: async (userId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments?userId=${userId}&t=${Date.now()}`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      return [];
    }
  },

  getAllInvoices: async (userId: number): Promise<Invoice[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/boletos?userId=${userId}&t=${Date.now()}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.map((row: any) => ({
        id: row.id.toString(),
        company: row.beneficiario || 'Empresa',
        category: row.categoria || 'Outros',
        value: parseFloat(row.valor || '0'),
        dueDate: new Date(row.vencimento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        fullDate: row.vencimento ? row.vencimento.split('T')[0] : '',
        status: row.status === 'pago' ? 'paid' : 'due',
        codeSuffix: row.codigoBarras ? row.codigoBarras.slice(-3) : '000',
        barcode: row.codigoBarras,
      }));
    } catch (error) {
      return [];
    }
  },
  
 

  updateInvoiceStatus: async (id: string, status: 'paid' | 'due'): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/boletos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: status === 'paid' ? 'pago' : 'pendente',
          pagoEm: status === 'paid' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null
        })
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  },  
  
};
