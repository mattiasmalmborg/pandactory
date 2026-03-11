import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';

export interface ToastItem {
  id: string;
  icon: string;
  label: string;     // e.g. "Achievement Unlocked!", "Chore Complete!"
  title: string;
  subtitle?: string;
  colorScheme: 'achievement' | 'chore' | 'info';
}

interface ToastContextType {
  enqueue: (toast: ToastItem) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const COLOR_SCHEMES = {
  achievement: {
    bg: 'from-yellow-900/95 to-amber-900/95',
    border: 'border-yellow-500/50',
    label: 'text-yellow-300',
    subtitle: 'text-yellow-200/80',
  },
  chore: {
    bg: 'from-purple-900/95 to-indigo-900/95',
    border: 'border-purple-500/50',
    label: 'text-purple-300',
    subtitle: 'text-purple-200/80',
  },
  info: {
    bg: 'from-blue-900/95 to-cyan-900/95',
    border: 'border-blue-500/50',
    label: 'text-blue-300',
    subtitle: 'text-blue-200/80',
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<ToastItem[]>([]);
  const [current, setCurrent] = useState<ToastItem | null>(null);
  const [visible, setVisible] = useState(false);
  const showingRef = useRef(false);

  const enqueue = useCallback((toast: ToastItem) => {
    setQueue(prev => [...prev, toast]);
  }, []);

  // Process queue: show one toast at a time
  useEffect(() => {
    if (showingRef.current || queue.length === 0) return;

    const next = queue[0];
    showingRef.current = true;
    setCurrent(next);
    setQueue(prev => prev.slice(1));

    // Show
    requestAnimationFrame(() => setVisible(true));

    // Hide after 3s
    const hideTimer = setTimeout(() => setVisible(false), 3000);

    // Remove after fade-out animation
    const removeTimer = setTimeout(() => {
      setCurrent(null);
      showingRef.current = false;
    }, 3500);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue]);

  const scheme = current ? COLOR_SCHEMES[current.colorScheme] : null;

  return (
    <ToastContext.Provider value={{ enqueue }}>
      {children}
      {current && scheme && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-none px-4 w-full max-w-sm">
          <div
            className={`
              bg-gradient-to-r ${scheme.bg}
              backdrop-blur-md border ${scheme.border}
              rounded-xl shadow-2xl px-4 py-3
              flex items-center gap-3
              transform transition-all duration-500 ease-out
              ${visible
                ? 'translate-y-0 opacity-100 scale-100'
                : '-translate-y-4 opacity-0 scale-95'
              }
            `}
          >
            <div className="text-3xl">{current.icon}</div>
            <div className="min-w-0">
              <div className={`${scheme.label} text-xs font-semibold uppercase tracking-wider`}>
                {current.label}
              </div>
              <div className="text-white font-bold text-sm truncate">{current.title}</div>
              {current.subtitle && (
                <div className={`${scheme.subtitle} text-xs`}>{current.subtitle}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
