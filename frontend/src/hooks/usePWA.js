import { useState, useEffect } from "react";

export default function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", () => {
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) {
      alert(
        "Auto-Install is currently disabled by your browser (or you're using an iPhone).\n\n" +
        "To easily install Societal right now:\n" +
        "1. Tap the browser Menu button (⋮ or Share icon).\n" +
        "2. Select 'Install App' or 'Add to Home Screen'!"
      );
      return;
    }
    
    // Show the native installation prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  // Always render the button on mobile (iOS/Android) because iOS completely blocks the automated
  // 'beforeinstallprompt' event, and Android Chrome heavily throttles it. 
  // By always showing it, we can reliably provide manual fallback instructions!
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const canInstall = !!isMobile;

  return { canInstall, installPWA };
}
