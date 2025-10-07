// Утилиты для работы с Telegram WebApp API

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    setParams: (params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  CloudStorage: {
    setItem: (key: string, value: string, callback?: (error: string | null, result?: boolean) => void) => void;
    getItem: (key: string, callback: (error: string | null, result?: string) => void) => void;
    getItems: (keys: string[], callback: (error: string | null, result?: Record<string, string>) => void) => void;
    removeItem: (key: string, callback?: (error: string | null, result?: boolean) => void) => void;
    removeItems: (keys: string[], callback?: (error: string | null, result?: boolean) => void) => void;
    getKeys: (callback: (error: string | null, result?: string[]) => void) => void;
  };
  BiometricManager: {
    isInited: boolean;
    isBiometricAvailable: boolean;
    biometricType: 'finger' | 'face' | 'unknown';
    isAccessRequested: boolean;
    isAccessGranted: boolean;
    isBiometricTokenSaved: boolean;
    requestAccess: (params: {
      reason?: string;
    }) => Promise<boolean>;
    authenticate: (params: {
      reason?: string;
    }) => Promise<boolean>;
    updateBiometricToken: (token: string) => Promise<boolean>;
    openSettings: () => void;
  };
  isVersionAtLeast: (version: string) => boolean;
  sendData: (data: string) => void;
  ready: () => void;
  expand: () => void;
  close: () => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  showPopup: (params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text?: string;
    }>;
  }, callback?: (buttonId: string) => void) => void;
  showScanQrPopup: (params: {
    text?: string;
  }, callback?: (text: string) => void) => void;
  closeScanQrPopup: () => void;
  readTextFromClipboard: (callback?: (text: string) => void) => void;
  requestWriteAccess: (callback?: (granted: boolean) => void) => void;
  requestContact: (callback?: (granted: boolean, contact?: {
    contact: {
      phone_number: string;
      first_name: string;
      last_name?: string;
      user_id?: number;
    };
  }) => void) => void;
  openLink: (url: string, options?: {
    try_instant_view?: boolean;
  }) => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string, callback?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void) => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  onEvent: (eventType: string, eventHandler: () => void) => void;
  offEvent: (eventType: string, eventHandler: () => void) => void;
  sendInvoice: (params: {
    invoice: {
      title: string;
      description: string;
      start_parameter: string;
      currency: string;
      prices: Array<{
        label: string;
        amount: number;
      }>;
      provider_data?: string;
      photo_url?: string;
      photo_size?: number;
      photo_width?: number;
      photo_height?: number;
      need_name?: boolean;
      need_phone_number?: boolean;
      need_email?: boolean;
      need_shipping_address?: boolean;
      send_phone_number_to_provider?: boolean;
      send_email_to_provider?: boolean;
      is_flexible?: boolean;
    };
  }, callback?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void) => void;
}

// Проверка, что мы находимся в Telegram WebApp
export const isTelegramWebApp = (): boolean => {
  return typeof window !== 'undefined' && window.Telegram?.WebApp !== undefined;
};

// Получение экземпляра Telegram WebApp
export const getTelegramWebApp = (): TelegramWebApp | null => {
  if (typeof window === 'undefined') return null;
  
  // Проверяем несколько способов доступа к Telegram WebApp
  if (window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  
  // Альтернативные способы доступа
  if ((window as { TelegramWebApp?: TelegramWebApp }).TelegramWebApp) {
    return (window as unknown as { TelegramWebApp: TelegramWebApp }).TelegramWebApp;
  }
  
  return null;
};

// Получение данных пользователя из Telegram
export const getTelegramUser = (): TelegramUser | null => {
  const webApp = getTelegramWebApp();
  return webApp?.initDataUnsafe?.user || null;
};

// Ожидание загрузки Telegram WebApp
export const waitForTelegramWebApp = (): Promise<TelegramWebApp | null> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }

    // Если уже загружен
    const webApp = getTelegramWebApp();
    if (webApp) {
      resolve(webApp);
      return;
    }

    // Ждем загрузки
    let attempts = 0;
    const maxAttempts = 50; // 5 секунд максимум
    
    const checkInterval = setInterval(() => {
      attempts++;
      const webApp = getTelegramWebApp();
      
      if (webApp) {
        clearInterval(checkInterval);
        resolve(webApp);
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        resolve(null);
      }
    }, 100);
  });
};

