import fs from 'fs'

const T = 'catalog-reading-cae-c1-test24'
const title = 'CAE C1 Reading & Use of English — Test 24'

const test = {
  id: T,
  title,
  durationMinutes: 90,
  bandHint: 'C1 Advanced Reading & Use of English — 8 parts — 8 parts',
  parts: [],
  examTrack: 'cambridge',
  cambridgeLevel: 'c1',
  catalogSlug: 'cae-c1-test24',
  catalogBase: '/catalog/reading/cae-c1-test24',
  answersPath: 'catalog/exams/reading/catalog-reading-cae-c1-test24.answers.json',
  answersRemote: true,
  bodyRemote: true,
}

// ===== PART 1: MC cloze - "Studying black bears" =====
const p1Opts = [
  ['catch','win','achieve','receive'],
  ['perception','awareness','insight','vision'],
  ['Opposite','Opposed','Contrary','Contradictory'],
  ['care','bother','desire','hope'],
  ['concludes','disputes','reasons','argues'],
  ['misguided','misled','misdirected','misinformed'],
  ['error','doubt','illusion','impression'],
  ['expand','spread','widen','extend'],
]
const p1Questions = []
for (let i = 0; i < 8; i++) {
  const qn = i + 1
  p1Questions.push({
    id: `${T}-part-1-q${qn}`,
    number: qn,
    type: 'multiple-choice',
    answerConfidence: 'pending',
    prompt: `Gap (${qn})`,
    options: ['A','B','C','D'].map((id, j) => ({ id, label: p1Opts[i][j] })),
  })
}
test.parts.push({
  id: `${T}-part-1`,
  partNumber: 1,
  rangeLabel: 'Questions 1–8',
  passageTitle: 'Part 1 — Multiple-choice cloze',
  passage: [
    {text: 'Studying black bears'},
    {text: 'After years studying North America\u2019s black bears in the conventional way, wildlife biologist Luke Robertson felt no closer to understanding the creatures. He realised that he had to (1) ........ their trust. Abandoning scientific detachment, he took the daring step of forming relationships with the animals, bringing them food to gain their acceptance.'},
    {text: 'The (2) ........ this has given him into their behaviour has allowed him to dispel certain myths about bears. (3) ........ to popular belief, he contends that bears do not (4) ........ as much for fruit as previously supposed. He also (5) ........ claims that they are ferocious. He says that people should not be (6) ........ by behaviour such as swatting paws on the ground, as this is a defensive, rather than an aggressive, act.'},
    {text: 'However, Robertson is no sentimentalist. After devoting years of his life to the bears, he is under no (7) ........ about their feelings for him. It is clear that their interest in him does not (8) ........ beyond the food he brings.'},
  ],
  questionGroups: [{
    id: `${T}-part-1-g0`,
    range: 'Questions 1–8',
    instruction: 'For questions 1-8, read the text below and decide which answer (A, B, C or D) best fits each gap.',
    type: 'multiple-choice',
    questions: p1Questions,
  }],
})

// ===== PART 2: Open cloze - "The origin of language" =====
const p2Questions = []
for (let i = 0; i < 8; i++) {
  const qn = i + 9
  p2Questions.push({
    id: `${T}-part-2-q${qn}`,
    number: qn,
    type: 'gap-fill',
    answerConfidence: 'pending',
    prompt: `Gap (${qn})`,
    options: [],
  })
}
test.parts.push({
  id: `${T}-part-2`,
  partNumber: 2,
  rangeLabel: 'Questions 9–16',
  passageTitle: 'Part 2 — The origin of language',
  passage: [
    {text: 'The origin of language'},
    {text: 'The truth is nobody really knows how language first began. Did we all start talking at around the same time (9) ........ of the manner in which our brains had begun to develop?'},
    {text: 'Although there is a lack of clear evidence, people have come up with various theories about the origins of language. One recent theory is that human beings have evolved in (10) ........ a way that we are programmed for language from the moment of birth. In (11) ........ words, language came about as a result of an evolutionary change in our brains at some stage.'},
    {text: 'Language (12) ........ well be programmed into the brain but, (13) ........ this, people still need stimulus from others around them. From studies, we know that (14) ........ children are isolated from human contact and have not learnt to construct sentences before they are ten, it is doubtful they will ever do so. This research shows, if (15) ........ else, that language is a social activity, not something invented (16) ........ isolation.'},
  ],
  questionGroups: [{
    id: `${T}-part-2-g0`,
    range: 'Questions 9–16',
    instruction: 'For questions 9-16, read the text below and think of the word which best fits each gap. Use only one word in each gap.',
    type: 'gap-fill',
    questions: p2Questions,
  }],
})

