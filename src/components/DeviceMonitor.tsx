import React, { useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { useDeviceStore } from '../store/deviceStore';
import { DeviceInfo } from '../store/deviceStore';

export const DeviceMonitor: React.FC = () => {
  const { warnings, addWarning, removeWarning } = useDeviceStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Listen for device connections
    const unlistenConnectedPromise = listen<{ device: DeviceInfo }>('device::connected', (e) => {
      const device = e.payload.device;

      // Auto-dismissing connection toast (8 seconds per spec)
      setToastMessage(`Device connected: ${device.name}`);
      setTimeout(() => setToastMessage(null), 8000);

      // Clear any warnings for this device since it reconnected
      removeWarning(device.id);
    });

    // Listen for signal lost / disconnections
    const unlistenLostPromise = listen<{ deviceId: string; deviceName: string }>('device::signal_lost', (e) => {
      // Add red warning overlay
      addWarning({
        deviceId: e.payload.deviceId,
        deviceName: e.payload.deviceName,
        message: `Signal lost: ${e.payload.deviceName}`,
      });
    });

    const unlistenDisconnectedPromise = listen<{ deviceId: string; deviceName: string }>('device::disconnected', (e) => {
      addWarning({
        deviceId: e.payload.deviceId,
        deviceName: e.payload.deviceName,
        message: `Device disconnected: ${e.payload.deviceName}`,
      });
    });

    // EXPLICIT MEMORY LEAK CLEANUP
    return () => {
      unlistenConnectedPromise.then(unlisten => unlisten());
      unlistenLostPromise.then(unlisten => unlisten());
      unlistenDisconnectedPromise.then(unlisten => unlisten());
    };
  }, [addWarning, removeWarning]);

  if (warnings.length === 0 && !toastMessage) return null;

  return (
    <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {toastMessage && (
        <div style={{ backgroundColor: '#22A35B', color: '#FFF', padding: '12px 24px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} style={{ background: 'none', border: 'none', color: '#FFF', opacity: 0.8, cursor: 'pointer', padding: 0 }}>✕</button>
        </div>
      )}

      {warnings.map(warning => (
        <div key={warning.deviceId} style={{ backgroundColor: '#E03A2F', color: '#FFF', padding: '12px 24px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(224,58,47,0.4)', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <strong>{warning.message}</strong>
          </div>
          <button onClick={() => removeWarning(warning.deviceId)} style={{ background: 'none', border: 'none', color: '#FFF', opacity: 0.8, cursor: 'pointer', padding: 0 }}>Dismiss</button>
        </div>
      ))}
    </div>
  );
};