// Инициализация Telegram WebApp
export const initTelegramWebApp = async (): Promise<void> => {
  const webApp = await waitForTelegramWebApp();
  if (webApp) {
    webApp.ready();
    webApp.expand();
  }
};

// Настройка темы приложения
export const setupTelegramTheme = (): void => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    // Применяем цвета темы Telegram
    const root = document.documentElement;
    const theme = webApp.themeParams;
    
    if (theme.bg_color) {
      root.style.setProperty('--telegram-bg', theme.bg_color);
    }
    if (theme.text_color) {
      root.style.setProperty('--telegram-text', theme.text_color);
    }
    if (theme.button_color) {
      root.style.setProperty('--telegram-accent', theme.button_color);
    }
    if (theme.button_text_color) {
      root.style.setProperty('--telegram-button-text', theme.button_text_color);
    }
  }
};

// Показать уведомление
export const showNotification = (message: string, type: 'success' | 'error' | 'warning' = 'success'): void => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.showAlert(message);
    
    // Тактильная обратная связь
    if (webApp.HapticFeedback) {
      webApp.HapticFeedback.notificationOccurred(type);
    }
  } else {
    // Fallback для браузера
    alert(message);
  }
};

// Показать подтверждение
export const showConfirmation = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const webApp = getTelegramWebApp();
    if (webApp) {
      webApp.showConfirm(message, (confirmed) => {
        resolve(confirmed);
      });
    } else {
      // Fallback для браузера
      resolve(confirm(message));
    }
  });
};

// Отправка данных в Telegram
export const sendDataToTelegram = (data: unknown): void => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.sendData(JSON.stringify(data));
  }
};

// Настройка кнопки "Назад"
export const setupBackButton = (onBack: () => void): void => {
  const webApp = getTelegramWebApp();
  if (webApp?.BackButton) {
    webApp.BackButton.onClick(onBack);
    webApp.BackButton.show();
  }
};

// Скрыть кнопку "Назад"
export const hideBackButton = (): void => {
  const webApp = getTelegramWebApp();
  if (webApp?.BackButton) {
    webApp.BackButton.hide();
  }
};

// Настройка главной кнопки
export const setupMainButton = (text: string, onClick: () => void): void => {
  const webApp = getTelegramWebApp();
  if (webApp?.MainButton) {
    webApp.MainButton.setText(text);
    webApp.MainButton.onClick(onClick);
    webApp.MainButton.show();
  }
};

// Скрыть главную кнопку
export const hideMainButton = (): void => {
  const webApp = getTelegramWebApp();
  if (webApp?.MainButton) {
    webApp.MainButton.hide();
  }
};

// Показать прогресс на главной кнопке
export const showMainButtonProgress = (): void => {
  const webApp = getTelegramWebApp();
  if (webApp?.MainButton) {
    webApp.MainButton.showProgress();
  }
};

// Скрыть прогресс на главной кнопке
export const hideMainButtonProgress = (): void => {
  const webApp = getTelegramWebApp();
  if (webApp?.MainButton) {
    webApp.MainButton.hideProgress();
  }
};

// Тактильная обратная связь
export const hapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light'): void => {
  const webApp = getTelegramWebApp();
  if (webApp?.HapticFeedback) {
    webApp.HapticFeedback.impactOccurred(type);
  }
};

// Открыть ссылку
export const openLink = (url: string): void => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.openLink(url);
  } else {
    window.open(url, '_blank');
  }
};

// Глобальная типизация для window.Telegram
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}
