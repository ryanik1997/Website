import fs from 'node:fs/promises'

const source = 'Tainguyen/Import Cambridge/KET_A2/Reading/KET A2_Cam 1/Test 1/cam1-ket-reading-test1.zip/exam.json'
const exam = JSON.parse(await fs.readFile(source, 'utf8'))
exam.id = 'catalog-ket-cam1-test1'
exam.catalogSlug = 'ket-a2-cam1-test1'
exam.catalogBase = '/catalog/reading/ket-a2-cam1-test1'
exam.title = 'KET A2 Reading — Cambridge 1 Test 1'
await fs.writeFile('packages/catalog/data/reading-ket-a2-cam1-test1.json', `${JSON.stringify(exam, null, 2)}\n`)
console.log(`Imported ${exam.id}`)
