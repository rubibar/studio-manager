import { useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { ReviewSidebar } from './ReviewSidebar'
import { CommandPalette } from '@/components/shared/CommandPalette'
import { SlideOver } from '@/components/shared/SlideOver'
import { TaskDetailPanel } from '@/components/forms/TaskDetailPanel'
import { useUIStore } from '@/stores/uiStore'
import { getPresetById } from '@/lib/gradientPresets'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const toggleCommandPalette = useUIStore(s => s.toggleCommandPalette)
  const slideOverTaskId = useUIStore(s => s.slideOverTaskId)
  const closeSlideOver = useUIStore(s => s.closeSlideOver)
  const gradientPreset = useUIStore(s => s.gradientPreset)
  const darkMode = useUIStore(s => s.darkMode)
  const accentColor = useUIStore(s => s.accentColor)

  const preset = getPresetById(gradientPreset)
  const bgGradient = darkMode ? preset.dark : preset.light

  // Initialize accent color on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accentColor)
  }, [accentColor])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        toggleCommandPalette()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggleCommandPalette])

  return (
    <div className="flex min-h-[100dvh]" dir="rtl" style={{ background: bgGradient }}>
      <div className="noise-overlay" aria-hidden="true" />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 depth-scene">
        <Topbar />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
      <ReviewSidebar />
      <CommandPalette />
      <SlideOver
        open={slideOverTaskId !== null}
        onClose={closeSlideOver}
        title="Task Details"
      >
        {slideOverTaskId !== null && <TaskDetailPanel taskId={slideOverTaskId} />}
      </SlideOver>
    </div>
  )
}
