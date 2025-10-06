import React from 'react'
import { motion } from 'framer-motion'
import { ThumbsUp, Smartphone } from 'lucide-react'

const CustomizeScreen: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-white"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-2">Настройте экран под себя</h3>
          <div className="flex items-center space-x-2 text-sm opacity-90">
            <ThumbsUp className="w-4 h-4" />
            <span>Нужные разделы вперёд, остальные скройте</span>
          </div>
        </div>
        <div className="flex-shrink-0 ml-4">
          <div className="relative">
            <div className="w-16 h-20 bg-black/20 rounded-lg flex items-center justify-center">
              <Smartphone className="w-8 h-8" />
            </div>
            {/* Floating elements */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-white/30 rounded"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white/20 rounded"></div>
            <div className="absolute top-2 left-2 w-2 h-2 bg-white/40 rounded"></div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CustomizeScreen
