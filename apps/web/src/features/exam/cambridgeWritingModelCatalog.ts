/**
 * Catalog bài mẫu Writing Cambridge (A2–C2) — dùng tham khảo / demo.
 * Có thể mở rộng; exam.json có `modelAnswer` trên question thì ưu tiên hiển thị trước.
 */

export type CambridgeWritingLevel = 'a2' | 'b1' | 'b2' | 'c1' | 'c2'

export interface CambridgeWritingModelEntry {
  id: string
  level: CambridgeWritingLevel
  /** email | story | article | essay | letter | report | review | proposal */
  genre: string
  title: string
  prompt: string
  modelAnswer: string
  notesVi: string
  usefulPhrases?: { phrase: string; meaningVi: string }[]
}

export const CAMBRIDGE_WRITING_MODEL_CATALOG: CambridgeWritingModelEntry[] = [
  {
    id: 'a2-email-friend',
    level: 'a2',
    genre: 'email',
    title: 'A2 · Email to a friend',
    prompt: 'Write an email to your friend Sam about your weekend plans. Say where you want to go and invite Sam.',
    modelAnswer:
      'Hi Sam,\n\nHow are you? This weekend I want to go to the park near my house. We can take some food and play football. Would you like to come with me on Saturday afternoon?\n\nPlease write soon!\n\nBest wishes,\nAlex',
    notesVi: 'Email ngắn (~35–45 từ), đủ 3 ý: chào, kế hoạch, mời bạn.',
    usefulPhrases: [
      { phrase: 'Would you like to come with me…?', meaningVi: 'Bạn có muốn đi cùng mình không?' },
      { phrase: 'Please write soon!', meaningVi: 'Nhớ viết lại sớm nhé!' },
    ],
  },
  {
    id: 'a2-story-pictures',
    level: 'a2',
    genre: 'story',
    title: 'A2 · Story from pictures',
    prompt: 'Look at the three pictures and write the story. Write 35 words or more.',
    modelAnswer:
      'Last Saturday, Tom went to the beach with his family. First, they put a blanket on the sand. Then Tom built a big sandcastle. Suddenly, a big wave came and destroyed it, but everyone laughed and Tom started again.',
    notesVi: 'Kể đúng thứ tự tranh, dùng thì quá khứ đơn, có mở–thân–kết.',
  },
  {
    id: 'b1-email-party',
    level: 'b1',
    genre: 'email',
    title: 'B1 · Email invitation reply',
    prompt: 'Your English friend has invited you to a party. Write an email to accept, ask about clothes, and offer to bring something.',
    modelAnswer:
      'Hi Jamie,\n\nThanks for inviting me to your party on Friday — I would love to come! What should I wear? Is it casual or more formal? Also, I can bring some snacks or soft drinks if you like.\n\nSee you soon,\nMia',
    notesVi: 'PET email: chấp nhận, hỏi 1 chi tiết, đề nghị giúp — khoảng 100 từ.',
  },
  {
    id: 'b1-story-open',
    level: 'b1',
    genre: 'story',
    title: 'B1 · Story (opening sentence)',
    prompt: 'Your English teacher has asked you to write a story. Your story must begin with this sentence: When I opened the door, I could not believe my eyes.',
    modelAnswer:
      'When I opened the door, I could not believe my eyes. My living room was full of colourful balloons and a huge cake stood on the table. All my friends shouted “Surprise!” I had completely forgotten it was my birthday. We spent the evening laughing, taking photos and eating pizza. It was the best evening I had had all year, and I felt very lucky to have such kind friends.',
    notesVi: 'Bắt buộc dùng câu mở đề; có cảm xúc + kết thúc rõ.',
  },
  {
    id: 'b2-essay-technology',
    level: 'b2',
    genre: 'essay',
    title: 'B2 · Essay — technology in education',
    prompt: 'Some people say that technology has made learning easier for students. Others believe it causes more problems than benefits. Discuss both views and give your opinion.',
    modelAnswer:
      'Technology has transformed the way students learn, and opinions differ on whether this change is mainly positive.\n\nOn the one hand, digital tools make information easier to access. Online libraries, educational videos and interactive exercises allow learners to study at their own pace and revise difficult topics more effectively. Collaboration is also simpler because classmates can share documents and receive feedback quickly.\n\nOn the other hand, technology can distract students. Social media notifications and games often interrupt concentration, and not every learner has equal access to reliable devices or internet. In addition, copying from the internet may reduce independent thinking if teachers do not set clear guidelines.\n\nIn my opinion, technology is beneficial when it is used carefully. Schools should teach digital skills and set limits so that devices support learning rather than replace real effort. Overall, the advantages outweigh the disadvantages if students and teachers use technology responsibly.',
    notesVi: 'FCE essay: cả hai quan điểm + ý kiến cá nhân, liên kết rõ (~140–190 từ).',
    usefulPhrases: [
      { phrase: 'On the one hand… On the other hand…', meaningVi: 'Một mặt… Mặt khác…' },
      { phrase: 'the advantages outweigh the disadvantages', meaningVi: 'lợi nhiều hơn hại' },
    ],
  },
  {
    id: 'c1-proposal-club',
    level: 'c1',
    genre: 'proposal',
    title: 'C1 · Proposal — student club',
    prompt: 'The college wants to improve student life. Write a proposal suggesting a new club, explaining benefits and what resources are needed.',
    modelAnswer:
      'Proposal: Launching a Sustainability Club\n\nIntroduction\nThis proposal recommends setting up a Sustainability Club to raise environmental awareness and create practical projects on campus.\n\nBenefits\nA weekly club would encourage students from different courses to collaborate on recycling campaigns, campus clean-ups and guest talks. It would also strengthen the college’s reputation as a responsible institution and give participants leadership experience for their CVs.\n\nResources required\nWe would need a classroom one evening a week, a small budget for posters and materials, and support from the student union for publicity. A staff mentor would help ensure activities remain safe and well organised.\n\nConclusion\nWith modest resources, a Sustainability Club could improve student engagement while delivering clear community benefits. I recommend piloting the club for one term and then reviewing participation numbers.',
    notesVi: 'CAE proposal: heading rõ, formal, kết luận có đề xuất.',
  },
  {
    id: 'c2-article-cities',
    level: 'c2',
    genre: 'article',
    title: 'C2 · Article — future cities',
    prompt: 'Write an article for an international magazine about how cities might change over the next fifty years.',
    modelAnswer:
      'Cities of Tomorrow: Quieter, Greener, Smarter\n\nStand in a major city today and you hear traffic, see towers of glass and feel the rush of millions of people. In fifty years, that picture may look quite different.\n\nMany urban planners expect transport to become cleaner and more automated. Electric vehicles, expanded public transit and pedestrian-first streets could reduce pollution and free space currently used for parking. Housing, too, is likely to evolve: flexible apartments, shared workspaces and rooftop gardens may become normal as land grows more expensive.\n\nTechnology will sit quietly in the background. Sensors could manage energy and water more efficiently, while neighbourhood apps help residents organise services. Yet the real challenge will not be inventing gadgets but protecting social life. Cities that succeed will keep parks, cultural venues and affordable neighbourhoods at the centre of design, so that progress does not push people out.\n\nThe cities of the future need not be cold or impersonal. If we plan carefully, they can be places where convenience and community finally grow side by side.',
    notesVi: 'CPE article: tiêu đề hấp dẫn, register semi-formal, ý phức tạp nhưng mạch lạc.',
  },
]

