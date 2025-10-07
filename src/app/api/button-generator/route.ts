import { NextRequest, NextResponse } from 'next/server'

interface ButtonConfig {
  style: 'primary' | 'secondary' | 'minimal' | 'gradient'
  size: 'sm' | 'md' | 'lg' | 'xl'
  color: string
  backgroundColor: string
  borderRadius: number
  padding: number
  fontSize: number
  fontWeight: 'normal' | 'bold' | 'extrabold'
  shadow: boolean
  hover: boolean
  icon: boolean
  width: 'auto' | 'full'
  alignment: 'left' | 'center' | 'right'
}

export async function POST(request: NextRequest) {
  try {
    const { 
      config, 
      paymentUrl, 
      amount, 
      currency = 'RUB' 
    }: { 
      config: ButtonConfig
      paymentUrl: string
      amount: number
      currency: string
    } = await request.json()

    if (!config || !paymentUrl || !amount) {
      return NextResponse.json(
        { error: 'Недостаточно данных для генерации кнопки' },
        { status: 400 }
      )
    }

    const buttonStyles = {
      primary: {
        background: config.backgroundColor,
        color: config.color,
        border: 'none'
      },
      secondary: {
        background: 'transparent',
        color: config.color,
        border: `2px solid ${config.backgroundColor}`
      },
      minimal: {
        background: 'transparent',
        color: config.backgroundColor,
        border: 'none',
        textDecoration: 'underline'
      },
      gradient: {
        background: `linear-gradient(135deg, ${config.backgroundColor} 0%, #3B82F6 100%)`,
        color: config.color,
        border: 'none'
      }
    }

    const sizeStyles = {
      sm: { padding: '8px 16px', fontSize: '14px' },
      md: { padding: '12px 24px', fontSize: '16px' },
      lg: { padding: '16px 32px', fontSize: '18px' },
      xl: { padding: '20px 40px', fontSize: '20px' }
    }

    const currentStyle = buttonStyles[config.style]
    const currentSize = sizeStyles[config.size]

    const baseStyles = {
      ...currentStyle,
      ...currentSize,
      borderRadius: `${config.borderRadius}px`,
      fontWeight: config.fontWeight,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      width: config.width === 'full' ? '100%' : 'auto',
      textAlign: config.alignment,
      boxShadow: config.shadow ? '0 4px 15px rgba(139, 92, 246, 0.3)' : 'none'
    }

    const hoverStyles = config.hover ? {
      transform: 'translateY(-2px)',
      boxShadow: config.shadow ? '0 6px 20px rgba(139, 92, 246, 0.4)' : '0 6px 20px rgba(0, 0, 0, 0.1)'
    } : {}

    const iconHtml = config.icon ? `
      <div style="
        width: 20px;
        height: 20px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
      ">S</div>
    ` : ''

    const amountFormatted = new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)

    const htmlCode = `
<!-- Stellex Pay Button -->
<div id="stellex-pay-button" style="max-width: 400px; margin: 0 auto;">
  <button 
    onclick="window.open('${paymentUrl}', '_blank')"
    style="${Object.entries(baseStyles).map(([key, value]) => `${key}: ${value}`).join('; ')}"
    onmouseover="${config.hover ? `this.style.transform='${hoverStyles.transform}'; this.style.boxShadow='${hoverStyles.boxShadow}';` : ''}"
    onmouseout="${config.hover ? `this.style.transform='translateY(0)'; this.style.boxShadow='${baseStyles.boxShadow}';` : ''}"
  >
    ${iconHtml}
    <span>ОПЛАТИТЬ С ПОМОЩЬЮ STELLEX PAY</span>
    <span style="font-size: ${parseInt(currentSize.fontSize) - 2}px; opacity: 0.8;">
      ${amountFormatted}
    </span>
  </button>
</div>
<!-- End Stellex Pay Button -->
    `.trim()

    // Генерируем CSS код
    const cssCode = `
.stellex-pay-button {
  max-width: 400px;
  margin: 0 auto;
}

.stellex-pay-button button {
  ${Object.entries(baseStyles).map(([key, value]) => `${key}: ${value}`).join(';\n  ')}
}

.stellex-pay-button button:hover {
  ${config.hover ? Object.entries(hoverStyles).map(([key, value]) => `${key}: ${value}`).join(';\n  ') : ''}
}

.stellex-pay-button .stellex-icon {
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.stellex-pay-button .amount {
  font-size: ${parseInt(currentSize.fontSize) - 2}px;
  opacity: 0.8;
}
    `.trim()

    // Генерируем React компонент
    const reactCode = `
import React from 'react';

interface StellexPayButtonProps {
  paymentUrl: string;
  amount: number;
  currency?: string;
  className?: string;
}

export const StellexPayButton: React.FC<StellexPayButtonProps> = ({
  paymentUrl,
  amount,
  currency = 'RUB',
  className = ''
}) => {
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleClick = () => {
    window.open(paymentUrl, '_blank');
  };

  return (
    <div className={\`stellex-pay-button \${className}\`}>
      <button onClick={handleClick}>
        ${config.icon ? '<div className="stellex-icon">S</div>' : ''}
        <span>ОПЛАТИТЬ С ПОМОЩЬЮ STELLEX PAY</span>
        <span className="amount">{formatAmount(amount, currency)}</span>
      </button>
    </div>
  );
};
    `.trim()

    return NextResponse.json({
      success: true,
      html: htmlCode,
      css: cssCode,
      react: reactCode,
      config: config
    })

  } catch (error) {
    console.error('Button generation error:', error)
    return NextResponse.json(
      { error: 'Ошибка генерации кнопки' },
      { status: 500 }
    )
  }
}
