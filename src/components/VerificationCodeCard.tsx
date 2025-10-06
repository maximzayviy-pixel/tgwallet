import React from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Shield, Clock, AlertTriangle } from 'lucide-react'

interface VerificationCodeCardProps {
  cardNumber: string
  serviceName: string
  verificationCode: string
  expiresAt: string
}

const VerificationCodeCard: React.FC<VerificationCodeCardProps> = ({
  cardNumber,
  serviceName,
  verificationCode,
  expiresAt
}) => {
  const formatCardNumber = (number: string) => {
    return `**** **** **** ${number.slice(-4)}`
  }

  const formatExpiryTime = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = Math.max(0, Math.floor((expiry.getTime() - now.getTime()) / 1000))
    const minutes = Math.floor(diff / 60)
    const seconds = diff % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-sm mx-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Код верификации</h2>
            <p className="text-slate-400 text-sm">Stellex Bank</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-slate-400 text-xs">Карта</div>
          <div className="text-white font-mono text-sm">{formatCardNumber(cardNumber)}</div>
        </div>
      </div>

      {/* Service Info */}
      <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
        <div className="flex items-center space-x-3">
          <CreditCard className="w-5 h-5 text-blue-400" />
          <div>
            <div className="text-white font-medium">Привязка к сервису</div>
            <div className="text-slate-300 text-sm">{serviceName}</div>
          </div>
        </div>
      </div>

      {/* Verification Code */}
      <div className="text-center mb-6">
        <div className="text-slate-400 text-sm mb-3">Введите этот код в сервисе:</div>
        <motion.div 
          className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 mb-4"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="text-4xl font-bold text-white tracking-widest font-mono">
            {verificationCode}
          </div>
        </motion.div>
        <div className="text-slate-400 text-xs">
          Код действителен 5 минут
        </div>
      </div>

      {/* Timer */}
      <div className="flex items-center justify-center space-x-2 mb-6">
        <Clock className="w-4 h-4 text-yellow-400" />
        <span className="text-yellow-400 font-mono text-sm">
          {formatExpiryTime(expiresAt)}
        </span>
      </div>

      {/* Warning */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="text-yellow-200 text-sm">
            <div className="font-medium mb-1">Важно!</div>
            <div>Никому не сообщайте этот код. Stellex Bank никогда не запрашивает коды верификации.</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center">
        <div className="text-slate-500 text-xs">
          Если вы не запрашивали этот код, проигнорируйте сообщение
        </div>
      </div>
    </div>
  )
}

export default VerificationCodeCard
