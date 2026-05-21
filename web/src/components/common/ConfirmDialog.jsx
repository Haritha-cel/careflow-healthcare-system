import React from 'react'

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText, variant = 'danger' }) => {
  
  if (!isOpen) return null;

  const variantClasses = {
    danger: 'bg-red-600 hover:bg-red-700',
    success: 'bg-green-600 hover:bg-green-700',
    warning: 'bg-yellow-500 hover:bg-yellow-600'
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      
      {/* Backdrop */}
      <div 
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      ></div>

      {/* Dialog Box */}
      <div className='relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 transform transition-all'>
        
        <h3 className='text-lg font-bold text-gray-800 mb-2'>
          {title || 'Confirm Action'}
        </h3>
        
        <p className='text-sm text-gray-600 mb-6'>
          {message || 'Are you sure you want to proceed?'}
        </p>

        <div className='flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
          >
            Cancel
          </button>
          
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${variantClasses[variant]}`}
          >
            {confirmText || 'Confirm'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default ConfirmDialog