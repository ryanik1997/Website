#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { compileExam, compileExamSimple } from './pet-b1/compile/compile-exam.mjs'
import bp14 from './pet-b1/blueprints/test-14.mjs'
import bp15 from './pet-b1/blueprints/test-15.mjs'
import bp16 from './pet-b1/blueprints/test-16.mjs'
import bp17 from './pet-b1/blueprints/test-17.mjs'
import bp18 from './pet-b1/blueprints/test-18.mjs'
import bp19 from './pet-b1/blueprints/test-19.mjs'
import bp20 from './pet-b1/blueprints/test-20.mjs'
import bp21 from './pet-b1/blueprints/test-21.mjs'
import bp22 from './pet-b1/blueprints/test-22.mjs'
import bp23 from './pet-b1/blueprints/test-23.mjs'
import bp24 from './pet-b1/blueprints/test-24.mjs'
import bp30 from './pet-b1/blueprints/test-30.mjs'
import bp51 from './pet-b1/blueprints/test-51.mjs'

const BLUEPRINTS = { 14: bp14, 15: bp15, 16: bp16, 17: bp17, 18: bp18, 19: bp19, 20: bp20, 21: bp21, 22: bp22, 23: bp23, 24: bp24, 30: bp30, 51: bp51 }

const ROOT = process.cwd()
const DATA = path.join(ROOT, 'packages/catalog/data')
const PUBLIC = path.join(ROOT, 'apps/web/public/catalog/exams/reading')
const META = path.join(DATA, 'catalog-reading-meta.json')
const MANIFEST = path.join(DATA, 'manifest.json')
const FROM = 14
const TO = 51

const QUALITY_SAMPLES = {
  14: {
    topic: ['community gardens', 'local gardeners', 'shared plots', 'water-saving'],
    part3: {
      title: 'A garden that belongs to everyone',
      paragraphs: [
        `When the old railway land behind our library became available, residents had different ideas about what should happen to it. Some wanted a playground, while others imagined a car park. A small group of neighbours suggested community gardens instead. They argued that the space could provide food, teach children useful skills and give people a reason to meet. The council agreed to a one-year trial, but the volunteers had to organise almost everything themselves.`,
        `The first months were harder than expected. The soil was dry, and several young plants died during a hot spell. Rather than asking for more money, the gardeners collected rainwater from nearby roofs and shared a weekly watering rota. A local café gave them empty containers for seedlings, and a retired science teacher showed children how to test the soil. These small contributions mattered because no single volunteer had enough time or experience to do the whole job.`,
        `By autumn, the garden was producing vegetables, but its greatest success was less visible. People who had rarely spoken before were now exchanging advice and checking on one another's plots. The organisers still disagree about some choices, such as which plants to grow next year. Even so, they have learned that a shared place does not need everyone to think alike. It needs people to take responsibility for keeping it useful.`
      ],
      questions: [
        ['Why did the neighbours suggest community gardens?', ['The space could serve several local purposes.', 'The council had already bought gardening tools.', 'They wanted to prevent children using the library.', 'A café promised to sell their vegetables.'], 'A'],
        ['What did the watering rota help the volunteers deal with?', ['A period when the plants received too little rain.', 'A shortage of containers at the local café.', 'A disagreement about the next year’s crops.', 'A decision to move the garden behind the library.'], 'A'],
        ['Why does the writer mention the science teacher?', ['To show how one person’s knowledge supported the project.', 'To explain why the council changed its rules.', 'To prove that gardening is mainly a school activity.', 'To describe the most successful crop in the garden.'], 'A'],
        ['What does the writer suggest about the people using the garden?', ['They have built connections while working on a practical task.', 'They now agree about every decision concerning the garden.', 'They prefer receiving help to taking responsibility themselves.', 'They joined mainly because the vegetables were free.'], 'A'],
        ['What is the writer’s main point?', ['A shared project can improve a place and its community.', 'Local councils should always replace empty land with gardens.', 'Successful gardens depend on having expert volunteers.', 'People should avoid disagreement when planning activities.'], 'A']
      ]
    },
    part4: {
      title: 'A new use for an empty shop',
      text: `For years, the corner shop beside the bus stop stood empty. (16) ..... One spring, a group of residents asked whether it could become a shared workshop. (17) ..... The owner agreed to lend the room for three months, provided that the visitors kept it clean. (18) ..... Volunteers then collected shelves, lamps and a few safe hand tools. (19) ..... As more people came in, they began bringing broken household items from home. (20) ..... The temporary workshop became a regular Saturday meeting place.`,
      options: ['People hurried past it without paying much attention.', 'The idea was unusual, but it solved two local problems.', 'This condition was important because the building was old.', 'Most of the equipment arrived from people’s homes.', 'In this way, the project could begin without a large budget.', 'The residents decided to sell the building instead.', 'Nobody knew who had owned the shop before.', 'The bus company offered to run extra services.'],
      answers: ['A', 'B', 'C', 'E', 'D']
    }
  },
  30: {
    topic: ['digital study rooms', 'adult learners', 'online lessons', 'screen-sharing'],
    part3: {
      title: 'Learning to fix a difficult device',
      paragraphs: [
        `When our evening class received a box of old tablets, most learners expected to use them for simple reading practice. The tutor, Priya, had another idea. She asked the group to find out why several devices stopped working after an update. No one was required to repair a tablet alone. Instead, each pair recorded what they tried, so that the class could compare results rather than repeat the same mistake.`,
        `The investigation took longer than the learners had hoped. One pair blamed the battery, while another thought the screens had been damaged. Priya did not immediately tell them which theory was correct. She showed them how to search the device settings and read a short repair guide. Gradually, the learners noticed that the problem appeared only on tablets with very little free storage. Deleting unused files solved some cases, but two devices still needed professional help.`,
        `The class did not repair every tablet, yet Priya considered the project successful. Learners had practised checking evidence, explaining a process and changing their minds when new information appeared. They also created a clear guide for future students. The most useful result was therefore not a box of working devices. It was the confidence to approach an unfamiliar problem in small, sensible steps.`
      ],
      questions: [
        ['What did Priya ask the learners to investigate?', ['Why some tablets stopped working after an update.', 'How to buy cheaper tablets for the evening class.', 'Which reading books were most popular with students.', 'Why the screens of all the tablets were damaged.'], 'A'],
        ['Why did each pair record what it tried?', ['So the learners could avoid repeating one another’s work.', 'So Priya could mark every learner’s handwriting.', 'So the class could decide which tablet to throw away.', 'So the tutor would not need to explain the settings.'], 'A'],
        ['What helped the learners identify the likely cause?', ['They compared the devices and checked their available storage.', 'They replaced every battery before testing the tablets.', 'They asked a professional to repair the first device.', 'They followed Priya’s answer without examining the evidence.'], 'A'],
        ['Why did Priya regard the project as successful?', ['The learners developed a method for dealing with new problems.', 'Every tablet was repaired before the class ended.', 'The learners learned that repair guides are unnecessary.', 'The class found a way to avoid using digital devices.'], 'A'],
        ['What is the writer’s main message?', ['Trying to understand a problem can be as valuable as solving it.', 'Technology lessons are useful only when equipment is new.', 'Teachers should give answers before learners begin practical work.', 'A repair project should be stopped as soon as one device fails.'], 'A']
      ]
    },
    part4: {
      title: 'A useful mistake',
      text: `Our coding club planned to build a quiz for the school website. (16) ..... The first version looked fine, but it gave the same result for every answer. (17) ..... Instead of deleting the program, the students examined each instruction. (18) ..... They discovered that one line had been copied into the wrong place. (19) ..... After moving it, they tested the quiz with younger pupils. (20) ..... The mistake had therefore taught them more than a perfect first attempt would have done.`,
      options: ['Everyone assumed the task would take only one afternoon.', 'This showed that the problem was in the instructions, not the questions.', 'The club had never used a website before.', 'The pupils found a few unclear questions as well.', 'They wanted visitors to receive different feedback.', 'For this reason, the teacher cancelled the project.', 'The students decided not to test the program again.', 'A new computer room was opened nearby.'],
      answers: ['E', 'B', 'A', 'D', 'C']
    }
  },
  51: {
    topic: ['coastal travel', 'young travellers', 'local buses', 'low-waste packing'],
    part3: {
      title: 'The journey that changed our plans',
      paragraphs: [
        `Last summer, my cousin and I planned to walk along the northern coast. We had studied the map carefully and booked a small room in a fishing village. On the first morning, however, a storm closed the cliff path. At first we were disappointed because the walk was the main reason for our trip. The owner of the guesthouse suggested that we take a local bus inland, where a community museum was looking for visitors to help prepare an exhibition.`,
        `The museum was not what we had expected. It was in an old railway station, and the exhibition showed how families had travelled before the coastal road was built. We spent the morning cleaning display cases and listening to stories from a retired conductor. In the afternoon, the rain stopped, so we took the bus to a quieter beach. We noticed that the bus was nearly empty, while cars were queuing at the popular viewpoint.`,
        `We eventually walked part of the coast the next day, but the changed plan stayed with us. The museum had made us curious about the places between the famous sights, and the bus journey had shown us that slower travel could be more peaceful. We still want to return for the cliff path. This time, though, we will leave space in our plan for an unexpected recommendation.`
      ],
      questions: [
        ['Why could the writers not begin their planned walk?', ['A storm had made the cliff path unsafe.', 'The guesthouse had lost their booking.', 'The museum needed them to work all day.', 'The local bus had stopped running.'], 'A'],
        ['Why did the guesthouse owner suggest the museum?', ['It offered an alternative activity during the bad weather.', 'It was the fastest route to the popular viewpoint.', 'It needed someone to repair the old railway station.', 'It had already arranged a walk along the coast.'], 'A'],
        ['What did the writers notice about the bus and the viewpoint?', ['The less popular form of transport was much quieter.', 'Both places were crowded with families that afternoon.', 'Cars were avoided because the road had been closed.', 'The bus was expensive compared with travelling by car.'], 'A'],
        ['How did the changed plan affect the writers?', ['They became more interested in places away from famous sights.', 'They decided that coastal walking was no longer enjoyable.', 'They felt the museum was more interesting than every other place.', 'They planned to travel only when the weather was perfect.'], 'A'],
        ['What will the writers probably do on a future trip?', ['Keep their main plan but allow time for new suggestions.', 'Book every activity before leaving home.', 'Avoid buses because they make journeys too slow.', 'Visit only the most popular viewpoints.'], 'A']
      ]
    },
    part4: {
      title: 'A cleaner way to travel',
      text: `Maya wanted to travel across the island without producing much rubbish. (16) ..... She packed a bottle, a cloth bag and a small container for food. (17) ..... At the first station, the café filled her bottle without charging her. (18) ..... Later, she bought fruit from a market rather than a wrapped snack. (19) ..... The shopkeeper even explained where visitors could refill water nearby. (20) ..... By the end of the trip, Maya had spent less money and carried almost no waste home.`,
      options: ['Her plan began with choosing what not to take.', 'This friendly service made the next part of the journey easier.', 'The market was closed because of a public holiday.', 'That choice also meant she could avoid several disposable packets.', 'The journey was longer than she had first expected.', 'She decided that travelling lightly was only possible by plane.', 'The shopkeeper had never met a visitor before.', 'This was the first time Maya had used a train.'],
      answers: ['A', 'B', 'D', 'E', 'C']
    }
  }
}

