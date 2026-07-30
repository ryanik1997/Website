/**
 * PET B1 Reading Test 18 — Batch 1 Blueprint
 * Topic: work experience and career skills
 */
export default {
  testNumber: 18,
  golden: false,
  topic: ['offices', 'new employees', 'training days', 'career planning'],

  metadata: {
    title: 'PET B1 Reading Test 18',
    difficulty: 'B1',
    themes: {
      part1: 'work experience and career skills',
      part2: 'work experience and career skills',
      part3: 'a first day at a new job',
      part4: 'preparing for a job interview',
      part5: 'a work experience placement',
      part6: 'a career advice workshop',
    },
  },

  part1: {
    cards: [
      {
        key: 'p1-card-1',
        template: 'workplace-memo',
        title: 'Workplace memo',
        text: 'All staff must complete the new safety training module by Friday. The module takes about forty minutes and can be done on any office computer. Print your certificate afterwards and leave it in your team leader\u2019s tray. Late completion will be noted in your annual review.',
        question: {
          stem: 'What must staff do after finishing the module?',
          options: [
            { key: 'a1', text: 'Email the certificate to HR.' },
            { key: 'a2', text: 'Print it and leave it with their team leader.' },
            { key: 'a3', text: 'Attend a follow-up meeting.' },
            { key: 'a4', text: 'Complete a second module.' },
          ],
          correctOptionKey: 'a2',
        },
      },
      {
        key: 'p1-card-2',
        template: 'service-confirmation',
        title: 'Interview confirmation',
        text: 'Your interview for the junior designer role is confirmed for Tuesday 14 June at 10 a.m. Please bring two copies of your portfolio and a form of ID. The interview lasts approximately forty-five minutes. Parking is available in the rear car park; enter from Mill Lane.',
        question: {
          stem: 'What should the candidate bring?',
          options: [
            { key: 'b1', text: 'A laptop with design software.' },
            { key: 'b2', text: 'Two portfolio copies and ID.' },
            { key: 'b3', text: 'A parking permit.' },
            { key: 'b4', text: 'References from previous employers.' },
          ],
          correctOptionKey: 'b2',
        },
      },
      {
        key: 'p1-card-3',
        template: 'notice',
        title: 'Training notice',
        text: 'The induction session for new starters has moved from Room 4 to the ground-floor conference room. The date and time are unchanged. Please arrive five minutes early to collect your building pass from reception. The pass must be visible at all times during your first week.',
        question: {
          stem: 'What has changed?',
          options: [
            { key: 'c1', text: 'The date of the induction.' },
            { key: 'c2', text: 'The room where induction is held.' },
            { key: 'c3', text: 'The requirement to bring ID.' },
            { key: 'c4', text: 'The length of the first week.' },
          ],
          correctOptionKey: 'c2',
        },
      },
      {
        key: 'p1-card-4',
        template: 'timetable-change',
        title: 'Timetable change',
        text: 'The weekly team meeting will now take place on Mondays at 9.30 instead of Fridays at 4 p.m. This change allows us to plan the week ahead rather than review it afterwards. The meeting room is the same. Please update your calendars and set a reminder.',
        question: {
          stem: 'Why was the meeting moved?',
          options: [
            { key: 'd1', text: 'The Friday room was too small.' },
            { key: 'd2', text: 'To help the team plan the week ahead.' },
            { key: 'd3', text: 'Staff complained about Friday meetings.' },
            { key: 'd4', text: 'The manager is unavailable on Fridays.' },
          ],
          correctOptionKey: 'd2',
        },
      },
      {
        key: 'p1-card-5',
        template: 'email',
        title: 'Email',
        text: 'Hi team, a reminder that expense claims for March must be submitted by the 10th. Claims received after this date will be processed in the following month\u2019s payroll. Attach scanned receipts to the online form; paper copies are no longer accepted.',
        question: {
          stem: 'What is the deadline rule?',
          options: [
            { key: 'e1', text: 'Paper receipts must be posted by the 10th.' },
            { key: 'e2', text: 'Late claims are rejected completely.' },
            { key: 'e3', text: 'Claims after the 10th are paid next month.' },
            { key: 'e4', text: 'The form must be printed and signed.' },
          ],
          correctOptionKey: 'e3',
        },
      },
    ],
  },

  part2: {
    domain: 'work experience and career skills',
    options: [
      {
        key: 'option-a',
        title: 'Evening CV workshop with adviser feedback',
        openingStyle: 'schedule-led',
        description: 'Every Tuesday evening, a careers adviser at the job centre reviews each participant’s CV draft and suggests targeted improvements. The two-hour session includes a printed guide with formatting tips and action verbs. The group is small enough for one-to-one attention. The moderate fee covers both the workshop and the take-home materials.',
        constraints: ['weekday evening', 'one-to-one feedback', 'printed guide', 'moderate fee', 'small group'],
        imageSlotKey: 'option-a',
      },
      {
        key: 'option-b',
        title: 'Mock interviews for young job seekers',
        openingStyle: 'audience-led',
        description: 'Young people preparing for their first job interviews can practise with volunteers from local businesses every Saturday morning. The interviewers ask realistic questions and give immediate spoken feedback on body language and answers. Sessions are free, but places must be booked two weeks ahead because demand is high.',
        constraints: ['saturday morning', 'young people', 'free', 'advance booking', 'realistic practice'],
        imageSlotKey: 'option-b',
      },
      {
        key: 'option-c',
        title: 'Self-paced online networking course',
        openingStyle: 'condition-led',
        description: 'No live tutor, no fixed schedule and no travel are required for this free online networking skills course. Learners watch short video lessons and complete practical tasks at their own pace. A digital badge is awarded on completion. A peer forum allows questions, though responses may take a day or two.',
        constraints: ['online', 'free', 'self-paced', 'digital badge', 'no live tutor'],
        imageSlotKey: 'option-c',
      },
      {
        key: 'option-d',
        title: 'Presentation skills with filmed feedback',
        openingStyle: 'outcome-led',
        description: 'Walk away with a certificate recognised by several regional employers after completing this advanced presentation-skills masterclass. Participants deliver a talk to the group and receive filmed playback with detailed commentary. The weekday schedule suits working professionals. The cost is high, reflecting the specialist coaching and video equipment.',
        constraints: ['weekday', 'advanced', 'filmed feedback', 'recognised certificate', 'high cost'],
        imageSlotKey: 'option-d',
      },
      {
        key: 'option-e',
        title: 'Workplace communication for returners',
        openingStyle: 'need-led',
        description: 'People returning to work after a long break often feel rusty about emails and phone calls. This short accessible course rebuilds confidence in a ground-floor room with adapted seating. The tutor demonstrates practical communication skills, and each participant receives a printed checklist. The pace is gentle and non-judgemental.',
        constraints: ['accessible', 'ground-floor', 'printed checklist', 'gentle pace', 'short course'],
        imageSlotKey: 'option-e',
      },
      {
        key: 'option-f',
        title: 'Two-day engineering work placement',
        openingStyle: 'activity-led',
        description: 'Shadowing employees on real projects gives students a genuine taste of engineering work over this weekend placement. Participants complete a short practical task and observe daily routines at a local firm. Lunch is provided, and a reference letter is offered on request. Travel to the site is self-arranged.',
        constraints: ['weekend', 'work experience', 'reference letter', 'lunch provided', 'own transport'],
        imageSlotKey: 'option-f',
      },
      {
        key: 'option-g',
        title: 'Monthly careers café, drop in anytime',
        openingStyle: 'invitation-led',
        description: 'Drop in for an informal chat with professionals from various industries at this free monthly careers café. No preparation, CV or booking is needed; just arrive and start a conversation. The venue is relaxed, with coffee and pastries provided. It is slightly outside the town centre, so transport options are limited.',
        constraints: ['monthly', 'free', 'no booking', 'informal', 'limited transport'],
        imageSlotKey: 'option-g',
      },
      {
        key: 'option-h',
        title: 'Weekend business challenge for managers',
        openingStyle: 'problem-solution-led',
        description: 'Wondering whether you have what it takes to lead a team? This competitive weekend business challenge puts that question to the test. Teams solve a real company problem under time pressure and present their solution to a panel of judges. Finishers receive a certificate. The fee is higher than casual clubs.',
        constraints: ['weekend', 'competitive', 'certificate', 'team-based', 'higher cost'],
        imageSlotKey: 'option-h',
      },
    ],
    profiles: [
      { key: 'profile-1', text: 'Ravi wants evening help with his CV, prefers a printed guide and values one-to-one feedback from a careers adviser.', correctOptionKey: 'option-a' },
      { key: 'profile-2', text: 'Sofia is a student who wants free interview practice with realistic questions and can book two weeks in advance.', correctOptionKey: 'option-b' },
      { key: 'profile-3', text: 'Wei is returning to work after five years at home, wants a ground-floor accessible class with a checklist and prefers a short gentle course.', correctOptionKey: 'option-e' },
      { key: 'profile-4', text: 'Amara is an experienced professional who wants filmed feedback on presentations and values a certificate recognised by employers.', correctOptionKey: 'option-d' },
      { key: 'profile-5', text: 'Jon wants to test his management potential, enjoys pressure and would like a certificate to strengthen future applications.', correctOptionKey: 'option-h' },
    ],
  },

  part3: {
    title: 'A first day at a new job',
    paragraphs: [
      'My first day at the marketing office began with a mistake: I arrived at the wrong entrance and stood outside a locked door for ten minutes before a security guard directed me to reception. By the time I collected my pass, the induction had already started. I slipped into the back of the room, aware that several people glanced at me. The HR manager smiled and handed me a folder without pausing her presentation.',
      'The induction covered practical details such as fire exits, lunch arrangements and the computer system. Most of it was straightforward, but the software login took three attempts because I kept typing my old employee number. The person beside me, a woman called Janet, whispered the correct format and later showed me where the kitchen was. Small kindnesses like that made the morning feel less overwhelming.',
      'After lunch, I met my team leader, who gave me a desk near the window and a list of tasks for the first week. The list looked long, but he explained that nobody expected me to finish everything immediately. He introduced me to four colleagues, and I immediately forgot two of their names. This embarrassed me, but Janet later admitted she had done the same thing on her first day.',
      'By five o\u2019clock, I had sent two emails, attended one meeting and eaten a biscuit I did not remember taking. The day had been tiring in a way that physical work is not, because everything required concentration and politeness simultaneously. Walking to the bus stop, I felt cautiously optimistic. The job was not yet familiar, but the people seemed willing to help, and that mattered more than knowing where everything was.',
    ],
    buildExtension: ' During the following week, I made a habit of writing down names and procedures in a small notebook. This simple act reduced my anxiety considerably, because I no longer feared asking the same question twice. Janet became an unofficial mentor, answering my emails within minutes and flagging which requests were urgent. By Friday, I had learned the printer code, the coffee machine routine and the unspoken rule that the team left promptly at half past five. None of this appeared in the induction folder, yet it was the knowledge that made the office feel like a place I could belong.',
    questions: [
      { number: 11, stem: 'What happened when the writer first arrived?', options: ['They were late for a meeting.', 'They went to the wrong entrance.', 'They forgot their ID.', 'The induction had been cancelled.'], correctIndex: 1 },
      { number: 12, stem: 'How did Janet help during the induction?', options: ['She introduced the writer to the manager.', 'She explained the login format quietly.', 'She gave the writer a spare folder.', 'She saved a seat at the front.'], correctIndex: 1 },
      { number: 13, stem: 'Why does the writer mention forgetting names?', options: ['To criticise the team leader\u2019s introduction.', 'To show that the experience felt normal and human.', 'To explain why the writer left early.', 'To suggest the colleagues were unfriendly.'], correctIndex: 1 },
      { number: 14, stem: 'What does the writer suggest about the first day\u2019s tiredness?', options: ['It was caused by physical labour.', 'It came from constant mental effort.', 'It was worse than expected.', 'It made the writer want to quit.'], correctIndex: 1 },
      { number: 15, stem: 'What made the writer feel optimistic?', options: ['The salary was higher than expected.', 'The people seemed willing to help.', 'The tasks were easier than feared.', 'The office was close to home.'], correctIndex: 1 },
    ],
  },

  part4: {
    title: 'Preparing for a job interview',
    layoutParagraphs: [
      'When Leila received an invitation to interview for a trainee accountant role, she felt excited and nervous in equal measure. She had applied for several positions without success, so this opportunity felt important. (16) ..... She decided to prepare thoroughly rather than rely on improvisation.',
      'First, Leila researched the company online and read recent news articles about its expansion. She noted three facts she could mention naturally during conversation. (17) ..... This preparation gave her confidence that she would not fall silent when asked what she knew about the firm.',
      'The night before, Leila chose her outfit and packed a folder with spare copies of her CV. She also planned her journey and checked the bus times in case of delays. (18) ..... She set two alarms and went to bed early, knowing that punctuality would create a good first impression.',
      'During the interview, one question caught her off guard: she was asked to describe a failure. Leila paused, then explained a group project at college where poor planning had caused a missed deadline. (19) ..... The interviewers nodded and moved on, and Leila felt she had answered honestly without making excuses.',
      'Two days later, Leila received an email offering her the position. She accepted immediately and called her mother, who had encouraged her throughout the process. (20) ..... The preparation had not removed every uncertainty, but it had given her a framework to follow when nerves threatened to take over.',
    ],
    layoutExtensions: [
      'Rather than panicking, she chose to treat the interview as a learning experience.',
      'She practised saying the facts aloud so they would sound natural rather than rehearsed.',
      'These practical steps reduced the number of things that could go wrong on the morning.',
      'She focused on what she had learned from the experience rather than blaming others.',
      'The offer confirmed that careful preparation had made a visible difference.',
    ],
    layoutClosers: [
      'This mindset shift took the pressure off perfection and let her focus on communication.',
      'Her friend said the facts sounded impressive without being showy.',
      'The bus arrived on time, and she reached the building with ten minutes to spare.',
      'The honesty seemed to matter more than giving a polished answer.',
      'She planned to use the same approach for any future interviews.',
    ],
    options: [
      { key: 'opt-0', text: 'She therefore decided to treat the interview as a chance to learn.', correctForGap: 16 },
      { key: 'opt-1', text: 'She rehearsed these points until they felt natural.', correctForGap: 17 },
      { key: 'opt-2', text: 'These practical steps reduced the risk of a stressful morning.', correctForGap: 18 },
      { key: 'opt-3', text: 'She explained what the failure had taught her about planning.', correctForGap: 19 },
      { key: 'opt-4', text: 'The preparation had clearly made a positive impression.', correctForGap: 20 },
      { key: 'opt-5', text: 'She decided to withdraw her application immediately.', correctForGap: null },
      { key: 'opt-6', text: 'The company had already offered the role to another candidate.', correctForGap: null },
      { key: 'opt-7', text: 'Her mother advised her to refuse the interview.', correctForGap: null },
    ],
    displayOrder: [7, 4, 6, 1, 5, 2, 0, 3],
    extra: ' Leila later shared her preparation method with two friends who had interviews the following month. She recommended writing down three company facts, planning the journey the night before and practising one difficult answer aloud. Both friends said the structure reduced their anxiety, even though their interviews were in different industries.',
    tail: ' Leila starts work next Monday. She has already researched her new team on the company website and bookmarked the bus timetable for the first week.',
  },

  part5: {
    text: 'During my work experience placement at a local shop, I learned that customer service depends (21) ..... patience more than product knowledge. On the first morning, the manager asked me to (22) ..... up a display of new arrivals near the entrance. I arranged the items carefully, but a colleague pointed out that customers respond better to colour than to size. This feedback helped me (23) ..... out a better system by the afternoon. By the second day, I could answer most questions (24) ..... hesitation, although some requests still caught me off guard. The manager said I had settled (25) ..... well for someone with no retail experience. On the final day, I thanked the team, and they told me I could (26) ..... back any time I needed a reference.',
    extra: ' The placement confirmed that I enjoy working with people, even when the tasks are repetitive. I have since applied for a weekend position at the same shop.',
    specs: [
      { phrase: 'depends (21) ..... patience', options: ['on', 'in', 'at', 'for'], correctIndex: 0 },
      { phrase: 'to (22) ..... up a display', options: ['set', 'put', 'take', 'give'], correctIndex: 0 },
      { phrase: 'helped me (23) ..... out', options: ['work', 'find', 'look', 'turn'], correctIndex: 0 },
      { phrase: 'questions (24) ..... hesitation', options: ['without', 'within', 'beside', 'against'], correctIndex: 0 },
      { phrase: 'had settled (25) ..... well', options: ['in', 'on', 'at', 'up'], correctIndex: 0 },
      { phrase: 'could (26) ..... back', options: ['come', 'go', 'turn', 'fall'], correctIndex: 0 },
    ],
  },

  part6: {
    text: 'The career workshop was useful, (27) ........ I had expected it to be boring. A speaker (28) ........ worked in human resources explained what employers look for in (29) ........ application form. She said that candidates should arrive (30) ........ least ten minutes early for interviews. I (31) ........ not have attended if my tutor had not recommended it. Afterwards, several students agreed that (32) ........ had all felt uncertain before the talk.',
    extra: ' The organiser sent a follow-up email with links to free CV templates and a list of local employers offering placements. Several students replied with questions, and the speaker answered each one personally.',
    tail: ' The next workshop is scheduled for November, and places can be reserved through the college reception.',
    answers: ['although', 'who', 'an', 'at', 'would', 'we'],
    targets: ['conjunction', 'relative-word', 'article', 'preposition', 'auxiliary', 'pronoun'],
  },
}
