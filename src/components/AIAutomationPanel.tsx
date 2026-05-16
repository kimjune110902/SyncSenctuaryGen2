import React, { useState, useEffect } from 'react';
import * as Switch from '@radix-ui/react-switch';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

interface AdvancePreviewPayload {
  slide: string;
  matchedText: string;
  similarityScore: number;
}

interface AdvancePreviewState extends AdvancePreviewPayload {
  cancelDeadline: number;
}

export const AIAutomationPanel: React.FC = () => {
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(false);
  const [advancePreview, setAdvancePreview] = useState<AdvancePreviewState | null>(null);

  useEffect(() => {
    const unlistenPreviewPromise = listen<AdvancePreviewPayload>('ai::advance_preview', (e) => {
      setAdvancePreview({
        slide: e.payload.slide,
        matchedText: e.payload.matchedText,
        similarityScore: e.payload.similarityScore,
        cancelDeadline: Date.now() + 2000,
      });

      // Auto-dismiss after 2 seconds
      setTimeout(() => {
          setAdvancePreview(prev => {
              if (prev && Date.now() >= prev.cancelDeadline - 100) return null;
              return prev;
          });
      }, 2000);
    });

    // Explicit Memory Leak Cleanup
    return () => {
      unlistenPreviewPromise.then(unlisten => unlisten());
    };
  }, []);

  const handleAutoAdvanceToggle = (enabled: boolean) => {
    setAutoAdvanceEnabled(enabled);
    invoke('ai::set_auto_advance_enabled', { enabled }).catch(console.error);
  };

  const handleCancelAdvance = () => {
    invoke('ai::cancel_advance').catch(console.error);
    setAdvancePreview(null);
  };

  return (
    <div style={{ padding: '16px', borderTop: '1px solid #333', backgroundColor: '#1A1A1A' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', color: '#EAEAEA' }}>AI Automation</h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#888' }}>{autoAdvanceEnabled ? 'Active' : 'Off'}</span>
            <Switch.Root
            checked={autoAdvanceEnabled}
            onCheckedChange={handleAutoAdvanceToggle}
            aria-label="AI slide auto-advance"
            style={{
                width: '36px', height: '20px', backgroundColor: autoAdvanceEnabled ? '#1A56DB' : '#333',
                borderRadius: '9999px', position: 'relative', border: 'none', cursor: 'pointer', outline: 'none'
            }}
            >
            <Switch.Thumb
                style={{
                display: 'block', width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%',
                transition: 'transform 100ms', transform: `translateX(${autoAdvanceEnabled ? '18px' : '2px'})`,
                willChange: 'transform'
                }}
            />
            </Switch.Root>
        </div>
      </div>

      {advancePreview && (
        <div style={{ backgroundColor: '#2A1A00', border: '1px solid #5C3500', borderRadius: '6px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '12px', color: '#FFB347' }}>
            <strong>AI Auto-Advance Triggered</strong><br/>
            Matched: "{advancePreview.matchedText}"
          </div>
          <button
            onClick={handleCancelAdvance}
            style={{ padding: '6px', backgroundColor: '#5C3500', border: 'none', color: '#FFF', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
          >
            Cancel (2s)
          </button>
        </div>
      )}

      {!advancePreview && autoAdvanceEnabled && (
         <div style={{ fontSize: '11px', color: '#AAA', fontStyle: 'italic' }}>
             Listening for cues...
         </div>
      )}
    </div>
  );
};
