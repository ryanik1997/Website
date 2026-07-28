import { Link } from 'react-router-dom'
import './termsConsentCheckbox.css'

export default function TermsConsentCheckbox({
  checked,
  disabled = false,
  onChange,
}: {
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="legal-consent">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        required
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>
        Tôi đồng ý với <Link to="/terms">Điều khoản dịch vụ</Link> và{' '}
        <Link to="/privacy">Chính sách quyền riêng tư</Link>.
      </span>
    </label>
  )
}
