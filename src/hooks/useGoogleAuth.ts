import { useEffect, useRef, useCallback } from 'react';

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: any) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface UseGoogleAuthProps {
  apiBase: string;
  clientId?: string;
  sessionToken?: string | null;
  enabled?: boolean;
  onSuccess?: (sessionToken: string, user: any) => void;
  onError?: (error: string) => void;
}

export function useGoogleAuth({
  apiBase,
  clientId = '173985810977-b1g3ggoaj4trki4q94pmcb6qnamfobit.apps.googleusercontent.com', // Replaceable via VITE_GOOGLE_CLIENT_ID
  sessionToken,
  enabled = true,
  onSuccess,
  onError,
}: UseGoogleAuthProps) {
  const isInitialized = useRef(false);

  const handleCredentialResponse = useCallback(
    async (response: any) => {
      if (!response?.credential) {
        onError?.('No credential received from Google');
        return;
      }

      try {
        const cleanBase = apiBase.replace(/\/+$/, '');
        const url = cleanBase.endsWith('/webapp') || cleanBase.endsWith('/api/webapp')
          ? `${cleanBase}/auth/google`
          : `${cleanBase}/api/webapp/auth/google`;

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idToken: response.credential,
            sessionToken: sessionToken || localStorage.getItem('ptin_web_session'),
          }),
        });

        const data = await res.json();
        if (data.success && data.sessionToken) {
          localStorage.setItem('ptin_web_session', data.sessionToken);
          onSuccess?.(data.sessionToken, data.user);
        } else {
          onError?.(data.error || 'Failed to authenticate with Google');
        }
      } catch (err: any) {
        onError?.(err?.message || 'Network error connecting to auth server');
      }
    },
    [apiBase, sessionToken, onSuccess, onError]
  );

  const initGoogle = useCallback(() => {
    if (typeof window === 'undefined' || !window.google?.accounts?.id) return false;
    if (isInitialized.current) return true;

    try {
      window.google.accounts.id.initialize({
        client_id: (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      isInitialized.current = true;
      return true;
    } catch {
      return false;
    }
  }, [clientId, handleCredentialResponse]);

  const renderGoogleButton = useCallback(
    (container: HTMLElement | null, customOpts: any = {}) => {
      if (!container) return;
      const ready = initGoogle();
      if (!ready || !window.google?.accounts?.id) {
        // Retry shortly if script is still loading
        setTimeout(() => {
          if (container && window.google?.accounts?.id) {
            initGoogle();
            window.google.accounts.id.renderButton(container, {
              type: 'standard',
              theme: 'filled_black',
              size: 'large',
              text: 'continue_with',
              shape: 'pill',
              logo_alignment: 'left',
              width: 250,
              ...customOpts,
            });
          }
        }, 500);
        return;
      }

      window.google.accounts.id.renderButton(container, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        logo_alignment: 'left',
        width: 250,
        ...customOpts,
      });
    },
    [initGoogle]
  );

  const promptOneTap = useCallback(() => {
    if (!enabled) return;
    const ready = initGoogle();
    if (!ready || !window.google?.accounts?.id) {
      setTimeout(() => {
        if (window.google?.accounts?.id) {
          initGoogle();
          window.google.accounts.id.prompt();
        }
      }, 1000);
      return;
    }
    window.google.accounts.id.prompt();
  }, [enabled, initGoogle]);

  useEffect(() => {
    if (enabled) {
      promptOneTap();
    }
  }, [enabled, promptOneTap]);

  return {
    renderGoogleButton,
    promptOneTap,
  };
}
