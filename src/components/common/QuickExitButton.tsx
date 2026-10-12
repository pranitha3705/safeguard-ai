import React, { useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext';

export const QuickExitButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { privacy } = useIncidents();

  const handleQuickExit = () => {
    const exitUrl = privacy.quick_exit_url || 'https://www.google.com/search?q=weather+today';
    // Clear history replacement and immediate redirect
    window.location.replace(exitUrl);
  };

  // Keyboard shortcut listener (default: Escape key)
  useEffect(() => {
    let lastEscTime = 0;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const currentTime = Date.now();
        if (currentTime - lastEscTime < 600) {
          // Double tap Escape triggers instant exit
          handleQuickExit();
        }
        lastEscTime = currentTime;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [privacy.quick_exit_url]);

  return (
    <button
      onClick={handleQuickExit}
      title="Quick Exit: Instantly close this page and redirect to weather search (Shortcut: Double-press ESC)"
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all font-medium text-xs tracking-wide shadow-sm hover:shadow-rose-900/50 ${className}`}
    >
      <LogOut className="w-3.5 h-3.5" />
      <span>Quick Exit (Esc x2)</span>
    </button>
  );
};
