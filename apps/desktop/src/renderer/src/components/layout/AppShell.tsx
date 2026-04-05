import { TooltipProvider } from '@/components/ui/tooltip'
import Sidebar from './Sidebar'

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps): React.JSX.Element {
  return (
    <TooltipProvider>
      <div className="flex h-full w-full overflow-hidden bg-background">
        <Sidebar />
        <main className="flex flex-1 overflow-hidden">{children}</main>
      </div>
    </TooltipProvider>
  )
}
