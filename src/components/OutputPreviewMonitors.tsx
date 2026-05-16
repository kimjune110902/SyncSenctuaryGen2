import React, { useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';

interface FramePayload {
  imageBase64: string;
}

interface OutputStatePayload {
  audienceActive: boolean;
}

export const OutputPreviewMonitors: React.FC = () => {
  const [audiencePreviewSrc, setAudiencePreviewSrc] = useState<string | null>(null);
  const [stagePreviewSrc, setStagePreviewSrc] = useState<string | null>(null);
  const [isOutputActive, setIsOutputActive] = useState(false);

  useEffect(() => {
    // 1. Setup listeners capturing their Promise to safely unlisten on unmount
    const unlistenAudiencePromise = listen<FramePayload>('output::audience_frame', (e) => {
      setAudiencePreviewSrc(`data:image/jpeg;base64,${e.payload.imageBase64}`);
    });

    const unlistenStagePromise = listen<FramePayload>('output::stage_frame', (e) => {
      setStagePreviewSrc(`data:image/jpeg;base64,${e.payload.imageBase64}`);
    });

    const unlistenStatePromise = listen<OutputStatePayload>('output::state_changed', (e) => {
      setIsOutputActive(e.payload.audienceActive);
    });

    // EXPLICIT MEMORY LEAK CLEANUP (Resolves the race condition)
    return () => {
      unlistenAudiencePromise.then(unlisten => unlisten());
      unlistenStagePromise.then(unlisten => unlisten());
      unlistenStatePromise.then(unlisten => unlisten());
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', width: '100%', boxSizing: 'border-box' }}>

      {/* Audience Monitor */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '13px', color: '#EAEAEA' }}>Audience Output</h3>
          {isOutputActive && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#E03A2F', boxShadow: '0 0 8px #E03A2F' }} />
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#E03A2F', letterSpacing: '1px' }}>LIVE</span>
            </div>
          )}
        </div>

        <div style={{
            width: '100%', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: '6px',
            overflow: 'hidden', border: isOutputActive ? '2px solid #E03A2F' : '1px solid #333',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {audiencePreviewSrc ? (
            <img src={audiencePreviewSrc} alt="Audience Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <span style={{ color: '#555', fontSize: '12px' }}>No Output</span>
          )}
        </div>
      </div>

      {/* Stage Display Monitor */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '13px', color: '#EAEAEA' }}>Stage Display</h3>

        <div style={{
            width: '100%', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: '6px',
            overflow: 'hidden', border: '1px solid #333',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {stagePreviewSrc ? (
            <img src={stagePreviewSrc} alt="Stage Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <span style={{ color: '#555', fontSize: '12px' }}>No Output</span>
          )}
        </div>
      </div>

    </div>
  );
};