// Test-specific Part 1/2 content is intentionally explicit: renderer logic remains shared, copy does not.
const QUALITY_BLUEPRINTS = {
  14: { domain: 'local clubs, courses and community activities', part1: [
    ['Community-centre notice','The Riverside Centre moved its Saturday cooking session upstairs. Bring an apron, arrive ten minutes early and tell reception if you need the accessible lift.','What should participants do?',['Bring an apron and arrive early.','Collect a kitchen key.','Book another Saturday.','Use stairs instead of the lift.'],'A'],
    ['Message between neighbours','Hi Ben, I am away on Thursday. Could you put my recycling box outside after seven? Collection has changed this week. I will bring your newspaper in on Friday.','What is Ben asked to do?',['Leave a newspaper Friday.','Put the recycling box out Thursday.','Change collection day.','Visit before seven.'],'B'],
    ['Volunteer email','We have enough food-bank drivers, but still need someone to label donated tins before the afternoon delivery. Please reply by noon if you can take this job.','What is still needed?',['Someone to label tins.','More drivers.','Donations before noon.','Someone to collect food.'],'A'],
    ['Library update','Roof repairs finish Monday, but the study room stays closed until Wednesday while paint dries. Books can be returned through the side door during opening hours.','What can users do before Wednesday?',['Study in the room.','Return books at the side door.','Enter through the roof area.','Collect paint.'],'B'],
    ['Class booking confirmation','Your pottery class is confirmed for 18 March at 6 p.m. The fee includes clay, not a storage box. Cancel by Tuesday evening for a refund.','What condition applies?',['A box is included.','It starts Tuesday.','Cancellation by Tuesday is needed for a refund.','It can move to April.'],'C'],
  ], part2: { options: ['An evening beginner pottery course at the arts centre. Clay and tools are supplied, and finished work can be collected later. The moderate fee is paid per course; sessions end at nine.','A Saturday morning gardening club beside the community centre. Members work outdoors in shared plots, bring gloves and learn from experienced growers. It is inexpensive and social.','A free weekday lunchtime language exchange in a quiet library room. Adults practise conversation with changing partners, without formal teaching or homework.','A monthly family craft afternoon at the museum. Materials are included and activities are indoors, but children need an accompanying adult.','An accessible photography walk for adults. The leader chooses a short step-free route and pauses often; participants need a phone or camera.','A free Tuesday repair workshop. Skilled members help mend small household items, but visitors bring the broken item and cannot book appointments.','A quiet monthly book group at a village hall. Members read one agreed novel, but the hall is outside town and transport is self-arranged.','A weekend first-aid course with a certificate and practical pair work. It costs more than clubs but suits future event volunteers.'], profiles: ['Elliot works late and wants an indoor practical beginner course, with a medium budget and something to take home.','Farah is free Saturday mornings, owns gloves, likes outdoor group work and needs a cheap activity near the centre.','Grace has one free lunchtime hour and wants free indoor conversation practice without homework or formal teaching.','Hugo uses a wheelchair, owns a phone and wants a small-group photography activity with a step-free route.','Isla wants a recognised qualification before volunteering at festivals, can pay and is happy with practical pair work.'], answers: ['A','B','C','E','H'] } },
  30: { domain: 'technology workshops, learning tools and repair services', part1: [
    ['App notification','Your language app added a listening review today. Download it before leaving because train Wi-Fi may fail. The vocabulary game can wait until tomorrow without losing progress.','What is advised?',['Download the listening review before travelling.','Play the game on the train.','Delete progress.','Wait to open the app.'],'A'],
    ['School technology notice','The computer room is unavailable at Tuesday lunchtime while keyboards are installed. Students may use library computers, but must reserve a seat online first.','What must students do?',['Install a keyboard.','Reserve a library seat.','Bring a computer.','Use it without booking.'],'B'],
    ['Repair-service message','Your headphone cable can be replaced today, but the matching adapter is out of stock. We can return the headphones without it or keep them until Friday’s delivery.','What choice is offered?',['Free replacement of both.','An adapter today.','Collection now or waiting until Friday.','Repair only after buying headphones.'],'C'],
    ['Online-course email','This week’s coding lesson is available Wednesday rather than Tuesday. The quiz deadline is unchanged, and the tutor answers forum questions Thursday evening. Check the calendar.','What changed?',['The quiz deadline.','The lesson release day.','The forum closing.','The calendar.'],'B'],
    ['Equipment instructions','Before using the projector, connect power and select HDMI 2. After the lesson, do not unplug immediately: press blue standby and wait for the lamp to cool.','What should users do afterwards?',['Press standby and wait.','Unplug while selecting HDMI 2.','Remove the lamp.','Leave it disconnected.'],'A'],
  ], part2: { options: ['An evening beginner animation workshop. Laptops are supplied, the tutor demonstrates each step and the group is small. It is at the college and needs no installation beforehand.','A Saturday repair desk for cracked phone screens. Customers get a fixed price first, but the phone stays two days and deleted photos cannot be recovered.','A free online study tool for flexible phone practice. It saves progress and offers short quizzes, but has no live teacher.','A daytime workshop for experienced spreadsheet users. It covers formulas on centre desktops; bring a real project and work independently.','A free after-school coding club for teenagers. Members bring laptops, build games in teams and receive university-volunteer help; places are booked.','A weekday-morning home printer repair service. A technician diagnoses faults first, but charges a call-out fee even if repair is impossible.','A cheap video course on safe computer maintenance. It is flexible and includes checklists, but learners supply their own computer and parts.','A free Friday-morning drop-in for older adults practising email and video calls. Tablets and step-free access are provided; staff explain one task at a time.'], profiles: ['Nadia is a complete beginner who wants evening animation lessons, has no laptop and prefers a small guided college group.','Owen has a broken printer, cannot transport it, is free weekday mornings and accepts a diagnostic call-out charge.','Pia wants free flexible vocabulary practice on her phone and is comfortable without a live teacher.','Quinn is an experienced spreadsheet user who wants advanced formulas applied to a real project on a daytime desktop.','Rosa is retired, needs a supplied tablet and step-free access for video-call practice; Friday morning suits her.'], answers: ['A','F','C','D','H'] } },
  51: { domain: 'trips, outdoor activities and responsible travel', part1: [
    ['Transport update','The 8.15 bus to West Bay is cancelled Friday because of roadworks. Use the 8.35 from the same stop, but it skips the harbour. Allow extra time to walk from the station.','What should passengers do?',['Take the later bus and walk.','Wait at the harbour.','Use another 8.15 bus.','Expect the harbour stop.'],'A'],
    ['Hostel notice','Breakfast is served 7–9 a.m. Early departures can request a packed breakfast at reception before 8 p.m. the previous evening. Label food kept in the shared fridge.','What should an early guest do?',['Request a packed breakfast in advance.','Eat after returning the key.','Leave food unlabelled.','Collect it after nine.'],'A'],
    ['Eco-tour message','Tomorrow’s wetland tour uses the shorter boardwalk because rain made the outer path slippery. Bring waterproof shoes and binoculars if available. The group returns by midday.','What changed?',['The route is shorter.','It returns afternoon.','Binoculars are compulsory.','The tour is cancelled.'],'A'],
    ['Travel booking email','Your sleeper-train reservation is confirmed for 4 June. One small cabin bag is included; larger luggage costs extra. Changes are free until 28 May; afterwards the booking is non-refundable.','What is important?',['Changes after 28 May are free.','Large luggage is included.','It is refundable afterwards.','Free changes end 28 May.'],'D'],
    ['Visitor-centre announcement','The lighthouse exhibition is open, but the viewing platform is closed while staff replace a railing. Visitors may join the guided talk inside; tickets remain valid.','What can visitors do?',['Join the indoor guided talk.','Use the platform later.','Exchange every ticket.','Watch the repair.'],'A'],
  ], part2: { options: ['A half-day beginner kayak trip on calm water. Boats and safety equipment are supplied, the launch is beside the bus station, and groups are small; participants must swim confidently.','A demanding two-day mountain walk for experienced hikers. Walkers carry food, tents and equipment; the remote start is reached by a morning train.','A low-cost coastal cycle route with bike hire. Riders use quiet lanes between villages and return before evening; the route is mostly flat but lunch is self-arranged.','A wildlife photography weekend at a forest lodge. The guide teaches observation, vegetarian meals are provided and guests share a minibus; it is not for very young children.','A responsible city walk led by residents. It supports independent businesses, is accessible and affordable, stays on foot and has indoor stops for bad weather.','A family beach-clean morning. Gloves and bags are supplied, children join with an adult and the work ends with a talk about reducing plastic waste.','A luxury island boat excursion with lunch and transfers. It costs a lot and follows a fixed timetable, with little independent exploring.','A free self-guided moorland route with audio stories. It is flexible, but has no transport or equipment hire and limited signal high up.'], profiles: ['Sam has never kayaked, needs equipment supplied, wants a small beginner group and must reach the launch by public transport.','Tara wants an affordable accessible activity supporting residents, prefers walking, needs rain shelter and has half a day in the city.','Uma travels with her ten-year-old daughter and wants an adult-supervised environmental activity with gloves supplied before lunch.','Victor is an experienced hiker with camping equipment, wants a remote challenge and can catch an early train.','Wendy wants a weekend wildlife photography trip with vegetarian food and shared transport; she owns a camera and has no young children.'], answers: ['A','E','F','B','D'] } }
}
const QUALITY_PART346 = {
  14: { part3: QUALITY_SAMPLES[14].part3, part4: QUALITY_SAMPLES[14].part4, part5: { text: `The community garden started with a simple idea, but its success depended on careful planning. Each volunteer chose a task that suited their experience, and the organisers kept a record of tools and seeds. A retired teacher explained how to protect young plants, while children learned to recognise insects that help crops grow. When summer became unusually dry, the group collected rainwater and changed the watering schedule. They also shared vegetables with the food bank, which made the project feel connected to the wider neighbourhood. New members are welcome during the Saturday session, although they should contact the coordinator first. The garden is not only a place to grow food; it is also a practical way for neighbours to learn from one another and take responsibility for a shared space.`, gaps: [['on','at','in','by'],'A','preposition'], answers: ['on','use','uncertain','so that','during','local'] }, part6: { text: `Before the garden opened, the organisers checked (27) ........ the ground could drain properly. They invited residents to help, (28) ........ nobody needed previous experience. A notice explained (29) ........ tools were stored and asked visitors to return them after use. The team decided (30) ........ collect rainwater from the centre roof. This meant (31) ........ plants could survive a dry week without using drinking water. Volunteers recorded (32) ........ had watered each plot, so the next person knew what remained to be done.`, answers: ['whether','although','where','to','the','who'], targets: ['relative-word','conjunction','relative-word','infinitive','article','pronoun'] } },
  30: { part3: QUALITY_SAMPLES[30].part3, part4: QUALITY_SAMPLES[30].part4, part5: { text: `When the evening class received old tablets, the learners expected an easy reading exercise. Instead, the tutor asked them to investigate why several devices failed after an update. Each pair wrote down one suggestion and tested it without changing several things at once. They discovered that the tablets with almost no free storage behaved differently. Deleting unused files solved some problems, but two devices still needed a technician. The class therefore learned an important lesson about evidence: a confident guess is not the same as a reliable explanation. The learners later made a checklist for future classes, including questions about power, storage and software versions. Their guide was short, but it gave beginners a sensible way to start when technology behaved unexpectedly.`, gaps: [['about','for','with','to'],'A','dependent-preposition'], answers: ['made','out','because','to','carefully','reliable'] }, part6: { text: `The learners began (27) ........ a list of possible causes. They tested one idea (28) ........ a time, because changing several settings together would hide the evidence. When a tablet worked again, they wrote (29) ........ the result before trying another device. The tutor asked (30) ........ they could explain the change in simple language. Two tablets were too damaged (31) ........ repair in class, but the group still learned (32) ........ to investigate a technical problem.`, answers: ['with','at','down','whether','for','how'], targets: ['preposition','fixed-phrase','phrasal-verb','conjunction','preposition','relative-word'] } },
  51: { part3: QUALITY_SAMPLES[51].part3, part4: QUALITY_SAMPLES[51].part4, part5: { text: `Our coastal trip changed when a storm closed the cliff path. At first we wanted to wait, but a local guide suggested a bus to a small museum inland. The museum showed how families had travelled before the new road was built, and we helped prepare a display for visitors. Later, the rain stopped and we took the bus to a quiet beach. There were few people there, while cars waited in a long queue at the famous viewpoint. We had planned to see more sights, yet the slower day made us notice how much travel depends on local advice. Since then, we have carried reusable containers, used public transport when possible and left space in our plans for places that are not in every guidebook.`, gaps: [['by','until','at','from'],'A','time-expression'], answers: ['changed','away','although','to','quietly','advice'] }, part6: { text: `The storm arrived (27) ........ we reached the cliff path, so the guide suggested a safer route. We travelled (28) ........ bus and spent the morning in a museum. The exhibition explained (29) ........ coastal families had once moved between villages. We stayed there (30) ........ the rain stopped. In the afternoon, we chose a beach (31) ........ was outside the busiest resort. The experience taught us (32) ........ to travel with less waste and more curiosity.`, answers: ['before','by','how','until','that','how'], targets: ['conjunction','preposition','relative-word','conjunction','relative-word','infinitive'] } }
}

