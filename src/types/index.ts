export interface Card {
  id: string;
  type: 'visa' | 'mastercard';
  number: string;
  holderName: string;
  expiryDate: string;
  cvv: string;
  balance: number;
  status: 'active' | 'blocked' | 'pending';
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
  type: 'visa' | 'mastercard';
  holderName: string;
  paymentMethod: 'telegram' | 'card';
}

export interface TopUpData {
  cardId: string;
  amount: number;
  paymentMethod: 'telegram' | 'card';
}

export interface Transaction {
  id: string;
  cardId: string;
  type: 'topup' | 'payment' | 'card_creation';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export type CardType = 'visa' | 'mastercard';
export type PaymentMethod = 'telegram' | 'card';
export type TransactionType = 'topup' | 'payment' | 'card_creation';
