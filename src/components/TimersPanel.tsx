import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import * as Switch from '@radix-ui/react-switch';
import { useTimerStore, Timer } from '../store/timerStore';

export const TimersPanel: React.FC = () => {
  const { timers, updateTimer } = useTimerStore();
  const [flashTick, setFlashTick] = useState(false);

  useEffect(() => {
    // Setup listener for timer ticks (1s intervals)
    const unlistenPromise = listen<Timer>('timer::tick', (e) => {
      updateTimer(e.payload);
    });

    // Flashing effect for 0s timer
    const intervalId = setInterval(() => {
      setFlashTick(prev => !prev);
    }, 500);

    return () => {
      clearInterval(intervalId);
      unlistenPromise.then(unlisten => unlisten());
    };
  }, [updateTimer]);

  const handleStart = async (timerId: string) => {
    await invoke('timer::start', { timerId }).catch(console.error);
    // Optimistic UI update
    const timer = timers.find(t => t.id === timerId);
    if (timer) updateTimer({ ...timer, isRunning: true });
  };

  const handlePause = async (timerId: string) => {
    await invoke('timer::pause', { timerId }).catch(console.error);
    const timer = timers.find(t => t.id === timerId);
    if (timer) updateTimer({ ...timer, isRunning: false });
  };

  const handleReset = async (timerId: string) => {
    await invoke('timer::reset', { timerId }).catch(console.error);
    const timer = timers.find(t => t.id === timerId);
    if (timer) updateTimer({ ...timer, elapsedSeconds: 0, isRunning: false });
  };

  const handleStageToggle = async (timerId: string, visible: boolean) => {
    await invoke('stage::set_timer_visible', { timerId, visible }).catch(console.error);
    const timer = timers.find(t => t.id === timerId);
    if (timer) updateTimer({ ...timer, showOnStage: visible });
  };

  const getTimerColor = (remainingSeconds: number) => {
    if (remainingSeconds > 300) return '#22A35B'; // Green
    if (remainingSeconds <= 300 && remainingSeconds > 60) return '#FF9500'; // Amber
    if (remainingSeconds <= 60 && remainingSeconds > 0) return '#E03A2F'; // Red steady

    // Remaining is 0 (or negative depending on logic). Red flashing.
    return flashTick ? '#E03A2F' : 'transparent';
  };

  const formatTime = (totalSeconds: number) => {
    const sign = totalSeconds < 0 ? '-' : '';
    const absSeconds = Math.abs(totalSeconds);
    const hrs = Math.floor(absSeconds / 3600);
    const mins = Math.floor((absSeconds % 3600) / 60);
    const secs = absSeconds % 60;

    if (hrs > 0) return `${sign}${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${sign}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: '16px', borderTop: '1px solid #333', backgroundColor: '#1A1A1A' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', color: '#EAEAEA' }}>Timers</h3>
        <button style={{ background: 'none', border: 'none', color: '#4A90E2', fontSize: '18px', cursor: 'pointer', padding: 0 }}>+</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {timers.map(timer => {
          // Calculate remaining logic
          let remainingSeconds = timer.mode === 'countdown'
            ? timer.targetSeconds - timer.elapsedSeconds
            : timer.elapsedSeconds;

          return (
            <div key={timer.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#222', padding: '12px', borderRadius: '6px', border: '1px solid #333' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#EAEAEA', fontWeight: 600 }}>{timer.name}</span>
                <span style={{
                    fontFamily: 'monospace',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: getTimerColor(remainingSeconds)
                }}>
                  {formatTime(remainingSeconds)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!timer.isRunning ? (
                    <button onClick={() => handleStart(timer.id)} style={{ padding: '4px 12px', backgroundColor: '#22A35B', border: 'none', color: '#FFF', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                      Start
                    </button>
                  ) : (
                    <button onClick={() => handlePause(timer.id)} style={{ padding: '4px 12px', backgroundColor: '#FF9500', border: 'none', color: '#FFF', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                      Pause
                    </button>
                  )}
                  <button onClick={() => handleReset(timer.id)} style={{ padding: '4px 12px', backgroundColor: '#333', border: '1px solid #555', color: '#EAEAEA', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                    Reset
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#888' }}>Stage</span>
                  <Switch.Root
                    checked={timer.showOnStage}
                    onCheckedChange={(c) => handleStageToggle(timer.id, c)}
                    aria-label="Show on Stage Display"
                    style={{
                        width: '28px', height: '16px', backgroundColor: timer.showOnStage ? '#1A56DB' : '#333',
                        borderRadius: '9999px', position: 'relative', border: 'none', cursor: 'pointer', outline: 'none'
                    }}
                  >
                    <Switch.Thumb
                        style={{
                        display: 'block', width: '12px', height: '12px', backgroundColor: 'white', borderRadius: '50%',
                        transition: 'transform 100ms', transform: `translateX(${timer.showOnStage ? '14px' : '2px'})`,
                        willChange: 'transform'
                        }}
                    />
                  </Switch.Root>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
