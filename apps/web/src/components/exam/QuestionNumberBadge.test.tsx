import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { QuestionNumberBadge } from './QuestionNumberBadge'

afterEach(cleanup)

describe('QuestionNumberBadge', () => {
  it('renders number 7', () => {
    render(<QuestionNumberBadge number={7} />)
    expect(screen.getByText('7')).toBeTruthy()
  })

  it('renders number 47', () => {
    render(<QuestionNumberBadge number={47} />)
    expect(screen.getByText('47')).toBeTruthy()
  })

  it('defaults to unanswered state', () => {
    render(<QuestionNumberBadge number={1} />)
    const badge = screen.getByRole('button')
    expect(badge.getAttribute('data-state')).toBe('unanswered')
  })

  it('applies current state', () => {
    render(<QuestionNumberBadge number={1} state="current" />)
    const badge = screen.getByRole('button')
    expect(badge.getAttribute('data-state')).toBe('current')
  })

  it('applies answered state', () => {
    render(<QuestionNumberBadge number={1} state="answered" />)
    const badge = screen.getByRole('button')
    expect(badge.getAttribute('data-state')).toBe('answered')
  })

  it('applies disabled state', () => {
    render(<QuestionNumberBadge number={1} state="disabled" />)
    const badge = screen.getByRole('button')
    expect(badge.getAttribute('data-state')).toBe('disabled')
  })

  it('applies correct state', () => {
    render(<QuestionNumberBadge number={1} state="correct" />)
    const badge = screen.getByRole('button')
    expect(badge.getAttribute('data-state')).toBe('correct')
  })

  it('applies incorrect state', () => {
    render(<QuestionNumberBadge number={1} state="incorrect" />)
    const badge = screen.getByRole('button')
    expect(badge.getAttribute('data-state')).toBe('incorrect')
  })

  it('renders bookmark indicator when bookmarked', () => {
    const { container } = render(
      <QuestionNumberBadge number={1} bookmarked />,
    )
    const bookmark = container.querySelector(
      '.exam-question-number-badge__bookmark',
    )
    expect(bookmark).toBeTruthy()
    const badge = screen.getByRole('button')
    expect(badge.getAttribute('data-bookmarked')).toBe('true')
  })

  it('does not render bookmark indicator when not bookmarked', () => {
    const { container } = render(
      <QuestionNumberBadge number={1} bookmarked={false} />,
    )
    const bookmark = container.querySelector(
      '.exam-question-number-badge__bookmark',
    )
    expect(bookmark).toBeNull()
  })

  it('calls onClick callback when clicked', () => {
    const onClick = vi.fn()
    render(<QuestionNumberBadge number={1} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('sets aria-current="step" only for current state', () => {
    const { rerender } = render(<QuestionNumberBadge number={1} state="current" />)
    expect(screen.getByRole('button').getAttribute('aria-current')).toBe('step')

    rerender(<QuestionNumberBadge number={1} state="answered" />)
    expect(screen.getByRole('button').getAttribute('aria-current')).toBeNull()

    rerender(<QuestionNumberBadge number={1} state="unanswered" />)
    expect(screen.getByRole('button').getAttribute('aria-current')).toBeNull()
  })

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn()
    render(<QuestionNumberBadge number={1} disabled onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('has data-question-number-badge="true" attribute', () => {
    render(<QuestionNumberBadge number={1} />)
    const badge = screen.getByRole('button')
    expect(badge.getAttribute('data-question-number-badge')).toBe('true')
  })

  it('does not have rounded-full class', () => {
    const { container } = render(<QuestionNumberBadge number={1} />)
    const badge = container.querySelector('.exam-question-number-badge')
    expect(badge?.className).not.toContain('rounded-full')
    expect(badge?.className).not.toContain('rounded-[50%]')
  })
})
