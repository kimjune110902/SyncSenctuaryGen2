import React, { useState, useEffect } from 'react';
import { OutputPreviewMonitors } from "./OutputPreviewMonitors";
import { AudioMixer } from "./AudioMixer";
import { SlideGrid } from './SlideGrid';
import { SettingsModal } from './SettingsModal';
import { Toolbar } from './Toolbar';
import { invoke } from '@tauri-apps/api/core';
import { usePresentationStore } from '../store/presentationStore';

export const MainApplicationShell: React.FC = () => {
  const [leftPanelWidth, setLeftPanelWidth] = useState(220);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(280);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      if (e.key === 'Enter' && !ctrl && !shift && !alt) {
        e.preventDefault();
        const slideId = usePresentationStore.getState().lastSelectedSlideId;
        if (slideId) {
            usePresentationStore.getState().setLiveSlideId(slideId);
            invoke('video::set_live_slide', { slideId }).catch(console.error);
        }
      }
      if (e.key === ' ' && !ctrl && !shift && !alt) {
        e.preventDefault();
        const slideId = usePresentationStore.getState().lastSelectedSlideId;
        if (slideId) {
            usePresentationStore.getState().setCuedSlideId(slideId);
            invoke('video::set_cued_slide', { slideId }).catch(console.error);
        }
      }
      if (e.key === 'Escape' && !ctrl && !shift && !alt) {
        e.preventDefault();
        invoke('video::clear_all').catch(console.error); // Note: original spec says clear_all, not clear_all_output
      }
      if (ctrl && e.key === '1') { e.preventDefault(); invoke('video::clear_all').catch(console.error); }
      if (ctrl && e.key === '2') { e.preventDefault(); invoke('video::clear_slide').catch(console.error); }
      if (ctrl && e.key === '3') { e.preventDefault(); invoke('video::clear_media').catch(console.error); }
      if (ctrl && e.key === '4') { e.preventDefault(); invoke('audio::mute_all').catch(console.error); }
      if (ctrl && e.key === '5') { e.preventDefault(); invoke('video::clear_announcements').catch(console.error); }
      if (ctrl && e.key === '6') { e.preventDefault(); invoke('video::clear_messages').catch(console.error); }
      if ((ctrl && e.key === ',') || (e.metaKey && e.key === ',')) { e.preventDefault(); setSettingsOpen(true); }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const ResizeHandle: React.FC<{ direction: 'left' | 'right', onResize: (width: number) => void }> = ({ direction, onResize }) => {
    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();

      const handleMouseMove = (mouseEvent: MouseEvent) => {
        requestAnimationFrame(() => {
          if (direction === 'left') {
            // Mouse X dictates the width of the left panel
            const newWidth = Math.max(160, Math.min(400, mouseEvent.clientX));
            onResize(newWidth);
          } else {
            // Mouse X dictates the width of the right panel from the right edge
            const newWidth = Math.max(220, Math.min(500, window.innerWidth - mouseEvent.clientX));
            onResize(newWidth);
          }
        });
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    return (
      <div
        style={{
          width: '8px', cursor: 'col-resize', backgroundColor: '#333333', flexShrink: 0
        }}
        onMouseDown={handleMouseDown}
        role="separator"
        aria-orientation="vertical"
      />
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', backgroundColor: '#1E1E1E', color: 'white', overflow: 'hidden' }}>
      <Toolbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: `${leftPanelWidth}px`, flexShrink: 0, borderRight: '1px solid #333' }}>
          <h2 style={{ padding: '20px' }}>Library</h2>
        </div>

        <ResizeHandle direction="left" onResize={setLeftPanelWidth} />

        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ padding: '20px' }}>Presentation View</h2>
          <SlideGrid />
          <AudioMixer />
        </div>

        <ResizeHandle direction="right" onResize={setRightPanelWidth} />

        <div style={{ width: `${rightPanelWidth}px`, flexShrink: 0, borderLeft: '1px solid #333' }}>
          <h2 style={{ padding: '20px' }}>Output Monitors</h2>
          <OutputPreviewMonitors />
        </div>
      </div>
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};
