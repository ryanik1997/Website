import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
const root=resolve(import.meta.dirname,'../..')
const p5={
20:' The exhibition also gave students a chance to explain their choices to visitors. Some guests asked about camera settings, so the group prepared a short guide and displayed it beside the photographs.',
21:' After the fair, several children copied the experiments at home with their parents. The organisers collected their questions and used them to choose activities for the next event.',
22:' My first performance was not perfect, but the audience listened kindly and encouraged us. Afterwards, the director showed us how to practise difficult scenes without losing the story.',
23:' Neighbours began sharing information about other useful services as well. Our group made a simple noticeboard, so people could find advice about transport, food banks and evening classes.',
24:' We compared our notes on the train home and discovered that different objects had made each of us curious. Back at school, we used those questions to prepare a presentation for younger pupils.',
25:' The coach explained that good care also means observing an animal quietly. I learned to notice small changes in behaviour, and this made my daily work at the shelter more careful.',
22:' The new centre has also become a place where residents meet after work each week. People bring books, share news and suggest activities, so the building feels useful even when no classes are taking place.',
26:' The new centre has also become a place where residents meet after work. People bring books, share news and suggest activities, so the building feels useful even when no classes are taking place.',
27:' We recorded the results after each clean-up and sent them to the council. The figures helped officials identify the areas where litter returned fastest and place bins in better positions.',
28:' At the end of the course, each student cooked one dish for the others. Tasting the meals together helped us understand how ingredients and cooking methods change from one country to another.',
29:' We also wrote down his gardening advice and gave the notebook to him. He laughed when he saw it, but he promised to add more ideas whenever the family visited.',
}
const p4={
21:' The new arrangement made the final evening feel special, because everyone could see how much patient rehearsal had improved the group’s confidence and timing.',
22:' We also thanked the volunteers who had encouraged runners along the route, since their support helped people finish even when the afternoon became unexpectedly hot.',
23:' We checked the structure after bad weather and repaired loose boards together, which taught us that a shared place needs regular care as well as imagination.',
25:' I also learned that animals need patience rather than attention all the time, because a quiet approach often helps a frightened animal feel safe enough to respond.',
29:' We kept the secret until the last moment, checking every detail carefully so that the surprise would feel personal rather than simply expensive or impressive.',
}
const p6={
20:' At first I was nervous about speaking to strangers, but regular meetings made conversations easier. Now I look forward to the club because every visit gives me a new recommendation and a chance to discuss it.',
21:' The instructor never laughed when I made mistakes. Instead, she explained each movement again, and this patient approach helped me stay calm when I practised without anyone beside me.',
22:' We checked the weather before leaving and learned to change our plans when conditions became unsafe. That habit is now part of every family journey, even when we are only driving to the coast.',
23:' I began by photographing familiar streets, then started noticing details that I had ignored before. Friends now ask me to take pictures at events because they like the quiet moments I choose to record.',
24:' Sharing a room with another student was difficult at first, but we agreed to respect each other’s routines. By the end of the exchange, we were planning another visit together.',
25:' The project was successful because everyone accepted a small responsibility. Some pupils collected paper, others measured the results, and the caretaker arranged a place to store the new boxes.',
26:' I still need to practise pronunciation, but I can now understand the main idea of simple conversations. That progress has encouraged me to continue even when learning feels slow.',
27:' We carried extra water and checked the map before starting. These small preparations made the walk safer, and they left us enough energy to enjoy the view instead of rushing back.',
28:' Rehearsals are still demanding, especially before a performance. However, the other actors give useful advice, and I have learned to listen carefully before changing the way I play a scene.',
29:' Since that day, I have tried to welcome new classmates instead of waiting for them to speak first. A small conversation can make an unfamiliar place feel much friendlier.',
}
function file(n,pub){return resolve(root,pub?`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${n}.json`:`packages/catalog/data/reading-pet-b1-test${n}.json`)}
for(let n=20;n<=29;n++){
 const pkg=JSON.parse(readFileSync(file(n,false),'utf8'))
 for(const [pn,add] of [[4,p4[n]],[5,p5[n]],[6,p6[n]]]){const part=pkg.parts.find(p=>p.partNumber===pn);const block=part.passage.filter(b=>!b.label&&b.text).at(-1);if(add)block.text=block.text.split(add).join('')+add}
 writeFileSync(file(n,false),JSON.stringify(pkg,null,2)+'\n')
 writeFileSync(file(n,true),JSON.stringify(pkg,null,2)+'\n')
}
console.log('Synced public runtime and expanded strict Part 5/6 content.')
