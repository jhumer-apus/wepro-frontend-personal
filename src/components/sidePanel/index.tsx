'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { X } from 'lucide-react'
import { useRouter } from 'next/router'

type WidthPreset = 'sm' | 'md' | 'lg' | 'xl'

type SidePanelOptions = {
  title?: React.ReactNode
  headerButton?: React.ReactNode | (() => React.ReactNode)
  content?: React.ReactNode | (() => React.ReactNode)
  footer?: React.ReactNode | (() => React.ReactNode)
  width?: WidthPreset | string | number
}

type SidePanelState = {
  isOpen: boolean
  options: {
    title?: React.ReactNode
    headerButton?: React.ReactNode | (() => React.ReactNode)
    content?: React.ReactNode | (() => React.ReactNode)
    footer?: React.ReactNode | (() => React.ReactNode)
    width: WidthPreset | string | number
  }
}

type SidePanelContextValue = {
  state: SidePanelState
  open: (options: SidePanelOptions) => void
  close: () => void
}

const WIDTH_MAP: Record<WidthPreset, string> = {
  sm: '320px',
  md: '420px',
  lg: '520px',
  xl: '640px',
}

const defaultOptions: SidePanelState['options'] = {
  title: undefined,
  headerButton: null,
  content: null,
  footer: null,
  width: 'md',
}

const SidePanelContext = createContext<SidePanelContextValue | null>(null)

const warnNotReady = () =>
  console.warn('SidePanel open/close called before provider mounted')

const bridge = {
  open: (options: SidePanelOptions) => warnNotReady(),
  close: () => warnNotReady(),
}

const computeWidth = (width?: WidthPreset | string | number) => {
  if (typeof width === 'number') return `${width}px`
  if (!width) return WIDTH_MAP.md
  return WIDTH_MAP[width as WidthPreset] ?? width
}

const renderContent = (
  content?: SidePanelOptions['content']
): React.ReactNode => {
  if (typeof content === 'function') return content()
  return content ?? null
}

type SidePanelProviderProps = {
  children: React.ReactNode
  className?: string
}

export function SidePanelProvider({
  children,
  className,
}: SidePanelProviderProps) {
  const router = useRouter()
  const [state, setState] = useState<SidePanelState>({
    isOpen: false,
    options: defaultOptions,
  })

  const open = useCallback((options: SidePanelOptions) => {
    setState({
      isOpen: true,
      options: {
        ...defaultOptions,
        ...options,
        width: options.width ?? defaultOptions.width,
      },
    })
  }, [])

  const close = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
    }))
  }, [])

  useEffect(() => {
    bridge.open = open
    bridge.close = close
    return () => {
      bridge.open = warnNotReady
      bridge.close = warnNotReady
    }
  }, [open, close])

  useEffect(() => {
    close()
  }, [router.asPath, close])

  return (
    <SidePanelContext.Provider value={{ state, open, close }}>
      <div className={className}>{children}</div>
    </SidePanelContext.Provider>
  )
}

type SidePanelViewportProps = {
  children: React.ReactNode
  className?: string
  minHeight?: string
}

export function SidePanelViewport({
  children,
  className,
  minHeight = 'min-h-screen',
}: SidePanelViewportProps) {
  const { state, close } = useSidePanel()
  const widthValue = useMemo(
    () => computeWidth(state.options.width),
    [state.options.width]
  )
  const panelContent = renderContent(state.options.content)
  const panelFooter = renderContent(state.options.footer)
  const panelHeaderButton = renderContent(state.options.headerButton)

  const gridStyle: React.CSSProperties = useMemo(
    () => ({
      // gridTemplateColumns: state.isOpen ? `1fr ${widthValue}` : '1fr 0px',
      transitionProperty: 'grid-template-columns',
      transitionDuration: '300ms',
      transitionTimingFunction: 'ease-in-out',
    }),
    [state.isOpen, widthValue]
  )

  return (
    <div
      className={`grid h-full min-h-0 max-h-screen ${minHeight} ${className ?? ''} ${
        state.isOpen
          ? 'grid-cols-[1fr_100%] xl:grid-cols-[1fr_600px] 2xl:grid-cols-[1fr_640px]'
          : 'grid-cols-[1fr_0px]'
      }`}
      style={gridStyle}
    >
      <div className="min-w-0 overflow-auto flex">{children}</div>

      <aside
        className={`relative z-20 h-screen max-h-screen min-h-0 lg:h-full lg:max-h-screen overflow-visible border-l border-neutral-200 bg-white shadow-lg transition-transform duration-300 ease-in-out dark:border-neutral-800 dark:bg-neutral-900 w-full xl:w-[600px] 2xl:w-[640px]`}
        style={{
          transform: state.isOpen ? 'translateX(0)' : 'translateX(100%)'
        }}
        aria-hidden={!state.isOpen}
        aria-label="Side panel"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
            <div className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
              {state.options.title}
            </div>
            <div className="flex items-center gap-2">
              {panelHeaderButton}
              <button
                type="button"
                onClick={close}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-neutral-700 transition hover:bg-neutral-200 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                aria-label="Close side panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto overflow-x-visible px-4 py-4 text-neutral-900 dark:text-neutral-100">
            {panelContent}
          </div>
          {panelFooter ? (
            <div className="border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
              {panelFooter}
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  )
}

export const useSidePanel = () => {
  const context = useContext(SidePanelContext)
  if (!context) {
    throw new Error(
      'useSidePanel must be used within a SidePanelProvider mounted at the layout level.'
    )
  }
  return context
}

const SidePanel = {
  open: (options: SidePanelOptions) => bridge.open(options),
  close: () => bridge.close(),
  Provider: SidePanelProvider,
  Viewport: SidePanelViewport,
}

export default SidePanel

