import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import debounce from 'lodash.debounce';

interface ChannelState {
  id: string;
  name: string;
  faderDb: number;
  muted: boolean;
}

interface AudioLevelsPayload {
  channelId: string;
  leftDb: number;
  rightDb: number;
  peakLeftDb: number;
  peakRightDb: number;
}

const VUMeter: React.FC<{ channelId: string }> = ({ channelId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const levelsRef = useRef({ leftDb: -60, rightDb: -60, peakLeftDb: -60, peakRightDb: -60 });

  useEffect(() => {
    // 1. Setup the high-frequency event listener (30fps) by capturing the Promise
    const unlistenPromise = listen<AudioLevelsPayload>('audio::levels', (event) => {
      if (event.payload.channelId === channelId) {
        // Mutate ref directly to avoid React state re-renders
        levelsRef.current = event.payload;
      }
    });

    // 2. Setup the Canvas drawing loop
    let animationFrameId: number;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const { leftDb, rightDb, peakLeftDb, peakRightDb } = levelsRef.current;

      // Clear canvas
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, width, height);

      const drawBar = (x: number, w: number, db: number, peakDb: number) => {
        // Convert dB (-60 to 6) to a percentage (0 to 1)
        const percent = Math.max(0, Math.min(1, (db + 60) / 66));
        const barHeight = percent * height;
        const y = height - barHeight;

        // Draw colored zones (green: 0-60%, yellow: 60-80%, red: 80-100%)
        const greenHeight = height * 0.6;
        const yellowHeight = height * 0.2;

        // Base fill (dark)
        ctx.fillStyle = '#222';
        ctx.fillRect(x, 0, w, height);

        // Clip region to the current level
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, barHeight);
        ctx.clip();

        // Draw gradient/zones
        ctx.fillStyle = '#00C800'; // Green
        ctx.fillRect(x, height - greenHeight, w, greenHeight);

        ctx.fillStyle = '#C8C800'; // Yellow
        ctx.fillRect(x, height - greenHeight - yellowHeight, w, yellowHeight);

        ctx.fillStyle = '#C80000'; // Red
        ctx.fillRect(x, 0, w, height - greenHeight - yellowHeight);

        ctx.restore();

        // Draw peak hold line
        const peakPercent = Math.max(0, Math.min(1, (peakDb + 60) / 66));
        const peakY = height - (peakPercent * height);

        ctx.fillStyle = '#FFF';
        ctx.fillRect(x, peakY, w, 2);
      };

      const barWidth = (width / 2) - 2;
      drawBar(0, barWidth, leftDb, peakLeftDb);
      drawBar(barWidth + 4, barWidth, rightDb, peakRightDb);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    // EXPLICIT MEMORY LEAK CLEANUP (Resolves the Promise race condition)
    return () => {
      cancelAnimationFrame(animationFrameId);
      unlistenPromise.then(unlisten => unlisten());
    };
  }, [channelId]);

  return <canvas ref={canvasRef} width={20} height={150} style={{ display: 'block' }} />;
};


const AudioChannelStrip: React.FC<{ initialChannel: ChannelState }> = ({ initialChannel }) => {
  const [channel, setChannel] = useState<ChannelState>(initialChannel);

  // Debounce the Tauri invoke to max 1 call every 16ms
  const debouncedSetFader = useMemo(
    () => debounce((channelId: string, value: number) => {
      invoke('audio::set_fader', { channelId, db: value }).catch(console.error);
    }, 16),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSetFader.cancel();
    };
  }, [debouncedSetFader]);

  const handleFaderChange = (value: number[]) => {
    const db = value[0];
    // Immediate UI update
    setChannel(prev => ({ ...prev, faderDb: db }));
    // Debounced IPC call
    debouncedSetFader(channel.id, db);
  };

  const handleMuteToggle = () => {
    const newMuted = !channel.muted;
    setChannel(prev => ({ ...prev, muted: newMuted }));
    invoke('audio::set_mute', { channelId: channel.id, muted: newMuted }).catch(console.error);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px', padding: '10px', borderRight: '1px solid #333' }}>
      <div style={{ fontSize: '11px', color: '#AAA', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>
        {channel.name}
      </div>

      <div style={{ display: 'flex', gap: '8px', height: '150px', marginBottom: '16px' }}>
        <VUMeter channelId={channel.id} />

        <Slider.Root
          className="SliderRoot"
          value={[channel.faderDb]}
          onValueChange={handleFaderChange}
          min={-60} // Typically -Infinity, using -60 for slider practicality
          max={6}
          step={0.1}
          orientation="vertical"
          style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '20px', height: '100%' }}
        >
          <Slider.Track style={{ backgroundColor: '#111', position: 'relative', flexGrow: 1, width: '4px', borderRadius: '2px', margin: '0 auto' }}>
            <Slider.Range style={{ position: 'absolute', backgroundColor: '#1A56DB', borderRadius: '2px', width: '100%', bottom: 0 }} />
          </Slider.Track>
          <Slider.Thumb
            style={{ display: 'block', width: '16px', height: '8px', backgroundColor: '#EAEAEA', borderRadius: '2px', cursor: 'grab' }}
            aria-label="Volume"
          />
        </Slider.Root>
      </div>

      <button
        onClick={handleMuteToggle}
        aria-pressed={channel.muted}
        aria-label={`${channel.name} mute`}
        style={{
          width: '32px', height: '32px', borderRadius: '4px', border: 'none',
          backgroundColor: channel.muted ? '#E03A2F' : '#333',
          color: channel.muted ? '#FFF' : '#AAA',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background-color 0.1s ease'
        }}
      >
        {channel.muted ? 'M' : 'U'}
      </button>

      <div style={{ fontSize: '10px', color: '#666', marginTop: '8px' }}>
        {channel.faderDb > -60 ? channel.faderDb.toFixed(1) : '-∞'}
      </div>
    </div>
  );
};

export const AudioMixer: React.FC = () => {
  // Hardcoded for demo layout
  const channels: ChannelState[] = [
    { id: '1', name: 'Master', faderDb: 0, muted: false },
    { id: '2', name: 'Band', faderDb: -6, muted: false },
    { id: '3', name: 'Pastor', faderDb: 2, muted: true },
  ];

  return (
    <div style={{ display: 'flex', flex: 1, backgroundColor: '#161616', borderTop: '1px solid #333' }}>
      {channels.map(ch => (
        <AudioChannelStrip key={ch.id} initialChannel={ch} />
      ))}
    </div>
  );
};
