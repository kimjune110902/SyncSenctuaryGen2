import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

const CLEAR_BUTTONS = [
  { color: '#FFFFFF', label: 'Clear All', key: '1', command: 'video::clear_all' },
  { color: '#FF6B00', label: 'Clear Slide', key: '2', command: 'video::clear_slide' },
  { color: '#00B4D8', label: 'Clear Media', key: '3', command: 'video::clear_media' },
  { color: '#2ECC71', label: 'Clear Audio', key: '4', command: 'audio::mute_all' },
  { color: '#F1C40F', label: 'Clear Ann.', key: '5', command: 'video::clear_announcements' },
  { color: '#E74C3C', label: 'Clear Msg', key: '6', command: 'video::clear_messages' },
];

export const Toolbar: React.FC = () => {
  const [flashingCommand, setFlashingCommand] = useState<string | null>(null);

  const handleClear = async (command: string) => {
    // Flash animation (CSS)
    setFlashingCommand(command);
    setTimeout(() => setFlashingCommand(null), 120);

    // Real action
    await invoke(command).catch(console.error);
  };

  return (
    <div style={{ height: '48px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '8px', backgroundColor: '#1A1A1A' }}>
      {CLEAR_BUTTONS.map((btn) => {
        const isFlashing = flashingCommand === btn.command;
        return (
          <button
            key={btn.command}
            onClick={() => handleClear(btn.command)}
            style={{
              backgroundColor: isFlashing ? btn.color : 'transparent',
              color: isFlashing ? '#000' : btn.color,
              border: `1px solid ${btn.color}`,
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.1s ease',
            }}
          >
            {btn.label} <span style={{ opacity: 0.5, marginLeft: '4px' }}>[{btn.key}]</span>
          </button>
        );
      })}
    </div>
  );
};
