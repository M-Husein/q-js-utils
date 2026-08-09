/**
 * Copies text to the clipboard using the modern Clipboard API,
 * with a robust fallback for older browsers/insecure contexts.
 *
 * @param text - The text to copy.
 * @returns `true` if the copy succeeded, `false` otherwise.
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  // Try the modern Async Clipboard API (only available in secure contexts)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the fallback
    }
  }

  // Fallback using document.execCommand (deprecated but widely supported)
  try {
    // Use a textarea to handle newlines (\n) correctly
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Make it invisible but keep it in the DOM for selection
    textArea.style.cssText = 'opacity:0;position:fixed;left:-9999px;top:-9999px';
    
    // Prevents mobile keyboard
    textArea.readOnly = true;
    
    // Removes from tab order
    textArea.tabIndex = -1;

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
  } catch {
    return false;
  }
};
