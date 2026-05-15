import React, { useState, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open as openBrowser } from '@tauri-apps/plugin-shell';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { mapApiErrorToMessage, ApiError } from '../api/invoke';

interface LoginScreenProps {
  message: string | null;
}

const WEB_PLATFORM_BASE_URL = 'https://syncsanctuary.app';
const currentLocale = 'en';

export const LoginScreen: React.FC<LoginScreenProps> = ({ message }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const passwordInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = async () => {
    setIdentifierError(null);
    setPasswordError(null);
    setGlobalError(null);

    const trimmedIdentifier = identifier.trim();
    const trimmedPassword = password.trim();

    if (!trimmedIdentifier) {
      setIdentifierError('Please enter your phone number or email.');
      return;
    }

    if (!trimmedPassword) {
      setPasswordError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      await invoke('login', {
        identifier: trimmedIdentifier,
        password: trimmedPassword,
      });
      // AuthGate will handle the auth::logged-in event.
    } catch (rawError) {
      let apiError: ApiError;
      try {
        apiError = typeof rawError === 'string' ? JSON.parse(rawError) : rawError;
      } catch {
        apiError = { type: 'ServerError', message: 'Unknown error' };
      }
      setGlobalError(mapApiErrorToMessage(apiError));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
        await openBrowser(`${WEB_PLATFORM_BASE_URL}/${currentLocale}/auth/reset-password`);
    } catch(e) {
        console.error(e);
    }
  };

  const handleGoogleOAuth = async () => {
    // Basic mock of the OAuth logic provided in the spec
    const state = 'mock_state_123';
    const codeChallenge = 'mock_challenge';

    const params = new URLSearchParams({
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      client_type: 'desktop',
      platform: 'macos',
    });

    try {
        await openBrowser(`${WEB_PLATFORM_BASE_URL}/api/v1/auth/google/desktop-initiate?${params.toString()}`);
    } catch(e) {
        console.error(e);
    }
  };

  const handleSignUp = async () => {
      try {
          await openBrowser(`${WEB_PLATFORM_BASE_URL}/${currentLocale}/auth/signup`);
      } catch(e) {
          console.error(e);
      }
  };

  return (
    <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '420px', backgroundColor: '#1E1E1E', border: '1px solid #333333', borderRadius: '12px', padding: '40px', boxShadow: '0 24px 64px rgba(0,0,0,0.8)', boxSizing: 'border-box' }}>

        {/* [A] App Logo placeholder */}
        <div style={{ width: '64px', height: '64px', backgroundColor: '#333', borderRadius: '8px', margin: '0 auto 16px' }} />

        {/* [B] App name */}
        <h1 style={{ fontFamily: 'Inter', fontSize: '24px', fontWeight: 700, color: '#EAEAEA', textAlign: 'center', margin: '0 0 8px 0' }}>SyncSanctuary</h1>

        {/* [C] Tagline */}
        <p style={{ fontFamily: 'Inter', fontSize: '13px', color: '#888888', textAlign: 'center', marginBottom: '32px', marginTop: 0 }}>Professional Church Media Production</p>

        {/* [D] Session message banner */}
        {message && (
          <div style={{ backgroundColor: '#1A0D00', border: '1px solid #5C3500', borderRadius: '6px', padding: '8px 12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', color: '#FFB347' }}>{message}</span>
          </div>
        )}

        {/* [E] Phone/Email input field */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '11px', color: '#999999', display: 'block', marginBottom: '4px' }}>Phone number or email</label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') passwordInputRef.current?.focus(); }}
            placeholder="+82 10 1234 5678 or email@example.com"
            autoComplete="username"
            style={{
              height: '40px', backgroundColor: '#161616', border: `1px solid ${identifierError ? '#FF3B30' : '#333333'}`,
              borderRadius: '6px', fontSize: '14px', color: '#EAEAEA', padding: '0 12px', width: '100%', boxSizing: 'border-box', outline: 'none'
            }}
          />
          {identifierError && <div style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px' }}>{identifierError}</div>}
        </div>

        {/* [F] Password input field */}
        <div style={{ marginBottom: '16px', position: 'relative' }}>
          <label style={{ fontSize: '11px', color: '#999999', display: 'block', marginBottom: '4px' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
              autoComplete="current-password"
              ref={passwordInputRef}
              style={{
                height: '40px', backgroundColor: '#161616', border: `1px solid ${passwordError ? '#FF3B30' : '#333333'}`,
                borderRadius: '6px', fontSize: '14px', color: '#EAEAEA', padding: '0 44px 0 12px', width: '100%', boxSizing: 'border-box', outline: 'none'
              }}
            />
            <button
              onClick={() => setShowPassword(prev => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#555555', padding: 0 }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {passwordError && <div style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px' }}>{passwordError}</div>}
        </div>

        {/* [G] Forgot password */}
        <div style={{ textAlign: 'right', marginBottom: '16px' }}>
          <span
            onClick={handleForgotPassword}
            style={{ fontSize: '11px', color: '#4A90E2', cursor: 'pointer', textDecoration: 'none' }}
          >
            Forgot password?
          </span>
        </div>

        {/* [H] Log In button */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            width: '100%', height: '40px', backgroundColor: isLoading ? '#1044AB' : '#1A56DB', color: '#FFFFFF', borderRadius: '6px',
            fontSize: '14px', fontWeight: 600, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          {isLoading ? <><Loader2 size={16} className="animate-spin" /> Logging in...</> : 'Log In'}
        </button>

        {globalError && (
          <div style={{ backgroundColor: '#2A0000', border: '1px solid #5C0000', borderRadius: '6px', padding: '10px 14px', marginTop: '12px' }}>
            <span style={{ fontSize: '12px', color: '#FF6B6B' }}>{globalError}</span>
          </div>
        )}

        {/* [I] Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#2A2A2A' }} />
          <span style={{ fontSize: '11px', color: '#555555', margin: '0 12px' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#2A2A2A' }} />
        </div>

        {/* [J] Continue with Google */}
        <button
          onClick={handleGoogleOAuth}
          style={{
            width: '100%', height: '40px', backgroundColor: '#2A2A2A', border: '1px solid #444444', borderRadius: '6px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#EAEAEA', fontSize: '14px'
          }}
        >
          <span>G</span> Continue with Google
        </button>

        {/* [K] Create account link */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <span style={{ fontSize: '12px', color: '#888888' }}>Don't have an account? </span>
          <span onClick={handleSignUp} style={{ fontSize: '12px', color: '#4A90E2', cursor: 'pointer' }}>Sign up</span>
        </div>

      </div>
    </div>
  );
};
