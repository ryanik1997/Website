import { useState } from 'react'
import { Info, Plus } from 'lucide-react'
import type { CambridgeWritingLevel } from '@ryan/catalog'
import type { CambridgeWritingMergedTest } from '../cambridgeWritingTestRepo'
import { CAMBRIDGE_WRITING_COPY } from '../cambridgeWritingCopy'
import CambridgeWritingAdminGuideDialog from './CambridgeWritingAdminGuideDialog'
import CambridgeWritingTestEditorDialog from './CambridgeWritingTestEditorDialog'

type Props = {
  level: CambridgeWritingLevel
  tests: CambridgeWritingMergedTest[]
}

export default function CambridgeWritingCreateButton({ level, tests }: Props) {
  const [open, setOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)

  return (
    <>
      <div className="cb-level-actions">
        <button type="button" className="cb-admin-create" onClick={() => setGuideOpen(true)}>
          <Info size={16} />
          {CAMBRIDGE_WRITING_COPY.adminGuideButton}
        </button>

        <button type="button" className="cb-admin-create" onClick={() => setOpen(true)}>
          <Plus size={16} />
          {CAMBRIDGE_WRITING_COPY.createTest}
        </button>
      </div>

      <CambridgeWritingAdminGuideDialog
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
      />

      <CambridgeWritingTestEditorDialog
        open={open}
        mode={{ type: 'create', level }}
        existingTests={tests}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
