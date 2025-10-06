import { Card, CardType } from '@/types';

// Генерация номера карты по типу
export const generateCardNumber = (type: CardType): string => {
  const prefixes = {
    stellex: ['666']
  };

  const prefix = prefixes[type][0];
  let cardNumber = prefix;

  // Генерируем остальные цифры (13 цифр для полного номера)
  for (let i = 0; i < 13; i++) {
    cardNumber += Math.floor(Math.random() * 10).toString();
  }

  // Добавляем контрольную цифру (упрощенный алгоритм Луна)
  cardNumber += calculateLuhnCheckDigit(cardNumber);

  return cardNumber;
};

// Вычисление контрольной цифры по алгоритму Луна
const calculateLuhnCheckDigit = (number: string): string => {
  let sum = 0;
  let isEven = false;

  // Обрабатываем цифры справа налево
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return ((10 - (sum % 10)) % 10).toString();
};

// Генерация CVV
export const generateCVV = (): string => {
  return Math.floor(100 + Math.random() * 900).toString();
};

// Генерация даты истечения (2 года от текущей даты)
export const generateExpiryDate = (): string => {
  const now = new Date();
  const year = now.getFullYear() + 2;
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${month}/${year.toString().slice(-2)}`;
};

// Создание новой карты
export const createCard = (type: CardType, userId: string, holderName?: string): Omit<Card, 'id' | 'created_at' | 'updated_at' | 'last_used'> => {
  return {
    user_id: userId,
    card_number: generateCardNumber(type),
    holder_name: (holderName || 'ПОЛЬЗОВАТЕЛЬ').toUpperCase(),
    expiry_date: generateExpiryDate(),
    cvv: generateCVV(),
    balance: 0,
    status: 'awaiting_activation'
  };
};

// Форматирование номера карты для отображения
export const formatCardNumber = (number: string, visible: boolean = true): string => {
  if (!visible) return '•••• •••• •••• ••••';
  return number.replace(/(.{4})/g, '$1 ').trim();
};

// Форматирование даты истечения
export const formatExpiryDate = (date: string, visible: boolean = true): string => {
  if (!visible) return '••/••';
  return date;
};

// Валидация номера карты
export const validateCardNumber = (number: string): boolean => {
  // Удаляем пробелы
  const cleanNumber = number.replace(/\s/g, '');
  
  // Проверяем, что это 16 цифр
  if (!/^\d{16}$/.test(cleanNumber)) {
    return false;
  }

  // Проверяем алгоритм Луна
  return calculateLuhnCheckDigit(cleanNumber.slice(0, -1)) === cleanNumber.slice(-1);
};

// Получение типа карты по номеру
export const getCardTypeFromNumber = (number: string): CardType | null => {
  const cleanNumber = number.replace(/\s/g, '');
  
  if (cleanNumber.startsWith('4')) {
    return 'stellex';
  }
  
  return null;
};

// Генерация уникального ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Форматирование суммы
export const formatAmount = (amount: number): string => {
  return amount.toLocaleString('ru-RU');
};

// Конвертация рублей в Telegram Stars (примерный курс 1₽ = 0.1⭐)
export const rubToStars = (rub: number): number => {
  return Math.ceil(rub * 0.1);
};

// Конвертация Telegram Stars в рубли
export const starsToRub = (stars: number): number => {
  return Math.floor(stars * 10);
};