const topics = [
  ['community gardens', 'local gardeners', 'shared plots', 'water-saving'],
  ['repair cafés', 'volunteers', 'broken appliances', 'reuse'],
  ['night markets', 'visitors', 'street food', 'local traders'],
  ['cycle routes', 'commuters', 'safe paths', 'weather'],
  ['school libraries', 'students', 'reading corners', 'quiet study'],
  ['wildlife walks', 'young naturalists', 'woodland trails', 'careful observation'],
  ['street murals', 'artists', 'public walls', 'neighbourhood stories'],
  ['weekend workshops', 'new learners', 'practical skills', 'friendly advice'],
]

const letters = 'ABCDEFGH'.split('')
const option = (id, label) => ({ id, label })
const q = (id, number, type, prompt, options = []) => ({ id, number, type, prompt, options, answerConfidence: 'key' })
const partId = (n, p) => `catalog-reading-pet-b1-test${n}-part-${p}`
const questionId = (n, p, number) => `${partId(n, p)}-q${number}`
const range = (start, end) => `Questions ${start}–${end}`

function part1(n, topic) {
  const items = QUALITY_BLUEPRINTS[n]?.part1 ?? []
  if (!items.length) throw new Error(`Missing quality Part 1 blueprint for Test ${n}`)
  return { id: partId(n, 1), partNumber: 1, renderMode: 'html-css', rangeLabel: range(1, 5), passageTitle: 'Part 1 – Short texts', passage: items.map(([title, text]) => ({ text: `${title}\n${text}` })), questionGroups: [{ id: `${partId(n, 1)}-g0`, range: range(1, 5), instruction: 'For each question, choose the correct answer A, B, C or D.', type: 'multiple-choice', questions: items.map((x, i) => q(questionId(n, 1, i + 1), i + 1, 'multiple-choice', x[2], x[3].map((label, j) => option(String.fromCharCode(65 + j), label)))) }], _answers: items.map((x, i) => [questionId(n, 1, i + 1), { answer: x[4], explanation: `The answer is supported by the ${x[0].toLowerCase()}.` }]) }
}

