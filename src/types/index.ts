export interface Card {
  id: string;
  user_id: string;
  card_number: string;
  holder_name: string;
  expiry_date: string;
  cvv: string;
  balance: number;
  status: 'active' | 'blocked' | 'pending' | 'awaiting_activation';
  created_at: string;
  updated_at: string;
  last_used?: string;
}

export interface User {
  id: string;
  telegram_id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentData {
  amount: number;
  currency: 'RUB';
  description: string;
  cardId?: string;
}

export interface CardCreationData {
  type: 'stellex';
  holderName: string;
  paymentMethod: 'free';
}

export interface TopUpData {
  cardId: string;
  amount: number;
  paymentMethod: 'telegram' | 'card';
}

export interface Transaction {
  id: string;
  cardId: string;
  type: 'topup' | 'payment' | 'card_creation' | 'transfer_out' | 'transfer_in' | 'telegram_stars_topup' | 'withdrawal';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  externalId?: string;
  createdAt: Date;
}

export type CardType = 'stellex';
export type PaymentMethod = 'telegram' | 'card';
export type TransactionType = 'topup' | 'payment' | 'card_creation';
