
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [hasShownInstallPrompt, setHasShownInstallPrompt] = useState(false);
  
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
      
      // Only show the toast once per session
      if (!hasShownInstallPrompt && !isAppInstalled) {
        setHasShownInstallPrompt(true);
        
        console.log("PWA detection: Showing installation toast");
        
        // Show the installation toast with a proper action
        setTimeout(() => {
          toast({
            title: "✨ Install BuddyBetes on your device!",
            description: "Add to homescreen for the best experience",
            action: <ToastAction altText="Install" onClick={() => installPwa(promptEvent)}>Install</ToastAction>,
            duration: 10000, // Show for longer to ensure visibility
          });
        }, 2000); // Small delay to ensure toast appears after page load
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Check for iOS devices which don't support beforeinstallprompt
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    if (isIOS && !isAppInstalled && !hasShownInstallPrompt) {
      setHasShownInstallPrompt(true);
      console.log("PWA detection: iOS device detected, showing safari instructions");
      
      // Show iOS-specific installation instructions
      setTimeout(() => {
        toast({
          title: "📱 Install BuddyBetes on iOS",
          description: "Tap the share button then 'Add to Home Screen'",
          duration: 10000,
        });
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [hasShownInstallPrompt]);

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
