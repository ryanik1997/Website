import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ExamSkillPicker from './ExamSkillPicker'

describe('ExamSkillPicker', () => {
  it('renders the Writing description with correct Vietnamese text and no mojibake', () => {
    const onPick = vi.fn()

    const { container } = render(
      <ExamSkillPicker
        brandTitle="PET · B1"
        backLabel="Cambridge"
        onBack={vi.fn()}
        listeningCount={1}
        readingCount={1}
        writingCount={1}
        onPick={onPick}
        skills={['listening', 'reading', 'writing']}
      />,
    )

    const expected =
      'Luyện viết theo đúng cấu trúc đề Cambridge với đề mẫu thật và workspace chấm AI hiện có.'

    expect(screen.getByText(expected)).toBeInTheDocument()

    const description = container.querySelector('.exam-skill-card--writing .exam-skill-card__desc')
    expect(description?.textContent).toBe(expected)
    expect(description?.textContent).not.toMatch(/Ã|Ä|á»|áº|Â|â€/)
  })
})
