import { useMemo } from 'react'
import { useTaskStore } from '@/stores/taskStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { computeAllScores } from '@/lib/scoring'
import type { ScoreMap } from '@/types/task'

let frozenScoreCache: ScoreMap = {}

export function useScoring(): {
  scoreMap: ScoreMap
  getScore: (taskId: number) => number
} {
  const tasks = useTaskStore(s => s.tasks)
  const thursdayMode = useSettingsStore(s => s.thursdayMeetingMode)
  const teamCapacity = useSettingsStore(s => s.teamCapacity)

  const scoreMap = useMemo(() => {
    const scores = computeAllScores(tasks, new Date(), teamCapacity)
    if (thursdayMode) {
      // On first computation in thursday mode, freeze. After that, return frozen.
      if (Object.keys(frozenScoreCache).length === 0) {
        frozenScoreCache = { ...scores }
      }
      return frozenScoreCache
    } else {
      frozenScoreCache = {}
      return scores
    }
  }, [tasks, thursdayMode, teamCapacity])

  const getScore = (taskId: number) => scoreMap[taskId] || 0

  return { scoreMap, getScore }
}
