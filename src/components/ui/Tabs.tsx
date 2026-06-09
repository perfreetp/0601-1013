import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/utils/format';

interface TabItem {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  items: TabItem[];
  className?: string;
}

export default function Tabs({ value, onChange, items, className }: TabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (!tabsRef.current) return;

    const activeTab = tabsRef.current.querySelector<HTMLButtonElement>(
      `[data-tab-value="${value}"]`
    );

    if (activeTab) {
      setIndicatorStyle({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      });
    }
  }, [value, items]);

  return (
    <div className={cn('relative border-b border-neutral-200', className)} ref={tabsRef}>
      <div className="flex gap-1">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            data-tab-value={item.value}
            disabled={item.disabled}
            onClick={() => !item.disabled && onChange(item.value)}
            className={cn(
              'relative px-5 py-3 text-sm font-medium transition-colors duration-200 whitespace-nowrap',
              value === item.value
                ? 'text-primary-600'
                : 'text-neutral-500 hover:text-neutral-800',
              item.disabled && 'opacity-50 cursor-not-allowed hover:text-neutral-500'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <span
        className="absolute bottom-0 h-0.5 bg-primary-500 rounded-full transition-all duration-300 ease-out"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
        }}
      />
    </div>
  );
}