// ===== PART 3: Word formation - "Training sports champions" =====
const p3Keywords = ['COME','FIT','ENDURE','BENEFIT','ABLE','STRONG','TYPE','SEVERE']
const p3Questions = []
for (let i = 0;! i < 8; i++) {
  const qn = i + 17
  p3Questions.push({
    id: `${T}-part-3-q${qn}`,
    number: qn,
    type: 'gap-fill',
    answerConfidence: 'pending',
    prompt: `Gap (${qn}) — ${p3Keywords[i]}`,
    options: [],
  })
}
test.parts.push({
  id: `${T}-part-3`,
  partNumber: 3,
  rangeLabel: 'Questions 17–24',
  passageTitle: 'Part 3 — Training sports champions',
  passage: [
    {text: 'Training sports champions'},
    {text: 'What are the abilities that a professional sports person needs? To guarantee that opponents can be (17) ........, speed, stamina and agility are essential, not to mention outstanding natural talent. Both a rigorous and comprehensive (18) ........ regime and a highly nutritious diet are vital for top-level performance. It is carbohydrates, rather than proteins and fat, that provide athletes with the (19) ........ they need to compete. This means that pasta is more (20) ........ than eggs or meat. Such a diet enables them to move very energetically when required. Failure to follow a sensible diet can result in the (21) ........ to maintain stamina.'},
    {text: 'Regular training to increase muscular (22) ........ is also a vital part of a professional\u2019s regime, and this is (23) ........ done by exercising with weights. Sports people are prone to injury but a quality training regime can ensure that the (24) ........ of these can be minimised.'},
  ],
  questionGroups: [{
    id: `${T}-part-3-g0`,
    range: 'Questions 17–24',
    instruction: 'For questions 17-24, read the text below. Use the word given in capitals at the end of some of the lines to form a word that fits in the gap in the same line.',
    type: 'gap-fill',
    questions: p3Questions,
  }],
})

// ===== PART 4: Key word transformations =====
const p4Data = [
  {n:25, s1:'My brother now earns far less money than he did when he was younger.', stem:'NEARLY', s2:'My brother ………… much now as he did when he was younger.'},
  {n:26, s1:'They are demolishing the old bus station and replacing it with a new one.', stem:'PULLED', s2:'The old bus station is ………… with a new one.'},
  {n:27, s1:'The number of students now at university has reached an all-time high, apparently.', stem:'THE', s2:'The number of students now at university is ………… been, apparently.'},
  {n:28, s1:"I'm disappointed with the Fishers' new album when I compare it to their previous one.", stem:'COMPARISON', s2:"I think the Fishers' new album is ………… their previous one."},
  {n:29, s1:"Anna got the job even though she didn't have much experience in public relations.", stem:'SPITE', s2:'Anna got the job ………… of experience in public relations.'},
  {n:30, s1:"'I must warn you how dangerous it is to cycle at night without any lights,' said the police officer to Max.", stem:'DANGERS', s2:'Max received a ………… at night without any lights from the police officer.'},
]
const p4Questions = p4Data.map(d => ({
  id: `${T}-part-4-q${d.n}`,
  number: d.n,
  type: 'gap-fill',
  answerConfidence: 'pending',
  prompt: `${d.s1}\n\n${d.stem} → ${d.s2}`,
  options: [],
}))
test.parts.push({
  id: `${T}-part-4`,
  partNumber: 4,
  rangeLabel: 'Questions 25–30',
  passageTitle: 'Part 4 — Key word transformations',
  passage: [{text: 'Complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Use between three and six words, including the word given.'}],
  questionGroups: [{
    id: `${T}-part-4-g0`,
    range: 'Questions 25–30',
    instruction: 'Write only the missing words. Use between three and six words, including the word given.',
!     type: 'gap-fill',
    questions: p4Questions,
  }],
})

