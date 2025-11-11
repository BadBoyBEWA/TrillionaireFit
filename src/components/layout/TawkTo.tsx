'use client';

import { useEffect, useState, useCallback } from 'react';

interface TawkToProps {
  propertyId?: string;
  widgetId?: string;
}

export function TawkTo({ propertyId, widgetId }: TawkToProps) {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Get IDs from environment variables or props
  const tawkPropertyId = propertyId || process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
  const tawkWidgetId = widgetId || process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;

  // Function to check widget status
  const checkWidgetStatus = useCallback(() => {
    if (typeof window === 'undefined') return;

    const checks = {
      Tawk_API_exists: !!(window as any).Tawk_API,
      Tawk_API_ready: !!(window as any).Tawk_API?.onLoad,
      widgetIframe: document.querySelector('iframe[title*="chat"], iframe[id*="tawk"], iframe[src*="tawk.to"]'),
      widgetButton: document.querySelector('[id*="tawk"], [class*="tawk"], [data-tawk]'),
      anyTawkElement: document.querySelector('*[id*="tawk"], *[class*="tawk"]'),
    };

    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 Tawk.to Widget Status Check');
      console.log('Widget Detection:', checks);
      
      if (checks.widgetIframe) {
        console.log('✅ Widget iframe found:', checks.widgetIframe);
        const iframe = checks.widgetIframe as HTMLIFrameElement;
        console.log('Iframe src:', iframe.src);
        console.log('Iframe style:', window.getComputedStyle(iframe).display);
        console.log('Iframe visibility:', window.getComputedStyle(iframe).visibility);
        console.log('Iframe z-index:', window.getComputedStyle(iframe).zIndex);
      } else {
        console.warn('⚠️ Widget iframe not found in DOM');
      }

      if (checks.widgetButton) {
        console.log('✅ Widget button found:', checks.widgetButton);
      } else {
        console.warn('⚠️ Widget button not found in DOM');
      }

      if (checks.Tawk_API_exists) {
        console.log('✅ Tawk_API object exists');
        if (checks.Tawk_API_ready) {
          console.log('✅ Tawk_API is ready');
        } else {
          console.warn('⚠️ Tawk_API exists but onLoad is not available yet');
        }
      } else {
        console.error('❌ Tawk_API object not found');
      }

      console.groupEnd();
    }
  }, []);

  useEffect(() => {
    // Comprehensive debugging
    const debug = {
      hasPropertyId: !!tawkPropertyId,
      hasWidgetId: !!tawkWidgetId,
      propertyId: tawkPropertyId ? `${tawkPropertyId.substring(0, 4)}...` : 'missing',
      widgetId: tawkWidgetId ? `${tawkWidgetId.substring(0, 4)}...` : 'missing',
      scriptUrl: tawkPropertyId && tawkWidgetId 
        ? `https://embed.tawk.to/${tawkPropertyId}/${tawkWidgetId}` 
        : 'N/A',
      windowAvailable: typeof window !== 'undefined',
      documentAvailable: typeof document !== 'undefined',
    };

    setDebugInfo(debug);

    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 Tawk.to Debug Information');
      console.log('Configuration:', debug);
      console.log('Full Property ID:', tawkPropertyId);
      console.log('Full Widget ID:', tawkWidgetId);
      console.groupEnd();
    }

    // Don't proceed if IDs are missing
    if (!tawkPropertyId || !tawkWidgetId) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Tawk.to: Property ID or Widget ID not provided.');
        console.warn('Please set NEXT_PUBLIC_TAWK_PROPERTY_ID and NEXT_PUBLIC_TAWK_WIDGET_ID in your .env.local file.');
        console.warn('Make sure to restart your dev server after adding the variables.');
      }
      return;
    }

    // Check if script is already loaded
    const existingScript = document.querySelector(`script[src*="embed.tawk.to/${tawkPropertyId}/${tawkWidgetId}"]`);
    if (existingScript) {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Tawk.to script already exists in DOM');
      }
      setIsLoaded(true);
      return;
    }

    // Initialize Tawk_API if it doesn't exist
    if (typeof window !== 'undefined' && !(window as any).Tawk_API) {
      (window as any).Tawk_API = (window as any).Tawk_API || {};
      (window as any).Tawk_LoadStart = new Date();
    }

    // Create and inject the script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://embed.tawk.to/${tawkPropertyId}/${tawkWidgetId}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    script.id = 'tawk-to-script';

    // Add event listeners for debugging
    script.onload = () => {
      setIsLoaded(true);
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Tawk.to script loaded successfully');
        
        // Check for widget after a delay
        setTimeout(() => {
          checkWidgetStatus();
        }, 3000);
      }
    };

    script.onerror = (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Tawk.to script failed to load:', error);
        console.error('Script URL:', script.src);
        console.error('Possible causes:');
        console.error('1. Network error or CORS issue');
        console.error('2. CSP (Content Security Policy) blocking the script');
        console.error('3. Ad blocker blocking the script');
        console.error('4. Invalid Property ID or Widget ID');
      }
    };

    // Insert the script
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      // Don't remove the script on unmount as Tawk.to needs it to persist
    };
  }, [tawkPropertyId, tawkWidgetId, checkWidgetStatus]);

  // Don't render anything if IDs are missing
  if (!tawkPropertyId || !tawkWidgetId) {
    return null;
  }

  // Render debug info in development
  if (process.env.NODE_ENV === 'development' && debugInfo) {
    return (
      <div style={{ display: 'none' }}>
        {/* Hidden debug info - you can check this in React DevTools */}
        <div data-tawk-debug={JSON.stringify(debugInfo)} />
      </div>
    );
  }

  return null;
}

