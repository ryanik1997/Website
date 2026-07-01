import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = pdfWorker

/** Trích text từ PDF — full Reading test thường ~12–16 trang. */
export async function extractTextFromPdf(file: File, maxPages = 28): Promise<string> {
  const data = await file.arrayBuffer()
  const pdf = await getDocument({ data }).promise
  const pageCount = Math.min(pdf.numPages, maxPages)
  const chunks: string[] = []

  for (let pageNum = 1; pageNum <= pageCount; pageNum += 1) {
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()
    const pageText = content.items
      .map(item => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (pageText) chunks.push(pageText)
  }

  return chunks.join('\n\n')
}