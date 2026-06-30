// jspdf + html2canvas are loaded lazily inside generateContractLetterPdfFile
// so their ~1.2MB weight is not part of the initial page load

// html2canvas can produce duplicated/glitched output when the captured element
// sits inside a scrolled or overflow-constrained ancestor (e.g. a modal body
// with overflow-y: auto). Temporarily neutralize those constraints so the
// capture sees the element's full natural-flow content, then restore them.
const withUnscrolledAncestors = async (element, fn) => {
  const overrides = []
  let node = element.parentElement
  while (node) {
    const style = window.getComputedStyle(node)
    const isScrollable = ['auto', 'scroll'].includes(style.overflowY) || ['auto', 'scroll'].includes(style.overflow)
    if (isScrollable && node.scrollHeight > node.clientHeight) {
      overrides.push({
        node,
        overflow: node.style.overflow,
        maxHeight: node.style.maxHeight,
        scrollTop: node.scrollTop,
      })
      node.style.overflow = 'visible'
      node.style.maxHeight = 'none'
      node.scrollTop = 0
    }
    node = node.parentElement
  }

  try {
    return await fn()
  } finally {
    overrides.forEach(({ node, overflow, maxHeight, scrollTop }) => {
      node.style.overflow = overflow
      node.style.maxHeight = maxHeight
      node.scrollTop = scrollTop
    })
  }
}

// Crops a horizontal band [srcYPx, srcYPx + srcHeightPx) out of the master canvas
// into its own canvas, so each PDF page gets a distinct image instead of the same
// full-height image repositioned (which can render inconsistently across viewers).
const cropCanvasBand = (masterCanvas, srcYPx, srcHeightPx) => {
  const band = document.createElement('canvas')
  band.width = masterCanvas.width
  band.height = Math.max(1, Math.round(srcHeightPx))
  const ctx = band.getContext('2d')
  ctx.drawImage(masterCanvas, 0, srcYPx, masterCanvas.width, srcHeightPx, 0, 0, band.width, band.height)
  return band
}

// Captures a rendered contract letter DOM element into a multi-page A4 PDF File,
// matching ECEWS letter margins (15mm). Used both when HR generates a letter and
// when staff sign it, so the resulting PDF layout stays consistent either way.
// Elements marked with [data-no-split] (e.g. the signature block) are kept whole
// on a single page rather than being sliced across a page break.
export const generateContractLetterPdfFile = async (element, fileName) => {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const pdfWidth = 210
  const pdfHeight = 297
  const margin = 15
  const contentWidthMm = pdfWidth - margin * 2
  const contentHeightMaxMm = pdfHeight - margin * 2

  const canvas = await withUnscrolledAncestors(element, () =>
    html2canvas(element, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowHeight: element.scrollHeight,
    }),
  )

  const cssPxToMm = contentWidthMm / element.scrollWidth
  const totalHeightMm = element.scrollHeight * cssPxToMm
  const canvasPxPerMm = canvas.height / totalHeightMm

  const elementRect = element.getBoundingClientRect()
  const noSplitRangesMm = Array.from(element.querySelectorAll('[data-no-split]')).map((node) => {
    const rect = node.getBoundingClientRect()
    return {
      startMm: (rect.top - elementRect.top) * cssPxToMm,
      endMm: (rect.bottom - elementRect.top) * cssPxToMm,
    }
  })

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })

  let sliceStartMm = 0
  let pageIndex = 0
  while (sliceStartMm < totalHeightMm - 0.01) {
    let sliceEndMm = Math.min(sliceStartMm + contentHeightMaxMm, totalHeightMm)

    // If a protected block straddles this boundary, end the page right before it instead.
    const straddling = noSplitRangesMm.find(
      (r) => r.startMm > sliceStartMm + 0.01 && r.startMm < sliceEndMm && r.endMm > sliceEndMm,
    )
    if (straddling) {
      sliceEndMm = straddling.startMm
    }

    const sliceHeightMm = sliceEndMm - sliceStartMm
    const band = cropCanvasBand(canvas, sliceStartMm * canvasPxPerMm, sliceHeightMm * canvasPxPerMm)
    const bandData = band.toDataURL('image/png')

    if (pageIndex > 0) pdf.addPage()
    pdf.addImage(bandData, 'PNG', margin, margin, contentWidthMm, sliceHeightMm)

    sliceStartMm = sliceEndMm
    pageIndex++
  }

  const pdfBlob = pdf.output('blob')
  return new File([pdfBlob], fileName, { type: 'application/pdf' })
}
