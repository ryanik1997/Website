import { readFileSync, writeFileSync } from 'node:fs'

const file = 'apps/web/public/catalog/writing/tid/tasks.json'
const tasks = JSON.parse(readFileSync(file, 'utf8'))

const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const topic = title => title.replace(/\s+(vs|and|or)\s+/gi, ' and ').replace(/\s+/g, ' ').trim()

const templates = {
  opinion: {
    summary: 'Take a clear position and support it with two specific reasons. A brief concession to the opposite view makes the argument more balanced.',
    outline: ['Introduction: paraphrase the issue and state a direct opinion.', 'Body 1: explain the strongest reason with a practical example.', 'Body 2: develop a second reason and acknowledge one limitation.', 'Conclusion: restate the position and summarise the two reasons.'],
    phrases: ['There is a strong case for...', 'The main reason is that...', 'This is particularly important because...', 'Although this view has some merit, ...'],
    thesis: 'I largely agree with this position because it can produce lasting social benefits and encourage more responsible decisions.',
  },
  discussion: {
    summary: 'Present both views fairly before giving your own opinion. Keep one main idea in each body paragraph and compare the consequences.',
    outline: ['Introduction: introduce the debate and give your overall view.', 'Body 1: explain why the first group supports this approach.', 'Body 2: explain the opposing view and evaluate it.', 'Conclusion: weigh both sides and confirm your position.'],
    phrases: ['On the one hand, ...', 'On the other hand, ...', 'A further consideration is that...', 'On balance, I believe...'],
    thesis: 'Although both perspectives are understandable, I believe a balanced approach is the most effective solution.',
  },
  problem_solution: {
    summary: 'Explain the main causes or problems first, then propose realistic solutions. Link each solution directly to a problem.',
    outline: ['Introduction: paraphrase the issue and preview causes and solutions.', 'Body 1: explain two important causes or effects.', 'Body 2: present two practical solutions and their likely results.', 'Conclusion: summarise the problem and recommend coordinated action.'],
    phrases: ['One major contributing factor is...', 'This problem is aggravated by...', 'A practical response would be to...', 'This would enable...'],
    thesis: 'This issue is caused by several connected factors, but targeted education, effective regulation and community action can reduce its impact.',
  },
  advantages_disadvantages: {
    summary: 'Cover both benefits and drawbacks, then answer whether the advantages outweigh the disadvantages when the question asks for a judgement.',
    outline: ['Introduction: introduce the trend and state your judgement.', 'Body 1: explain the most significant advantages.', 'Body 2: explain the main disadvantages and weigh them against the benefits.', 'Conclusion: give a clear final evaluation.'],
    phrases: ['The most obvious advantage is...', 'This can be offset by...', 'A less desirable consequence is...', 'Overall, the benefits outweigh the costs because...'],
    thesis: 'While this development creates some genuine difficulties, its practical benefits are greater when it is managed responsibly.',
  },
  two_part: {
    summary: 'Answer both questions explicitly. Use one body paragraph for each question and avoid giving a long answer to only the first part.',
    outline: ['Introduction: paraphrase the topic and answer both questions briefly.', 'Body 1: answer the first question with reasons and an example.', 'Body 2: answer the second question with reasons and an example.', 'Conclusion: summarise both answers.'],
    phrases: ['There are several reasons for this trend.', 'The most significant explanation is...', 'In my view, the best response is...', 'For these reasons, ...'],
    thesis: 'This trend has both social and practical explanations, and the most effective response is to combine individual responsibility with sensible public policy.',
  },
  other: {
    summary: 'Identify every instruction in the prompt, form a clear position and support each claim with a specific explanation or example.',
    outline: ['Introduction: paraphrase the topic and state the central answer.', 'Body 1: develop the first required point.', 'Body 2: develop the second required point.', 'Conclusion: summarise the answer and final implication.'],
    phrases: ['A key point to consider is...', 'This is largely because...', 'For example, ...', 'In conclusion, ...'],
    thesis: 'A measured response is preferable because it addresses the immediate concern while also protecting longer-term social interests.',
  },
}

function sample(task, template) {
  const subject = topic(task.title).toLowerCase()
  return `The question of ${subject} has attracted considerable public attention. Some people argue that current policies and individual choices should remain unchanged, whereas others believe that a different approach is needed. In my view, the most convincing position is one that recognises the practical benefits of change while controlling its possible costs.\n\nThe first important consideration is the effect on individuals and communities. A well-designed approach can improve access, increase awareness and encourage people to make more informed decisions. For example, when institutions provide clear information and affordable alternatives, people are more likely to adopt responsible behaviour rather than simply follow short-term convenience. This can create benefits that extend beyond the original issue.\n\nNevertheless, the opposing concerns should not be dismissed. Rapid or poorly regulated change may create inequality, financial pressure or unintended consequences for groups with fewer resources. This is why governments, schools and employers should set realistic standards, provide support during the transition and review the results regularly. Such measures can preserve the main benefits while preventing the most serious disadvantages.\n\nOverall, ${subject} should be approached through balanced and evidence-based decisions. Although no single policy will satisfy everyone, practical safeguards and long-term planning can make this development more beneficial for society as a whole.`
}

let filled = 0
for (const task of tasks) {
  if (task.taskType !== 'task2' || task.guideHtml) continue
  const template = templates[task.genre] ?? templates.other
  const bullets = template.outline.map(item => `<li>${esc(item)}</li>`).join('')
  const phrases = template.phrases.map(item => `<li><code>${esc(item)}</code></li>`).join('')
  const html = [
    `<h2>${esc(task.title)}</h2>`,
    `<p><strong>Task type:</strong> IELTS Writing Task 2 · ${esc(task.genre)}</p>`,
    `<h3>How to approach this question</h3><p>${esc(template.summary)}</p>`,
    `<h3>Suggested outline</h3><ol>${bullets}</ol>`,
    `<h3>Useful language</h3><ul>${phrases}</ul>`,
    `<h3>Thesis direction</h3><p>${esc(template.thesis)}</p>`,
    `<h3>Model answer</h3><p>${esc(sample(task, template)).replace(/\n\n/g, '</p><p>')}</p>`,
  ].join('')
  task.guideHtml = html
  filled++
}

writeFileSync(file, JSON.stringify(tasks))
console.log(`Filled ${filled} Task 2 guides with static templates.`)
