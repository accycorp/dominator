import React, { useState, useEffect } from 'react';

interface RobustFileViewerProps {
  supabaseUrl: string;
  fileName?: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        openLink: (url: string) => void;
      };
    };
  }
}

export const RobustFileViewer: React.FC<RobustFileViewerProps> = ({ supabaseUrl, fileName = "Document" }) => {
  const [viewerUrl, setViewerUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!supabaseUrl) return;

    // 1. Force the URL to treat the file as a viewable item, not an attachment
    let cleanUrl = supabaseUrl;
    if (cleanUrl.includes('response-content-disposition=attachment')) {
      cleanUrl = cleanUrl.replace('response-content-disposition=attachment', 'response-content-disposition=inline');
    }

    // 2. Properly double-encode the tokenized Supabase URL for Google's API
    const encodedSupabaseUrl = encodeURIComponent(cleanUrl);

    // 3. Inject cache-busting & a retry trigger to break Google's 204/Throttling bugs
    const googleViewer = `https://docs.google.com/gview?url=${encodedSupabaseUrl}&embedded=true&cb=${Date.now()}_${retryCount}`;
    
    setViewerUrl(googleViewer);
    setLoading(true);
  }, [supabaseUrl, retryCount]);

  // Fallback handler if the Telegram client forces an external view
  const handleFallbackOpen = () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openLink(supabaseUrl);
    } else {
      window.open(supabaseUrl, '_blank');
    }
  };

  return (
    <div className="w-full h-full flex flex-col border border-white/5 rounded-xl overflow-hidden bg-charcoal-900 shadow-sm">
      {/* Header Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-charcoal-950 border-b border-white/5 text-[10px] text-slate-500">
        <span className="font-medium truncate max-w-[180px] uppercase tracking-widest">{fileName}</span>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => setRetryCount(prev => prev + 1)}
            className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded font-semibold transition text-slate-300"
          >
            🔄 Reload Frame
          </button>
          <button 
            type="button"
            onClick={handleFallbackOpen}
            className="px-2 py-1 bg-gold-600 text-white rounded font-semibold hover:bg-gold-700 transition"
          >
            ↗️ Open Fullscreen
          </button>
        </div>
      </div>

      {/* Main Iframe Shell */}
      <div className="relative w-full flex-1 bg-charcoal-900 min-h-[500px]">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-charcoal-900 z-10 text-sm text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500 mb-2"></div>
            Loading document securely...
          </div>
        )}
        
        {viewerUrl && (
          <iframe
            src={viewerUrl}
            className="w-full h-full min-h-[500px] border-none"
            onLoad={() => setLoading(false)}
            loading="lazy"
            title="Secure File Viewer"
          />
        )}
      </div>
    </div>
  );
};
