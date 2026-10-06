/**
 * Shared audio singleton + iOS unlock.
 *
 * iOS/WKWebView only allows an HTMLAudioElement to play if that *same*
 * element has previously been played during a user gesture. Our TTS arrives
 * after an async round trip to the edge function, so the gesture is long
 * stale by then and play() rejects silently.
 *
 * Fix: keep one long-lived element, "unlock" it by playing a sliver of
 * silence during the first real tap, then reuse it for every response.
 *
 * Creating a new Audio() later does NOT inherit the unlock, so all playback
 * must go through playAudioSrc() below.
 *
 * No-op on Android and desktop, where autoplay of an element is permitted.
 */

let primary: HTMLAudioElement | null = null;
let notification: HTMLAudioElement | null = null;
let silentUrl: string | null = null;
let unlocked = false;
let listenerInstalled = false;

const NOTIFICATION_SRC = '/message-sent.mp3';
const NOTIFICATION_VOLUME = 0.3;

function createElement(): HTMLAudioElement {
  const el = new Audio();
  // Required on iOS or playback can try to take over the screen.
  el.setAttribute('playsinline', 'true');
  (el as HTMLAudioElement & { playsInline?: boolean }).playsInline = true;
  el.preload = 'auto';
  return el;
}

/** 50ms of 8kHz mono silence, built at runtime so there is no base64 blob to trust. */
function getSilentUrl(): string {
  if (silentUrl) return silentUrl;

  const sampleRate = 8000;
  const frames = Math.floor(sampleRate * 0.05);
  const dataBytes = frames * 2;
  const buffer = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(buffer);
  const ascii = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };

  ascii(0, 'RIFF');
  view.setUint32(4, 36 + dataBytes, true);
  ascii(8, 'WAVE');
  ascii(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  ascii(36, 'data');
  view.setUint32(40, dataBytes, true);

  silentUrl = URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
  return silentUrl;
}

function getPrimary(): HTMLAudioElement {
  if (!primary) primary = createElement();
  return primary;
}

function getNotification(): HTMLAudioElement {
  if (!notification) {
    notification = createElement();
    notification.src = NOTIFICATION_SRC;
    notification.volume = NOTIFICATION_VOLUME;
  }
  return notification;
}

export function isAudioUnlocked(): boolean {
  return unlocked;
}

/**
 * Call this synchronously inside a user gesture handler, before any await.
 * Safe to call repeatedly; it short-circuits once unlocked.
 */
export async function unlockAudio(): Promise<boolean> {
  if (unlocked) return true;

  try {
    const el = getPrimary();
    el.src = getSilentUrl();
    await el.play();
    el.pause();
    el.currentTime = 0;

    // The notification chime is a separate element, so it needs its own unlock.
    const chime = getNotification();
    const volume = chime.volume;
    chime.volume = 0;
    try {
      await chime.play();
      chime.pause();
      chime.currentTime = 0;
    } catch {
      // Not fatal, the chime is cosmetic.
    }
    chime.volume = volume;

    unlocked = true;
    return true;
  } catch {
    // Gesture was stale or the tick was missed. Caller can retry on the next tap.
    return false;
  }
}

/**
 * Global safety net: unlock on the first interaction anywhere in the app, so a
 * forgotten unlockAudio() call in some entry point is not a silent assistant.
 * Mount once from App.tsx.
 */
export function installAudioUnlockListener(): () => void {
  if (listenerInstalled) return () => undefined;
  listenerInstalled = true;

  const handler = () => {
    void unlockAudio().then((ok) => {
      if (ok) teardown();
    });
  };

  const events: Array<keyof DocumentEventMap> = ['pointerdown', 'touchend', 'click'];
  const teardown = () => {
    events.forEach((name) => document.removeEventListener(name, handler, true));
  };

  events.forEach((name) => document.addEventListener(name, handler, true));
  return teardown;
}

interface PlayHandlers {
  onEnded?: () => void;
  onError?: (event: unknown) => void;
}

/** Play through the unlocked element. Rejects if the browser refuses playback. */
export async function playAudioSrc(src: string, handlers: PlayHandlers = {}): Promise<void> {
  const el = getPrimary();

  el.onended = () => handlers.onEnded?.();
  el.onerror = (event) => handlers.onError?.(event);

  el.src = src;
  el.currentTime = 0;
  await el.play();
}

export function stopAudio(): void {
  if (!primary) return;
  primary.pause();
  primary.onended = null;
  primary.onerror = null;
}

/** Chime played after a response finishes. Never throws. */
export function playNotificationChime(): void {
  const chime = getNotification();
  chime.currentTime = 0;
  void chime.play().catch(() => undefined);
}