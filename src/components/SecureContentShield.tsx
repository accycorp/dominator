import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, EyeOff, AlertTriangle, RefreshCw, Lock } from 'lucide-react';

interface SecureContentShieldProps {
  children: React.ReactNode;
  userEmail?: string;
  className?: string;
}

export const SecureContentShield: React.FC<SecureContentShieldProps> = ({
  children,
  userEmail = 'yohannesgetahun11@gmail.com',
  className = '',
}) => {
  const [isScreenBlurred, setIsScreenBlurred] = useState(false);
  const [securityToast, setSecurityToast] = useState<string | null>(null);
  const [telegramUser, setTelegramUser] = useState<{ username?: string; id?: number }>({});
  
  // Floating watermark position coordinates
  const [floatX, setFloatX] = useState(30);
  const [floatY, setFloatY] = useState(30);
  const dxRef = useRef(0.25); // Slow movement step X
  const dyRef = useRef(0.2);  // Slow movement step Y
  const requestRef = useRef<number | null>(null);

  // Parse Telegram WebApp Data safely
  useEffect(() => {
    try {
      const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
      if (tgUser) {
        setTelegramUser({
          username: tgUser.username || tgUser.first_name || 'DominatorStudent',
          id: tgUser.id,
        });
      }
    } catch {
      // Graceful fallback
    }
  }, []);

  // Determine displayed watermark labels
  const watermarkText = telegramUser.username 
    ? `@${telegramUser.username} [ID: ${telegramUser.id || 'N/A'}]`
    : userEmail;

  // 1. Dynamic Floating Watermark Engine (slowly drifts around screen in real-time)
  useEffect(() => {
    const updatePosition = () => {
      setFloatX((prevX) => {
        let nextX = prevX + dxRef.current;
        if (nextX <= 5 || nextX >= 85) {
          dxRef.current = -dxRef.current;
          nextX = prevX + dxRef.current;
        }
        return nextX;
      });

      setFloatY((prevY) => {
        let nextY = prevY + dyRef.current;
        if (nextY <= 5 || nextY >= 85) {
          dyRef.current = -dyRef.current;
          nextY = prevY + dyRef.current;
        }
        return nextY;
      });

      requestRef.current = requestAnimationFrame(updatePosition);
    };

    requestRef.current = requestAnimationFrame(updatePosition);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  // 2. Event Listeners for Page Visibility & Window focus/blur
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsScreenBlurred(true);
      } else {
        // Quick delay on recovery to ensure recording state/screencap overlay completes
        setTimeout(() => setIsScreenBlurred(false), 300);
      }
    };

    const handleWindowBlur = () => {
      setIsScreenBlurred(true);
    };

    const handleWindowFocus = () => {
      setTimeout(() => setIsScreenBlurred(false), 300);
    };

    // Keyboard controls blocking (Save, Print, Devtools)
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. PrintScreen key
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        showToast("Screenshots are restricted. Action logged.");
        setIsScreenBlurred(true);
        setTimeout(() => setIsScreenBlurred(false), 2000);
      }

      // 2. Control / Command combinations (e.g. Save, Print, View Source)
      const isMetaOrCtrl = e.ctrlKey || e.metaKey;
      if (isMetaOrCtrl) {
        const key = e.key.toLowerCase();
        
        // Block s/S (Save Webpage), p/P (Print Document), u/U (View Page Source)
        if (key === 's' || key === 'p' || key === 'u') {
          e.preventDefault();
          showToast(`Shortcut '${key.toUpperCase()}' blocked under study portal security rules.`);
          setIsScreenBlurred(true);
          setTimeout(() => setIsScreenBlurred(false), 1500);
        }
      }

      // 3. DevTools (F12, Command+Option+I etc.)
      if (e.key === 'F12' || (isMetaOrCtrl && e.shiftKey && e.key.toLowerCase() === 'i')) {
        e.preventDefault();
        showToast("Developer inspections are restricted inside the student app.");
      }
    };

    // Native right-click (context menu) and long press deterrent
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showToast("Right-click & contextual actions are disabled for content protection.");
    };

    // Mobile long press selection lockout
    const handleTouchStart = (e: TouchEvent) => {
      // Avoid locking up normal scrolling interactions, but lock select triggers
      if (e.touches.length > 1) {
        e.preventDefault(); // Prevents multi-touch zooming/capturing gestures
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('touchstart', handleTouchStart, { passive: false });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  const showToast = (message: string) => {
    setSecurityToast(message);
    setTimeout(() => {
      setSecurityToast((prev) => (prev === message ? null : prev));
    }, 4000);
  };

  return (
    <div className={`relative overflow-hidden w-full h-full select-none ${className}`} style={{ WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none' }}>
      
      {/* Dynamic Grid Background Forensic Watermarking */}
      <div className="absolute inset-0 pointer-events-none z-[40] grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 opacity-[0.035] overflow-hidden select-none">
        {Array.from({ length: 16 }).map((_, index) => (
          <div
            key={index}
            className="text-[10px] md:text-sm font-mono text-slate-300 font-bold whitespace-nowrap transform -rotate-[25deg] uppercase flex flex-col items-center justify-center p-4 border border-dashed border-white/5"
          >
            <div>DOMINATOR SECURITY</div>
            <div className="text-[8px] mt-1">{watermarkText}</div>
            <div className="text-[7px]">DO NOT LEAK</div>
          </div>
        ))}
      </div>

      {/* Floating Active Watermark (moves around the screen to combat video recorders) */}
      <div 
        className="absolute pointer-events-none z-[45] opacity-[0.06] select-none font-mono text-[9px] md:text-xs font-black text-gold-400 bg-gold-950/20 px-2.5 py-1 px-1.5 border border-gold-500/10 rounded-md tracking-wider uppercase whitespace-nowrap whitespace-no-wrap select-none"
        style={{
          left: `${floatX}%`,
          top: `${floatY}%`,
          transform: 'translate(-50%, -50%) rotate(-10deg)',
          transition: 'left 50ms linear, top 50ms linear',
        }}
      >
        🔒 DOMINATOR EDUCATION SECURITY FORCE • {watermarkText}
      </div>

      {/* Interactive content */}
      <div className="w-full h-full relative z-[10]">
        {children}
      </div>

      {/* Warning/Obfuscation Overlay under Print trigger */}
      <style>{`
        @media print {
          body, html, #root {
            display: none !important;
            opacity: 0 !important;
          }
          .print-block-warning {
            display: block !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: black !important;
            color: red !important;
            z-index: 999999 !important;
            text-align: center !important;
            padding-top: 200px !important;
            font-size: 24px !important;
            font-weight: bold !important;
          }
        }
      `}</style>
      <div className="hidden print-block-warning font-sans">
        🔒 CRITICAL WARNING: Printing of course material is strictly prohibited. Your account details have been flagged.
      </div>

      {/* Security Toast notifications using Motion */}
      <AnimatePresence>
        {securityToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] w-11/12 max-w-sm px-4"
          >
            <div className="bg-charcoal-900/90 backdrop-blur-md border border-gold-500/30 text-white rounded-xl shadow-2xl p-3.5 flex items-start gap-3">
              <div className="p-1.5 bg-gold-500/10 text-gold-400 rounded-lg shrink-0">
                <Shield size={16} className="animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gold-400 tracking-wider font-display uppercase">Active Security Agent</h4>
                <p className="text-[10px] text-slate-300 mt-0.5 leading-relaxed">{securityToast}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Focus Blur Screen Overlap */}
      <AnimatePresence>
        {isScreenBlurred && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-[90] bg-charcoal-950/85 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center select-none"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ delay: 0.05, duration: 0.2 }}
              className="max-w-xs w-full p-6 bg-charcoal-900 border border-gold-500/10 rounded-2xl shadow-2xl flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-full bg-gold-500/5 border border-gold-500/20 flex items-center justify-center text-gold-400 mb-3 animate-pulse">
                <EyeOff size={24} />
              </div>
              <h3 className="text-md font-bold text-white mb-1.5 font-display tracking-tight">Active Shielding</h3>
              <p className="text-slate-400 text-[10px] leading-relaxed mb-4">
                Content is hidden because focus was shifted from the app layout. Refocus the page to resume lessons.
              </p>
              <button 
                onClick={() => {
                  setIsScreenBlurred(false);
                  window.focus();
                }}
                className="w-full py-2 bg-gradient-to-r from-gold-600 to-gold-700 hover:from-gold-500 hover:to-gold-600 text-white rounded-lg font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Lock size={12} />
                <span>Resume Learning</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
