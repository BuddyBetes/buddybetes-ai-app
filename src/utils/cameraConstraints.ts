
/**
 * Camera constraints utilities for different devices and scenarios
 */

import { useIsMobile } from "@/hooks/use-mobile";

export interface CameraConstraints {
  audio: boolean;
  video: {
    facingMode: string | { exact: string };
    width: { ideal: number; max?: number };
    height: { ideal: number; max?: number };
  };
}

/**
 * Get optimal camera constraints based on device type
 * @param isMobile Whether the device is mobile
 * @returns Camera constraints object
 */
export function getOptimalConstraints(isMobile: boolean): CameraConstraints {
  // For mobile devices, use rear camera with moderate resolution
  if (isMobile) {
    return {
      audio: false,
      video: { 
        facingMode: { exact: 'environment' },
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 }
      }
    };
  }
  
  // For desktop devices, use front camera with higher resolution
  return {
    audio: false,
    video: { 
      facingMode: 'user',
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    }
  };
}

/**
 * Get fallback constraints when the optimal constraints fail
 * @param isMobile Whether the device is mobile
 * @returns Fallback camera constraints
 */
export function getFallbackConstraints(isMobile: boolean): CameraConstraints {
  // For mobile devices, try without 'exact' constraint
  if (isMobile) {
    return {
      audio: false,
      video: { 
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };
  }
  
  // For desktop devices, try lower resolution
  return {
    audio: false,
    video: { 
      facingMode: 'user',
      width: { ideal: 1280 },
      height: { ideal: 720 }
    }
  };
}

/**
 * Get minimal constraints for compatibility with older devices
 * @returns Minimal camera constraints
 */
export function getMinimalConstraints(): CameraConstraints {
  return {
    audio: false,
    video: { 
      facingMode: 'environment',
      width: { ideal: 640 },
      height: { ideal: 480 }
    }
  };
}

/**
 * Hook that returns the appropriate camera constraints
 * @returns Object with optimal, fallback, and minimal constraints
 */
export function useCameraConstraints() {
  const isMobile = useIsMobile();
  
  return {
    optimal: getOptimalConstraints(isMobile),
    fallback: getFallbackConstraints(isMobile),
    minimal: getMinimalConstraints()
  };
}
