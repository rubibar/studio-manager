import { useState } from 'react'
import { TEAM } from '@/lib/constants'
import { Plus, Target } from '@phosphor-icons/react'

interface KeyResult {
  id: number
  text: string
  current: number
  target: number
}

interface Objective {
  id: number
  objective: string
  owner: string
  keyResults: KeyResult[]
}

// Initial sample OKRs (in a production app, these would come from a store)
const INITIAL_OKRS: Objective[] = [
  {
    id: 1,
    objective: 'הגדלת בסיס הלקוחות ב-50%',
    owner: 'rubi',
    keyResults: [
      { id: 1, text: 'סגירת 5 לקוחות חדשים', current: 2, target: 5 },
      { id: 2, text: 'יצירת 10 לידים חדשים בחודש', current: 7, target: 10 },
      { id: 3, text: 'שיפור שיעור המרה ל-30%', current: 22, target: 30 },
    ],
  },
  {
    id: 2,
    objective: 'שיפור איכות התוצרים',
    owner: 'dana',
    keyResults: [
      { id: 1, text: '0 תיקונים חוזרים מלקוחות', current: 3, target: 0 },
      { id: 2, text: 'יצירת 5 טמפלייטים חדשים', current: 2, target: 5 },
      { id: 3, text: 'קיצור זמן הפקה ב-20%', current: 10, target: 20 },
    ],
  },
  {
    id: 3,
    objective: 'בניית נוכחות דיגיטלית חזקה',
    owner: 'gilad',
    keyResults: [
      { id: 1, text: '10,000 עוקבים באינסטגרם', current: 4500, target: 10000 },
      { id: 2, text: 'פרסום 3 פוסטים בשבוע', current: 2, target: 3 },
      { id: 3, text: 'הגעה ל-50 צפיות ביוטיוב לסרטון', current: 30, target: 50 },
    ],
  },
]

export function OKR() {
  const [okrs, setOkrs] = useState<Objective[]>(INITIAL_OKRS)
  const [newObj, setNewObj] = useState('')
  const [newOwner, setNewOwner] = useState(TEAM[0]?.id || '')

  function addOKR() {
    if (!newObj.trim()) return
    const nextId = okrs.length ? Math.max(...okrs.map(o => o.id)) + 1 : 1
    setOkrs([...okrs, { id: nextId, objective: newObj.trim(), owner: newOwner, keyResults: [] }])
    setNewObj('')
  }

  function addKR(okrId: number, text: string) {
    if (!text.trim()) return
    setOkrs(prev => prev.map(o => {
      if (o.id !== okrId) return o
      const nextKrId = o.keyResults.length ? Math.max(...o.keyResults.map(k => k.id)) + 1 : 1
      return { ...o, keyResults: [...o.keyResults, { id: nextKrId, text: text.trim(), current: 0, target: 100 }] }
    }))
  }

  function updateKR(okrId: number, krId: number, value: number) {
    setOkrs(prev => prev.map(o => {
      if (o.id !== okrId) return o
      return {
        ...o,
        keyResults: o.keyResults.map(kr =>
          kr.id === krId ? { ...kr, current: value } : kr
        ),
      }
    }))
  }

  return (
    <div className="space-y-5">
      {/* Add OKR */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-4">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-[var(--color-accent)] shrink-0" />
          <input
            className="flex-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[8px] py-2 px-3 text-[13px] outline-none focus:border-[var(--color-accent)]"
            placeholder="New objective..."
            value={newObj}
            onChange={e => setNewObj(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addOKR()}
          />
          <select
            className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[8px] py-2 px-3 text-[12px]"
            value={newOwner}
            onChange={e => setNewOwner(e.target.value)}
          >
            {TEAM.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <button
            className="px-3 py-2 rounded-[8px] bg-[var(--color-accent)] text-white text-[12px] font-medium hover:opacity-90 transition-opacity flex items-center gap-1"
            onClick={addOKR}
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </div>

      {/* OKR Cards */}
      {okrs.map(o => {
        const member = TEAM.find(m => m.id === o.owner)
        const avgProgress = o.keyResults.length
          ? Math.round(
            o.keyResults.reduce((s, kr) => {
              if (kr.target === 0) return s + (kr.current === 0 ? 100 : 0)
              return s + Math.min(Math.round((kr.current / kr.target) * 100), 100)
            }, 0) / o.keyResults.length
          )
          : 0
        const progressColor = avgProgress >= 70 ? 'var(--color-accent)' : avgProgress >= 40 ? 'var(--color-yellow)' : 'var(--color-red)'

        return (
          <div key={o.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
            {/* Objective header */}
            <div className="flex items-center gap-3 mb-3">
              {member && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: member.color }}>
                  {member.name[0]}
                </div>
              )}
              <span className="flex-1 text-[14px] font-bold">{o.objective}</span>
              <span className="text-[18px] font-bold font-mono" style={{ color: progressColor }}>
                {avgProgress}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 rounded-full bg-[var(--color-surface-3)] overflow-hidden mb-4">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${avgProgress}%`, background: progressColor }}
              />
            </div>

            {/* Key results */}
            <div className="space-y-3">
              {o.keyResults.map(kr => {
                const krPct = kr.target > 0 ? Math.min(Math.round((kr.current / kr.target) * 100), 100) : (kr.current === 0 ? 100 : 0)
                const krColor = krPct >= 70 ? 'var(--color-accent)' : krPct >= 40 ? 'var(--color-yellow)' : 'var(--color-red)'

                return (
                  <div key={kr.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-[12px] mb-1">
                        <span>{kr.text}</span>
                        <span style={{ color: krColor }}>{krPct}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${krPct}%`, background: krColor }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] min-w-[80px]">
                      <input
                        className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[6px] py-1 px-2 text-[11px] font-mono w-14 text-center"
                        type="number"
                        value={kr.current}
                        onChange={e => updateKR(o.id, kr.id, parseFloat(e.target.value) || 0)}
                      />
                      <span className="text-[var(--color-text-tertiary)]">/ {kr.target}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Add KR */}
            <KRInput onAdd={(text) => addKR(o.id, text)} />
          </div>
        )
      })}
    </div>
  )
}

function KRInput({ onAdd }: { onAdd: (text: string) => void }) {
  const [text, setText] = useState('')
  return (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
      <input
        className="flex-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[6px] py-1.5 px-3 text-[12px] outline-none focus:border-[var(--color-accent)]"
        placeholder="Add key result..."
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { onAdd(text); setText('') } }}
      />
      <button
        className="px-2 py-1.5 rounded-[6px] bg-[var(--color-surface-3)] text-[12px] hover:bg-[var(--color-border)] transition-colors"
        onClick={() => { onAdd(text); setText('') }}
      >
        +
      </button>
    </div>
  )
}
