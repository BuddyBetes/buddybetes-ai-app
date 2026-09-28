import { Capacitor } from '@capacitor/core';
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';
import { toast } from 'sonner';

export type MediaKind = 'camera' | 'microphone';

const COPY: Record<MediaKind, { denied: string; missing: string }> = {
  camera: {
    denied: 'Camera access is off. Turn it on to scan your meter or food.',
    missing: 'No camera found on this device.',
  },
  microphone: {
    denied: 'Mic access is off. Turn it on to talk to your assistant.',
    missing: 'No microphone found on this device.',
  },
};

export const openAppSettings = () =>
  NativeSettings.open({
    optionAndroid: AndroidSettings.ApplicationDetails,
    optionIOS: IOSSettings.App,
  });

export async function getMedia(
  kind: MediaKind,
  constraints?: MediaStreamConstraints,
): Promise<MediaStream | null> {
  const c = constraints ?? (kind === 'camera'
    ? { video: { facingMode: 'environment' } }
    : { audio: true });

  try {
    return await navigator.mediaDevices.getUserMedia(c);
  } catch (err) {
    const name = (err as DOMException).name;
    if (name === 'NotAllowedError' || name === 'SecurityError') {
      toast.error(COPY[kind].denied, Capacitor.isNativePlatform()
        ? { action: { label: 'Open settings', onClick: () => void openAppSettings() } }
        : undefined);
    } else if (name === 'NotFoundError') {
      toast.error(COPY[kind].missing);
    } else {
      console.error(`getMedia(${kind}) error:`, err);
      toast.error('Something went wrong. Please try again.');
    }
    return null;
  }
}