const task = await useOrCreateTaskSpace('inspect inspera C1 reading')
cliLog('task space id: ' + task.id)

await openOrReuseTab('https://ceq.inspera.com/player/?assessmentRunId=160272499&context=exam#/section/8673155978802/question/160270339/scorableItem/1/skipScroll', { wait: true, timeout: 20 })

await wait(3)
const info = await pageInfo()
cliLog('Page URL: ' + info.url)
cliLog('Page Title: ' + info.title)
cliLog('Page Size: ' + info.w + 'x' + info.h)

const text = await snapshotText()
cliLog('SNAPSHOT (first 3000 chars):')
cliLog(text.substring(0, 3000))