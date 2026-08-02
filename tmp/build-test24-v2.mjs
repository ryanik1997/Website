import fs from 'fs'

const T = 'catalog-reading-cae-c1-test24'
const P = `${T}-part`

// Helper: create MC question
const mc = (n, prompt, opts) => ({
  id: `${P}-1-q${n}`, number: n, type: 'multiple-choice',
  answerConfidence: 'pending', prompt,
  options: ['A','B','C','D'].map((id, j) => ({ id, label: opts[j] })),
})

// Helper: create gap-fill question
const gf = (part, n, prompt) => ({
  id: `${P}-${part}-q${n}`, number: n, type: 'gap-fill',
  answerConfidence: 'pending', prompt, options: [],
})

// Helper: create matching question
const mf = (part, n, prompt, labels) => ({
  id: `${P}-${part}-q${n}`, number: n, type: 'matching-features',
  answerConfidence: 'pending', prompt,
  options: labels.map(l => ({ id: l, label: l })),
})

const test = {
  id: T,
  title: 'CAE C1 Reading & Use of English — Test 24',
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

// PART 1
const p1o = [
  ['catch','win','achieve','receive'],
  ['perception','awareness','insight','vision'],
  ['Opposite','Opposed','Contrary','Contradictory'],
  ['care','bother','desire','hope'],
  ['concludes','disputes','reasons','argues'],
  ['misguided','misled','misdirected','misinformed'],
  ['error','doubt','illusion','impression'],
  ['expand','spread','widen','extend'],
]
test.parts.push({
  id: `${P}-1`, partNumber: 1, rangeLabel: 'Questions 1\u20138',
  passageTitle: 'Part 1 \u2014 Multiple-choice cloze',
  passage: [
    {text: 'Studying black bears'},
    {text: 'After years studying North America\u2019s black bears in the conventional way, wildlife biologist Luke Robertson felt no closer to understanding the creatures. He realised that he had to (1) ........ their trust. Abandoning scientific detachment, he took the daring step of forming relationships with the animals, bringing them food to gain their acceptance.'},
    {text: 'The (2) ........ this has given him into their behaviour has allowed him to dispel certain myths about bears. (3) ........ to popular belief, he contends that bears do not (4) ........ as much for fruit as previously supposed. He also (5) ........ claims that they are ferocious. He says that people should not be (6) ........ by behaviour such as swatting paws on the ground, as this is a defensive, rather than an aggressive, act.'},
    {text: 'However, Robertson is no sentimentalist. After devoting years of his life to the bears, he is under no (7) ........ about their feelings for him. It is clear that their interest in him does not (8) ........ beyond the food he brings.'},
  ],
  questionGroups: [{
    id: `${P}-1-g0`, range: 'Questions 1\u20138',
    instruction: 'For questions 1-8, read the text below and decide which answer (A, B, C or D) best fits each gap.',
    type: 'multiple-choice',
    questions: p1o.map((opts, i) => mc(i+1, `Gap (${i+1})`, opts)),
  }],
})

// PART 2
test.parts.push({
  id: `${P}-2`, partNumber: 2, rangeLabel: 'Questions 9\u201316',
  passageTitle: 'Part 2 \u2014 The origin of language',
  passage: [
    {text: 'The origin of language'},
    {text: 'The truth is nobody really knows how language first began. Did we all start talking at around the same time (9) ........ of the manner in which our brains had begun to develop?'},
    {text: 'Although there is a lack of clear evidence, people have come up with various theories about the origins of language. One recent theory is that human beings have evolved in (10) ........ a way that we are programmed for language from the moment of birth. In (11) ........ words, language came about as a result of an evolutionary change in our brains at some stage.'},
    {text: 'Language (12) ........ well be programmed into the brain but, (13) ........ this, people still need stimulus from others around them. From studies, we know that (14) ........ children are isolated from human contact and have not learnt to construct sentences before they are ten, it is doubtful they will ever do so. This research shows, if (15) ........ else, that language is a social activity, not something invented (16) ........ isolation.'},
  ],
  questionGroups: [{
    id: `${P}-2-g0`, range: 'Questions 9\u201316',
    instruction: 'For questions 9-16, read the text below and think of the word which best fits each gap. Use only one word in each gap.',
    type: 'gap-fill',
    questions: Array.from({length:8}, (_,i) => gf(2, i+9, `Gap (${i+9})`)),
  }],
})

// PART 3
const p3k = ['COME','FIT','ENDURE','BENEFIT','ABLE','STRONG','TYPE','SEVERE']
test.parts.push({
  id: `${P}-3`, partNumber: 3, rangeLabel: 'Questions 17\u201324',
  passageTitle: 'Part 3 \u2014 Training sports champions',
  passage: [
    {text: 'Training sports champions'},
    {text: 'What are the abilities that a professional sports person needs? To guarantee that opponents can be (17) ........, speed, stamina and agility are essential, not to mention outstanding natural talent. Both a rigorous and comprehensive (18) ........ regime and a highly nutritious diet are vital for top-level performance. It is carbohydrates, rather than proteins and fat, that provide athletes with the (19) ........ they need to compete. This means that pasta is more (20) ........ than eggs or meat. Such a diet enables them to move very energetically when required. Failure to follow a sensible diet can result in the (21) ........ to maintain stamina.'},
    {text: 'Regular training to increase muscular (22) ........ is also a vital part of a professional\u2019s regime, and this is (23) ........ done by exercising with weights. Sports people are prone to injury but a quality training regime can ensure that the (24) ........ of these can be minimised.'},
  ],
  questionGroups: [{
    id: `${P}-3-g0`, range: 'Questions 17\u201324',
    instruction: 'For questions 17-24, read the text below. Use the word given in capitals at the end of some of the lines to form a word that fits in the gap in the same line.',
    type: 'gap-fill',
    questions: p3k.map((k, i) => gf(3, i+17, `Gap (${i+17}) \u2014 ${k}`)),
  }],
})

// PART 4
const p4d = [
  [25, 'My brother now earns far less money than he did when he was younger.', 'NEARLY', 'My brother \u2026\u2026\u2026\u2026 much now as he did when he was younger.'],
  [26, 'They are demolishing the old bus station and replacing it with a new one.', 'PULLED', 'The old bus station is \u2026\u2026\u2026\u2026 with a new one.'],
  [27, 'The number of students now at university has reached an all-time high, apparently.', 'THE', 'The number of students now at university is \u2026\u2026\u2026\u2026 been, apparently.'],
  [28, "I'm disappointed with the Fishers' new album when I compare it to their previous one.", 'COMPARISON', "I think the Fishers' new album is \u2026\u2026\u2026\u2026 their previous one."],
  [29, "Anna got the job even though she didn't have much experience in public relations.", 'SPITE', 'Anna got the job \u2026\u2026\u2026\u2026 of experience in public relations.'],
  [30, "'I must warn you how dangerous it is to cycle at night without any lights,' said the police officer to Max.", 'DANGERS', 'Max received a \u2026\u2026\u2026\u2026 at night without any lights from the police officer.'],
]
test.parts.push({
  id: `${P}-4`, partNumber: 4, rangeLabel: 'Questions 25\u201330',
  passageTitle: 'Part 4 \u2014 Key word transformations',
  passage: [{text: 'Complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Use between three and six words, including the word given.'}],
  questionGroups: [{
    id: `${P}-4-g0`, range: 'Questions 25\u201330',
    instruction: 'Write only the missing words. Use between three and six words, including the word given.',
    type: 'gap-fill',
    questions: p4d.map(([n, s1, stem, s2]) => gf(4, n, `${s1}\n\n${stem} \u2192 ${s2}`)),
  }],
})

// PART 5
const p5p = [
  {text: 'Introduction to a book about the history of colour'},
  {text: 'This book examines how the ever-changing role of colour in society has been reflected in manuscripts, stained glass, clothing, painting and popular culture. Colour is a natural phenomenon, of course, but it is also a complex cultural construct that resists generalization and, indeed, analysis itself. No doubt this is why serious works devoted to colour are rare, and rarer still are those that aim to study it in historical context. Many authors search for the universal or archetypal truths they imagine reside in colour, but for the historian, such truths do not exist. Colour is first and foremost a social phenomenon. There is no transcultural truth to colour perception, despite what many books based on poorly grasped neurobiology or \u2013 even worse \u2013 on pseudoesoteric pop psychology would have us believe. Such books unfortunately clutter the bibliography on the subject, and even do it harm.'},
  {text: 'The silence of historians on the subject of colour, or more particularly their difficulty in conceiving colour as a subject separate from other historical phenomena, is the result of three different sets of problems. The first concerns documentation and preservation. We see the colours transmitted to us by the past as time has altered them and not as they were originally. Moreover, we see them under light conditions that often are entirely different from those known by past societies. And finally, over the decades we have developed the habit of looking at objects from the past in black-and-white photographs and, despite the current diffusion of colour photography, our ways of thinking about and reacting to these objects seem to have remained more or less black and white.'},
  {text: 'The second set of problems concerns methodology. As soon as the historian seeks to study colour, he must grapple with a host of factors all at once: physics, chemistry, materials, and techniques of production, as well as iconography, ideology, and the symbolic meanings that colours convey. How to make sense of all of these elements? How can one establish an analytical model facilitating the study of images and coloured objects? No researcher, no method, has yet been able to resolve these problems, because among the numerous facts pertaining to colour, a researcher tends to select those facts that support his study and to conveniently forget those that contradict it. This is clearly a poor way to conduct research. And it is made worse by the temptation to apply to the objects and images of a given historical period information found in texts of that period. The proper method \u2013 at least in the first phase of analysis \u2013 is to proceed as do palaeontologists (who must study cave paintings without the aid of texts): by extrapolating from the images and the objects themselves a logic and a system based on various concrete factors such as the rate of occurrence of particular objects and motifs, their distribution and disposition. In short, one undertakes the internal structural analysis with which any study of an image or coloured object should begin.'},
  {text: 'The third set of problems is philosophical: it is wrong to project our own conceptions and definitions of colour onto the images, objects and monuments of past centuries. Our judgements and values are not those of previous societies (and no doubt they will change again in the future). For the writer-historian looking at the definitions and taxonomy of colour, the danger of anachronism is very real. For example, the spectrum with its natural order of colours was unknown before the seventeenth century, while the notion of primary and secondary colours did not become common until the nineteenth century. These are not eternal notions but stages in the ever-changing history of knowledge.'},
  {text: 'I have reflected on such issues at greater length in my previous work, so while the present book does address certain of them, for the most part it is devoted to other topics. Nor is it concerned only with the history of colour in images and artworks \u2013 in any case that area still has many gaps to be filled. Rather, the aim of this book is to examine all kinds of objects in order to consider the different facets of the history of colour and to show how far beyond the artistic sphere this history reaches. The history of painting is one thing; that of colour is another, much larger, question. Most studies devoted to the history of colour err in considering only the pictorial, artistic or scientific realms. But the lessons to be learned from colour and its real interest lie elsewhere.'},
]
const p5q = [
  [31, 'What problem regarding colour does the writer explain in the first paragraph?', ['Our view of colour is strongly affected by changing fashion.','Analysis is complicated by the bewildering number of natural colours.','Colours can have different associations in different parts of the world.','Certain popular books have dismissed colour as insignificant.']],
  [32, 'What is the first reason the writer gives for the lack of academic work on the history of colour?', ['There are problems of reliability associated with the artefacts available.','Historians have seen colour as being outside their field of expertise.','Colour has been rather looked down upon as a fit subject for academic study.','Very little documentation exists for historians to use.']],
  [33, 'The writer suggests that the priority when conducting historical research on colour is to', ['ignore the interpretations of other modern day historians.','focus one\u2019s interest as far back as the prehistoric era.','find some way of organising the mass of available data.','relate pictures to information from other sources.']],
  [34, 'In the fourth paragraph, the writer says that the historian writing about colour should be careful', ['not to analyse in an old-fashioned way.','when making basic distinctions between key ideas.','not to make unwise predictions.','when using certain terms and concepts.']],
  [35, 'In the fifth paragraph, the writer says there needs to be further research done on', ['the history of colour in relation to objects in the world around us.','the concerns he has raised in an earlier publication.','the many ways in which artists have used colour over the years.','the relationship between artistic works and the history of colour.']],
  [36, 'An idea recurring in the text is that people who have studied colour have', ['failed to keep up with scientific developments.','not understood its global significance.','found it difficult to be fully objective.','been muddled about their basic aims.']],
]
test.parts.push({
  id: `${P}-5`, partNumber: 5, rangeLabel: 'Questions 31\u201336',
  passageTitle: 'Part 5 \u2014 Introduction to a book about the history of colour',
  passage: p5p,
  questionGroups: [{
    id: `${P}-5-g0`, range: 'Questions 31\u201336',
    instruction: 'You are going to read an introduction to a book. For questions 31-36 choose the answer (A, B, C or D) which you think fits best according to the text.',
    type: 'multiple-choice',
    questions: p5q.map(([n, p, o]) => mc(n, p, o)),
  }],
})

// PART 6
const p6r = [
  {label:'A', text:'Alain de Botton is a brave and highly intelligent writer who writes about complex subjects, clarifying the arcane for the layman. Now, with typical self-assurance, he has turned to the subject of architecture. The essential theme of his book is how architecture influences mood and behaviour. It is not about the specifically architectural characteristics of space and design, but much more about the emotions that architecture inspires in the users of buildings. Yet architects do not normally talk nowadays very much about emotion and beauty. They talk about design and function. De Botton\u2019s message, then, is fairly simple but worthwhile precisely because it is simple, readable and timely. His commendable aim is to encourage architects, and society more generally, to pay more attention to the psychological consequences of design in architecture: architecture should be treated as something that affects all our lives, our happiness and well-being.'},
  {label:'B', text:'Alain de Botton raises important, previously unasked, questions concerning the quest for beauty in architecture, or its rejection or denial. Yet one is left with the feeling that he needed the help and support of earlier authors on the subject to walk him across the daunting threshold of architecture itself. And he is given to making extraordinary claims: \u2018Architecture is perplexing ... in how inconsistent is its capacity to generate the happiness on which its claim to our attention is founded.\u2019 If architecture\u2019s capacity to generate happiness is inconsistent, this might be because happiness has rarely been something architects think about. De Botton never once discusses the importance of such dull, yet determining, matters as finance or planning laws, much less inventions such as the lift or reinforced concrete. He appears to believe that architects are still masters of their art, when increasingly they are cogs in a global machine for building in which beauty, and how de Botton feels about it, are increasingly beside the point.'},
  {label:'C', text:'In The Architecture of Happiness, Alain de Botton has a great time making bold and amusing judgements about architecture, with lavish and imaginative references, but anyone in search of privileged insights into the substance of building design should be warned that he is not looking at drain schedules or pipe runs. He worries away, as many architects do, at how inert material things can convey meaning and alter consciousness. Although he is a rigorous thinker, most of de Botton\u2019s revelations, such as the contradictions in Le Corbusier\u2019s theory and practice, are not particularly new. However, this is an engaging and intelligent book on architecture and something everyone, professionals within the field in particular, should read.'},
  {label:'D', text:'Do we want our buildings merely to shelter us, or do we also want them to to speak to us? Can the right sort of architecture even improve our character? Music mirrors the dynamics of our emotional lives. Mightn\u2019t architecture work the same way? De Botton thinks so, and in The Architecture of Happiness he makes the most of this theme on his jolly trip through the world of architecture. De Botton certainly writes with conviction and, while focusing on happiness can be a lovely way to make sense of architectural beauty, it probably won\u2019t be of much help in resolving conflicts of taste.'},
]
const p6q = [
  [37, 'has a different opinion from the others on the confidence with which de Botton discusses architecture?'],
  [38, 'shares reviewer A\u2019s opinion whether architects should take note of de Botton\u2019s ideas?'],
  [39, 'expresses a similar view to reviewer B regarding the extent to which architects share de Botton\u2019s concerns?'],
  [40, 'has a different view to reviewer C on the originality of some of de Botton\u2019s ideas?'],
]
test.parts.push({
  id: `${P}-6`, partNumber: 6, rangeLabel: 'Questions 37\u201340',
  passageTitle: 'Part 6 \u2014 The Architecture of Happiness',
  passage: [{text: 'The Architecture of Happiness'},{text: 'Four reviewers comment on philosopher Alain De Botton\u2019s book'}, ...p6r],
  questionGroups: [{
    id: `${P}-6-g0`, range: 'Questions 37\u201340',
    instruction: 'For questions 37\u201340, choose from the reviews (A\u2013D). The reviews may be chosen more than once.',
    type: 'matching-features',
    questions: p6q.map(([n, p]) => mf(6, n, p, ['A','B','C','D'])),
  }],
})

// PART 7
const p7passage = [
  {text: 'Scottish Wildcat'},
  {text: 'On my living-room wall I have a painting of a wildcat by John Holmes of which I am extremely fond. It depicts a snarling, spitting animal, teeth bared and back arched: a taut coiled spring ready to unleash some unknown fury.'},
  {text: '(41) ........'},
  {text: 'However, the physical differences are tangible. The wildcat is a much larger animal, weighing in some cases up to seven kilos, the same as a typical male fox. The coat pattern is superficially similar to a domestic tabby cat but it is all stripes and no spots. The tail is thicker and blunter, with three to five black rings. The animal has an altogether heavier look.'},
  {text: 'The Scottish wildcat was originally distinguished as a separate subspecies in 1912, but it is now generally recognised that there is little difference between the Scottish and other European populations. According to an excellent report on the wildcat printed in 1991, the animals originally occurred in a variety of habitats throughout Europe.'},
  {text: '(42) ........'},
  {text: 'It was during the nineteenth century, with the establishment of many estates used by landowners for hunting, that the wildcat became a nuisance and its rapid decline really began; 198 wildcats were killed in three years in the area of Glengarry, for example. However, things were later to improve for the species.'},
  {text: '(43) ........'},
  {text: 'The future is by no means secure, though, and recent evidence suggests that the wildcat is particularly vulnerable to local eradication, especially in the remoter parts of northern and western Scotland. This is a cause for real concern, given that the animals in these areas have less contact with domestic cats and are therefore purer.'},
  {text: '(44) ........'},
  {text: 'Part of the problem stems from the fact that the accepted physical description of the species originates from the selective nature of the examination process by the British Natural History Museum at the start of the century, and this has been used as the type-definition for the animal ever since. Animals that did not conform to that large blunt-tailed \u2018tabby\u2019 description were discarded as not being wildcats. In other words, an artificial collection of specimens was built up, exhibiting the features considered typical of the wildcat.'},
  {text: 'The current research aims to resolve this potential problem. It is attempting to find out whether there are any physical features which characterise the so-called wild-living cats.'},
  {text: '(45) ........'},
  {text: 'But what of his lifestyle? Wildcat kittens are usually born in May/June in a secluded den, secreted in a gap amongst boulders. Another favourite location is in the roots of a tree.'},
  {text: '(46) ........'},
  {text: 'Rabbits are a favourite prey, and some of the best areas to see wildcats are those where rabbits are abundant. In the remoter parts of Scotland, away from the few roads, the wildcat is still widespread, and the future of the species may well depend on whether enough suitable habitat remains.'},
]
const p7tokens = [
  {label:'A', text:'It is a typical image most folk have of the beast, but it is very much a false one, for the wildcat is little more than a bigger version of the domestic cat, and probably shows his anger as often.'},
  {label:'B', text:'They probably used deciduous and coniferous woodland for shelter, particularly in winter, and hunted over more open areas such as forest edges, open woodland, thickets and scrub, grassy areas and marsh. The wildcat was probably driven into more mountainous areas by a combination of deforestation and persecution.'},
  {label:'C', text:'The recruitment of men to the armed forces during the conflict in Europe from 1914 to 1918 meant there was very little persecution, since gamekeepers went off to fight. As the number of gamekeepers decreased, the wildcat began to increase its range, recolonising many of its former haunts. Extinction was narrowly averted.'},
  {label:'D', text:'This is what makes many people think that the wildcat is a species in its own right. Research currently being undertaken by Scottish Natural Heritage is investigating whether the wildcat really is distinct from the domestic cat and, if so, in what ways.'},
  {label:'E', text:'As the animals emerge, their curiosity is aroused by every movement and rustle in the vegetation. Later they will accompany their mother on hunting trips, learning quickly, and soon become adept hunters.'},
  {label:'F', text:'The wildcat waits for a while in rapt concentration, ears twitching and eyes watching, seeing everything and hearing everything, trying to detect the tell-tale movement of a vole or a mouse. But there is nothing, and in another leap he disappears into the gloom.'},
  {label:'G', text:'The results, which are expected shortly, will be fascinating. But anyone who has seen a wildcat will be in little doubt that there is indeed a unique and distinctive animal living in the Scottish Highlands, whatever his background.'},
]
test.parts.push({
  id: `${P}-7`, partNumber: 7, rangeLabel: 'Questions 41\u201346',
  passageTitle: 'Part 7 \u2014 Scottish Wildcat',
  passage: [...p7passage, ...p7tokens],
  questionGroups: [{
    id: `${P}-7-g0`, range: 'Questions 41\u201346',
    instruction: 'You are going to read a magazine article. Six paragraphs have been removed from the text. Choose from the paragraphs A\u2013G the one which fits each gap (41-46). There is one extra paragraph which you do not need to use.',
    type: 'matching-features',
    questions: Array.from({length:6}, (_,i) => mf(7, i+41, `Gap (${i+41})`, ['A','B','C','D','E','F','G'])),
  }],
})

// PART 8
const p8c = [
  {label:'A', text:'A university degree is no guarantee of a job, and job hunting in itself requires a whole set of skills. If you find you are not getting past the first interview, ask yourself what is happening. Is it a failure to communicate or are there some skills you lack? Once you see patterns emerging it will help you decide whether the gaps you have identified can be filled relatively easily. If you cannot work out what the mismatch is, get back to the selection panel with more probing questions, and find out what you need to do to bring yourself up to the level of qualification that would make you more attractive to them: but be careful to make this sound like a genuine request rather than a challenge or complaint.'},
  {label:'B', text:'Do not be too dispirited if you are turned down for a job, but think about the reasons the employers give. They often say it is because others are \u2018better qualified\u2019, but they use the term loosely. Those who made the second interview might have been studying the same subject as you and be of similar ability level, but they had something which made them a closer match to the selector\u2019s ideal. That could be experience gained through projects or vacation work, or it might be that they were better at communicating what they could offer. Do not take the comments at face value: think back to the interviews that generated them and make a list of where you think the shortfall in your performance lies. With this sort of analytical approach you will eventually get your foot in the door.'},
  {label:'C', text:'Deciding how long you should stay in your first job is a tough call. Stay too long and future employers may question your drive and ambition. Of course, it depends where you are aiming. There can be advantages in moving sideways rather than up, if you want to gain real depth of knowledge. If you are a graduate, spending five or six years in the same job is not too long provided that you take full advantage of the experience. However, do not use this as an excuse for apathy. Graduates sometimes fail to take ownership of their careers and take the initiative. It is up to you to make the most of what\u2019s available within a company, and to monitor your progress in case you need to move on. This applies particularly if you are still not sure where your career path lies.'},
  {label:'D', text:'It is helpful to think through what kind of experience you need to get your dream job and it is not a problem to move around to a certain extent. But in the early stages of your career you need a definite strategy for reaching your goals. You should be clear about what you want to achieve and how you plan to do it. Moving from one job to another just because the salary is better may not be the best way of building a career. You need to consider what skills each job will give you and whether they will take you closer to your final objective. It is also worth remembering that the first job you take may not be the best entry point for the career you want, so it is important to keep an open mind and be willing to change direction if necessary.'},
  {label:'E', text:'Some people are lucky enough to know exactly what they want to do from an early age. But for many, the career path is not so clear. It is worth taking time to explore different options and to talk to people who are already working in the field. Work experience and internships can be invaluable, not just for the skills you learn but also for the contacts you make. It is also important to be realistic about your expectations. Your first job is unlikely to be your dream job, but it can be a stepping stone to something better. Be prepared to start at the bottom and work your way up. And remember that career paths are rarely straight lines \u2013 be prepared to take detours and learn from every experience.'},
]
const p8q = [
  [47, 'Keep your final objective in mind when you are planning to change jobs.'],
  [48, 'It takes time to become familiar with the characteristics of a company you have joined.'],
  [49, 'You should demonstrate determination to improve your job prospects.'],
  [50, 'Make sure your approach for information is positive in tone.'],
  [51, 'It is not certain that you will be given very much support in your job initially.'],
  [52, 'Stay optimistic in spite of setbacks.'],
  [53, 'Promotion isn\u2019t the only way to increase your expertise.'],
  [54, 'Ask for information about your shortcomings.'],
  [55, 'Some information you are given may not give a complete picture.'],
  [56, 'It will be some time before you start giving your employers their money\u2019s worth.'],
]
test.parts.push({
  id: `${P}-8`, partNumber: 8, rangeLabel: 'Questions 47\u201356',
  passageTitle: 'Part 8 \u2014 Starting out on your career',
  passage: [{text: 'Starting out on your career'},{text: 'Are you a graduate trying to plan out the best career path for yourself? We\u2019ve asked five careers consultants to give some tips on how to go about it.'}, ...p8c],
  questionGroups: [{
    id: `${P}-8-g0`, range: 'Questions 47\u201356',
    instruction: 'For questions 47\u201356, choose from the consultants (A\u2013E). The consultants may be chosen more than once.',
    type: 'matching-features',
    questions: p8q.map(([n, p]) => mf(8, n, p, ['A','B','C','D','E'])),
  }],
})

// Write test body
const outPath = 'apps/web/public/catalog/exams/reading/catalog-reading-cae-c1-test24.json'
fs.writeFileSync(outPath, JSON.stringify(test))
console.log('WROTE: ' + outPath)

// Write answers file (empty - answer key pending)
const answers = {
  id: T,
  answers: {},
  answerKeyStatus: 'pending-authorized-source',
  note: 'Answer key not yet available from authorized source. Scoring is disabled until a valid answer key is provided.',
}
const ansPath = 'apps/web/public/catalog/exams/reading/catalog-reading-cae-c1-test24.answers.json'
fs.writeFileSync(ansPath, JSON.stringify(answers))
console.log('WROTE: ' + ansPath)

// Validate structure
let totalQ = 0
for (const part of test.parts) {
  for (const g of part.questionGroups) {
    totalQ += g.questions.length
  }
}
console.log('PARTS: ' + test.parts.length)
console.log('TOTAL_QUESTIONS: ' + totalQ)
console.log('VALIDATION: ' + (test.parts.length === 8 && totalQ === 56 ? 'PASS' : 'FAIL'))