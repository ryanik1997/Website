/**
 * Rewrite Tests 36-40 blueprints Parts 3-6 to remove shared scaffold
 * and hit preferred length ranges. Then regenerate package+public.
 *
 * Run: node scripts/reading/pet-b1-rewrite-36-40.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BLUE = path.join(__dirname, 'pet-b1/blueprints')

// ── Part 3 content (target 325-365 words) ──
const NEW_P3 = {
36: {
  title: 'A science fair that changed direction',
  paragraphs: [
    'A school team planned a small science fair about insects and wanted to make the display interesting without spending a lot of money. The team interviewed classmates about which insects they found fascinating, listed possible specimens and checked which jars and labels were already available in the science cupboard. Because the fair had to remain inexpensive, the first meeting tested a modest plan rather than promising a spectacular display. Every student accepted a small role and described how the evidence they gathered would support the finished display. This arrangement kept the fair genuinely collaborative instead of depending on one enthusiastic organiser to make every decision on their own.',
    'The fair moved from the hall to the library after heavy rain damaged part of the corridor. After the move, the original display plan no longer fitted the library entrance, where shelves blocked the view from the door. Rather than abandon the fair completely, the team compared careful measurements of the new space, consulted the caretaker about which walls could be used and redesigned one section of the display to fit the available area. The caretaker approved the new arrangement, although the team had to explain clearly why their first idea had been unsuitable for the new location.',
    'testing evidence through revision. Pupils compared their insect counts, listened to what visitors said and identified which labels still caused hesitation among younger viewers. They then explained the reasons for each revision to the fair committee, showing how the measurements supported their decisions rather than simply defending their original choices.',
    'The committee questioned one label that seemed unclear, but the pupils defended it with measurements and visitor comments collected during the first session. Writing down that evidence helped them distinguish a useful challenge from a personal preference, and they revised the label in a way that satisfied both the committee and the visitors who had found it confusing.',
  ],
  buildExtension: ' The committee received the final display and recorded the measurements for next year\'s fair. The pupils left with a practical method for testing ideas before presenting them to an audience, and they agreed to use the same approach for future science projects.',
  questions: [
    { stem: 'What is the main point of the community science fair project?', options: ['The group learned by testing and revising an idea.', 'The project succeeded without planning.', 'Only experts could take part.', 'The original plan never changed.'], correctIndex: 0 },
    { stem: 'Why did the group change its plan?', options: ['Evidence showed that the first arrangement was unsuitable.', 'The organiser wanted to cancel the activity.', 'Visitors refused to give comments.', 'The materials were more expensive than expected.'], correctIndex: 0 },
    { stem: 'What helped the members work together?', options: ['They divided responsibilities and explained decisions.', 'They avoided recording their work.', 'They let one person make every choice.', 'They ignored advice from others.'], correctIndex: 0 },
    { stem: 'How did feedback help the group?', options: ['It showed which details confused visitors.', 'It proved that no improvement was needed.', 'It replaced the practical trial.', 'It made the project shorter immediately.'], correctIndex: 0 },
    { stem: 'What does the writer value most?', options: ['Patient revision based on useful evidence.', 'Finishing before anyone else.', 'Using expensive materials.', 'Avoiding disagreement.'], correctIndex: 0 },
  ],
},
37: {
  title: 'A play that found its audience',
  paragraphs: [
    'Our youth theatre group prepared a short play for families and wanted the performance to feel fresh rather than rehearsed. The cast gathered suggestions after school, marked which props would be needed and noted which costumes could be borrowed from the drama cupboard. Because the budget was limited, the group decided to use simple lighting and music that a few members could control backstage. Each actor learned their lines and tested the timing of different scenes, so the whole production stayed in the hands of the young people rather than relying on adult helpers.',
    'A rehearsal became unexpectedly useful when some parents arrived early to collect their children. The early audience exposed a timing problem in the rehearsal, because one long scene made the younger children lose interest and start talking. The cast listened to the comments, timed the scenes again and shortened the middle section to keep the story moving. They discovered that a shorter pause between two scenes helped the audience follow what was happening on stage, and they decided to practise the new timing before the actual performance.',
    'reading the room before changing direction. The cast timed the revised entrance, watched audience reactions carefully and found exactly where the story lost energy during the second half. They then adjusted the blocking so the main characters faced the audience more often, which made the dialogue easier to hear and understand.',
    'Two actors preferred different entrances, so the cast timed both versions before choosing one for the final performance. The comparison turned a disagreement about style into a practical decision based on what actually worked, and the group agreed to use the same evidence-based approach for any future changes to the play.',
  ],
  buildExtension: ' The final performance was well received, and several families asked whether the group would perform again the following term. The cast recorded the timing notes so the play could be revived quickly if a future group wanted to use them.',
  questions: [
    { stem: 'What was the main goal of the theatre group?', options: ['To make the performance feel natural and well timed.', 'To spend as much money as possible.', 'To let adults make all the decisions.', 'To perform without any preparation.'], correctIndex: 0 },
    { stem: 'Why did the early audience help the group?', options: ['It showed them where the play lost attention.', 'It forced them to cancel the performance.', 'It gave them extra money for props.', 'It meant they could skip rehearsals.'], correctIndex: 0 },
    { stem: 'How did the group solve the timing problem?', options: ['They timed the scenes and shortened one section.', 'They stopped performing in front of audiences.', 'They added more long pauses.', 'They ignored the comments they heard.'], correctIndex: 0 },
    { stem: 'What did the two actors disagree about?', options: ['Which entrance worked better for the story.', 'Whether to perform at all.', 'Who would collect the tickets.', 'Which day the performance would take place.'], correctIndex: 0 },
    { stem: 'What does the writer seem to value?', options: ['Using evidence to improve a performance.', 'Avoiding any change to the plan.', 'Choosing the most expensive option.', 'Letting personal preference decide.'], correctIndex: 0 },
  ],
},
38: {
  title: 'Cutting food waste at the school café',
  paragraphs: [
    'Our class wanted to reduce food waste at the school café, because large amounts of food were being thrown away every week. The class compared family recipes, measured the spare ingredients left after lunch and recorded which portions were regularly returned half-eaten by students. Because the café served the same menu each week, the group could gather reliable figures over several days and see which dishes produced the most waste. They shared these numbers with the kitchen staff, who agreed to weigh the leftovers at the end of each lunch service and report back to the class.',
    'A practical recipe project soon revealed a larger habit behind the waste. A trial lunch showed that the recipe encouraged unnecessary leftovers, because the portions were simply too large for most students and the vegetables were cooked separately from the main dish. The class weighed the remaining food, compared the results with the earlier figures and identified which part of the meal students were leaving on their plates most often.',
    'measuring waste instead of guessing. The class weighed the new portions, collected comments from students and spotted which instructions still encouraged people to take more food than they could eat. They then presented the numbers to the kitchen staff and suggested a clear change to the serving size.',
    'Some students wanted larger portions, while others pointed to the leftover figures as proof that the current size was already too generous. Looking at the numbers together made the final serving choice easier, because the group could agree on a size that reduced waste without leaving anyone hungry at the end of lunch.',
  ],
  buildExtension: ' After a week of testing the new portion size, the café reported that the amount of food thrown away had fallen by almost half. The class recorded the results and planned to repeat the measurement later in the term to make sure the improvement lasted.',
  questions: [
    { stem: 'What did the class want to find out?', options: ['How much food was wasted and why.', 'How to make the café more expensive.', 'Which students ate the most.', 'Whether the kitchen should close.'], correctIndex: 0 },
    { stem: 'What did the trial lunch show?', options: ['The portions were too large for most students.', 'The recipe produced no waste at all.', 'Students disliked all vegetables.', 'The kitchen had no food to serve.'], correctIndex: 0 },
    { stem: 'How did the class gather evidence?', options: ['By weighing leftovers and collecting comments.', 'By guessing the amount of waste.', 'By ignoring the kitchen staff.', 'By closing the café for a week.'], correctIndex: 0 },
    { stem: 'Why was the disagreement about portion size useful?', options: ['It made the group examine the evidence together.', 'It stopped any change from happening.', 'It meant no one had to make a decision.', 'It increased the amount of waste.'], correctIndex: 0 },
    { stem: 'What is the main message of the text?', options: ['Measuring a problem can lead to a practical solution.', 'Waste is impossible to reduce.', 'Only adults can change the menu.', 'Leftover food is not a real problem.'], correctIndex: 0 },
  ],
},
39: {
  title: 'Photographs that asked for proof',
  paragraphs: [
    'The library invited teenagers to help organise a collection of old photographs that had been stored in boxes for many years. Volunteers searched through the old boxes, matched names with dates where possible and checked which photographs were damaged and needed careful handling. Because the collection belonged to the local community, the group wanted to make sure the information displayed beside each photograph was accurate and could be trusted by visitors.',
    'One unclear image soon led to a wider investigation. A missing date turned the photograph display into a research question, because nobody could agree on when the scene had been taken. Volunteers compared handwriting on the back of the photograph with records held by the council, looked at the style of clothing worn by the people in the image and invited a local resident who remembered the street to check the details.',
    'checking memories against records. The volunteers compared the caption with council records, invited a resident to check the memory and marked the remaining uncertainty beside the photograph so that visitors would not assume the information was certain. They learned that a memory could be vivid but still slightly wrong, and that records helped to correct it.',
    'A resident remembered a different date from the one in the council file, so the volunteers kept the uncertainty visible beside the photograph rather than choosing one version at random. That restraint protected the archive from repeating a mistake, and the group recorded both dates in a separate note for future researchers to investigate.',
  ],
  buildExtension: ' When the display opened, visitors appreciated the honest notes that explained what was known and what was still uncertain. The library decided to continue the volunteer project each summer, and the teenagers learned that careful checking was more valuable than guessing quickly.',
  questions: [
    { stem: 'Why were the teenagers asked to help?', options: ['To organise and check the accuracy of old photographs.', 'To throw away the oldest pictures.', 'To sell the collection to visitors.', 'To stop anyone seeing the library.'], correctIndex: 0 },
    { stem: 'What caused the wider investigation?', options: ['A photograph with no clear date.', 'A damaged picture that could not be repaired.', 'A complaint from a visitor.', 'A request to close the library.'], correctIndex: 0 },
    { stem: 'How did the volunteers check the photograph?', options: ['They compared it with records and spoke to a resident.', 'They guessed the date without any evidence.', 'They removed it from the display.', 'They ignored what other people said.'], correctIndex: 0 },
    { stem: 'Why did the group keep both dates visible?', options: ['To show that the information was still uncertain.', 'To make the display look fuller.', 'To avoid checking the records at all.', 'To confuse the visitors on purpose.'], correctIndex: 0 },
    { stem: 'What does the project teach the volunteers?', options: ['The value of checking evidence carefully.', 'That memories are always completely reliable.', 'That records should never be questioned.', 'That guessing is faster than researching.'], correctIndex: 0 },
  ],
},
40: {
  title: 'A roof garden built on evidence',
  paragraphs: [
    'Residents wanted to use an unused roof above the market for a small community garden, but they first needed to prove that the space was safe. Residents walked the roof route, marked the narrow points and checked which signs could be moved to make room for planters without blocking the emergency exit. Because the roof was old, the group measured the distance to the edge carefully and recorded every section that needed extra support before asking the engineer for advice.',
    'The first plan changed after safety advice from the engineer. A safety walk revealed that the first route would force visitors too close to the edge, where the ground sloped towards the street below. Residents measured the safer route, compared the two options and adjusted the position of the planters so that people could walk around them without stepping near the danger.',
    'choosing safety over appearance. The residents measured the revised route, asked visitors to describe its weak points and recorded the result for the engineer to review. They discovered that a slightly less attractive arrangement was much easier to use safely, and they agreed to accept the practical choice.',
    'Several residents preferred a prettier route that wound close to the edge, but the engineer\'s measurements showed clearly why it was unsafe in wet weather. The final decision therefore rested on access and safety rather than on looks, and the group presented the evidence to the market committee to win their support for the garden.',
  ],
  buildExtension: ' Once the planters were installed, the roof garden quickly became a popular place for residents to meet, and the market committee agreed to fund a small water tank for the plants. The group recorded their measurements so that any future changes could be checked against the same evidence.',
  questions: [
    { stem: 'What did the residents need to prove first?', options: ['That the roof was safe to use.', 'That the market should close.', 'That they could grow expensive plants.', 'That the roof was the prettiest option.'], correctIndex: 0 },
    { stem: 'Why did the first route have to change?', options: ['It brought visitors too close to the edge.', 'It was too expensive to build.', 'It blocked the market entrance.', 'It faced the wrong direction.'], correctIndex: 0 },
    { stem: 'How did the residents choose the new route?', options: ['They measured both routes and compared them.', 'They guessed which one looked nicer.', 'They followed the engineer without checking.', 'They asked visitors to vote immediately.'], correctIndex: 0 },
    { stem: 'Why did the residents accept the less attractive option?', options: ['Because it was much safer to use.', 'Because they had no other choice.', 'Because the engineer refused to help.', 'Because the market committee insisted.'], correctIndex: 0 },
    { stem: 'What is the main idea of the text?', options: ['Evidence and safety should guide community decisions.', 'Appearance matters more than safety.', 'Engineers always make the wrong choices.', 'Community projects are never successful.'], correctIndex: 0 },
  ],
},
}

// ── Part 4 content (target 320-345) ──
const NEW_P4 = {
36: {
  title: 'Community Science Fair develops through experience',
  paragraphs: [
    'The science fair took shape around a measurement problem rather than a timetable. Its first visitors asked questions the organisers had not prepared for, and several asked whether the results could be repeated at home. (16) ..... By listening carefully, the team made the activity welcoming without losing its original purpose.',
    'During the opening demonstration, the science team discovered a practical obstacle. Some materials were missing, and one instruction was unclear to new participants who had never handled the equipment before. (17) ..... The change made the next attempt slower, but everyone understood what to do and could contribute more confidently.',
    'At first, the organisers thought the project would be finished in one afternoon, but the evidence they collected kept raising new questions. (18) ..... They divided the work into smaller tasks and checked progress at the end of each session, which gave volunteers time to notice details instead of rushing towards a result.',
    'When visitors saw the early version, they asked questions that the team had not expected, particularly about the reliability of the measurements. (19) ..... The organisers used these comments to improve the explanation and test the activity with another group before the final display.',
    'The final event was modest, but people left with a clearer idea of what the project offered. The team kept its notes for the next organisers and marked which explanations had worked best. (20) ..... The experience showed that a shared project becomes stronger when its plans can change for good reasons.',
  ],
  options: [
    { key: 'option-0', text: 'Several residents said that clear information would help them take part.', correctForGap: 16 },
    { key: 'option-1', text: 'The team replaced the missing materials and rewrote the instruction.', correctForGap: 17 },
    { key: 'option-2', text: 'There was much more preparation than anyone had first imagined.', correctForGap: 18 },
    { key: 'option-3', text: 'Their questions showed that the explanation needed a practical example.', correctForGap: 19 },
    { key: 'option-4', text: 'Keeping a record would make future sessions easier to organise.', correctForGap: 20 },
    { key: 'option-5', text: 'The organisers cancelled every later meeting.', correctForGap: null },
    { key: 'option-6', text: 'Nobody was interested in the activity after the first day.', correctForGap: null },
    { key: 'option-7', text: 'The market closed before the visitors arrived.', correctForGap: null },
  ],
  displayOrder: [4, 1, 6, 0, 3, 7, 2, 5],
},
37: {
  title: 'A performance reshaped by its first audience',
  paragraphs: [
    'The youth theatre group began rehearsing its play with a fixed running order and a careful rehearsal schedule. When some parents arrived early, the cast suddenly found themselves performing the first scene in front of a real audience. (16) ..... The unexpected trial gave the group honest feedback that a normal rehearsal could not have provided.',
    'The early audience lost interest during one long middle scene, and the actors noticed the children starting to talk. (17) ..... The cast shortened the scene and added a short pause so the audience could follow the next part of the story more easily.',
    'The group had planned the whole production in advance and did not expect to change it. (18) ..... They timed every scene, listened to the recorded audience comments and decided which parts of the play needed the most attention before the real performance.',
    'Two actors preferred different entrances, and neither was willing to give way at first. (19) ..... The comparison showed that one entrance kept the story clearer, so the cast chose it and used the evidence to settle the disagreement calmly.',
    'After the performance, the group recorded their timing notes so that the play could be revived without starting from scratch. (20) ..... The experience convinced the young actors that testing their work in front of people was the fastest way to improve it.',
  ],
  options: [
    { key: 'option-0', text: 'The actors were nervous, but they remembered their lines.', correctForGap: 16 },
    { key: 'option-1', text: 'The group shortened the scene and adjusted the timing.', correctForGap: 17 },
    { key: 'option-2', text: 'The audience feedback showed that the plan needed adjustment.', correctForGap: 18 },
    { key: 'option-3', text: 'They timed both versions before choosing the clearer one.', correctForGap: 19 },
    { key: 'option-4', text: 'These notes would help a future cast bring the play back quickly.', correctForGap: 20 },
    { key: 'option-5', text: 'The group cancelled the play and returned the costumes.', correctForGap: null },
    { key: 'option-6', text: 'Nobody could remember any of the lines on stage.', correctForGap: null },
    { key: 'option-7', text: 'The theatre closed before the first rehearsal began.', correctForGap: null },
  ],
  displayOrder: [5, 2, 7, 0, 4, 1, 6, 3],
},
38: {
  title: 'The food project measures its own success',
  paragraphs: [
    'The school food project began by measuring how much cooked food was thrown away at the end of lunch. The class weighed the leftovers for a full week and noticed that the same dish appeared on the list every single day. (16) ..... The students wanted to see whether a smaller portion would reduce the waste without leaving anyone hungry.',
    'During the trial, the kitchen served the new portion size and weighed what came back at the end of the meal. (17) ..... The result surprised the class, because the amount of leftover food fell sharply while students reported feeling satisfied.',
    'The first idea was simply to reduce every portion by the same amount, but the numbers showed that some dishes needed a larger change than others. (18) ..... The group compared the figures for each dish and adjusted the menu one item at a time rather than changing everything at once.',
    'A few students complained that the new portions were too small, especially the boys who played sport during lunch. (19) ..... The kitchen added a small free salad bowl to the serving line, which gave active students extra food without increasing the waste.',
    'By the end of the term, the café reported that food waste had fallen by almost half. (20) ..... The class recorded the method and shared it with other schools, showing that a simple measurement could solve a problem that everyone had assumed was too difficult to change.',
  ],
  options: [
    { key: 'option-0', text: 'This daily pattern gave the project a clear starting point.', correctForGap: 16 },
    { key: 'option-1', text: 'The smaller portions produced far less waste than before.', correctForGap: 17 },
    { key: 'option-2', text: 'The figures revealed which dishes needed the biggest change.', correctForGap: 18 },
    { key: 'option-3', text: 'The extra option satisfied them without creating new waste.', correctForGap: 19 },
    { key: 'option-4', text: 'The recorded method could be copied by other cafeterias.', correctForGap: 20 },
    { key: 'option-5', text: 'The café stopped serving lunch altogether.', correctForGap: null },
    { key: 'option-6', text: 'The students refused to eat any vegetables at all.', correctForGap: null },
    { key: 'option-7', text: 'The kitchen burned all the leftover food.', correctForGap: null },
  ],
  displayOrder: [1, 5, 3, 6, 0, 2, 7, 4],
},
39: {
  title: 'The archive project learns to keep honest records',
  paragraphs: [
    'The library archive project began when volunteers found a photograph with no date written on the back. Nobody could agree on when the scene had been taken, and the group realised they needed a more careful method than guessing. (16) ..... This decision shaped everything the project did afterwards.',
    'The volunteers compared the photograph with council records and with the style of clothing worn by the people in the image. (17) ..... They also found a resident who remembered the street and could confirm some of the details in the picture.',
    'At first the group wanted to choose the date that most people remembered, simply because it was the most popular answer. (18) ..... They learned that a vivid memory could still be inaccurate, so they decided to keep the uncertainty visible instead of hiding it.',
    'One resident was sure the photograph showed a different year from the one in the council file. (19) ..... The volunteers recorded both versions in a separate note, so that future researchers could investigate the difference without repeating the same mistake.',
    'When the display opened, visitors appreciated the honest labels that explained what was certain and what was still unknown. (20) ..... The project showed that a careful record is more valuable than a confident guess, even when the truth is difficult to discover.',
  ],
  options: [
    { key: 'option-0', text: 'The group decided to search for evidence rather than guess.', correctForGap: 16 },
    { key: 'option-1', text: 'The records helped narrow down the date of the scene.', correctForGap: 17 },
    { key: 'option-2', text: 'The popular answer turned out to be wrong.', correctForGap: 18 },
    { key: 'option-3', text: 'The difference was recorded for future researchers.', correctForGap: 19 },
    { key: 'option-4', text: 'The honest approach built trust with the community.', correctForGap: 20 },
    { key: 'option-5', text: 'The volunteers destroyed the photograph.', correctForGap: null },
    { key: 'option-6', text: 'The library banned all visitors from the display.', correctForGap: null },
    { key: 'option-7', text: 'The council refused to help with the project.', correctForGap: null },
  ],
  displayOrder: [3, 0, 6, 2, 7, 1, 4, 5],
},
40: {
  title: 'The roof garden plan is tested for safety',
  paragraphs: [
    'Residents who wanted a community garden on the roof above the market first had to prove that the space was safe. They walked the route, marked the narrow sections and measured the distance from the edge at every point. (16) ..... The engineer wanted to see the measurements before agreeing to any plan.',
    'The first route looked attractive because it passed close to the sunniest corner, but the safety walk showed that it led visitors too near the edge. (17) ..... The revised route was slightly less pretty but much easier to use safely in wet weather.',
    'The group had expected the original plan to be approved without changes, so the engineer\'s report came as a surprise. (18) ..... They measured the alternative route, compared the two options carefully and agreed to accept the safer design.',
    'Some residents still preferred the prettier path and argued that the risk was small, especially on dry days. (19) ..... The engineer produced a simple drawing showing the measurements, and the group used it to explain the danger to everyone who had doubted the change.',
    'Once the planters were installed, the roof garden quickly became a popular meeting place. (20) ..... The residents kept their records so that any future extension could be checked against the same evidence that had guided the original design.',
  ],
  options: [
    { key: 'option-0', text: 'The careful measurements gave the engineer the evidence he needed.', correctForGap: 16 },
    { key: 'option-1', text: 'The safer route protected visitors from the steep edge.', correctForGap: 17 },
    { key: 'option-2', text: 'The engineer\'s report forced the group to rethink the design.', correctForGap: 18 },
    { key: 'option-3', text: 'The drawing convinced them that the danger was real.', correctForGap: 19 },
    { key: 'option-4', text: 'The recorded measurements would guide any future changes.', correctForGap: 20 },
    { key: 'option-5', text: 'The market committee closed the roof permanently.', correctForGap: null },
    { key: 'option-6', text: 'The residents built the garden without any checks.', correctForGap: null },
    { key: 'option-7', text: 'The engineer refused to visit the roof at all.', correctForGap: null },
  ],
  displayOrder: [2, 6, 0, 5, 1, 7, 3, 4],
},
}

// ── Part 5 content (target 190-210) ──
const NEW_P5 = {
36: {
  text: 'Last month, students at a local school carried out a survey of their reading habits. Each person chose three books from a list and explained what made a story easy to finish. The class compared the answers and noticed that short chapters helped most readers keep going. They then asked the librarian to display the most popular titles, so other students could find a book without searching for hours. By the end of the week, almost every shelf had been borrowed at least once, which pleased the librarian. The project showed that a simple question about taste could change the way a whole school used its library.',
  extra: ' The students recorded the results in a colourful chart and hung it beside the entrance. A teacher asked them to repeat the survey each term, so the library could keep offering books that readers actually enjoyed. Several parents also asked for a copy of the list to help their children choose books at home.',
  specs: [
    { phrase: 'carried out', options: ['carried out', 'looked up', 'gave away', 'turned off'], correctIndex: 0 },
    { phrase: 'what made a story easy', options: ['what made a story easy', 'when made a story easy', 'who made a story easy', 'how made a story easy'], correctIndex: 0 },
    { phrase: 'helped most readers keep going', options: ['helped most readers keep going', 'helped most readers keep on', 'helped most readers keep up', 'helped most readers keep off'], correctIndex: 0 },
    { phrase: 'without searching for hours', options: ['without searching for hours', 'without to search for hours', 'without searching hours of', 'without search for hours'], correctIndex: 0 },
    { phrase: 'been borrowed at least once', options: ['been borrowed at least once', 'been borrowed at last once', 'been borrowed at fewer once', 'been borrowed at enough once'], correctIndex: 0 },
    { phrase: 'asked them to repeat', options: ['asked them to repeat', 'asked them repeat to', 'asked to them repeat', 'asked them repeating'], correctIndex: 0 },
  ],
},
37: {
  text: 'Many teenagers are surprised to learn how much confidence comes from joining a drama group. In the first session, new members often feel nervous, but the leader starts with simple games that help everyone relax. After a few weeks, most participants can remember longer speeches and speak clearly in front of the others. The group also works on building a story together, so no one feels left out of the final production. Parents who watch the end-of-term show are always amazed by how much the young actors have improved. For anyone who feels shy, a drama group offers a friendly way to practise speaking and listening in a safe environment.',
  extra: ' The leader keeps the groups small so that every member receives attention, and beginners are never expected to perform alone until they feel ready. Many former members return to help with the younger group, which shows how the experience stays with them long after the final curtain.',
  specs: [
    { phrase: 'how much confidence comes', options: ['how much confidence comes', 'how many confidence comes', 'how much confidence come', 'how confidence much comes'], correctIndex: 0 },
    { phrase: 'feel nervous', options: ['feel nervous', 'feel nervously', 'feeling nervous', 'felt nervous'], correctIndex: 0 },
    { phrase: 'help everyone relax', options: ['help everyone relax', 'helps everyone relax', 'to help everyone relax', 'helping everyone relax'], correctIndex: 0 },
    { phrase: 'can remember longer speeches', options: ['can remember longer speeches', 'can remembering longer speeches', 'can remembered longer speeches', 'can to remember longer speeches'], correctIndex: 0 },
    { phrase: 'are always amazed', options: ['are always amazed', 'is always amazed', 'are always amazing', 'are always to amaze'], correctIndex: 0 },
    { phrase: 'offers a friendly way', options: ['offers a friendly way', 'offers a friendly manner of', 'offers friendly a way', 'offer a friendly way'], correctIndex: 0 },
  ],
},
38: {
  text: 'Our class began a recycling project after learning how much paper the school wasted each week. We placed a special box in every classroom and asked students to put used paper inside instead of throwing it in the bin. At first, some people forgot, so we made bright posters to remind them. Within a month, the boxes were so full that we had to empty them twice a day. The school office counted the collected paper and reported that we had saved almost a hundred kilograms in a single term. Our teacher was so pleased that she arranged for us to visit a recycling centre and see what happened to the paper we collected.',
  extra: ' The visit showed us how the paper was cleaned, pressed and turned into new sheets that could be used again. We decided to keep the project running and even started collecting plastic bottles in a second box, because the first idea had worked so well and saved the school real money on waste collection.',
  specs: [
    { phrase: 'after learning how much', options: ['after learning how much', 'after to learn how much', 'after learned how much', 'after learning how many'], correctIndex: 0 },
    { phrase: 'throwing it in the bin', options: ['throwing it in the bin', 'throwing it into the bin', 'throwing it at the bin', 'throwing it of the bin'], correctIndex: 0 },
    { phrase: 'some people forgot', options: ['some people forgot', 'some people forgets', 'some people forgotten', 'some people forgetting'], correctIndex: 0 },
    { phrase: 'had to empty them twice', options: ['had to empty them twice', 'had to emptied them twice', 'had to emptying them twice', 'had to be empty them twice'], correctIndex: 0 },
    { phrase: 'was so pleased', options: ['was so pleased', 'was such pleased', 'were so pleased', 'was so pleasing'], correctIndex: 0 },
    { phrase: 'see what happened to the paper', options: ['see what happened to the paper', 'see what did happen the paper', 'see that happened to the paper', 'see what happened at the paper'], correctIndex: 0 },
  ],
},
39: {
  text: 'I learned to cook properly during the school holidays when my parents were busy at work. My grandmother gave me a simple recipe book and told me to start with a vegetable soup, because it was difficult to make it taste wrong. At first, I chopped the carrots too slowly and burned the onions, but I kept trying and soon improved. After a week, I could prepare a full meal without help and even invented my own sauce. My family was impressed, and now I cook dinner twice a week so my parents can rest after a long day. Cooking has given me confidence and made me more independent, because I can look after myself without ordering takeaway food.',
  extra: ' I have started writing down my own recipes in a notebook and adding new ingredients when I try something different. My younger brother has also asked me to teach him, so we now plan the weekly menu together and share the cooking on weekends.',
  specs: [
    { phrase: 'told me to start', options: ['told me to start', 'told me starting', 'told me for start', 'told me start to'], correctIndex: 0 },
    { phrase: 'it was difficult to make', options: ['it was difficult to make', 'it was difficult making to', 'it were difficult to make', 'it was difficulty to make'], correctIndex: 0 },
    { phrase: 'chopped the carrots too slowly', options: ['chopped the carrots too slowly', 'chopped the carrots too slow', 'chopped the carrots much slowly', 'chopped the carrots very slow'], correctIndex: 0 },
    { phrase: 'could prepare a full meal', options: ['could prepare a full meal', 'could prepared a full meal', 'could to prepare a full meal', 'could preparing a full meal'], correctIndex: 0 },
    { phrase: 'cook dinner twice a week', options: ['cook dinner twice a week', 'cook dinner twice the week', 'cook dinner twice of week', 'cook dinner twice a weekly'], correctIndex: 0 },
    { phrase: 'without ordering takeaway food', options: ['without ordering takeaway food', 'without to order takeaway food', 'without ordered takeaway food', 'without ordering takeaway foods'], correctIndex: 0 },
  ],
},
40: {
  text: 'My friend and I opened a small stall at the weekend market to sell handmade cards. We spent two weeks designing them, choosing bright colours and simple messages that would appeal to different customers. On the first morning, we sold nothing until noon, and we began to worry that our idea had failed. Then a grandmother bought three cards and asked if we could make more with her grandchildren\'s names on them. Word spread quickly, and by closing time we had sold almost every card we had brought. We learned that a small idea could succeed if we listened to what customers wanted, and we are already planning a bigger stall for next month with a wider range of designs.',
  extra: ' The stall cost more to set up than we expected, but the profit from the second weekend covered our costs and left enough for new materials. We now keep a notebook of customer suggestions and use them to design the next batch of cards.',
  specs: [
    { phrase: 'opened a small stall', options: ['opened a small stall', 'opened small a stall', 'opened the small stall', 'opening a small stall'], correctIndex: 0 },
    { phrase: 'designing them', options: ['designing them', 'designed them', 'to design them', 'design them'], correctIndex: 0 },
    { phrase: 'that would appeal', options: ['that would appeal', 'who would appeal', 'which would appeal to', 'what would appeal'], correctIndex: 0 },
    { phrase: 'began to worry', options: ['began to worry', 'began worrying to', 'began worried', 'began to worrying'], correctIndex: 0 },
    { phrase: 'bought three cards', options: ['bought three cards', 'buy three cards', 'buys three cards', 'buying three cards'], correctIndex: 0 },
    { phrase: 'by closing time', options: ['by closing time', 'at closing time', 'on closing time', 'from closing time'], correctIndex: 0 },
  ],
},
}

// ── Part 6 content (target 172-192) ──
const NEW_P6 = {
36: {
  text: 'The library team decided to run a short course on safe internet use. They wanted to know (27) ........ adults already understood before planning the lessons. A volunteer explained that most people only asked (28) ........ help when something went wrong. The team therefore planned a course that started (29) ........ the basics and built up slowly. Every session ended with time (30) ........ questions, so nobody left feeling confused. By the final week, several learners had bought their own devices, (31) ........ showed how much confidence they had gained. The course was repeated twice a year, (32) ........ the demand never seemed to fall.',
  extra: ' The library kept a simple record of attendance and used the notes to improve each new course. A follow-up survey showed that learners remembered the key steps even months later, which encouraged the team to plan an advanced course for the following year.',
  tail: ' The success of the course changed the way the library thought about its role in the community, moving beyond books and offering practical digital skills that people needed in everyday life.',
  answers: ['what', 'for', 'with', 'for', 'which', 'because'],
  targets: ['relative-word', 'preposition', 'preposition', 'preposition', 'relative-word', 'conjunction'],
},
37: {
  text: 'The youth centre announced a new evening workshop on photography. Young people were invited to bring their phones, (27) ........ they did not need any special equipment. The leader started by explaining (28) ........ to hold the camera steady and frame a simple scene. After the first hour, everyone had taken a picture they were proud of, (29) ........ several had never touched a camera before. The workshop ended with a small display of the best shots, and the centre promised to run (30) ........ again each month. Parents who attended the display were surprised by (31) ........ much talent their children had shown, and they asked for a similar class for adults. The centre agreed, so the photography project soon grew (32) ........ than anyone had expected.',
  extra: ' The adult class filled up within a week, which showed that the demand for creative activities was much larger than the centre had realised. The workshop leader now keeps a waiting list and sends a monthly newsletter with photography tips to everyone who has taken part.',
  tail: ' The photography workshops gave the centre a new sense of purpose and encouraged more young people to come through its doors in the evenings.',
  answers: ['though', 'how', 'even', 'it', 'how', 'more'],
  targets: ['conjunction', 'linking-word', 'adverb', 'pronoun', 'linking-word', 'quantifier'],
},
38: {
  text: 'The market held a competition to find the best local recipe. Cooks entered dishes from their family traditions, and a panel of judges tasted each one in (27) ........ order. The winner was a simple soup that the judges said reminded (28) ........ of their own grandmothers\' cooking. The market printed the recipe on free cards, (29) ........ shoppers could try it at home. Demand was so high that the market ordered a second print run, and the recipe even appeared in (30) ........ local newspaper. The competition showed that food could bring people together, and the organisers decided to hold (31) ........ every summer. Local shops also reported that sales of the winning ingredients had risen, (32) ........ was an unexpected bonus for everyone involved.',
  extra: ' The success of the competition encouraged other markets in the region to start similar events, and a national food website asked to publish the winning recipe. The organisers collected feedback from the cooks and planned to add a junior category the following year.',
  tail: ' The recipe competition turned a simple market event into a tradition that the whole town looked forward to each summer.',
  answers: ['turn', 'them', 'so', 'the', 'it', 'which'],
  targets: ['noun-choice', 'pronoun', 'conjunction', 'article', 'pronoun', 'relative-word'],
},
39: {
  text: 'The local museum opened a new room for old photographs and letters. Visitors were invited to bring items from home, (27) ........ the staff photographed them carefully. Each item was labelled with (28) ........ name of the person who had donated it, so the story could be traced back. A retired teacher helped identify some of the people in the pictures, and (29) ........ memory filled in details that no record contained. The museum displayed the items alongside the stories, (30) ........ visitors could understand the context. School groups used the room to learn about local history, and many (31) ........ asked to return with their families at the weekend. The project was so popular that the museum decided to keep (32) ........ open all year round.',
  extra: ' The volunteers who ran the room enjoyed meeting visitors and hearing their own memories of the people in the photographs. The museum printed a small booklet with the most interesting stories, and it sold out within the first month.',
  tail: ' The photograph room proved that a museum could be about ordinary people, not just famous events, and it gave the community a reason to feel proud of its history.',
  answers: ['and', 'the', 'her', 'so', 'students', 'it'],
  targets: ['conjunction', 'article', 'pronoun', 'conjunction', 'noun-choice', 'pronoun'],
},
40: {
  text: 'A group of residents decided to transform an unused car park into a small garden. They applied for permission, and the council agreed (27) ........ they kept the entrance clear for deliveries. The first weekend, dozens of neighbours arrived to help dig and plant, (28) ........ surprised the organisers. Each family was given a small plot, and the garden soon became a place (29) ........ people met and talked while watering their vegetables. The project was so successful that the council offered funding for a second garden nearby. The residents planned to run (30) ........ together, sharing tools and advice between the two sites. By autumn, the first vegetables were ready to harvest, and the neighbours held a meal (31) ........ every dish came from their own plots. The garden had grown into something (32) ........ much bigger than anyone had imagined.',
  extra: ' The second garden opened the following spring, and the two sites now share a small shed and a compost bin. New residents are welcomed with a short tour, and the organisers keep a notice board listing the jobs that need volunteers.',
  tail: ' The community garden changed the neighbourhood, giving people a shared reason to meet and turning an empty space into a source of fresh food and friendship.',
  answers: ['provided', 'which', 'where', 'them', 'where', 'far'],
  targets: ['conjunction', 'relative-word', 'relative-word', 'pronoun', 'relative-word', 'adverb'],
},
}

// ── Apply to blueprints ──
async function patchBlueprint(n) {
  const file = path.join(BLUE, `test-${n}.mjs`)
  const mod = await import(pathToFileURL(file).href)
  const bp = JSON.parse(JSON.stringify(mod.default))

  if (NEW_P3[n]) bp.part3 = NEW_P3[n]

  if (NEW_P4[n]) {
    const p4 = NEW_P4[n]
    bp.part4.title = p4.title
    bp.part4.layoutParagraphs = p4.paragraphs
    bp.part4.layoutExtensions = ['', '', '', '', '']
    bp.part4.layoutClosers = ['', '', '', '', '']
    bp.part4.options = p4.options
    bp.part4.displayOrder = p4.displayOrder
  }

  if (NEW_P5[n]) {
    const p5 = NEW_P5[n]
    // Validate each spec phrase exists in text
    const full = p5.text + p5.extra
    for (const spec of p5.specs) {
      if (!full.includes(spec.phrase)) {
        throw new Error(`T${n} P5 spec phrase not in text: "${spec.phrase}"`)
      }
    }
    bp.part5.text = p5.text
    bp.part5.extra = p5.extra
    bp.part5.specs = p5.specs
  }

  if (NEW_P6[n]) {
    const p6 = NEW_P6[n]
    // Validate gap count = answers count
    const gaps = (p6.text.match(/\(\d+\)\s*\.{3,}/g) || [])
    if (gaps.length !== 6) throw new Error(`T${n} P6 has ${gaps.length} gaps, expected 6`)
    if (p6.answers.length !== 6) throw new Error(`T${n} P6 has ${p6.answers.length} answers, expected 6`)
    bp.part6.text = p6.text
    bp.part6.extra = p6.extra
    bp.part6.tail = p6.tail
    bp.part6.answers = p6.answers
    bp.part6.targets = p6.targets
  }

  fs.writeFileSync(file, `export default ${JSON.stringify(bp, null, 2)}\n`)
  console.log(`Patched test-${n}.mjs`)
}

for (const n of [36, 37, 38, 39, 40]) {
  await patchBlueprint(n)
}
console.log('All blueprints patched')
