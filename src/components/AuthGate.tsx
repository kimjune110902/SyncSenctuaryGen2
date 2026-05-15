import React, { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { useAuthStore } from '../store/authStore';
import { LoginScreen } from './LoginScreen';

export const AuthGate: React.FC = () => {
  const { status, sessionExpiryReason, setAuthenticated, setUnauthenticated, setOffline, setUpdateRequired } = useAuthStore();

  useEffect(() => {
    // We listen to backend events for auth state changes per the Spec ZERO.4
    const setupListeners = async () => {
      const unlistenSessionRestored = await listen<any>('auth::session-restored', (event) => {
        setAuthenticated(event.payload);
      });

      const unlistenSessionExpired = await listen<any>('auth::session-expired', (event) => {
        setUnauthenticated(event.payload?.reason);
      });

      const unlistenOfflineMode = await listen<any>('auth::offline-mode', (event) => {
        setOffline(event.payload);
      });

      const unlistenUpdateRequired = await listen<any>('auth::update-required', () => {
        setUpdateRequired();
      });

      const unlistenLoggedIn = await listen<any>('auth::logged-in', (event) => {
        setAuthenticated(event.payload);
      });

      const unlistenLogout = await listen<any>('auth::unauthenticated', () => {
        setUnauthenticated();
      });

      // Simulation of startup checking (since we don't have the full rust boot sequence yet)
      // In a real app this is triggered by Rust immediately.
      setTimeout(() => {
         if (useAuthStore.getState().status === 'loading') {
            setUnauthenticated();
         }
      }, 500);

      return () => {
        unlistenSessionRestored();
        unlistenSessionExpired();
        unlistenOfflineMode();
        unlistenUpdateRequired();
        unlistenLoggedIn();
        unlistenLogout();
      };
    };

    const cleanupPromise = setupListeners();

    return () => {
      cleanupPromise.then(cleanup => cleanup());
    };
  }, [setAuthenticated, setUnauthenticated, setOffline, setUpdateRequired]);

  if (status === 'loading') {
    return (
      <div style={{ backgroundColor: '#0D0D0D', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ color: '#EAEAEA' }}>SyncSanctuary Loading...</h1>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <LoginScreen message={sessionExpiryReason} />;
  }

  if (status === 'offline') {
    return (
      <div style={{ backgroundColor: '#1E1E1E', height: '100vh', color: 'white' }}>
        <div style={{ backgroundColor: '#FF9500', color: 'black', padding: '10px', textAlign: 'center' }}>
          Offline Mode
        </div>
        <div style={{ padding: '20px' }}>Main Application Shell (Offline)</div>
      </div>
    );
  }

  if (status === 'update-required') {
    return (
      <div style={{ backgroundColor: '#1E1E1E', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ color: '#FF3B30' }}>Mandatory Update Required</h1>
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <div style={{ backgroundColor: '#1E1E1E', height: '100vh', color: 'white', padding: '20px' }}>
        Main Application Shell (Authenticated)
      </div>
    );
  }

  return null;
};
