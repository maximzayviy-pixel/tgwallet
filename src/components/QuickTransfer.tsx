import React from 'react'
import { motion } from 'framer-motion'
import { Plus, User } from 'lucide-react'

interface Contact {
  id: string
  name: string
  avatar?: string
  phone?: string
}

interface QuickTransferProps {
  contacts: Contact[]
  onContactClick: (contact: Contact) => void
  onAddNew: () => void
}

const QuickTransfer: React.FC<QuickTransferProps> = ({
  contacts,
  onContactClick,
  onAddNew
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Переводы по номеру телефона</h3>
        <button className="text-purple-600 text-sm font-medium">Все</button>
      </div>
      
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {/* Add new contact */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddNew}
          className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center"
        >
          <Plus className="w-6 h-6 text-gray-600" />
        </motion.button>
        
        {/* Contact list */}
        {contacts.map((contact, index) => (
          <motion.button
            key={contact.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onContactClick(contact)}
            className="flex-shrink-0 flex flex-col items-center space-y-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              {contact.avatar ? (
                <img 
                  src={contact.avatar} 
                  alt={contact.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            <span className="text-xs text-gray-600 text-center max-w-16 truncate">
              {contact.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default QuickTransfer
