import { useToast } from '@/src/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/src/components/ui/toast'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        // Automatically apply destructive variant for error toasts
        const isErrorToast =
          title &&
          typeof title === 'string' &&
          title.toLowerCase().includes('failed')
        const variant = isErrorToast
          ? 'destructive'
          : props.variant || 'default'

        // Debug logging
        console.log('Toast debug:', { title, isErrorToast, variant })

        return (
          <Toast
            key={id}
            {...props}
            variant={variant}
            style={
              isErrorToast
                ? {
                    backgroundColor: '#dc2626',
                    color: 'white',
                    borderColor: '#b91c1c',
                  }
                : undefined
            }
          >
            <div className="grid gap-1">
              {title && (
                <ToastTitle
                  style={isErrorToast ? { color: 'white' } : undefined}
                >
                  {title}
                </ToastTitle>
              )}
              {description && (
                <ToastDescription
                  style={isErrorToast ? { color: '#fecaca' } : undefined}
                >
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose style={isErrorToast ? { color: 'white' } : undefined} />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
