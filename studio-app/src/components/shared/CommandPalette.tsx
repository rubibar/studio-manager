import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlass, ArrowRight, Keyboard, Moon, Sun, Plus, Palette } from '@phosphor-icons/react'
import { useUIStore, type ViewName } from '@/stores/uiStore'
import { useTaskStore } from '@/stores/taskStore'
import { VIEW_TITLES } from '@/lib/constants'

const PLACEHOLDERS = ['Search tasks...', 'Navigate views...', 'Create task...', 'Find anything...']

function useTypewriter(strings: string[], speed = 50, pause = 2000) {
  const [text, setText] = useState('')
  const [strIdx, setStrIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = strings[strIdx]
    if (!deleting && charIdx < current.length) {
      const t = setTimeout(() => {
        setText(current.slice(0, charIdx + 1))
        setCharIdx(c => c + 1)
      }, speed)
      return () => clearTimeout(t)
    }
    if (!deleting && charIdx === current.length) {
      const t = setTimeout(() => setDeleting(true), pause)
      return () => clearTimeout(t)
    }
    if (deleting && charIdx > 0) {
      const t = setTimeout(() => {
        setText(current.slice(0, charIdx - 1))
        setCharIdx(c => c - 1)
      }, speed / 2)
      return () => clearTimeout(t)
    }
    if (deleting && charIdx === 0) {
      setDeleting(false)
      setStrIdx(i => (i + 1) % strings.length)
    }
  }, [strings, strIdx, charIdx, deleting, speed, pause])

  return text
}

interface ResultItem {
  id: string
  label: string
  group: 'Tasks' | 'Views' | 'Actions'
  onSelect: () => void
}

