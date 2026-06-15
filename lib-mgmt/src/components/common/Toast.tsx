import { useState, useEffect } from 'react'
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

interface ToastProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

export function Toast({ isOpen, onClose, title, message, type = 'info', duration = 3000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(isOpen)

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  }

  const colors = {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600',
    warning: 'text-yellow-600',
  }

  const bgColors = {
    success: 'bg-green-50',
    error: 'bg-red-50',
    info: 'bg-blue-50',
    warning: 'bg-yellow-50',
  }

  const Icon = icons[type]

  // Auto-hide after duration
  useEffect(() => {
    setIsVisible(isOpen)
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in">
      <div className={`bg-white dark:bg-dark-surface rounded-lg shadow-lg border border-gray-200 dark:border-dark-border-dark p-4 max-w-md flex items-start gap-3`}>
        <div className={`w-6 h-6 ${bgColors[type]} rounded-full flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${colors[type]}`} />
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900 dark:text-dark-text">{title}</p>
          <p className="text-sm text-gray-600 dark:text-dark-text-muted">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-dark-surface-alt rounded-lg flex-shrink-0"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  )
}
