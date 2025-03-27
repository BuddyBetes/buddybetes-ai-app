import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [hasShownInstallPrompt, setHasShownInstallPrompt] = useState(true);

  useEffect(() => {
    // Check if the app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    
    console.log("PWA detection: App installed status:", isAppInstalled);
    
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      
      console.log("PWA detection: Install prompt detected");
      
      // Store the event for later use
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      // Toast disabled - set to true above to prevent showing
      if (!hasShownInstallPrompt && !isAppInstalled) {
        setHasShownInstallPrompt(true);
        
        console.log("PWA detection: Toast notification disabled");
        
        // Toast is now disabled by default
        // Uncomment below to re-enable
        /*
        setTimeout(() => {
          toast({
            title: "✨ Install BuddyBetes on your device!",
            description: "Add to homescreen for the best experience",
            action: <ToastAction altText="Install" onClick={() => installPwa(promptEvent)}>Install</ToastAction>,
            duration: 10000,
          });
        }, 2000);
        */
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Check for iOS devices which don't support beforeinstallprompt
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    if (isIOS && !isAppInstalled && !hasShownInstallPrompt) {
      setHasShownInstallPrompt(true);
      console.log("PWA detection: iOS device detected, toast disabled");
      
      // iOS-specific installation toast also disabled
      // Uncomment below to re-enable
      /*
      setTimeout(() => {
        toast({
          title: "📱 Install BuddyBetes on iOS",
          description: "Tap the share button then 'Add to Home Screen'",
          duration: 10000,
        });
      }, 3000);
      */
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [hasShownInstallPrompt]);

  // Keep the installation function available for potential manual triggering
  const installPwa = async (promptEvent: BeforeInstallPromptEvent) => {
    if (!promptEvent) return;
    
    console.log("PWA detection: Triggering install prompt");
    
    // Show the install prompt
    promptEvent.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await promptEvent.userChoice;
    
    // Reset the deferred prompt variable
    setDeferredPrompt(null);
    
    console.log("PWA detection: User choice was:", choiceResult.outcome);
    
    if (choiceResult.outcome === 'accepted') {
      toast({
        title: "🎉 BuddyBetes installed!",
        description: "Thanks for installing our app",
        duration: 3000,
      });
    }
  };

  return {
    deferredPrompt,
    installPwa: () => deferredPrompt && installPwa(deferredPrompt),
    canInstall: !!deferredPrompt
  };
}