export function CommandPalette() {
  const open = useUIStore(s => s.commandPaletteOpen)
  const close = useUIStore(s => s.closeCommandPalette)
  const setView = useUIStore(s => s.setView)
  const openSlideOver = useUIStore(s => s.openSlideOver)
  const openModal = useUIStore(s => s.openModal)
  const toggleDarkMode = useUIStore(s => s.toggleDarkMode)
  const darkMode = useUIStore(s => s.darkMode)
  const tasks = useTaskStore(s => s.tasks)

  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const placeholder = useTypewriter(PLACEHOLDERS)

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const results = useMemo<ResultItem[]>(() => {
    const q = query.toLowerCase().trim()
    const items: ResultItem[] = []

    if (q.length > 0) {
      // Tasks
      const matchedTasks = tasks
        .filter(t => t.name.toLowerCase().includes(q))
        .slice(0, 5)
      matchedTasks.forEach(t => {
        items.push({
          id: `task-${t.id}`,
          label: t.name,
          group: 'Tasks',
          onSelect: () => { openSlideOver(t.id); close() },
        })
      })
    }

    // Views
    const viewEntries = Object.entries(VIEW_TITLES)
    const matchedViews = q.length > 0
      ? viewEntries.filter(([, label]) => label.toLowerCase().includes(q))
      : viewEntries.slice(0, 6)
    matchedViews.forEach(([key, label]) => {
      items.push({
        id: `view-${key}`,
        label: label,
        group: 'Views',
        onSelect: () => { setView(key as ViewName); close() },
      })
    })

    // Actions
    const actions: ResultItem[] = [
      {
        id: 'action-new-task',
        label: 'Create New Task',
        group: 'Actions',
        onSelect: () => { openModal({ type: 'addTask' }); close() },
      },
      {
        id: 'action-dark-mode',
        label: darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        group: 'Actions',
        onSelect: () => { toggleDarkMode(); close() },
      },
      {
        id: 'action-gradient',
        label: 'Change Background Theme',
        group: 'Actions',
        onSelect: () => {
          const presets = ['none', 'clean', 'frost', 'dawn', 'ocean', 'mint']
          const current = useUIStore.getState().gradientPreset
          const nextIdx = (presets.indexOf(current) + 1) % presets.length
          useUIStore.getState().setGradientPreset(presets[nextIdx])
          close()
        },
      },
      {
        id: 'action-accent',
        label: 'Change Accent Color',
        group: 'Actions',
        onSelect: () => {
          const colors = ['blue', 'red', 'purple', 'green', 'orange', 'pink'] as const
          const current = useUIStore.getState().accentColor
          const nextIdx = (colors.indexOf(current) + 1) % colors.length
          useUIStore.getState().setAccentColor(colors[nextIdx])
          close()
        },
      },
    ]
    const matchedActions = q.length > 0
      ? actions.filter(a => a.label.toLowerCase().includes(q))
      : actions
    items.push(...matchedActions)

    return items
  }, [query, tasks, darkMode, openSlideOver, setView, openModal, toggleDarkMode, close])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected(s => Math.min(s + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected(s => Math.max(s - 1, 0))
    } else if (e.key === 'Enter' && results[selected]) {
      e.preventDefault()
      results[selected].onSelect()
    }
  }, [results, selected])

  // Group results
  const grouped = useMemo(() => {
    const groups: Record<string, ResultItem[]> = {}
    results.forEach(r => {
      if (!groups[r.group]) groups[r.group] = []
      groups[r.group].push(r)
    })
    return groups
  }, [results])

  let flatIndex = -1

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => { if (e.target === e.currentTarget) close() }}
        >
          <div className="absolute inset-0 bg-[#000000]/40 backdrop-blur-sm" />

          <motion.div
            className="relative w-full max-w-lg mx-4 glass-panel rounded-[var(--radius-bento)] shadow-2xl overflow-hidden"
            initial={{ scale: 0.95, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: -10 }}
            transition={{ type: 'spring' as const, damping: 25, stiffness: 300 }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border)]">
              <MagnifyingGlass size={18} className="text-[var(--color-text-tertiary)] shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setSelected(0) }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-[var(--color-text-tertiary)]"
                dir="ltr"
              />
            </div>

            {/* Results */}
            <div className="max-h-[320px] overflow-y-auto py-2">
              {Object.entries(grouped).map(([group, items]) => (
                <div key={group}>
                  <div className="px-5 py-1.5 text-[10px] uppercase tracking-wider font-mono text-[var(--color-text-tertiary)]">
                    {group}
                  </div>
                  {items.map(item => {
                    flatIndex++
                    const idx = flatIndex
                    return (
                      <button
                        key={item.id}
                        onClick={item.onSelect}
                        onMouseEnter={() => setSelected(idx)}
                        className={`w-full flex items-center gap-3 px-5 py-2.5 text-[13px] text-right transition-colors ${
                          selected === idx
                            ? 'bg-[var(--color-accent)] text-white'
                            : 'hover:bg-[var(--color-surface-3)]/50'
                        }`}
                      >
                        {item.group === 'Tasks' && <ArrowRight size={14} className="shrink-0 opacity-50" />}
                        {item.group === 'Views' && <Keyboard size={14} className="shrink-0 opacity-50" />}
                        {item.group === 'Actions' && (
                          item.id.includes('dark')
                            ? (darkMode ? <Sun size={14} className="shrink-0 opacity-50" /> : <Moon size={14} className="shrink-0 opacity-50" />)
                            : item.id.includes('gradient')
                              ? <Palette size={14} className="shrink-0 opacity-50" />
                              : <Plus size={14} className="shrink-0 opacity-50" />
                        )}
                        <span className="truncate">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              ))}
              {results.length === 0 && (
                <div className="px-5 py-8 text-center text-[13px] text-[var(--color-text-tertiary)]">
                  No results found
                </div>
              )}
            </div>

            {/* Footer hints */}
            <div className="flex items-center gap-4 px-5 py-2.5 border-t border-[var(--color-border)] text-[10px] text-[var(--color-text-tertiary)] font-mono">
              <span><kbd className="bg-[var(--color-surface-3)] px-1 py-0.5 rounded text-[9px]">&uarr;&darr;</kbd> navigate</span>
              <span><kbd className="bg-[var(--color-surface-3)] px-1 py-0.5 rounded text-[9px]">&crarr;</kbd> select</span>
              <span><kbd className="bg-[var(--color-surface-3)] px-1 py-0.5 rounded text-[9px]">esc</kbd> close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
