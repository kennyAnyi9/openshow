import { cn } from '@/lib/utils'

interface SectionTabBarProps {
  sections: Array<{ key: string; label: string }>
  activeKey: string | null
  onSelect: (key: string) => void
}

export default function SectionTabBar({
  sections,
  activeKey,
  onSelect
}: SectionTabBarProps): React.JSX.Element {
  return (
    <div className="flex shrink-0 items-center gap-1 border-b border-border px-4 py-2">
      {sections.map((section) => (
        <button
          key={section.key}
          onClick={() => onSelect(section.key)}
          className={cn(
            'rounded px-3 py-1 text-xs font-medium transition-colors',
            activeKey === section.key
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground/70'
          )}
        >
          {section.label}
        </button>
      ))}
    </div>
  )
}
