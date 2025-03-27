
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
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      
      // Store the event for later use
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      // Only show the toast once per session
      if (!hasShownInstallPrompt) {
        setHasShownInstallPrompt(true);
        
        // Show the installation toast with a proper action
        toast({
          title: "✨ You can now install BuddyBetes!",
          description: "Keep BuddyBetes on your device for quick access",
          action: <ToastAction altText="Install" onClick={() => installPwa(promptEvent)}>Install</ToastAction>,
          duration: 8000,
        });
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [hasShownInstallPrompt]);

  const installPwa = async (promptEvent: BeforeInstallPromptEvent) => {
    if (!promptEvent) return;
    
    // Show the install prompt
    promptEvent.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await promptEvent.userChoice;
    
    // Reset the deferred prompt variable
    setDeferredPrompt(null);
    
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
