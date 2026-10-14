// Turns an uploaded file into something the checker can use.
// Images are shrunk in the browser (smaller upload, cheaper AI call).
// PDFs and text files also get their text pulled out here, so they still work
// with rule-based checks if the AI layer is off.

export const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,application/pdf,text/plain,.txt,.eml'
const MAX_FILE = 3 * 1024 * 1024
const MAX_IMAGE_IN = 15 * 1024 * 1024

const toB64 = (buf) => {
  let s = ''
  const bytes = new Uint8Array(buf)
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000))
  return btoa(s)
}

async function loadImage(file) {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return img
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}

function drawScaled(img, maxSide) {
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(img.naturalWidth * scale))
  c.height = Math.max(1, Math.round(img.naturalHeight * scale))
  const g = c.getContext('2d')
  g.fillStyle = '#fff'
  g.fillRect(0, 0, c.width, c.height)
  g.drawImage(img, 0, 0, c.width, c.height)
  return c
}

async function pdfText(buf) {
  try {
    const pdfjs = await import('pdfjs-dist')
    const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default
    const doc = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise
    const out = []
    for (let p = 1; p <= Math.min(doc.numPages, 5); p++) {
      const page = await doc.getPage(p)
      const tc = await page.getTextContent()
      let line = ''
      for (const it of tc.items) { line += it.str; line += it.hasEOL ? '\n' : ' ' }
      out.push(line)
    }
    return out.join('\n').replace(/[^\S\n]+/g, ' ').trim().slice(0, 5000)
  } catch (e) {
    console.warn('PDF text extraction failed', e)
    return ''
  }
}

const userError = (msg) => Object.assign(new Error(msg), { user: true })

// Returns { name, kind: 'image'|'pdf'|'text', text, file?: {mediaType, data}, thumb? }
export async function prepareFile(file) {
  const name = file.name || 'file'
  const isText = file.type.startsWith('text/') || /\.(txt|eml)$/i.test(name)
  if (isText) {
    if (file.size > 200 * 1024) throw userError('That text file is too large.')
    const text = (await file.text()).slice(0, 5000)
    if (!text.trim()) throw userError('That file is empty.')
    return { name, kind: 'text', text }
  }
  if (file.type === 'application/pdf' || /\.pdf$/i.test(name)) {
    if (file.size > MAX_FILE) throw userError('That PDF is too large. Keep it under 3 MB.')
    const buf = await file.arrayBuffer()
    const text = await pdfText(buf.slice(0))
    return { name, kind: 'pdf', text, file: { mediaType: 'application/pdf', data: toB64(buf) } }
  }
  if (file.type.startsWith('image/')) {
    if (file.size > MAX_IMAGE_IN) throw userError('That image is too large.')
    let img
    try { img = await loadImage(file) } catch { throw userError('We could not open that image. Try a PNG or JPG.') }
    const big = drawScaled(img, 1568).toDataURL('image/jpeg', 0.85)
    const thumb = drawScaled(img, 160).toDataURL('image/jpeg', 0.7)
    return { name, kind: 'image', text: '', file: { mediaType: 'image/jpeg', data: big.split(',')[1] }, thumb }
  }
  throw userError('That file type is not supported. Use a screenshot, photo, PDF or .txt file.')
}
