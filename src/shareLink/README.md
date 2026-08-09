# shareLink

## Usage
```ts
import { shareLink } from 'q-js-utils/shareLink';


```

## Option 1

```ts
import { copyToClipboard } from "../copyToClipboard";

export type shareMethod = 'webShare' | 'copy' | 'window';

/**
 * Options for the shareLink function.
 */
export interface ShareOptions {
  /**
   * Fallback behavior when Web Share API is unsupported or fails.
   * - 'copy': copy the URL to clipboard (default)
   * - 'window': open the URL in a new tab
   */
  fallback?: 'copy' | 'window';
  /**
   * Called on successful sharing via any method.
   * @param method - Which method succeeded ('webShare', 'copy', or 'window')
   */
  onSuccess?: (method: shareMethod) => void;
  /**
   * Called when an error occurs.
   * Note: user cancellation (AbortError) is ignored and does NOT trigger this.
   * @param error - The error object
   * @param method - The method that failed ('webShare' or the fallback method)
   */
  onError?: (error: unknown, method: shareMethod) => void;
}

/**
 * Shares a link using the Web Share API (if supported) with a fallback.
 * Provides callbacks for success and error handling.
 *
 * @param data - The share data (title, text, url).
 * @param options - Configuration and callbacks.
 * @returns A promise that resolves when the operation completes.
 */
export const shareLink = async (
  data: { title?: string; text?: string; url: string },
  { fallback = 'copy', onSuccess, onError }: ShareOptions = {}
): Promise<void> => {
  // Try Web Share API if available
  if (navigator.share) {
    try {
      await navigator.share(data);
      onSuccess?.('webShare');
      return;
    } catch (error) {
      // User cancelled – ignore silently
      if ((error as Error).name !== 'AbortError') {
        onError?.(error, 'webShare');
      }
      // Continue to fallback
    }
  }

  // Fallback
  try {
    if (fallback === 'copy') {
      // Check the return value from copyToClipboard
      const success = await copyToClipboard(data.url);
      // Failed to copy to clipboard
      if (!success) throw new Error('Copy failed');
      onSuccess?.('copy');
    } else {
      // Check if the popup was blocked
      const popup = window.open(data.url, '_blank', 'noopener,noreferrer');
      if (!popup) throw new Error('Popup was blocked');
      onSuccess?.('window');
    }
  } catch (error) {
    onError?.(error, fallback);
  }
}
```
