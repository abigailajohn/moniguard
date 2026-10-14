import jsQR from 'jsqr'

function frameToCode(source, w, h, maxSide = 1000) {
  const scale = Math.min(1, maxSide / Math.max(w, h))
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(w * scale))
  c.height = Math.max(1, Math.round(h * scale))
  const g = c.getContext('2d', { willReadFrequently: true })
  g.drawImage(source, 0, 0, c.width, c.height)
  const d = g.getImageData(0, 0, c.width, c.height)
  const code = jsQR(d.data, d.width, d.height, { inversionAttempts: 'attemptBoth' })
  return code?.data || null
}

// Decode a QR code from an uploaded photo or screenshot. Tries a few sizes,
// because small codes in big photos are easier to find at higher resolution.
export async function decodeQrFile(file) {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    for (const size of [800, 1400, 2200]) {
      const v = frameToCode(img, img.naturalWidth, img.naturalHeight, size)
      if (v) return v
    }
    return null
  } finally {
    URL.revokeObjectURL(url)
  }
}

// Read one frame from a playing <video> element.
export const decodeQrVideo = (video) => (video.videoWidth ? frameToCode(video, video.videoWidth, video.videoHeight, 720) : null)