function part2(n, topic) {
  const blueprint = QUALITY_BLUEPRINTS[n]?.part2
  if (!blueprint) throw new Error(`Missing quality Part 2 blueprint for Test ${n}`)
  const optionDetails = [
    ' Sessions include a clear introduction, a practical task and time to ask questions before participants leave. The timetable is published clearly so learners can plan their visit.',
    ' The organiser confirms places in advance and explains the meeting point, expected costs and what members should bring. Clear instructions are sent before the first meeting.',
    ' The activity is designed for people who value a manageable commitment, clear information and a friendly atmosphere. It is suitable for learners who want steady progress.',
    ' Participants receive simple guidance at the start, then choose an activity that matches their own experience and aims. The organiser explains the timetable before work begins.',
    ' The leader checks everyone’s needs beforehand and adapts the pace so the group can finish comfortably and safely. Questions are welcomed throughout the activity.',
    ' Visitors should contact the organiser first, because the service has limited space and follows a set weekly timetable. This prevents an unnecessary journey when no place remains.',
    ' Members receive the reading or learning material before meeting and are encouraged to contribute at their own pace. New members can ask for a short explanation.',
    ' The tutor explains the practical requirements clearly and gives participants a record of what they have completed. The certificate is useful when arranging future volunteering work.',
    ' The organiser provides a concise safety reminder and confirms the finishing time, so participants can make reliable travel plans.'
  ]
  const profileDetails = [
    ' They also want the practical arrangements to be predictable and do not want to purchase specialist equipment.',
    ' A nearby meeting point matters because they do not want a long journey after their other commitments.',
    ' They prefer an informal option where missing one session will not prevent them from continuing later.',
    ' Comfort and straightforward access are more important than a competitive or highly demanding programme.',
    ' The final result should be useful for a future plan, rather than simply being a one-off social activity.'
  ]
  const options = blueprint.options.map((value, i) => `${value}${optionDetails[i]}`)
  const profiles = blueprint.profiles.map((value, i) => `${value}${profileDetails[i]}`)
  const passage = [{ text: `The people below want to choose from ${QUALITY_BLUEPRINTS[n].domain}. Decide which option is most suitable.` }, ...options.map((text, i) => ({ label: letters[i], text, imageSlotId: `${partId(n, 2)}-option-${letters[i].toLowerCase()}-image`, imageRequired: false }))]
  const questions = profiles.map((text, i) => q(questionId(n, 2, i + 6), i + 6, 'matching-features', text, []))
  return { id: partId(n, 2), partNumber: 2, rangeLabel: range(6, 10), passageTitle: 'Part 2 – Matching', passage, questionGroups: [{ id: `${partId(n, 2)}-g0`, range: range(6, 10), instruction: 'For each question, choose the most suitable option.', type: 'matching-features', features: options.map((text, i) => ({ id: letters[i].toLowerCase(), name: text })), questions }], _answers: questions.map((x, i) => [x.id, { answer: blueprint.answers[i], explanation: `Option ${blueprint.answers[i]} satisfies all constraints in the profile.` }]) }
}

function part3(n, topic) {
  const sample = QUALITY_SAMPLES[n]?.part3
  if (sample) {
    const qs = sample.questions.map((x, i) => q(questionId(n, 3, i + 11), i + 11, 'multiple-choice', x[0], x[1].map((label, j) => option(String.fromCharCode(65 + j), label))))
    const extension = { 14: ' The project also changed how the library used its outdoor space. Children drew plans, older residents compared methods, and visitors could see the results of careful cooperation. The volunteers kept notes so the next group could begin with honest advice.', 30: ' The learners later presented their method to another class. They explained why a quick guess could mislead and showed how a checklist made testing clearer. Several students admitted that they had usually avoided technical problems, but careful investigation now felt possible.', 51: ' The experience also changed how we packed. We bought fewer souvenirs, carried food in reusable containers and followed local advice instead of only the busiest route. These choices helped us notice places that a hurried visit might have missed.' }[n]
    const paragraphs = [...sample.paragraphs]
    paragraphs[2] = `${paragraphs[2]}${extension}`
    return { id: partId(n, 3), partNumber: 3, rangeLabel: range(11, 15), passageTitle: `Part 3 – ${sample.title}`, passage: paragraphs.map(text => ({ text })), questionGroups: [{ id: `${partId(n, 3)}-g0`, range: range(11, 15), instruction: 'Read the text and choose the correct answer A, B, C or D.', type: 'multiple-choice', questions: qs }], _answers: qs.map((x, i) => [x.id, { answer: sample.questions[i][2], explanation: 'The answer is supported by the passage evidence.' }]) }
  }
  const [subject, people, object, detail] = topic
  const passage = `When the ${people} in our town started a ${subject} project, few residents expected it to grow so quickly. At first, the organisers met in a small room and planned one simple activity involving ${object}. They soon discovered that people were more willing to join when they could see a clear benefit for the neighbourhood. The organisers therefore published a short timetable and invited local businesses to offer practical help.\n\nThe project was not completely easy. Some volunteers were worried that the work would take too much time, while others wanted to change the plan every week. The team solved this by giving each person one small responsibility and reviewing the results together. This made the project feel manageable, and it also meant that new volunteers could contribute without special experience.\n\nLooking back, the organiser says the most important lesson was not the final result but the way people learned to cooperate. The group still has problems, especially when the weather affects outdoor work, yet members now discuss solutions rather than blaming one another. For this reason, the project has become a useful example of how a modest local idea can create lasting connections.`
  const questions = [
    ['What was one reason more residents joined the project?', ['They could understand its practical value.', 'They were promised paid work.', 'They wanted to compete with local businesses.', 'They were required to attend.'], 'A'],
    ['What problem did some volunteers have at the beginning?', ['They disagreed about how often to change the plan.', 'They could not find a suitable meeting room.', 'They lacked permission to contact businesses.', 'They had no interest in outdoor work.'], 'A'],
    ['How did the team make participation easier?', ['It divided the work into smaller responsibilities.', 'It removed the timetable completely.', 'It asked only experienced people to help.', 'It stopped reviewing the results.'], 'A'],
    ['What does the organiser value most about the project?', ['The cooperation that developed among residents.', 'The money earned by local businesses.', 'The speed at which the first activity finished.', 'The number of changes made to the timetable.'], 'A'],
    ['What is the writer’s main point?', ['A small local project can strengthen a community.', 'Outdoor projects are always more successful than indoor ones.', 'Volunteers should avoid changing their plans.', 'Businesses should organise neighbourhood activities.'], 'A'],
  ]
  const qs = questions.map((x, i) => q(questionId(n, 3, i + 11), i + 11, 'multiple-choice', x[0], x[1].map((label, j) => option(String.fromCharCode(65 + j), label))))
  return { id: partId(n, 3), partNumber: 3, rangeLabel: range(11, 15), passageTitle: `Part 3 – ${subject}`, passage: passage.split('\n\n').map(text => ({ text })), questionGroups: [{ id: `${partId(n, 3)}-g0`, range: range(11, 15), instruction: 'Read the text and choose the correct answer A, B, C or D.', type: 'multiple-choice', questions: qs }], _answers: qs.map((x, i) => [x.id, { answer: questions[i][2], explanation: 'The answer is supported by the corresponding paragraph.' }]) }
}

