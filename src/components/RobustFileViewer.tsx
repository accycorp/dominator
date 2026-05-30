import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure matching ESM worker source
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '5.7.284'}/build/pdf.worker.min.mjs`;
}

interface RobustFileViewerProps {
  supabaseUrl: string;
  fileName?: string;
  hideFullscreen?: boolean;
}

export const RobustFileViewer: React.FC<RobustFileViewerProps> = ({
  supabaseUrl,
  fileName = "Document",
  hideFullscreen = false
}) => {
  const [pdf, setPdf] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.25);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isObscured, setIsObscured] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  const studentEmail = "yohannesgetahun11@gmail.com";

  // --- High-Privilege Anti-DevTools, Anti-Grab Protection ---
  useEffect(() => {
    // Override canvas protocol to prevent programmatic image dumping
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    const originalToBlob = HTMLCanvasElement.prototype.toBlob;

    HTMLCanvasElement.prototype.toDataURL = function() {
      console.warn("🔐 High-Privilege Security Shield: Programmatic canvas export is blocked.");
      return "";
    };

    HTMLCanvasElement.prototype.toBlob = function(callback, type, encoderOptions) {
      console.warn("🔐 High-Privilege Security Shield: Programmatic canvas export is blocked.");
      if (callback) callback(null);
    };

    // Continuous debugger statement loop to halt DevTools execution contexts
    const debuggerLoop = () => {
      const start = Date.now();
      debugger;
      const end = Date.now();
      if (end - start > 100) {
        setIsObscured(true);
      }
    };
    const dbgInterval = setInterval(debuggerLoop, 800);

    // Prevent direct F12/Inspect shortcuts
    const handleKeyIntercept = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'U' || e.key === 'u'))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', handleKeyIntercept, true);

    return () => {
      HTMLCanvasElement.prototype.toDataURL = originalToDataURL;
      HTMLCanvasElement.prototype.toBlob = originalToBlob;
      clearInterval(dbgInterval);
      window.removeEventListener('keydown', handleKeyIntercept, true);
    };
  }, []);

  // --- Dynamic Window Focus/Blur Obscuring Protection ---
  useEffect(() => {
    const handleBlur = () => setIsObscured(true);
    const handleFocus = () => setIsObscured(false);
    const handleVisibility = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        setIsObscured(true);
      } else {
        setIsObscured(false);
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // --- Secure Backend PDF Loading ---
  useEffect(() => {
    if (!supabaseUrl) return;

    const loadDocument = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        // Fetch via secure backend proxy
        const secureProxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(supabaseUrl)}`;
        const response = await fetch(secureProxyUrl);
        if (!response.ok) {
          throw new Error(`Failed to load target PDF. Server responded with status: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        
        // Load using PDF.js
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const loadedPdf = await loadingTask.promise;
        
        setPdf(loadedPdf);
        setNumPages(loadedPdf.numPages);
        setCurrentPage(1);
      } catch (err: any) {
        console.error("Secure PDF Rendering Error:", err);
        setErrorMsg("An error occurred during secure decryption/preparation of this document.");
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [supabaseUrl]);

  // --- Draw Forensic Watermark Onto Canvas Context ---
  const drawWatermarkOnContext = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    // Dynamic Forensic Watermark settings
    ctx.globalAlpha = 0.07; // subtle and non-intrusive but highly legible
    ctx.font = 'bold 20px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#ef4444'; // strong forensic red
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const angle = -40 * Math.PI / 180;
    
    // Grid alignment parameters for watermarking (auto-scales with window size)
    const spacingX = 240;
    const spacingY = 160;
    const limit = Math.max(canvas.width, canvas.height) * 2;

    const stampText = `DOMINATOR SECURE ACADEMY - STUDENT ID: ${studentEmail}`;

    for (let x = -limit; x < limit; x += spacingX) {
      for (let y = -limit; y < limit; y += spacingY) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillText(stampText, 0, 0);
        ctx.restore();
      }
    }
    ctx.restore();
  };

  // --- Core HTML5 Canvas Page Rendering Loop ---
  useEffect(() => {
    if (!pdf) return;

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // Ensure canvas width matches target screen scale correctly
        const viewport = page.getViewport({ scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Suppress overlapping render schedules
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;

        // Render forensic watermark pixel-data directly on top of decrypted text
        drawWatermarkOnContext(canvas);
      } catch (err: any) {
        if (err.name === 'RenderingCancelledException' || err.message?.includes('cancelled')) {
          // Normal flow for dynamic scrolling/page adjustments
        } else {
          console.error("Visual render task error:", err);
        }
      }
    };

    renderPage();
  }, [pdf, currentPage, scale]);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, numPages));
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 2.5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.75));
  };

  return (
    <div 
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      className="w-full h-full flex flex-col border border-white/5 rounded-xl overflow-hidden bg-charcoal-900 shadow-xl relative select-none"
    >
      {/* Upper Protective Reader Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-charcoal-950 border-b border-white/5 z-20">
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider select-none">
            🔒 Protected Reader Mode
          </span>
          <span className="font-medium text-xs text-slate-300 truncate max-w-[200px] select-none">
            {fileName}
          </span>
        </div>

        {pdf && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 0.75}
              className="px-2 py-1 bg-white/5 text-slate-300 hover:bg-white/10 disabled:opacity-40 rounded text-xs transition"
              title="Zoom Out"
            >
              ➖
            </button>
            <span className="text-xs text-slate-400 px-1 font-mono">{Math.round(scale * 100)}%</span>
            <button
              onClick={handleZoomIn}
              disabled={scale >= 2.5}
              className="px-2 py-1 bg-white/5 text-slate-300 hover:bg-white/10 disabled:opacity-40 rounded text-xs transition"
              title="Zoom In"
            >
              ➕
            </button>
          </div>
        )}
      </div>

      {/* Main Secure Canvas Shell */}
      <div className="relative w-full flex-1 bg-charcoal-950 min-h-[550px] overflow-auto flex items-center justify-center p-4">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-charcoal-950/90 z-20 text-sm text-slate-400 select-none">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold-500 mb-3"></div>
            Decrypting custom document assets securely...
          </div>
        )}

        {errorMsg && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-charcoal-950/90 p-6 text-center text-rose-400 select-none">
            <span className="text-3xl mb-2">⚠️</span>
            <p className="text-sm font-semibold max-w-sm">{errorMsg}</p>
          </div>
        )}

        {/* Print Only Warning CSS Element */}
        <div className="hidden print-only-warning">
          🚫 Dominator Content Protected. This premium document is secured under forensic watermarking.
        </div>

        {/* Canvas Display Port */}
        {pdf && (
          <div className={`relative transition-all duration-300 ${isObscured ? "filter blur-3xl opacity-5 select-none pointer-events-none" : ""}`}>
            {/* HTML Forensic Watermark Grid Layer Overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-10 opacity-20">
              <div className="absolute inset-0 rotate-[-40deg] scale-125 grid grid-cols-3 gap-y-36 text-center">
                {Array.from({ length: 42 }).map((_, i) => (
                  <div key={i} className="text-[11px] font-bold text-red-500 select-none whitespace-nowrap tracking-wider">
                    {studentEmail}
                  </div>
                ))}
              </div>
            </div>

            {/* Standard Canvas Element */}
            <canvas
              ref={canvasRef}
              className="shadow-2xl border border-white/5 bg-slate-900 max-w-full block"
            />
          </div>
        )}

        {/* Silent obsecuring block when focused away */}
        {isObscured && pdf && (
          <div className="absolute inset-0 backdrop-blur-2xl bg-charcoal-950/95 flex flex-col items-center justify-center p-4 text-slate-400 select-none z-30 pointer-events-none">
            <span className="text-2xl mb-1 text-gold-500/80">🔐</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 font-mono">Obscure protection active</span>
          </div>
        )}
      </div>

      {/* Secure Navigation Control Panel */}
      {pdf && !loading && (
        <div className="flex items-center justify-between px-4 py-3 bg-charcoal-950 border-t border-white/5 z-20">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 bg-white/5 text-slate-100 hover:bg-white/10 disabled:opacity-30 rounded-lg text-xs font-semibold transition select-none"
          >
            ◀ Previous Page
          </button>

          <span className="text-xs text-slate-400 font-semibold font-mono select-none">
            Page {currentPage} of {numPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= numPages}
            className="px-3 py-1.5 bg-white/5 text-slate-100 hover:bg-white/10 disabled:opacity-30 rounded-lg text-xs font-semibold transition select-none"
          >
            Next Page ▶
          </button>
        </div>
      )}
    </div>
  );
};
