import { defaultSentence, type LessonSentence } from './types'
import { buildCambridgeTitle } from './listeningMeta'

interface StructuredPack {
  category: 'cambridge'
  book: string
  bookNum: number
  test: number
  part: number
  title: string
  sentences: string[]
}

const CAM20_T1_P1 = [
  'Good morning, I would like to enquire about renting a room.',
  'Certainly, how long would you need it for?',
  'I am looking for something for about three months.',
  'We have several options available in that price range.',
  'Could you tell me what facilities are included?',
  'All bills are included except for the telephone.',
  'Is there parking available for residents?',
  'Yes, there is a car park at the rear of the building.',
  'That sounds perfect. Can I come and have a look?',
  'Of course, we are open Monday to Saturday from nine to five.',
]

const CAM20_T1_P2 = [
  'The museum was built in eighteen sixty five and opened to the public three years later.',
  'The collection includes over two thousand items from around the world.',
  'Photography is permitted in most areas but flash is not allowed.',
  'The gift shop on the ground floor sells a wide range of souvenirs.',
  'Guided tours are available every Saturday afternoon at two o clock.',
  'The museum restaurant serves hot and cold meals throughout the day.',
  'Children under twelve years old can enter the museum free of charge.',
  'Visitors can download an audio guide from the museum website.',
  'The special exhibition runs until the end of next month.',
  'Wheelchair access is available at the main entrance.',
  'Please do not touch any of the artefacts on display.',
]

const CAM20_T1_P3 = [
  'The results of the study suggest that further research is needed in this area.',
  'In conclusion, the evidence clearly supports the view that climate change is accelerating.',
  'The proportion of people living in urban areas has increased significantly.',
  'Despite the challenges, the team managed to achieve all of their objectives.',
  'The data presented in the graph shows a steady decline in manufacturing output.',
  'It is widely accepted that regular exercise has a positive effect on mental health.',
  'The government has introduced a number of measures to reduce carbon emissions.',
  'Scientists are concerned about the impact of plastic waste on marine ecosystems.',
]

const CAM20_T1_P4 = [
  'Could you please tell me where the nearest post office is?',
  'I would like to make a reservation for two people at eight o clock this evening.',
  'The train to London departs from platform seven at half past three.',
  'Excuse me, I think you may have dropped your wallet back there.',
  'We apologise for the delay and thank you for your patience.',
  'I am afraid the item you ordered is currently out of stock.',
  'Would you mind if I opened the window? It is rather warm in here.',
  'The library closes at nine o clock on weekday evenings.',
  'You need to show your student ID card to borrow books.',
  'Students can reserve study rooms up to two weeks in advance.',
]

const CAM20_T2_P1 = [
  'The conference will be held at the Grand Hotel from the fifteenth to the seventeenth.',
  'Registration opens at eight thirty on the first day.',
  'Lunch will be provided for all registered participants.',
  'Please bring your name badge to every session.',
  'The keynote speaker is Professor James Mitchell from Oxford University.',
  'Workshops are limited to twenty participants each.',
  'Certificates will be issued at the end of the final session.',
]

function pack(book: string, bookNum: number, test: number, part: number, sentences: string[]): StructuredPack {
  return {
    category: 'cambridge',
    book,
    bookNum,
    test,
    part,
    title: buildCambridgeTitle(book, test, part),
    sentences,
  }
}

const STRUCTURED_PACKS: StructuredPack[] = [
  pack('Cambridge 20', 20, 1, 1, CAM20_T1_P1),
  pack('Cambridge 20', 20, 1, 2, CAM20_T1_P2),
  pack('Cambridge 20', 20, 1, 3, CAM20_T1_P3),
  pack('Cambridge 20', 20, 1, 4, CAM20_T1_P4),
  pack('Cambridge 20', 20, 2, 1, CAM20_T2_P1),
  pack('KET A2 - Speaking', 2, 1, 1, [
    'Hello, my name is Anna. What is your name?',
    'I am from Vietnam. Where do you come from?',
    'I like reading books and listening to music in my free time.',
    'At the weekend I usually visit my grandparents.',
    'My favourite subject at school is English because it is useful for travel.',
    'I would like to visit London one day to see the famous museums.',
    'In the future I hope to study at university abroad.',
    'Could you repeat that, please? I did not hear you clearly.',
    'Thank you very much for your help today.',
    'It was nice talking to you. Goodbye.',
    'I think learning languages helps people understand different cultures.',
    'Last summer I went camping with my friends near the coast.',
    'We cooked dinner together and sang songs around the fire.',
    'The weather was sunny most of the time.',
    'I took many photos of the mountains and the sea.',
    'I prefer travelling by train because it is more comfortable.',
    'My best friend lives in a small town in the north of the country.',
    'We have known each other since primary school.',
    'She wants to become a doctor when she grows up.',
  ]),
]

export function getStructuredCambridgePacks(): Array<{
  category: 'cambridge'
  title: string
  book: string
  bookNum: number
  test: number
  part: number
  sentences: LessonSentence[]
}> {
  return STRUCTURED_PACKS.map(p => ({
    category: p.category,
    title: p.title,
    book: p.book,
    bookNum: p.bookNum,
    test: p.test,
    part: p.part,
    sentences: p.sentences.map(defaultSentence),
  }))
}

