import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Maximize2,
  RefreshCw, AlertCircle, FileText, Loader2, Image as ImageIcon
} from 'lucide-react';

let pdfjsLib = null;
let loadPromise = null;

async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const lib = await import('pdfjs-dist');
      if (lib.GlobalWorkerOptions) {
        lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${lib.version || '4.0.379'}/pdf.worker.min.mjs`;
      }
      pdfjsLib = lib;
      return lib;
    } catch (err) {
      if (typeof window !== 'undefined' && window.pdfjsLib) {
        pdfjsLib = window.pdfjsLib;
        return window.pdfjsLib;
      }
      throw err;
    }
  })();

  return loadPromise;
}

/**
 * High-Performance Visual Document Viewer Component
 * Supports PDF Canvas Rendering, High-Res Image Previews, and Clean Text Layout Fallback.
 */
export function PdfDocumentViewer({ file, fileData, rawText, fileName = 'resume.pdf' }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [pdfDoc, setPdfDoc] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [numPages, setNumPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomScale, setZoomScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [renderError, setRenderError] = useState('');
  const [pageRendering, setPageRendering] = useState(false);

  // Load Document (PDF or Image)
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setRenderError('');
    setPdfDoc(null);
    setImagePreviewUrl(null);
    setZoomScale(1.0);
    setCurrentPage(1);

    const initDoc = async () => {

      try {
        // 1. Check if fileData is an Image Data URL (e.g. from generated thumbnail)
        if (typeof fileData === 'string' && fileData.startsWith('data:image/')) {
          if (!active) return;
          setImagePreviewUrl(fileData);
          setNumPages(1);
          setCurrentPage(1);
          setIsLoading(false);
          return;
        }

        // 2. Check if file is a PDF
        let sourceData = null;
        const isPdfFile = (file instanceof File || file instanceof Blob) && (file.type?.includes('pdf') || file.name?.endsWith('.pdf'));
        const isPdfData = typeof fileData === 'string' && (fileData.startsWith('data:application/pdf') || fileData.startsWith('JVBERi0')); // PDF Base64 magic bytes

        if (file instanceof File || file instanceof Blob) {
          sourceData = await file.arrayBuffer();
        } else if (fileData instanceof ArrayBuffer || fileData instanceof Uint8Array) {
          sourceData = fileData;
        } else if (isPdfData) {
          const base64 = fileData.includes(',') ? fileData.split(',')[1] : fileData;
          const binaryStr = atob(base64);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          sourceData = bytes.buffer;
        }

        if (!sourceData) {
          // If no PDF binary is provided, fallback to visual thumbnail or text representation
          if (typeof fileData === 'string' && fileData.length > 50) {
            setImagePreviewUrl(fileData);
          }
          setIsLoading(false);
          return;
        }

        const lib = await loadPdfJs();
        const loadingTask = lib.getDocument({ data: sourceData });
        const doc = await loadingTask.promise;

        if (!active) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages || 1);
        setCurrentPage(1);
        setIsLoading(false);
      } catch (err) {
        console.warn('[PdfDocumentViewer] Document Load Warning:', err.message);
        if (active) {
          // If PDF parse fails, check if we can show image preview or clean text
          if (typeof fileData === 'string' && (fileData.startsWith('data:image/') || fileData.startsWith('http'))) {
            setImagePreviewUrl(fileData);
          }
          setIsLoading(false);
        }
      }
    };

    initDoc();

    return () => {
      active = false;
    };
  }, [file, fileData]);

  // Render Current Page to Canvas (if PDF)
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    let renderTask = null;
    let cancelled = false;

    const renderPage = async () => {
      try {
        setPageRendering(true);
        const page = await pdfDoc.getPage(currentPage);
        if (cancelled) return;

        const viewport = page.getViewport({ scale: zoomScale });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        const outputScale = window.devicePixelRatio || 1;

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + 'px';
        canvas.style.height = Math.floor(viewport.height) + 'px';

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

        const renderContext = {
          canvasContext: context,
          transform,
          viewport
        };

        renderTask = page.render(renderContext);
        await renderTask.promise;
        if (!cancelled) setPageRendering(false);
      } catch (err) {
        if (err.name !== 'RenderingCancelledException') {
          console.warn('[PdfDocumentViewer] Page Render Warning:', err);
        }
        if (!cancelled) setPageRendering(false);
      }
    };

    renderPage();

    return () => {
      cancelled = true;
      if (renderTask && renderTask.cancel) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, currentPage, zoomScale]);

  // Download Handler
  const handleDownload = () => {
    if (file instanceof File || file instanceof Blob) {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (typeof fileData === 'string' && fileData.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = fileData;
      a.download = fileName || (fileData.startsWith('data:image') ? 'resume_preview.png' : 'resume.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Plain text fallback download
      const blob = new Blob([rawText || ''], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (fileName || 'resume').replace(/\.pdf$/i, '.txt');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
      {/* Top Toolbar */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-300 select-none">
        {/* Page Navigation */}
        <div className="flex items-center gap-1.5">
          <button
            disabled={currentPage <= 1 || isLoading || !pdfDoc}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-bold text-[11px] px-2 text-slate-200">
            Page {currentPage} / {numPages}
          </span>

          <button
            disabled={currentPage >= numPages || isLoading || !pdfDoc}
            onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
            className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom & Actions */}
        <div className="flex items-center gap-2">
          <button
            disabled={zoomScale <= 0.6 || isLoading}
            onClick={() => setZoomScale((z) => Math.max(0.6, z - 0.2))}
            className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="font-semibold text-[11px] text-slate-400 min-w-[3rem] text-center">
            {Math.round(zoomScale * 100)}%
          </span>

          <button
            disabled={zoomScale >= 2.4 || isLoading}
            onClick={() => setZoomScale((z) => Math.min(2.4, z + 0.2))}
            className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setZoomScale(1.0)}
            className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-[10px] font-bold"
            title="Reset Zoom"
          >
            100%
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            onClick={handleDownload}
            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition-colors"
            title="Download Original Resume File"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </div>

      {/* Main Canvas / Visual Viewer Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 sm:p-6 flex items-start justify-center bg-slate-900/90 relative min-h-[500px]"
      >
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 text-indigo-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-bold text-slate-300">Rendering high-resolution document preview...</span>
          </div>
        )}

        {pdfDoc ? (
          <div
            className="relative shadow-2xl rounded-sm bg-white overflow-hidden transition-transform"
            style={{ transform: `scale(${zoomScale})`, transformOrigin: 'top center' }}
          >
            <canvas ref={canvasRef} className="block max-w-full h-auto" />
            {pageRendering && (
              <div className="absolute top-3 right-3 px-2 py-1 rounded bg-slate-900/70 text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Rendering...
              </div>
            )}
          </div>
        ) : imagePreviewUrl ? (
          /* High-Resolution Document Canvas Image Preview */
          <div
            className="relative shadow-2xl rounded-md bg-white overflow-hidden transition-transform max-w-full"
            style={{ transform: `scale(${zoomScale})`, transformOrigin: 'top center' }}
          >
            <img
              src={imagePreviewUrl}
              alt={fileName}
              className="block max-w-full h-auto object-contain rounded-md"
            />
          </div>
        ) : (
          /* Structured Document Preview Fallback */
          <div className="w-full max-w-2xl bg-white rounded-xl p-8 shadow-2xl text-slate-900 text-xs font-sans leading-relaxed whitespace-pre-wrap select-text border border-slate-200">
            <div className="pb-3 mb-4 border-b border-slate-200 flex items-center justify-between text-slate-400 text-[11px]">
              <span className="font-bold flex items-center gap-1 text-slate-700">
                <FileText className="w-4 h-4 text-indigo-600" />
                {fileName}
              </span>
              <span>Document Text Presentation</span>
            </div>
            {rawText || 'No resume content available.'}
          </div>
        )}
      </div>
    </div>
  );
}

export default PdfDocumentViewer;