function part4(n, topic) {
  const sample = QUALITY_SAMPLES[n]?.part4
  if (sample) {
    const qs = Array.from({ length: 5 }, (_, i) => q(questionId(n, 4, i + 16), i + 16, 'gap-fill', `Gap ${i + 16}`, []))
    const extension = { 14: ' The residents had discussed the idea at a library meeting. They wanted a place for repairing lamps, bicycles and small furniture. A caretaker checked the electricity and marked a safe area for tools. At the end of each session, volunteers swept the floor and recorded what needed replacing.', 30: ' The club had planned the questions carefully, but had not learned that the order of instructions could change the result. The teacher asked them to describe each stage and test one change at a time. This made the discussion more useful and helped the pupils understand the process.', 51: ' Maya had checked the route, but not every station offered the same facilities. She watched local passengers use refill points and kept her container ready. These preparations took little space and meant a delay did not force her to buy disposable items.' }[n]
    return { id: partId(n, 4), partNumber: 4, rangeLabel: range(16, 20), passageTitle: `Part 4 – ${sample.title}`, passage: [{ text: `${sample.text} ${extension}` }, ...sample.options.map((x, i) => ({ label: letters[i], text: x }))], questionGroups: [{ id: `${partId(n, 4)}-g0`, range: range(16, 20), instruction: 'Choose the sentence which fits each gap.', type: 'matching-features', features: sample.options.map((x, i) => ({ id: letters[i].toLowerCase(), name: x })), questions: qs }], _answers: qs.map((x, i) => [x.id, { answer: sample.answers[i], explanation: `Sentence ${sample.answers[i]} fits the reference and sequence at gap ${i + 16}.` }]) }
  }
  const [subject, people] = topic
  const options = [
    'This was the first sign that the idea might work.', 'For that reason, the group changed its meeting place.', 'As a result, several people offered to help.', 'The organisers had not expected such a quick response.', 'Even so, the original aim remained the same.', 'They later used the same method in another area.', 'This made the final decision much easier.', 'In the end, everyone agreed to continue.'
  ]
  const text = `The ${people} began their ${subject} plan with one short meeting. (16) ..... The next week, more residents arrived than expected. (17) ..... They wanted to keep the activity useful rather than simply make it larger. (18) ..... The organisers therefore asked members to choose one task each. (19) ..... The work became easier to manage, and new volunteers quickly understood what to do. (20) ..... The project now meets regularly and welcomes anyone who wants to take part.`
  const answers = ['D', 'C', 'E', 'G', 'H']
  const qs = Array.from({ length: 5 }, (_, i) => q(questionId(n, 4, i + 16), i + 16, 'gap-fill', `Gap ${i + 16}`, []))
  return { id: partId(n, 4), partNumber: 4, rangeLabel: range(16, 20), passageTitle: `Part 4 – ${subject}`, passage: [{ text }, ...options.map((x, i) => ({ label: letters[i], text: x }))], questionGroups: [{ id: `${partId(n, 4)}-g0`, range: range(16, 20), instruction: 'Choose the sentence which fits each gap.', type: 'matching-features', features: options.map((x, i) => ({ id: letters[i].toLowerCase(), name: x })), questions: qs }], _answers: qs.map((x, i) => [x.id, { answer: answers[i], explanation: `Sentence ${answers[i]} fits the reference and sequence at gap ${i + 16}.` }]) }
}

function part5(n, topic) {
  const [subject, people, object] = topic
  const data = [
    [`The ${people} usually meet (21) ........ Saturday.`, ['every', 'each', 'whole', 'all'], 'A', 'every'],
    [`New members are shown how to (22) ........ the equipment.`, ['use', 'make', 'bring', 'hold'], 'A', 'use'],
    [`They can ask for advice if they are (23) ........ about a task.`, ['uncertain', 'narrow', 'single', 'empty'], 'A', 'uncertain'],
    [`The group works together (24) ........ everyone can learn.`, ['so that', 'unless', 'although', 'before'], 'A', 'so that'],
    [`Members often share ideas (25) ........ the session.`, ['during', 'between', 'inside', 'through'], 'A', 'during'],
    [`The project has become a popular way to meet (26) ........ people.`, ['local', 'private', 'silent', 'rare'], 'A', 'local'],
  ]
  if (QUALITY_SAMPLES[n]) data[0][0] += ` Before each meeting, the organiser checks the timetable and sends a short message to everyone who has booked a place. Some members bring materials from home, while others prepare examples for beginners. If the weather changes, the group moves indoors and continues with a quieter activity. The aim is not to finish quickly, but to make sure that each visitor leaves with a useful idea and knows where to find help next time. The organiser also keeps a notebook of suggestions, so the programme can improve without losing its friendly character.`
  const qs = data.map((x, i) => q(questionId(n, 5, i + 21), i + 21, 'multiple-choice', `Gap (${i + 21})`, x[1].map((label, j) => option(String.fromCharCode(65 + j), label))))
  return { id: partId(n, 5), partNumber: 5, rangeLabel: range(21, 26), passageTitle: `Part 5 – ${subject}`, passage: [{ text: data.map(x => x[0]).join(' ') }], questionGroups: [{ id: `${partId(n, 5)}-g0`, range: range(21, 26), instruction: 'For each question, choose the correct answer A, B, C or D.', type: 'multiple-choice', questions: qs }], _answers: qs.map((x, i) => [x.id, { answer: data[i][2], explanation: `The correct collocation is “${data[i][3]}”.` }]) }
}

function part6(n, topic) {
  const [subject, people, object, detail] = topic
  const words = ['each', 'how', 'but', 'from', 'where', 'to']
  let passage = QUALITY_SAMPLES[n] ? `The ${people} meet (27) ........ week to plan activities and decide (28) ........ the next session will need. New members can join, (29) ........ they should ask questions when instructions are unclear. The group keeps materials (30) ........ being thrown away and records (31) ........ has borrowed equipment. It is a place (32) ........ everyone can learn at a comfortable pace. Before leaving, members check the room, return tools and make sure the next group will find everything ready.` : `The ${people} meet (27) ........ week to plan activities. New members learn (28) ........ to use the ${object} safely. They can join the work, (29) ........ they should follow the group’s instructions. The project has kept useful materials (30) ........ being thrown away. It is a place (31) ........ people can exchange ideas. Remember (32) ........ ask for help when you need it.`
  if (QUALITY_SAMPLES[n]) passage += ' A notice explains where spare materials are stored, and a volunteer checks that visitors understand the simple rules. Members also leave notes for anyone who could not attend, so that the plan remains clear and no one is left out. The group reviews these notes at the next meeting and changes its routine only when the new arrangement will help everyone.'
  const qs = words.map((_, i) => q(questionId(n, 6, i + 27), i + 27, 'gap-fill', `Gap (${i + 27})`, []))
  return { id: partId(n, 6), partNumber: 6, rangeLabel: range(27, 32), passageTitle: `Part 6 – ${subject}`, passage: [{ text: passage }], questionGroups: [{ id: `${partId(n, 6)}-g0`, range: range(27, 32), instruction: 'Write one word for each gap.', type: 'gap-fill', questions: qs }], _answers: qs.map((x, i) => [x.id, { answer: words[i], explanation: `The word “${words[i]}” completes the sentence.` }]) }
}

