"use client";

import { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    Paddle?: {
      Initialize: (options: { token: string; environment?: string; eventCallback?: (event: PaddleEvent) => void }) => void;
      Checkout: {
        open: (options: { 
          items: { priceId: string; quantity: number }[]; 
          settings?: Record<string, unknown>; 
          customData?: Record<string, unknown>; 
          customer?: Record<string, unknown> 
        }) => void;
      };
    };
  }
}

interface PaddleEvent {
  name: string;
  data?: Record<string, unknown>;
}

const PADDLE_TOKEN = 'live_9568c0cec8d3913de9236963b39';

export function usePaddle(onSuccess?: (data: any) => void) {
  const [ready, setReady] = useState(false);
  const initialized = useRef(false);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (window.Paddle) {
      setReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.onload = () => {
      try {
        window.Paddle?.Initialize({
          token: PADDLE_TOKEN,
          eventCallback: (event) => {
            if (event.name === 'checkout.completed') {
              onSuccessRef.current?.(event.data);
            }
          },
        });
        setReady(true);
      } catch (err) {
        console.error('Paddle initialization error:', err);
      }
    };
    script.onerror = (err) => {
      console.error('Failed to load Paddle script:', err);
    };
    document.head.appendChild(script);
  }, []);

  const openCheckout = useCallback((priceId: string, customData?: Record<string, any>) => {
    if (!window.Paddle) {
      console.error('Paddle not loaded');
      return;
    }
    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customData: customData,
      settings: {
        displayMode: 'overlay',
        theme: 'dark',
        locale: 'ar'
      }
    });
  }, []);

  return { ready, openCheckout };
}
