import type { CambridgeWritingTest } from '@ryan/catalog'
import CambridgeWritingTestCard from '../CambridgeWritingTestCard'

export default function CambridgeWritingCardPreview({ test }: { test: CambridgeWritingTest | null }) {
  if (!test) {
    return <div className="cb-admin-muted">Preview sẽ hiện khi form hợp lệ cơ bản.</div>
  }

  return (
    <CambridgeWritingTestCard
      test={test}
      adminMode
      interactive={false}
      preview
      origin="admin_local"
      editable
    />
  )
}
