import React, { useState, useEffect } from 'react';
import * as Select from '@radix-ui/react-select';
import { invoke } from '@tauri-apps/api/core';

interface AudioSettings {
  sampleRate: string;
}

interface Settings {
  audio: AudioSettings;
}

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [_settings, setSettings] = useState<Settings>({
    audio: { sampleRate: '48000' }
  });

  // Pending settings store the un-applied state
  const [pendingSettings, setPendingSettings] = useState<Settings>({
    audio: { sampleRate: '48000' }
  });

  useEffect(() => {
    if (isOpen) {
        // Load on open
        invoke<Settings>('settings::load_all')
            .then(data => {
                if(data) {
                    setSettings(data);
                    setPendingSettings(data);
                }
            })
            .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const setPendingSetting = (category: keyof Settings, key: string, value: string) => {
    setPendingSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleApply = async () => {
    await invoke('settings::save_all', { settings: pendingSettings }).catch(console.error);
    setSettings(pendingSettings);
  };

  const handleOK = async () => {
    await handleApply();
    onClose();
  };

  const categories = [
    { id: 'general', label: 'General' },
    { id: 'audio', label: 'Audio' },
    { id: 'video', label: 'Video' },
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        width: '800px', height: '600px', backgroundColor: '#1E1E1E',
        borderRadius: '12px', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)', overflow: 'hidden'
      }}>

        <div style={{ padding: '16px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '16px', color: '#EAEAEA' }}>Settings</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar */}
          <div style={{ width: '200px', borderRight: '1px solid #333', backgroundColor: '#161616', padding: '12px 0' }}>
            {categories.map(cat => (
              <div
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  backgroundColor: activeCategory === cat.id ? '#1F2D45' : 'transparent',
                  borderLeft: activeCategory === cat.id ? '3px solid #1A56DB' : '3px solid transparent',
                  color: activeCategory === cat.id ? '#EAEAEA' : '#888'
                }}
              >
                {cat.label}
              </div>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            {activeCategory === 'audio' && (
              <div>
                <h3 style={{ marginTop: 0, marginBottom: '24px', color: '#EAEAEA', fontSize: '18px' }}>Audio Settings</h3>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#AAA' }}>Sample Rate</label>

                  <Select.Root
                    value={pendingSettings.audio.sampleRate}
                    onValueChange={(v) => setPendingSetting('audio', 'sampleRate', v)}
                  >
                    <Select.Trigger style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between',
                      borderRadius: '4px', padding: '0 12px', fontSize: '13px', height: '32px',
                      backgroundColor: '#2A2A2A', color: '#EAEAEA', border: '1px solid #444', width: '200px', cursor: 'pointer'
                    }}>
                      <Select.Value />
                      <Select.Icon>▾</Select.Icon>
                    </Select.Trigger>

                    <Select.Portal>
                      <Select.Content style={{
                        overflow: 'hidden', backgroundColor: '#2A2A2A', borderRadius: '6px',
                        boxShadow: '0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)', border: '1px solid #444', zIndex: 101
                      }}>
                        <Select.Viewport style={{ padding: '5px' }}>
                          <Select.Item value="44100" style={{ padding: '8px 12px', fontSize: '13px', color: '#EAEAEA', cursor: 'pointer', outline: 'none' }}>
                            <Select.ItemText>44.1 kHz</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="48000" style={{ padding: '8px 12px', fontSize: '13px', color: '#EAEAEA', cursor: 'pointer', outline: 'none' }}>
                            <Select.ItemText>48 kHz</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="96000" style={{ padding: '8px 12px', fontSize: '13px', color: '#EAEAEA', cursor: 'pointer', outline: 'none' }}>
                            <Select.ItemText>96 kHz</Select.ItemText>
                          </Select.Item>
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>

                </div>
              </div>
            )}

            {activeCategory === 'general' && <p style={{color: '#888'}}>General settings placeholder.</p>}
            {activeCategory === 'video' && <p style={{color: '#888'}}>Video settings placeholder.</p>}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid #333', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid #555', color: '#EAEAEA', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleApply} style={{ padding: '8px 16px', backgroundColor: '#2A2A2A', border: '1px solid #444', color: '#EAEAEA', borderRadius: '4px', cursor: 'pointer' }}>Apply</button>
          <button onClick={handleOK} style={{ padding: '8px 16px', backgroundColor: '#1A56DB', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>OK</button>
        </div>

      </div>
    </div>
  );
};
