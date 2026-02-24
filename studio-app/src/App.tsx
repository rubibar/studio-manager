import { useEffect, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { useTaskStore } from '@/stores/taskStore'
import { useProjectStore } from '@/stores/projectStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useUIStore } from '@/stores/uiStore'
import { AppShell } from '@/components/layout/AppShell'
import { Login } from '@/components/Login'
import { TaskForm } from '@/components/forms/TaskForm'
import { ToastContainer } from '@/components/shared/Toast'
import { SkeletonLoader } from '@/components/shared/SkeletonLoader'

// Core views — eagerly loaded (most visited)
import { Dashboard } from '@/components/views/Dashboard'
import { TasksTable } from '@/components/views/TasksTable'
import { Kanban } from '@/components/views/Kanban'

// Lazy views — code-split
const Bank = lazy(() => import('@/components/views/Bank').then(m => ({ default: m.Bank })))
const Gantt = lazy(() => import('@/components/views/Gantt').then(m => ({ default: m.Gantt })))
const CalendarView = lazy(() => import('@/components/views/CalendarView').then(m => ({ default: m.CalendarView })))
const Categories = lazy(() => import('@/components/views/Categories').then(m => ({ default: m.Categories })))
const Workload = lazy(() => import('@/components/views/Workload').then(m => ({ default: m.Workload })))
const WeekView = lazy(() => import('@/components/views/WeekView').then(m => ({ default: m.WeekView })))
const Burndown = lazy(() => import('@/components/views/Burndown').then(m => ({ default: m.Burndown })))
const ActivityLog = lazy(() => import('@/components/views/ActivityLog').then(m => ({ default: m.ActivityLog })))
const Reports = lazy(() => import('@/components/views/Reports').then(m => ({ default: m.Reports })))
const Velocity = lazy(() => import('@/components/views/Velocity').then(m => ({ default: m.Velocity })))
const Dependencies = lazy(() => import('@/components/views/Dependencies').then(m => ({ default: m.Dependencies })))
const Timeline = lazy(() => import('@/components/views/Timeline').then(m => ({ default: m.Timeline })))
const Pricing = lazy(() => import('@/components/views/Pricing').then(m => ({ default: m.Pricing })))
const Projects = lazy(() => import('@/components/views/Projects').then(m => ({ default: m.Projects })))
const Clients = lazy(() => import('@/components/views/Clients').then(m => ({ default: m.Clients })))
const OKR = lazy(() => import('@/components/views/OKR').then(m => ({ default: m.OKR })))
const Admin = lazy(() => import('@/components/views/Admin').then(m => ({ default: m.Admin })))

function ViewLoader() {
  return <SkeletonLoader variant="default" />
}

function AppContent() {
  const activeView = useUIStore(s => s.activeView)
  const darkMode = useUIStore(s => s.darkMode)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  // Initialize accent color attribute on mount
  useEffect(() => {
    const saved = localStorage.getItem('accentColor') || 'blue'
    document.documentElement.setAttribute('data-accent', saved)
  }, [])

  function renderView() {
    switch (activeView) {
      case 'dashboard': return <Dashboard />
      case 'tasks': return <TasksTable />
      case 'kanban': return <Kanban />
      case 'bank': return <Bank />
      case 'gantt': return <Gantt />
      case 'calendar': return <CalendarView />
      case 'categories': return <Categories />
      case 'workload': return <Workload />
      case 'weekview': return <WeekView />
      case 'burndown': return <Burndown />
      case 'activitylog': return <ActivityLog />
      case 'reports': return <Reports />
      case 'velocity': return <Velocity />
      case 'dependencies': return <Dependencies />
      case 'timeline': return <Timeline />
      case 'pricing': return <Pricing />
      case 'projects': return <Projects />
      case 'clients': return <Clients />
      case 'okr': return <OKR />
      case 'admin': return <Admin />
      default: return <Dashboard />
    }
  }

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        >
          <Suspense fallback={<ViewLoader />}>
            {renderView()}
          </Suspense>
        </motion.div>
      </AnimatePresence>
      <TaskForm />
      <ToastContainer />
    </AppShell>
  )
}

export default function App() {
  const user = useAuthStore(s => s.user)
  const loading = useAuthStore(s => s.loading)
  const initAuth = useAuthStore(s => s.init)
  const initTasks = useTaskStore(s => s.initSync)
  const initProjects = useProjectStore(s => s.initSync)
  const initSettings = useSettingsStore(s => s.initSync)

  useEffect(() => {
    const unsubAuth = initAuth()
    return unsubAuth
  }, [initAuth])

  useEffect(() => {
    if (!user) return
    const unsubTasks = initTasks()
    const unsubProjects = initProjects()
    const unsubSettings = initSettings()
    return () => {
      unsubTasks()
      unsubProjects()
      unsubSettings()
    }
  }, [user, initTasks, initProjects, initSettings])

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#000000]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-[1.25rem] bg-[var(--color-accent)] flex items-center justify-center breathe">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <div className="skeleton h-1.5 w-24 rounded-full" />
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return <AppContent />
}