// ===== PART 5: Reading MC - "Introduction to a book about the history of colour" =====
const p5Passage = [
  {text: 'Introduction to a book about the history of colour'},
  {text: 'This book examines how the ever-changing role of colour in society has been reflected in manuscripts, stained glass, clothing, painting and popular culture. Colour is a natural phenomenon, of course, but it is also a complex cultural construct that resists generalization and, indeed, analysis itself. No doubt this is why serious works devoted to colour are rare, and rarer still are those that aim to study it in historical context. Many authors search for the universal or archetypal truths they imagine reside in colour, but for the historian, such truths do not exist. Colour is first and foremost a social phenomenon. There is no transcultural truth to colour perception, despite what many books based on poorly grasped neurobiology or \u2013 even worse \u2013 on pseudoesoteric pop psychology would have us believe. Such books unfortunately clutter the bibliography on the subject, and even do it harm.'},
  {text: 'The silence of historians on the subject of colour, or more particularly their difficulty in conceiving colour as a subject separate from other historical phenomena, is the result of three different sets of problems. The first concerns documentation and preservation. We see the colours transmitted to us by the past as time has altered them and not as they were originally. Moreover, we see them under light conditions that often are entirely different from those known by past societies. And finally, over the decades we have developed the habit of looking at objects from the past in black-and-white photographs and, despite the current diffusion of colour photography, our ways of thinking about and reacting to these objects seem to have remained more or less black and white.'},
  {text: 'The second set of problems concerns methodology. As soon as the historian seeks to study colour, he must grapple with a host of factors all at once: physics, chemistry, materials, and techniques of production, as well as iconography, ideology, and the symbolic meanings that colours convey. How to make sense of all of these elements? How can one establish an analytical model facilitating the study of images and coloured objects? No researcher, no method, has yet been able to resolve these problems, because among the numerous facts pertaining to colour, a researcher tends to select those facts that support his study and to conveniently forget those that contradict it. This is clearly a poor way to conduct research. And it is made worse by the temptation to apply to the objects and images of a given historical period information found in texts of that period. The proper method \u2013 at least in the first phase of analysis \u2013 is to proceed as do palaeontologists (who must study cave paintings without the aid of texts): by extrapolating from the images and the objects themselves a logic and a system based on various concrete factors such as the rate of occurrence of particular objects and motifs, their distribution and disposition. In short, one undertakes the internal structural analysis with which any study of an image or coloured object should begin.'},
  {text: 'The third set of problems is philosophical: it is wrong to project our own conceptions and definitions of colour onto the images, objects and monuments of past centuries. Our judgements and values are not those of previous societies (and no doubt they will change again in the future). For the writer-historian looking at the definitions and taxonomy of colour, the danger of anachronism is very real. For example, the spectrum with its natural order of colours was unknown before the seventeenth century, while the notion of primary and secondary colours did not become common until the nineteenth century. These are not eternal notions but stages in the ever-changing history of knowledge.'},
  {text: 'I have reflected on such issues at greater length in my previous work, so while the present book does address certain of them, for the most part it is devoted to other topics. Nor is it concerned only with the history of colour in images and artworks \u2013 in any case that area still has many gaps to be filled. Rather, the aim of this book is to examine all kinds of objects in order to consider the different facets of the history of colour and to show how far beyond the artistic sphere this history reaches. The history of painting is one thing; that of colour is another, much larger, question. Most studies devoted to the history of colour err in considering only the pictorial, artistic or scientific realms. But the lessons to be learned from colour and its real interest lie elsewhere.'},
]
const p5Qs = [
  {n:31, p:'What problem regarding colour does the writer explain in the first paragraph?', o:['Our view of colour is strongly affected by changing fashion.','Analysis is complicated by the bewildering number of natural colours.','Colours can have different associations in different parts of the world.','Certain popular books have dismissed colour as insignificant.']},
  {n:32, p:'What is the first reason the writer gives for the lack of academic work on the history of colour?', o:['There are problems of reliability associated with the artefacts available.','Historians have seen colour as being outside their field of expertise.','Colour has been rather looked down upon as a fit subject for academic study.','Very little documentation exists for historians to use.']},
  {n:33, p:'The writer suggests that the priority when conducting historical research on colour is to', o:['ignore the interpretations of other modern day historians.','focus one\u2019s interest as far back as the prehistoric era.','find some way of organising the mass of available data.','relate pictures to information from other sources.']},
  {n:34, p:'In the fourth paragraph, the writer says that the historian writing about colour should be careful', o:['not to analyse in an old-fashioned way.','when making basic distinctions between key ideas.','not to make unwise predictions.','when using certain terms and concepts.']},
  {n:35, p:'In the fifth paragraph, the writer says there needs to be further research done on', o:['the history of colour in relation to objects in the world around us.','the concerns he has raised in an earlier publication.','the many ways in which artists have used colour over the years.','the relationship between artistic works and the history of colour.']},
  {n:36, p:'An idea recurring in the text is that people who have studied colour have', o:['failed to keep up with scientific developments.','not understood its global significance.','found it difficult to be fully objective.','been muddled about their basic aims.']},
]
const p5Questions = p5Qs.map(d => ({
  id: `${T}-part-5-q${d.n}`,
  number: d.n,
  type: 'multiple-choice',
  answerConfidence: 'pending',
  prompt: d.p,
  options: ['A','B','C','D'].map((id, j) => ({ id, label: d.o[j] })),
}))
test.parts.push({
  id: `${T}-part-5`,
  partNumber: 5,
  rangeLabel: 'Questions 31–36',
  passageTitle: 'Part 5 — Introduction to a book about the history of colour',
  passage: p5Passage,
  questionGroups: [{
    id: `${T}-part-5-g0`,
    range: 'Questions 31–36',
    instruction: 'You are going to read an introduction to a book. For questions 31-36 choose the answer (A, B, C or D) which you think fits best according to the text.',
    type: 'multiple-choice',
    questions: p5Questions,
  }],
})

// ===== PART 6: Cross-text matching - "The Architecture of Happiness" =====
// I need to get the full review texts from the extracted data
const p6Reviews = [
  {label:'A', text:'Alain de Botton is a brave and highly intelligent writer who writes about complex subjects, clarifying the arcane for the layman. Now, with typical self-assurance, he has turned to the subject of architecture. The essential theme of his book is how architecture influences mood and behaviour. It is not about the specifically architectural characteristics of space and design, but much more about the emotions that architecture inspires in