function buildPart3(n, topic) {
  const sample = QUALITY_PART346[n].part3
  const extra = { 14: ' The organisers initially measured success by the number of vegetables collected, but the weekly meetings changed their view. They noticed that new volunteers asked questions that improved the planting plan, and that older residents enjoyed passing on knowledge they had once kept to themselves. A disagreement about a locked tool shed was solved when the group wrote simple rules together. The rules did not remove every problem, but they made responsibility visible and fair. By the end of the season, the garden had become a place where people could contribute in different ways. Some planted, some repaired fences, and some simply welcomed visitors. The writer believes this variety made the project stronger than a scheme led by only one confident organiser.', 30: ' The tutor was careful not to make the activity sound like a competition. When one pair found a possible cause, another pair checked the result using a different tablet. This sometimes slowed the lesson, but it prevented the class from treating one successful test as proof. Learners also had to explain why a solution might fail in another situation. That limitation mattered because the devices were old and their software was not identical. At the final meeting, the class compared its notes and agreed that a checklist could guide an investigation without replacing judgement. The students left with more patience and a clearer understanding of what practical digital confidence involves.', 51: ' We had expected the most memorable part to be the cliff walk, so the change felt disappointing at first. The museum visit gradually altered that opinion. Its displays connected transport, work and landscape, while the quiet bus ride gave us time to notice villages we would have missed by car. We also realised that responsible travel is not simply a list of rules. It involves asking local people, accepting limits and making choices that leave room for other visitors. The next morning, when the path reopened, we walked only a short section and spent longer in a small café. The journey became less about completing a route and more about paying attention to the places that made the route meaningful.' }[n]
  const paragraphs = [...sample.paragraphs]; paragraphs[2] += extra
  const qs = sample.questions.map((x, i) => q(questionId(n, 3, i + 11), i + 11, 'multiple-choice', x[0], x[1].map((label, j) => option(String.fromCharCode(65 + j), label))))
  return { id: partId(n, 3), partNumber: 3, rangeLabel: range(11, 15), passageTitle: `Part 3 – ${sample.title}`, passage: paragraphs.map(text => ({ text })), questionGroups: [{ id: `${partId(n, 3)}-g0`, range: range(11, 15), instruction: 'Read the text and choose the correct answer A, B, C or D.', type: 'multiple-choice', questions: qs }], _answers: qs.map((x, i) => [x.id, { answer: sample.questions[i][2], explanation: 'The answer is supported by the passage evidence.' }]) }
}

function seededPart4Order(n, count = 8) {
  const preset = { 14: [5, 0, 6, 2, 7, 1, 3, 4], 30: [6, 1, 5, 3, 0, 7, 4, 2], 51: [7, 2, 0, 6, 4, 1, 5, 3] }[n]
  if (preset) return preset
  const seedText = `catalog-reading-pet-b1-test${n}-part-4`
  const hash = [...seedText].reduce((value, char) => ((value * 31) + char.charCodeAt(0)) >>> 0, 2166136261)
  const valid = order => {
    const correct = order.slice(0, 5).map((displayIndex, gap) => displayIndex === gap)
    const positions = order.map((originalIndex, displayIndex) => ({ originalIndex, displayIndex })).filter(x => x.originalIndex < 5).map(x => x.displayIndex)
    const unused = order.filter(originalIndex => originalIndex >= 5)
    return new Set(order).size === count && unused.length === 3 && positions.some(x => x >= 5) && positions.some(x => x < 5) && !positions.every((x, i) => i === 0 || x > positions[i - 1]) && !correct.every(Boolean) && !positions.every((x, i) => i === 0 || x === positions[i - 1] + 1)
  }
  for (let attempt = 0; attempt < 256; attempt++) {
    let state = (hash + attempt * 0x9e3779b9) >>> 0
    const order = Array.from({ length: count }, (_, i) => i)
    for (let i = count - 1; i > 0; i--) {
      state = (state * 1664525 + 1013904223) >>> 0
      const j = state % (i + 1)
      ;[order[i], order[j]] = [order[j], order[i]]
    }
    if (valid(order)) return order
  }
  throw new Error(`Unable to create valid deterministic Part 4 permutation for Test ${n}`)
}

