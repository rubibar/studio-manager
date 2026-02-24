import { create } from 'zustand'
import { ref, onValue, set as fbSet } from 'firebase/database'
import { db } from '@/firebase'
import { TEAM } from '@/lib/constants'

interface SettingsState {
  thursdayMeetingMode: boolean
  teamCapacity: Record<string, boolean>

  initSync: () => () => void
  toggleThursdayMeeting: (enabled: boolean) => void
  toggleCapacity: (memberId: string) => void
  isAtCapacity: (memberId: string) => boolean
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  thursdayMeetingMode: false,
  teamCapacity: Object.fromEntries(TEAM.map(m => [m.id, false])),

  initSync: () => {
    const settingsRef = ref(db, 'settings/criticality')
    const unsub = onValue(settingsRef, (snap) => {
      const data = snap.val()
      if (data) {
        if (typeof data.thursdayMeetingMode === 'boolean') {
          set({ thursdayMeetingMode: data.thursdayMeetingMode })
        }
        if (data.teamCapacity) {
          set((s) => {
            const updated = { ...s.teamCapacity }
            TEAM.forEach(m => {
              if (typeof data.teamCapacity[m.id] === 'boolean') {
                updated[m.id] = data.teamCapacity[m.id]
              }
            })
            return { teamCapacity: updated }
          })
        }
      }
    })
    return unsub
  },

  toggleThursdayMeeting: (enabled) => {
    set({ thursdayMeetingMode: enabled })
    fbSet(ref(db, 'settings/criticality/thursdayMeetingMode'), enabled)
  },

  toggleCapacity: (memberId) => {
    const current = get().teamCapacity[memberId]
    const next = !current
    set((s) => ({
      teamCapacity: { ...s.teamCapacity, [memberId]: next },
    }))
    fbSet(ref(db, `settings/criticality/teamCapacity/${memberId}`), next)
  },

  isAtCapacity: (memberId) => get().teamCapacity[memberId] === true,
}))