export function listModelAnswersByLevel(level?: CambridgeWritingLevel): CambridgeWritingModelEntry[] {
  if (!level) return CAMBRIDGE_WRITING_MODEL_CATALOG
  return CAMBRIDGE_WRITING_MODEL_CATALOG.filter(e => e.level === level)
}

export function findModelAnswerById(id: string): CambridgeWritingModelEntry | undefined {
  return CAMBRIDGE_WRITING_MODEL_CATALOG.find(e => e.id === id)
}

/** Gợi ý entry catalog gần với prompt (keyword đơn giản) */
export function suggestModelAnswers(
  level: CambridgeWritingLevel | undefined,
  prompt: string,
  limit = 3,
): CambridgeWritingModelEntry[] {
  const pool = listModelAnswersByLevel(level)
  const q = prompt.toLowerCase()
  const scored = pool.map(e => {
    const hay = `${e.title} ${e.genre} ${e.prompt}`.toLowerCase()
    let score = 0
    for (const w of q.split(/\W+/).filter(x => x.length > 3)) {
      if (hay.includes(w)) score += 1
    }
    return { e, score }
  })
  scored.sort((a, b) => b.score - a.score)
  const top = scored.filter(s => s.score > 0).slice(0, limit).map(s => s.e)
  if (top.length) return top
  return pool.slice(0, limit)
}