function buildPart4(n, topic) {
  const sample = QUALITY_PART346[n].part4
  const layoutText = {
    14: [
      'For years, the corner shop beside the bus stop stood empty. People in the area had grown used to walking past its dusty windows. (16) ..... One spring, residents began discussing whether the room could serve a useful purpose.',
      'A shared workshop seemed unusual, but it could help people repair objects instead of throwing them away. The owner agreed to lend the room for three months, provided visitors kept it clean. (17) ..... The residents then wrote a simple timetable.',
      'The owner asked visitors to keep the room clean because the building was old. (18) ..... This allowed them to work safely while they decided which activities beginners could try first.',
      'During the first Saturday, neighbours brought lamps, bicycles and small pieces of furniture. Most of the equipment arrived from people’s homes. (19) ..... Visitors could therefore see which tools were available without asking each time.',
      'After several sessions, the organisers reviewed their notes and invited more residents to join. The workshop had started with very little money. (20) ..... It became a regular meeting place because people understood how to take part.'
    ],
    30: [
      'Our coding club planned to build a quiz for the school website. The students had prepared questions and expected the first version to work quickly. (16) ..... They were pleased with the design, but the result did not match every answer.',
      'The quiz gave the same feedback each time, even when pupils chose different answers. The students examined the instructions rather than deleting the program. (17) ..... They could now identify the line that controlled the result.',
      'At first, the students assumed the task would take only one afternoon. (18) ..... The tutor then asked the club to test one change at a time and record what happened. This made their investigation more careful and less confusing.',
      'After moving the line, the students tested the quiz with younger pupils. The program worked, but the pupils asked about two questions they did not understand. (19) ..... The club rewrote those questions before showing the quiz again.',
      'The revised quiz was clearer, although the students still wanted to improve its feedback. They kept the failed version as evidence of their process. (20) ..... The mistake had taught them how to solve a practical problem.'
    ],
    51: [
      'Maya wanted to travel across the island without producing much rubbish. She had checked the route but decided to carry only what she really needed. (16) ..... A bottle, cloth bag and small food container were enough for the first part of the journey.',
      'At the first station, a café filled Maya’s bottle without charging her. Later, she bought fruit from a market rather than a wrapped snack. (17) ..... The shopkeeper then explained where visitors could refill water nearby.',
      'At another stop, Maya found a second refill point and avoided buying a disposable drink. (18) ..... The friendly service made the next part of her journey easier, because she no longer worried about running out of water.',
      'The shopkeeper explained that visitors rarely asked about local refill points. (19) ..... Maya listened to the advice and changed her route slightly, choosing a quieter road to the island centre.',
      'By the end of the trip, Maya had spent less money and carried almost no waste home. (20) ..... She decided that future trips should leave room for useful local suggestions.'
    ]
  }[n]
  const layoutExtensions = {
    14: ['The change gave neighbours a reason to discuss the building again.', 'They wanted the first trial to be practical rather than expensive.', 'Everyone agreed that safety mattered more than completing many repairs.', 'The arrangement also meant new volunteers could work independently.', 'The project was small, but it gave the street a useful shared space.'],
    30: ['This first attempt encouraged the club to look more closely at its method.', 'The written explanation helped the students compare their ideas.', 'They learned that patience was part of solving a technical problem.', 'The pupils also suggested examples that younger users would recognise.', 'The club planned another test after collecting the new comments.'],
    51: ['This choice made the beginning of the trip simple and easy to manage.', 'She preferred small practical decisions to carrying unnecessary supplies.', 'Maya also noticed that local advice could save time and money.', 'The conversation gave her confidence to explore beyond the main route.', 'The unexpected delay became one of the most useful parts of the trip.']
  }[n]
  const layoutClosers = {
    14: ['The empty windows no longer made the street feel forgotten.', 'The timetable left room for people with different working hours.', 'The careful check reassured visitors who had never used tools before.', 'A labelled shelf made the shared equipment easier to return.', 'The organisers hoped the owner would continue lending the room.'],
    30: ['The club wanted the final quiz to be useful, not merely impressive.', 'That evidence was more helpful than another quick guess.', 'Their notes made the next lesson easier to organise.', 'Clear wording mattered as much as correct code for younger pupils.', 'They would review the results before adding another feature.'],
    51: ['She felt ready to continue without buying another packaged drink.', 'The small bag was easier to carry than the supplies she had considered.', 'The refill point also showed why local knowledge was valuable.', 'Maya thanked him before following the quieter road.', 'She would remember the route when planning another low-waste journey.']
  }[n]
  const expandedLayout = layoutText.map((text, index) => `${text} ${layoutExtensions[index]} ${layoutClosers[index]}`)
  const order = seededPart4Order(n)
  const semanticCorrectIndices = {
    14: sample.answers.map(answer => answer.charCodeAt(0) - 65),
    30: sample.answers.map(answer => answer.charCodeAt(0) - 65),
    51: [0, 3, 1, 6, 4],
  }[n]
  const semanticOptions = sample.options.map((text, index) => ({
    key: `test${n}-part4-option-${index}`,
    text,
    correctForGap: semanticCorrectIndices.indexOf(index) >= 0 ? 16 + semanticCorrectIndices.indexOf(index) : null,
  }))
  const shuffledOptions = order.map(index => semanticOptions[index])
  const labels = letters.slice(0, 8)
  const answerLabels = Array.from({ length: 5 }, (_, gapIndex) => labels[shuffledOptions.findIndex(option => option.correctForGap === 16 + gapIndex)].toLowerCase())
  const extra = { 14: ' The first session began with a discussion about what the neighbourhood needed. Several people wanted to repair small furniture, while others suggested bicycles and lamps. The volunteers agreed to start with objects that could be handled safely on a shared table. They labelled shelves so that visitors could find screwdrivers and replacement parts without asking each time. A notice near the door explained that every item had to leave with its owner, even if the repair was unfinished. This rule prevented the room becoming a storage space and encouraged visitors to return with better information. After three Saturdays, the group reviewed its notes and changed the timetable. The workshop remained modest, but it was now easier for people to understand how to join. The organisers also invited a local electrician to demonstrate safe checks, which gave nervous visitors confidence without turning the workshop into a professional service.', 30: ' The students had imagined that a correct answer would appear as soon as they read the code. In practice, they had to compare the instructions with what the program actually did. The tutor asked them to test a single change, record the result and then restore the earlier version if necessary. This method made the room quieter because fewer people were guessing at the same time. It also revealed that a question could be unclear even when the program worked correctly. The pupils rewrote those questions before showing the quiz to younger users. Their final product was not perfect, but the testing process gave them a repeatable way to improve it. They kept the original failed version as evidence of what they had learned, rather than pretending that the mistake had never happened.', 51: ' Maya had planned each journey carefully, yet the most useful discoveries came from small delays. At one station she watched passengers refill bottles near the café, and at another she found a market selling fruit without unnecessary wrapping. The shopkeeper explained that visitors could use a public tap at the next stop. These details mattered because Maya had not packed enough food for an unexpected wait. She realised that travelling with less waste required preparation, but also attention to the habits of local people. By the time she reached the island centre, the journey felt calmer and cheaper than the route she had first imagined. She wrote the refill points in her notebook and decided to share them with other travellers, provided the information stayed accurate. The note was useful because it connected a small practical choice with the wider question of how visitors share limited resources.' }[n]
  const qs = Array.from({ length: 5 }, (_, i) => q(questionId(n, 4, i + 16), i + 16, 'gap-fill', `Gap ${i + 16}`, []))
  const tail = { 14: ' The team posted photographs of finished repairs, but always asked owners before sharing them. This small act of respect helped build trust between the volunteers and people bringing objects from home.', 30: ' The younger pupils were invited to describe what they noticed, rather than simply being told the answer. Their questions showed the club which instructions needed clearer examples for future users. The teacher saved the revised instructions with the project files so later classes could start from a clearer example.', 51: ' The traveller kept the receipt and thanked the shopkeeper, because responsible choices work best when visitors recognise the people who make them possible. That conversation became part of the memory of the journey.' }[n]
  return { id: partId(n, 4), partNumber: 4, rangeLabel: range(16, 20), passageTitle: `Part 4 – ${sample.title}`, passage: [...expandedLayout.map(text => ({ text })), ...shuffledOptions.map((x, i) => ({ label: labels[i], text: x.text, key: x.key, correctForGap: x.correctForGap }))], questionGroups: [{ id: `${partId(n, 4)}-g0`, range: range(16, 20), instruction: 'Choose the sentence which fits each gap.', type: 'matching-features', features: shuffledOptions.map((x, i) => ({ id: labels[i].toLowerCase(), name: x.text, key: x.key, correctForGap: x.correctForGap })), questions: qs }], _answers: qs.map((x, i) => [x.id, { answer: answerLabels[i], explanation: `Sentence ${answerLabels[i].toUpperCase()} fits the reference and sequence.` }]) }
}

function buildPart5(n, topic) {
  const sample = QUALITY_PART346[n].part5
  const extra = { 14: ' The coordinator also checks the visitor book after each session and records suggestions for the following month. This record helps the team decide which tasks should be offered next and welcomes suggestions from regular visitors.', 30: ' The learners keep their notes beside the devices so that another pair can follow the same test without guessing. The written trail makes the next investigation faster and prevents a successful test being mistaken for a general rule, while each result is recorded in a shared log.', 51: ' We now choose local services more often, because their advice makes a journey both lighter and more interesting. The choice also supports small businesses that understand the route and helped us understand the area better in many practical ways today.' }[n]
  const specs = {
    14: [['careful planning', ['careful', 'carefully', 'care', 'caring'], 'a'], ['kept a record', ['kept', 'made', 'did', 'gave'], 'a'], ['protect young plants', ['protect', 'protection', 'protective', 'protecting'], 'a'], ['shared vegetables', ['shared', 'sharing', 'share', 'shares'], 'a'], ['Saturday session', ['Saturday', 'Saturdays', 'saturday', 'weekend'], 'a'], ['take responsibility', ['take', 'make', 'do', 'give'], 'a']],
    30: [['received old tablets', ['received', 'accepted', 'collected', 'borrowed'], 'a'], ['easy reading exercise', ['easy', 'easily', 'ease', 'easier'], 'a'], ['failed after an update', ['failed', 'failing', 'failure', 'fails'], 'a'], ['one suggestion', ['one', 'once', 'only', 'once'], 'a'], ['free storage', ['free', 'freely', 'freedom', 'freeing'], 'a'], ['reliable explanation', ['reliable', 'reliably', 'reliance', 'rely'], 'a']],
    51: [['changed when a storm closed', ['changed', 'change', 'changing', 'changes'], 'a'], ['wait', ['wait', 'waiting', 'waited', 'waits'], 'a'], ['suggested a bus', ['suggested', 'suggestion', 'suggesting', 'suggests'], 'a'], ['prepare a display', ['prepare', 'preparing', 'preparation', 'prepares'], 'a'], ['quiet beach', ['quiet', 'quietly', 'quietness', 'quieten'], 'a'], ['local advice', ['local', 'locally', 'locality', 'locate'], 'a']],
  }[n]
  let passage = `${sample.text} ${extra}`
  for (const [i, [phrase]] of specs.entries()) passage = passage.replace(phrase, `(${i + 21}) .....`)
  const questions = specs.map(([phrase, labels, answer], i) => q(questionId(n, 5, i + 21), i + 21, 'multiple-choice', `Gap (${i + 21})`, labels.map((label, j) => option(String.fromCharCode(65 + j), label))))
  return { id: partId(n, 5), partNumber: 5, rangeLabel: range(21, 26), passageTitle: 'Part 5 – Multiple-choice cloze', passage: [{ text: passage }], questionGroups: [{ id: `${partId(n, 5)}-g0`, range: range(21, 26), instruction: 'For each question, choose the correct answer A, B, C or D.', type: 'multiple-choice', questions }], _answers: questions.map((x, i) => [x.id, { answer: specs[i][2], explanation: `The answer completes gap ${i + 21} naturally.` }]) }
}

