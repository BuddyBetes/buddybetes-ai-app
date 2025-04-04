
import * as React from "react";

export function useIsPwa() {
  const [isPwa, setIsPwa] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Check if the app is running in standalone mode (PWA)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                             (window.navigator as any).standalone === true;
    
    setIsPwa(isInStandaloneMode);
    
    // Also listen for changes in display mode
    const mql = window.matchMedia('(display-mode: standalone)');
    const onChange = (e: MediaQueryListEvent) => {
      setIsPwa(e.matches);
    };
    
    try {
      // Modern browsers
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    } catch (e) {
      // Fallback for older browsers
      console.log("Using legacy media query API");
      mql.addListener(onChange);
      return () => mql.removeListener(onChange);
    }
  }, []);

  return isPwa;
}
