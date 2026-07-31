/**
 * PET B1 Reading Test 30 — Golden Sample Blueprint
 * Topic: digital study rooms, adult learners, online lessons, screen-sharing
 */
export default {
  testNumber: 30,
  golden: true,
  topic: ['digital study rooms', 'adult learners', 'online lessons', 'screen-sharing'],

  metadata: {
    title: 'PET B1 Reading Test 30',
    difficulty: 'B1',
    themes: {
      part1: 'technology workshops, learning tools and repair services',
      part2: 'technology workshops, learning tools and repair services',
      part3: 'learning to fix a difficult device',
      part4: 'a useful mistake',
      part5: 'technology investigation',
      part6: 'digital problem-solving method',
    },
  },

  part1: {
    cards: [
      {
        key: 'p1-card-1',
        template: 'app-notification',
        title: 'App notification',
        text: 'Your language app added a listening review today. Download it before leaving because train Wi-Fi may fail. The vocabulary game can wait until tomorrow without losing progress.',
        question: {
          stem: 'What is advised?',
          options: [
            { key: 'a1', text: 'Download the listening review before travelling.' },
            { key: 'a2', text: 'Play the game on the train.' },
            { key: 'a3', text: 'Delete progress.' },
            { key: 'a4', text: 'Wait to open the app.' },
          ],
          correctOptionKey: 'a1',
        },
      },
      {
        key: 'p1-card-2',
        template: 'notice',
        title: 'School technology notice',
        text: 'The computer room is unavailable at Tuesday lunchtime while keyboards are installed. Students may use library computers, but must reserve a seat online first.',
        question: {
          stem: 'What must students do?',
          options: [
            { key: 'b1', text: 'Install a keyboard.' },
            { key: 'b2', text: 'Reserve a library seat.' },
            { key: 'b3', text: 'Bring a computer.' },
            { key: 'b4', text: 'Use it without booking.' },
          ],
          correctOptionKey: 'b2',
        },
      },
      {
        key: 'p1-card-3',
        template: 'service-message',
        title: 'Repair-service message',
        text: 'Your headphone cable can be replaced today, but the matching adapter is out of stock. We can return the headphones without it or keep them until Friday\u2019s delivery.',
        question: {
          stem: 'What choice is offered?',
          options: [
            { key: 'c1', text: 'Free replacement of both.' },
            { key: 'c2', text: 'An adapter today.' },
            { key: 'c3', text: 'Collection now or waiting until Friday.' },
            { key: 'c4', text: 'Repair only after buying headphones.' },
          ],
          correctOptionKey: 'c3',
        },
      },
      {
        key: 'p1-card-4',
        template: 'email',
        title: 'Online-course email',
        text: 'This week\u2019s coding lesson is available Wednesday rather than Tuesday. The quiz deadline is unchanged, and the tutor answers forum questions Thursday evening. Check the calendar.',
        question: {
          stem: 'What changed?',
          options: [
            { key: 'd1', text: 'The quiz deadline.' },
            { key: 'd2', text: 'The lesson release day.' },
            { key: 'd3', text: 'The forum closing.' },
            { key: 'd4', text: 'The calendar.' },
          ],
          correctOptionKey: 'd2',
        },
      },
      {
        key: 'p1-card-5',
        template: 'instructions',
        title: 'Equipment instructions',
        text: 'Before using the projector, connect power and select HDMI 2. After the lesson, do not unplug immediately: press blue standby and wait for the lamp to cool.',
        question: {
          stem: 'What should users do afterwards?',
          options: [
            { key: 'e1', text: 'Press standby and wait.' },
            { key: 'e2', text: 'Unplug while selecting HDMI 2.' },
            { key: 'e3', text: 'Remove the lamp.' },
            { key: 'e4', text: 'Leave it disconnected.' },
          ],
          correctOptionKey: 'e1',
        },
      },
    ],
  },

  part2: {
    domain: 'technology workshops, learning tools and repair services',
    options: [
      { key: 'option-a', title: 'Evening animation workshop, laptops supplied', openingStyle: 'schedule-led', text: 'An evening beginner animation workshop. Laptops are supplied, the tutor demonstrates each step and the group is small. It is at the college and needs no installation beforehand.' },
      { key: 'option-b', title: 'Saturday phone screen repair desk', openingStyle: 'condition-led', text: 'A Saturday repair desk for cracked phone screens. Customers get a fixed price first, but the phone stays two days and deleted photos cannot be recovered.' },
      { key: 'option-c', title: 'Free online study tool, self-paced', openingStyle: 'feature-led', text: 'A free online study tool for flexible phone practice. It saves progress and offers short quizzes, but has no live teacher.' },
      { key: 'option-d', title: 'Advanced spreadsheet workshop, bring project', openingStyle: 'need-led', text: 'A daytime workshop for experienced spreadsheet users. It covers formulas on centre desktops; bring a real project and work independently.' },
      { key: 'option-e', title: 'After-school coding club for teenagers', openingStyle: 'audience-led', text: 'A free after-school coding club for teenagers. Members bring laptops, build games in teams and receive university-volunteer help; places are booked.' },
      { key: 'option-f', title: 'Weekday home printer repair service', openingStyle: 'activity-led', text: 'A weekday-morning home printer repair service. A technician diagnoses faults first, but charges a call-out fee even if repair is impossible.' },
      { key: 'option-g', title: 'Cheap video course on computer care', openingStyle: 'outcome-led', text: 'A cheap video course on safe computer maintenance. It is flexible and includes checklists, but learners supply their own computer and parts.' },
      { key: 'option-h', title: 'Friday drop-in for older adults, tablets provided', openingStyle: 'invitation-led', text: 'A free Friday-morning drop-in for older adults practising email and video calls. Tablets and step-free access are provided; staff explain one task at a time.' },
    ],
    profiles: [
      { key: 'profile-1', text: 'Nadia is a complete beginner who wants evening animation lessons, has no laptop and prefers a small guided college group.', correctOptionKey: 'option-a' },
      { key: 'profile-2', text: 'Owen has a broken printer, cannot transport it, is free weekday mornings and accepts a diagnostic call-out charge.', correctOptionKey: 'option-f' },
      { key: 'profile-3', text: 'Pia wants free flexible vocabulary practice on her phone and is comfortable without a live teacher.', correctOptionKey: 'option-c' },
      { key: 'profile-4', text: 'Quinn is an experienced spreadsheet user who wants advanced formulas applied to a real project on a daytime desktop.', correctOptionKey: 'option-d' },
      { key: 'profile-5', text: 'Rosa is retired, needs a supplied tablet and step-free access for video-call practice; Friday morning suits her.', correctOptionKey: 'option-h' },
    ],
  },

  part3: {
    title: 'Learning to fix a difficult device',
    paragraphs: [
      'When our evening class received a box of old tablets, most learners expected to use them for simple reading practice. The tutor, Priya, had another idea. She asked the group to find out why several devices stopped working after an update. No one was required to repair a tablet alone. Instead, each pair recorded what they tried, so that the class could compare results rather than repeat the same mistake.',
      'The investigation took longer than the learners had hoped. One pair blamed the battery, while another thought the screens had been damaged. Priya did not immediately tell them which theory was correct. She showed them how to search the device settings and read a short repair guide. Gradually, the learners noticed that the problem appeared only on tablets with very little free storage. Deleting unused files solved some cases, but two devices still needed professional help.',
      'The class did not repair every tablet, yet Priya considered the project successful. Learners had practised checking evidence, explaining a process and changing their minds when new information appeared. They also created a clear guide for future students. The most useful result was therefore not a box of working devices. It was the confidence to approach an unfamiliar problem in small, sensible steps.',
    ],
    extension: ' The learners later presented their method to another class. They explained why a quick guess could mislead and showed how a checklist made testing clearer. Several students admitted that they had usually avoided technical problems, but careful investigation now felt possible.',
    buildExtension: ' The tutor was careful not to make the activity sound like a competition. When one pair found a possible cause, another pair checked the result using a different tablet. This sometimes slowed the lesson, but it prevented the class from treating one successful test as proof. Learners also had to explain why a solution might fail in another situation. That limitation mattered because the devices were old and their software was not identical. At the final meeting, the class compared its notes and agreed that a checklist could guide an investigation without replacing judgement. The students left with more patience and a clearer understanding of what practical digital confidence involves.',
    questions: [
      { number: 11, stem: 'What did Priya ask the learners to investigate?', options: ['Why some tablets stopped working after an update.', 'How to buy cheaper tablets for the evening class.', 'Which reading books were most popular with students.', 'Why the screens of all the tablets were damaged.'], correctIndex: 0 },
      { number: 12, stem: 'Why did each pair record what it tried?', options: ['So the learners could avoid repeating one another\u2019s work.', 'So Priya could mark every learner\u2019s handwriting.', 'So the class could decide which tablet to throw away.', 'So the tutor would not need to explain the settings.'], correctIndex: 0 },
      { number: 13, stem: 'What helped the learners identify the likely cause?', options: ['They compared the devices and checked their available storage.', 'They replaced every battery before testing the tablets.', 'They asked a professional to repair the first device.', 'They followed Priya\u2019s answer without examining the evidence.'], correctIndex: 0 },
      { number: 14, stem: 'Why did Priya regard the project as successful?', options: ['The learners developed a method for dealing with new problems.', 'Every tablet was repaired before the class ended.', 'The learners learned that repair guides are unnecessary.', 'The class found a way to avoid using digital devices.'], correctIndex: 0 },
      { number: 15, stem: 'What is the writer\u2019s main message?', options: ['Trying to understand a problem can be as valuable as solving it.', 'Technology lessons are useful only when equipment is new.', 'Teachers should give answers before learners begin practical work.', 'A repair project should be stopped as soon as one device fails.'], correctIndex: 0 },
    ],
  },

  part4: {
    title: 'A useful mistake',
    layoutParagraphs: [
      'Our coding club planned to build a quiz for the school website. The students had prepared questions and expected the first version to work quickly. (16) ..... They were pleased with the design, but the result did not match every answer.',
      'The quiz gave the same feedback each time, even when pupils chose different answers. The students examined the instructions rather than deleting the program. (17) ..... They could now identify the line that controlled the result.',
      'At first, the students assumed the task would take only one afternoon. (18) ..... The tutor then asked the club to test one change at a time and record what happened. This made their investigation more careful and less confusing.',
      'After moving the line, the students tested the quiz with younger pupils. The program worked, but the pupils asked about two questions they did not understand. (19) ..... The club rewrote those questions before showing the quiz again.',
      'The revised quiz was clearer, although the students still wanted to improve its feedback. They kept the failed version as evidence of their process. (20) ..... The mistake had taught them how to solve a practical problem.',
    ],
    layoutExtensions: [
      'This first attempt encouraged the club to look more closely at its method.',
      'The written explanation helped the students compare their ideas.',
      'They learned that patience was part of solving a technical problem.',
      'The pupils also suggested examples that younger users would recognise.',
      'The club planned another test after collecting the new comments.',
    ],
    layoutClosers: [
      'The club wanted the final quiz to be useful, not merely impressive.',
      'That evidence was more helpful than another quick guess.',
      'Their notes made the next lesson easier to organise.',
      'Clear wording mattered as much as correct code for younger pupils.',
      'They would review the results before adding another feature.',
    ],
    options: [
      { key: 'opt-0', text: 'Everyone assumed the task would take only one afternoon.', correctForGap: 18 },
      { key: 'opt-1', text: 'This showed that the problem was in the instructions, not the questions.', correctForGap: 17 },
      { key: 'opt-2', text: 'The club had never used a website before.', correctForGap: 20 },
      { key: 'opt-3', text: 'The pupils found a few unclear questions as well.', correctForGap: 19 },
      { key: 'opt-4', text: 'They wanted visitors to receive different feedback.', correctForGap: 16 },
      { key: 'opt-5', text: 'For this reason, the teacher cancelled the project.', correctForGap: null },
      { key: 'opt-6', text: 'The students decided not to test the program again.', correctForGap: null },
      { key: 'opt-7', text: 'A new computer room was opened nearby.', correctForGap: null },
    ],
    displayOrder: [6, 1, 5, 3, 0, 7, 4, 2],
    extra: ' The students had imagined that a correct answer would appear as soon as they read the code. In practice, they had to compare the instructions with what the program actually did. The tutor asked them to test a single change, record the result and then restore the earlier version if necessary. This method made the room quieter because fewer people were guessing at the same time. It also revealed that a question could be unclear even when the program worked correctly. The pupils rewrote those questions before showing the quiz to younger users. Their final product was not perfect, but the testing process gave them a repeatable way to improve it. They kept the original failed version as evidence of what they had learned, rather than pretending that the mistake had never happened.',
    tail: ' The younger pupils were invited to describe what they noticed, rather than simply being told the answer. Their questions showed the club which instructions needed clearer examples for future users. The teacher saved the revised instructions with the project files so later classes could start from a clearer example.',
  },

  part5: {
    title: "Why the Tablets Stopped Working",
    title: "Why the Tablets Stopped Working",
    text: 'When the evening class received old tablets, the learners expected an easy reading exercise. Instead, the tutor asked them to investigate why several devices failed after an update. Each pair wrote down one suggestion and tested it without changing several things at once. They discovered that the tablets with almost no free storage behaved differently. Deleting unused files solved some problems, but two devices still needed a technician. The class therefore learned an important lesson about evidence: a confident guess is not the same as a reliable explanation. The learners later made a checklist for future classes, including questions about power, storage and software versions. Their guide was short, but it gave beginners a sensible way to start when technology behaved unexpectedly.',
    extra: ' The learners keep their notes beside the devices so that another pair can follow the same test without guessing. The written trail makes the next investigation faster and prevents a successful test being mistaken for a general rule, while each result is recorded in a shared log.',
    specs: [
      { phrase: 'received old tablets', options: ['received', 'accepted', 'collected', 'borrowed'], correctIndex: 0 },
      { phrase: 'easy reading exercise', options: ['easy', 'easily', 'ease', 'easier'], correctIndex: 0 },
      { phrase: 'failed after an update', options: ['failed', 'failing', 'failure', 'fails'], correctIndex: 0 },
      { phrase: 'one suggestion', options: ['one', 'once', 'only', 'once'], correctIndex: 0 },
      { phrase: 'free storage', options: ['free', 'freely', 'freedom', 'freeing'], correctIndex: 0 },
      { phrase: 'reliable explanation', options: ['reliable', 'reliably', 'reliance', 'rely'], correctIndex: 0 },
    ],
  },

  part6: {
    title: "Testing Causes One at a Time",
    title: "Testing Causes One at a Time",
    text: 'The learners began (27) ........ a list of possible causes. They tested one idea (28) ........ a time, because changing several settings together would hide the evidence. When a tablet worked again, they wrote (29) ........ the result before trying another device. The tutor asked (30) ........ they could explain the change in simple language. Two tablets were too damaged (31) ........ repair in class, but the group still learned (32) ........ to investigate a technical problem.',
    extra: ' At the end of the lesson, the tutor asked each learner to describe one limitation of the method. This final step made the class less likely to treat a single successful repair as a universal answer. The notes were stored with the equipment for later classes. They could then be consulted by a new group.',
    tail: ' This makes the method easier for another class to understand.',
    answers: ['with', 'at', 'down', 'whether', 'for', 'how'],
    targets: ['preposition', 'fixed-phrase', 'phrasal-verb', 'conjunction', 'preposition', 'relative-word'],
  },
}
