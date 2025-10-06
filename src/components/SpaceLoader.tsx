import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Zap, Sparkles } from 'lucide-react'

interface SpaceLoaderProps {
  isLoading: boolean
  onComplete?: () => void
}

const SpaceLoader: React.FC<SpaceLoaderProps> = ({ isLoading, onComplete }) => {
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('Инициализация...')

  const loadingSteps = [
    { text: 'Подключение к космосу...', progress: 20 },
    { text: 'Загрузка звезд...', progress: 40 },
    { text: 'Активация карт...', progress: 60 },
    { text: 'Настройка банка...', progress: 80 },
    { text: 'Готово!', progress: 100 }
  ]

  useEffect(() => {
    if (!isLoading) return

    let currentStep = 0
    const interval = setInterval(() => {
      if (currentStep < loadingSteps.length) {
        setLoadingText(loadingSteps[currentStep].text)
        setProgress(loadingSteps[currentStep].progress)
        currentStep++
      } else {
        clearInterval(interval)
        setTimeout(() => {
          onComplete?.()
        }, 500)
      }
    }, 800)

    return () => clearInterval(interval)
  }, [isLoading])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center overflow-hidden"
        >
          {/* Animated background stars */}
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Main content */}
          <div className="relative z-10 text-center">
            {/* Logo/Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, type: "spring", stiffness: 200 }}
              className="mb-8"
            >
              <div className="relative">
                {/* Central star */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 mx-auto mb-4"
                >
                  <div className="w-full h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
                    <Star className="w-12 h-12 text-white" />
                  </div>
                </motion.div>

                {/* Orbiting stars */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-4 h-4 bg-blue-400 rounded-full"
                    style={{
                      top: '50%',
                      left: '50%',
                      transformOrigin: '0 0',
                    }}
                    animate={{
                      rotate: 360,
                      x: Math.cos((i * 60) * Math.PI / 180) * 60,
                      y: Math.sin((i * 60) * Math.PI / 180) * 60,
                    }}
                    transition={{
                      duration: 4 + i * 0.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                ))}

                {/* Sparkles */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      top: `${20 + Math.random() * 60}%`,
                      left: `${20 + Math.random() * 60}%`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  >
                    <Sparkles className="w-3 h-3 text-yellow-300" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* App name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-4xl font-bold text-white mb-2"
            >
              Stellex Bank
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-white/70 text-lg mb-8"
            >
              Космический банк будущего
            </motion.p>

            {/* Loading text */}
            <motion.div
              key={loadingText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-white/90 text-lg font-medium mb-6"
            >
              {loadingText}
            </motion.div>

            {/* Progress bar */}
            <div className="w-80 mx-auto mb-8">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="text-white/60 text-sm mt-2 text-center">
                {progress}%
              </div>
            </div>

            {/* Animated dots */}
            <div className="flex justify-center space-x-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-white/60 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -100],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SpaceLoader