function buildPart6(n, topic) {
  const sample = QUALITY_PART346[n].part6
  const extra = { 14: ' The coordinator updates the notice whenever a tool changes location, and members check the list before they leave. This routine helps visitors work independently while keeping the shared room ready for the next group. It also means that a missing screwdriver is reported before it becomes a larger problem. The list is checked weekly.', 30: ' At the end of the lesson, the tutor asked each learner to describe one limitation of the method. This final step made the class less likely to treat a single successful repair as a universal answer. The notes were stored with the equipment for later classes. They could then be consulted by a new group.', 51: ' We kept the tickets and route notes, but the most useful record was a list of refill points. On our next visit, we will use it before buying anything in disposable packaging. Writing the information down made the environmental choice easier to repeat. It also gave us a practical way to compare responsible choices on future journeys.' }[n]
  const qs = sample.answers.map((_, i) => q(questionId(n, 6, i + 27), i + 27, 'gap-fill', `Gap ${i + 27}`, []))
  const tail = { 14: ' The notice is updated whenever the group changes its routine.', 30: ' This makes the method easier for another class to understand.', 51: ' The notes will guide our choices when we travel again.' }[n]
  return { id: partId(n, 6), partNumber: 6, rangeLabel: range(27, 32), passageTitle: 'Part 6 – Open cloze', passage: [{ text: `${sample.text} ${extra} ${tail}` }], questionGroups: [{ id: `${partId(n, 6)}-g0`, range: range(27, 32), instruction: 'Write one word for each gap.', type: 'gap-fill', questions: qs }], _answers: qs.map((x, i) => [x.id, { answer: sample.answers[i], explanation: `Grammar target: ${sample.targets[i]}.` }]) }
}

function makeExam(n) {
  if (BLUEPRINTS[n]) {
    const bp = BLUEPRINTS[n]
    return bp.part1.cards ? compileExam(bp) : compileExamSimple(bp)
  }
  const topic = QUALITY_SAMPLES[n]?.topic ?? topics[(n - FROM) % topics.length]
  const parts = [part1(n, topic), part2(n, topic), buildPart3(n, topic), buildPart4(n, topic), buildPart5(n, topic), buildPart6(n, topic)]
  const answers = Object.fromEntries(parts.flatMap(p => p._answers))
  for (const part of parts) delete part._answers
  return { body: { id: `catalog-reading-pet-b1-test${n}`, title: `PET B1 Reading – Test ${n}`, durationMinutes: 45, bandHint: 'B1 Preliminary Reading – 6 parts', examTrack: 'cambridge', cambridgeLevel: 'b1', catalogCanonical: true, parts }, answers: { examId: `catalog-reading-pet-b1-test${n}`, version: 1, mode: 'answers-vault', answers } }
}

function validate(exam) {
  const all = exam.body.parts.flatMap(p => p.questionGroups.flatMap(g => g.questions))
  if (exam.body.parts.length !== 6 || all.length !== 32 || Object.keys(exam.answers.answers).length !== 32) throw new Error(`${exam.body.id}: wrong counts`)
  if (new Set(all.map(x => x.id)).size !== 32 || all.some((x, i) => x.number !== i + 1)) throw new Error(`${exam.body.id}: IDs or numbering invalid`)
  for (const p of exam.body.parts) if (p.partNumber !== 1 && p.partNumber !== 2 && !p.passage.some(x => x.text?.trim())) throw new Error(`${p.id}: empty passage`)
}

async function main() {
  const args = process.argv.slice(2)
  const auditOnly = args.includes('--audit') || args.includes('--validate-only')
  const testArg = args.find(x => x.startsWith('--test='))
  const from = testArg ? Number(testArg.split('=')[1]) : Number(args.find(x => x.startsWith('--from='))?.split('=')[1] ?? FROM)
  const to = testArg ? from : Number(args.find(x => x.startsWith('--to='))?.split('=')[1] ?? TO)
  const generated = []
  for (let n = from; n <= to; n++) { if (n < FROM || n > TO) throw new Error(`PET B1 generator only accepts ${FROM}-${TO}`); const exam = makeExam(n); validate(exam); generated.push(exam) }
  if (auditOnly) { console.log(JSON.stringify({ from, to, tests: generated.length, parts: generated.length * 6, questions: generated.length * 32, answers: generated.length * 32 }, null, 2)); return }
  await fs.mkdir(DATA, { recursive: true }); await fs.mkdir(PUBLIC, { recursive: true })
  for (const exam of generated) {
    const slug = `pet-b1-test${exam.body.id.match(/test(\d+)$/)[1]}`
    const runtimePath = path.join(PUBLIC, `${exam.body.id}.json`)
    try {
      const previous = JSON.parse(await fs.readFile(runtimePath, 'utf8'))
      const previousOptions = new Map((previous.parts?.[1]?.passage ?? []).map(block => [block.imageSlotId, block]))
      for (const block of exam.body.parts[1].passage) {
        const old = previousOptions.get(block.imageSlotId)
        if (old) for (const key of ['assetId', 'alt', 'imageKey', 'imageUrl']) if (old[key] !== undefined) block[key] = old[key]
      }
    } catch {}
    await fs.writeFile(path.join(DATA, `reading-${slug}.json`), `${JSON.stringify(exam.body, null, 2)}\n`)
    await fs.writeFile(runtimePath, `${JSON.stringify(exam.body, null, 2)}\n`)
    await fs.writeFile(path.join(PUBLIC, `${exam.body.id}.answers.json`), `${JSON.stringify(exam.answers)}\n`)
  }
  const existing = JSON.parse(await fs.readFile(META, 'utf8'))
  const additions = generated.map(({ body }) => ({ id: body.id, title: body.title, durationMinutes: body.durationMinutes, bandHint: body.bandHint, examTrack: body.examTrack, cambridgeLevel: body.cambridgeLevel, bodyPath: `catalog/exams/reading/${body.id}.json`, answersPath: `catalog/exams/reading/${body.id}.answers.json`, questionCount: 32, parts: body.parts.map(p => ({ id: p.id, partNumber: p.partNumber, rangeLabel: p.rangeLabel })) }))
  const generatedRange = /^catalog-reading-pet-b1-test(?:1[4-9]|[2-4]\d|5[01])$/
  const additionIds = new Set(additions.map(item => item.id))
  const kept = existing.filter(item => !generatedRange.test(item.id) || !additionIds.has(item.id))
  await fs.writeFile(META, `${JSON.stringify([...kept, ...additions].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true })), null, 2)}\n`)
  const manifest = JSON.parse(await fs.readFile(MANIFEST, 'utf8'))
  const manifestAdditions = additions.map(x => ({ id: x.id, slug: x.id.replace('catalog-reading-', ''), title: x.title }))
  const manifestIds = new Set(manifestAdditions.map(item => item.id))
  manifest.reading = [...(manifest.reading ?? []).filter(item => !generatedRange.test(item.id) || !manifestIds.has(item.id)), ...manifestAdditions].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
  await fs.writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`Generated PET B1 Reading Tests ${from}-${to}: ${generated.length} tests, ${generated.length * 6} parts, ${generated.length * 32} questions.`)
}
main().catch(error => { console.error(error.stack || error); process.exitCode = 1 })
