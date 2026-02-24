import { useEffect, lazy, Suspense } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useTaskStore } from '@/stores/taskStore'
import { useProjectStore } from '@/stores/projectStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useUIStore } from '@/stores/uiStore'
import { AppShell } from '@/components/layout/AppShell'
import { Login } from '@/components/Login'
import { TaskForm } from '@/components/forms/TaskForm'
import { ToastContainer } from '@/components/shared/Toast'

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
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function AppContent() {
  const activeView = useUIStore(s => s.activeView)
  const darkMode = useUIStore(s => s.darkMode)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

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
      <Suspense fallback={<ViewLoader />}>
        {renderView()}
      </Suspense>
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
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#09090b]">
        <div className="w-8 h-8 border-2 border-[#059669] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return <AppContent />
}
