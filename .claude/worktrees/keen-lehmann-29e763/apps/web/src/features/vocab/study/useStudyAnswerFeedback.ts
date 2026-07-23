import { useCallback, useState } from 'react'
import { celebrateCorrect, signalWrong } from '../../../lib/studyFeedback'

export function useStudyAnswerFeedback() {
  const [burstId, setBurstId] = useState(0)

  const onCorrect = useCallback(() => {
    celebrateCorrect()
    setBurstId(b => b + 1)
  }, [])

  const onWrong = useCallback(() => {
    signalWrong()
  }, [])

  const clearFireworks = useCallback(() => setBurstId(0), [])

  return { burstId, onCorrect, onWrong, clearFireworks }
}