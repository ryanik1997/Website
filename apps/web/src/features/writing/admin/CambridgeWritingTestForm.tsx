import type { CambridgeWritingLevel } from '@ryan/catalog'
import type { CambridgeWritingMergedTest } from '../cambridgeWritingTestRepo'
import CambridgeWritingTaskEditor from './CambridgeWritingTaskEditor'
import {
  createEmptyTask,
  getDefaultTitle,
  getNextTestNumber,
  type CambridgeWritingTaskFormValue,
  type CambridgeWritingTestFormValue,
} from './cambridgeWritingFormSchema'

type Props = {
  level: CambridgeWritingLevel
  value: CambridgeWritingTestFormValue
  existingTests: CambridgeWritingMergedTest[]
  errors: string[]
  warnings: string[]
  onChange: (next: CambridgeWritingTestFormValue) => void
}

function moveTask(tasks: CambridgeWritingTaskFormValue[], from: number, to: number) {
  const next = [...tasks]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export default function CambridgeWritingTestForm({
  level,
  value,
  existingTests,
  errors,
  warnings,
  onChange,
}: Props) {
  const levelLabel = {
    a2: 'KET · A2',
    b1: 'PET · B1',
    b2: 'FCE · B2',
    c1: 'CAE · C1',
    c2: 'CPE · C2',
  }[level]

  function updateTask(index: number, nextTask: CambridgeWritingTaskFormValue) {
    const nextTasks = value.tasks.map((task, taskIndex) => taskIndex === index ? nextTask : task)
    onChange({ ...value, tasks: nextTasks })
  }

  function addTask() {
    const nextTaskNumber = value.tasks.length === 0 ? 1 : Math.max(...value.tasks.map(task => task.taskNumber)) + 1
    onChange({ ...value, tasks: [...value.tasks, createEmptyTask(nextTaskNumber)] })
  }

  return (
    <div className="cb-admin-section">
      <h3 style={{ margin: '0 0 0.9rem', fontSize: '1rem' }}>Thông tin test</h3>
      <div className="cb-admin-grid">
        <div className="cb-admin-field">
          <label>Level</label>
          <input className="cb-admin-input" value={levelLabel} readOnly />
        </div>
        <div className="cb-admin-field">
          <label>Test number</label>
          <input
            className="cb-admin-input"
            type="number"
            value={value.testNumber}
            onChange={(event) => {
              const testNumber = Number(event.target.value) || 1
              const fallbackTitle = getDefaultTitle(level, testNumber)
              const currentDefaultPrefix = getDefaultTitle(level, value.testNumber)
              onChange({
                ...value,
                testNumber,
                title: value.title === currentDefaultPrefix ? fallbackTitle : value.title,
              })
            }}
          />
          <span className="cb-admin-inline-note cb-admin-muted">
            Gợi ý tiếp theo: {getNextTestNumber(existingTests)}
          </span>
        </div>
        <div className="cb-admin-field">
          <label>Title</label>
          <input className="cb-admin-input" value={value.title} onChange={event => onChange({ ...value, title: event.target.value })} />
        </div>
        <div className="cb-admin-field">
          <label>Source URL</label>
          <input className="cb-admin-input" value={value.sourceUrl} onChange={event => onChange({ ...value, sourceUrl: event.target.value })} />
        </div>
      </div>

      {errors.length > 0 ? (
        <div style={{ marginTop: '0.85rem' }}>
          {errors.map(error => <div key={error} className="cb-admin-error">{error}</div>)}
        </div>
      ) : null}

      {warnings.length > 0 ? (
        <div style={{ marginTop: '0.5rem' }}>
          {warnings.map(warning => <div key={warning} className="cb-admin-warning">{warning}</div>)}
        </div>
      ) : null}

      <div style={{ marginTop: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>Danh sách task</h3>
        <button type="button" className="cb-admin-primary" onClick={addTask}>+ Thêm task</button>
      </div>

      <div className="cb-admin-task-list" style={{ marginTop: '0.85rem' }}>
        {value.tasks.map((task, index) => (
          <CambridgeWritingTaskEditor
            key={task.clientId}
            level={level}
            task={task}
            index={index}
            total={value.tasks.length}
            errorPrefix={errors.find(error => error.includes(`tasks.${index}`))}
            onChange={(nextTask) => updateTask(index, nextTask)}
            onDuplicate={() => {
              const nextTaskNumber = Math.max(...value.tasks.map(item => item.taskNumber)) + 1
              const duplicate = {
                ...task,
                clientId: crypto.randomUUID(),
                taskNumber: nextTaskNumber,
                title: `${task.title} copy`,
              }
              const nextTasks = [...value.tasks]
              nextTasks.splice(index + 1, 0, duplicate)
              onChange({ ...value, tasks: nextTasks })
            }}
            onMoveUp={() => onChange({ ...value, tasks: moveTask(value.tasks, index, index - 1) })}
            onMoveDown={() => onChange({ ...value, tasks: moveTask(value.tasks, index, index + 1) })}
            onDelete={() => {
              if (value.tasks.length <= 1) return
              onChange({ ...value, tasks: value.tasks.filter((_, taskIndex) => taskIndex !== index) })
            }}
          />
        ))}
      </div>
    </div>
  )
}
