
import React from 'react';

export interface Invoice {
  id: string;
  company: string;
  value: number;
  dueDate: string; // Format: "DD Out" or "YYYY-MM-DD" for better parsing
  fullDate?: string; // ISO String for calendar logic
  status: 'paid' | 'due' | 'overdue';
  codeSuffix: string;
  barcode?: string;
  category?: string;
}

export interface User {
  name: string;
  avatarUrl: string;
  email: string;
}

export type ViewState = 
  | 'dashboard' 
  | 'invoices' 
  | 'paid' 
  | 'due_soon' 
  | 'whatsapp' 
  | 'calendar' 
  | 'subscription' 
  | 'profile'
  | 'terms'
  | 'privacy'
  | 'help'
  | 'features';

export type ModalType = 'settings' | 'add_invoice' | 'gmail_connect' | null;

export type DateFilterType = 'month' | 'week' | 'today' | 'all';

export interface SidebarItem {
  id: ViewState | 'settings' | 'logout'; 
  label: string;
  icon: React.ReactNode;
  action?: () => void;
}
