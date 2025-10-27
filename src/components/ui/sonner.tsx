import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toaster]:text-muted-foreground',
          success:
            'bg-green-200 border-green-500 text-green-900 shadow-2xl border-2 font-semibold rounded-lg',
          successTitle: 'text-green-900 font-bold text-lg mb-1',
          successDescription: 'text-green-800 font-medium text-base',
          error:
            'bg-red-600 border-red-700 text-white shadow-2xl border-2 font-semibold rounded-lg',
          errorTitle: 'text-white font-bold text-lg mb-1',
          errorDescription: 'text-red-100 font-medium text-base',
        },
        style: {
          '--success-bg': '#dcfce7',
          '--success-border': '#22c55e',
          '--success-text': '#14532d',
          '--error-bg': '#dc2626',
          '--error-border': '#b91c1c',
          '--error-text': '#ffffff',
        } as React.CSSProperties,
      }}
      {...props}
    />
  )
}

export { Toaster }
