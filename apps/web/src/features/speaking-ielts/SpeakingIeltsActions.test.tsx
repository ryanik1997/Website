// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import SpeakingIeltsPage from './SpeakingIeltsPage'

vi.mock('../speaking-ai/speakingAiApi', () => ({
  loadLatestSpeakingConversation: vi.fn().mockResolvedValue(null),
  sendSpeakingTurn: vi.fn(),
}))
vi.mock('../listening/tts', () => ({ speak: vi.fn() }))

function LocationProbe(){return <output data-testid="location">{useLocation().pathname}</output>}
function renderAt(path='/app/speaking/ielts'){
  return render(<MemoryRouter initialEntries={[path]}><Routes><Route path="*" element={<><SpeakingIeltsPage/><LocationProbe/></>}/></Routes></MemoryRouter>)
}
afterEach(()=>cleanup())

describe('IELTS Speaking landing card actions',()=>{
  it('renders the selected mockup hierarchy with one premium hero and five feature cards',()=>{
    const {container}=renderAt()
    expect(container.querySelector('main')).toHaveClass('si-landing')
    expect(screen.getByRole('heading',{name:'Mock interview đủ 3 phần'})).toBeInTheDocument()
    expect(container.querySelectorAll('.si-lab-card')).toHaveLength(6)
    expect([...container.querySelectorAll('.si-lab-card')].map(card=>card.getAttribute('data-card'))).toEqual(['premium','practice','roulette','forecast','shadowing','sample'])
    expect(screen.getByText('2',{selector:'.si-lab-fstats strong'})).toBeInTheDocument()
    expect(screen.getByText('32',{selector:'.si-lab-fstats strong'})).toBeInTheDocument()
    expect(screen.getByText('82',{selector:'.si-lab-fstats strong'})).toBeInTheDocument()
  })

  it('opens the topic modal from Practice Bank without navigating to Forecast',async()=>{
    const user=userEvent.setup();renderAt()
    await user.click(screen.getByRole('button',{name:/Practice Bank/i}))
    expect(screen.getByRole('dialog',{name:/Chọn Chủ Đề/i})).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/app/speaking/ielts')
    expect(screen.getByRole('tab',{name:/Part 1/i})).toHaveAttribute('aria-selected','true')
    expect(screen.getByRole('button',{name:'Hometown'})).toBeInTheDocument()
    expect(screen.getByRole('button',{name:/Chọn một chủ đề để bắt đầu/i})).toBeDisabled()
  })

  it('selects a random topic and starts a topic-specific Mock Interview',async()=>{
    vi.spyOn(Math,'random').mockReturnValue(0)
    const user=userEvent.setup();renderAt()
    await user.click(screen.getByRole('button',{name:/Practice Bank/i}))
    await user.click(screen.getByRole('button',{name:/Ngẫu nhiên/i}))
    const start=screen.getByRole('button',{name:/Bắt đầu luyện/i})
    expect(start).toBeEnabled()
    await user.click(start)
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/app\/speaking\/ielts\/mock-interview\/practice-/)
  })

  it.each([
    [/Dự đoán đề mới nhất/i,'/app/speaking/ielts/forecast'],
    [/Rút thẻ bất ngờ/i,'/app/speaking/ielts/roulette'],
    [/Nghe và nói như người bản xứ/i,'/app/shadowing'],
    [/Mock interview đủ 3 phần/i,'/app/speaking/ielts/mock-interview/demo'],
    [/Bài mẫu band cao/i,'/app/speaking/ielts/samples'],
  ])('maps card %s to %s',async(name,target)=>{
    const user=userEvent.setup();renderAt()
    await user.click(screen.getByRole('link',{name}))
    expect(screen.getByTestId('location')).toHaveTextContent(target)
  })
})

describe('IELTS Speaking Forecast and Samples',()=>{
  it('renders source Forecast controls and starts the selected item',async()=>{
    const user=userEvent.setup();renderAt('/app/speaking/ielts/forecast')
    expect(screen.getByRole('tab',{name:/PART 1 BẮT BUỘC.*2/i})).toBeInTheDocument()
    expect(screen.getByRole('tab',{name:/PART 1 CHỦ ĐỀ.*32/i})).toBeInTheDocument()
    expect(screen.getByRole('tab',{name:/PART 2 \+ 3.*82/i})).toBeInTheDocument()
    expect(screen.getByRole('searchbox',{name:/Tìm chủ đề/i})).toBeInTheDocument()
    const row=screen.getByRole('article',{name:/Where you live now/i})
    await user.click(row.querySelector('a,button[data-action="practice"]') as HTMLElement)
    expect(screen.getByTestId('location')).toHaveTextContent(/\/mock-interview\/forecast-p1-0-1$/)
  })

  it('shows a transparent Coming Soon samples page',()=>{
    renderAt('/app/speaking/ielts/samples')
    expect(screen.getByRole('heading',{name:/Bài mẫu band cao/i})).toBeInTheDocument()
    expect(screen.getByText(/đang được chuẩn bị/i)).toBeInTheDocument()
    expect(screen.getByText(/không phải dữ liệu crawl từ TID/i)).toBeInTheDocument()
  })
})
