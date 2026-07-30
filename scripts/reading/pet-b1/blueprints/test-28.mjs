// Test 28 — PET B1 Reading (art classes, craft workshops, creative hobbies)
export default {
  testNumber: 28,
  id: 'catalog-reading-pet-b1-test28',
  title: 'PET B1 Reading – Test 28',
  level: 'B1',
  examType: 'cambridge',
  timeLimitMinutes: 45,
  totalQuestions: 32,
  parts: [1, 2, 3, 4, 5, 6],

  part1: {
    items: [
      { title: 'Art class timetable change', text: 'Please note: from next week, the Wednesday watercolour class moves from Room 3 to the Garden Studio. The time stays the same, 6–8 p.m. Bring your own brushes; paper and paints are supplied. The Thursday oil painting class is unchanged. Contact the office if you cannot find the new room.', question: 'What has changed about the watercolour class?', options: ['Its room.', 'Its day.', 'Its time.'], answer: 'A' },
      { title: 'Gallery opening invitation', text: 'You are warmly invited to the opening of "Light and Shadow," an exhibition of local landscape photography by Anna Kowalski. The private view is Friday 7 p.m. at the Millside Gallery, with wine and canapés. The exhibition runs for three weeks. Entry is free on weekdays; weekends cost two pounds for adults.', question: 'What is free about the exhibition?', options: ['Weekday entry.', 'The private view wine.', 'Weekend parking.'], answer: 'A' },
      { title: 'Craft fair notice', text: 'The autumn craft fair takes place Saturday 10–4 in the village hall. Stall holders must arrive by eight to set up. Tables are provided; bring your own tablecloth and change for cash sales. A raffle raises money for the church roof. Visitors pay one pound entry; children under twelve are free.', question: 'What must stall holders bring?', options: ['A tablecloth and change.', 'Their own tables.', 'A raffle prize.'], answer: 'A' },
      { title: 'Photography club email', text: 'This month\'s theme is "reflections." Submit up to three photos by the 20th to the shared folder. Prints are not required — digital files only, minimum 2 MB. The winning image appears on the club\'s December card. Feedback session is the last Thursday at seven in the community room.', question: 'How should photos be submitted?', options: ['As digital files online.', 'As printed photographs.', 'By email attachment only.'], answer: 'A' },
      { title: 'Drama rehearsal text', text: 'Rehearsal tonight is CANCELLED because the hall is flooded. We will meet tomorrow instead, same time (7 p.m.), same place. Please learn lines 40–65 of Act 2 by then. If you borrowed a costume, keep it safe — the wardrobe team needs everything back by Friday. Questions? Call me. — Sarah', question: 'What must actors do before tomorrow?', options: ['Learn specific lines.', 'Return their costumes.', 'Bring a mop.'], answer: 'A' },
    ],
  },

  part2: {
    domain: 'art classes, craft workshops and creative hobby groups',
    options: [
      {
        key: 'option-a',
        title: 'Watercolour landscape painting for absolute beginners',
        openingStyle: 'feature-led',
        description: 'Relaxed, mess-friendly and completely judgement-free, this eight-week course assumes zero artistic experience. A professional illustrator teaches basic washes, colour mixing and simple composition using local scenery as inspiration. All materials are included in the sixty-pound fee. Classes run Tuesday evenings in a bright studio with easels provided. Students take home at least six finished paintings.',
        constraints: ['eight weeks', 'Tuesday evening', 'materials included', 'no experience', 'six paintings'],
        imageSlotKey: 'option-a',
      },
      {
        key: 'option-b',
        title: 'Weekend ceramics workshop in a working pottery',
        openingStyle: 'location-led',
        description: 'In a converted barn beside the River Wye, participants spend a full Saturday shaping clay on a potter\'s wheel. The morning covers throwing techniques; the afternoon is for decorating and glazing. Finished pieces are kiln-fired and posted to your home within three weeks. Aprons and tools are supplied. Maximum eight participants per session.',
        constraints: ['full Saturday', 'wheel-throwing', 'kiln-fired', 'posted home', 'max 8 people'],
        imageSlotKey: 'option-b',
      },
      {
        key: 'option-c',
        title: 'Retirees sketching group in the park',
        openingStyle: 'audience-led',
        description: 'Older adults who enjoy drawing outdoors gather every Monday and Thursday morning in Victoria Park, weather permitting. The group is informal: bring pencils, charcoal or pastels and draw whatever catches your eye. A retired art teacher circulates with gentle suggestions. No fees, no booking, no pressure. Fold-up chairs are welcome.',
        constraints: ['older adults', 'outdoor', 'informal', 'twice weekly', 'free'],
        imageSlotKey: 'option-c',
      },
      {
        key: 'option-d',
        title: 'Evening life drawing with a professional model',
        openingStyle: 'schedule-led',
        description: 'Every Wednesday from seven to nine, a life model poses for timed sessions ranging from two-minute gestures to twenty-minute studies. An experienced artist offers optional feedback but never dictates style. Participants bring their own materials; newsprint paper is available to buy for one pound per sheet. The studio is heated and well lit.',
        constraints: ['Wednesday evening', 'timed poses', 'own materials', 'optional feedback', 'heated studio'],
        imageSlotKey: 'option-d',
      },
      {
        key: 'option-e',
        title: 'Family printmaking afternoon at the museum',
        openingStyle: 'invitation-led',
        description: 'Come and make a mess together! This one-off Sunday afternoon introduces families to lino printing and stamp carving. Children aged six and above can participate alongside adults. A printmaker demonstrates each technique, then everyone creates a set of greeting cards to take home. All materials are provided. Tickets are eight pounds per family.',
        constraints: ['one-off', 'Sunday afternoon', 'family', 'ages 6+', 'materials provided'],
        imageSlotKey: 'option-e',
      },
      {
        key: 'option-f',
        title: 'Portfolio preparation course for art school applicants',
        openingStyle: 'outcome-led',
        description: 'By the end of this intensive six-session course, applicants will have a curated portfolio of twelve pieces ready for university interviews. A former admissions tutor reviews each student\'s work, suggests improvements and coaches interview technique. Sessions run on consecutive Saturdays from ten to one. Students must bring existing work to the first class.',
        constraints: ['six Saturdays', 'interview prep', 'twelve pieces', 'expert feedback', 'bring existing work'],
        imageSlotKey: 'option-f',
      },
      {
        key: 'option-g',
        title: 'Therapeutic crafting circle for stress relief',
        openingStyle: 'condition-led',
        description: 'If deadlines and screens leave you drained, this gentle Thursday evening circle offers an antidote. Participants choose from knitting, embroidery or collage while soft music plays. A facilitator guides breathing exercises between projects. No skill level is expected; the goal is calm, not perfection. Herbal tea and materials cost five pounds per session.',
        constraints: ['Thursday evening', 'therapeutic', 'multiple crafts', 'no skill needed', 'five pounds'],
        imageSlotKey: 'option-g',
      },
      {
        key: 'option-h',
        title: 'Street art and mural design masterclass',
        openingStyle: 'need-led',
        description: 'Want to transform a dull wall into something extraordinary? This two-day weekend masterclass covers stencil cutting, spray-can technique and large-scale composition. A mural artist with twenty years of experience leads the sessions on a practice wall outdoors. Participants design a group mural for the community centre. All spray equipment is provided; wear old clothes.',
        constraints: ['two days', 'outdoor', 'spray technique', 'group mural', 'equipment provided'],
        imageSlotKey: 'option-h',
      },
    ],
    profiles: [
      { key: 'profile-1', text: 'Elena is applying to art university next year and needs expert feedback on her portfolio. She is free on Saturday mornings and wants interview coaching too.', correctOptionKey: 'option-f' },
      { key: 'profile-2', text: 'George is seventy-four and used to teach art. He wants a relaxed outdoor morning group where he can sketch without paying fees or booking in advance.', correctOptionKey: 'option-c' },
      { key: 'profile-3', text: 'Mia has never painted before and feels nervous about trying. She wants a beginner-friendly evening course where all materials are included and nobody judges.', correctOptionKey: 'option-a' },
      { key: 'profile-4', text: 'The Patel family wants a creative Sunday activity for their two children, aged seven and ten. They would like to make something physical to take home.', correctOptionKey: 'option-e' },
      { key: 'profile-5', text: 'Dan feels stressed from office work and wants a quiet Thursday evening hobby that is more about relaxation than producing perfect results.', correctOptionKey: 'option-g' },
    ],
  },

  part3: {
    title: 'How our street got a mural',
    paragraphs: [
      'The wall beside the laundrette had been grey and peeling for as long as anyone could remember. People dumped fly-tipping there, and someone had spray-painted a rude word in red. Then one spring morning, a woman named Celeste knocked on doors along our street with an extraordinary proposal: she wanted to paint the entire wall with a mural designed by the residents themselves.',
      'Celeste was a professional mural artist who had recently moved to our neighbourhood. She explained that she would handle the technical painting, but the content had to come from us. Over three Saturday workshops in the community hall, neighbours who had barely spoken to each other sat around tables drawing ideas. Children drew their pets; older residents sketched the street as it looked fifty years ago. Celeste listened, combined elements and produced a final design that somehow included everyone\'s contribution.',
      'The painting took two full weeks in August. Celeste worked from a scaffold each morning, and by lunchtime a crowd usually gathered to watch. Local teenagers who normally had nothing to do asked if they could help. Celeste gave them brushes and taught them to fill in the background colours. The rude word was replaced by an enormous oak tree whose leaves contained tiny portraits of every resident who had attended a workshop.',
      'A year later, the mural has changed our street in ways nobody predicted. People stop to photograph it. The fly-tipping stopped because nobody wants to dump rubbish against something beautiful. Neighbours who once ignored each other now chat on the pavement, pointing out their tiny leaf-portrait to visitors. Celeste has since been invited to three other streets, but she says ours will always be her favourite because it was genuinely ours.',
    ],
    questions: [
      { question: 'What was special about Celeste\'s proposal?', options: ['Residents designed the content.', 'She paid for everything herself.', 'The council commissioned it.', 'It was a competition.'], answer: 'A' },
      { question: 'How did Celeste create the final design?', options: ['She combined everyone\'s workshop ideas.', 'She copied a famous painting.', 'She let children decide alone.', 'She used a computer programme.'], answer: 'A' },
      { question: 'What unexpected thing happened during painting?', options: ['Local teenagers volunteered to help.', 'The council tried to stop it.', 'It rained for two weeks.', 'Celeste ran out of paint.'], answer: 'A' },
      { question: 'What replaced the rude word on the wall?', options: ['An oak tree with resident portraits.', 'A landscape painting.', 'The street name in letters.', 'A children\'s drawing.'], answer: 'A' },
      { question: 'What is the main effect of the mural?', options: ['It brought neighbours together.', 'It increased house prices.', 'It attracted tourists daily.', 'It made Celeste wealthy.'], answer: 'A' },
    ],
  },

  part4: {
    title: 'Entering a photography competition',
    text: 'I had taken photos on my phone for years but never considered entering a competition. (16) ..... My sister saw the advert for the Young Lens Awards and forwarded it to me without comment. (17) ..... I spent three weekends wandering the canal path, waiting for the right light. (18) ..... In the end, I submitted a foggy morning shot of a heron standing in the shallows. (19) ..... I did not expect to hear anything back, so the email inviting me to the awards ceremony came as a complete shock. (20) ..... I came second in the nature category, and my photo now hangs in the town library.',
    options: [
      'As a consequence, I now enter at least one competition every season.',
      'At that stage, I assumed it was a joke or a scam email.',
      'Consequently, I learned that patience matters more than expensive equipment.',
      'However, I nearly deleted the message because I lacked confidence.',
      'To my surprise, the whole process felt more exciting than I expected.',
      'The competition was only open to professional photographers.',
      'My sister had already won the same prize the previous year.',
      'I needed to buy a new camera before I could even start.',
    ],
    answers: ['D', 'E', 'C', 'B', 'A'],
  },

  part5: {
    text: 'I took (21) ..... pottery as a hobby after my retirement. My first attempt at throwing a bowl ended (22) ..... a shapeless lump that my grandchildren laughed at. The instructor told me (23) ..... everyone struggles at the beginning. She advised me to concentrate (24) ..... keeping my hands steady rather than aiming for perfection. After six weeks, I produced a mug (25) ..... actually held tea without leaking. I was (26) ..... proud that I gave copies to every family member at Christmas.',
    items: [
      { correct: 'up', wrong: ['on', 'in', 'over'] },
      { correct: 'as', wrong: ['in', 'like', 'for'] },
      { correct: 'that', wrong: ['what', 'how', 'which'] },
      { correct: 'on', wrong: ['at', 'in', 'for'] },
      { correct: 'that', wrong: ['what', 'which', 'who'] },
      { correct: 'so', wrong: ['very', 'too', 'such'] },
    ],
  },

  part6: {
    text: 'The school drama production was directed (27) ........ Mrs Ali, our music teacher. Rehearsals took place (28) ........ the main hall every Tuesday and Friday. The play, (29) ........ was written by a former student, told the story of a travelling circus. I was given a small role, (30) ........ I still felt nervous on opening night. The audience clapped so loudly (31) ........ we performed an extra scene. I have never felt proud (32) ........ anything quite as much before.',
    answers: ['by', 'in', 'which', 'but', 'that', 'of'],
    targets: ['preposition', 'preposition', 'relative-word', 'conjunction', 'conjunction', 'preposition'],
  },
}
