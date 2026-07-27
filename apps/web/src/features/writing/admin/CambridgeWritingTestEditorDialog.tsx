import { useEffect, useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { CambridgeWritingTestSchema, type CambridgeWritingLevel, type CambridgeWritingTest } from '@ryan/catalog'
import { cambridgeWritingTestLocalRepo } from '@ryan/db'
import { cambridgeWritingTestRepo, type CambridgeWritingMergedTest } from '../cambridgeWritingTestRepo'
import CambridgeWritingCardPreview from './CambridgeWritingCardPreview'
import { mapFormToWritingTest } from './cambridgeWritingFormMapper'
import {
  createEmptyTask,
  getDefaultTitle,
  getNextTestNumber,
  type CambridgeWritingTestFormValue,
  validateCambridgeWritingTestForm,
} from './cambridgeWritingFormSchema'
import CambridgeWritingTestForm from './CambridgeWritingTestForm'
import './cambridgeWritingAdmin.css'

type EditorMode =
  | { type: 'create'; level: CambridgeWritingLevel }
  | { type: 'edit'; recordId: string; level: CambridgeWritingLevel }

export type CambridgeWritingTestEditorDialogProps = {
  open: boolean
  mode: EditorMode
  existingTests: CambridgeWritingMergedTest[]
  onClose: () => void
  onSaved?: (testId: string) => void
}

function buildInitialValue(level: CambridgeWritingLevel, tests: CambridgeWritingMergedTest[]): CambridgeWritingTestFormValue {
  const testNumber = getNextTestNumber(tests)
  return {
    testNumber,
    title: getDefaultTitle(level, testNumber),
    sourceUrl: '',
    tasks: [createEmptyTask(1)],
  }
}

function mapExistingTestToForm(test: CambridgeWritingTest): CambridgeWritingTestFormValue {
  return {
    testNumber: test.testNumber,
    title: test.title,
    sourceUrl: test.sourceUrl ?? '',
    tasks: test.tasks.map(task => ({
      clientId: crypto.randomUUID(),
      partNumber: task.partNumber,
      taskNumber: task.taskNumber,
      title: task.title,
      genre: task.genre,
      instruction: task.instruction,
      promptText: task.promptText ?? '',
      promptHtml: task.promptHtml ?? '',
      minWords: task.wordLimit?.min ?? null,
      maxWords: task.wordLimit?.max ?? null,
      wordLimitDisplayText: task.wordLimit?.displayText ?? '',
      compulsory: task.metadata?.compulsory ?? true,
      imageAssets: task.imageAssets ?? [],
    })),
  }
}

export default function CambridgeWritingTestEditorDialog({
  open,
  mode,
  existingTests,
  onClose,
  onSaved,
}: CambridgeWritingTestEditorDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const editingItem = mode.type === 'edit'
    ? existingTests.find(item => item.recordId === mode.recordId || item.test.id === mode.recordId) ?? null
    : null
  const [value, setValue] = useState<CambridgeWritingTestFormValue>(() => buildInitialValue(mode.level, existingTests))
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)
  const dirtyRef = useRef(false)

  useEffect(() => {
    if (!open) return
    returnFocusRef.current = document.activeElement as HTMLElement | null
    setValue(editingItem ? mapExistingTestToForm(editingItem.test) : buildInitialValue(mode.level, existingTests))
    setErrors([])
    setWarnings([])
    setSubmitError(null)
    dirtyRef.current = false
    window.setTimeout(() => closeButtonRef.current?.focus(), 0)
  }, [editingItem, existingTests, mode.level, open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        handleClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const previewTest = useMemo(() => {
    try {
      return mapFormToWritingTest(mode.level, value, editingItem?.test.id)
    } catch {
      return null
    }
  }, [editingItem?.test.id, mode.level, value])

  function updateValue(next: CambridgeWritingTestFormValue) {
    dirtyRef.current = true
    setValue(next)
  }

  function handleClose() {
    if (dirtyRef.current && !window.confirm('Bạn có thay đổi chưa lưu. Đóng dialog?')) return
    onClose()
    window.setTimeout(() => returnFocusRef.current?.focus(), 0)
  }

  function validateDraft() {
    const validated = validateCambridgeWritingTestForm(value)
    return { parsed: validated.ok, nextErrors: validated.errors, nextWarnings: validated.warnings }
  }

  async function handleSave() {
    setSaving(true)
    setSubmitError(null)
    try {
      const { parsed, nextErrors, nextWarnings } = validateDraft()
      setErrors(nextErrors)
      setWarnings(nextWarnings)
      if (!parsed) return

      const editingId = editingItem?.test.id
      const localConflict = await cambridgeWritingTestLocalRepo.findConflictingTestNumber(mode.level, value.testNumber, editingId)
      if (localConflict) {
        setErrors([`testNumber: Test number ${value.testNumber} already exists.`])
        return
      }
      const seedConflict = existingTests.find(item => item.test.testNumber === value.testNumber && item.test.id !== editingId)
      if (seedConflict) {
        setErrors([`testNumber: Test number ${value.testNumber} already exists.`])
        return
      }

      const mapped = mapFormToWritingTest(mode.level, value, editingId)
      const parsedPayload = CambridgeWritingTestSchema.safeParse(mapped)
      if (!parsedPayload.success) {
        setErrors(parsedPayload.error.issues.map(issue => `${issue.path.join('.') || 'payload'}: ${issue.message}`))
        return
      }

      if (mode.type === 'edit' && editingId) {
        await cambridgeWritingTestRepo.updateDraft(editingId, parsedPayload.data)
        onSaved?.(editingId)
      } else {
        await cambridgeWritingTestRepo.createDraft(parsedPayload.data)
        onSaved?.(parsedPayload.data.id)
      }
      dirtyRef.current = false
      onClose()
      window.setTimeout(() => returnFocusRef.current?.focus(), 0)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Không thể lưu draft.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="cb-admin-overlay" onClick={handleClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cambridge-writing-editor-title"
        className="cb-admin-dialog"
        onClick={event => event.stopPropagation()}
      >
        <div className="cb-admin-head">
          <div>
            <h2 id="cambridge-writing-editor-title" style={{ margin: 0, fontSize: '1.05rem' }}>
              {mode.type === 'edit' ? 'Chỉnh sửa draft Writing' : 'Tạo đề Writing mới'}
            </h2>
            <div className="cb-admin-muted" style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
              Thông tin test · Danh sách task · Preview card
            </div>
          </div>
          <button ref={closeButtonRef} type="button" className="cb-admin-mini-btn" onClick={handleClose}>
            <X size={14} />
            Đóng
          </button>
        </div>

        <div className="cb-admin-body">
          <div className="cb-admin-layout">
            <CambridgeWritingTestForm
              level={mode.level}
              value={value}
              existingTests={existingTests}
              errors={errors}
              warnings={warnings}
              onChange={updateValue}
            />

            <div className="cb-admin-section cb-admin-preview">
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Preview card</h3>
              <CambridgeWritingCardPreview test={previewTest} />
              {submitError ? <div className="cb-admin-error">{submitError}</div> : null}
            </div>
          </div>
        </div>

        <div className="cb-admin-foot">
          <button type="button" className="cb-admin-secondary" onClick={handleClose}>Hủy</button>
          <button type="button" className="cb-admin-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu nháp'}
          </button>
        </div>
      </div>
    </div>
  )
}
