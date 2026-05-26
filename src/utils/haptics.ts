/**
 * Dynamic tactile feedback wrapper utilizing standard navigator haptics.
 * Gracefully silent on unsupported environments (desktop, non-vibrating devices, or server-side).
 */
export const hapticPatterns = {
  light: 10,
  medium: 20,
  heavy: 35,
  success: [15, 40, 25] as number[],
  double: [15, 30, 15] as number[],
  error: [30, 50, 30, 50] as number[]
};

export function triggerHaptic(type: keyof typeof hapticPatterns | number = 'light') {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate === 'undefined') {
    return;
  }
  
  try {
    if (typeof type === 'number') {
      const capped = Math.min(Math.max(1, type), 150); // safety cap
      navigator.vibrate(capped);
    } else {
      const pattern = hapticPatterns[type];
      navigator.vibrate(pattern);
    }
  } catch (error) {
    // Avoid console spam in environments where interaction has not occurred yet
    // or vibration is blocked by user agent restrictions.
  }
}
