import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className={`flex items-center justify-center h-64 ${className}`}>
      <div className="text-center">
        <Loader2
          className={`${sizeClasses[size]} animate-spin text-brandGreen-900 mx-auto mb-4`}
        />
        {message && (
          <p className="text-neutral-600 dark:text-neutral-400">{message}</p>
        )}
      </div>
    </div>
  )
}

export const TableLoading: React.FC<{ message?: string; colSpan?: number }> = ({
  message = 'Loading...',
  colSpan = 7,
}) => {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-8">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-brandGreen-900" />
          <span className="text-neutral-600 dark:text-neutral-400">
            {message}
          </span>
        </div>
      </td>
    </tr>
  )
}

export const ButtonLoading: React.FC<{ message?: string }> = ({
  message = 'Loading...',
}) => {
  return (
    <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      {message}
    </>
  )
}
