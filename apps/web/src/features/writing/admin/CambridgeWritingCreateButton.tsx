import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { CambridgeWritingLevel } from '@ryan/catalog'
import type { CambridgeWritingMergedTest } from '../cambridgeWritingTestRepo'
import CambridgeWritingTestEditorDialog from './CambridgeWritingTestEditorDialog'

type Props = {
  level: CambridgeWritingLevel
  tests: CambridgeWritingMergedTest[]
}

export default function CambridgeWritingCreateButton({ level, tests }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" className="cb-admin-create" onClick={() => setOpen(true)}>
        <Plus size={16} />
        Tạo đề mới
      </button>

      <CambridgeWritingTestEditorDialog
        open={open}
        mode={{ type: 'create', level }}
        existingTests={tests}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
