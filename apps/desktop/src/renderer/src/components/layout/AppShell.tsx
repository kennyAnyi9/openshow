import TopNav from './TopNav'

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps): React.JSX.Element {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
