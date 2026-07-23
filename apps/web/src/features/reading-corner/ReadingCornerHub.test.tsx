import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import ReadingCornerHub from './ReadingCornerHub'

describe('ReadingCornerHub', () => {
  it('provides a back link to the app home page', () => {
    render(
      <MemoryRouter>
        <ReadingCornerHub />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Quay lại' })).toHaveAttribute(
      'href',
      '/app/home',
    )
  })
})
