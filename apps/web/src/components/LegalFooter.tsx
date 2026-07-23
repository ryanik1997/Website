import { Link } from 'react-router-dom'
import './legalFooter.css'

export default function LegalFooter({
  compact = false,
  onImage = false,
}: {
  compact?: boolean
  onImage?: boolean
}) {
  return (
    <footer
      className={`site-legal-footer${compact ? ' site-legal-footer--compact' : ''}${onImage ? ' site-legal-footer--image' : ''}`}
    >
      <span>© 2026 Ryan English. All rights reserved.</span>
      <span className="site-legal-footer__links">
        <Link to="/terms">Điều khoản</Link>
        <Link to="/privacy">Quyền riêng tư</Link>
      </span>
    </footer>
  )
}
