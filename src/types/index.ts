export interface Card {
  id: string;
  type: 'stellex';
  number: string;
  holderName: string;
  expiryDate: string;
  cvv: string;
  balance: number;
  status: 'active' | 'blocked' | 'pending' | 'awaiting_activation';
  createdAt: Date;
  lastUsed?: Date;
}

export interface User {
  id: string;
  telegramId: number;
  username?: string;
  firstName: string;
  lastName?: string;
  cards: Card[];
  totalSpent: number;
  createdAt: Date;
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
