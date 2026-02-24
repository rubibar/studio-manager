import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { ReviewSidebar } from './ReviewSidebar'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-[100dvh]" dir="rtl">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
      <ReviewSidebar />
    </div>
  )
}
