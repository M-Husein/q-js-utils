# copyToClipboard

## Usage
```ts
import { copyToClipboard } from 'q-js-utils/copyToClipboard';


```

## Option 1

```ts
/**
 * Copies text to the clipboard using the modern Clipboard API,
 * with a robust fallback for older browsers/insecure contexts.
 *
 * @param text - The text to copy.
 * @returns `true` if the copy succeeded, `false` otherwise.
 */
const copyToClipboard = async (text: string): Promise<boolean> => {
  // Try the modern Async Clipboard API (only available in secure contexts)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch { // (err)
      // console.warn('Clipboard API failed, falling back to execCommand:', err);
      // Fall through to the fallback
    }
  }

  // Fallback using document.execCommand (deprecated but widely supported)
  try {
    // Use a textarea to handle newlines (\n) correctly
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Make it invisible but keep it in the DOM for selection
    // textArea.style.opacity = '0';
    // textArea.style.position = 'fixed';
    // textArea.style.left = '-9999px';
    // textArea.style.top = '-9999px';
    // textArea.style.pointerEvents = 'none'; // Prevents accidental mouse clicks

    // ;pointer-events:none
    textArea.style.cssText = 'opacity:0;position:fixed;left:-9999px;top:-9999px';
    
    textArea.readOnly = true; // Prevents mobile keyboard
    textArea.tabIndex = -1; // Removes from tab order

    document.body.appendChild(textArea);

    // Select the text (works on both desktop and mobile)
    textArea.select();
    textArea.setSelectionRange(0, text.length);

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (!successful) {
      throw new Error('Copy failed');
    }
    return true;
  } catch { //  (err)
    // console.error('Failed to copy text to clipboard:', err);
    return false;
  }
};
```
