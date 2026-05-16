import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { useStreamingStore, StreamHealth } from '../store/streamingStore';

export const StreamingRecordingPanel: React.FC = () => {
  const {
      isStreaming,
      isRecording,
      streamHealth,
      recordingDurationSeconds,
      setStreamingState,
      setRecordingState,
      updateHealth
  } = useStreamingStore();

  const [selectedFormat, setSelectedFormat] = useState('mp4');
  const [selectedBitrate, setSelectedBitrate] = useState(6000);
  const [selectedDestination, setSelectedDestination] = useState('youtube');
  const [includeIsoRecording, _setIncludeIsoRecording] = useState(false);
  const [isStartingRecording, setIsStartingRecording] = useState(false);
  const [isStartingStream, setIsStartingStream] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // 1. Setup Stream Health and Disconnection listeners safely
    const unlistenHealthPromise = listen<StreamHealth>('streaming::health', (e) => {
      updateHealth(e.payload);
    });

    const unlistenDisconnectedPromise = listen<{ reason: string }>('streaming::disconnected', (e) => {
      alert(`Stream Disconnected: ${e.payload.reason}`);
      setStreamingState(false);
      updateHealth(null);
    });

    // Explicit Memory Leak Cleanup
    return () => {
      unlistenHealthPromise.then(unlisten => unlisten());
      unlistenDisconnectedPromise.then(unlisten => unlisten());
    };
  }, [setStreamingState, updateHealth]);

  const handleStartRecording = async () => {
    setIsStartingRecording(true);
    setErrorMsg(null);
    try {
      await invoke('recording::start', {
        outputPath: '~/Videos/SyncSanctuary', // default path
        format: selectedFormat,
        includeIso: includeIsoRecording,
      });
      setRecordingState(true);
    } catch (e) {
      setErrorMsg(`Failed to start recording: ${e}`);
    } finally {
      setIsStartingRecording(false);
    }
  };

  const handleStopRecording = async () => {
    if (recordingDurationSeconds > 300) {
      const confirmed = await invoke('dialog::confirm', {
        title: 'Stop Recording?',
        message: 'Are you sure you want to stop the recording?'
      }).catch(() => true); // default to true if dialog fails
      if (!confirmed) return;
    }

    try {
        await invoke('recording::stop');
        setRecordingState(false);
    } catch(e) {
        setErrorMsg(`Failed to stop recording: ${e}`);
    }
  };

  const handleStartStreaming = async () => {
    setIsStartingStream(true);
    setErrorMsg(null);
    try {
      await invoke('streaming::start', {
        destinations: [selectedDestination],
        bitrateKbps: selectedBitrate,
      });
      setStreamingState(true);
    } catch (e) {
      setErrorMsg(`Failed to start stream: ${e}`);
    } finally {
      setIsStartingStream(false);
    }
  };

  const handleStopStreaming = async () => {
      try {
          await invoke('streaming::stop');
          setStreamingState(false);
          updateHealth(null);
      } catch(e) {
          setErrorMsg(`Failed to stop streaming: ${e}`);
      }
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: '16px', borderTop: '1px solid #333', backgroundColor: '#161616' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#EAEAEA' }}>Broadcast Controls</h3>

      {errorMsg && (
        <div style={{ backgroundColor: '#2A0000', color: '#FF6B6B', padding: '8px', fontSize: '12px', borderRadius: '4px', marginBottom: '16px' }}>
          {errorMsg}
        </div>
      )}

      {/* Recording Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#AAA' }}>Recording {isRecording && <span style={{color: '#E03A2F'}}>{formatDuration(recordingDurationSeconds)}</span>}</span>
            <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                disabled={isRecording}
                style={{ backgroundColor: '#2A2A2A', color: '#EAEAEA', border: '1px solid #444', borderRadius: '4px', padding: '2px 8px', fontSize: '12px' }}
            >
                <option value="mp4">MP4</option>
                <option value="mkv">MKV</option>
            </select>
        </div>

        {isRecording ? (
          <button onClick={handleStopRecording} style={{ padding: '8px', backgroundColor: '#330000', border: '1px solid #E03A2F', color: '#FFF', borderRadius: '4px', cursor: 'pointer' }}>
            Stop Recording
          </button>
        ) : (
          <button onClick={handleStartRecording} disabled={isStartingRecording} style={{ padding: '8px', backgroundColor: '#2A2A2A', border: '1px solid #444', color: '#EAEAEA', borderRadius: '4px', cursor: isStartingRecording ? 'not-allowed' : 'pointer' }}>
            {isStartingRecording ? 'Starting...' : 'Start Recording'}
          </button>
        )}
      </div>

      {/* Streaming Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#AAA' }}>Platform</span>
            <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                disabled={isStreaming}
                style={{ backgroundColor: '#2A2A2A', color: '#EAEAEA', border: '1px solid #444', borderRadius: '4px', padding: '2px 8px', fontSize: '12px', width: '120px' }}
            >
                <option value="youtube">YouTube</option>
                <option value="twitch">Twitch</option>
                <option value="custom_rtmp">Custom RTMP</option>
            </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#AAA' }}>Bitrate</span>
            <select
                value={selectedBitrate}
                onChange={(e) => setSelectedBitrate(Number(e.target.value))}
                disabled={isStreaming}
                style={{ backgroundColor: '#2A2A2A', color: '#EAEAEA', border: '1px solid #444', borderRadius: '4px', padding: '2px 8px', fontSize: '12px' }}
            >
                <option value={4000}>4000 kbps</option>
                <option value={6000}>6000 kbps</option>
                <option value={8000}>8000 kbps</option>
            </select>
        </div>

        {streamHealth && isStreaming && (
            <div style={{ backgroundColor: '#0D0D0D', padding: '8px', borderRadius: '4px', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: streamHealth.status === 'poor' ? '#FF6B6B' : '#4ADE80' }}>
                    {streamHealth.bitrate} kbps
                </span>
                <span style={{ color: streamHealth.droppedFrames > 0 ? '#FF6B6B' : '#AAA' }}>
                    Drop: {streamHealth.droppedFrames}
                </span>
            </div>
        )}

        {isStreaming ? (
          <button onClick={handleStopStreaming} style={{ padding: '8px', backgroundColor: '#330000', border: '1px solid #E03A2F', color: '#FFF', borderRadius: '4px', cursor: 'pointer' }}>
            Stop Streaming
          </button>
        ) : (
          <button onClick={handleStartStreaming} disabled={isStartingStream} style={{ padding: '8px', backgroundColor: '#1A56DB', border: 'none', color: '#FFF', borderRadius: '4px', cursor: isStartingStream ? 'not-allowed' : 'pointer' }}>
            {isStartingStream ? 'Starting...' : 'Start Streaming'}
          </button>
        )}
      </div>

    </div>
  );
};
