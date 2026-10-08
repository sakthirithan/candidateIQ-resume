/**
 * Client-side PDF & Document Processing Service for CandidateIQ
 * Performs browser-side text extraction, page-1 image/thumbnail generation,
 * and multi-format document handling (.pdf, .docx, .txt).
 */

let pdfjsLib = null;
let loadPromise = null;

async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      // Dynamic import of pdfjs-dist
      const lib = await import('pdfjs-dist');
      // Set worker source to CDN or local bundled worker
      if (lib.GlobalWorkerOptions) {
        lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${lib.version || '4.0.379'}/pdf.worker.min.mjs`;
      }
      pdfjsLib = lib;
      return lib;
    } catch (err) {
      console.warn('[pdfService] Could not dynamically load pdfjs-dist via module, attempting fallback:', err);
      // Fallback to window.pdfjsLib if loaded via script tag or legacy
      if (typeof window !== 'undefined' && window.pdfjsLib) {
        pdfjsLib = window.pdfjsLib;
        return window.pdfjsLib;
      }
      throw new Error(`Failed to initialize PDF.js library: ${err.message}`);
    }
  })();

  return loadPromise;
}

/**
 * Clean & normalize extracted raw text
 */
export function normalizeDocumentText(text) {
  if (!text) return '';
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

/**
 * Extracts text from PDF page by page with vertical coordinate tracking for line preservation
 */
export async function extractPdfTextAndPages(file) {
  try {
    const lib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = lib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    const pages = [];
    let fullText = '';

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageStrings = [];
      let lastY = null;

      for (const item of textContent.items) {
        if (!item.str) continue;
        const currentY = item.transform ? item.transform[5] : null;
        if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
          pageStrings.push('\n');
        }
        pageStrings.push(item.str);
        lastY = currentY;
      }

      const pageText = normalizeDocumentText(pageStrings.join(' '));
      pages.push({
        pageNumber: i,
        extractedText: pageText
      });
      fullText += pageText + '\n\n';
    }

    return {
      success: true,
      text: normalizeDocumentText(fullText),
      pageCount: numPages,
      pages
    };
  } catch (err) {
    console.error('[pdfService] PDF Extraction Error:', err);
    return {
      success: false,
      text: '',
      pageCount: 1,
      pages: [],
      error: err.message || 'Failed to extract text from PDF document.'
    };
  }
}

/**
 * Extracts text from DOCX file in browser by reading word/document.xml
 */
export async function extractDocxText(file) {
  try {
    const buffer = await file.arrayBuffer();
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const rawContent = decoder.decode(buffer);

    const textMatches = rawContent.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
    if (textMatches && textMatches.length > 0) {
      const extracted = textMatches.map((m) => m.replace(/<[^>]+>/g, '')).join(' ');
      const clean = normalizeDocumentText(extracted);
      return {
        success: true,
        text: clean,
        pageCount: 1,
        pages: [{ pageNumber: 1, extractedText: clean }]
      };
    }
  } catch (err) {
    console.warn('[pdfService] DOCX extraction error:', err);
  }
  return {
    success: false,
    text: '',
    pageCount: 1,
    pages: [],
    error: 'Could not extract text from DOCX document.'
  };
}

/**
 * Extracts text from plain text file
 */
export async function extractTxtText(file) {
  try {
    const text = await file.text();
    const clean = normalizeDocumentText(text);
    return {
      success: true,
      text: clean,
      pageCount: 1,
      pages: [{ pageNumber: 1, extractedText: clean }]
    };
  } catch (err) {
    return {
      success: false,
      text: '',
      pageCount: 1,
      pages: [],
      error: 'Could not read plain text file.'
    };
  }
}

/**
 * High-resolution Page-1 Thumbnail & Preview image generator
 */
export async function generatePdfThumbnail(file, scale = 2.0) {
  try {
    const lib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = lib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (context) {
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
    }

    await page.render({ canvasContext: context, viewport }).promise;

    const dataUrl = canvas.toDataURL('image/png', 0.95);
    return {
      success: true,
      thumbnailUrl: dataUrl,
      width: viewport.width,
      height: viewport.height
    };
  } catch (err) {
    console.warn('[pdfService] PDF Thumbnail Generation Error:', err);
    return {
      success: false,
      thumbnailUrl: null,
      error: err.message
    };
  }
}

/**
 * Main unified extraction method for all supported resume formats
 */
export async function extractResumeDocument(file) {
  const startTime = Date.now();
  const fileName = file?.name || '';
  const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
  const mimeType = file?.type?.toLowerCase() || '';

  if (!file || file.size === 0) {
    return {
      success: false,
      status: 'EMPTY_FILE',
      extractedText: '',
      characterCount: 0,
      pageCount: 0,
      durationMs: Date.now() - startTime,
      error: 'The uploaded file is empty (0 bytes).'
    };
  }

  let result = null;
  let method = 'NONE';

  if (fileExt === 'pdf' || mimeType.includes('pdf')) {
    method = 'PDF_TEXT';
    result = await extractPdfTextAndPages(file);
  } else if (fileExt === 'docx' || mimeType.includes('wordprocessingml')) {
    method = 'DOCX_TEXT';
    result = await extractDocxText(file);
  } else if (fileExt === 'txt' || mimeType.includes('text/plain')) {
    method = 'TXT_TEXT';
    result = await extractTxtText(file);
  } else {
    return {
      success: false,
      status: 'UNSUPPORTED_FORMAT',
      extractedText: '',
      characterCount: 0,
      pageCount: 0,
      durationMs: Date.now() - startTime,
      error: `Unsupported file format (.${fileExt}). Please upload a PDF, DOCX, or TXT resume.`
    };
  }

  const durationMs = Date.now() - startTime;
  const extractedText = result?.text || '';

  if (result.success && extractedText.length >= 30) {
    return {
      success: true,
      status: 'SUCCESS',
      extractedText,
      characterCount: extractedText.length,
      pageCount: result.pageCount || 1,
      pages: result.pages || [],
      method,
      durationMs
    };
  }

  return {
    success: false,
    status: 'TEXT_EXTRACTION_FAILED',
    extractedText: '',
    characterCount: extractedText.length,
    pageCount: result.pageCount || 1,
    pages: [],
    method,
    durationMs,
    error: 'Could not extract readable text layer. Document might be a scanned image or protected.'
  };
}
