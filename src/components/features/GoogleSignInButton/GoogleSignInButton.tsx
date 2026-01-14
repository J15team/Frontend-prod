/**
 * Google Sign-In Button Component
 * Google Identity Services SDKを使用したログインボタン
 */
import React, { useEffect, useRef } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  onError?: (error: string) => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn('Google Client ID is not configured');
      return;
    }

    const loadGoogleScript = () => {
      if (document.getElementById('google-signin-script')) {
        initializeGoogle();
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-signin-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      script.onerror = () => {
        onError?.('Google Sign-In SDKの読み込みに失敗しました');
      };
      document.head.appendChild(script);
    };

    const initializeGoogle = () => {
      if (!window.google || initialized.current) return;

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 300,
          });
        }

        initialized.current = true;
      } catch (err) {
        console.error('Google Sign-In initialization error:', err);
        onError?.('Google Sign-Inの初期化に失敗しました');
      }
    };

    const handleCredentialResponse = (response: google.accounts.id.CredentialResponse) => {
      if (response.credential) {
        onSuccess(response.credential);
      } else {
        onError?.('認証情報の取得に失敗しました');
      }
    };

    loadGoogleScript();

    return () => {
      if (window.google) {
        window.google.accounts.id.cancel();
      }
    };
  }, [onSuccess, onError]);

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <div className="google-signin-container">
      <div ref={buttonRef} className="google-signin-button" />
    </div>
  );
};
